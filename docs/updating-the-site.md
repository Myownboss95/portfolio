# Updating the portfolio — a practical guide

Everything you need to add or change content on **danielodiachi.work**. No CMS,
no login — it's all files in this repo.

> **Golden rule:** every push to the `main` branch auto-deploys. Cloudflare
> rebuilds and the change is live in ~90 seconds. There is no manual deploy step.

---

## TL;DR — where things live

| I want to…                          | Edit this                                    |
| :---------------------------------- | :------------------------------------------- |
| Add a **case study**                | new `.mdx` in `src/content/projects/`        |
| Write a **blog post**               | new `.mdx` in `src/content/blog/`            |
| Add a **Web / WordPress site**      | `src/data/sites.ts`                          |
| Change my **name, email, socials**  | `src/consts.ts`                              |
| Turn on the **contact form**        | `src/pages/contact.astro` (Web3Forms key)    |
| Change **website prices / questions** | `src/data/brief.ts` (see [Start a project](#start-a-project)) |
| Edit the **About / Contact** copy   | `src/pages/about.astro`, `contact.astro`     |
| Edit the **homepage** copy          | `src/pages/index.astro`                      |
| Swap the **CV / résumé PDF**        | replace `public/Daniel-Odiachi-CV.pdf`       |
| Add an **image**                    | drop it in `public/` (see [Images](#images)) |

After any edit, the publish flow is always the same:

```sh
git add -A
git commit -m "Describe what you changed"
git push
```

To preview before pushing, run `npm run dev` and open http://localhost:4321.

---

## 1. Add a case study (a full write-up)

Case studies are MDX files in `src/content/projects/`. **The filename becomes the
URL** — `my-project.mdx` lives at `/work/my-project`.

### Steps

```sh
# 1. Copy the template (the _ prefix means the template itself never publishes)
cp src/content/projects/_template.mdx src/content/projects/my-project.mdx

# 2. Edit the new file (frontmatter + body) — see fields below
# 3. Ship it
git add -A && git commit -m "Add my-project case study" && git push
```

### Frontmatter fields

The block between the `---` lines at the top. Types are enforced at build time
(`src/content.config.ts`), so a typo fails the build with a clear message instead
of publishing something broken.

| Field           | Required | What it does                                              |
| :-------------- | :------- | :------------------------------------------------------- |
| `title`         | yes      | Case study title                                         |
| `role`          | yes      | Your role, e.g. "Technical Lead"                         |
| `company`       | yes      | Company / client name                                    |
| `period`        | yes      | e.g. "2024 — Present"                                     |
| `summary`       | yes      | One–two sentences, shown on cards + at the top           |
| `stack`         | no       | Tech tags, e.g. `["Laravel", "PostgreSQL"]`              |
| `domain`        | no       | Category tags, e.g. `["Payments", "Security"]`           |
| `featured`      | no       | `true` → also shows on the homepage                      |
| `order`         | no       | Lower number sorts higher (default 99)                   |
| `sourcePrivate` | no       | `true` → adds the honest "🔒 source is private" note      |
| `cover`         | no       | Path to a cover image, e.g. `/covers/my-project.png`     |
| `links`         | no       | `live`, `appStore`, `playStore`, `repo` (all optional)   |

> Only add `links.repo` if the repo is **public**.

### Body

Plain Markdown below the frontmatter. The template ships a proven structure:
**The problem → Constraints → What I built → The decision that mattered → Impact.**
Use fenced ` ``` ` code blocks for architecture diagrams.

---

## 2. Write a blog post

Posts are MDX files in `src/content/blog/`. **The filename becomes the URL** —
`my-post.mdx` lives at `/blog/my-post`. They appear on `/blog` newest-first and in
the RSS feed at `/rss.xml`.

### Steps

```sh
# 1. Copy the template (the _ prefix means the template itself never publishes)
cp src/content/blog/_template.mdx src/content/blog/my-post.mdx

# 2. Edit the new file (frontmatter + body) — see fields below
# 3. Preview it: npm run dev → http://localhost:4321/blog
# 4. Set draft: false, then ship it
git add -A && git commit -m "Add my-post" && git push
```

### Frontmatter fields

Same deal as case studies — types are enforced at build time
(`src/content.config.ts`), so a typo fails the build instead of publishing broken.

| Field         | Required | What it does                                             |
| :------------ | :------- | :------------------------------------------------------- |
| `title`       | yes      | Post title                                                |
| `description` | yes      | One–two sentences, shown on `/blog`, in RSS, and for SEO  |
| `pubDate`     | yes      | `YYYY-MM-DD` — sorts the list, newest first               |
| `updatedDate` | no       | `YYYY-MM-DD` — shown next to the date if you revise a post |
| `tags`        | no       | Topic tags, e.g. `["RAG", "LLM"]`                         |
| `draft`       | no       | `true` → visible in `npm run dev` only, never in production |
| `cover`       | no       | Path to an image, e.g. `/covers/my-post.png`              |

> **Drafts are safe.** A post with `draft: true` renders locally so you can read it
> in place, but is excluded from the production build, the sitemap, and RSS. Flip it
> to `false` when you're ready to publish.

### Body

Plain Markdown below the frontmatter, styled with the same typography as the case
studies (`.prose-case`). Use `##` for sections, `###` for detail inside a section,
and fenced ` ``` ` code blocks for code or diagrams.

### RSS

`/rss.xml` is generated automatically from this collection — nothing to maintain.
The feed title and description come from `SITE` in `src/consts.ts`.

---

## 3. Add a Web / WordPress site (a simple link card)

Lighter work — WordPress, marketing sites, anything that doesn't need a full
case study — lives as a one-entry list in **`src/data/sites.ts`**. These render in
the "Web & WordPress" grid at the bottom of `/work`.

Add an object to the `SITES` array:

```ts
{
  name: "Client Site",
  url: "https://example.com",
  blurb: "What you built — one line.",   // optional
  role: "WordPress design & build",      // optional
  tags: ["WordPress"],                   // optional
  thumb: "/sites/example.png",           // optional — see Images below
}
```

Only `name` and `url` are required. With no `thumb`, the card shows a clean text
fallback (the domain name) — which is fine.

**Order matters:** cards render top-to-bottom in array order, so put your best
work first. The whole section auto-hides if the array is empty.

```sh
git add -A && git commit -m "Add Client Site" && git push
```

> ⚠️ **Only add live sites.** A card linking to a dead or erroring site looks
> worse than no card. If a site is down (500 / no response), leave it out until
> it's back up. Quick check: `curl -sL -o /dev/null -w '%{http_code}' https://example.com`
> — you want `200`.

---

## 4. Change your details (name, contact, socials, nav)

All in **`src/consts.ts`**:

- `SITE` — name, title, tagline, description (SEO), URL, email, location, phone, résumé path.
- `SOCIALS` — the footer/contact links (label, href, handle).
- `NAV` — the header navigation items.

Edit the values, commit, push.

---

## 5. Edit page copy

Each page is one file in `src/pages/`:

| Page        | File                          |
| :---------- | :---------------------------- |
| Homepage    | `src/pages/index.astro`       |
| Work        | `src/pages/work/index.astro`  |
| Blog        | `src/pages/blog/index.astro`  |
| About       | `src/pages/about.astro`       |
| Contact     | `src/pages/contact.astro`     |
| 404         | `src/pages/404.astro`         |

The text lives directly in the markup — find the words you want to change and
edit them. `npm run dev` to preview.

---

## 6. The contact form (Web3Forms)

The form on `/contact` uses **[Web3Forms](https://web3forms.com)** — a free service
that emails you each submission, no backend or server needed.

> **Current status: NOT activated.** The key in `src/pages/contact.astro` is still
> the placeholder, so the form shows *"Form not yet activated,"* the Send button is
> disabled, and only the email/social links work. Activate it to make it live.

### Activate it

1. Go to https://web3forms.com, enter the email address where you want messages to
   land, and copy the **access key** they send you.
2. In `src/pages/contact.astro`, replace the placeholder on this line:
   ```ts
   const WEB3FORMS_KEY = 'YOUR-WEB3FORMS-ACCESS-KEY';   // ← paste your key here
   ```
3. Commit + push. The form enables itself automatically — `formEnabled` flips to
   `true` the moment the key isn't the placeholder, the Send button activates, and
   submissions start arriving in your inbox.

### Good to know

- The access key is **public** by design (it ships in the page HTML). It only
  permits sending to *your* configured address — nothing sensitive is exposed.
- A hidden honeypot field (`botcheck`) is already in place for basic spam defense.
- Submissions arrive as email. If a send fails, the form tells the visitor to email
  you directly (`SITE.email` from `consts.ts`).
- To change the email subject line, edit the hidden `subject` field in the form.

---

## 6b. "Start a project" — the website brief {#start-a-project}

`/start-a-project` is a 7-step brief for website clients (company, e-commerce,
church, NGO). It shows a live price estimate, takes photo/logo uploads, saves
progress in the visitor's browser, and on submit emails **you** the full brief
and the **client** a styled copy (if they gave an email). It's linked from the
homepage, hero, /work, /contact, /about, /blog, the 404 page, the footer, the
contact dock and ⌘K.

| I want to…                              | Edit this                                 |
| :-------------------------------------- | :---------------------------------------- |
| Change a **price**                      | `PRICES` in `src/data/brief.ts`           |
| Change **questions / options**          | the lists in `src/data/brief.ts`          |
| Change the **page layout / wording**    | `src/pages/start-a-project.astro`         |
| Change the **emails**                   | `worker/emails.ts`                        |
| Change **where briefs are emailed**     | `NOTIFY_EMAIL` in `wrangler.jsonc`        |
| Change the **address clients reply to** | `REPLY_TO` in `wrangler.jsonc`            |

Prices are `[min, max]` per currency, and naira and dollars are separate lists,
so you can change one without the other. Each option that costs extra names its
price with `price: '…'`. The page, the estimate and the emails all read from this
one file.

### How it works

- **Worker** (`worker/index.ts`) handles `/api/*` and `/files/*`. Every other
  page is served exactly as before.
- **Uploads + saved briefs** go to the private R2 bucket `portfolio-briefs`,
  under `briefs/<id>/`. Your email links to `/files/<id>`, a page showing that
  client's uploads. The id is random and unguessable.
- **Emails** are sent through [Resend](https://resend.com). If Resend isn't set
  up or fails, the brief is still saved in R2. Your notification then goes out
  through the Web3Forms key (`WEB3FORMS_KEY` in `consts.ts`) as a plain-text
  email, and the client is told their copy will come on WhatsApp.
- **No email from the client?** Your copy has a **"Send their copy on WhatsApp"**
  button. It opens their chat with the summary already typed.
- **Domain check** asks the .com/.org registries directly. `.ng` addresses can't
  be checked automatically, so they show "we'll confirm".
- **Currency:** visitors in Nigeria see ₦ and everyone else sees $. They can switch.

### One-time setup (do this BEFORE the first push with this code)

The deploy needs the bucket to exist, so create it first:

```sh
npx wrangler login
npx wrangler r2 bucket create portfolio-briefs
```

Then set up email:

1. Sign up at https://resend.com → **Domains → Add domain** → `danielodiachi.work`.
   Add the DNS records it shows in Cloudflare (DNS → Records) and wait for
   "Verified".
2. **API Keys → Create** (sending access) and copy the key, then:
   ```sh
   npx wrangler secret put RESEND_API_KEY
   ```
3. Emails are sent from `projects@danielodiachi.work`, which is `MAIL_FROM` in
   `wrangler.jsonc`. Client replies go to your inbox.

### Try it locally (with uploads + API)

```sh
npm run build
npx wrangler dev        # http://localhost:8787/start-a-project/
```

`npm run dev` shows the page too, but uploads, the domain check and sending need
the Worker, so use `wrangler dev` for those. Locally there's no email key, so
the success screen shows the "WhatsApp me if you don't hear back" note. That's
expected.

### Caching ("page loads with no styles")

Every page now has its CSS and scripts **inside the HTML**
(`astro.config.mjs`), and `public/_headers` tells browsers to re-check pages on
every visit. A page can't load half-styled from an old cache after a deploy. If
it ever still happens, check Cloudflare → Caching → Configuration →
**Browser Cache TTL** is set to **"Respect Existing Headers"**.

---

## 7. Images {#images}

Anything in `public/` is served from the site root. Drop a file in and reference
it with a leading slash:

- Site thumbnails → `public/sites/example.png` → reference as `/sites/example.png`
- Case study covers → `public/covers/my-project.png` → reference as `/covers/my-project.png`

Keep images reasonably sized (cards display ~640×360, 16:9). Optimize before
committing so the page stays fast.

---

## 8. Local development

```sh
npm install       # first time only
npm run dev       # dev server at http://localhost:4321 (live reload)
npm run build     # produce the production build in ./dist (what Cloudflare runs)
npm run preview   # serve the production build locally
```

Running `npm run build` locally before pushing is a good habit — if it builds for
you, it'll build on Cloudflare.

---

## 9. Safety net & troubleshooting

- **Build fails after an edit?** Read the error — it usually names the file and
  field. The most common cause is a case-study frontmatter typo or a missing
  required field (`src/content.config.ts` enforces the schema).
- **Pushed but the site didn't change?** Cloudflare builds on push to `main`.
  Confirm your commit is pushed: `git status` should say *"up to date with
  origin/main"*. Then hard-refresh the browser (the old page may be cached).
- **A site card links somewhere broken?** Remove or fix the entry in
  `src/data/sites.ts` and push.

---

## Where everything lives

```text
src/
├── consts.ts                 # name, contact, socials, nav — your details
├── content.config.ts         # case-study + blog schemas (the "CMS" contract)
├── content/projects/         # case studies (one .mdx per project)  ← add here
│   └── _template.mdx          # copy this to start a new case study
├── content/blog/             # blog posts (one .mdx per post)  ← add here
│   └── _template.mdx          # copy this to start a new post
├── data/sites.ts             # Web / WordPress site list  ← add here
├── components/               # Header, Footer, cards, SEO head, theme toggle
├── layouts/BaseLayout.astro  # page shell
├── pages/                    # routes (index, work, blog, about, contact, 404)
├── pages/rss.xml.ts          # RSS feed, generated from the blog collection
└── styles/global.css         # design tokens + theme
public/                       # static files (résumé PDF, favicon, images)
```
