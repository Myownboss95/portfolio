# danielodiachi.work

Personal portfolio for **Daniel Odiachi** — senior backend-heavy fullstack engineer.

Built with [Astro](https://astro.build) (static output) + Tailwind CSS + MDX.
Hosted on Cloudflare. **Every push to `main` auto-deploys.**

> 📖 **Maintaining the site?** See **[docs/updating-the-site.md](docs/updating-the-site.md)**
> — the full guide to adding case studies, Web/WordPress sites, images, and editing copy.

---

## 🧞 Commands

Run from the project root:

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Local dev server at `localhost:4321`        |
| `npm run build`   | Build the production site to `./dist/`      |
| `npm run preview` | Preview the production build locally        |

---

## ✍️ How to add a case study (no CMS, no login)

Your "CMS" is just markdown files in `src/content/projects/`. Adding a project is
four steps:

### 1. Create the file
Copy the template — the **filename becomes the URL**:

```sh
cp src/content/projects/_template.mdx src/content/projects/my-project.mdx
#                                                          ^^^^^^^^^^
#                                      → lives at /work/my-project
```
> Files starting with `_` (like `_template.mdx`) are ignored, so the template never publishes.

### 2. Fill in the frontmatter
The block between the `---` lines. Every field is documented inside `_template.mdx`.
The important ones:

| Field           | What it does                                              |
| :-------------- | :------------------------------------------------------- |
| `title`         | Case study title                                         |
| `summary`       | One–two sentences shown on cards + at the top            |
| `stack`         | Tech tags, e.g. `["Laravel", "PostgreSQL"]`              |
| `domain`        | Colored category tags, e.g. `["Payments", "Security"]`   |
| `featured`      | `true` → also shows on the homepage                      |
| `order`         | Lower number sorts higher                                |
| `sourcePrivate` | `true` → adds the honest "🔒 source is private" note      |
| `links`         | `live`, `appStore`, `playStore`, `repo` (all optional)   |

### 3. Write the body
Plain Markdown below the frontmatter. The template ships with a proven structure:
**The problem → Constraints → What I built → The decision that mattered → Impact.**
You can use fenced ```` ``` ```` code blocks for architecture diagrams.

### 4. Ship it
```sh
git add -A
git commit -m "Add my-project case study"
git push
```
Cloudflare rebuilds and it's live in ~90 seconds.

> 🛟 **Safety net:** field names and types are validated at build time
> (`src/content.config.ts`). A typo or missing required field fails the build with a
> clear message — it won't publish something broken.

---

## 📝 How to write a blog post

Same machinery as case studies, different folder. Posts are MDX files in
**`src/content/blog/`** — the **filename becomes the URL** (`my-post.mdx` →
`/blog/my-post`), they list newest-first on `/blog`, and `/rss.xml` is generated
from them automatically.

```sh
cp src/content/blog/_template.mdx src/content/blog/my-post.mdx
npm run dev        # preview at localhost:4321/blog
```

Frontmatter: `title`, `description`, `pubDate` (all required), plus optional
`updatedDate`, `tags`, `draft`, and `cover` — every field is documented inside
`_template.mdx`.

> 🚧 **`draft: true`** shows the post in `npm run dev` but keeps it out of the
> production build, the sitemap, and RSS. Flip it to `false` to publish.

Full field table and workflow: [docs/updating-the-site.md](docs/updating-the-site.md#2-write-a-blog-post).

---

## 🌐 How to add a Web / WordPress site

Lighter web work (WordPress, marketing sites) lives in a simple list, not a full
case study. Edit **`src/data/sites.ts`** and add an entry:

```ts
{
  name: "Client Site",
  url: "https://example.com",
  blurb: "What you built — one line.",
  role: "Theme + WebGL hero",   // optional
  tags: ["WordPress", "WebGL"], // optional
  thumb: "/sites/example.png",  // optional — drop image in public/sites/
}
```
Then `git add -A && git commit -m "Add Client Site" && git push`.

---

## 📁 Project structure

```text
src/
├── consts.ts                 # name, contact, socials, nav — edit your details here
├── content.config.ts         # case study + blog schemas (the "CMS" contract)
├── content/projects/         # case studies (one .mdx per project) ← add here
│   └── _template.mdx          # copy this to add a project
├── content/blog/             # blog posts (one .mdx per post) ← add here
│   └── _template.mdx          # copy this to add a post
├── data/sites.ts             # Web/WordPress site list ← add here
├── components/               # Header, Footer, cards, SEO head, theme toggle
├── layouts/BaseLayout.astro  # page shell
├── pages/                    # routes (index, work, blog, about, contact, 404)
├── pages/rss.xml.ts          # RSS feed, generated from the blog collection
└── styles/global.css         # design tokens + theme
public/                       # static files (résumé PDF, favicon, images)
```

## 🚀 Deploy

Hosted on Cloudflare (Workers static assets via `wrangler.jsonc`).
Push to `main` → Cloudflare builds (`npm run build`) and deploys `dist/` automatically.
No manual step.
