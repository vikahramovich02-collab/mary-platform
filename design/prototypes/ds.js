// ─────────────────────────────────────────
//  Mary Design System — Standalone
//  Использование: import { T, color, text, sp, radius, Button, ... } from "./ds.js"
// ─────────────────────────────────────────

// ── Font ─────────────────────────────────
export const font =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif";

// ── Colors ────────────────────────────────
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

  // Borders
  border:      "#E8E8E8",
  borderFocus: "#262633",

  // Semantic
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

  // Alpha fills
  blueBg:   "rgba(7,148,255,0.08)",
  greenBg:  "rgba(52,199,89,0.08)",
  redBg:    "rgba(255,52,7,0.08)",
  purpleBg: "rgba(138,56,245,0.08)",
};

// ── Typography ────────────────────────────
export const text = {
  display: { fontSize: 32, fontWeight: 300,  lineHeight: "1.2"  },
  h1:      { fontSize: 28, fontWeight: 500,  lineHeight: "1.2"  },
  h2:      { fontSize: 20, fontWeight: 400,  lineHeight: "1.3"  },
  h3:      { fontSize: 17, fontWeight: 400,  lineHeight: "1.35" },
  bodyL:   { fontSize: 16, fontWeight: 400,  lineHeight: "1.5"  },
  bodyM:   { fontSize: 15, fontWeight: 400,  lineHeight: "1.5"  },
  bodyS:   { fontSize: 14, fontWeight: 400,  lineHeight: "1.5"  },
  caption: { fontSize: 12, fontWeight: 400,  lineHeight: "1.4"  },
  label:   { fontSize: 11, fontWeight: 400,  lineHeight: "1.3"  },
};

// ── Spacing ───────────────────────────────
export const sp = { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64 };

// ── Border Radius ─────────────────────────
export const radius = {
  xs: 4, sm: 6, md: 8, lg: 10, xl: 12,
  "2xl": 16, "3xl": 20, "4xl": 24, full: 9999,
};

// ── Shadows ───────────────────────────────
export const shadow = {
  none: "none",
  sm:   "0 1px 3px rgba(0,0,0,0.06)",
  md:   "0 4px 12px rgba(0,0,0,0.08)",
  lg:   "0 8px 24px rgba(0,0,0,0.10)",
};

// ── Transitions ───────────────────────────
export const transition = {
  fast: "all 0.12s ease",
  base: "all 0.18s ease",
  slow: "all 0.28s ease",
};

// ── T — алиас для обратной совместимости ──
export const T = {
  white:   color.white,
  bg:      color.bgPage,
  surface: color.bgSurface,
  ink:     color.ink,
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

// ─────────────────────────────────────────
//  Components (React)
// ─────────────────────────────────────────
import { useState } from "react";

const _base = { fontFamily: font, boxSizing: "border-box" };

// ── Button ────────────────────────────────
// variant: "primary" | "secondary" | "ghost" | "danger"
// size: "sm" | "md" | "lg"
export function Button({ children, variant = "primary", size = "md", disabled, onClick, style, ...rest }) {
  const [hov, setHov] = useState(false);

  const sizes = {
    sm: { height: 32, padding: "0 14px", ...text.bodyS, borderRadius: radius.md },
    md: { height: 40, padding: "0 20px", ...text.bodyM, borderRadius: radius.lg },
    lg: { height: 48, padding: "0 28px", ...text.bodyL, borderRadius: radius.xl },
  };

  const variants = {
    primary:   { background: hov ? "#2C2C30" : color.black, color: color.white, border: "none" },
    secondary: { background: hov ? color.bgHover : color.white, color: color.ink, border: `1.5px solid ${color.border}` },
    ghost:     { background: hov ? color.bgHover : "transparent", color: color.ink, border: "none" },
    danger:    { background: hov ? color.redBg : "transparent", color: color.danger, border: `1.5px solid ${hov ? color.danger : color.border}` },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ..._base,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: sp[2],
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: transition.fast,
        outline: "none", fontWeight: 450, flexShrink: 0,
        ...sizes[size], ...variants[variant], ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────
export function Input({ placeholder, value, onChange, icon, style, ...rest }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", ...style }}>
      {icon && (
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: color.muted, pointerEvents: "none" }}>
          {icon}
        </div>
      )}
      <input
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ..._base, width: "100%", height: 40,
          padding: icon ? "0 14px 0 40px" : "0 14px",
          ...text.bodyS, color: color.ink, background: color.white,
          border: `1.5px solid ${focused ? color.borderFocus : color.border}`,
          borderRadius: radius.lg, outline: "none", transition: transition.fast,
        }}
        {...rest}
      />
    </div>
  );
}

// ── NavItem ───────────────────────────────
// variant: "expanded" (default) | "collapsed" (icon only)
export function NavItem({ icon, label, active, onClick, collapsed = false, style }) {
  const [hov, setHov] = useState(false);

  if (collapsed) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 20px", borderRadius: radius["2xl"], cursor: "pointer",
          background: active ? color.bgSurface : hov ? "rgba(38,38,51,0.04)" : "transparent",
          transition: transition.fast, ...style,
        }}
      >
        {icon && <span style={{ display: "flex", flexShrink: 0, width: 16, height: 16 }}>{icon}</span>}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: 16, width: 220, borderRadius: 10, cursor: "pointer",
        background: active ? color.bgSurface : hov ? "rgba(38,38,51,0.04)" : "transparent",
        transition: transition.fast, ...style,
      }}
    >
      {icon && <span style={{ display: "flex", flexShrink: 0, width: 16, height: 16 }}>{icon}</span>}
      <span style={{
        fontSize: 16, fontWeight: 510, lineHeight: 1,
        color: "#262633",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Avatar ────────────────────────────────
export function Avatar({ initials, src, size = 32, bgColor, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius.full, flexShrink: 0,
      background: src ? "transparent" : (bgColor || color.black),
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", ...style,
    }}>
      {src
        ? <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : <span style={{ ...text.label, color: color.white, fontWeight: 600 }}>{initials}</span>
      }
    </div>
  );
}

// ── StatusDot ─────────────────────────────
export function StatusDot({ status = "online", size = 8 }) {
  const c = { online: color.green, busy: color.orange, offline: color.muted };
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: radius.full, background: c[status] || color.muted, flexShrink: 0 }} />;
}

// ── Tag ───────────────────────────────────
export function Tag({ children, variant = "default", style }) {
  const v = {
    default: { background: color.bgSurface, color: color.sub,    border: `1px solid ${color.border}` },
    blue:    { background: color.blueBg,    color: color.blue,   border: "none" },
    green:   { background: color.greenBg,   color: color.green,  border: "none" },
    red:     { background: color.redBg,     color: color.danger, border: "none" },
    purple:  { background: color.purpleBg,  color: color.purple, border: "none" },
    black:   { background: color.black,     color: color.white,  border: "none" },
  };
  return (
    <span style={{ ..._base, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: radius.full, ...text.label, fontWeight: 500, ...v[variant], ...style }}>
      {children}
    </span>
  );
}

// ── FilterTab ─────────────────────────────
export function FilterTab({ label, active, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        ..._base, display: "inline-flex", alignItems: "center", justifyContent: "center",
        height: 36, padding: "0 16px", borderRadius: radius.full, border: "none", cursor: "pointer",
        transition: transition.fast, ...text.bodyS,
        fontWeight: active ? 500 : 400,
        background: active ? color.black : "transparent",
        color: active ? color.white : color.sub,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

// ── Divider ───────────────────────────────
export function Divider({ style }) {
  return <div style={{ height: 1, background: color.border, ...style }} />;
}

// ── PageTitle ─────────────────────────────
export function PageTitle({ title, subtitle, style }) {
  return (
    <div style={{ marginBottom: sp[6], ...style }}>
      <h1 style={{ ...text.h1, color: color.ink, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ ...text.bodyS, color: color.muted, margin: `${sp[1]}px 0 0` }}>{subtitle}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────
export function Card({ children, onClick, hoverable = false, padding, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHov(true) : undefined}
      onMouseLeave={hoverable ? () => setHov(false) : undefined}
      style={{
        background: hov ? color.bgHover : color.bgSurface,
        borderRadius: radius["2xl"], padding: padding ?? sp[5],
        cursor: onClick ? "pointer" : "default", transition: transition.fast, ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── ListItem ──────────────────────────────
export function ListItem({ icon, title, meta, right, onClick, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: sp[3],
        padding: `${sp[3]}px ${sp[4]}px`, borderRadius: radius.xl,
        background: hov ? color.bgHover : "transparent",
        cursor: onClick ? "pointer" : "default", transition: transition.fast, ...style,
      }}
    >
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: radius.md, background: color.bgSurface, border: `1px solid ${color.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...text.bodyS, fontWeight: 450, color: color.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {meta && <div style={{ ...text.caption, color: color.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</div>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// ── SectionLabel ──────────────────────────
export function SectionLabel({ children, style }) {
  return (
    <div style={{ ...text.label, color: color.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: sp[2], ...style }}>
      {children}
    </div>
  );
}
