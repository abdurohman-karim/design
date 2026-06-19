# Abdurohman Karim — Portfolio Design System

A strict-monochrome design system for the personal portfolio of **Abdurohman Karim**, a backend / full-stack developer in **fintech and payment systems** (PHP/Laravel + Python). The aesthetic is modern **crypto/web3 minimalism** — futuristic, technical, restrained, "expensive": black canvas, white light, grey gradients, thin grid texture, glass cards and a code-as-headline voice.

> **Always dark.** There is no light theme and no theme toggle — the system is monochrome and black by design.

---

## Sources & provenance

This system synthesizes two real inputs (store these for anyone with access):

- **Figma — "Portfolio 3.0.fig"** *(attached, but empty)*: the file contained no frames, components or variables, so nothing was extracted from it. Flagged for the user.
- **GitHub — [`abdurohman-karim/design`](https://github.com/abdurohman-karim/design)** *(attached, but empty)*: no commits / files. Flagged.
- **GitHub — [`abdurohman-karim/portfolio_layout`](https://github.com/abdurohman-karim/portfolio_layout)** *(the real source of truth)*: the developer's existing portfolio. We lifted the authentic signatures — **JetBrains Mono**, the **code-syntax section headers** (`echo "Welcome";`, `$_GET('About')`, `print('Skills')`, `console.log('Projects')`, `cout<<'Questions';`), the **Iconsax-style duotone line icons** (cube, code-branch, bar-chart, development…), and the lowercase **`abdurohmanKarim`** wordmark with bold initials.
- **GitHub — [`abdurohman-karim/portfolio_backend`](https://github.com/abdurohman-karim/portfolio_backend)**: the Laravel API backing the portfolio (Skills / Projects / Questions models). Useful for content structure.
- **Project brief** *(authoritative for visuals)*: re-skins the above to **strict monochrome / web3 minimalism** and defines the project content (uCash, NutriCore, video bot, e-commerce).

The original portfolio used cyan/purple/orange accents and Poppins. **The brief overrides this to monochrome**; we kept the developer's structural and typographic DNA and re-rendered it in black & white. Explore the repos above to build richer, more faithful designs.

---

## Content fundamentals

**Voice — a developer talking shop, in code.** Section titles are written as lines of code in whatever language fits the joke: `echo "Welcome";` (PHP), `$_GET('About')`, `print('Stack')` (Python), `console.log('Projects')` (JS), `cout << 'Contact';` (C++). This is the single most distinctive copy device — use it for every section header.

- **Person:** first person, understated. "I build payment platforms…", not "Abdurohman is a results-driven engineer." No marketing superlatives.
- **Casing:** sentence case for prose; **UPPERCASE mono** for kickers, labels, nav, button text, badges. The wordmark is lowercase with bold initials (**a**bdurohman**K**arim).
- **Technical specificity over fluff.** Name the real thing: "SBP (Faster Payments) integration", "weighted alpha-blending", "Control Number of Transfer (CNT)", "multi-provider LLM router". Concrete engineering detail *is* the selling point. Avoid generic data slop (vanity stats, filler percentages).
- **Mono for metadata:** stacks, dates, file-path-like captions, `//` comments (`// built with PHP, Python & coffee · 2025`).
- **Emoji:** none. (A lone `✓` check glyph or `→` arrow as a UI affordance is fine; decorative emoji are off-brand.)
- **Tone:** calm, precise, a little playful in the code headers — never loud.

---

## Visual foundations

**Palette — monochrome, no exceptions.** Pure black canvas (`#000`–`#0A0A0A`), white text/accents (`#FFFFFF`), and a grey ramp (`#1A1A1A · #2A2A2A · #6B6B6B · #A0A0A0 · #C4C4C4`) for borders, gradients and secondary text. **No hue, no neon, no colored gradients.** The only "color" is *white light* — a glow. See `tokens/colors.css`.

**Type.** Two families:
- **Space Grotesk** (geometric sans) — hero, display, headings, big numbers. Large and sparse, tight tracking (`-0.02 → -0.045em`), weight 500.
- **JetBrains Mono** (the dev's own mono) — all technical text: code headers, kickers, labels, nav, buttons, badges, stack chips. Wide tracking on uppercase (`0.16–0.24em`).
See `tokens/typography.css`.

**Backgrounds.** The signature surface is a **thin grid texture** — 1px lines on a 64px cell at ~3.5% white, dissolved into black with a radial mask (`.ak-grid-bg`). No photography, no illustration, no colored gradients. Depth comes from black shadows and a soft white radial glow behind the hero.

**Cards.** Glassmorphic: `var(--surface-card)` fill (4% white) + 1px hairline border (8% white) + `backdrop-filter: blur(16px)` + an inset top hairline highlight. Radius 16px (`--radius-lg`) — crisp, not pill-soft. On hover: lift 3–4px, border brightens to 18% white, and a **white glow halo** blooms (`--glow-halo-md`).

**Borders.** Everything is divided by hairlines, not boxes — `1px solid rgba(255,255,255,.06–.18)`. Sections are separated by full-width top hairlines.

**Shadows & glow.** Two systems: **black depth shadows** (`--shadow-sm…xl`) for elevation, and **white glow** (`--glow-halo-*`, `--glow-text`) for focus/hover/accent. Glow never has hue.

**Motion.** Smooth and quiet. `--ease-out` (`cubic-bezier(.16,1,.3,1)`), 160–500ms. Scroll-triggered fade-ups (opacity + 28px translate) via IntersectionObserver; smooth-scroll nav; subtle parallax glow. No bounce, no infinite loops on content. All gated on `prefers-reduced-motion`.

**Interaction states.** *Hover:* white border + white glow + slight lift; text muted→white; arrows nudge 2–3px. *Focus:* white underline/border + glow halo. *Press:* (buttons) translateY back to 0. No color shifts — only luminance.

**Layout.** Generous whitespace, `max-width: 1240px`, fluid `clamp()` padding, big `--section-gap` (80–180px). Asymmetric two-column rows (label / content). 8px spacing rhythm.

**Radii.** Restrained: 4 / 8 / 12 / 16 / 24px, pill for buttons & tags, full for the status dot. Crisp corners over heavy rounding.

---

## Iconography

The portfolio's icon system is **Iconsax-style duotone line icons** — 24px artboard, 2px stroke, round caps/joins, with an optional **0.24-opacity "ghost" fill** behind the stroke. They originate from the developer's `portfolio_layout` repo (`cube`, `code-branch`, `bar-chart`, `development`, `file-development`, `arrow-bottom-square`), where they were purple (`#5D5EFC` / `#5A6585`). We **recolored them to white** for the monochrome system — the originals (white) live in `assets/icons/*.svg`.

For UI and social needs not covered by the dev's set, the `Icon` component adds matching stroke icons in the same weight (`server`, `database`, `terminal`, `shield`, `bot`, `send`=Telegram, `github`, `mail`, `arrowUpRight`, `check`, …). All render with `currentColor`, so they inherit text colour and glow.

- **No emoji** as icons. A `→` arrow and `✓` check are used as text affordances only.
- Use `<Icon name="cube" duotone />` for the ghost-fill treatment; omit `duotone` for clean stroke.
- **Substitution flag:** the non-original UI/social glyphs are drawn to match the Iconsax weight but are not from the exact licensed set. Swap in the real Iconsax / brand SVGs for production if available.

---

## Fonts — substitution note

- **JetBrains Mono** — bundled locally (`assets/fonts/JetBrainsMono/*.ttf`, from the dev's repo). ✅
- **Space Grotesk** — loaded from **Google Fonts CDN** (no local binary shipped). If you need a fully offline/self-hosted system, drop the `.ttf`/`.woff2` files in `assets/fonts/SpaceGrotesk/` and replace the `@import` in `tokens/fonts.css` with `@font-face` rules. **Please confirm Space Grotesk is acceptable, or send a preferred display font.**

---

## Index / manifest

**Global CSS** (consumers link this one file): [`styles.css`](./styles.css) → imports:
- `tokens/fonts.css` — `@font-face` + Space Grotesk import
- `tokens/colors.css` — monochrome scale + semantic surfaces/borders/glow
- `tokens/typography.css` — families, scale, weights, roles
- `tokens/spacing.css` — 8px rhythm, layout, grid cell
- `tokens/effects.css` — radii, borders, shadows, glow, blur, motion
- `tokens/base.css` — reset, `.ak-grid-bg`, `.ak-kicker`, reduced-motion

**Components** (`window.AbdurohmanKarimPortfolioDesignSystem_bf6e8b.*`):
- `components/core/` — **Button, Tag, Badge, Card, Icon**
- `components/forms/` — **Input, Textarea**
- `components/content/` — **SectionHeading, StatCard, ProjectCard, SocialLink**

**UI kit:**
- `ui_kits/portfolio/` — the full interactive portfolio site (`index.html` + `Header/Hero/About/Stack/Projects/Contact.jsx`). This is the primary deliverable and reference screen.

**Foundations** (`guidelines/*.card.html`) — specimen cards shown in the Design System tab (Type, Colors, Spacing, Brand).

**Assets:**
- `assets/fonts/JetBrainsMono/` — mono webfonts
- `assets/icons/` — white Iconsax-style brand icons

**Other:** `SKILL.md` (Agent Skill wrapper).
