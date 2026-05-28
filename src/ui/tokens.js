// ─────────────────────────────────────────
//  Mary Design System — Tokens
//  Font: SF Pro (system stack)
// ─────────────────────────────────────────

export const font =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif";

// ── Colors ──────────────────────────────
export const color = {
  // Base
  white:   "#FFFFFF",
  black:   "#262633",

  // Backgrounds
  bgPage:    "#F5F5F5",
  bgSurface: "#F7F8FA",
  bgHover:   "#EEEFF1",

  // Text
  ink:   "#262633",
  sub:   "#262633",
  muted: "rgba(38,38,51,0.5)",
  ghost: "rgba(38,38,51,0.30)",

  // Border
  border:      "#E8E8E8",
  borderFocus: "#18181B",

  // Semantic
  primary: "#18181B",
  danger:  "#FF3407",
  success: "#34C759",
  warning: "#FFD60A",
  info:    "#0794FF",

  // Accents
  blue:   "#0794FF",
  green:  "#34C759",
  red:    "#FF3407",
  orange: "#FF4D00",
  yellow: "#FFD60A",
  purple: "#8A38F5",

  // Alpha helpers
  blueBg:   "rgba(7,148,255,0.08)",
  greenBg:  "rgba(52,199,89,0.08)",
  redBg:    "rgba(255,52,7,0.08)",
  purpleBg: "rgba(138,56,245,0.08)",
};

// ── Typography ──────────────────────────
export const text = {
  display: { fontSize: 32, fontWeight: 300, lineHeight: "1.2" },
  h1:      { fontSize: 28, fontWeight: 500, lineHeight: "1.2" },
  h2:      { fontSize: 20, fontWeight: 400, lineHeight: "1.3"  },
  h3:      { fontSize: 17, fontWeight: 400, lineHeight: "1.35" },
  bodyL:   { fontSize: 16, fontWeight: 400, lineHeight: "1.5"  },
  bodyM:   { fontSize: 15, fontWeight: 400, lineHeight: "1.5"  },
  bodyS:   { fontSize: 14, fontWeight: 400, lineHeight: "1.5"  },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: "1.4"  },
  label:   { fontSize: 11, fontWeight: 400, lineHeight: "1.3"  },
};

// ── Spacing ─────────────────────────────
export const sp = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
};

// ── Border Radius ────────────────────────
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  "2xl": 16,
  "3xl": 20,
  "4xl": 24,
  full: 9999,
};

// ── Shadows ──────────────────────────────
export const shadow = {
  none: "none",
  sm:   "0 1px 3px rgba(0,0,0,0.06)",
  md:   "0 4px 12px rgba(0,0,0,0.08)",
  lg:   "0 8px 24px rgba(0,0,0,0.10)",
};

// ── Transitions ──────────────────────────
export const transition = {
  fast:   "all 0.12s ease",
  base:   "all 0.18s ease",
  slow:   "all 0.28s ease",
};

// ── Aliases (backwards-compat with T.xxx) ─
export const T = {
  white:   color.white,
  bg:      color.bgPage,
  surface: color.bgSurface,
  ink:     color.ink,   // #262633
  soft:    color.ghost,
  muted:   color.muted,
  border:  color.border,
  red:     color.red,
  blue:    color.blue,
  orange:  color.orange,
  green:   color.green,
  yellow:  color.yellow,
  purple:  color.purple,
  font,
};

export default T;

// CSS variable references — use in inline styles for dark mode awareness
export const cv = {
  bg:          "var(--bg)",
  bgPage:      "var(--bg-page)",
  bgSurface:   "var(--bg-surface)",
  bgCard:      "var(--bg-card)",
  text:        "var(--text)",
  muted:       "var(--text-muted)",
  ghost:       "var(--text-ghost)",
  border:      "var(--border)",
  borderStrong: "var(--border-strong)",
  userBubble:  "var(--user-bubble)",
  hover:       "var(--hover)",
  inputBg:     "var(--input-bg)",
};
