Showcase card for a portfolio project — glass surface, hover glow, key features + stack tags.

```jsx
<ProjectCard
  index={1}
  title="uCash"
  kind="Payments platform · Laravel"
  description="Money-transfer & payments platform with admin tooling and SBP integration."
  features={[
    'Black/white-list client blocking',
    'Toggleable transfer methods (SBP) without hardcode',
    'Branch-load forecasting with Excel export',
    'PDF receipts with Control Number of Transfer (CNT)',
  ]}
  stack={['PHP', 'Laravel', 'PostgreSQL', 'Redis']}
/>
```

Composes `Tag` and `Icon`. The whole card is a link; arrow and border light up white on hover.
