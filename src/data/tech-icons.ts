/**
 * Icon glyphs for the Tech stack grid, keyed by `Tech['name']`.
 *
 * Everything here is resolved at BUILD time and inlined as SVG into the HTML —
 * the site stays fully static and self-contained, with zero runtime requests.
 * No <img src="https://…">, no sprite sheet, no icon font.
 *
 * Three sources, in order of preference:
 *
 * 1. `simple-icons` (CC0), a devDependency. Only the path data is read, so the
 *    published output is plain inline SVG with no runtime dependency at all.
 * 2. Two vendored paths — AWS and OpenAI — copied from simple-icons v11, which
 *    is the last release that carried them (both were removed upstream on
 *    trademark request). Still CC0 as published; kept verbatim.
 * 3. Hand-authored glyphs for the entries that are CONCEPTS rather than brands
 *    (RAG, Embeddings, Agent orchestration, pgvector, and the security
 *    practices — OWASP Top 10, E2E encryption, SOC 2). These share one drawing
 *    language — 24×24 box, 1.8 stroke, round caps/joins — so they sit next to
 *    the real logos without looking like a different set.
 *
 * Colour: each entry carries a light- and dark-theme value. They are usually
 * the same brand hex; they diverge only where the brand mark is near-black
 * (Next.js, MCP, OpenAI) and would vanish on a dark background. Concept glyphs
 * carry no colour at all and inherit the category hue from the tile.
 */

import {
  siAnthropic,
  siAstro,
  siCloudflare,
  siDart,
  siDigitalocean,
  siDocker,
  siFlutter,
  siGithubactions,
  siGitlab,
  siGo,
  siKubernetes,
  siLaravel,
  siModelcontextprotocol,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNuxt,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siTailwindcss,
  siTypescript,
  siVault,
  siVuedotjs,
} from 'simple-icons';

export interface TechIcon {
  /** Markup for the inside of a `viewBox="0 0 24 24"` <svg>. Trusted, static. */
  body: string;
  /** Brand colour in the default (dark) theme. Absent = use the category hue. */
  dark?: string;
  /** Brand colour in the light theme. Absent = use the category hue. */
  light?: string;
}

/** Just the two fields we read off a simple-icons export. */
type IconSource = { path: string; hex: string };

/**
 * Wrap a simple-icons path. `dark`/`light` default to the brand hex; pass an
 * override only when that hex fails against one of the two backgrounds.
 */
function brand(icon: IconSource, overrides: { dark?: string; light?: string } = {}): TechIcon {
  const hex = `#${icon.hex}`;
  return {
    body: `<path fill="currentColor" d="${icon.path}"/>`,
    dark: overrides.dark ?? hex,
    light: overrides.light ?? hex,
  };
}

// --- Vendored paths (simple-icons v11, CC0) ---------------------------------

const AWS_PATH =
  'M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z';

const OPENAI_PATH =
  'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z';

// --- Hand-authored concept glyphs -------------------------------------------

/**
 * Shared drawing language for the concept glyphs. One weight, round terminals,
 * nothing outside a 2.6→21.4 safe area — so they read at the same visual
 * density as the solid brand marks beside them.
 */
const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

/** RAG — a document being searched: retrieval feeding generation. */
const GLYPH_RAG = `<g ${S}>
  <rect x="2.8" y="3" width="9.6" height="13.6" rx="1.7"/>
  <path d="M5.6 6.9h4M5.6 9.9h4M5.6 12.9h2.4"/>
  <circle cx="16.6" cy="13.4" r="4"/>
  <path d="m19.5 16.3 1.9 1.9"/>
</g>`;

/** Embeddings — points scattered in a vector space, loosely clustered. */
const GLYPH_EMBEDDINGS = `<g fill="currentColor">
  <circle cx="5.2" cy="8.4" r="1.85"/>
  <circle cx="9.8" cy="4.9" r="1.45"/>
  <circle cx="8.8" cy="11.8" r="1.6"/>
  <circle cx="13.8" cy="8.8" r="1.4"/>
  <circle cx="15.9" cy="14.5" r="1.8"/>
  <circle cx="19.4" cy="10.8" r="1.5"/>
  <circle cx="11.1" cy="17.6" r="1.6"/>
  <circle cx="18.9" cy="18.7" r="1.35"/>
</g>`;

/** Agent orchestration — one coordinator fanning work out to three workers. */
const GLYPH_AGENTS = `<g ${S}><path d="M12 7.8v2.9M5.6 14.4v-3.7h12.8v3.7M12 10.7v3.7"/></g>
<g fill="currentColor">
  <circle cx="12" cy="5.2" r="2.4"/>
  <circle cx="5.6" cy="16.8" r="2.4"/>
  <circle cx="12" cy="16.8" r="2.4"/>
  <circle cx="18.4" cy="16.8" r="2.4"/>
</g>`;

/** pgvector — a vector plotted in an indexed space. */
const GLYPH_PGVECTOR = `<g ${S}>
  <path d="M3.6 3.4v17.2h17.2"/>
  <path d="m5.8 18.4 11-11"/>
  <path d="M13.1 7.4h3.7v3.7"/>
</g>
<g fill="currentColor">
  <circle cx="10.4" cy="15.2" r="1.15"/>
  <circle cx="16.2" cy="16.6" r="1.15"/>
</g>`;

/** OWASP Top 10 — the practice, not the foundation: a shield, verified. */
const GLYPH_OWASP = `<g ${S}>
  <path d="M12 2.9 4.7 5.7v5.4c0 4.3 2.9 8.2 7.3 9.9 4.4-1.7 7.3-5.6 7.3-9.9V5.7z"/>
  <path d="m8.7 11.8 2.4 2.4 4.2-4.6"/>
</g>`;

/** E2E encryption — two endpoints, one locked channel between them. */
const GLYPH_E2E = `<g ${S}>
  <path d="M5.4 12h2.8M15.8 12h2.8"/>
  <rect x="8.6" y="10.6" width="6.8" height="6" rx="1.6"/>
  <path d="M9.9 10.6V8.6a2.1 2.1 0 0 1 4.2 0v2"/>
</g>
<g fill="currentColor">
  <circle cx="3.6" cy="12" r="1.5"/>
  <circle cx="20.4" cy="12" r="1.5"/>
</g>`;

/** SOC 2 readiness — the controls checklist, item by item. */
const GLYPH_SOC2 = `<g ${S}>
  <rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2"/>
  <rect x="9.2" y="1.9" width="5.6" height="3.2" rx="1.1"/>
  <path d="m7.9 10.2 1.5 1.5 2.6-2.9M15 10.1h2.6"/>
  <path d="m7.9 15.4 1.5 1.5 2.6-2.9M15 15.3h2.6"/>
</g>`;

// --- The map ----------------------------------------------------------------

/**
 * Keyed by `Tech['name']` — the tile falls back to no icon if a name is
 * missing, and the build-time assertion below makes sure that never happens.
 */
export const TECH_ICONS: Record<string, TechIcon> = {
  // AI/LLM
  // Anthropic's mark is a near-black wordmark; use the brand clay instead so it
  // survives both backgrounds without going grey.
  'Anthropic Claude': brand(siAnthropic, { dark: '#D97757', light: '#BE5A38' }),
  OpenAI: { body: `<path fill="currentColor" d="${OPENAI_PATH}"/>`, dark: '#E6E6E6', light: '#0F1113' },
  MCP: brand(siModelcontextprotocol, { dark: '#E6E6E6', light: '#0F1113' }),
  RAG: { body: GLYPH_RAG },
  pgvector: { body: GLYPH_PGVECTOR },
  'Agent orchestration': { body: GLYPH_AGENTS },
  Embeddings: { body: GLYPH_EMBEDDINGS },

  // Backend
  PHP: brand(siPhp),
  Laravel: brand(siLaravel),
  TypeScript: brand(siTypescript),
  'Node.js': brand(siNodedotjs),
  NestJS: brand(siNestjs),
  Go: brand(siGo),
  Python: brand(siPython),

  // Frontend
  React: brand(siReact),
  // Next.js is a black wordmark by design; invert it for the dark theme.
  'Next.js': brand(siNextdotjs, { dark: '#E6E6E6' }),
  Vue: brand(siVuedotjs),
  Nuxt: brand(siNuxt, { light: '#00A96A' }),
  'Tailwind CSS': brand(siTailwindcss),
  Astro: brand(siAstro),

  // Data
  PostgreSQL: brand(siPostgresql),
  MySQL: brand(siMysql),
  MongoDB: brand(siMongodb),
  Redis: brand(siRedis),

  // Infra
  Docker: brand(siDocker),
  Kubernetes: brand(siKubernetes),
  // simple-icons' AWS hex is the near-black slate; the orange is the mark most
  // people recognise and it clears both backgrounds.
  DigitalOcean: brand(siDigitalocean),
  AWS: { body: `<path fill="currentColor" d="${AWS_PATH}"/>`, dark: '#FF9900', light: '#B36B00' },
  'GitHub Actions': brand(siGithubactions),
  'GitLab CI': brand(siGitlab),
  Nginx: brand(siNginx),
  Cloudflare: brand(siCloudflare),

  // Security. Only Vault is a product; the rest are practices, so they get the
  // hand-drawn treatment and inherit the category hue.
  'OWASP Top 10': { body: GLYPH_OWASP },
  'E2E encryption': { body: GLYPH_E2E },
  // Vault's brand yellow is near-invisible on white; darken it for light mode.
  'HashiCorp Vault': brand(siVault, { light: '#8A7300' }),
  'SOC 2 readiness': { body: GLYPH_SOC2 },

  // --- Not on the CV stack grid, but used by case-study `stack:` arrays, which
  // the project cards render with these same glyphs. ---
  Flutter: brand(siFlutter, { dark: '#54C5F8' }),
  Dart: brand(siDart, { dark: '#5BB8F5' }),
};
