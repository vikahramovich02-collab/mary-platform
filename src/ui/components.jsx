// ─────────────────────────────────────────
//  Mary Design System — Components
// ─────────────────────────────────────────
import { useState } from "react";
import { color, text, sp, radius, shadow, transition, font } from "./tokens.js";

const base = { fontFamily: font, boxSizing: "border-box" };

// ── Button ───────────────────────────────
// variant: "primary" | "secondary" | "ghost" | "danger"
// size: "sm" | "md" | "lg"
export function Button({ children, variant = "primary", size = "md", disabled, onClick, style, ...rest }) {
  const [hovered, setHovered] = useState(false);

  const sizes = {
    sm: { height: 32, padding: "0 14px", ...text.bodyS, borderRadius: radius.md },
    md: { height: 40, padding: "0 20px", ...text.bodyM, borderRadius: radius.lg },
    lg: { height: 48, padding: "0 28px", ...text.bodyL, borderRadius: radius.xl },
  };

  const variants = {
    primary: {
      background: hovered ? "#2C2C30" : color.black,
      color: color.white,
      border: "none",
    },
    secondary: {
      background: hovered ? color.bgHover : color.white,
      color: color.ink,
      border: `1.5px solid ${color.border}`,
    },
    ghost: {
      background: hovered ? color.bgHover : "transparent",
      color: color.ink,
      border: "none",
    },
    danger: {
      background: hovered ? color.redBg : "transparent",
      color: color.danger,
      border: `1.5px solid ${hovered ? color.danger : color.border}`,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sp[2],
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: transition.fast,
        outline: "none",
        fontWeight: 450,
        flexShrink: 0,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────
export function Input({ placeholder, value, onChange, icon, style, ...rest }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", ...style }}>
      {icon && (
        <div style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: color.muted, pointerEvents: "none",
        }}>
          {icon}
        </div>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...base,
          width: "100%",
          height: 40,
          padding: icon ? "0 14px 0 40px" : "0 14px",
          ...text.bodyS,
          color: color.ink,
          background: color.white,
          border: `1.5px solid ${focused ? color.borderFocus : color.border}`,
          borderRadius: radius.lg,
          outline: "none",
          transition: transition.fast,
          "::placeholder": { color: color.muted },
        }}
        {...rest}
      />
    </div>
  );
}

// ── NavItem ───────────────────────────────
// variant: expanded (default) | collapsed (icon only)
export function NavItem({ icon, label, active, onClick, collapsed = false, style }) {
  const [hovered, setHovered] = useState(false);

  if (collapsed) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 20px", borderRadius: radius["2xl"], cursor: "pointer",
          background: active ? color.bgSurface : hovered ? "rgba(38,38,51,0.04)" : "transparent",
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: 16, width: 220, borderRadius: 10, cursor: "pointer",
        background: active ? color.bgSurface : hovered ? "rgba(38,38,51,0.04)" : "transparent",
        transition: transition.fast, ...style,
      }}
    >
      {icon && <span style={{ display: "flex", flexShrink: 0, width: 16, height: 16 }}>{icon}</span>}
      <span style={{
        fontSize: 16, fontWeight: 510, lineHeight: "1",
        color: "#262633",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Avatar ────────────────────────────────
// size: number (px), src or initials
export function Avatar({ initials, src, size = 32, bgColor, style }) {
  const bg = bgColor || color.black;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius.full,
      background: src ? "transparent" : bg,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...style,
    }}>
      {src
        ? <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : <span style={{ ...text.label, color: color.white, fontWeight: 600 }}>{initials}</span>
      }
    </div>
  );
}

// ── Badge ─────────────────────────────────
// status indicator dot
export function StatusDot({ status = "online", size = 8 }) {
  const colors = {
    online:  color.green,
    busy:    color.orange,
    offline: color.muted,
  };
  return (
    <span style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: radius.full,
      background: colors[status] || color.muted,
      flexShrink: 0,
    }} />
  );
}

// ── Tag / Chip ────────────────────────────
// variant: "default" | "blue" | "green" | "red" | "purple"
export function Tag({ children, variant = "default", style }) {
  const variants = {
    default: { background: color.bgSurface, color: color.sub,    border: `1px solid ${color.border}` },
    blue:    { background: color.blueBg,    color: color.blue,   border: "none" },
    green:   { background: color.greenBg,   color: color.green,  border: "none" },
    red:     { background: color.redBg,     color: color.danger, border: "none" },
    purple:  { background: color.purpleBg,  color: color.purple, border: "none" },
    black:   { background: color.black,     color: color.white,  border: "none" },
  };

  return (
    <span style={{
      ...base,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: radius.full,
      ...text.label,
      fontWeight: 500,
      ...variants[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}

// ── FilterTab ─────────────────────────────
// Горизонтальные табы (как в Данных)
export function FilterTab({ label, active, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 36,
        padding: "0 16px",
        borderRadius: radius.full,
        border: "none",
        cursor: "pointer",
        transition: transition.fast,
        ...text.bodyS,
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
  return (
    <div style={{
      height: 1,
      background: color.border,
      ...style,
    }} />
  );
}

// ── PageTitle ─────────────────────────────
export function PageTitle({ title, subtitle, style }) {
  return (
    <div style={{ marginBottom: sp[6], ...style }}>
      <h1 style={{ ...text.h1, color: color.ink, margin: 0 }}>{title}</h1>
      {subtitle && (
        <p style={{ ...text.bodyS, color: color.muted, margin: `${sp[1]}px 0 0` }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────
export function Card({ children, onClick, hoverable = false, padding, style }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: hovered ? color.bgHover : color.bgSurface,
        borderRadius: radius["2xl"],
        padding: padding ?? sp[5],
        cursor: onClick ? "pointer" : "default",
        transition: transition.fast,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── ListItem ──────────────────────────────
// Строка в списке файлов / встреч
export function ListItem({ icon, title, meta, right, onClick, style }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: sp[3],
        padding: `${sp[3]}px ${sp[4]}px`,
        borderRadius: radius.xl,
        background: hovered ? color.bgHover : "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: transition.fast,
        ...style,
      }}
    >
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: radius.md,
          background: color.bgSurface,
          border: `1px solid ${color.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...text.bodyS, fontWeight: 450, color: color.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </div>
        {meta && (
          <div style={{ ...text.caption, color: color.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {meta}
          </div>
        )}
      </div>
      {right && (
        <div style={{ flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}

// ── SectionLabel ─────────────────────────
export function SectionLabel({ children, style }) {
  return (
    <div style={{
      ...text.label,
      color: color.muted,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: sp[2],
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Sidebar ───────────────────────────────
// collapsed: boolean — иконки без подписей
// active: string — id активного пункта
export function Sidebar({ collapsed = false, active, onNavigate, user, style }) {
  const w = collapsed ? 56 : 240;

  const navTop = [
    { id: "widgets", label: "Виджеты" },
    { id: "chat",    label: "Чат Mary" },
    { id: "tasks",   label: "Задачи" },
    { id: "agents",  label: "Агенты" },
  ];
  const navBottom = [
    { id: "data",      label: "Мои данные" },
    { id: "integrations", label: "Интеграции" },
    { id: "settings",  label: "Настройки" },
    { id: "support",   label: "Поддержка" },
    { id: "telegram",  label: "Телеграм-бот" },
  ];

  const sidebarStyle = {
    width: w, minWidth: w, height: "100vh",
    background: "rgba(255,255,255,0.5)",
    borderRight: "1px solid rgba(38,38,51,0.05)",
    display: "flex", flexDirection: "column",
    position: "relative", flexShrink: 0,
    transition: transition.slow,
    ...style,
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 20px",
        display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
        gap: 5, height: 68, flexShrink: 0,
      }}>
        {/* Logo rendered via icon — insert your logo asset here */}
        <div style={{ width: 17, height: 21, background: color.black, borderRadius: radius.sm, flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: 450, color: "#262633" }}>mary</span>
        )}
      </div>

      {/* Top nav */}
      <div style={{ display: "flex", flexDirection: "column", padding: collapsed ? "0" : "0 10px", gap: 0 }}>
        {navTop.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => onNavigate?.(item.id)}
          />
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <div style={{ display: "flex", flexDirection: "column", padding: collapsed ? "0" : "0 10px", gap: 0, marginBottom: sp[2] }}>
        {navBottom.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => onNavigate?.(item.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(38,38,51,0.06)", margin: `0 ${sp[4]}px` }} />

      {/* Profile */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: sp[2], padding: `${sp[4]}px ${collapsed ? 0 : sp[5]}px`,
      }}>
        <Avatar
          initials={user?.initials || "В"}
          src={user?.avatar}
          size={36}
          bgColor={color.purple}
        />
        {!collapsed && user && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 14, color: "rgba(38,38,51,0.5)" }}>{user.plan}</div>
          </div>
        )}
      </div>
    </div>
  );
}
