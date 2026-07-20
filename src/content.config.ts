import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// "projects" = your case studies. Each is one MDX file in src/content/projects/.
// This schema is your CMS contract: fields are type-checked at build time.
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    company: z.string(),
    period: z.string(), // e.g. "2023 — Present"
    summary: z.string(), // one-to-two sentence pitch, shown on cards
    stack: z.array(z.string()).default([]),
    domain: z.array(z.string()).default([]), // e.g. ["Payments", "Security"]
    featured: z.boolean().default(false),
    order: z.number().default(99), // lower = higher on the page
    links: z
      .object({
        live: z.string().url().optional(),
        appStore: z.string().url().optional(),
        playStore: z.string().url().optional(),
        repo: z.string().url().optional(),
      })
      .default({}),
    sourcePrivate: z.boolean().default(false), // shows the honest "source private" note
    cover: z.string().optional(),
  }),
});

// "blog" = your writing. Each post is one MDX file in src/content/blog/.
// Same CMS contract idea as above: the schema is enforced at build time, and the
// `[^_]` in the glob means files starting with "_" (the template) never publish.
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(), // one-to-two sentences, shown on /blog and in RSS
    pubDate: z.coerce.date(), // "2026-07-20" is fine — coerced to a Date
    updatedDate: z.coerce.date().optional(), // set when you materially revise a post
    tags: z.array(z.string()).default([]), // e.g. ["RAG", "LLM"]
    draft: z.boolean().default(false), // true = visible in `npm run dev`, hidden in production
    cover: z.string().optional(),
  }),
});

export const collections = { projects, blog };
