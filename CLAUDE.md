# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## Project Overview

Personal portfolio website for a master's student in Artificial Intelligence specializing in **computer vision**, **image processing**, and **computer graphics**.

The site is static, hosted on **GitHub Pages**, and includes a Git-backed **admin panel** so the owner can update content (text, images, projects) without editing code.

---

---

## Project Context

- **Repository:** `matinmonshizadeh/matinmonshizadeh.github.io` (already exists on GitHub).
- **Live URL:** `https://matinmonshizadeh.github.io`
- **State:** The repo previously contained an old HTML/CSS site. It has been wiped clean (or recreated). The `main` branch is empty except for `CLAUDE.md` and is ready for Phase 1.
- **GitHub username:** `matinmonshizadeh`

---

## Tech Stack

- **Framework:** Astro (static site generation + content collections + React islands)
- **Styling:** Tailwind CSS
- **Interactive components:** React (used only where interactivity is needed — WebGL hero, filters, demos)
- **3D / visuals:** Three.js for the hero WebGL scene
- **Content:** Markdown files with frontmatter, managed via Astro content collections
- **Admin panel:** Decap CMS (free, open-source, Git-backed; commits to the GitHub repo)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions (auto-build + auto-deploy on push)
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (code/tags) — via `@fontsource/*`
- **Image optimization:** Astro's built-in `<Image />` component
- **Repo name:** `matinmonshizadeh.github.io` (served at the root domain)

---

## Commands

```bash
# Install dependencies
npm install

# Local dev server (http://localhost:4321)
npm run dev

# Production build (outputs to ./dist)
npm run build

# Preview built site locally
npm run preview

# Add Astro integrations
npx astro add tailwind react sitemap
```

---

## Design System

### Mood
Ethereal, dark, bioluminescent — inspired by a misty forest at night with glowing teal accents. Minimal, elegant, technical. Generous whitespace. Single accent color used sparingly for maximum impact.

### Color Palette (strict — no other colors allowed)

```js
// tailwind.config.js
colors: {
  bg: {
    base:     '#0A1118',  // primary background
    elevated: '#0F1A22',  // cards, nav bar
    border:   '#16222C',  // dividers
  },
  fg: {
    primary:   '#E8F4F4', // headings, body
    secondary: '#9BB3B8', // descriptions, meta
    tertiary:  '#5A6F75', // captions
  },
  accent: {
    DEFAULT: '#3FE0C5',   // primary accent (teal glow)
    light:   '#6FE8D4',   // hover
    dark:    '#1FA891',   // pressed
  },
  mist:   '#4A7A85',      // atmospheric gradients
  shadow: '#1B2F3A',      // section backgrounds
}
```

### Typography
- **Headings:** Space Grotesk, weights 500–700
- **Body:** Inter, weights 400–500
- **Code / tech tags:** JetBrains Mono, weight 400
- **Maximum 2 weights per typeface on screen at once** (Space Grotesk: 600 + 700 for heading hierarchy; Inter: 400 + 500 for body)

### Visual Effects
- Teal glow on interactive elements: `box-shadow: 0 0 20px rgba(63, 224, 197, 0.4)` on hover
- Subtle text-shadow glow on the hero name
- Scattered teal particles in the WebGL hero (echoing bioluminescent moss)
- Radial gradient from `#1B2F3A` behind the hero for atmospheric depth
- Smooth transitions (150–250ms) on all hover states
- **Dark mode only** — no light theme toggle in v1

---

## Site Structure

### Pages (v1)

```
/                  → Home
/projects          → Projects (three sections: University, Independent, Games)
/projects/[slug]   → Individual project detail
/about             → About (Professional Summary, Technical Skills, Education)
/experience        → Experience (Work History, Volunteering, CV Download)
/contact           → Contact (Patronus animation scene)
/admin             → Decap CMS admin panel
```
Blog and Publications pages are deferred to v2.

### Global Elements (on every page)
- **Nav bar:** left = name/logo → home; right = Projects, About, Experience, Projects, Contact. Sticky with backdrop blur on scroll. Mobile: hamburger menu.
- **Footer:** left = copyright; right = icon links (GitHub, LinkedIn, ArtStation, Email). Single line, minimal.

### Page Sections

**HOME (`/`)**
1. **Hero** — full-viewport height. Left: name (large), role ("AI Master's Student · Computer Vision & Graphics"), one-line tagline, two CTAs ("View Projects" + "Download CV"). Right/background: WebGL Three.js scene with teal particles reacting to mouse.
2. **Intro strip** — 2–3 sentences about who you are, what you research, what you're looking for.
3. **Featured projects** — 3 cards (cover image/GIF, title, short description, tags). "See all projects →" link below.
4. **Footer.**

**PROJECTS (`/projects`)**
1. Page header — title + 1-sentence intro.
2. **Section 1: University Projects** — heading + description, grid of cards (2–3 columns).
3. **Section 2: Fun Games** — heading + description, grid of cards. Games have a "Play" button if playable in-browser.
4. Same card design for both sections: cover image/GIF (16:9), title, short description, tech tags, year.

**PROJECT DETAIL (`/projects/[slug]`)**
1. Cover visual + title + meta (date, tags, links).
2. **Problem** — what you were solving (2–3 sentences).
3. **Approach** — method, architecture, key ideas, with diagrams/images.
4. **Results** — metrics table + qualitative figures.
5. **Tech stack** — libraries, models, datasets.
6. **Links** — GitHub, live demo/play, paper.
7. Next/previous project navigation at bottom.

**ABOUT (`/about`)**
1. **Professional Summary** — optional photo + bio paragraphs (Markdown body).
2. **Technical Skills** — grouped (Languages, CV/ML, Graphics, Tools). **No skill bars / percentages.**
3. **Education** — timeline, most recent first.

**EXPERIENCE (`/experience`)**
1. **Internships & Work History** — timeline with role, company, location, dates, bullets.
2. **Volunteering** — timeline with role, organisation, location, dates, bullets.
3. **CV Download** — heading, intro text, download button (file path CMS-editable).

**CONTACT (`/contact`)**
Interactive Patronus animation scene. Reveals contact details (email, GitHub, LinkedIn, location) on interaction. Content (links, name, location) from site config.

---

## Content Schema

Defined in `src/content.config.ts` using Astro content collections (Astro 5 format).

### Projects (`src/content/projects/*.md`)
```yaml
title: string
type: "university" | "game" | "independent"
date: date
cover: image path         # public path, e.g. /images/projects/foo.png
tags: string[]
stack: string[]
description: string       # short, for cards
featured: boolean
links:
  github?: string         # full URL or empty string
  demo?: string
  paper?: string
  play?: string
# Body (Markdown): Problem / Approach / Results
```

### Site config (`src/content/site/config.md`)
Key fields (see `src/content.config.ts` for full schema):
- `name`, `role`, `tagline`, `intro`, `email`, `cv`
- `github`, `linkedin`, `artstation` (optional)
- `projects_page_desc`, `university_section_desc`, `independent_section_desc`, `games_section_desc`
- `contact_cta_text`, `contact_cta_button`
- `projects_page_meta_desc`, `contact_page_meta_desc`

### About (`src/content/about/about.md`)
- Frontmatter: `professional_summary` (heading, photo, photo_alt), `technical_skills` (heading, groups[]), `education` (heading, entries[]).
- Body: Markdown prose for the Professional Summary section.

### Experience (`src/content/experience/experience.md`)
- Frontmatter: `work_history` (heading, entries[]), `volunteering` (heading, entries[]), `cv` (heading, intro, button_label, file).

---

## Project Structure
```
portfolio/
├── .github/workflows/deploy.yml
├── public/
│   ├── admin/
│   │   ├── index.html         # Decap CMS entry point
│   │   └── config.yml         # CMS schema
│   ├── cv.pdf
│   ├── favicon.svg
│   └── fonts/                 # optional self-hosted fonts
├── src/
│   ├── assets/
│   │   ├── projects/          # project cover images
│   │   └── uploads/           # CMS media library
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── ProjectCard.astro
│   │   ├── ProjectGrid.astro
│   │   ├── contact/
│   │   │   └── PatronusScene.tsx  # React island — contact animation
│   │   ├── hero/
│   │   │   ├── LivingForestHero.astro
│   │   │   ├── Fireflies.astro
│   │   │   ├── FallingLeaves.astro
│   │   │   └── MossGlow.astro
│   │   ├── home/
│   │   │   └── GetInTouchSection.astro
│   │   └── shared/
│   │       ├── SectionHeading.astro
│   │       ├── TimelineEntry.astro
│   │       ├── SkillGroup.astro
│   │       └── MagicalPowder.astro
│   ├── content/
│   │   ├── projects/          # *.md, one per project
│   │   ├── about/
│   │   │   └── about.md
│   │   ├── experience/
│   │   │   └── experience.md
│   │   └── site/
│   │       └── config.md
│   ├── content.config.ts      # collection schemas (Astro 5)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── experience.astro
│   │   ├── contact.astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       ├── global.css
│       └── hero.css
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Admin Panel (Decap CMS)

- Live at `/admin` (served from `public/admin/index.html`).
- Config in `public/admin/config.yml`.
- Backend: GitHub OAuth (uses the repo's own GitHub auth).
- **Collections to configure:**
  - **Projects** — editable list with full schema, image upload to `src/assets/projects/`.
  - **Site settings** — single-file collection for `site.json`.
  - **About** — single-file collection for `about.md`.
- **Media library:** uploads stored in `src/assets/uploads/` (committed to repo).
- **Workflow:** edit in admin → Decap commits to `main` → GitHub Actions rebuilds → site updates in ~1–2 minutes.

---

## Roadmap

Work phase by phase. **Confirm each phase works before starting the next.**

### Phase 1 — Repo & Hosting
1. Repo `matinmonshizadeh/matinmonshizadeh.github.io` already exists and is cloned locally. Verify `main` branch is clean.
2. `npm create astro@latest` — choose Empty template with TypeScript.
3. `npx astro add tailwind react sitemap`.
4. `npm i three @types/three`.
5. Create `.github/workflows/deploy.yml` using Astro's official GitHub Pages workflow.
6. Enable GitHub Pages in repo settings → source: GitHub Actions.
7. Push → confirm placeholder site is live.

### Phase 2 — Design System
1. Configure `tailwind.config.js` with color palette, font families, custom shadow/glow utilities.
2. Add fonts: `@fontsource/space-grotesk`, `@fontsource/inter`, `@fontsource/jetbrains-mono`.
3. Create `src/styles/global.css` with base styles + CSS variables for glows.
4. Build `BaseLayout.astro` with nav, footer, dark class, font imports, meta tags.

### Phase 3 — Content Schema
1. Define content collections in `src/content/config.ts`.
2. Create 2–3 sample project Markdown files.
3. Create `site.json` and `about.md` with placeholder content.

### Phase 4 — Static Pages
1. Build `Nav.astro` + `Footer.astro`.
2. Home page: hero placeholder, intro strip, featured projects grid, footer.
3. Projects page: two sections (University / Games), filter grids by `type`.
4. Project detail `[slug].astro`: cover, body (Problem/Approach/Results), stack, links, prev/next.
5. About page: bio, education, experience, skills (grouped), CV button.
6. Verify responsiveness (desktop-first, then mobile).

### Phase 5 — WebGL Hero
1. Build `ShaderCanvas.tsx` as a React island (`client:load`).
2. Three.js scene: dark background, scattered teal particles, subtle mouse parallax, gentle autonomous motion.
3. Optional: depth fog matching `#1B2F3A` for misty forest feel.
4. Keep bundle **under 200 KB**; lazy-load if needed.

### Phase 6 — Polish & Effects
1. Teal glow hover states on buttons, cards, nav links.
2. Scroll-in animations (subtle fade/translate) via Intersection Observer or CSS only.
3. Radial gradient backdrop behind hero.
4. Optional: custom cursor-follower glow.
5. Smooth 150–250ms transitions everywhere.

### Phase 7 — Admin Panel (Decap CMS)
1. Create `public/admin/index.html` with Decap CMS script include.
2. Write `public/admin/config.yml` matching content schemas.
3. Set up GitHub OAuth (e.g., `decap-oauth-provider` on Vercel/Netlify just for auth).
4. Test: log in → edit a project → verify commit + rebuild.
5. Document admin URL + login in README.

### Phase 8 — Content
1. Write real bio, education, experience, skills.
2. Add real project entries with cover images/GIFs, writeups, links.
3. Add CV PDF to `public/cv.pdf`.

### Phase 9 — SEO & Performance
1. Meta tags (title, description, Open Graph image) per page.
2. Sitemap (`@astrojs/sitemap`).
3. `robots.txt`.
4. Run Lighthouse → target 95+ on all scores.
5. Test on mobile devices.

### Phase 10 — Custom Domain (optional)
1. Buy domain (e.g., `yourname.dev`).
2. Configure DNS (CNAME / A records to GitHub Pages).
3. Add `CNAME` file in `public/`.
4. Enable HTTPS in GitHub Pages settings.

---

## Responsiveness

The site must work flawlessly on all screen sizes. Mobile-first is NOT the approach here (this is a technical portfolio primarily viewed on desktop), but every page must be fully usable on phones and tablets.

### Breakpoints (Tailwind defaults)

- `sm`  — 640px   (large phones, small tablets portrait)
- `md`  — 768px   (tablets)
- `lg`  — 1024px  (small laptops)
- `xl`  — 1280px  (desktops — primary target)
- `2xl` — 1536px  (large displays)

### Target Devices

- **Primary:** 1440px desktop (recruiter viewing)
- **Secondary:** 1024px laptop, 390px iPhone, 768px iPad
- **Must not break on:** 360px small Android, 1920px large monitor

### Layout Rules

- **Desktop (≥1024px):** multi-column layouts, 3-column project grid, side-by-side hero content, full nav bar.
- **Tablet (768–1023px):** 2-column project grid, stacked hero content, full nav bar.
- **Mobile (<768px):** single-column everywhere, hamburger menu, hero visual reduced or below text, no WebGL effects on very low-end devices (respect `prefers-reduced-motion`).

### Typography Scaling

Use Tailwind's responsive utilities for fluid type:
- Hero name: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`
- Section headings: `text-2xl md:text-3xl lg:text-4xl`
- Body: `text-base md:text-lg`
- Never use fixed pixel font sizes.

### Spacing Scaling

- Horizontal page padding: `px-4 sm:px-6 md:px-12 lg:px-24`
- Section vertical padding: `py-12 md:py-20 lg:py-28`
- Grid gaps: `gap-4 md:gap-6 lg:gap-8`

### Navigation

- **≥768px:** full horizontal nav bar with all links visible.
- **<768px:** hamburger icon in top-right → slide-in or fullscreen overlay menu with teal accent links, close button, no scroll leakage behind the overlay.

### Images

- Use Astro's `<Image />` component with `widths` and `sizes` attributes for responsive image serving.
- Project cover images: serve multiple sizes (400w, 800w, 1200w) — never a single 2MB image to all devices.
- All images must have explicit `width` and `height` to prevent layout shift.

### WebGL Hero

- **≥1024px:** full WebGL scene.
- **768–1023px:** simplified scene (fewer particles, lower framerate).
- **<768px:** static gradient image fallback — no WebGL. Keeps mobile fast and battery-friendly.
- Always respect `prefers-reduced-motion: reduce` — disable all motion in that case.

### Touch Targets

All clickable elements (nav links, buttons, card links, social icons) must be at least **44×44px** on mobile — per iOS accessibility guidelines.

### Testing Requirement

Every phase that produces visible UI must be tested at **three widths** before committing:
1. 1440px (desktop)
2. 768px (tablet)
3. 390px (mobile)

Use Chrome DevTools device toolbar or actual devices. No phase is "done" until all three widths look correct.


---

## Accessibility

- All interactive elements must be keyboard-navigable (Tab, Enter, Escape).
- Visible focus states on all interactive elements: 2px teal outline with 2px offset.
- Proper heading hierarchy (one `<h1>` per page, no skipping levels).
- All images must have meaningful `alt` text (decorative images: `alt=""`).
- Color contrast must meet WCAG AA: body text ≥ 4.5:1 against background, headings ≥ 3:1.
- Respect `prefers-reduced-motion` for all animations.
- Nav menu on mobile must trap focus when open and close on Escape.
- No reliance on color alone to convey information.

## Constraints & Non-Negotiables

- **Output must be fully static** — no server-side runtime.
- **Strict color palette** — no reds, yellows, purples, or additional accents.
- **No skill bars / percentage indicators** on skills.
- **No testimonial sections, no client logos.**
- **Max 2 visible font weights** at a time.
- **WebGL hero must degrade gracefully** on devices without WebGL (fallback to static gradient).
- **All owner-editable content must come from the admin panel** — no hardcoded strings for name, tagline, bio, contact, project entries.
- **Lighthouse performance score ≥ 90** on the deployed site.
- **Accessibility:** proper heading hierarchy, alt text on images, keyboard navigation, visible focus states (teal outline).

---

## Deliverables

1. Live site at `matinmonshizadeh.github.io` (or custom domain).
2. Working admin panel at `/admin` — login via GitHub, edit content.
3. Auto-deploy pipeline: any commit (from admin or manual) rebuilds + redeploys within ~2 minutes.
4. `README.md` covering: local dev setup, adding projects via admin, adding projects via Git, deployment notes.

---

## Working Instructions for Claude

- Proceed **phase by phase**. Do not jump ahead.
- Confirm each phase works (build passes, visual check) before moving on.
- Ask for clarification if content, asset, or design decisions are ambiguous.
- Never hardcode owner-editable strings — always read from content collections.
- Respect the color palette and typography rules strictly.
- Keep the WebGL hero lightweight; prefer simplicity over visual complexity.
- When adding dependencies, justify each one and prefer the Astro-native solution where available.

---
---

## Audit Criteria (for consistency reviews)

When auditing this site, consider these issues "bugs" or "inconsistencies":

### Visual consistency
- Colors used outside the strict palette defined above
- Font weights beyond the 2-at-a-time rule
- Inconsistent section padding (must follow px-4 sm:px-6 md:px-12 lg:px-24 and py-12 md:py-20 lg:py-28)
- Inconsistent heading sizes for same-level headings across pages
- Buttons/cards with inconsistent border radius, padding, or glow treatments
- Icons at different sizes when they should be uniform

### Content consistency
- Hardcoded text that should come from content collections
- Hardcoded image paths that should be CMS-editable
- Duplicated content across files instead of single source of truth

### Responsiveness
- Any page breaks at 1440px, 1024px, 768px, or 390px
- Horizontal scrolling on mobile
- Touch targets below 44x44px
- WebGL/heavy animations not falling back on mobile or prefers-reduced-motion

### Accessibility
- Missing alt text on meaningful images
- Missing aria-hidden on decorative images
- Missing focus states or non-teal focus outlines
- Incorrect heading hierarchy (h1 skipped, multiple h1s, etc.)
- Contrast below WCAG AA on any text

### Code quality
- TypeScript errors or any-typed code
- Unused imports or dead code
- Components not reused where they should be (duplicated timelines, cards, etc.)
- Missing prefers-reduced-motion handling on any animation
- Console errors or warnings in production build

### Performance
- Images without explicit width/height
- Images not using Astro's <Image /> component
- JavaScript bundle per-page exceeding expected thresholds
- Unused dependencies in package.json

### CMS/content integrity
- Zod schemas that don't match the Decap CMS config
- Optional fields in CMS that aren't .optional() in Zod
- Image paths in content that point to non-existent files