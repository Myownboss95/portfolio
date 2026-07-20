// Central site config — edit your details here.

export const SITE = {
  name: 'Daniel Odiachi',
  title: 'Daniel Odiachi — Senior Full Stack & AI Engineer',
  tagline: 'Senior Full Stack & AI Engineer · LLM / Agentic Systems · Fintech & Payments',
  description:
    'Senior Full Stack & AI Engineer with 8+ years shipping production systems. Building LLM products — RAG pipelines, agentic tool-use workflows, and a custom MCP server — on top of deep fintech infrastructure: cross-border payments, virtual card issuance, KYC/AML, and end-to-end encryption. Available for remote or on-site roles worldwide.',
  url: 'https://danielodiachi.work',
  email: 'tobeodiachi@yahoo.com',
  location: 'Available worldwide',
  phone: '+234 813 188 6973',
  phoneHref: 'tel:+2348131886973',
  resumeUrl: '/Daniel-Odiachi-CV.pdf',
} as const;

// Availability — shown as the badge in the hero and on /contact.
// Change it in one place; every surface follows.
export const STATUS = {
  available: true,
  label: 'Open to senior AI / backend roles',
  detail: 'Remote or on-site, worldwide',
} as const;

// Headline numbers. These are the credibility — keep them accurate, and keep
// them to things that are genuinely mine: systems I architected and owned, not
// product usage counts the app happened to accumulate.
export const STATS = [
  { value: '$50M+', label: 'processed on platforms I architected' },
  { value: '99.9%', label: 'production uptime' },
  { value: '6', label: 'engineers led' },
  { value: '8+ yrs', label: 'shipping software' },
] as const;

export const SOCIALS = [
  // Same number as SITE.phone, in wa.me's required format: international,
  // digits only, no '+' and no spaces.
  { label: 'WhatsApp', href: 'https://wa.me/2348131886973', handle: '+234 813 188 6973' },
  { label: 'GitHub', href: 'https://github.com/Myownboss95', handle: '@Myownboss95' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-odiachi', handle: 'daniel-odiachi' },
  { label: 'X (Twitter)', href: 'https://x.com/dannytobs', handle: '@dannytobs' },
  { label: 'Email', href: 'mailto:tobeodiachi@yahoo.com', handle: 'tobeodiachi@yahoo.com' },
  { label: 'Phone', href: 'tel:+2348131886973', handle: '+234 813 188 6973' },
] as const;

export const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;
