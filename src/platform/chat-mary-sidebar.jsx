import { useState, useRef, useEffect } from "react";
import { color, transition } from "../ui/tokens.js";

export function ChatWelcome({ onSuggest, onDemo, children, onPickAudio, onRecord, recording, audioUploading }) {
  const [callMenuOpen, setCallMenuOpen] = useState(false);
  const callBtnRef = useRef(null);
  const localFileRef = useRef(null);
  useEffect(() => {
    if (!callMenuOpen) return;
    const onDoc = (e) => { if (!callBtnRef.current?.contains(e.target)) setCallMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [callMenuOpen]);
  const quickActions = [
    { label: "▶ Запустить пайплайн",  prompt: "запусти агентов" },
    { label: "Автоматизировать отдел", prompt: "Помоги автоматизировать отдел" },
    { label: "Поставить задачу",       prompt: "Помоги поставить задачу" },
    { label: "Подключить созвон",      isCall: true },
    { label: "Найти документ",         prompt: "Найди документ в базе знаний" },
    { label: "Метрики и отчёты",       prompt: "Покажи метрики за последнюю неделю" },
    { label: "Идеи постов",            prompt: "Предложи идеи постов на основе свежего ресёрча" },
    { label: "Подключить интеграцию",  prompt: "Помоги подключить новую интеграцию" },
    { label: "Авторизовать пример",    isDemo: true },
  ];
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
        fontSize: 32, fontWeight: 600, color: "#262633",
        letterSpacing: "-0.02em",
      }}>
        Что сделаем, Виктория?
      </div>
      {children && (
        <div style={{ width: "100%", maxWidth: 640 }}>
          {children}
        </div>
      )}

      <input ref={localFileRef} type="file" accept="audio/*,video/*"
        onChange={e => { const f = e.target.files?.[0]; if (f && onPickAudio) onPickAudio({ target: { files: [f], value: "" } }); e.target.value = ""; setCallMenuOpen(false); }}
        style={{ display: "none" }} />

      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        justifyContent: "center", marginTop: 4,
      }}>
        {quickActions.map((a, i) => {
          if (a.isCall) {
            const busy = recording || audioUploading;
            return (
              <div key={i} style={{ position: "relative" }} ref={callBtnRef}>
                <button
                  onClick={() => setCallMenuOpen(o => !o)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    height: 34, padding: "0 10px",
                    background: callMenuOpen || busy ? "rgba(38,38,51,0.08)" : "rgba(244,244,244,0.8)",
                    border: "none", borderRadius: 8,
                    fontSize: 12, fontWeight: 510, color: busy ? "#FF8B3D" : "#262633",
                    cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
                  }}
                  onMouseEnter={e => { if (!callMenuOpen && !busy) e.currentTarget.style.background = "rgba(38,38,51,0.08)"; }}
                  onMouseLeave={e => { if (!callMenuOpen && !busy) e.currentTarget.style.background = "rgba(244,244,244,0.8)"; }}
                >
                  <span style={{ fontSize: 14, display: "inline-flex" }}>
                    {recording ? "🔴" : audioUploading ? "⏳" : "📞"}
                  </span>
                  <span>
                    {recording ? "Запись… (клик чтобы стоп)" : audioUploading ? "Расшифровка…" : a.label}
                  </span>
                </button>
                {callMenuOpen && !busy && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                    background: color.white, border: "1px solid rgba(38,38,51,0.1)",
                    borderRadius: 12, boxShadow: "0 8px 24px rgba(38,38,51,0.12)",
                    padding: 4, minWidth: 240, zIndex: 20,
                    display: "flex", flexDirection: "column", gap: 1,
                  }}>
                    {[
                      { id: "rec",   icon: "🎤", label: "Записать сейчас (микрофон)", onClick: () => { setCallMenuOpen(false); onRecord?.(); } },
                      { id: "file",  icon: "📎", label: "Загрузить запись из файла",   onClick: () => { localFileRef.current?.click(); } },
                      { id: "div",   divider: true },
                      { id: "zoom",  icon: "🎥", label: "Подключить Zoom",         disabled: true, hint: "OAuth скоро" },
                      { id: "meet",  icon: "📹", label: "Подключить Google Meet",  disabled: true, hint: "OAuth скоро" },
                      { id: "tlmst", icon: "🅰️", label: "Подключить Яндекс.Телемост", disabled: true, hint: "API скоро" },
                    ].map(item => item.divider ? (
                      <div key={item.id} style={{ height: 1, background: "rgba(38,38,51,0.08)", margin: "3px 4px" }} />
                    ) : (
                      <button
                        key={item.id}
                        onClick={item.disabled ? undefined : item.onClick}
                        disabled={item.disabled}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px", background: "transparent",
                          border: "none", borderRadius: 7,
                          fontSize: 12.5, color: item.disabled ? "rgba(38,38,51,0.4)" : "#262633",
                          cursor: item.disabled ? "not-allowed" : "pointer",
                          fontFamily: "inherit", textAlign: "left",
                        }}
                        onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.hint && <span style={{ fontSize: 10.5, color: "rgba(38,38,51,0.4)" }}>{item.hint}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          const isDemo = a.isDemo;
          return (
            <button
              key={i}
              onClick={isDemo ? onDemo : () => onSuggest(a.prompt)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 34, padding: "0 10px",
                background: "rgba(244,244,244,0.8)",
                border: "none", borderRadius: 8,
                fontSize: 12, fontWeight: 510, color: "#262633",
                cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,244,244,0.8)"; }}
            >
              <img src="/icons/mary-puppy.png" alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
              <span>{a.label}</span>
            </button>
          );
        })}
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
        background: active ? "rgba(38,38,51,0.06)" : (hover ? "rgba(38,38,51,0.03)" : "transparent"),
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
            background: color.white, outline: "none",
            fontSize: 12, fontWeight: 510, color: "#262633",
            fontFamily: "inherit", padding: "2px 6px",
          }}
        />
      ) : (
        <span style={{
          flex: 1, minWidth: 0,
          fontSize: 12, color: "#262633", fontWeight: 510,
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
            background: menuOpen ? "rgba(38,38,51,0.08)" : color.white,
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 6,
            color: "rgba(38,38,51,0.55)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = color.white; }}
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
            background: color.white, borderRadius: 10,
            border: "1px solid rgba(38,38,51,0.08)",
            boxShadow: "0 6px 20px rgba(38,38,51,0.1)",
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
