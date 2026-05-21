// Inline-input для Чата Mary + хук typewriter-плейсхолдера.
// Извлечено из TgKanalPage.jsx (Phase 2).
import { useState, useEffect } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";

// Переиспользуемая обёртка inline-input'а Mary (двухстрочная: text + actions row).
export function MaryInputBox({ text, setText, send, loading, onStop, placeholder }) {
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.12)",
      borderRadius: 16,
      padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <input
        data-testid="chat-mary-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder}
        disabled={loading}
        style={{
          width: "100%", border: "none", outline: "none",
          fontSize: 14, color: "#262633",
          background: "transparent", fontFamily: "inherit",
          padding: 0, minHeight: 22,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button title="Добавить из базы знаний" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent",
          border: "1px solid rgba(38,38,51,0.18)", borderRadius: "50%",
          color: "rgba(38,38,51,0.7)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.plus}</button>
        <button title="Прикрепить файл" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent", border: "none", borderRadius: 7,
          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.attach}</button>
        <div style={{ flex: 1 }} />
        <button title="Микрофон" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent", border: "none", borderRadius: 7,
          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.mic}</button>
        {loading && onStop ? (
          <button
            data-testid="chat-mary-stop"
            onClick={onStop}
            title="Остановить"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30,
              background: "#262633", border: "none", borderRadius: "50%",
              color: color.white, cursor: "pointer",
              fontFamily: "inherit", transition: transition.fast,
            }}>
            <svg width={11} height={11} viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
            </svg>
          </button>
        ) : (
        <button
          data-testid="chat-mary-send"
          onClick={() => send()}
          disabled={!text.trim() || loading}
          title="Отправить"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30,
            background: text.trim() && !loading ? "#262633" : "rgba(38,38,51,0.35)",
            border: "none", borderRadius: "50%",
            color: color.white,
            cursor: text.trim() && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: transition.fast,
          }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
        )}
      </div>
    </div>
  );
}

// Hook: typewriter-плейсхолдер для input — циклически печатает/стирает фразы.
export function useTypewriterPlaceholder(phrases, enabled) {
  const [text, setText] = useState(phrases[0] || "");
  useEffect(() => {
    if (!enabled) return;
    let phraseIdx = 0;
    let charIdx = phrases[0]?.length || 0;
    let phase = "pause-full"; // pause-full → erasing → pause-empty → typing → pause-full
    let timer;
    const tick = () => {
      const cur = phrases[phraseIdx];
      if (phase === "pause-full") {
        phase = "erasing";
        timer = setTimeout(tick, 1800);
      } else if (phase === "erasing") {
        charIdx = Math.max(0, charIdx - 2);
        setText(cur.slice(0, charIdx));
        if (charIdx === 0) {
          phase = "pause-empty";
          timer = setTimeout(tick, 280);
        } else {
          timer = setTimeout(tick, 25);
        }
      } else if (phase === "pause-empty") {
        phraseIdx = (phraseIdx + 1) % phrases.length;
        charIdx = 0;
        phase = "typing";
        timer = setTimeout(tick, 80);
      } else if (phase === "typing") {
        const next = phrases[phraseIdx];
        charIdx = Math.min(next.length, charIdx + 1);
        setText(next.slice(0, charIdx));
        if (charIdx === next.length) {
          phase = "pause-full";
          timer = setTimeout(tick, 2200);
        } else {
          timer = setTimeout(tick, 45 + Math.random() * 35);
        }
      }
    };
    timer = setTimeout(tick, 1200);
    return () => clearTimeout(timer);
  }, [enabled, phrases]);
  return text;
}
