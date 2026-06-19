The brand's signature section header — title written as a line of code.

```jsx
<SectionHeading
  index={3}
  title="Projects"
  code={<>console.log(<span style={{color:'var(--gray-300)'}}>'Projects'</span>)</>}
  lede="Selected fintech & AI systems — payments, LLM routing, automation."
/>
```

Use the dev's syntax motifs: `echo "Welcome";`, `$_GET('About')`, `print('Stack')`, `console.log('Projects')`, `cout<<'Contact';`. Wrap the string literal in a `<span>` tinted `var(--gray-300)`. `align="center"` for hero sections.
