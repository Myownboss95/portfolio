// Lighter web work — WordPress builds, marketing sites, interactive web.
// These link straight to the live site (no deep case study). Add new ones here.
//
// Fields: name + url are required; the rest are optional.
//   role  — what you did, e.g. "Theme + WebGL hero"
//   tags  — small labels, e.g. ["WordPress", "WebGL"]
//   thumb — screenshot path; drop the image in public/sites/ and reference it
//           as "/sites/your-image.png". Omit it and the card shows a clean
//           text fallback.

export interface Site {
  name: string;
  url: string;
  blurb?: string;
  role?: string;
  tags?: string[];
  thumb?: string;
}

export const SITES: Site[] = [
  {
    name: "The Duke's Infant & Child Foundation",
    url: 'https://tdicfoundation.org',
    blurb: 'Foundation website with a custom Laravel donations platform wired to the “Donate” flow (Flutterwave, USD collection).',
    role: 'WordPress build + custom donations platform',
    tags: ['WordPress', 'Laravel'],
  },
  {
    name: 'Julius Agba Charity Foundation',
    url: 'https://juliusagbascharityfoundation.org',
    blurb: 'Nonprofit website presenting the foundation’s programs and giving.',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'Zunamediks Pharm Ltd',
    url: 'https://zunamedikspharm.com',
    blurb: 'Business website for a pharmacy — “Your Health, Our Priority.”',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'Spiral Marketing',
    url: 'https://spiralmarketing.com',
    blurb: 'Website for a digital marketing agency — services, work, and lead capture.',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'Annie Marketplace',
    url: 'https://anniemarketplace.com',
    blurb: 'Online storefront for Annie Frozen SuperStore, a frozen-foods retailer.',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'David-Duke Egbom',
    url: 'https://daviddukeegbom.com',
    blurb: 'Official website for a public figure — “A Voice Shaping The Future.”',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'Nnachedom Fredrick Eneh',
    url: 'https://nnachedomfrederickeneh.com',
    blurb: 'Personal profile website.',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  {
    name: 'Somachukwu Clare Eneh',
    url: 'https://sonmachukwuclareeneh.com',
    blurb: 'Personal profile website.',
    role: 'WordPress design & build',
    tags: ['WordPress'],
  },
  // Add more sites here — see README → "How to add a Web / WordPress site".
];
