---
name: abdurohman-karim-design
description: Use this skill to generate well-branded interfaces and assets for Abdurohman Karim's portfolio brand — a strict-monochrome, crypto/web3-minimal aesthetic for a fintech backend developer. Use for production or throwaway prototypes/mocks. Contains design guidelines, colors, type, fonts, icons, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill for the full design guide (content fundamentals, visual foundations, iconography, manifest), then explore the other files.

Quick orientation:
- **The brand is strict monochrome** — black canvas, white text/accents, grey scale only. No hue, no neon, no colored gradients. Always dark; no theme toggle.
- **Type:** Space Grotesk (display/headings) + JetBrains Mono (all technical text, labels, code headers).
- **Signature voice:** section titles written as code — `echo "Welcome";`, `$_GET('About')`, `print('Stack')`, `console.log('Projects')`, `cout << 'Contact';`.
- **Surfaces:** thin grid texture (`.ak-grid-bg`), glassmorphic cards with hairline borders, white-glow hover (no hue).
- **Tokens:** link `styles.css` to get every CSS custom property and font.
- **Components** live under `components/` (Button, Tag, Badge, Card, Icon, Input, Textarea, SectionHeading, StatCard, ProjectCard, SocialLink). The full portfolio reference is `ui_kits/portfolio/index.html`.
- **Icons:** Iconsax-style duotone line icons in `assets/icons/`, plus the `Icon` component.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
