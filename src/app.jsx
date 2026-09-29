// App shell: client-side router (History API) for the two routes — `/` (Hero →
// About → Stack → Projects → Repositories → Contact) and `/interests/` — plus
// the global layers (intro TV, custom cursor, command terminal, decrypting
// headings), scroll-spy and reveal-on-scroll. Loaded last by index.html.
(() => {
  gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

  /* Normalise any path to one of two routes */
  const routeOf = (p) => (p.startsWith('/interests') ? '/interests/' : '/');

  /* Retry-scroll to a hash target — sections mount after a route switch */
  function scrollToHash(hash) {
    const tryIt = (n) => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (n < 12) requestAnimationFrame(() => tryIt(n + 1));
    };
    tryIt(0);
  }

  /* ── Home route: hero + sections, scroll-spy + reveal ── */
  function HomeRoute() {
    const [active, setActive] = React.useState('home');

    React.useEffect(() => {
      const ids = ['home', 'about', 'stack', 'projects', 'repos', 'contact'];
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ids.forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

      const reveal = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -10% 0px' });
      document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

      // Stack creates its ScrollTrigger on mount; refresh once layout settles
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => { spy.disconnect(); reveal.disconnect(); cancelAnimationFrame(raf); };
    }, []);

    return (
      <>
        <Header active={active} />
        <main>
          <Hero />
          <div data-reveal><About /></div>
          <Stack />
          <div data-reveal><Projects /></div>
          <div data-reveal><Repositories /></div>
          <div data-reveal><Contact /></div>
        </main>
      </>
    );
  }

  /* ── Interests route ── */
  function InterestsRoute() {
    return (
      <>
        <Header active="interests" />
        <InterestsPage />
      </>
    );
  }

  /* ── Client-side router (History API) ── */
  function App() {
    const [route, setRoute] = React.useState(() => routeOf(window.location.pathname));
    const pendingScroll = React.useRef(null);

    /* The intro TV film plays on demand: the hero's "Get in touch" fires
       `ak:intro` (see Hero.jsx); `?intro` in the URL plays it on load (demos,
       screen recordings). The page stays where it was once the film ends. */
    const [intro, setIntro] = React.useState(() => new URLSearchParams(window.location.search).has('intro'));
    React.useEffect(() => {
      const play = () => setIntro(true);
      window.addEventListener('ak:intro', play);
      return () => window.removeEventListener('ak:intro', play);
    }, []);
    const endIntro = () => {
      setIntro(false);
      /* Stack's pin was measured under the intro's scroll lock — re-measure */
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    /* App is mounted and painted — dismiss the preloader */
    React.useEffect(() => {
      if (window.__akReady) requestAnimationFrame(() => window.__akReady());
    }, []);

    /* Intercept internal link clicks → pushState instead of full navigation */
    React.useEffect(() => {
      const onClick = (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a');
        if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
        const href = a.getAttribute('href');
        if (!href) return;
        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return;            // external
        const p = url.pathname;
        if (p !== '/' && p !== '/interests' && p !== '/interests/') return; // not routable → let browser handle
        e.preventDefault();

        const target = routeOf(p);
        const full = p + url.hash;
        if (target !== route) {
          window.history.pushState({}, '', full);
          pendingScroll.current = url.hash || 'top';
          setRoute(target);
        } else {
          window.history.pushState({}, '', full);
          if (url.hash) scrollToHash(url.hash);
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      document.addEventListener('click', onClick);
      return () => document.removeEventListener('click', onClick);
    }, [route]);

    /* Back / forward */
    React.useEffect(() => {
      const onPop = () => {
        pendingScroll.current = window.location.hash || 'top';
        setRoute(routeOf(window.location.pathname));
      };
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }, []);

    /* After a route change, consume the pending scroll intent */
    React.useEffect(() => {
      const s = pendingScroll.current;
      pendingScroll.current = null;
      if (s === 'top') window.scrollTo(0, 0);
      else if (s) scrollToHash(s);
    }, [route]);

    return (
      <>
        {/* Additive intro overlay — above everything, before the main content */}
        {intro && <IntroTV onFinish={endIntro} />}
        <CustomCursor />
        <CommandTerminal />
        <DecryptHeadings />
        {route === '/interests/' ? <InterestsRoute /> : <HomeRoute />}
      </>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
