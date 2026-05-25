import { useState, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn, FilterChip } from "../chat-panel.jsx";
import { AGENTS } from "../agents-config.js";
import { KbPopup, AddKbPopup, TextViewerPopup, UserItemThumb, UserItemKindBadge, fmtBytes } from "./kb-content.jsx";
import { PeopleContent, IntegrationsContent } from "./people-content.jsx";
import { AgentsContent } from "./agents-content.jsx";

const RIGHT_W = 64;

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

const RAIL_DRAWER_TITLE = {
  tasks: "Задачи отдела",
  kb: "База знаний",
  integrations: "Интеграции",
  agents: "Агенты",
  people: "Люди",
};

export function RightRail({ activeRail, onSelect, chatSideActive, onToggleChatSide }) {
  const agentMini = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#262633">
      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" />
      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" />
      <circle cx="9.3" cy="13" r="1.4" fill="white" />
      <circle cx="14.7" cy="13" r="1.4" fill="white" />
    </svg>
  );
  const chatIcon = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#262633" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
    </svg>
  );
  const items = [
    { id: "tasks",        icon: ic.tasks,        label: "Задачи" },
    { id: "kb",           icon: ic.kb,           label: "База" },
    { id: "integrations", icon: ic.integrations, label: "Интеграции" },
    { id: "agents",       icon: agentMini,       label: "Агенты" },
    { id: "people",       icon: ic.people,       label: "Люди" },
  ];
  return (
    <aside style={{
      width: RIGHT_W, minWidth: RIGHT_W,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0",
      gap: 6,
    }}>
      {items.map(it => (
        <RailItem
          key={it.id}
          icon={it.icon}
          label={it.label}
          active={activeRail === it.id}
          onClick={() => onSelect(activeRail === it.id ? null : it.id)}
        />
      ))}
      <div style={{ width: 28, height: 1, background: "rgba(38,38,51,0.08)", margin: "4px 0" }} />
      <RailItem
        icon={chatIcon}
        label="Чат"
        active={chatSideActive}
        onClick={onToggleChatSide}
      />
    </aside>
  );
}

export function RailItem({ icon, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "8px 6px", width: 50, borderRadius: 10,
        background: active ? "rgba(38,38,51,0.05)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        cursor: "pointer", transition: transition.fast,
      }}
    >
      <span style={{ display: "flex", color: "#262633" }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#262633", lineHeight: 1.1 }}>{label}</span>
    </div>
  );
}

export function RailDrawer({ kind, onClose, agentsSelected, setAgentsSelected, kbUserItems, setKbUserItems, onCreateTask, pendingTasks }) {
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <aside style={{
      width: 360, minWidth: 360,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      {!(kind === "agents" && agentsSelected) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 510, color: "#262633", flex: 1 }}>
            {RAIL_DRAWER_TITLE[kind]}
          </span>
          {kind === "kb" && (
            <button
              onClick={() => setAddOpen(true)}
              title="Добавить материал"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "people" && (
            <button
              onClick={() => setInviteOpen(true)}
              title="Пригласить"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "tasks" && (
            <button
              onClick={onCreateTask}
              title="Поставить задачу через чат с Mary"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          <button onClick={onClose} style={{ ...zoomBtn, color: "rgba(38,38,51,0.55)", padding: 6 }}>
            {ic.close}
          </button>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        {kind === "tasks"        && <TasksContent pendingTasks={pendingTasks} />}
        {kind === "kb"           && <FilesContent addOpen={addOpen} onCloseAdd={() => setAddOpen(false)} userItems={kbUserItems} setUserItems={setKbUserItems} />}
        {kind === "integrations" && <IntegrationsContent />}
        {kind === "agents"       && (
          <AgentsContent selected={agentsSelected} onSelect={setAgentsSelected} />
        )}
        {kind === "people"       && <PeopleContent />}
      </div>
    </aside>
  );
}

export function TasksContent({ pendingTasks = [] }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const cronTasks = AGENTS.flatMap(a =>
    (a.tasks || []).filter(t => t.cron).map(t => ({ ...t, agent: a }))
  );

  function TaskCard({ t, agentBadge }) {
    const isCron = !!t.cron;
    const iconColor = isCron ? "#7A86FF" : "#3F95FF";
    return (
      <div style={{ ...drawerRow, cursor: "pointer" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconColor + "1F",
          color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {isCron ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
          {agentBadge && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: agentBadge.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>{agentBadge.label}</span>
            </div>
          )}
        </div>
        {isCron && (
          <span style={{
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            fontFamily: "ui-monospace, SF Mono, monospace",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>{t.cron.replace(/^cron\s*/, "")}</span>
        )}
        <button
          title={`Открыть «${t.out}» в базе знаний`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 8,
            background: "transparent",
            color: "rgba(38,38,51,0.55)",
            border: "none",
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {ic.arrowRight}
        </button>
      </div>
    );
  }

  function GroupHeader({ dotColor, label, icon, isCollapsed, onToggle }) {
    return (
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 4px",
          width: "100%",
          background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        {icon ? icon : (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 14, fontWeight: 500, color: "#262633" }}>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          display: "inline-flex",
          color: "rgba(38,38,51,0.45)",
          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
        }}>{ic.chevron}</span>
      </button>
    );
  }

  const clockIcon = (
    <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.55)" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {cronTasks.length > 0 && (
        <div>
          <GroupHeader
            label={`Крон-задачи · ${cronTasks.length}`}
            icon={clockIcon}
            isCollapsed={!!collapsed.cron}
            onToggle={() => toggle("cron")}
          />
          {!collapsed.cron && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cronTasks.map((t, i) => (
                <TaskCard key={`cron-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
              ))}
            </div>
          )}
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div>
          <GroupHeader
            dotColor="#FFD60A"
            label={`Ожидает принятия · ${pendingTasks.length}`}
            isCollapsed={!!collapsed.pending}
            onToggle={() => toggle("pending")}
          />
          {!collapsed.pending && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pendingTasks.map(t => (
                <div key={t.id} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD60A", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                        {t.kind === "agent" ? `${t.assignee}-агенту` : t.assignee} · {t.status} · поставлено в {t.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(() => {
        const otherTasks = AGENTS.flatMap(a =>
          (a.tasks || []).filter(t => !t.cron).map(t => ({ ...t, agent: a }))
        );
        if (otherTasks.length === 0) return null;
        return (
          <div>
            <GroupHeader
              dotColor="#34C759"
              label={`В работе · ${otherTasks.length}`}
              isCollapsed={!!collapsed.work}
              onToggle={() => toggle("work")}
            />
            {!collapsed.work && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {otherTasks.map((t, i) => (
                  <TaskCard key={`other-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export function FilesContent({ addOpen, onCloseAdd, userItems = [], setUserItems }) {
  const [tab, setTab] = useState("in");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [serverFiles, setServerFiles] = useState([]);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/mary/kb/files")
        .then(r => r.ok ? r.json() : { files: [] })
        .then(d => { if (active) setServerFiles(d.files || []); })
        .catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const items = AGENTS.flatMap(a => {
    const list = tab === "in" ? (a.kb?.inputs || []) : (a.kb?.outputs || []);
    return list.map(it => ({ ...it, agent: a }));
  });

  function addUserItem(it) {
    setUserItems(prev => [it, ...prev]);
  }
  async function openServerFile(name) {
    const r = await fetch("/api/mary/kb/file?name=" + encodeURIComponent(name));
    if (!r.ok) return;
    const d = await r.json();
    setTextView({ name: d.name, body: d.content, kind: "text", meta: `${d.length} симв. · от Mary` });
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 0 12px" }}>
        <FilterChip label="Получено" active={tab === "in"}  onClick={() => setTab("in")} />
        <FilterChip label="Сделано"  active={tab === "out"} onClick={() => setTab("out")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tab === "in" && serverFiles.map((f, i) => (
          <div
            key={`srv-${i}`}
            onClick={() => openServerFile(f.name)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(52,199,89,0.14)", color: "#34C759",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>{ic.fileSm || ic.file}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {fmtBytes(f.size)} · от Mary · {new Date(f.modified).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#34C759",
              background: "rgba(52,199,89,0.12)",
              padding: "2px 7px", borderRadius: 999,
            }}>MARY</span>
          </div>
        ))}
        {tab === "in" && userItems.map((it, i) => {
          const canOpenFile = (it.kind === "file" || it.kind === "image") && it.data;
          const isLink = it.kind === "link";
          const isText = it.kind === "text" && it.body;
          function open() {
            if (isLink) { window.open(it.name, "_blank"); return; }
            if (canOpenFile) { window.open(it.data, "_blank"); return; }
            if (isText) { setTextView(it); return; }
          }
          const clickable = canOpenFile || isLink || isText;
          return (
            <div
              key={`u-${i}`}
              onClick={clickable ? open : undefined}
              title={clickable ? "Открыть" : ""}
              style={{ ...drawerRow, cursor: clickable ? "pointer" : "default" }}
            >
              <UserItemThumb it={it} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <UserItemKindBadge kind={it.kind} />
                  <span>{it.meta}</span>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#7A86FF",
                background: "rgba(122,134,255,0.12)",
                padding: "2px 7px", borderRadius: 999,
              }}>NEW</span>
            </div>
          );
        })}

        {items.map((it, i) => (
          <div
            key={i}
            onClick={() => setOpened(it)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: it.agent.color + "1A",
              color: it.agent.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {tab === "in" ? ic.inboxArrow : ic.package}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.agent.color }} />
                <span>{it.agent.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {opened && <KbPopup item={opened} onClose={() => setOpened(null)} />}
      {addOpen && <AddKbPopup onAdd={addUserItem} onClose={onCloseAdd} />}
      {textView && <TextViewerPopup item={textView} onClose={() => setTextView(null)} />}
    </>
  );
}
