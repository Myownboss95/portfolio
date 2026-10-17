// Worker for danielodiachi.work. The site itself is static (dist/ is served by
// Cloudflare's asset layer); this only runs for the paths listed under
// `run_worker_first` in wrangler.jsonc — the "Start a project" brief:
//
//   GET    /api/geo              → visitor's country, for ₦ vs $ pricing
//   GET    /api/domain?name=     → is a website address free? (RDAP lookup)
//   POST   /api/upload           → one photo / logo file into R2
//   DELETE /api/upload?key=      → remove it again (before the brief is sent)
//   POST   /api/brief            → save the brief, email Daniel + the client
//   GET    /files/<id>           → Daniel's page of a client's uploads
//   GET    /files/<id>/<path>    → one uploaded file
//
// Files live under briefs/<id>/ in the private BRIEFS bucket. <id> is a random
// UUID minted in the visitor's browser — unguessable, so it doubles as the
// access key for /files/<id>.
import {
  estimate, cleanDomain, DOMAIN_RE, SITE_TYPES, STAGES, GOALS, EXTRAS, PRODUCT_COUNTS,
  BRANDING, PHOTOS, COPY, HAS_DOMAIN, BUSINESS_EMAIL, RETAINER, BUDGET_FIT, TIMELINES,
  type BriefAnswers, type Option, type SiteType,
} from '../src/data/brief';
import { danielEmail, clientEmail, briefFields, type Brief, type DomainStatus } from './emails';

// Minimal shapes of the bindings we use — enough for type-checking without
// pulling in @cloudflare/workers-types.
interface R2Object {
  key: string;
  size: number;
  uploaded: Date;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}
interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  text(): Promise<string>;
}
interface R2Bucket {
  put(key: string, value: ArrayBuffer | string, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<R2Object>;
  get(key: string): Promise<R2ObjectBody | null>;
  head(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
  list(options: { prefix: string; limit?: number }): Promise<{ objects: R2Object[] }>;
}
interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BRIEFS: R2Bucket;
  LIMITER?: RateLimit;
  RESEND_API_KEY?: string;
  MAIL_FROM: string;
  NOTIFY_EMAIL: string;
  REPLY_TO?: string;
  SITE_URL: string;
  WHATSAPP_URL: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 25; // per brief: 5 brand files + 15 photos, with slack for retries
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
const fail = (error: string, status = 400) => json({ ok: false, error }, status);

async function limited(env: Env, request: Request, bucket: string): Promise<boolean> {
  if (!env.LIMITER) return false;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.LIMITER.limit({ key: `${bucket}:${ip}` });
  return !success;
}

const submitted = (env: Env, id: string) => env.BRIEFS.head(`briefs/${id}/brief.json`);

// ── Domain lookup ────────────────────────────────────────────────────────────
// RDAP is the modern WHOIS: 404 = not registered, 200 = taken. Only registries
// we know answer RDAP are asked — .ng and .com.ng don't, and a generic "not
// found" there would wrongly read as "available", so those come back unknown.
const RDAP: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
};

export async function domainStatus(name: string): Promise<DomainStatus> {
  const labels = name.split('.');
  const base = RDAP[labels[labels.length - 1]];
  if (!base || labels.length !== 2) return 'unknown';
  try {
    const res = await fetch(base + name, {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return 'available';
    if (res.ok) return 'taken';
  } catch {
    /* timeout / registry down */
  }
  return 'unknown';
}

// ── Brief validation ─────────────────────────────────────────────────────────
// Never trust the browser: every answer is re-read against the option lists,
// so the emails and the estimate only ever contain known values.
function clean(raw: unknown): { answers?: BriefAnswers; error?: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Missing answers' };
  const r = raw as Record<string, unknown>;
  const str = (k: string, max = 300) => (typeof r[k] === 'string' ? (r[k] as string).trim().slice(0, max) : '');
  const one = (k: string, opts: Option[]) => (opts.some((o) => o.id === r[k]) ? (r[k] as string) : '');
  const many = (k: string, opts: Option[]) =>
    Array.isArray(r[k]) ? [...new Set((r[k] as unknown[]).filter((v): v is string => opts.some((o) => o.id === v)))] : [];

  const type = one('type', SITE_TYPES) as SiteType;
  const stage = one('stage', STAGES);
  const a: BriefAnswers = {
    name: str('name', 120),
    whatsapp: str('whatsapp', 30),
    email: str('email', 200),
    org: str('org', 160),
    type,
    stage,
    currentUrl: stage === 'redesign' ? str('currentUrl', 200) : '',
    goals: type ? many('goals', GOALS[type]) : [],
    extras: many('extras', EXTRAS),
    products: type === 'ecommerce' ? one('products', PRODUCT_COUNTS) : '',
    branding: one('branding', BRANDING),
    photos: one('photos', PHOTOS),
    photosLater: r.photosLater === true,
    copy: one('copy', COPY),
    inspiration: str('inspiration', 300),
    hasDomain: stage === 'new' ? one('hasDomain', HAS_DOMAIN) : '',
    domain: stage === 'new' ? cleanDomain(str('domain', 253)) : '',
    businessEmail: one('businessEmail', BUSINESS_EMAIL),
    retainer: one('retainer', RETAINER),
    budgetFit: one('budgetFit', BUDGET_FIT),
    budgetNote: str('budgetNote', 120),
    timeline: one('timeline', TIMELINES),
    deadline: str('deadline', 160),
    notes: str('notes', 4000),
    currency: r.currency === 'USD' ? 'USD' : 'NGN',
  };

  const missing = (
    [
      ['name', a.name],
      ['WhatsApp number', a.whatsapp.replace(/\D/g, '').length >= 7],
      ['organisation', a.org],
      ['type of website', a.type],
      ['new or redesign', a.stage],
      ['current website', a.stage !== 'redesign' || a.currentUrl],
      ['what the website should do', a.goals.length],
      ['number of products', a.type !== 'ecommerce' || a.products],
      ['branding', a.branding],
      ['photos', a.photos],
      ['website text', a.copy],
      ['website address', a.stage !== 'new' || a.hasDomain],
      ['business email', a.businessEmail],
      ['monthly management', a.retainer],
      ['budget', a.budgetFit],
      ['timeline', a.timeline],
    ] as const
  ).filter(([, ok]) => !ok);
  if (missing.length) return { error: `Please fill in: ${missing.map(([k]) => k).join(', ')}.` };
  if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return { error: 'That email address doesn’t look right.' };
  if (a.domain && !DOMAIN_RE.test(a.domain)) a.domain = '';
  return { answers: a };
}

// ── Email (Resend) ───────────────────────────────────────────────────────────
async function sendMail(
  env: Env,
  mail: { to: string; subject: string; html: string; text: string; replyTo?: string },
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('Resend unreachable', err);
    return false;
  }
}

// ── Handlers ─────────────────────────────────────────────────────────────────
async function handleUpload(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method === 'DELETE') {
    const key = url.searchParams.get('key') ?? '';
    const m = key.match(/^briefs\/([0-9a-f-]{36})\/(brand|photos)\/[\w.-]+$/);
    if (!m || !UUID.test(m[1])) return fail('Bad key');
    if (await submitted(env, m[1])) return fail('Brief already sent', 409);
    await env.BRIEFS.delete(key);
    return json({ ok: true });
  }
  if (request.method !== 'POST') return fail('Method not allowed', 405);
  if (await limited(env, request, 'upload')) return fail('Too many uploads — wait a minute and try again.', 429);

  const id = url.searchParams.get('id') ?? '';
  const kind = url.searchParams.get('kind') ?? '';
  const type = (request.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
  if (!UUID.test(id) || (kind !== 'brand' && kind !== 'photos')) return fail('Bad request');
  if (!TYPES[type] || (kind === 'photos' && !type.startsWith('image/'))) return fail('Please upload images or PDFs only.', 415);
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BYTES) return fail('That file is too big (15 MB max).', 413);

  if (await submitted(env, id)) return fail('Brief already sent', 409);
  const existing = await env.BRIEFS.list({ prefix: `briefs/${id}/`, limit: MAX_FILES + 1 });
  if (existing.objects.length >= MAX_FILES) return fail('Upload limit reached', 429);

  const body = await request.arrayBuffer();
  if (!body.byteLength) return fail('Empty file');
  if (body.byteLength > MAX_BYTES) return fail('That file is too big (15 MB max).', 413);

  const original = (url.searchParams.get('name') ?? 'file').slice(0, 120);
  const stem = original.replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file';
  const key = `briefs/${id}/${kind}/${Date.now().toString(36)}-${stem}.${TYPES[type]}`;
  await env.BRIEFS.put(key, body, {
    httpMetadata: { contentType: type },
    customMetadata: { originalName: original },
  });
  return json({ ok: true, key });
}

async function handleBrief(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return fail('Method not allowed', 405);
  if (await limited(env, request, 'brief')) return fail('Too many attempts — please wait a minute.', 429);

  let payload: { id?: string; answers?: unknown; website_url?: string };
  try {
    payload = await request.json();
  } catch {
    return fail('Bad request');
  }
  // Honeypot filled in → a bot. Pretend it worked so it doesn't retry.
  if (payload.website_url) return json({ ok: true, notified: true });

  const id = payload.id ?? '';
  if (!UUID.test(id)) return fail('Bad request');
  if (await submitted(env, id)) return fail('This brief has already been sent.', 409);

  const { answers, error } = clean(payload.answers);
  if (!answers) return fail(error ?? 'Bad request', 422);

  const listed = await env.BRIEFS.list({ prefix: `briefs/${id}/`, limit: MAX_FILES + 1 });
  const country = (request as Request & { cf?: { country?: string } }).cf?.country;
  const brief: Brief = {
    id,
    receivedAt: new Date().toISOString(),
    country,
    answers,
    estimates: { NGN: estimate(answers, 'NGN'), USD: estimate(answers, 'USD') },
    domainStatus:
      answers.domain && answers.hasDomain !== 'yes' ? await domainStatus(answers.domain) : undefined,
    uploads: listed.objects.map((o) => ({ key: o.key, name: o.customMetadata?.originalName ?? o.key, size: o.size })),
  };

  // Saved first, so nothing is lost even if email is down.
  await env.BRIEFS.put(`briefs/${id}/brief.json`, JSON.stringify(brief, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });

  const toDaniel = danielEmail(brief, env.SITE_URL);
  const toClient = answers.email ? clientEmail(brief, env.SITE_URL, env.WHATSAPP_URL) : null;
  const [notified, clientEmailed] = await Promise.all([
    sendMail(env, { to: env.NOTIFY_EMAIL, ...toDaniel, replyTo: answers.email || undefined }),
    toClient ? sendMail(env, { to: answers.email, ...toClient, replyTo: env.REPLY_TO || env.NOTIFY_EMAIL }) : Promise.resolve(false),
  ]);
  if (!notified) console.error('Brief saved but Daniel was not emailed', id);

  // If our own email couldn't go out (e.g. Resend not set up yet), hand the
  // browser a plain-text copy to send through the Web3Forms backup instead.
  return json({
    ok: true,
    notified,
    clientEmailed,
    ...(notified ? {} : { backup: { subject: toDaniel.subject, fields: briefFields(brief, env.SITE_URL) } }),
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function handleFiles(env: Env, url: URL): Promise<Response> {
  const [, , id, ...rest] = url.pathname.split('/');
  if (!UUID.test(id ?? '')) return new Response('Not found', { status: 404 });
  const base = {
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };

  // One file. Uploaded content is served sandboxed so an SVG/PDF can never run
  // script on this origin.
  if (rest.length) {
    const key = `briefs/${id}/${rest.map(decodeURIComponent).join('/')}`;
    if (!/^briefs\/[0-9a-f-]{36}\/(brand|photos)\/[\w.-]+$/.test(key)) return new Response('Not found', { status: 404 });
    const obj = await env.BRIEFS.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    const name = obj.customMetadata?.originalName ?? key.split('/').pop()!;
    const download = url.searchParams.has('download') || obj.httpMetadata?.contentType === 'image/svg+xml';
    return new Response(obj.body, {
      headers: {
        ...base,
        'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        'Cache-Control': 'private, max-age=3600',
        ...(download ? { 'Content-Disposition': `attachment; filename="${name.replace(/["\\\r\n]/g, '')}"` } : {}),
      },
    });
  }

  // The gallery page linked from Daniel's email.
  const [{ objects }, briefObj] = await Promise.all([
    env.BRIEFS.list({ prefix: `briefs/${id}/`, limit: 100 }),
    env.BRIEFS.get(`briefs/${id}/brief.json`),
  ]);
  const files = objects.filter((o) => !o.key.endsWith('/brief.json'));
  const brief = briefObj ? (JSON.parse(await briefObj.text()) as Brief) : null;
  const title = brief ? `${brief.answers.org} — uploads` : 'Uploads';
  const card = (o: R2Object) => {
    const href = `/files/${id}/${o.key.split('/').slice(2).join('/')}`;
    const name = esc(o.customMetadata?.originalName ?? o.key.split('/').pop()!);
    const isImage = /\.(jpg|png|webp|gif)$/.test(o.key);
    return `<li><a href="${href}" target="_blank" rel="noopener">${
      isImage ? `<img src="${href}" alt="${name}" loading="lazy">` : `<span class="file">${o.key.split('.').pop()!.toUpperCase()}</span>`
    }</a><div class="meta"><span title="${name}">${name}</span><a href="${href}?download">Download</a></div></li>`;
  };
  const group = (kind: string, label: string) => {
    const list = files.filter((o) => o.key.includes(`/${kind}/`));
    return list.length ? `<h2>${label} <small>${list.length}</small></h2><ul>${list.map(card).join('')}</ul>` : '';
  };

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
:root{--bg:#0b0f14;--card:#141a22;--line:#1f2937;--text:#e6edf3;--muted:#9aa7b4;--accent:#2dd4bf;color-scheme:dark}
@media (prefers-color-scheme:light){:root{--bg:#f6f8fa;--card:#fff;--line:#e3e8ee;--text:#0b0f14;--muted:#4a5763;--accent:#0d9488;color-scheme:light}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
main{max-width:960px;margin:0 auto;padding:32px 16px}p{color:var(--muted)}h1{margin:.2em 0;font-size:1.6rem}h2{margin:2rem 0 .75rem;font-size:1rem}small{color:var(--muted);font-weight:400}
.brand{font:600 14px ui-monospace,Menlo,monospace}.brand b{color:var(--accent)}
ul{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
li{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
li>a{display:block;aspect-ratio:4/3;background:var(--bg)}img{width:100%;height:100%;object-fit:cover;display:block}
.file{display:grid;place-items:center;height:100%;font:600 14px ui-monospace,Menlo,monospace;color:var(--accent)}
.meta{display:flex;justify-content:space-between;gap:8px;padding:8px 10px;font-size:12px}.meta span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)}.meta a{color:var(--accent);text-decoration:none;flex-shrink:0}
</style></head><body><main>
<div class="brand">daniel<b>.</b>odiachi</div>
<h1>${esc(title)}</h1>
<p>${brief ? `${esc(brief.answers.name)} · received ${esc(new Date(brief.receivedAt).toUTCString())}` : 'Brief not sent yet.'}</p>
${files.length ? group('brand', 'Logo &amp; brand') + group('photos', 'Photos') : '<p>No files uploaded.</p>'}
</main></body></html>`;

  return new Response(html, {
    headers: {
      ...base,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case '/api/geo': {
          const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
          return json({ country, currency: country ? (country === 'NG' ? 'NGN' : 'USD') : null });
        }
        case '/api/domain': {
          const name = cleanDomain(url.searchParams.get('name') ?? '');
          if (!DOMAIN_RE.test(name)) return fail('Bad domain');
          if (await limited(env, request, 'domain')) return json({ status: 'unknown' });
          return json({ status: await domainStatus(name) });
        }
        case '/api/upload':
          return await handleUpload(request, env, url);
        case '/api/brief':
          return await handleBrief(request, env);
      }
      if (url.pathname.startsWith('/files/')) return await handleFiles(env, url);
      if (url.pathname.startsWith('/api/')) return fail('Not found', 404);
    } catch (err) {
      console.error(err);
      return fail('Something went wrong on our side. Please try again.', 500);
    }
    return env.ASSETS.fetch(request);
  },
};
