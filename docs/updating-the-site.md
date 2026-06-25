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
| Add a **Web / WordPress site**      | `src/data/sites.ts`                          |
| Change my **name, email, socials**  | `src/consts.ts`                              |
| Turn on the **contact form**        | `src/pages/contact.astro` (Web3Forms key)    |
| Edit the **About / Contact** copy   | `src/pages/about.astro`, `contact.astro`     |
| Edit the **homepage** copy          | `src/pages/index.astro`                      |
| Swap the **résumé PDF**             | replace `public/Daniel-Odiachi-Resume.pdf`   |
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

## 2. Add a Web / WordPress site (a simple link card)

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

## 3. Change your details (name, contact, socials, nav)

All in **`src/consts.ts`**:

- `SITE` — name, title, tagline, description (SEO), URL, email, location, phone, résumé path.
- `SOCIALS` — the footer/contact links (label, href, handle).
- `NAV` — the header navigation items.

Edit the values, commit, push.

---

## 4. Edit page copy

Each page is one file in `src/pages/`:

| Page        | File                          |
| :---------- | :---------------------------- |
| Homepage    | `src/pages/index.astro`       |
| Work        | `src/pages/work/index.astro`  |
| About       | `src/pages/about.astro`       |
| Contact     | `src/pages/contact.astro`     |
| 404         | `src/pages/404.astro`         |

The text lives directly in the markup — find the words you want to change and
edit them. `npm run dev` to preview.

---

## 5. The contact form (Web3Forms)

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

## 6. Images {#images}

Anything in `public/` is served from the site root. Drop a file in and reference
it with a leading slash:

- Site thumbnails → `public/sites/example.png` → reference as `/sites/example.png`
- Case study covers → `public/covers/my-project.png` → reference as `/covers/my-project.png`

Keep images reasonably sized (cards display ~640×360, 16:9). Optimize before
committing so the page stays fast.

---

## 7. Local development

```sh
npm install       # first time only
npm run dev       # dev server at http://localhost:4321 (live reload)
npm run build     # produce the production build in ./dist (what Cloudflare runs)
npm run preview   # serve the production build locally
```

Running `npm run build` locally before pushing is a good habit — if it builds for
you, it'll build on Cloudflare.

---

## 8. Safety net & troubleshooting

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
├── content.config.ts         # case-study schema (the "CMS" contract)
├── content/projects/         # case studies (one .mdx per project)  ← add here
│   └── _template.mdx          # copy this to start a new case study
├── data/sites.ts             # Web / WordPress site list  ← add here
├── components/               # Header, Footer, cards, SEO head, theme toggle
├── layouts/BaseLayout.astro  # page shell
├── pages/                    # routes (index, work, about, contact, 404)
└── styles/global.css         # design tokens + theme
public/                       # static files (résumé PDF, favicon, images)
```
