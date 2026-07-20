// Shipped products — publicly live software Daniel built, shown with real
// screenshots of the running site.
//
// Screenshots live in `public/covers/` and are referenced with an absolute
// path ("/covers/hizo.png"), so nothing is hotlinked from an external host.
// Keep them 16:9 (1280×720) — ProductCard renders them at that exact size.
//
// Fields:
//   name          — product name
//   url           — the live website (external link)
//   blurb         — one or two factual sentences about what the product is
//   role          — what Daniel did on it, one short line
//   stack         — plain tech names, rendered as a text row (may be empty)
//   image         — screenshot path under public/
//   imageAlt      — meaningful alt text describing the screenshot
//   caseStudySlug — optional id of a related case study in src/content/projects,
//                   rendered as a secondary "Read the case study" link

export interface Product {
  name: string;
  url: string;
  blurb: string;
  role: string;
  stack: string[];
  image: string;
  imageAlt: string;
  caseStudySlug?: string;
}

export const PRODUCTS: Product[] = [
  {
    name: 'Hizo',
    url: 'https://hizo.africa',
    blurb:
      'A pan-African neobank, live on the web and on the iOS App Store and Google Play. I owned the platform architecture — cross-border payments, virtual USD card issuance, tiered KYC, and an end-to-end encryption layer.',
    role: 'Technical Lead / CTO — led a team of 6',
    stack: ['Laravel', 'PHP', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
    image: '/covers/hizo.png',
    imageAlt:
      'Screenshot of the Hizo website homepage, the pan-African neobank product Daniel led as Technical Lead.',
    caseStudySlug: 'hizo-virtual-card',
  },
  {
    name: 'Glyde',
    url: 'https://useglyde.co',
    blurb:
      'A payment service provider — an all-in-one payments platform for businesses. I built the core payment infrastructure, the business KYB verification system, and collections.',
    role: 'Senior Backend Engineer · 2023 — Present',
    stack: ['Nuxt', 'Laravel', 'TypeScript', 'Node.js'],
    image: '/covers/glyde.png',
    imageAlt:
      'Screenshot of the Glyde website homepage, the all-in-one payment platform Daniel engineered.',
    caseStudySlug: 'glyde-payment-infrastructure',
  },
];
