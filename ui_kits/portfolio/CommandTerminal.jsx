// CommandTerminal — hidden mini-terminal overlay (Cmd+K / Ctrl+K). Additive layer:
// regular Header / links / scroll keep working; this is a parallel nav surface.
// Navigation reuses the existing History API router in index.html by clicking a
// synthetic <a> that its document-level click interceptor picks up — no new router.
// Command registry is a whitelist; no eval, no network beyond the GitHub API
// source already used by Repositories.jsx.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-term-css')) {
    const s = document.createElement('style');
    s.id = 'ak-term-css';
    s.textContent = `
      .ak-term-overlay {
        position: fixed; inset: 0; z-index: var(--z-overlay);
        display: flex; align-items: flex-start; justify-content: center;
        padding: min(14vh, 140px) var(--container-pad) 24px;
        background: var(--header-bg); /* theme-aware scrim (dark/light flips in index.html) */
        backdrop-filter: blur(var(--blur-md));
        -webkit-backdrop-filter: blur(var(--blur-md));
        animation: ak-term-fade var(--dur-fast) var(--ease-out);
      }
      .ak-term-panel {
        width: 100%; max-width: 640px;
        height: min(56vh, 480px);
        display: flex; flex-direction: column;
        border-radius: var(--radius-lg);
        border: var(--hairline-strong);
        background: var(--surface-card);
        backdrop-filter: blur(var(--blur-lg));
        -webkit-backdrop-filter: blur(var(--blur-lg));
        box-shadow: var(--shadow-lg), var(--inset-hairline);
        overflow: hidden;
        font-family: var(--font-mono);
        animation: ak-term-pop var(--dur-base) var(--ease-out);
      }
      @keyframes ak-term-fade { from { opacity: 0; } }
      @keyframes ak-term-pop  { from { opacity: 0; transform: translateY(14px) scale(0.985); } }

      .ak-term-bar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px;
        border-bottom: var(--hairline);
        font-size: var(--text-3xs); letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--text-muted);
        flex-shrink: 0;
      }
      .ak-term-out {
        flex: 1; overflow-y: auto;
        padding: 14px 16px;
        font-size: var(--text-2xs); line-height: 1.75;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: var(--white-a18) transparent;
      }
      .ak-term-out::-webkit-scrollbar { width: 6px; }
      .ak-term-out::-webkit-scrollbar-thumb { background: var(--white-a18); border-radius: 3px; }
      .ak-term-out::-webkit-scrollbar-track { background: transparent; }
      .ak-term-line { white-space: pre-wrap; overflow-wrap: anywhere; }
      .ak-term-line--in  { color: var(--text-primary); }
      .ak-term-line--out { color: var(--text-secondary); }
      .ak-term-line--sys { color: var(--text-muted); }
      .ak-term-line--err { color: var(--text-primary); }
      .ak-term-prompt { color: var(--text-muted); }

      .ak-term-row {
        display: flex; align-items: baseline; gap: 8px;
        padding: 12px 16px;
        border-top: var(--hairline);
        font-size: var(--text-2xs);
        flex-shrink: 0;
      }
      .ak-term-input {
        flex: 1; min-width: 0;
        background: transparent; border: none; outline: none;
        font-family: var(--font-mono); font-size: var(--text-2xs);
        color: var(--text-primary);
        caret-color: var(--white);
        padding: 0;
      }

      /* Discreet touch-device affordance — Cmd+K has no equivalent there.
         Hidden entirely on pointer devices; optional, never blocks layout. */
      .ak-term-fab { display: none; }
      @media (hover: none) {
        .ak-term-fab {
          position: fixed; right: 16px; bottom: 16px; z-index: 90; /* below header */
          display: grid; place-items: center;
          width: 38px; height: 38px;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--surface-card);
          backdrop-filter: blur(var(--blur-sm));
          -webkit-backdrop-filter: blur(var(--blur-sm));
          font-family: var(--font-mono); font-size: 11px;
          color: var(--text-faint);
          cursor: pointer; opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(s);
  }

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Router bridge — reuse the History API router in index.html ─────────
     Its document-level click handler intercepts same-origin anchor clicks and
     does pushState + setRoute + hash scroll; a synthetic click on a temporary
     anchor routes exactly like a user click, so no second router exists. */
  function routerNavigate(href) {
    const a = document.createElement('a');
    a.href = href;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ── Content (mirrors on-page copy; stack/projects come from live exports) ── */
  const SECTIONS = ['home', 'about', 'stack', 'projects', 'repos', 'contact'];
  const WHOAMI =
    'Abdurohman Karim — backend / full-stack developer · fintech & payment systems';
  const ABOUT_TEXT =
    'Backend / full-stack developer in fintech and payment systems. I design APIs, ' +
    'payment platforms and banking integrations — including SBP (Faster Payments) — ' +
    'and multi-provider AI services.';

  const stackGroups = () => window.__akStackGroups || [];
  const projectList = () =>
    (window.__akProjects || []).map((p) => `${p.title} · ${p.kind}`);

  /* ── GitHub repos — same source + filtering as Repositories.jsx, cached ── */
  let reposPromise = null;
  function fetchRepos() {
    if (!reposPromise) {
      reposPromise = fetch('https://api.github.com/users/abdurohman-karim/repos?per_page=100&sort=stars')
        .then((r) => r.json())
        .then((data) => {
          if (!Array.isArray(data)) throw new Error('unexpected GitHub API response');
          return data
            .filter((r) => !r.fork && r.name !== 'abdurohman-karim')
            .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name));
        })
        .catch((err) => { reposPromise = null; throw err; });
    }
    return reposPromise;
  }

  /* ── Command registry — whitelist, name -> { desc, run(args, ctx) } ──────
     run returns string | string[] | Promise<string|string[]> | undefined.
     ctx: { print(text, type), clear(), close(), closeThenNavigate(href) } */
  const COMMANDS = {
    help: {
      desc: 'list available commands',
      run: () =>
        Object.entries(COMMANDS).map(([name, c]) => `${name.padEnd(9)}${c.desc}`),
    },
    ls: {
      desc: "list sections · 'ls projects' lists projects",
      run: (args) => {
        if ((args[0] || '') === 'projects') {
          const list = projectList();
          return list.length ? list : 'projects: nothing here yet';
        }
        return SECTIONS.map((id, i) => `${String(i).padStart(2, '0')}  /#${id}`);
      },
    },
    cd: {
      desc: 'change route · cd / | /interests | home',
      run: (args, ctx) => {
        const t = (args[0] || '').replace(/\/+$/, '').toLowerCase();
        const map = { '': '/', '~': '/', home: '/', interests: '/interests/', '/interests': '/interests/' };
        const dest = map[t];
        if (dest === undefined) return [`cd: no such route: ${args[0]}`, 'routes: / · /interests'];
        ctx.print(`→ ${dest}`, 'sys');
        ctx.closeThenNavigate(dest);
      },
    },
    cat: {
      desc: "print a file · try 'cat about'",
      run: (args) =>
        (args[0] || '').toLowerCase() === 'about'
          ? ABOUT_TEXT
          : `cat: ${args[0] || ''}: no such file`,
    },
    whoami: {
      desc: 'who is behind this site',
      run: () => WHOAMI,
    },
    stack: {
      desc: 'tech stack by group',
      run: () => {
        const groups = stackGroups();
        if (!groups.length) return 'stack: not loaded yet — visit /#stack first';
        const pad = Math.max(...groups.map((g) => g.label.length)) + 2;
        return groups.map((g) => `${g.label.padEnd(pad)}${g.items.join(', ')}`);
      },
    },
    github: {
      desc: 'live public repos from GitHub',
      run: (_args, ctx) => {
        ctx.print('fetching repositories…', 'sys');
        return fetchRepos()
          .then((list) =>
            list.map((r) =>
              [r.name, r.description || 'no description', r.language].filter(Boolean).join(' · ')))
          .catch(() => {
            throw new Error('could not reach api.github.com — see github.com/abdurohman-karim');
          });
      },
    },
    open: {
      desc: 'scroll to a section · open projects',
      run: (args, ctx) => {
        const id = (args[0] || '').toLowerCase();
        if (!SECTIONS.includes(id)) {
          return [`open: unknown section: ${args[0] || ''}`, `sections: ${SECTIONS.join(' · ')}`];
        }
        ctx.print(`→ /#${id}`, 'sys');
        ctx.closeThenNavigate('/#' + id);
      },
    },
    clear: {
      desc: 'clear the terminal',
      run: (_args, ctx) => { ctx.clear(); },
    },
    exit: {
      desc: 'close the terminal',
      run: (_args, ctx) => { ctx.close(); },
    },
  };

  function exec(raw, ctx) {
    const [name, ...args] = raw.split(/\s+/);
    const cmd = COMMANDS[name.toLowerCase()];
    if (!cmd) {
      ctx.print(`command not found: ${name}`, 'err');
      ctx.print("type 'help' to see available commands", 'sys');
      return;
    }
    const res = cmd.run(args, ctx);
    if (res && typeof res.then === 'function') {
      res.then((out) => { if (out != null) ctx.print(out); })
         .catch((e) => ctx.print(String((e && e.message) || e), 'err'));
    } else if (res != null) {
      ctx.print(res);
    }
  }

  /* ── Scramble print — DecryptBtn's phase-2 resolve (left-to-right lock-in
     with a short random-glyph head), scaled down for log lines ────────────── */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#><[]{}|%$';

  function ScrambleLine({ text, animate }) {
    const [shown, setShown] = React.useState(animate ? '' : text);

    React.useEffect(() => {
      if (!animate) return;
      let raf;
      const t0 = performance.now();
      const DUR = 240;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / DUR);
        const resolved = Math.floor(p * text.length);
        let out = text.slice(0, resolved);
        const head = Math.min(text.length - resolved, 8);
        for (let i = 0; i < head; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        setShown(p < 1 ? out : text);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, []);

    return shown;
  }

  /* ── React component ───────────────────────────────────────────────────── */
  const PROMPT = 'guest@synetra:~$';

  function CommandTerminal() {
    const [open, setOpen]   = React.useState(false);
    const [lines, setLines] = React.useState([]); // {id, type: in|out|sys|err, text}
    const [value, setValue] = React.useState('');

    const inputRef = React.useRef(null);
    const outRef   = React.useRef(null);
    const idRef    = React.useRef(0);
    const histRef  = React.useRef([]);   // command history
    const histIdx  = React.useRef(0);
    const booted   = React.useRef(false);
    const reduced  = React.useMemo(prefersReduced, []);

    const print = React.useCallback((text, type = 'out') => {
      const arr = Array.isArray(text) ? text : [text];
      setLines((prev) => [...prev, ...arr.map((t) => ({ id: ++idRef.current, type, text: t }))]);
    }, []);

    const close = React.useCallback(() => setOpen(false), []);

    const closeThenNavigate = React.useCallback((href) => {
      /* Close first so the body scroll lock releases, then let the existing
         router take over — smooth scroll needs the page scrollable again. */
      setTimeout(() => setOpen(false), 260);
      setTimeout(() => routerNavigate(href), 340);
    }, []);

    const ctx = React.useMemo(
      () => ({ print, clear: () => setLines([]), close, closeThenNavigate }),
      [print, close, closeThenNavigate]);

    /* Global Cmd+K / Ctrl+K toggle */
    React.useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setOpen((o) => !o);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* Boot line on first open */
    React.useEffect(() => {
      if (open && !booted.current) {
        booted.current = true;
        print("[ok] guest session attached · type 'help' to get started", 'sys');
      }
    }, [open, print]);

    /* While open: lock body scroll (SkyridgeModal pattern), Esc closes, autofocus */
    React.useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', onKey);
      const raf = requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener('keydown', onKey);
        cancelAnimationFrame(raf);
      };
    }, [open]);

    /* Keep the newest line in view */
    React.useEffect(() => {
      const el = outRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [lines, open]);

    const onSubmit = (e) => {
      e.preventDefault();
      const raw = value.trim();
      setValue('');
      if (!raw) return;
      histRef.current.push(raw);
      histIdx.current = histRef.current.length;
      print(raw, 'in');
      exec(raw, ctx);
    };

    /* Shell-style history on arrows */
    const onKeyDown = (e) => {
      const hist = histRef.current;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx.current > 0) setValue(hist[--histIdx.current]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx.current < hist.length - 1) setValue(hist[++histIdx.current]);
        else { histIdx.current = hist.length; setValue(''); }
      }
    };

    return (
      <>
        {!open && (
          <button
            className="ak-term-fab"
            aria-label="Open command terminal"
            onClick={() => setOpen(true)}
          >{'>_'}</button>
        )}

        {open && (
          <div
            className="ak-term-overlay"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Command terminal"
          >
            <div
              className="ak-term-panel"
              onClick={(e) => {
                e.stopPropagation();
                /* Re-focus the prompt unless the user is selecting output text */
                if (!String(window.getSelection())) inputRef.current && inputRef.current.focus();
              }}
            >
              <div className="ak-term-bar">
                <span>/bin/synetra — guest tty</span>
                <span>esc to close</span>
              </div>

              <div className="ak-term-out" ref={outRef}>
                {lines.map((l) => (
                  <div key={l.id} className={`ak-term-line ak-term-line--${l.type}`}>
                    {l.type === 'in'
                      ? <><span className="ak-term-prompt">{PROMPT} </span>{l.text}</>
                      : <ScrambleLine text={l.text} animate={!reduced} />}
                  </div>
                ))}
              </div>

              <form className="ak-term-row" onSubmit={onSubmit}>
                <span className="ak-term-prompt">{PROMPT}</span>
                <input
                  ref={inputRef}
                  className="ak-term-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck="false"
                  autoComplete="off"
                  autoCapitalize="off"
                  aria-label="Terminal command input"
                />
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  window.CommandTerminal = CommandTerminal;
})();
