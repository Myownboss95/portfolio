// The "Start a project" brief at /start-a-project — questions, options and prices.
//
// One file drives everything: the form renders its options from here, the page
// computes the live estimate from here, and the Worker (worker/index.ts) re-computes
// the same estimate server-side for the emails. Change a price here and all three
// follow.
//
// Prices are [min, max] per currency. The two lists are deliberately separate (not
// an exchange-rate conversion) so naira pricing can move on its own.

export type Currency = 'NGN' | 'USD';
export type SiteType = 'company' | 'ecommerce' | 'church' | 'ngo' | 'other';
type Range = [number, number];

export interface Option {
  id: string;
  label: string;
  hint?: string;
  /** Add-on from PRICES this answer pulls into the estimate. */
  price?: PriceKey;
}

// ── Prices ───────────────────────────────────────────────────────────────────
export const PRICES = {
  base: { label: 'Website design & build', NGN: [350_000, 450_000], USD: [350, 450] },
  shop: { label: 'Online store build (up to 20 products, payments included)', NGN: [500_000, 650_000], USD: [500, 650] },
  // On every build — deliberately not itemised for the client.
  security: { label: 'Security & SSL setup', NGN: [50_000, 80_000], USD: [50, 80] },
  productsMid: { label: '20–100 products', NGN: [100_000, 150_000], USD: [100, 150] },
  productsLarge: { label: '100+ products', NGN: [200_000, 300_000], USD: [200, 300] },
  payments: { label: 'Online payments / giving / donations', NGN: [100_000, 150_000], USD: [100, 150] },
  booking: { label: 'Bookings & appointments', NGN: [80_000, 120_000], USD: [80, 120] },
  sermons: { label: 'Sermons / livestream page', NGN: [50_000, 80_000], USD: [50, 80] },
  events: { label: 'Events calendar', NGN: [50_000, 80_000], USD: [50, 80] },
  blog: { label: 'Blog / news', NGN: [50_000, 80_000], USD: [50, 80] },
  logo: { label: 'Logo design', NGN: [80_000, 150_000], USD: [80, 150] },
  brand: { label: 'Logo + brand guide design', NGN: [200_000, 350_000], USD: [200, 350] },
  copyFull: { label: 'Writing your website text', NGN: [100_000, 200_000], USD: [100, 200] },
  copyTogether: { label: 'Writing your website text together', NGN: [50_000, 100_000], USD: [50, 100] },
} satisfies Record<string, { label: string; NGN: Range; USD: Range }>;

export type PriceKey = keyof typeof PRICES;

/** Shown next to the estimate — what every build gets at no extra cost. */
export const INCLUDED = [
  'Hosting',
  'Works on phones, tablets & laptops',
  'Basic Google search setup (SEO)',
  'Contact form & WhatsApp button',
  'Photo gallery',
];

// ── Section 2: the project ──────────────────────────────────────────────────
export const SITE_TYPES: Option[] = [
  { id: 'company', label: 'Company / business', hint: 'Show what you do and bring in customers' },
  { id: 'ecommerce', label: 'E-commerce / online store', hint: 'Sell products online' },
  { id: 'church', label: 'Church / ministry', hint: 'Sermons, giving, events' },
  { id: 'ngo', label: 'NGO / foundation', hint: 'Donations, programmes, impact' },
  { id: 'other', label: 'Something else', hint: 'School, event, personal brand…' },
];

export const STAGES: Option[] = [
  { id: 'new', label: 'A new website' },
  { id: 'redesign', label: 'A redesign of my current website' },
];

const UNSURE: Option = { id: 'unsure', label: 'Not sure yet — help me decide' };

/** "What should the website help you do?" — options depend on the site type. */
export const GOALS: Record<SiteType, Option[]> = {
  company: [
    { id: 'leads', label: 'Get more customers or enquiries' },
    { id: 'services', label: 'Show our services' },
    { id: 'trust', label: 'Look professional and build trust' },
    { id: 'booking', label: 'Take bookings or appointments', price: 'booking' },
    UNSURE,
  ],
  ecommerce: [
    { id: 'sell', label: 'Sell products online' },
    { id: 'payments', label: 'Accept card and transfer payments' }, // included in the shop build
    { id: 'reach', label: 'Reach customers outside my area' },
    { id: 'off-social', label: 'Move my sales off Instagram / WhatsApp' },
    UNSURE,
  ],
  church: [
    { id: 'sermons', label: 'Share sermons and service times', price: 'sermons' },
    { id: 'giving', label: 'Receive tithes and offerings online', price: 'payments' },
    { id: 'events', label: 'Promote events and programmes', price: 'events' },
    { id: 'visitors', label: 'Welcome first-time visitors' },
    UNSURE,
  ],
  ngo: [
    { id: 'donations', label: 'Receive donations', price: 'payments' },
    { id: 'impact', label: 'Show our work and impact' },
    { id: 'partners', label: 'Attract partners and sponsors' },
    { id: 'volunteers', label: 'Recruit volunteers' },
    UNSURE,
  ],
  other: [
    { id: 'enquiries', label: 'Get enquiries' },
    { id: 'info', label: 'Share information' },
    { id: 'payments', label: 'Take payments', price: 'payments' },
    UNSURE,
  ],
};

// ── Section 3: what you need ────────────────────────────────────────────────
export const EXTRAS: Option[] = [
  { id: 'whatsapp', label: 'WhatsApp chat button' },
  { id: 'gallery', label: 'Photo gallery' },
  { id: 'blog', label: 'Blog / news', price: 'blog' },
  { id: 'contact', label: 'Contact form' },
];

export const PRODUCT_COUNTS: Option[] = [
  { id: 'small', label: '1 – 20' },
  { id: 'mid', label: '20 – 100', price: 'productsMid' },
  { id: 'large', label: '100+', price: 'productsLarge' },
];

// ── Section 4: look & content ───────────────────────────────────────────────
export const BRANDING: Option[] = [
  { id: 'have-both', label: 'I have a logo and a brand guide' },
  { id: 'have-logo', label: 'I have a logo only' },
  { id: 'need-logo', label: 'I need a logo designed', price: 'logo' },
  { id: 'need-both', label: 'I need a logo and a brand guide designed', price: 'brand' },
  { id: 'unsure', label: 'Not sure' },
];

export const PHOTOS: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'some', label: 'Some' },
  { id: 'no', label: 'No' },
];

export const COPY: Option[] = [
  { id: 'self', label: 'I will' },
  { id: 'full', label: 'You write it for me', price: 'copyFull' },
  { id: 'together', label: "Let's do it together", price: 'copyTogether' },
];

// ── Section 5: address, email & after launch ────────────────────────────────
export const HAS_DOMAIN: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
];

export const BUSINESS_EMAIL: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'have', label: 'I already have one' },
];

export const RETAINER: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'more', label: 'Tell me more' },
];

// ── Section 6: estimate & timeline ──────────────────────────────────────────
export const BUDGET_FIT: Option[] = [
  { id: 'yes', label: 'Yes, that works' },
  { id: 'high', label: "It's a bit high — let's talk" },
  { id: 'unsure', label: 'Not sure yet' },
];

export const TIMELINES: Option[] = [
  { id: 'asap', label: 'As soon as possible' },
  { id: '1m', label: 'Within 1 month' },
  { id: '1-3m', label: '1 – 3 months' },
  { id: 'flexible', label: 'Flexible' },
];

// ── Answers ──────────────────────────────────────────────────────────────────
export interface BriefAnswers {
  name: string;
  whatsapp: string;
  email: string;
  org: string;
  type: SiteType;
  stage: string;
  currentUrl?: string;
  goals: string[];
  extras: string[];
  products?: string;
  branding: string;
  photos: string;
  photosLater?: boolean;
  copy: string;
  inspiration?: string;
  hasDomain?: string;
  domain?: string;
  businessEmail: string;
  retainer: string;
  budgetFit: string;
  budgetNote?: string;
  timeline: string;
  deadline?: string;
  notes?: string;
  currency: Currency;
}

export interface Estimate {
  currency: Currency;
  min: number;
  max: number;
  lines: { label: string; min: number; max: number }[];
}

const find = (list: Option[], id?: string) => list.find((o) => o.id === id);

/** Price keys the answers pull in, deduped (giving + "take payments" count once). */
function priceKeys(a: Partial<BriefAnswers>): PriceKey[] {
  const keys = new Set<PriceKey>([a.type === 'ecommerce' ? 'shop' : 'base', 'security']);
  const picked: (Option | undefined)[] = [
    ...(a.goals ?? []).map((g) => find(GOALS[a.type ?? 'other'] ?? [], g)),
    ...(a.extras ?? []).map((e) => find(EXTRAS, e)),
    a.type === 'ecommerce' ? find(PRODUCT_COUNTS, a.products) : undefined,
    find(BRANDING, a.branding),
    find(COPY, a.copy),
  ];
  for (const o of picked) if (o?.price) keys.add(o.price);
  if (a.type === 'ecommerce') keys.delete('payments'); // already in the shop build
  return [...keys];
}

export function estimate(a: Partial<BriefAnswers>, currency: Currency): Estimate {
  const lines = priceKeys(a).map((k) => {
    const p = PRICES[k];
    return { label: p.label, min: p[currency][0], max: p[currency][1] };
  });
  return {
    currency,
    lines,
    min: lines.reduce((s, l) => s + l.min, 0),
    max: lines.reduce((s, l) => s + l.max, 0),
  };
}

export function formatMoney(n: number, currency: Currency): string {
  return currency === 'NGN' ? `₦${n.toLocaleString('en-NG')}` : `$${n.toLocaleString('en-US')}`;
}

export const formatRange = (e: Estimate) =>
  `${formatMoney(e.min, e.currency)} – ${formatMoney(e.max, e.currency)}`;

/** Human label for a stored option id — used by the summary and the emails. */
export function labelOf(list: Option[], id?: string): string {
  return find(list, id)?.label ?? '';
}

// ── Domain suggestions ──────────────────────────────────────────────────────
const NOISE = /\b(ltd|limited|plc|inc|llc|nig|nigeria|enterprises?|ventures|the)\b/g;

/** "Grace Chapel Int'l Ltd" + church → gracechapelintl.org, .com, .org.ng … */
export function suggestDomains(org: string, type?: string): string[] {
  const words = org.toLowerCase().replace(/&/g, ' and ').replace(NOISE, ' ');
  const base = words.replace(/[^a-z0-9]/g, '').slice(0, 40);
  if (base.length < 2) return [];
  const nonProfit = type === 'church' || type === 'ngo';
  return nonProfit
    ? [`${base}.org`, `${base}.com`, `${base}.org.ng`, `${base}ng.org`]
    : [`${base}.com`, `${base}.com.ng`, `${base}ng.com`, `${base}.ng`];
}

export const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

/** "https://www.GraceChapel.org/about" → "gracechapel.org" */
export function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, '');
}
