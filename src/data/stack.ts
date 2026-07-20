/**
 * The technology stack shown on the homepage, straight off the CV.
 *
 * This file is the list and nothing else. The glyph for each entry lives in
 * `./tech-icons`, keyed by `name` — brand logos come from simple-icons at build
 * time, the handful of entries that are concepts rather than products get a
 * hand-authored one. Everything is inlined as SVG, so the site stays static and
 * self-contained with no hotlinked assets.
 */

export const STACK_CATEGORIES = [
  'AI/LLM',
  'Backend',
  'Frontend',
  'Data',
  'Infra',
  'Security',
] as const;

export type StackCategory = (typeof STACK_CATEGORIES)[number];

export interface Tech {
  /** Also the key into `TECH_ICONS`. Keep the two in step. */
  name: string;
  category: StackCategory;
  /**
   * Proficiency signal. Absent = core: something reached for in production
   * without hesitation. `'growing'` = shipped with, still deepening — marked
   * so the list stays honest without pretending the experience never happened.
   * Deliberately not a `'core'` literal: the common case should stay unannotated.
   */
  level?: 'growing';
}

export const STACK: Tech[] = [
  // AI / LLM — the current track, so it leads.
  { name: 'Anthropic Claude', category: 'AI/LLM' },
  { name: 'OpenAI', category: 'AI/LLM' },
  { name: 'MCP', category: 'AI/LLM' },
  { name: 'RAG', category: 'AI/LLM' },
  { name: 'pgvector', category: 'AI/LLM' },
  { name: 'Agent orchestration', category: 'AI/LLM' },
  { name: 'Embeddings', category: 'AI/LLM' },

  // Backend — ordered by depth, deepest first. PHP/Laravel is the 8+ year
  // foundation, so it leads; Go and Python trail as the growing pair.
  { name: 'PHP', category: 'Backend' },
  { name: 'Laravel', category: 'Backend' },
  { name: 'TypeScript', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Go', category: 'Backend', level: 'growing' },
  { name: 'Python', category: 'Backend', level: 'growing' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Vue', category: 'Frontend' },
  { name: 'Nuxt', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Astro', category: 'Frontend' },

  // Data
  { name: 'PostgreSQL', category: 'Data' },
  { name: 'MySQL', category: 'Data' },
  { name: 'MongoDB', category: 'Data' },
  { name: 'Redis', category: 'Data' },

  // Infra
  { name: 'Docker', category: 'Infra' },
  { name: 'Kubernetes', category: 'Infra' },
  { name: 'DigitalOcean', category: 'Infra' },
  { name: 'AWS', category: 'Infra' },
  { name: 'GitHub Actions', category: 'Infra' },
  { name: 'GitLab CI', category: 'Infra' },
  { name: 'Nginx', category: 'Infra' },
  { name: 'Cloudflare', category: 'Infra' },

  // Security — the payments years, where being wrong is expensive. Mostly
  // practices rather than products, so most of these carry a hand-drawn glyph.
  { name: 'OWASP Top 10', category: 'Security' },
  { name: 'E2E encryption', category: 'Security' },
  { name: 'HashiCorp Vault', category: 'Security' },
  { name: 'SOC 2 readiness', category: 'Security' },
];

/** Stable, DOM-safe slug for a category (used in data attributes + ids). */
export function categorySlug(category: StackCategory | 'All'): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
