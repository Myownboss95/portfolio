// The two emails a brief produces: the full brief to Daniel, and a styled copy
// to the client. Email clients ignore <style> blocks and CSS variables, so
// everything is inline and table-based, on a light background.
import {
  SITE_TYPES, STAGES, GOALS, EXTRAS, PRODUCT_COUNTS, BRANDING, PHOTOS, COPY,
  HAS_DOMAIN, BUSINESS_EMAIL, RETAINER, BUDGET_FIT, TIMELINES, INCLUDED,
  labelOf, formatRange, formatMoney, type BriefAnswers, type Estimate,
} from '../src/data/brief';

export type DomainStatus = 'available' | 'taken' | 'unknown';

export interface Brief {
  id: string;
  receivedAt: string;
  country?: string;
  answers: BriefAnswers;
  estimates: { NGN: Estimate; USD: Estimate };
  domainStatus?: DomainStatus;
  uploads: { key: string; name: string; size: number }[];
}

const ACCENT = '#0d9488';
const INK = '#0b0f14';
const MUTED = '#4a5763';
const FAINT = '#7a8693';
const LINE = '#e3e8ee';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** 0803 123 4567 → 2348031234567 (wa.me wants international digits only). */
export function waDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 11) return `234${d.slice(1)}`;
  return d;
}

const DOMAIN_NOTE: Record<'daniel' | 'client', Record<DomainStatus, string>> = {
  daniel: { available: 'looks available', taken: 'taken — suggest alternatives', unknown: 'availability not confirmed' },
  client: { available: 'looks available', taken: 'taken — I’ll suggest alternatives', unknown: 'I’ll confirm availability' },
};

type Row = [label: string, value: string | string[]];
type Section = { title: string; rows: Row[] };

/** The answers as labelled sections — shared by both emails and the WhatsApp text. */
function sections(b: Brief, forClient: boolean): Section[] {
  const a = b.answers;
  const list = (ids: string[], opts: { id: string; label: string }[]) =>
    ids.map((id) => labelOf(opts, id)).filter(Boolean);
  const est = b.estimates[a.currency];

  const address =
    a.stage === 'redesign'
      ? `${a.currentUrl} (current site)`
      : a.domain
        ? `${a.domain}${a.hasDomain === 'yes' ? ' (already theirs)' : b.domainStatus ? ` — ${DOMAIN_NOTE[forClient ? 'client' : 'daniel'][b.domainStatus]}` : ''}`
        : labelOf(HAS_DOMAIN, a.hasDomain);

  const all: Section[] = [
    {
      title: 'Contact',
      rows: [
        ['Name', a.name],
        ['WhatsApp', a.whatsapp],
        ['Email', a.email || '—'],
      ],
    },
    {
      title: 'The project',
      rows: [
        ['Organisation', a.org],
        ['Type of website', labelOf(SITE_TYPES, a.type)],
        ['New or redesign', labelOf(STAGES, a.stage) + (a.stage === 'redesign' && a.currentUrl ? ` — ${a.currentUrl}` : '')],
        ['The website should', list(a.goals, GOALS[a.type])],
        ['Also wanted', list(a.extras, EXTRAS)],
        ['Products', a.type === 'ecommerce' ? labelOf(PRODUCT_COUNTS, a.products) : ''],
      ],
    },
    {
      title: 'Look & content',
      rows: [
        ['Logo & branding', labelOf(BRANDING, a.branding)],
        ['Photos', labelOf(PHOTOS, a.photos) + (a.photosLater ? ' — will send on WhatsApp' : '')],
        ['Website text', labelOf(COPY, a.copy)],
        ['Websites they like', a.inspiration ?? ''],
      ],
    },
    {
      title: 'Address & after launch',
      rows: [
        ['Website address', address],
        ['Business email', labelOf(BUSINESS_EMAIL, a.businessEmail)],
        ['Monthly management', labelOf(RETAINER, a.retainer)],
      ],
    },
    {
      title: 'Cost & timeline',
      rows: [
        ['Estimated cost', forClient ? formatRange(est) : `${formatRange(b.estimates.NGN)}  ·  ${formatRange(b.estimates.USD)}`],
        ['Fits the budget?', labelOf(BUDGET_FIT, a.budgetFit)],
        ['Budget in mind', a.budgetFit === 'high' ? (a.budgetNote ?? '') : ''],
        ['Needed by', labelOf(TIMELINES, a.timeline) + (a.deadline ? ` — ${a.deadline}` : '')],
      ],
    },
    { title: 'Anything else', rows: [['Notes', a.notes ?? '']] },
  ];

  return all
    .map((s) => ({ ...s, rows: s.rows.filter(([, v]) => (Array.isArray(v) ? v.length : v && v.trim())) }))
    .filter((s) => s.rows.length);
}

const SANS = '-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
const asText = (v: string | string[]) => (Array.isArray(v) ? v.join(', ') : v);

/** One card per section; each question sits above its answer, so it reads
    cleanly on a phone. Lists (goals, extras) render as chips. */
function sectionsHtml(list: Section[]): string {
  const answer = (v: string | string[]) =>
    Array.isArray(v)
      ? v
          .map(
            (item) =>
              `<span style="display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border-radius:999px;background:#effcf9;border:1px solid #b7ece2;font:500 13px/1.4 ${SANS};color:${INK}">${esc(item)}</span>`,
          )
          .join('')
      : `<div style="font:600 15px/1.5 ${SANS};color:${INK};white-space:pre-wrap">${esc(v)}</div>`;

  return list
    .map(
      (s) => `
      <tr><td style="padding-top:18px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border:1px solid ${LINE};border-radius:12px">
          <tr><td style="padding:11px 16px;background:#f6f8fa;border-bottom:1px solid ${LINE};border-radius:12px 12px 0 0;font:700 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:${ACCENT}">${esc(s.title)}</td></tr>
          ${s.rows
            .map(
              ([k, v], i) => `
          <tr><td style="padding:12px 16px;${i ? `border-top:1px solid #eef1f4;` : ''}">
            <div style="margin-bottom:4px;font:12px/1.4 ${SANS};color:${FAINT}">${esc(k)}</div>
            ${answer(v)}
          </td></tr>`,
            )
            .join('')}
        </table>
      </td></tr>`,
    )
    .join('');
}

/** The brief as flat label/value pairs — the Web3Forms backup shows each one
    as its own row, so questions and answers stay separated. */
export function briefFields(b: Brief, siteUrl: string): [string, string][] {
  const a = b.answers;
  const rename: Record<string, string> = { Name: 'Client name', WhatsApp: 'Client WhatsApp', Email: 'Client email' };
  const fields: [string, string][] = [['Chat on WhatsApp', `https://wa.me/${waDigits(a.whatsapp)}`]];
  if (!a.email) fields.push(['Send their copy on WhatsApp', `https://wa.me/${waDigits(a.whatsapp)}?text=${encodeURIComponent(whatsappText(b))}`]);
  if (b.uploads.length) fields.push(['Uploaded files', `${siteUrl}/files/${b.id}`]);
  for (const s of sections(b, false)) {
    for (const [k, v] of s.rows) fields.push([rename[k] ?? k, asText(v)]);
  }
  return fields;
}

function button(href: string, label: string, solid = true): string {
  return `<a href="${esc(href)}" style="display:inline-block;margin:4px 6px 4px 0;padding:11px 18px;border-radius:8px;font:600 14px/1 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-decoration:none;${
    solid ? `background:${ACCENT};color:#ffffff` : `border:1px solid ${LINE};color:${INK}`
  }">${esc(label)}</a>`;
}

function shell(preheader: string, body: string, siteUrl: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(preheader)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f8">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
    <tr><td style="padding:0 4px 14px;font:600 15px/1 ui-monospace,Menlo,monospace;color:${INK}">daniel<span style="color:${ACCENT}">.</span>odiachi</td></tr>
    <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:14px;padding:28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table>
    </td></tr>
    <tr><td style="padding:16px 4px;font:12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${FAINT}">
      Daniel Odiachi · Web developer · <a href="${esc(siteUrl)}" style="color:${FAINT}">${esc(siteUrl.replace(/^https?:\/\//, ''))}</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

function estimateBlock(e: Estimate, note: string): string {
  return `
    <tr><td style="padding-top:20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#effcf9;border:1px solid #b7ece2;border-radius:12px">
        <tr><td style="padding:18px 20px">
          <div style="font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT}">Estimated cost</div>
          <div style="margin-top:6px;font:700 26px/1.2 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">${esc(formatRange(e))}</div>
          <div style="margin-top:6px;font:13px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MUTED}">${esc(note)}</div>
        </td></tr>
      </table>
    </td></tr>`;
}

function breakdown(e: Estimate): string {
  return `
    <tr><td style="padding-top:10px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${e.lines
          .map(
            (l) => `<tr>
              <td style="padding:4px 0;font:13px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MUTED}">${esc(l.label)}</td>
              <td align="right" style="padding:4px 0;font:12px/1.5 ui-monospace,Menlo,monospace;color:${INK};white-space:nowrap">${esc(formatMoney(l.min, e.currency))} – ${esc(formatMoney(l.max, e.currency))}</td>
            </tr>`,
          )
          .join('')}
      </table>
    </td></tr>`;
}

/** Plain-text copy of the brief, pre-filled into WhatsApp for clients without email. */
export function whatsappText(b: Brief): string {
  const lines = [`Hi ${b.answers.name.split(' ')[0]}, here's a copy of your website brief for ${b.answers.org}:`, ''];
  for (const s of sections(b, true)) {
    if (s.title === 'Contact') continue;
    lines.push(`*${s.title}*`);
    for (const [k, v] of s.rows) lines.push(`${k}: ${asText(v)}`);
    lines.push('');
  }
  lines.push('The estimate is a guide — we’ll confirm the final quote on a short call.');
  return lines.join('\n');
}

export function danielEmail(b: Brief, siteUrl: string): { subject: string; html: string; text: string } {
  const a = b.answers;
  const typeLabel = labelOf(SITE_TYPES, a.type);
  const wa = `https://wa.me/${waDigits(a.whatsapp)}`;
  const forward = `${wa}?text=${encodeURIComponent(whatsappText(b))}`;
  const files = `${siteUrl}/files/${b.id}`;

  const body = `
    <tr><td style="font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT}">New website brief</td></tr>
    <tr><td style="padding-top:6px;font:700 22px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">${esc(a.org)} <span style="color:${FAINT};font-weight:400">· ${esc(typeLabel)}</span></td></tr>
    <tr><td style="padding-top:6px;font:14px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MUTED}">
      From ${esc(a.name)}${b.country ? ` · visiting from ${esc(b.country)}` : ''} · showed ${a.currency === 'NGN' ? 'naira' : 'dollar'} prices
    </td></tr>
    ${
      a.email
        ? ''
        : `<tr><td style="padding-top:14px"><div style="padding:12px 14px;border-radius:10px;background:#fff7e6;border:1px solid #fde3a7;font:14px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#7a4b00"><strong>No email given.</strong> Tap “Send their copy on WhatsApp” — it opens a chat with the summary already typed.</div></td></tr>`
    }
    <tr><td style="padding-top:16px">
      ${button(wa, `WhatsApp ${a.name.split(' ')[0]}`)}
      ${a.email ? '' : button(forward, 'Send their copy on WhatsApp', false)}
      ${b.uploads.length ? button(files, `View ${b.uploads.length} uploaded file${b.uploads.length > 1 ? 's' : ''}`, false) : ''}
    </td></tr>
    ${estimateBlock(b.estimates[a.currency], `Also ${formatRange(b.estimates[a.currency === 'NGN' ? 'USD' : 'NGN'])}. Their answer: ${labelOf(BUDGET_FIT, a.budgetFit)}${a.budgetNote && a.budgetFit === 'high' ? ` (had in mind: ${a.budgetNote})` : ''}.`)}
    ${breakdown(b.estimates[a.currency])}
    ${sectionsHtml(sections(b, false))}
    <tr><td style="padding-top:22px;font:12px/1.5 ui-monospace,Menlo,monospace;color:${FAINT}">Brief ${esc(b.id)} · ${esc(b.receivedAt)}</td></tr>`;

  const text = [
    `New website brief — ${a.org} (${typeLabel})`,
    `WhatsApp: ${wa}`,
    a.email ? `Email: ${a.email}` : 'No email — send their copy on WhatsApp:',
    a.email ? '' : forward,
    b.uploads.length ? `Files: ${files}` : '',
    '',
    '──────── Copy for the client (ready to forward on WhatsApp) ────────',
    '',
    whatsappText(b),
  ]
    .filter((l, i, all) => l || all[i - 1])
    .join('\n');

  return {
    subject: `New website brief — ${a.org} — ${typeLabel}`,
    html: shell(`${a.name} · ${formatRange(b.estimates[a.currency])}`, body, siteUrl),
    text,
  };
}

export function clientEmail(b: Brief, siteUrl: string, whatsappHref: string): { subject: string; html: string; text: string } {
  const a = b.answers;
  const first = a.name.split(' ')[0];
  const steps = [
    'I read through your brief.',
    'I reach out on WhatsApp within 24 hours to talk it through.',
    'We agree what goes in, and I send your final quote.',
  ];

  const body = `
    <tr><td style="font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT}">Your website brief</td></tr>
    <tr><td style="padding-top:6px;font:700 22px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">Thanks, ${esc(first)} — I’ve got it.</td></tr>
    <tr><td style="padding-top:8px;font:15px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MUTED}">Here’s a copy of what you told me about the website for <strong style="color:${INK}">${esc(a.org)}</strong>. Keep it for reference — just reply to this email if anything changes.</td></tr>
    ${estimateBlock(b.estimates[a.currency], 'Based on what you picked. Your final quote comes after a short call.')}
    <tr><td style="padding-top:12px;font:12px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MUTED}">Always included: ${esc(INCLUDED.join(' · '))}</td></tr>
    <tr><td style="padding:22px 0 6px;font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT}">What happens next</td></tr>
    ${steps
      .map(
        (s, i) => `<tr><td style="padding:5px 0;font:14px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
          <span style="display:inline-block;width:22px;height:22px;margin-right:8px;border-radius:11px;background:#effcf9;color:${ACCENT};font:700 12px/22px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:center">${i + 1}</span>${esc(s)}
        </td></tr>`,
      )
      .join('')}
    ${sectionsHtml(sections(b, true))}
    <tr><td style="padding-top:24px">${button(whatsappHref, 'Chat with me on WhatsApp')}</td></tr>`;

  return {
    subject: `Your website brief — ${a.org}`,
    html: shell(`Your estimate: ${formatRange(b.estimates[a.currency])}`, body, siteUrl),
    text: `${whatsappText(b)}\n\nChat with me on WhatsApp: ${whatsappHref}`,
  };
}
