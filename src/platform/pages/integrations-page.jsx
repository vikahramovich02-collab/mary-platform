import { useMemo, useState } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";

function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

const ALL_INTEGRATIONS = [
  { id: "telegram",   name: "Telegram",         desc: "Сообщения, каналы и входящие заявки",      logo: "/integrations/telegram.jpg", connected: true,  group: "channels" },
  { id: "figma",      name: "Figma",            desc: "Макеты, дизайн-системы и handoff",          logo: "/integrations/figma.webp",   connected: true,  group: "content" },
  { id: "gsheets",    name: "Google Sheets",    desc: "Таблицы, статусы и реестры заявок",         logo: "/integrations/sheets.png",   connected: true,  group: "ops" },
  { id: "gdrive",     name: "Google Drive",     desc: "Файлы, папки и документы команды",          logo: favicon("drive.google.com"),  group: "ops" },
  { id: "gdocs",      name: "Google Docs",      desc: "Скрипты, регламенты и документы",           logo: favicon("docs.google.com"),   group: "ops" },
  { id: "gforms",     name: "Google Forms",     desc: "Брифы, анкеты и сбор ответов",              logo: favicon("forms.google.com"),  group: "ops" },
  { id: "gcal",       name: "Google Calendar",  desc: "Расписание, записи и напоминания",          logo: favicon("calendar.google.com"), group: "ops" },
  { id: "notion",     name: "Notion",           desc: "База знаний и рабочая документация",        logo: favicon("notion.so"),         group: "knowledge" },
  { id: "slack",      name: "Slack",            desc: "Оповещения и переписка внутри команды",     logo: favicon("slack.com"),         group: "channels" },
  { id: "github",     name: "GitHub",           desc: "Репозитории, issues и техпроцессы",         logo: favicon("github.com"),        group: "ops" },
  { id: "linear",     name: "Linear",           desc: "Задачи и статусы разработки",               logo: favicon("linear.app"),        group: "ops" },
  { id: "tgstat",     name: "TG Stat",          desc: "Аналитика Telegram-каналов",                logo: favicon("tgstat.ru"),         group: "analytics" },
  { id: "hubspot",    name: "HubSpot",          desc: "CRM, лиды и воронка продаж",                logo: favicon("hubspot.com"),       group: "sales" },
  { id: "amplitude",  name: "Amplitude",        desc: "Продуктовая аналитика и события",           logo: favicon("amplitude.com"),     group: "analytics" },
  { id: "stripe",     name: "Stripe",           desc: "Платежи, подписки и чеки",                  logo: favicon("stripe.com"),        group: "sales" },
  { id: "openai",     name: "OpenAI",           desc: "LLM-модели для AI-сотрудников",             logo: favicon("openai.com"),        group: "models" },
  { id: "anthropic",  name: "Anthropic",        desc: "Claude-модели для сложных сценариев",       logo: favicon("anthropic.com"),     group: "models" },
];

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "connected", label: "Подключённые" },
  { id: "suggested", label: "Рекомендуемые" },
];

const SUGGESTED_IDS = new Set(["telegram", "gcal", "notion", "openai", "gsheets", "hubspot"]);

export function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState(ALL_INTEGRATIONS);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (activeFilter === "connected") return !!item.connected;
      if (activeFilter === "suggested") return SUGGESTED_IDS.has(item.id);
      return true;
    });
  }, [activeFilter, items, search]);

  function toggleConnect(id) {
    setItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, connected: !item.connected } : item
    )));
  }

  const connectedCount = items.filter((item) => item.connected).length;

  return (
    <div style={{ flex: 1, minWidth: 0, overflow: "auto", background: color.white }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 28px 88px" }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 44, lineHeight: 1.02, fontWeight: 600, color: "#262633", letterSpacing: "-0.04em" }}>
            Интеграции
          </div>
          <div style={{ marginTop: 12, maxWidth: 680, fontSize: 17, lineHeight: 1.5, color: "rgba(38,38,51,0.52)" }}>
            Подключи каналы, календари, таблицы и модели, чтобы Mary не просто отвечала в чате, а реально собирала рабочий отдел вокруг процесса.
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          marginBottom: 30,
          flexWrap: "wrap",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: 4,
            borderRadius: 18,
            background: "rgba(38,38,51,0.04)",
          }}>
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    border: "none",
                    borderRadius: 14,
                    padding: "10px 14px",
                    background: active ? color.white : "transparent",
                    boxShadow: active ? "0 1px 2px rgba(38,38,51,0.06)" : "none",
                    color: active ? "#262633" : "rgba(38,38,51,0.48)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: transition.fast,
                  }}
                >
                  {filter.label}
                  {filter.id === "connected" ? ` ${connectedCount}` : ""}
                </button>
              );
            })}
          </div>

          <label style={{
            width: "min(100%, 320px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            height: 42,
            borderRadius: 15,
            border: "1px solid rgba(38,38,51,0.10)",
            background: color.white,
            color: "rgba(38,38,51,0.42)",
          }}>
            <span style={{ display: "flex" }}>{ic.searching}</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Искать интеграции"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#262633",
                fontSize: 15,
                fontFamily: "inherit",
              }}
            />
          </label>
        </div>

        <div style={{
          borderTop: "1px solid rgba(38,38,51,0.08)",
          borderBottom: "1px solid rgba(38,38,51,0.08)",
          background: color.white,
        }}>
          {filteredItems.map((item, index) => (
            <IntegrationRow
              key={item.id}
              item={item}
              isLast={index === filteredItems.length - 1}
              onToggle={() => toggleConnect(item.id)}
            />
          ))}

          {filteredItems.length === 0 && (
            <div style={{ padding: "30px 8px", color: "rgba(38,38,51,0.5)", fontSize: 15 }}>
              Ничего не найдено. Попробуй другой запрос или переключи фильтр.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationCard({ it, onToggle }) {
  return <IntegrationRow item={it} isLast={false} onToggle={onToggle} />;
}

function IntegrationRow({ item, isLast, onToggle }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "18px 8px",
      borderBottom: isLast ? "none" : "1px solid rgba(38,38,51,0.07)",
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        overflow: "hidden",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <img src={item.logo} alt={item.name} style={{ width: 28, height: 28, objectFit: "contain" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, lineHeight: 1.2, fontWeight: 500, color: "#262633" }}>
          {item.name}
        </div>
        <div style={{ marginTop: 5, fontSize: 14, lineHeight: 1.45, color: "rgba(38,38,51,0.5)" }}>
          {item.desc}
        </div>
      </div>

      <button
        onClick={onToggle}
        aria-pressed={item.connected}
        title={item.connected ? "Отключить интеграцию" : "Подключить интеграцию"}
        style={{
          position: "relative",
          width: 44,
          height: 28,
          border: "none",
          borderRadius: 999,
          background: item.connected ? "#5B6CFF" : "rgba(38,38,51,0.14)",
          cursor: "pointer",
          transition: transition.fast,
          flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute",
          top: 3,
          left: item.connected ? 19 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: color.white,
          boxShadow: "0 1px 2px rgba(38,38,51,0.18)",
          transition: transition.fast,
        }} />
      </button>
    </div>
  );
}
