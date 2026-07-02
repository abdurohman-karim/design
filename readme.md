# Abdurohman Karim — Portfolio Design System

A strict-monochrome design system **and its live implementation** for the personal portfolio of **Abdurohman Karim**, a backend / full-stack developer in **fintech and payment systems** (PHP/Laravel + Python). The aesthetic is modern **crypto/web3 minimalism** — futuristic, technical, restrained, "expensive": black canvas, white light, grey gradients, thin grid texture, glass cards and a code-as-headline voice.

This repo is both the design-system deliverable (tokens, components, guideline cards) and the actual deployed site: a static single-page app served from [`index.html`](./index.html), with one Netlify Function for form notifications. Live at **synetra.art**.

> **Dark by default, not dark-only.** The system ships a full light theme (`[data-theme="light"]` in `tokens/colors.css`) toggled from the header and persisted in `localStorage`. Design *for* dark first — it's still the primary, most-tested surface — but any new UI must also work under `[data-theme="light"]`.

---

## Site structure & routes

The whole site is one HTML shell (`index.html`) that loads React + Babel-standalone from CDN, `_ds_bundle.js` (the compiled design-system components) and each section as an un-bundled `.jsx` file transpiled in-browser — there's no build step or `package.json`; every `<script type="text/babel">` is the shipped source.

A tiny client-side router (History API, no library) in `index.html` switches between two routes based on `pathname`:

- **`/`** — `HomeRoute`: `Header → Hero → About → Stack → Projects → Repositories → Contact`, each section (`ui_kits/portfolio/*.jsx`) scroll-spied and revealed via `IntersectionObserver`. `Stack.jsx` drives a GSAP/ScrollTrigger card-deck.
- **`/interests`** — `InterestsRoute`: `Header → InterestsPage` (`interests/InterestsPage.jsx`), a "Mountains & Ice" page — six procedurally-cracking ice cards (canvas-free, pure SVG path generation + CSS) covering mountaineering/climbing, plus a **Skyridge** club card that opens a join-request modal.

Shared across both routes: `CustomCursor.jsx` (magnetic frame cursor, desktop only), `Header.jsx` (fixed nav, glass-on-scroll, monogram logo, theme toggle, mobile drawer), `DecryptBtn.jsx` (the cyberpunk scramble/decrypt CTA button used everywhere a primary action appears).

An inline preloader (`#ak-preloader` in `index.html`, no React dependency) paints instantly, drives a fake progress bar while the CDN scripts load, and calls `window.__akReady()` once `<App>` has mounted and painted — with an 8s safety timeout so a slow/failed script never traps the user.

Netlify's SPA fallback (`netlify.toml`) rewrites any unmatched path to `/index.html` so direct loads/refreshes of `/interests` still resolve.

---

## Integrations — Telegram form notifications

Both forms on the site — the **Contact** section on `/` and the **Skyridge join** form inside the `/interests` modal — submit to the same Netlify Function, [`netlify/functions/telegram-notify.js`](./netlify/functions/telegram-notify.js), via the shared client helper [`assets/js/notify.js`](./assets/js/notify.js) (`window.sendNotification(payload)`).

- The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from **Netlify environment variables** — never from client code, so the bot token is never exposed in the browser.
- A `type` field (`"contact"` or `"skyridge"`) picks the message template and required fields, so the two flows are easy to tell apart in the chat: `📩 New contact message` (name/email/message) vs. `🏔 New Skyridge join request` (name/phone/optional message).
- User-supplied text is HTML-escaped before being sent with `parse_mode: HTML`.
- Both forms are plain, no-dependency React forms (`FormData`, not controlled inputs) with `idle → sending → sent/error` state and `autoComplete="off"` on every field.

**Required setup before forms work in production:** in Netlify → Site settings → Environment variables, set `TELEGRAM_BOT_TOKEN` (from [@BotFather](https://t.me/BotFather)) and `TELEGRAM_CHAT_ID` (the chat that should receive notifications).

---

## SEO & metadata

`index.html` carries a full metadata head: `description`/`keywords`/`author`/`robots`, a canonical URL, Open Graph + Twitter Card tags, and a `Person` JSON-LD block — all pointed at `https://synetra.art/`. Alongside it:

- [`robots.txt`](./robots.txt) + [`sitemap.xml`](./sitemap.xml) (both routes, `/` and `/interests`).
- [`site.webmanifest`](./site.webmanifest) — PWA name/icons/theme-color for `standalone` installs.
- A full favicon set under `assets/favicon/` (`favicon.svg`, `favicon.ico`, 16/32/48px PNGs, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) — all generated from the same mark used in the preloader (`sY` monogram, black rounded square, Space Grotesk 600).

If the production domain ever changes, update it in five places: `index.html` (canonical + OG/Twitter + JSON-LD), `robots.txt`, `sitemap.xml`.

---

## Deployment

Static hosting on **Netlify** (`netlify.toml`): `publish = "."`, functions in `netlify/functions`, `/*` rewritten to `/index.html` for the SPA. No build command — the site ships as-is, Babel-standalone transpiles JSX at runtime in the browser. The only server-side piece is the Telegram notify function (Node, no dependencies, uses the platform's built-in `fetch`).

---

## Sources & provenance

This system was synthesized from the developer's existing portfolio — **GitHub [`abdurohman-karim/portfolio_layout`](https://github.com/abdurohman-karim/portfolio_layout)** — which supplied the authentic signatures now baked into this repo: **JetBrains Mono**, the **code-syntax section headers** (`echo "Welcome";`, `$_GET('About')`, `print('Skills')`, `console.log('Projects')`, `cout<<'Contact';`), and the **Iconsax-style duotone line icons** (`cube`, `code-branch`, `bar-chart`, `development`, `file-development`, `arrow-bottom-square`). **GitHub [`abdurohman-karim/portfolio_backend`](https://github.com/abdurohman-karim/portfolio_backend)** (Laravel API — Skills/Projects/Questions) informed the content structure; `Repositories.jsx` fetches the developer's live repos straight from the GitHub API (`api.github.com/users/abdurohman-karim/repos`) rather than hardcoding them.

The original portfolio used cyan/purple/orange accents and Poppins; this system re-skins it to **strict monochrome / web3 minimalism** per the project brief, keeping the structural and typographic DNA.

**Known naming inconsistency:** the live header/preloader/favicon all use the **`sY` monogram** and **`syneTra`** wordmark (`Header.jsx`), while the `Contact.jsx` footer and `guidelines/brand-logo.card.html` still show the earlier **`aK` / `abdurohmanKarim`** mark. Both exist in the codebase today — pick one and reconcile before shipping further brand touchpoints.

---

## Content fundamentals

**Voice — a developer talking shop, in code.** Section titles are written as lines of code in whatever language fits the joke: `echo "Welcome";` (PHP), `$_GET('About')`, `print('Stack')` (Python), `console.log('Projects')` (JS), `cout << 'Contact';` (C++). This is the single most distinctive copy device — use it for every section header.

- **Person:** first person, understated. "I build payment platforms…", not "Abdurohman is a results-driven engineer." No marketing superlatives.
- **Casing:** sentence case for prose; **UPPERCASE mono** for kickers, labels, nav, button text, badges.
- **Technical specificity over fluff.** Name the real thing: "SBP (Faster Payments) integration", "weighted alpha-blending", "Control Number of Transfer (CNT)", "multi-provider LLM router". Concrete engineering detail *is* the selling point. Avoid generic data slop (vanity stats, filler percentages) — the same rule applies off-topic too: the `/interests` page names real grades and techniques (WI3–WI5 ice, CT/ECT snowpack tests, Prusiks/Munter hitches) instead of generic "I like climbing" copy.
- **Mono for metadata:** stacks, dates, file-path-like captions, `//` comments (`// built with PHP, Python & coffee · 2025`).
- **Emoji:** none in body copy. (A lone `✓` check glyph or `→` arrow as a UI affordance is fine; Telegram notification messages are the one place emoji are used deliberately, to scan-differentiate message types.)
- **Tone:** calm, precise, a little playful in the code headers — never loud.
- **Language:** English throughout, including `/interests` (translated from an earlier Russian draft — if you find Cyrillic content anywhere, it's stale and should be translated).

---

## Visual foundations

**Palette — monochrome, no exceptions.** Pure black canvas (`#000`–`#0A0A0A`), white text/accents (`#FFFFFF`), and a grey ramp (`#1A1A1A · #2A2A2A · #6B6B6B · #A0A0A0 · #C4C4C4`) for borders, gradients and secondary text in dark mode; the light theme flips this to near-black text on white/near-white surfaces using the *same* variable names (`tokens/colors.css`, `[data-theme="light"]`). **No hue, no neon, no colored gradients** in either theme. The only "color" is *white (or black) light* — a glow.

**Type.** Two families:
- **Space Grotesk** (geometric sans) — hero, display, headings, big numbers. Large and sparse, tight tracking (`-0.02 → -0.045em`), weight 500.
- **JetBrains Mono** (the dev's own mono) — all technical text: code headers, kickers, labels, nav, buttons, badges, stack chips. Wide tracking on uppercase (`0.16–0.24em`).
See `tokens/typography.css`.

**Backgrounds.** The signature surface is a **thin grid texture** — 1px lines on a 64px cell at ~3.5% white, dissolved into black with a radial mask (`.ak-grid-bg`). No photography, no illustration, no colored gradients. Depth comes from black shadows and a soft white radial glow behind the hero.

**Cards.** Glassmorphic: `var(--surface-card)` fill (4% white) + 1px hairline border (8% white) + `backdrop-filter: blur(16px)` + an inset top hairline highlight. Radius 16px (`--radius-lg`) — crisp, not pill-soft. On hover: lift 3–4px, border brightens to 18% white, and a **white glow halo** blooms (`--glow-halo-md`). The `/interests` ice cards are a themed variant: procedural SVG crack lines + particle "dust" burst on hover/tap, generated fresh per card on mount.

**Borders.** Everything is divided by hairlines, not boxes — `1px solid rgba(255,255,255,.06–.18)`. Sections are separated by full-width top hairlines.

**Shadows & glow.** Two systems: **black depth shadows** (`--shadow-sm…xl`) for elevation, and **white glow** (`--glow-halo-*`, `--glow-text`) for focus/hover/accent. Glow never has hue.

**Motion.** Smooth and quiet. `--ease-out` (`cubic-bezier(.16,1,.3,1)`), 160–500ms. Scroll-triggered fade-ups (opacity + 28px translate) via IntersectionObserver; smooth-scroll nav; subtle parallax glow. No bounce, no infinite loops on content. All gated on `prefers-reduced-motion`.

**Interaction states.** *Hover:* white border + white glow + slight lift; text muted→white; arrows nudge 2–3px. *Focus:* white underline/border + glow halo — form fields have `appearance: none` + an autofill override (`tokens/base.css`) so Safari/Chrome native chrome never bleeds through the custom underline. *Press:* (buttons) translateY back to 0. No color shifts — only luminance.

**Layout.** Generous whitespace, `max-width: 1240px`, fluid `clamp()` padding, big `--section-gap` (80–180px). Asymmetric two-column rows (label / content). 8px spacing rhythm.

**Radii.** Restrained: 4 / 8 / 12 / 16 / 24px, pill for buttons & tags, full for the status dot. Crisp corners over heavy rounding.

**Modals.** Fixed overlay, backdrop blur, centered panel — but the *overlay* itself scrolls (`overflow-y: auto`, `align-items: flex-start`) and background scroll is locked via `document.body.style.overflow = 'hidden'` while open. This matters on short mobile viewports where a form + CTA can be taller than the screen (see `SkyridgeModal` in `interests/InterestsPage.jsx`).

---

## Iconography

The portfolio's core icon system is **Iconsax-style duotone line icons** — 24px artboard, 2px stroke, round caps/joins, with an optional **0.24-opacity "ghost" fill** behind the stroke. They originate from the developer's `portfolio_layout` repo (`cube`, `code-branch`, `bar-chart`, `development`, `file-development`, `arrow-bottom-square`), recolored to white; the originals live in `assets/icons/*.svg` (and are duplicated at `assets/*.svg` for the design-system card previews).

A second, page-specific set lives at `assets/icons/interests/` (`ice-axe`, `crampon`, `carabiner`, `helmet`, `rope`, `peak`) — line icons for the `/interests` mountaineering cards, rendered via CSS `mask-image` so they inherit `currentColor` and follow the active theme.

For UI and social needs not covered by either set, the `Icon` component (`components/core/Icon.jsx`) adds matching stroke icons in the same weight (`server`, `database`, `terminal`, `shield`, `bot`, `send`=Telegram, `github`, `mail`, `arrowUpRight`, `check`, …). All render with `currentColor`, so they inherit text colour and glow.

- **No emoji** as UI icons. A `→` arrow and `✓` check are used as text affordances only (Telegram notifications are the exception — see Integrations).
- Use `<Icon name="cube" duotone />` for the ghost-fill treatment; omit `duotone` for clean stroke.
- **Substitution flag (still open):** the non-original UI/social glyphs are drawn to match the Iconsax weight but are not from the exact licensed set. Swap in the real Iconsax / brand SVGs for production if available.

---

## Fonts

- **JetBrains Mono** — bundled locally (`assets/fonts/JetBrainsMono/*.ttf`, from the dev's repo).
- **Space Grotesk** — loaded from **Google Fonts CDN** (`tokens/fonts.css`, no local binary shipped). This has been the running choice throughout the build; if a fully offline/self-hosted system is ever required, drop `.ttf`/`.woff2` files in `assets/fonts/SpaceGrotesk/` and replace the `@import` with `@font-face` rules.

---

## Index / manifest

**Entry point:** [`index.html`](./index.html) — the deployed shell: preloader, full SEO head, client router, all `<script type="text/babel">` section loads. (`ui_kits/portfolio/index.html` is a separate, simpler standalone preview of just the home-route sections, used by the design-system tooling's card viewer — not the deployed page.)

**Global CSS** (consumers link this one file): [`styles.css`](./styles.css) → imports:
- `tokens/fonts.css` — `@font-face` + Space Grotesk import
- `tokens/colors.css` — monochrome scale + semantic surfaces/borders/glow, dark + light theme
- `tokens/typography.css` — families, scale, weights, roles
- `tokens/spacing.css` — 8px rhythm, layout, grid cell
- `tokens/effects.css` — radii, borders, shadows, glow, blur, motion
- `tokens/base.css` — reset, `.ak-grid-bg`, `.ak-kicker`, form-field appearance/autofill reset, reduced-motion

**Components** (compiled into `_ds_bundle.js`, exposed as `window.AbdurohmanKarimPortfolioDesignSystem_bf6e8b.*` / `window.DS`):
- `components/core/` — **Button, Tag, Badge, Card, Icon**
- `components/forms/` — **Input, Textarea**
- `components/content/` — **SectionHeading, StatCard, ProjectCard, SocialLink**

`_ds_bundle.js` and `_ds_manifest.json` are generated build artifacts of the design-sync tooling (source: `components/**/*.jsx`) — edit the `.jsx` sources, not the bundle, and expect it to be regenerated rather than hand-patched.

**Pages (`ui_kits/portfolio/` + `interests/`):**
- `Header.jsx` — fixed nav, glass-on-scroll, `sY`/`syneTra` logo, theme toggle, mobile drawer
- `Hero.jsx`, `About.jsx`, `Stack.jsx` (GSAP card deck), `Projects.jsx`, `Repositories.jsx` (live GitHub API), `Contact.jsx` (form → Telegram)
- `CustomCursor.jsx` — magnetic frame cursor overlay
- `DecryptBtn.jsx` — shared scramble/decrypt CTA button (works as a React component or auto-init'd on any `.decrypt-btn` element)
- `interests/InterestsPage.jsx` — "Mountains & Ice" page: procedural ice-crack cards + Skyridge join-form modal

**Backend:**
- `netlify/functions/telegram-notify.js` — the one server-side function (Contact + Skyridge → Telegram)
- `assets/js/notify.js` — shared `window.sendNotification()` client helper

**Foundations** (`guidelines/*.card.html`) — specimen cards shown in the design-system tab (Type, Colors, Spacing, Brand/Logo, Grid, Code headers).

**Assets:**
- `assets/fonts/JetBrainsMono/` — mono webfonts
- `assets/icons/` — white Iconsax-style brand icons (+ `interests/` subfolder for the mountaineering set)
- `assets/favicon/` — full favicon/PWA icon set

**SEO/config:** `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.ico`, `netlify.toml`

**Other:** `SKILL.md` (Agent Skill wrapper — points here for the full design guide).
