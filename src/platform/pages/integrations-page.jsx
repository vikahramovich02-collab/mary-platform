import { useState } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";

// ── Страница «Интеграции» ───────────────────────────────────
// Логотипы — Google favicon API (реальные брендовые иконки сервисов)
function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
const ALL_INTEGRATIONS = [
  { id: "telegram",   name: "Telegram",         desc: "Парсинг каналов, чтение метрик постов", logo: "/integrations/telegram.jpg", connected: true },
  { id: "figma",      name: "Figma",            desc: "Сборка финального макета поста",        logo: "/integrations/figma.webp",   connected: true },
  { id: "gsheets",    name: "Google Sheets",    desc: "Хранение данных и таблиц",              logo: "/integrations/sheets.png",   connected: true },
  { id: "gdrive",     name: "Google Drive",     desc: "Файловое хранилище",                    logo: favicon("drive.google.com") },
  { id: "gdocs",      name: "Google Docs",      desc: "Тексты и документы",                    logo: favicon("docs.google.com") },
  { id: "gforms",     name: "Google Forms",     desc: "Опросы и анкеты",                       logo: favicon("forms.google.com") },
  { id: "gcal",       name: "Google Calendar",  desc: "События и расписание",                  logo: favicon("calendar.google.com") },
  { id: "gads",       name: "Google Ads",       desc: "Управление рекламными кампаниями",      logo: favicon("ads.google.com") },
  { id: "ganalytics", name: "Google Analytics", desc: "Веб-аналитика сайта",                   logo: favicon("analytics.google.com") },
  { id: "gmail",      name: "Gmail",            desc: "Email и переписка",                     logo: favicon("mail.google.com") },
  { id: "notion",     name: "Notion",           desc: "База знаний и документация",            logo: favicon("notion.so") },
  { id: "slack",      name: "Slack",            desc: "Уведомления и переписка команды",       logo: favicon("slack.com") },
  { id: "github",     name: "GitHub",           desc: "Репозитории и issues",                  logo: favicon("github.com") },
  { id: "linear",     name: "Linear",           desc: "Управление задачами",                   logo: favicon("linear.app") },
  { id: "tgstat",     name: "TG Stat",          desc: "Аналитика Telegram-каналов",            logo: favicon("tgstat.ru") },
  { id: "miro",       name: "Miro",             desc: "Доски для брейнштормов",                logo: favicon("miro.com") },
  { id: "hubspot",    name: "HubSpot",          desc: "CRM и продажи",                         logo: favicon("hubspot.com") },
  { id: "amplitude",  name: "Amplitude",        desc: "Продуктовая аналитика",                 logo: favicon("amplitude.com") },
  { id: "stripe",     name: "Stripe",           desc: "Приём платежей",                        logo: favicon("stripe.com") },
  { id: "openai",     name: "OpenAI",           desc: "GPT-модели для агентов",                logo: favicon("openai.com") },
  { id: "anthropic",  name: "Anthropic",        desc: "Claude-модели для агентов",             logo: favicon("anthropic.com") },
  { id: "midjourney", name: "Midjourney",       desc: "Генерация изображений",                 logo: favicon("midjourney.com") },
];

export function IntegrationsPage({ onOpenChat }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(ALL_INTEGRATIONS);

  const q = search.trim().toLowerCase();
  const matched = items.filter(it => !q || it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
  const connected = matched.filter(it => it.connected);
  const available = matched.filter(it => !it.connected);

  function toggleConnect(id) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, connected: !it.connected } : it));
  }

  return (
    <div style={{ flex: 1, minWidth: 0, padding: "20px 24px 80px", overflow: "auto", background: color.white }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#262633", marginBottom: 18 }}>Интеграции</div>

        {/* Поиск + кнопка */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px",
            background: "rgba(38,38,51,0.04)",
            border: "none",
            borderRadius: 999,
          }}>
            <span style={{ display: "flex", color: "rgba(38,38,51,0.45)" }}>{ic.searching}</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по интеграциям…"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent",
                fontSize: 13, fontFamily: "inherit", color: "#262633",
              }}
            />
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "0 16px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <span>+</span><span>Подключить</span>
          </button>
        </div>

        {/* Подключённые */}
        {connected.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginBottom: 12, fontWeight: 500 }}>
              Подключённые · {connected.length}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}>
              {connected.map(it => (
                <IntegrationCard key={it.id} it={it} onToggle={() => toggleConnect(it.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Доступные */}
        {available.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginBottom: 12, fontWeight: 500 }}>
              Доступные · {available.length}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}>
              {available.map(it => (
                <IntegrationCard key={it.id} it={it} onToggle={() => toggleConnect(it.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Мини-чат «Спросить у Mary» по центру снизу */}
      <button
        onClick={onOpenChat}
        style={{
          position: "fixed",
          left: "50%", bottom: 24,
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "0 4px 14px rgba(38,38,51,0.08)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          zIndex: 5,
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>{ic.spark}</span>
      </button>
    </div>
  );
}

export function IntegrationCard({ it, onToggle }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: h ? "rgba(38,38,51,0.04)" : "rgba(38,38,51,0.025)",
        borderRadius: 10,
        transition: transition.fast,
      }}
    >
      {/* Логотип */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        overflow: "hidden",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <img src={it.logo} alt={it.name} style={{ width: 22, height: 22, objectFit: "contain" }} />
      </div>
      {/* Название + описание */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>{it.name}</div>
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.desc}</div>
      </div>
      {/* Кнопка */}
      {it.connected ? (
        <button
          onClick={onToggle}
          style={{
            padding: "6px 12px",
            background: "transparent",
            color: "rgba(38,38,51,0.7)",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 999,
            fontSize: 12, fontWeight: 450,
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
        >Отключить</button>
      ) : (
        <button
          onClick={onToggle}
          style={{
            padding: "6px 14px",
            background: "#262633",
            color: color.white,
            border: "none", borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
        >Подключить</button>
      )}
    </div>
  );
}
