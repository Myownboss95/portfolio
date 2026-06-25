# Daniel Odiachi — Portfolio Plan

> A fast, lightweight portfolio to land **remote senior/lead backend-heavy fullstack roles**.
> Built to be opened by recruiters (skim) *and* hiring engineers (who read deeply).

---

## Decisions locked

| Decision | Choice | Why |
|----------|--------|-----|
| **Framework** | **Astro** (static output) | Ships ~zero JS, near-100 Lighthouse/SEO, content-focused. Vue/React islands available where needed. |
| **Backend / DB** | **None** | Content rarely changes; a DB/admin is maintenance debt. Backend skill is shown via case studies + public demo repos, not by bolting a server onto the portfolio. |
| **"CMS"** | **Git-based content** (MDX content collections) | Add a project = write a markdown file + `git push`. Typed + schema-validated. |
| **Styling** | **Tailwind CSS** | Fast, you already use it. |
| **Content format** | **MDX** | Markdown + components for rich case studies and diagrams. |
| **Hosting** | **Cloudflare Pages** | Free, global CDN, auto-deploy on push. |
| **Domain** | **danielodiachi.work** (Cloudflare Registrar) | Purchased. Clean, on-brand for a portfolio. |
| **Contact form** | Serverless (Web3Forms / Pages Function) | No backend needed. |

---

## Strategy: how we beat the "private repos" problem

Most client repos are private (NDA / production fintech). For senior roles a "View Code"
button was never the strong move anyway. Instead the site leads with:

1. **Case studies** — problem → constraints → architecture → the decision that mattered → impact.
2. **Architecture diagrams** — drawn from systems you designed (no proprietary data/secrets).
3. **Live public artifacts** — Hizo on the App Store + Google Play, live URLs, LinkedIn, GitHub.
4. **1–2 purpose-built public demo repos** — re-implement a *technique* you own (e.g. the
   X25519 + AES-256-GCM "card reveal" envelope; a webhook idempotency/retry pattern). These
   are your "show me code" answer, fully owned, no NDA issue.
5. **Honest one-liner** where needed: "Source private (production fintech); architecture below."

---

## Site structure

```
/                 Home — hero, positioning, featured case studies, skills, CTA
/work             All projects/case studies (filterable by stack/domain)
/work/[slug]      Individual case study (MDX, diagrams, role, stack, links)
/about            Bio, experience timeline, skills, resume download
/contact          Serverless contact form + direct links
```

### Content collections (the "CMS")
- `src/content/projects/*.mdx` — each flagship project as one file.
  - Schema: `title, role, company, period, summary, stack[], domain[], featured,
    links{live, appStore, playStore, repo?}, cover?, order`
- Adding a project later: copy a template `.mdx`, fill it in, `git push`. Done.

### Flagship case studies to write (from your résumé)
1. **Hizo Global Virtual Card system** — Interlace SDK, issuance lifecycle, REST API, security.
2. **USDT ↔ fiat remittance** — FX conversion, liquidity routing, payout rails (SasaPay/PawaPay/M-Pesa).
3. **End-to-end encryption layer** — X25519 + HKDF-SHA256 + AES-256-GCM card reveals + Flutter SDK.
4. **Prova KYC platform** — provider-agnostic (Smile ID+), tiered validation, progressive gating.
5. *(optional)* Crypto trading module — internal rate engine, PSP integrations, tiered KYC.

---

## Build phases

- [ ] **1. Foundation** — Tailwind, MDX, sitemap integrations; base layout, design tokens, SEO head.
- [ ] **2. Content layer** — define content collections schema; add 1 sample case study + template.
- [ ] **3. Pages** — home, work index, case-study template, about, contact.
- [ ] **4. Polish** — responsive, dark mode, OG images, favicon, performance pass.
- [ ] **5. Content fill** — write the 3–4 flagship case studies (collaborative; needs your input).
- [ ] **6. Deploy** — Cloudflare Pages + connect `danielodiachi.work`.

---

## Stack at a glance

```
Astro (static)  ──build──▶  plain HTML/CSS  ──▶  Cloudflare Pages (free CDN)
   │
   ├── Tailwind CSS            (styling)
   ├── MDX content collections (projects as markdown = the "CMS")
   ├── @astrojs/sitemap        (SEO)
   └── optional island(s)      (dark-mode toggle, project filter)
```

No server. No database. No monthly bill beyond the ~$10/yr domain.
