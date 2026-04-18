# matinmonshizadeh.github.io

Personal portfolio for Matin Monshizadeh — AI Master's student specialising in computer vision, image processing, and computer graphics.

**Live site:** https://matinmonshizadeh.github.io  
**Admin panel:** https://matinmonshizadeh.github.io/admin/

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Astro v6 (static output) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Interactive | React islands (WebGL hero) |
| 3D / visuals | Three.js (lazy-loaded) |
| Content | Astro content collections (Markdown + YAML) |
| CMS | Decap CMS v3 (Git-backed, no database) |
| Auth proxy | Vercel serverless (`portfolio-cms-oauth.vercel.app`) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (auto-deploy on push to `main`) |

---

## Local development

```bash
# Clone
git clone https://github.com/matinmonshizadeh/matinmonshizadeh.github.io.git
cd matinmonshizadeh.github.io

# Install dependencies
npm install

# Start dev server — http://localhost:4321
npm run dev

# Production build
npm run build

# Preview built site locally
npm run preview
```

Requires Node.js 22+.

---

## Where content lives

```
src/content/
├── projects/          # One .md file per project
│   ├── neural-style-transfer.md
│   ├── ray-marching-demo.md
│   └── semantic-segmentation.md
├── about/
│   └── about.md       # Bio, education, experience, skills, awards
└── site/
    └── config.md      # Name, tagline, role, email, social links, CV path

public/
├── images/projects/   # Project cover images (served at /images/projects/*)
├── cv.pdf             # CV download — replace this file to update it
└── admin/
    ├── index.html     # Decap CMS entry point
    └── config.yml     # CMS schema — edit to add new fields
```

---

## Adding a project via the admin panel

1. Go to https://matinmonshizadeh.github.io/admin/
2. Log in with GitHub
3. Click **Projects → New Projects**
4. Fill in all fields:
   - **Cover image path** — add your image to `public/images/projects/` via Git first, then reference it as `/images/projects/filename.jpg`
   - **Type** — `university` or `game`
   - **Featured** — tick to show on the home page (keep to 3 max)
   - **Content body** — write Problem / Approach / Results in Markdown
5. Click **Save → Publish now**
6. GitHub Actions rebuilds in ~2 minutes

---

## Adding a project via Git

Create `src/content/projects/your-project-slug.md`:

```markdown
---
title: "Your Project Title"
type: university
date: 2024-06-01
cover: /images/projects/your-project.jpg
description: "One or two sentences shown on the card."
featured: false
tags:
  - Computer Vision
  - PyTorch
stack:
  - Python
  - PyTorch
  - OpenCV
links:
  github: https://github.com/matinmonshizadeh/your-repo
  paper: https://arxiv.org/abs/...
---

## Problem

What you were solving.

## Approach

Method, architecture, key ideas.

## Results

Metrics and qualitative outcomes.
```

Add the cover image to `public/images/projects/`. Commit and push to `main` — deploys automatically.

---

## Updating global site info

Edit `src/content/site/config.md` directly, or use **Admin → Site Settings → Global Config**:

```yaml
---
name: "Matin Monshizadeh"
role: "AI Master's Student · Computer Vision & Graphics"
tagline: "Building machines that see, understand, and render the world."
intro: "Your intro paragraph..."
email: "your@email.com"
github: "https://github.com/matinmonshizadeh"
linkedin: "https://linkedin.com/in/matinmonshizadeh"
scholar: "https://scholar.google.com/..."
cv: "/cv.pdf"
---
```

---

## Updating the CV

Replace `public/cv.pdf` with your updated file. Keep the filename exactly `cv.pdf`. Commit and push.

---

## Deployment process

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. Checks out repo
2. Sets up Node.js 22
3. Runs `npm ci && npm run build`
4. Deploys `./dist` to GitHub Pages via OIDC

Deploy time: ~1–2 minutes. Watch runs at:  
https://github.com/matinmonshizadeh/matinmonshizadeh.github.io/actions

---

## Admin panel infrastructure

The `/admin/` panel uses **Decap CMS v3**. GitHub OAuth is handled by a minimal proxy on Vercel:

- **Proxy repo:** https://github.com/matinmonshizadeh/portfolio-cms-oauth
- **Proxy URL:** https://portfolio-cms-oauth.vercel.app
- **GitHub OAuth App:** GitHub → Settings → Developer settings → OAuth Apps → Portfolio CMS

If login breaks, check:
1. Vercel project is still live at `portfolio-cms-oauth.vercel.app`
2. OAuth App callback URL = `https://portfolio-cms-oauth.vercel.app/callback`
3. `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in Vercel environment variables

---

## Design system

Defined in `src/styles/global.css` under `@theme`. No colours outside this palette.

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#0A1118` | Page background |
| `bg-elevated` | `#0F1A22` | Cards, nav |
| `fg-primary` | `#E8F4F4` | Headings |
| `fg-secondary` | `#9BB3B8` | Body text |
| `fg-tertiary` | `#5A6F75` | Captions (large text only — fails WCAG AA at small sizes) |
| `accent` | `#3FE0C5` | Teal — CTAs, highlights |

Fonts: Space Grotesk (headings) · Inter (body) · JetBrains Mono (code/tags).

---

## Lighthouse scores

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 99 | 100 | 100 | 100 |
| Projects | 99 | 100 | 100 | 100 |
| Project detail | 99 | 100 | 100 | 100 |
| About | 100 | 100 | 100 | 100 |
