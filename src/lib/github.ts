/**
 * Build-time GitHub activity loader.
 *
 * This site ships as **static assets only** (see `wrangler.jsonc` — there is no
 * server script and there must not be one). Everything here runs once, in Astro
 * frontmatter, at build time, and is baked into the HTML. Nothing in this file
 * may ever run in the browser.
 *
 * Source (unauthenticated — no token, no secrets in CI):
 *   1. https://github.com/users/<user>/contributions  — the public HTML fragment
 *      behind the profile contribution graph. Scraped, because the equivalent
 *      GraphQL endpoint requires a PAT.
 *
 * RESILIENCE CONTRACT: a Cloudflare build must never fail because GitHub is
 * slow, rate-limited, or reshuffled its markup. The network call is wrapped in
 * try/catch with an 8s timeout; any failure falls back to the committed snapshot
 * in `src/data/github-fallback.json`, and the fallback path always logs loudly so
 * a stale card is never silent. If even the fallback is unusable we return
 * `null` and the component renders nothing.
 */

import fallbackJson from '../data/github-fallback.json' with { type: 'json' };

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** GitHub's own 0–4 intensity bucket. */
  level: ContributionLevel;
  /** Contribution count for the day. */
  count: number;
}

export interface GitHubActivity {
  username: string;
  profileUrl: string;
  /** Chronological, one entry per day in the window (usually 371). */
  days: ContributionDay[];
  /** Total contributions across the window. */
  total: number;
  /** First / last day in the window, ISO dates. */
  rangeStart: string;
  rangeEnd: string;
  /** ISO timestamp of when this data was fetched. */
  fetchedAt: string;
  /** True when served from the committed fallback rather than a live fetch. */
  stale: boolean;
}

const USERNAME = 'Myownboss95';
const TIMEOUT_MS = 8_000;
const USER_AGENT =
  'daniel-odiachi-portfolio-build (+https://github.com/Myownboss95; static build-time fetch)';

/* -------------------------------------------------------------------------- */
/* fetching                                                                    */
/* -------------------------------------------------------------------------- */

async function fetchText(url: string, accept: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { accept, 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[github] ${url} responded ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.warn(`[github] ${url} failed:`, (error as Error)?.message ?? error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* contribution-calendar parsing                                               */
/* -------------------------------------------------------------------------- */

/**
 * The fragment renders one `<td class="ContributionCalendar-day">` per day with
 * `data-date`, `data-level` and an `id`, plus a sibling `<tool-tip for="<id>">`
 * carrying the human-readable count ("7 contributions on July 27th." / "No
 * contributions on July 20th."). The count lives only in the tooltip, so we
 * join the two on the cell id.
 *
 * Written defensively: if GitHub reshapes any of this we simply parse zero days
 * and the caller falls back.
 */
function parseContributions(html: string): { days: ContributionDay[]; total: number } | null {
  const counts = new Map<string, number>();
  const tooltipRe = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
  for (const match of html.matchAll(tooltipRe)) {
    const [, forId, rawText] = match;
    const text = rawText.replace(/<[^>]*>/g, '').trim();
    const num = /^([\d,]+)\s+contribution/i.exec(text);
    if (num) counts.set(forId, Number(num[1].replace(/,/g, '')));
    else if (/^No contributions/i.test(text)) counts.set(forId, 0);
  }

  const days: ContributionDay[] = [];
  const cellRe = /<td\b([^>]*\bclass="[^"]*ContributionCalendar-day[^"]*"[^>]*)>/g;
  for (const match of html.matchAll(cellRe)) {
    const attrs = match[1];
    const date = /\bdata-date="(\d{4}-\d{2}-\d{2})"/.exec(attrs)?.[1];
    if (!date) continue;
    const levelRaw = Number(/\bdata-level="(\d)"/.exec(attrs)?.[1] ?? 0);
    const level = (Number.isFinite(levelRaw) ? Math.min(4, Math.max(0, levelRaw)) : 0) as ContributionLevel;
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    const count = (id && counts.get(id)) ?? 0;
    days.push({ date, level, count });
  }

  if (days.length < 300) {
    console.warn(`[github] contribution fragment yielded only ${days.length} day cells — treating as a parse failure`);
    return null;
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  // Prefer GitHub's own headline total when it's present; fall back to summing.
  const summed = days.reduce((n, d) => n + d.count, 0);
  const headline = /([\d,]+)\s*\n?\s*contributions?\s*\n?\s*in the last year/i.exec(html);
  const total = headline ? Number(headline[1].replace(/,/g, '')) : summed;

  return { days, total: Number.isFinite(total) && total > 0 ? total : summed };
}

/* -------------------------------------------------------------------------- */
/* fallback                                                                   */
/* -------------------------------------------------------------------------- */

function isUsable(data: unknown): data is GitHubActivity {
  const d = data as GitHubActivity | undefined;
  return Boolean(d && Array.isArray(d.days) && d.days.length > 0 && typeof d.total === 'number');
}

function useFallback(reason: string): GitHubActivity | null {
  if (!isUsable(fallbackJson)) {
    console.warn(`[github] ${reason} — and the committed fallback is unusable. Card will not render.`);
    return null;
  }
  const fb = fallbackJson as GitHubActivity;
  console.warn(
    `[github] ${reason} — rendering the committed snapshot from src/data/github-fallback.json ` +
      `(fetched ${fb.fetchedAt}). The activity card is STALE.`
  );
  return { ...fb, stale: true };
}

/* -------------------------------------------------------------------------- */
/* public API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Load the owner's GitHub activity for the last year. Never throws, never
 * rejects: on any failure it returns the committed snapshot, or `null` if even
 * that is unusable.
 */
export async function getGitHubActivity(username: string = USERNAME): Promise<GitHubActivity | null> {
  try {
    const calendarHtml = await fetchText(
      `https://github.com/users/${username}/contributions`,
      'text/html'
    );

    if (!calendarHtml) return useFallback('could not fetch the contribution calendar');

    const calendar = parseContributions(calendarHtml);
    if (!calendar) return useFallback('could not parse the contribution calendar');

    return {
      username,
      profileUrl: `https://github.com/${username}`,
      days: calendar.days,
      total: calendar.total,
      rangeStart: calendar.days[0].date,
      rangeEnd: calendar.days[calendar.days.length - 1].date,
      fetchedAt: new Date().toISOString(),
      stale: false,
    };
  } catch (error) {
    return useFallback(`unexpected error (${(error as Error)?.message ?? error})`);
  }
}
