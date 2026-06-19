Monochrome call-to-action button with white-glow hover — use for primary actions (Apply, Contact, View project) and secondary navigation.

```jsx
<Button variant="primary" size="lg" arrow>Get in touch</Button>
<Button variant="secondary" arrow as="a" href="#projects">View work</Button>
<Button variant="ghost" size="sm">Resume</Button>
```

Variants: `primary` (solid white on black, glow halo), `secondary` & `outline` (glass hairline, border lights up white on hover), `ghost` (text only). Sizes: `sm` `md` `lg`. Set `arrow` for a trailing →, `full` for block width, `as="a"` to render a link.
