import { useState, useRef, useEffect } from "react";
import { color, transition, cv } from "../ui/tokens.js";
import { I } from "./icons.jsx";

export function ChatWelcome({ onSuggest, children }) {
  const [sel, setSel] = useState(0);
  const quickActions = [
    {
      label: "Запустить пайплайн",
      icon: <I d={<><polygon points="6 4 19 12 6 20 6 4" /></>} size={15} />,
      prompts: [
        "Запусти всех агентов СММ-отдела и собери сводный отчёт",
        "Прогони пайплайн: ресёрч → черновики постов → публикация",
        "Покажи статус текущих пайплайнов и где сейчас затык",
      ],
    },
    {
      label: "Автоматизировать отдел",
      icon: <I d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>} size={15} />,
      prompts: [
        "Помоги автоматизировать рутину в отделе продаж",
        "Собери воркфлоу: заявка → квалификация → задача менеджеру",
        "Какие процессы в отделе можно отдать агентам?",
      ],
    },
    {
      label: "Поставить задачу",
      icon: <I d={<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>} size={15} />,
      prompts: [
        "Поставь задачу дизайнеру: баннер к акции на пятницу",
        "Создай задачу и назначь ответственного из команды",
        "Разбей большой проект на задачи с дедлайнами",
      ],
    },
    {
      label: "Найти документ",
      icon: <I d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>} size={15} />,
      prompts: [
        "Найди в базе знаний регламент по отпускам",
        "Покажи последние загруженные документы",
        "Найди презентацию по продукту за этот квартал",
      ],
    },
    {
      label: "Идеи постов",
      icon: <I d={<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" /></>} size={15} />,
      prompts: [
        "Предложи 5 идей постов на основе свежего ресёрча",
        "Дай контент-план для ТГ-канала на неделю",
        "Придумай посты под текущие тренды в нашей нише",
      ],
    },
  ];
  const arrow = <I d={<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>} size={16} stroke={1.6} />;
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
      width: "100%", maxWidth: 760, margin: "0 auto",
      padding: "20px 24px",
    }}>
      <img
        src="/icons/mary-puppy.png"
        alt="Mary"
        style={{ width: 130, height: 130, objectFit: "contain", flexShrink: 0 }}
      />
      <div style={{
        textAlign: "center",
        fontSize: 32, fontWeight: 600, color: cv.text,
        letterSpacing: "-0.02em",
      }}>
        Что сделаем, Виктория?
      </div>
      {children && (
        <div style={{ width: "100%", maxWidth: 640 }}>
          {children}
        </div>
      )}

      {/* Категории */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4,
        justifyContent: "center", marginTop: 4,
      }}>
        {quickActions.map((a, i) => {
          const active = sel === i;
          return (
            <button
              key={i}
              onClick={() => setSel(i)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                height: 36, padding: "0 14px",
                background: active ? cv.hover : "transparent",
                border: "none", borderRadius: 18,
                fontSize: 14, fontWeight: active ? 600 : 500,
                color: active ? cv.text : cv.muted,
                cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = cv.hover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ display: "inline-flex", color: active ? cv.text : cv.muted }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Быстрые запросы выбранной категории */}
      <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 2 }}>
        {quickActions[sel].prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSuggest(p)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              width: "100%", textAlign: "left",
              padding: "12px 14px",
              background: "transparent", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 450, color: cv.text,
              cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = cv.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ display: "inline-flex", color: cv.muted, flexShrink: 0 }}>{arrow}</span>
            <span>{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatItem({ c, active, onClick, onDelete, onTogglePin, onRename, pinned }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(c.title || "");
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);
  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== c.title) onRename(t);
    setRenaming(false);
  };
  return (
    <div
      onClick={renaming ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 6,
        height: 30, padding: "0 32px 0 10px",
        background: active ? cv.userBubble : (hover ? cv.hover : "transparent"),
        borderRadius: 8, cursor: renaming ? "text" : "pointer",
      }}
    >
      {pinned && !renaming && (
        <svg width={10} height={10} viewBox="0 0 24 24" fill="rgba(38,38,51,0.4)" style={{ flexShrink: 0 }}>
          <path d="M16 3l5 5-2 2-1-1-4 4 1 4-2 2-5-5-5 5v-2l5-5-5-5 2-2 4 1 4-4-1-1z" />
        </svg>
      )}
      {renaming ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(c.title || ""); setRenaming(false); }
          }}
          style={{
            flex: 1, minWidth: 0,
            border: "1px solid rgba(63,149,255,0.4)", borderRadius: 5,
            background: cv.bg, outline: "none",
            fontSize: 12, fontWeight: 510, color: cv.text,
            fontFamily: "inherit", padding: "2px 6px",
          }}
        />
      ) : (
        <span style={{
          flex: 1, minWidth: 0,
          fontSize: 12, color: cv.text, fontWeight: 510,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{c.title}</span>
      )}
      {(hover || menuOpen || active) && !renaming && (
        <button
          ref={menuRef}
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          title="Действия"
          style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            width: 22, height: 22, padding: 0,
            background: menuOpen ? cv.hover : cv.bg,
            border: `1px solid ${cv.border}`,
            borderRadius: 6,
            color: cv.muted, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = cv.userBubble; }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = cv.bg; }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
      )}
      {menuOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", right: 0, top: "100%", marginTop: 4,
            background: cv.bg, borderRadius: 10,
            border: `1px solid ${cv.border}`,
            boxShadow: "0 6px 20px var(--shadow)",
            padding: 4, zIndex: 10, minWidth: 160,
            display: "flex", flexDirection: "column", gap: 1,
          }}>
          {[
            { id: "pin", label: pinned ? "Открепить" : "Закрепить", onClick: () => { onTogglePin(); setMenuOpen(false); } },
            { id: "rename", label: "Переименовать", onClick: () => { setMenuOpen(false); setDraft(c.title || ""); setRenaming(true); } },
            { id: "delete", label: "Удалить", danger: true, onClick: () => { onDelete(); setMenuOpen(false); } },
          ].map(item => (
            <button key={item.id} onClick={item.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px", background: "transparent",
                border: "none", borderRadius: 6,
                fontSize: 12.5, color: item.danger ? "#FF3B30" : "#262633",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
