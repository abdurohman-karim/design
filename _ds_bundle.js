/* @ds-bundle: {"format":3,"namespace":"AbdurohmanKarimPortfolioDesignSystem_bf6e8b","components":[{"name":"ProjectCard","sourcePath":"components/content/ProjectCard.jsx"},{"name":"SectionHeading","sourcePath":"components/content/SectionHeading.jsx"},{"name":"SocialLink","sourcePath":"components/content/SocialLink.jsx"},{"name":"StatCard","sourcePath":"components/content/StatCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"components/content/ProjectCard.jsx":"7619fcc4ca21","components/content/SectionHeading.jsx":"3546239b755e","components/content/SocialLink.jsx":"9e88b279e036","components/content/StatCard.jsx":"2013dd4669a0","components/core/Badge.jsx":"9a644ec051f9","components/core/Button.jsx":"331dd01677ef","components/core/Card.jsx":"ed73ab9906a2","components/core/Icon.jsx":"695b3a65ebf5","components/core/Tag.jsx":"8dea1203edfb","components/forms/Input.jsx":"49118951ac8d","components/forms/Textarea.jsx":"57a5ba734239","ui_kits/portfolio/About.jsx":"831a8eabe452","ui_kits/portfolio/Contact.jsx":"b6e3ef46fe71","ui_kits/portfolio/Header.jsx":"3e66f6d2f8dd","ui_kits/portfolio/Hero.jsx":"dedb55031f84","ui_kits/portfolio/Projects.jsx":"f6e4e82ce7e9","ui_kits/portfolio/Stack.jsx":"67ab422f7f27"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AbdurohmanKarimPortfolioDesignSystem_bf6e8b = window.AbdurohmanKarimPortfolioDesignSystem_bf6e8b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/SectionHeading.jsx
try { (() => {
/**
 * SectionHeading — the brand's signature header. A mono code-syntax title
 * (echo "…"; · print('…') · console.log('…')) with an index kicker and lede.
 */
function SectionHeading({
  index,
  code,
  title,
  lede,
  align = 'left',
  id
}) {
  return /*#__PURE__*/React.createElement("header", {
    id: id,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align === 'center' ? 'center' : 'left',
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, index != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.24em',
      color: 'var(--text-faint)'
    }
  }, String(index).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 1,
      background: 'var(--border-strong)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, title)), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'clamp(28px, 4vw, 44px)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: 'var(--text-primary)',
      lineHeight: 1.05,
      margin: 0
    }
  }, code), lede && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'clamp(15px, 1.4vw, 18px)',
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
      margin: 0,
      maxWidth: 620,
      textWrap: 'pretty'
    }
  }, lede));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/content/StatCard.jsx
try { (() => {
/**
 * StatCard — large mono number + label. Used in the About stat row.
 */
function StatCard({
  value,
  label,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '24px 4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(36px, 5vw, 56px)',
      fontWeight: 500,
      letterSpacing: '-0.03em',
      color: 'var(--text-primary)',
      lineHeight: 1,
      textShadow: 'var(--glow-text)'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-faint)'
    }
  }, sub));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — tiny mono status/meta label. Variants: default, outline, solid, dot.
 */
function Badge({
  children,
  variant = 'default',
  dot = false,
  ...rest
}) {
  const variants = {
    default: {
      background: 'var(--surface-card)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)'
    },
    solid: {
      background: 'var(--white)',
      color: 'var(--black)',
      border: '1px solid var(--white)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '4px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: '10.5px',
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-sm)',
      ...(variants[variant] || variants.default),
      ...rest.style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor',
      boxShadow: '0 0 8px currentColor'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — monochrome action.
 * Variants: primary (solid white), secondary (glass hairline), ghost (text), outline.
 * White-glow hover, no hue. Optional trailing arrow.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  full = false,
  disabled = false,
  as = 'button',
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '12px',
      height: 36,
      gap: 8
    },
    md: {
      padding: '12px 22px',
      fontSize: '13px',
      height: 46,
      gap: 10
    },
    lg: {
      padding: '16px 30px',
      fontSize: '14px',
      height: 56,
      gap: 12
    }
  };
  const s = sizes[size] || sizes.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: full ? '100%' : 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: s.fontSize,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all var(--dur-base) var(--ease-out)',
    whiteSpace: 'nowrap',
    WebkitFontSmoothing: 'antialiased'
  };
  const variants = {
    primary: {
      background: 'var(--white)',
      color: 'var(--black)',
      boxShadow: 'var(--glow-halo-sm)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
      backdropFilter: 'blur(var(--blur-sm))'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      ...base,
      ...(variants[variant] || variants.primary)
    },
    disabled: as === 'button' ? disabled : undefined,
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = 'var(--glow-halo-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      } else {
        e.currentTarget.style.borderColor = 'var(--white)';
        e.currentTarget.style.color = 'var(--white)';
        e.currentTarget.style.boxShadow = 'var(--glow-halo-sm)';
      }
    },
    onMouseLeave: e => {
      if (disabled) return;
      e.currentTarget.style.transform = 'none';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = 'var(--glow-halo-sm)';
      } else {
        e.currentTarget.style.borderColor = variant === 'ghost' ? 'transparent' : 'var(--border-strong)';
        e.currentTarget.style.color = variant === 'ghost' ? 'var(--text-secondary)' : 'var(--text-primary)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }
  }, rest), children, arrow && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: '1.1em',
      lineHeight: 1,
      marginTop: '-1px'
    }
  }, "\u2192"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — glass surface container. Hairline border, optional white-glow hover.
 * Base building block for projects, stats, info panels.
 */
function Card({
  children,
  hover = false,
  padding = 'lg',
  glow = false,
  style,
  ...rest
}) {
  const pads = {
    sm: 20,
    md: 28,
    lg: 36
  };
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => hover && setHovered(true),
    onMouseLeave: () => hover && setHovered(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: pads[padding] ?? pads.lg,
      backdropFilter: 'blur(var(--blur-md))',
      WebkitBackdropFilter: 'blur(var(--blur-md))',
      boxShadow: hovered && glow ? 'var(--glow-halo-md), var(--inset-hairline)' : 'var(--inset-hairline)',
      transform: hovered ? 'translateY(-3px)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/**
 * Icon — monochrome line icons (24px, 2px stroke, round joins).
 * The portfolio set is Iconsax-style: the developer's original cube /
 * code-branch / bar-chart / development glyphs (duotone, 0.24 ghost fill)
 * recolored to white, plus matching stroke icons for UI/social needs.
 * Renders with currentColor so it inherits text color.
 */
const DUOTONE = {
  cube: {
    ghost: 'M12 10.7713L2 5.76859V16.7425C2 17.511 2.43124 18.2131 3.11275 18.554L12 23V10.7713Z',
    stroke: 'M12 10.7713L2 5.76859M12 10.7713L22 5.76859M12 10.7713V23M2 5.76859L11.1128 1.20978C11.6719 0.930072 12.3281 0.930072 12.8873 1.20978L22 5.76859M2 5.76859V16.7425C2 17.511 2.43124 18.2131 3.11275 18.554L12 23M22 5.76859V16.7425C22 17.511 21.5688 18.2131 20.8873 18.554L12 23'
  },
  branch: {
    ghost: 'M8 4C8 5.10457 7.10457 6 6 6C4.89543 6 4 5.10457 4 4C4 2.89543 4.89543 2 6 2C7.10457 2 8 2.89543 8 4ZM20 4C20 5.10457 19.1046 6 18 6C16.8954 6 16 5.10457 16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4ZM8 20C8 21.1046 7.10457 22 6 22C4.89543 22 4 21.1046 4 20C4 18.8954 4.89543 18 6 18C7.10457 18 8 18.8954 8 20Z',
    stroke: 'M6 6C7.10457 6 8 5.10457 8 4C8 2.89543 7.10457 2 6 2C4.89543 2 4 2.89543 4 4C4 5.10457 4.89543 6 6 6ZM6 6V14.5M18 6C19.1046 6 20 5.10457 20 4C20 2.89543 19.1046 2 18 2C16.8954 2 16 2.89543 16 4C16 5.10457 16.8954 6 18 6ZM18 6V10C18 11.1046 17.1046 12 16 12H10.1569C9.09599 12 8.07857 12.4214 7.32843 13.1716L6 14.5M6 18C4.89543 18 4 18.8954 4 20C4 21.1046 4.89543 22 6 22C7.10457 22 8 21.1046 8 20C8 18.8954 7.10457 18 6 18ZM6 18V14.5'
  }
};
const STROKE = {
  server: 'M5 4h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM5 13h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM7 8h.01M7 17h.01',
  database: 'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3ZM3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6',
  terminal: 'M5 7l5 5-5 5M13 17h6',
  code: 'M9 18l-6-6 6-6M15 6l6 6-6 6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  bolt: 'M13 2L3 14h8l-1 8 10-12h-8l1-8Z',
  layers: 'M12 2l9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
  bot: 'M12 8V4M8 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM2 14h2M20 14h2M9 14v1M15 14v1',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 7l-10 6L2 7',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  arrowUpRight: 'M7 17L17 7M7 7h10v10',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  check: 'M20 6L9 17l-5-5'
};
function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  duotone = false,
  style,
  ...rest
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    style: {
      display: 'block',
      flexShrink: 0,
      ...style
    },
    ...rest
  };
  if (DUOTONE[name]) {
    const d = DUOTONE[name];
    return /*#__PURE__*/React.createElement("svg", common, duotone && /*#__PURE__*/React.createElement("path", {
      opacity: "0.24",
      d: d.ghost,
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("path", {
      d: d.stroke,
      stroke: "currentColor",
      strokeWidth: strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));
  }
  const path = STROKE[name] || STROKE.code;
  return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("path", {
    d: path,
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
const ICON_NAMES = [...Object.keys(DUOTONE), ...Object.keys(STROKE)];
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/content/SocialLink.jsx
try { (() => {
/**
 * SocialLink — contact row: icon + label + handle, arrow on hover.
 * For Telegram / GitHub / email links in the contact section.
 */
function SocialLink({
  icon = 'send',
  label,
  handle,
  href = '#'
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '20px 4px',
      borderBottom: '1px solid var(--border-subtle)',
      textDecoration: 'none',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
      background: 'var(--surface-card)',
      color: hovered ? 'var(--white)' : 'var(--text-secondary)',
      boxShadow: hovered ? 'var(--glow-halo-sm)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      color: hovered ? 'var(--white)' : 'var(--text-primary)',
      transition: 'color var(--dur-base) var(--ease-out)'
    }
  }, handle)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: hovered ? 'var(--white)' : 'var(--text-faint)',
      transform: hovered ? 'translateX(3px)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrowRight",
    size: 18
  })));
}
Object.assign(__ds_scope, { SocialLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SocialLink.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — tech-stack pill. Mono type, glass hairline, white-glow hover.
 * Use for stack chips (PHP, Laravel, Redis…) and filter tokens.
 */
function Tag({
  children,
  active = false,
  size = 'md',
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '5px 10px',
      fontSize: '11px'
    },
    md: {
      padding: '7px 14px',
      fontSize: '12px'
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: s.padding,
      fontFamily: 'var(--font-mono)',
      fontSize: s.fontSize,
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: active ? 'var(--black)' : 'var(--text-secondary)',
      background: active ? 'var(--white)' : 'var(--surface-card)',
      border: `1px solid ${active ? 'var(--white)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-pill)',
      backdropFilter: 'blur(var(--blur-sm))',
      cursor: 'default',
      transition: 'all var(--dur-base) var(--ease-out)',
      whiteSpace: 'nowrap'
    },
    onMouseEnter: e => {
      if (active) return;
      e.currentTarget.style.borderColor = 'var(--border-strong)';
      e.currentTarget.style.color = 'var(--white)';
    },
    onMouseLeave: e => {
      if (active) return;
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/content/ProjectCard.jsx
try { (() => {
/**
 * ProjectCard — showcase card for a portfolio project. Glass surface,
 * index + title row, description, key-feature list, tech tags, hover glow.
 */
function ProjectCard({
  index,
  title,
  kind,
  description,
  features = [],
  stack = [],
  href = '#'
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: 32,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
      backdropFilter: 'blur(var(--blur-md))',
      WebkitBackdropFilter: 'blur(var(--blur-md))',
      boxShadow: hovered ? 'var(--glow-halo-md), var(--inset-hairline)' : 'var(--inset-hairline)',
      transform: hovered ? 'translateY(-4px)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      textDecoration: 'none',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.24em',
      color: 'var(--text-faint)'
    }
  }, String(index ?? 0).padStart(2, '0')), kind && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, kind)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: hovered ? 'var(--white)' : 'var(--text-muted)',
      transform: hovered ? 'translate(2px,-2px)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrowUpRight",
    size: 20
  }))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      color: 'var(--text-primary)',
      margin: 0,
      lineHeight: 1.1
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      lineHeight: 1.65,
      color: 'var(--text-secondary)',
      margin: 0,
      textWrap: 'pretty'
    }
  }, description), features.length > 0 && /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, features.map((f, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      lineHeight: 1.5,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 2,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14
  })), /*#__PURE__*/React.createElement("span", null, f)))), stack.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 'auto',
      paddingTop: 4
    }
  }, stack.map(s => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: s,
    size: "sm"
  }, s))));
}
Object.assign(__ds_scope, { ProjectCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ProjectCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — minimal underline field on dark glass. Focus = white underline + glow.
 * Pass label for a mono caption above.
 */
function Input({
  label,
  type = 'text',
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: focused ? 'var(--text-secondary)' : 'var(--text-muted)',
      transition: 'color var(--dur-base) var(--ease-out)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${focused ? 'var(--white)' : 'var(--border-strong)'}`,
      padding: '12px 2px',
      fontFamily: 'var(--font-sans)',
      fontSize: '16px',
      color: 'var(--text-primary)',
      outline: 'none',
      boxShadow: focused ? '0 1px 0 var(--white), var(--glow-halo-sm)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Textarea — multi-line counterpart to Input. Bordered glass box, white focus glow.
 */
function Textarea({
  label,
  rows = 4,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: focused ? 'var(--text-secondary)' : 'var(--text-muted)',
      transition: 'color var(--dur-base) var(--ease-out)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      resize: 'vertical',
      background: 'var(--surface-card)',
      border: `1px solid ${focused ? 'var(--white)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontFamily: 'var(--font-sans)',
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'var(--text-primary)',
      outline: 'none',
      boxShadow: focused ? 'var(--glow-halo-sm)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/About.jsx
try { (() => {
// Portfolio — About. $_GET('About'), bio + approach principles + stats.
const {
  SectionHeading,
  StatCard,
  Card,
  Icon
} = window.DS;
function About() {
  const principles = [['database', 'DB-side aggregation', 'Heavy lifting in the database, not the application layer — fewer round-trips, predictable load.'], ['layers', 'Additive changes', 'Extend behaviour without breaking existing logic. Migrations and feature flags over rewrites.'], ['bolt', 'Redis-backed caching', 'Hot paths cached in Redis; queues and workers keep request latency flat under load.']];
  return /*#__PURE__*/React.createElement("section", {
    id: "about",
    style: {
      padding: 'var(--section-gap) 0',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    index: 1,
    title: "About",
    code: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-400)'
      }
    }, "$_GET"), "(", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-300)'
      }
    }, "'About'"), ")"),
    lede: "Backend / full-stack developer in fintech and payment systems. I design APIs, payment platforms and banking integrations \u2014 including SBP (Faster Payments) \u2014 and multi-provider AI services."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 0,
      margin: '56px 0',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "20+",
    label: "Projects"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "6+",
    label: "Years"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "2",
    label: "Languages",
    sub: "PHP \xB7 Python"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "\u221E",
    label: "Edge cases",
    sub: "handled"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 20
    }
  }, principles.map(([icon, title, body]) => /*#__PURE__*/React.createElement(Card, {
    key: title,
    hover: true,
    glow: true,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 26,
    duotone: true
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 500,
      color: 'var(--white)',
      margin: '18px 0 10px'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14.5,
      lineHeight: 1.65,
      color: 'var(--text-secondary)',
      margin: 0,
      textWrap: 'pretty'
    }
  }, body))))));
}
window.About = About;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/About.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/Contact.jsx
try { (() => {
// Portfolio — Contact + footer. cout<<'Contact'; form + social links.
const {
  SectionHeading,
  Input,
  Textarea,
  Button,
  SocialLink
} = window.DS;
function Contact() {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    className: "ak-grid-bg",
    style: {
      padding: 'var(--section-gap) 0 0',
      borderTop: '1px solid var(--border-subtle)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    index: 4,
    title: "Contact",
    code: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-400)'
      }
    }, "cout"), " << ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-300)'
      }
    }, "'Contact'"), ";"),
    lede: "Have a payment platform, bot or backend that needs building? Let's talk."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 56,
      marginTop: 56,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Your name",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@domain.com",
    required: true
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Message",
    rows: 5,
    placeholder: "Tell me about the project\u2026",
    required: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    arrow: true,
    type: "submit"
  }, sent ? 'Message sent ✓' : 'Send message'))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SocialLink, {
    icon: "send",
    label: "Telegram",
    handle: "@abdurohman",
    href: "https://t.me/abdurohman"
  }), /*#__PURE__*/React.createElement(SocialLink, {
    icon: "github",
    label: "GitHub",
    handle: "abdurohman-karim",
    href: "https://github.com/abdurohman-karim"
  }), /*#__PURE__*/React.createElement(SocialLink, {
    icon: "mail",
    label: "Email",
    handle: "hello@abdurohman.dev",
    href: "mailto:hello@abdurohman.dev"
  })))), /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 'var(--section-gap)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '32px var(--container-pad)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "aK"), " \u2014 Backend Developer"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-faint)'
    }
  }, "// built with PHP, Python & coffee \xB7 2025"))));
}
window.Contact = Contact;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/Header.jsx
try { (() => {
// Portfolio — Header / nav. Fixed, glass on scroll, monogram logo.
const {
  Badge
} = window.DS;
function Header({
  active
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['home', 'Home'], ['about', 'About'], ['stack', 'Stack'], ['projects', 'Projects'], ['contact', 'Contact']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      background: scrolled ? 'rgba(0,0,0,0.6)' : 'transparent',
      backdropFilter: scrolled ? 'blur(var(--blur-md))' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(var(--blur-md))' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '18px var(--container-pad)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#home",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      display: 'grid',
      placeItems: 'center',
      border: '1px solid var(--border-strong)',
      borderRadius: 10,
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 18,
      letterSpacing: '-0.04em',
      color: 'var(--white)',
      boxShadow: 'var(--inset-hairline)'
    }
  }, "aK"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 16,
      color: 'var(--text-secondary)',
      letterSpacing: '-0.01em'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--white)',
      fontWeight: 600
    }
  }, "a"), "bdurohman", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--white)',
      fontWeight: 600
    }
  }, "K"), "arim")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 4
    },
    className: "ak-nav"
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: '#' + id,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      color: active === id ? 'var(--white)' : 'var(--text-muted)',
      background: active === id ? 'var(--surface-card)' : 'transparent',
      border: active === id ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'color var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => {
      if (active !== id) e.currentTarget.style.color = 'var(--white)';
    },
    onMouseLeave: e => {
      if (active !== id) e.currentTarget.style.color = 'var(--text-muted)';
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    dot: true
  }, "Available"))));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/Hero.jsx
try { (() => {
// Portfolio — Hero. echo "Welcome"; banner, big name, role, slogan, CTAs.
const {
  Button,
  Badge
} = window.DS;
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    id: "home",
    className: "ak-grid-bg",
    style: {
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse 60% 50% at 50% 38%, rgba(255,255,255,0.06), transparent 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
      maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
      backgroundImage: 'linear-gradient(to right, var(--grid-line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line-strong) 1px, transparent 1px)',
      backgroundSize: '64px 64px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-muted)',
      padding: '8px 16px',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-card)',
      backdropFilter: 'blur(var(--blur-sm))',
      whiteSpace: 'nowrap'
    }
  }, "echo ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--white)'
    }
  }, "\"Welcome\""), ";"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(48px, 9vw, 124px)',
      fontWeight: 500,
      letterSpacing: '-0.045em',
      lineHeight: 0.95,
      color: 'var(--white)',
      margin: 0,
      textShadow: '0 0 60px rgba(255,255,255,0.12)'
    }
  }, "Abdurohman", /*#__PURE__*/React.createElement("br", null), "Karim"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'clamp(13px, 1.6vw, 16px)',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, "Backend Developer \xB7 Fintech & AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'clamp(16px, 1.8vw, 20px)',
      lineHeight: 1.6,
      color: 'var(--text-secondary)',
      maxWidth: 560,
      margin: 0,
      textWrap: 'balance'
    }
  }, "I build payment platforms, banking integrations and AI-driven services \u2014 high-load backends in PHP / Laravel and Python."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    arrow: true,
    as: "a",
    href: "#contact"
  }, "Get in touch"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    as: "a",
    href: "#projects"
  }, "View projects"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 32,
      left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, "scroll", /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 36,
      background: 'linear-gradient(var(--border-strong), transparent)'
    }
  })));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/Projects.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Portfolio — Projects. console.log('Projects'), ProjectCards.
const {
  SectionHeading,
  ProjectCard
} = window.DS;
const PROJECTS = [{
  index: 1,
  title: 'uCash',
  kind: 'Payments platform · Laravel / PHP',
  description: 'Money-transfer & payments platform with deep admin tooling and SBP (Faster Payments) integration.',
  features: ['Black / white-list system to block suspicious clients', 'Universal transfer-method toggle (SBP & others) from admin — no hardcode', 'Branch-load forecasting via weighted alpha-blending, with Excel export', 'PDF receipt generator with Control Number of Transfer (CNT)', 'Failed-transfer reason dashboard from JSON analysis'],
  stack: ['PHP', 'Laravel', 'PostgreSQL', 'Redis', 'Docker']
}, {
  index: 2,
  title: 'NutriCore',
  kind: 'AI nutrition assistant · Python / Telegram',
  description: 'Telegram nutrition assistant powered by a multi-provider LLM router with flexible subscriptions.',
  features: ['Multi-provider LLM router (OpenAI, Groq, DeepSeek, OpenRouter)', 'Free / Premium / Premium+ tiers via a feature registry', 'Meal simulation with timezones and MealLog snapshots', 'Tri-lingual support + admin panel'],
  stack: ['Python', 'aiogram', 'PostgreSQL', 'Redis']
}, {
  index: 3,
  title: 'Video Downloader Bot',
  kind: 'Telegram bot · aiogram 3 / yt-dlp',
  description: 'High-throughput Telegram bot that downloads Instagram / TikTok video with quality selection.',
  features: ['FSM-driven quality picker (Instagram / TikTok)', 'Asyncio queue worker pool for high load', 'Channel-subscription gating + multilingual UI', 'aiosqlite-backed admin panel'],
  stack: ['Python', 'aiogram', 'yt-dlp', 'aiosqlite']
}, {
  index: 4,
  title: 'E-commerce Platform',
  kind: 'Storefront · Laravel',
  description: 'Laravel e-commerce build with Uzbekistan geodata and config-switchable ordering.',
  features: ['Uzbekistan geodata (regions / districts)', 'OTP test users for QA flows', 'Order-request system, toggleable via config'],
  stack: ['PHP', 'Laravel', 'PostgreSQL']
}];
function Projects() {
  return /*#__PURE__*/React.createElement("section", {
    id: "projects",
    style: {
      padding: 'var(--section-gap) 0',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    index: 3,
    title: "Projects",
    code: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-400)'
      }
    }, "console.log"), "(", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-300)'
      }
    }, "'Projects'"), ")"),
    lede: "Selected fintech & AI systems \u2014 payments, LLM routing, automation and storefronts."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 20,
      marginTop: 56,
      alignItems: 'stretch'
    }
  }, PROJECTS.map(p => /*#__PURE__*/React.createElement(ProjectCard, _extends({
    key: p.title
  }, p))))));
}
window.Projects = Projects;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/Projects.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/Stack.jsx
try { (() => {
// Portfolio — Tech Stack. print('Stack'), grouped tags.
const {
  SectionHeading,
  Tag,
  Icon
} = window.DS;
function Stack() {
  const groups = [['server', 'Languages & frameworks', ['PHP', 'Laravel', 'Python', 'aiogram', 'RoadRunner']], ['database', 'Data & infra', ['PostgreSQL', 'Redis', 'Docker', 'GitLab CI/CD']], ['bot', 'AI & integrations', ['OpenAI', 'Groq', 'DeepSeek', 'OpenRouter', 'SBP']]];
  return /*#__PURE__*/React.createElement("section", {
    id: "stack",
    style: {
      padding: 'var(--section-gap) 0',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    index: 2,
    title: "Stack",
    code: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-400)'
      }
    }, "print"), "(", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-300)'
      }
    }, "'Stack'"), ")"),
    lede: "The tools I reach for to ship reliable, high-load backend systems."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      marginTop: 48
    }
  }, groups.map(([icon, label, items], i) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(180px, 280px) 1fr',
      gap: 32,
      alignItems: 'center',
      padding: '28px 0',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: i === groups.length - 1 ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    duotone: true
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, items.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t))))))));
}
window.Stack = Stack;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/Stack.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ProjectCard = __ds_scope.ProjectCard;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.SocialLink = __ds_scope.SocialLink;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
