// Portfolio — Projects. console.log('Projects'), ProjectCards.
const { SectionHeading, ProjectCard } = window.DS;

const PROJECTS = [
  {
    index: 1, title: 'uCash', kind: 'Payments platform · Laravel / PHP',
    description: 'Money-transfer & payments platform with deep admin tooling and SBP (Faster Payments) integration.',
    features: [
      'Black / white-list system to block suspicious clients',
      'Universal transfer-method toggle (SBP & others) from admin — no hardcode',
      'Branch-load forecasting via weighted alpha-blending, with Excel export',
      'PDF receipt generator with Control Number of Transfer (CNT)',
      'Failed-transfer reason dashboard from JSON analysis',
    ],
    stack: ['PHP', 'Laravel', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    index: 2, title: 'NutriCore', kind: 'AI nutrition assistant · Python / Telegram',
    description: 'Telegram nutrition assistant powered by a multi-provider LLM router with flexible subscriptions.',
    features: [
      'Multi-provider LLM router (OpenAI, Groq, DeepSeek, OpenRouter)',
      'Free / Premium / Premium+ tiers via a feature registry',
      'Meal simulation with timezones and MealLog snapshots',
      'Tri-lingual support + admin panel',
    ],
    stack: ['Python', 'aiogram', 'PostgreSQL', 'Redis'],
  },
  {
    index: 3, title: 'Video Downloader Bot', kind: 'Telegram bot · aiogram 3 / yt-dlp',
    description: 'High-throughput Telegram bot that downloads Instagram / TikTok video with quality selection.',
    features: [
      'FSM-driven quality picker (Instagram / TikTok)',
      'Asyncio queue worker pool for high load',
      'Channel-subscription gating + multilingual UI',
      'aiosqlite-backed admin panel',
    ],
    stack: ['Python', 'aiogram', 'yt-dlp', 'aiosqlite'],
  },
  {
    index: 4, title: 'E-commerce Platform', kind: 'Storefront · Laravel',
    description: 'Laravel e-commerce build with Uzbekistan geodata and config-switchable ordering.',
    features: [
      'Uzbekistan geodata (regions / districts)',
      'OTP test users for QA flows',
      'Order-request system, toggleable via config',
    ],
    stack: ['PHP', 'Laravel', 'PostgreSQL'],
  },
];

function Projects() {
  return (
    <section id="projects" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={3} title="Projects"
          code={<><span style={{ color: 'var(--gray-400)' }}>console.log</span>(<span style={{ color: 'var(--gray-300)' }}>'Projects'</span>)</>}
          lede="Selected fintech & AI systems — payments, LLM routing, automation and storefronts." />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20, marginTop: 56, alignItems: 'stretch',
        }}>
          {PROJECTS.map((p) => <ProjectCard key={p.title} {...p} />)}
        </div>
      </div>
    </section>
  );
}
window.Projects = Projects;
window.__akProjects = PROJECTS; // data export for CommandTerminal's `ls projects` command
