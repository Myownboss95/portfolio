/**
 * Resolve a technology name to its inline SVG icon.
 *
 * Tech names arrive from three places that don't agree with each other — the
 * stack grid (`src/data/stack.ts`), case-study frontmatter, and the products
 * list — so matching is case-insensitive with an alias table for the drift.
 * Shared by ProjectCard and ProductCard; keep the resolution in one place so a
 * new alias fixes every surface at once.
 */
import { TECH_ICONS, type TechIcon } from '../data/tech-icons';

const ICON_ALIASES: Record<string, string> = {
  'postgresql / pgvector': 'PostgreSQL',
  postgres: 'PostgreSQL',
  'flutter / dart': 'Flutter',
  node: 'Node.js',
  nodejs: 'Node.js',
  next: 'Next.js',
  'nuxt.js': 'Nuxt',
  'vue.js': 'Vue',
  claude: 'Anthropic Claude',
  tailwind: 'Tailwind CSS',
};

// Index once by lowercased name rather than scanning the map per lookup.
const ICONS_BY_KEY = new Map(
  Object.entries(TECH_ICONS).map(([name, icon]) => [name.toLowerCase(), icon])
);

export function iconFor(name: string): TechIcon | undefined {
  const key = name.trim().toLowerCase();
  const alias = ICON_ALIASES[key];
  return ICONS_BY_KEY.get(key) ?? (alias ? ICONS_BY_KEY.get(alias.toLowerCase()) : undefined);
}

/** Inline `--brand-*` custom properties for an icon, or undefined if none. */
export function brandVars(icon: TechIcon | undefined): string | undefined {
  if (!icon?.dark) return undefined;
  return `--brand-dark:${icon.dark};--brand-light:${icon.light ?? icon.dark}`;
}
