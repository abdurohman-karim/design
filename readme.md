# Abdurohman Karim — portfolio (synetra.art)

The personal site of **Abdurohman Karim**, a backend / full-stack developer in **fintech and payment systems** (PHP/Laravel + Python). The aesthetic is strict-monochrome **crypto/web3 minimalism** — black canvas, white light, grey gradients, thin grid texture, glass cards and a code-as-headline voice.

A static single-page app served from [`index.html`](./index.html), with one Netlify Function for form notifications. No build step, no `package.json`: React and Babel-standalone come from a CDN and every `.jsx` file in `src/` is shipped as-is and transpiled in the browser.

> **Dark by default, not dark-only.** A full light theme (`[data-theme="light"]` in `styles/tokens/colors.css`) is toggled from the header and persisted in `localStorage`. Design for dark first, but any new UI must also work under `[data-theme="light"]`.

---

## Project structure

```
index.html                 shell: SEO head, preloader, script loading order
netlify.toml               publish ".", functions dir, SPA fallback (/* → /index.html)
netlify/functions/
  telegram-notify.js       Contact + Skyridge forms → Telegram
robots.txt · sitemap.xml · site.webmanifest · favicon.ico
assets/
  favicon/                 favicon + PWA icon set (sY monogram)
  fonts/JetBrainsMono/     mono webfont (Light … Bold)
  icons/interests/         line icons for the /interests cards (CSS-mask, currentColor)
  audio/tv-intro.mp3       intro TV sound
  tv.png                   intro TV set
styles/
  main.css                 entry point → imports the tokens
  tokens/                  fonts · colors (dark + light) · typography · spacing · effects · base
src/
  app.jsx                  router (/ and /interests/), global layers, scroll-spy, reveal
  lib/                     plain JS, loaded before the components
    notify.js              window.sendNotification() → the Netlify function
    motion.js              window.akMotion: decrypt scramble() + cursor-light CSS layers
    landmask.js            Natural Earth land mask for the hero globe (public domain)
  ui/                      shared building blocks
    primitives.jsx         window.DS: SectionHeading, Icon, Tag, Badge, Input, Textarea
    DecryptBtn.jsx         scramble/decrypt CTA button
    Heartbeat.jsx          live "API 200 · 41ms" status (footer)
  layout/                  app-wide layers
    Header.jsx             nav, theme toggle, mobile drawer
    IntroTV.jsx            CRT TV film, played by the hero's "Get in touch" (?intro plays it on load)
    CustomCursor.jsx       dot + ring; data-cursor="lock | drag | frame" + data-cursor-label
    CommandTerminal.jsx    Cmd/Ctrl+K terminal
    DecryptHeadings.jsx    scrambles section code-headers into view
  sections/                the home page, top to bottom
    Hero.jsx · About.jsx · Stack.jsx · Projects.jsx (+ ProjectPreviews.jsx) · Repositories.jsx · Contact.jsx
  pages/
    InterestsPage.jsx      /interests/ — ice cards + Skyridge join modal
```

**Load order matters.** `index.html` runs the scripts in sequence: CDN libraries (React, Babel, GSAP) → `src/lib/*` → `src/ui/*` → `src/layout/*` → `src/sections/*` → `src/pages/*` → `src/app.jsx`. Sections read `window.DS`, `window.akMotion` and `window.DecryptBtn` when they load, so anything they depend on must come earlier.

**All text/babel scripts share one global scope.** Wrap new files in an IIFE and expose what other files need on `window` (`window.Hero = Hero`). Babel runs with `data-presets="react"` (JSX only; everything else is native), and object-rest parameters (`({ a, ...rest })`) are avoided on purpose — Babel would hoist an `_excluded` helper into that shared scope where files overwrite each other; use `window.akOmit(props, keys)` instead.

## Routes

A tiny client-side router (History API, no library) in `src/app.jsx` switches between two routes:

- **`/`** — `Header → Hero → About → Stack → Projects → Repositories → Contact`, scroll-spied and revealed on scroll.
  - **Hero** — name with a variable-weight proximity effect; a dotted, lit, slowly turning globe (drag to spin); entrance after the preloader/intro, dissolves on scroll.
  - **About** — scroll-lit statement, `whoami --json` card with the live time in Fergana, odometer stats, and a request-flow diagram whose packet walks each engineering principle.
  - **Stack** — pinned GSAP "orbit": skill cards on a 3D arc turned by scroll, drag/flick (Draggable + Inertia), ←/→ or the tab row; a swipe carousel on phones, a static grid under reduced motion.
  - **Projects** — bento grid; every card has a live monochrome system preview (`ProjectPreviews.jsx`) and locks the cursor with corner brackets.
  - **Repositories** — `git ls-remote`: live GitHub API → stats, a `git log --graph` of every repo as a branch off main, and a filterable terminal listing (cached 10 min in sessionStorage).
  - **Contact** — the form is a `POST /api/contact` composer with a live JSON preview and a streamed 200/422/502 response; availability + channels; footer with heartbeat and back-to-top.
- **`/interests/`** — `Header → InterestsPage`: ice cards (veins, trapped air bubbles, cursor glint) that fracture like real ice under the pointer — jagged radial and spider-web ring cracks, tilted facets, crush zone, stick–slip growth, chips flying toward the viewer — and refreeze on leave; the **Skyridge** card opens a join-request modal.

An inline preloader (`#ak-preloader` in `index.html`, no React dependency) paints instantly while the CDN scripts load and is dismissed via `window.__akReady()` once `<App>` has mounted — with an 8 s safety timeout so a slow/failed script never traps the user.

---

## Integrations — Telegram form notifications

Both forms on the site — the **Contact** section on `/` and the **Skyridge join** form inside the `/interests` modal — submit to the same Netlify Function, [`netlify/functions/telegram-notify.js`](./netlify/functions/telegram-notify.js), via the shared client helper [`src/lib/notify.js`](./src/lib/notify.js) (`window.sendNotification(payload)`).

- The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from **Netlify environment variables** — never from client code, so the bot token is never exposed in the browser.
- A `type` field (`"contact"` or `"skyridge"`) picks the message template and required fields, so the two flows are easy to tell apart in the chat: `📩 New contact message` (name/email/message) vs. `🏔 New Skyridge join request` (name/phone/optional message).
- User-supplied text is HTML-escaped before being sent with `parse_mode: HTML`.
- Both forms are plain, no-dependency React forms with an `idle → sending → sent/error` state and `autoComplete="off"` on every field; Contact also validates client-side (422-style messages) before sending.

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

**Local development.** Any static server works, but it needs the same SPA fallback as Netlify for `/interests/`: the `site-2020` configuration in `.claude/launch.json` is a small Python server that does that (and disables caching) on http://localhost:2020. Forms can't be sent locally — there is no Netlify Function there, so Contact shows its 502 state.

---

## Sources & provenance

This system was synthesized from the developer's existing portfolio — **GitHub [`abdurohman-karim/portfolio_layout`](https://github.com/abdurohman-karim/portfolio_layout)** — which supplied the authentic signatures now baked into this repo: **JetBrains Mono**, the **code-syntax section headers** (`echo "Welcome";`, `$_GET('About')`, `print('Skills')`, `console.log('Projects')`, `cout<<'Contact';`), and the **Iconsax-style duotone line icons** (`cube`, `code-branch`, …) whose paths now live inline in `Icon`. **GitHub [`abdurohman-karim/portfolio_backend`](https://github.com/abdurohman-karim/portfolio_backend)** (Laravel API — Skills/Projects/Questions) informed the content structure; `Repositories.jsx` fetches the developer's live repos straight from the GitHub API (`api.github.com/users/abdurohman-karim/repos`) rather than hardcoding them.

The original portfolio used cyan/purple/orange accents and Poppins; this system re-skins it to **strict monochrome / web3 minimalism** per the project brief, keeping the structural and typographic DNA.

**Brand:** the `sY` monogram and `syneTra` wordmark are used everywhere — header, preloader, favicon set and footer.

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

**Palette — monochrome, no exceptions.** Pure black canvas (`#000`–`#0A0A0A`), white text/accents (`#FFFFFF`), and a grey ramp (`#1A1A1A · #2A2A2A · #6B6B6B · #A0A0A0 · #C4C4C4`) for borders, gradients and secondary text in dark mode; the light theme flips this to near-black text on white/near-white surfaces using the *same* variable names (`styles/tokens/colors.css`, `[data-theme="light"]`). **No hue, no neon, no colored gradients** in either theme. The only "color" is *white (or black) light* — a glow.

**Type.** Two families:
- **Space Grotesk** (geometric sans) — hero, display, headings, big numbers. Large and sparse, tight tracking (`-0.02 → -0.045em`), weight 500.
- **JetBrains Mono** (the dev's own mono) — all technical text: code headers, kickers, labels, nav, buttons, badges, stack chips. Wide tracking on uppercase (`0.16–0.24em`).
See `tokens/typography.css`.

**Backgrounds.** The signature surface is a **thin grid texture** — 1px lines on a 64px cell at ~3.5% white, dissolved into black with a radial mask (`.ak-grid-bg`). No photography, no illustration, no colored gradients. Depth comes from black shadows and a soft white radial glow behind the hero.

**Cards.** Glassmorphic: `var(--surface-card)` fill (4% white) + 1px hairline border (8% white) + `backdrop-filter: blur(16px)` + an inset top hairline highlight. Radius 16px (`--radius-lg`) — crisp, not pill-soft. On hover: lift 3–4px, border brightens to 18% white, and a **white glow halo** blooms (`--glow-halo-md`). The `/interests` ice cards are a themed variant that fractures procedurally under the pointer (see Routes).

**Borders.** Everything is divided by hairlines, not boxes — `1px solid rgba(255,255,255,.06–.18)`. Sections are separated by full-width top hairlines.

**Shadows & glow.** Two systems: **black depth shadows** (`--shadow-sm…xl`) for elevation, and **white glow** (`--glow-halo-*`, `--glow-text`) for focus/hover/accent. Glow never has hue.

**Motion.** Smooth and quiet. `--ease-out` (`cubic-bezier(.16,1,.3,1)`), 160–500ms. Scroll-triggered fade-ups (opacity + 28px translate) via IntersectionObserver; smooth-scroll nav; subtle parallax glow. No bounce, no infinite loops on content — the one exception is the Projects system previews, which loop only while their card is on screen. All gated on `prefers-reduced-motion`.

**Interaction states.** *Hover:* white border + white glow + slight lift; text muted→white; arrows nudge 2–3px. *Focus:* white underline/border + glow halo — form fields have `appearance: none` + an autofill override (`styles/tokens/base.css`) so Safari/Chrome native chrome never bleeds through the custom underline. *Press:* (buttons) translateY back to 0. No color shifts — only luminance.

**Layout.** Generous whitespace, `max-width: 1240px`, fluid `clamp()` padding, big `--section-gap` (80–180px). Asymmetric two-column rows (label / content). 8px spacing rhythm.

**Radii.** Restrained: 4 / 8 / 12 / 16 / 24px, pill for buttons & tags, full for the status dot. Crisp corners over heavy rounding.

**Modals.** Fixed overlay, backdrop blur, centered panel — but the *overlay* itself scrolls (`overflow-y: auto`, `align-items: flex-start`) and background scroll is locked via `document.body.style.overflow = 'hidden'` while open. This matters on short mobile viewports where a form + CTA can be taller than the screen (see `SkyridgeModal` in `src/pages/InterestsPage.jsx`).

---

## Iconography

The core set is **Iconsax-style duotone line icons** — 24px artboard, 2px stroke, round caps/joins, with an optional **0.24-opacity "ghost" fill** behind the stroke — from the developer's `portfolio_layout` repo, recolored to white. Their paths are inlined in the `Icon` component (`src/ui/primitives.jsx`) together with matching stroke icons for UI and social needs (`server`, `database`, `terminal`, `shield`, `bot`, `send`=Telegram, `github`, `mail`, `arrowUpRight`, `check`, …). All render with `currentColor`.

A second, page-specific set lives in `assets/icons/interests/` (`ice-axe`, `crampon`, `carabiner`, `helmet`, `rope`, `peak`) — rendered via CSS `mask-image` so they inherit `currentColor` and follow the active theme.

- **No emoji** as UI icons. A `→` arrow and `✓` check are used as text affordances only (Telegram notifications are the exception — see Integrations).
- `<Icon name="cube" duotone />` for the ghost-fill treatment; omit `duotone` for a clean stroke.
- **Substitution flag (still open):** the non-original UI/social glyphs are drawn to match the Iconsax weight but are not from the exact licensed set.

---

## Fonts

- **JetBrains Mono** — bundled locally (`assets/fonts/JetBrainsMono/`, Light → Bold), declared in `styles/tokens/fonts.css`.
- **Space Grotesk** — loaded from **Google Fonts** (`styles/tokens/fonts.css`, variable weight 300–700 — the hero name animates it). For a fully self-hosted setup, drop the files in `assets/fonts/SpaceGrotesk/` and replace the `@import` with `@font-face` rules.

---

## Intro TV sound

The hero's **Get in touch** plays a ~14.7 s film, every click (the button fires `ak:intro`, `src/app.jsx` mounts the film; the page stays where it was afterwards). It runs on one GSAP timeline; its clock is `AK_T` at the top of `src/layout/IntroTV.jsx`: power-on flash 0.30 s → logo + static 0.80 s → camera dolly-in 1.45 s → screen fills the frame 3.70 s → through the glass, reel inside the screen 4.45 / 6.30 / 8.20 s → pull-out 10.0–11.9 s → short-circuit pops 12.25 / 12.65 / 13.05 s → collapse 13.2 s → fade-out 14.1–14.7 s. Add `?intro` to the URL to play it on load (demos, screen recordings). Any key or click skips it.

`assets/audio/tv-intro.mp3` is played as cues along that timeline (`AK_TV_AUDIO.cues`: when on the timeline, where in the clip, how long). The current 2.8 s clip is cut in two — its power-on thump + hum opens the film, its crackle returns for the short circuit; the reel in between is silent. For a full soundtrack, mix one clip to the timeline above and set `cues: [[0, 0, AK_T.end]]`. The sound stops on skip and when the intro ends; a missing file just stays silent. Started from the button click the sound plays; with `?intro` on a hard reload the browser's autoplay policy may mute it — expected, not a bug.
