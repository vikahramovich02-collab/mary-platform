import { useState } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn, FilterChip } from "../chat-panel.jsx";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { AGENTS } from "../agents-config.js";

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

const profileMetaRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 12px",
  background: "rgba(38,38,51,0.03)",
  borderRadius: 9,
  fontSize: 12.5,
};
const profileMetaLabel = { color: "rgba(38,38,51,0.5)" };
const profileMetaValue = { color: "#262633", fontWeight: 450 };

export function PeopleContent() {
  const [tab, setTab] = useState("all");
  const [profile, setProfile] = useState(null);
  const people = usePeople();
  const source = people.length > 0 ? people : MOCK_PEOPLE;
  const list = tab === "approvers" ? source.filter(p => p.role === "approver") : source;
  return (
    <>
      <div style={{ display: "flex", gap: 4, padding: "0 0 12px" }}>
        <FilterChip label="Все"      active={tab === "all"}       onClick={() => setTab("all")} />
        <FilterChip label="Апруверы" active={tab === "approvers"} onClick={() => setTab("approvers")} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map(p => (
          <div
            key={p.id}
            onClick={() => setProfile(p)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: p.color + "26", color: p.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: 13, fontWeight: 600,
              overflow: "hidden",
            }}>
              {p.avatar
                ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : p.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{p.name}</span>
                {p.role === "approver" && (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "1px 6px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {p.title} · {p.handle}
              </div>
            </div>
          </div>
        ))}
      </div>
      {profile && <ProfilePopup person={profile} onClose={() => setProfile(null)} />}
    </>
  );
}

export function ProfilePopup({ person, onClose }) {
  const [mode, setMode] = useState("view");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          {mode === "message" ? (
            <button
              onClick={() => { setMode("view"); setText(""); setSent(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "transparent", border: "none", padding: "6px 8px",
                fontSize: 13, color: "rgba(38,38,51,0.6)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Профиль
            </button>
          ) : <span />}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {mode === "view" && (
          <>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "16px 18px 18px",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 600,
                overflow: "hidden",
                marginBottom: 12,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 510, color: "#262633" }}>{person.name}</span>
                {person.role === "approver" && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "2px 7px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(38,38,51,0.6)", marginTop: 4 }}>{person.title}</div>
              <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>{person.handle}</div>
            </div>

            <div style={{
              padding: "0 18px 14px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>В команде</span>
                <span style={profileMetaValue}>с {person.joined}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Активность</span>
                <span style={profileMetaValue}>{person.lastActive}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Роль</span>
                <span style={profileMetaValue}>{person.role === "approver" ? "Апрувер" : "Сотрудник"}</span>
              </div>
            </div>

            {!person.isMe && (
              <div style={{
                padding: "12px 18px 18px",
                borderTop: "1px solid rgba(38,38,51,0.06)",
                display: "flex", gap: 8,
              }}>
                <button
                  onClick={() => setMode("message")}
                  style={{
                    flex: 1, height: 38,
                    background: "#262633", color: color.white,
                    border: "none", borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >Написать сообщение</button>
                <button
                  style={{
                    height: 38, padding: "0 14px",
                    background: color.white, color: "#262633",
                    border: "1px solid rgba(38,38,51,0.12)",
                    borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >{person.role === "approver" ? "Снять апрувера" : "Сделать апрувером"}</button>
                <button
                  title="Удалить из команды"
                  style={{
                    height: 38, width: 38,
                    background: color.white, color: "#FF3407",
                    border: "1px solid rgba(255,52,7,0.2)",
                    borderRadius: 10,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {mode === "message" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 14px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, overflow: "hidden", flexShrink: 0,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{person.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>уйдёт во Входящие</div>
              </div>
            </div>

            <div style={{ padding: "0 18px" }}>
              {sent ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 14, color: "#262633" }}>
                  Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
                </div>
              ) : (
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                  placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
                  style={{
                    width: "100%", minHeight: 140, padding: "12px 14px",
                    background: color.white,
                    border: "1px solid rgba(38,38,51,0.1)",
                    borderRadius: 12,
                    fontSize: 14, color: "#262633", lineHeight: 1.5,
                    fontFamily: "inherit", outline: "none", resize: "vertical",
                  }}
                />
              )}
            </div>

            {!sent && (
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 8,
                padding: "14px 18px 18px",
              }}>
                <button onClick={() => setMode("view")} style={{
                  height: 36, padding: "0 14px",
                  background: color.white, color: "#262633",
                  border: "1px solid rgba(38,38,51,0.12)",
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Отмена</button>
                <button onClick={send} disabled={!text.trim()} style={{
                  height: 36, padding: "0 16px",
                  background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
                  color: color.white,
                  border: "none", borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}>Отправить</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SendMessagePopup({ person, onClose }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: person.color + "26", color: person.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 14, fontWeight: 600,
            overflow: "hidden",
          }}>
            {person.avatar
              ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>{person.name}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
              {person.title} · {person.handle}
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        <div style={{ padding: 18 }}>
          {sent ? (
            <div style={{
              padding: "32px 12px", textAlign: "center",
              fontSize: 14, color: "#262633",
            }}>
              Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
            </div>
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
              style={{
                width: "100%", minHeight: 140, padding: "12px 14px",
                background: color.white,
                border: "1px solid rgba(38,38,51,0.1)",
                borderRadius: 12,
                fontSize: 14, color: "#262633", lineHeight: 1.5,
                fontFamily: "inherit", outline: "none", resize: "vertical",
              }}
            />
          )}
        </div>

        {!sent && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            padding: "0 18px 18px",
          }}>
            <button onClick={onClose} style={{
              height: 36, padding: "0 14px",
              background: color.white, color: "#262633",
              border: "1px solid rgba(38,38,51,0.12)",
              borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>Отмена</button>
            <button onClick={send} disabled={!text.trim()} style={{
              height: 36, padding: "0 16px",
              background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
              color: color.white,
              border: "none", borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}>Отправить</button>
          </div>
        )}
      </div>
    </div>
  );
}

const INTEGRATION_LOGOS = {
  "Telegram":      "/integrations/telegram.jpg",
  "Figma":         "/integrations/figma.webp",
  "Google Sheets": "/integrations/sheets.png",
};

export function IntegrationsContent() {
  const map = new Map();
  AGENTS.forEach(a => {
    (a.integrations || []).forEach(it => {
      if (!map.has(it.name)) {
        map.set(it.name, { ...it, agents: [a] });
      } else {
        const ex = map.get(it.name);
        ex.agents.push(a);
        if (it.on) ex.on = true;
      }
    });
  });
  const list = Array.from(map.values());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {list.map((it, i) => {
        const logo = INTEGRATION_LOGOS[it.name];
        return (
        <div key={i} style={drawerRow}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(38,38,51,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.6)", flexShrink: 0,
            overflow: "hidden",
            padding: 4,
          }}>
            {logo
              ? <img src={logo} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : ic.integrations}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11.5, fontWeight: 400,
            color: it.on ? "rgba(38,38,51,0.55)" : "rgba(38,38,51,0.4)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: it.on ? "#34C759" : "rgba(38,38,51,0.25)",
            }} />
            {it.on ? "Активна" : "Выкл"}
          </span>
        </div>
        );
      })}
    </div>
  );
}
