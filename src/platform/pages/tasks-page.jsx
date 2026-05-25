import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { AGENTS } from "../agents-config.js";
import { usePeople, MOCK_PEOPLE } from "../people.js";

// ── Доп. мок задач на реальных людей (кроме AGENTS.tasks) ─────────────────────
const PEOPLE_TASKS = [
  { id: "p1", title: "Согласовать контент-план на май", desc: "проверить идеи Маркетолога", assigneeKind: "person", assigneeId: "vika",  status: "На апруве",   dept: "smm", channel: "tg-kanal" },
  { id: "p2", title: "Снять короткое видео с лица бренда", desc: "30 сек, формат Reels",     assigneeKind: "person", assigneeId: "vika",  status: "Запланирована", dept: "smm", channel: "tg-kanal" },
  { id: "p3", title: "Написать манифест канала", desc: "большой пилотный пост",              assigneeKind: "person", assigneeId: "katya", status: "В работе",     dept: "smm", channel: "tg-kanal" },
  { id: "p4", title: "Подобрать 5 экспертов для интервью", desc: "из ниши indie-hackers",     assigneeKind: "person", assigneeId: "ivan",  status: "В работе",     dept: "smm", channel: "tg-kanal" },
  { id: "p5", title: "Обновить визуальный гайд бренда", desc: "обновить палитру и шрифты",   assigneeKind: "person", assigneeId: "maria", status: "Готово",       dept: "smm", channel: "tg-kanal" },
];

const KANBAN_COLUMNS = [
  { id: "Запланирована", label: "Запланировано", color: "rgba(38,38,51,0.45)" },
  { id: "В работе",       label: "В работе",      color: "#3F95FF" },
  { id: "На апруве",      label: "На апруве",     color: "#FF8B3D" },
  { id: "Готово",         label: "Готово",        color: "#34C759" },
];

const TASK_COLUMNS = [
  { id: "backlog", label: "Бэклог",   color: "#3F95FF" },
  { id: "doing",   label: "В работе", color: "#FF8B3D" },
  { id: "blocked", label: "Блокеры",  color: "#FF3B30" },
  { id: "done",    label: "Готово",   color: "#34C759" },
];

const SOURCE_TAG = {
  mary:       { label: "Mary",    bg: "rgba(255,139,61,0.12)",  fg: "#FF8B3D" },
  transcript: { label: "Звонок",  bg: "rgba(63,149,255,0.12)",  fg: "#3F95FF" },
  decision:   { label: "Решение", bg: "rgba(122,134,255,0.12)", fg: "#7A86FF" },
  manual:     { label: "Вручную", bg: "rgba(38,38,51,0.06)",    fg: "rgba(38,38,51,0.6)" },
};

export function TasksKanbanPage() {
  const [tasks, setTasks] = useState([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [view, setView] = useState("board"); // board | list | timeline | due
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [newDraft, setNewDraft] = useState(null); // {columnId, title}
  const [departments, setDepartments] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const reload = () => {
    const q = deptFilter === "all" ? "" : `?deptId=${deptFilter}`;
    fetch(`/api/mary/tasks${q}`).then(r => r.json()).then(d => setTasks(d.tasks || []));
  };
  useEffect(() => { reload(); }, [deptFilter]);
  useEffect(() => {
    fetch("/api/mary/departments").then(r => r.json()).then(d => setDepartments(d.departments || []));
  }, []);

  const tasksByColumn = (col) => tasks.filter(t => t.status === col);
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const createTask = async (columnId, title) => {
    if (!title?.trim()) return;
    await fetch("/api/mary/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        status: columnId,
        deptId: deptFilter === "all" ? "general" : deptFilter,
        source: { type: "manual" },
      }),
    });
    setNewDraft(null);
    reload();
  };

  const moveTask = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await fetch(`/api/mary/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    reload();
  };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "26px 40px 18px", maxWidth: 1400 }}>
          {/* Breadcrumb */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
            fontSize: 12.5, color: "rgba(38,38,51,0.55)",
          }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>›</span>
            <span>Доска</span>
            <span>›</span>
            <span style={{
              padding: "2px 8px", background: "rgba(38,38,51,0.06)", borderRadius: 5,
              color: "#262633", fontWeight: 500,
            }}>Обзор</span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 26, fontWeight: 600, color: "#262633",
            margin: "0 0 18px", letterSpacing: "-0.01em",
          }}>Задачи</h1>

          {/* View-tabs + actions */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 22,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "board",    label: "Доска" },
                { id: "list",     label: "Список" },
                { id: "timeline", label: "Неделя" },
                { id: "due",      label: "Дедлайны" },
              ].map(t => (
                <button key={t.id} onClick={() => setView(t.id)}
                  style={{
                    padding: "7px 14px",
                    background: view === t.id ? "#262633" : "transparent",
                    color: view === t.id ? color.white : "#262633",
                    border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    transition: transition.fast,
                  }}>{t.label}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            {/* Dept selector */}
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              style={{
                padding: "7px 10px", border: "1px solid rgba(38,38,51,0.12)", borderRadius: 8,
                fontSize: 13, color: "#262633", background: color.white,
                fontFamily: "inherit", outline: "none", cursor: "pointer",
              }}>
              <option value="all">Все отделы</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={async () => {
              const r = await fetch("/api/mary/tasks/morning-digest", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deptId: deptFilter === "all" ? null : deptFilter }),
              });
              const d = await r.json();
              alert("☀️ Утренний дайджест Mary:\n\n" + (d.digest || "—") + (d.topPicks?.length ? "\n\nТоп-3:\n" + d.topPicks.map(p => "• " + (tasks.find(t => t.id === p.id)?.title || p.id) + " — " + p.why).join("\n") : ""));
            }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 12px", background: "transparent",
                border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 13, color: "#262633", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>☀️ Дайджест</button>
            <button onClick={() => setNewDraft({ columnId: "backlog", title: "" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", background: "#262633", color: color.white,
                border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Новая задача
            </button>
          </div>

          {/* Kanban */}
          {view === "board" && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 40 }}>
              {TASK_COLUMNS.map(col => {
                const items = tasksByColumn(col.id);
                const isDragOver = dragOverCol === col.id;
                return (
                  <div key={col.id}
                    onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={e => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) moveTask(id, col.id);
                      setDragOverCol(null);
                      setDraggingId(null);
                    }}
                    style={{
                      width: 290, minWidth: 290,
                      background: isDragOver ? "rgba(38,38,51,0.03)" : "transparent",
                      borderRadius: 12, padding: 4, transition: "background 0.15s",
                    }}>
                    {/* Column header */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "6px 8px 10px",
                    }}>
                      <span style={{ width: 3, height: 14, background: col.color, borderRadius: 2 }} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633" }}>{col.label}</span>
                      <span style={{ fontSize: 12, color: "rgba(38,38,51,0.5)" }}>{items.length}</span>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => setNewDraft({ columnId: col.id, title: "" })}
                        title="Добавить" style={{
                          width: 22, height: 22, padding: 0,
                          background: "transparent", border: "none", borderRadius: 5,
                          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                    {/* Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map(t => (
                        <TaskCard key={t.id} t={t}
                          departments={departments}
                          onClick={() => setActiveTaskId(t.id)}
                          draggable
                          onDragStart={e => { e.dataTransfer.setData("text/plain", t.id); setDraggingId(t.id); }}
                          onDragEnd={() => setDraggingId(null)}
                          isDragging={draggingId === t.id}
                        />
                      ))}
                      {newDraft?.columnId === col.id && (
                        <input
                          autoFocus
                          value={newDraft.title}
                          onChange={e => setNewDraft({ ...newDraft, title: e.target.value })}
                          onBlur={() => { createTask(col.id, newDraft.title); }}
                          onKeyDown={e => {
                            if (e.key === "Enter") createTask(col.id, newDraft.title);
                            if (e.key === "Escape") setNewDraft(null);
                          }}
                          placeholder="Название задачи"
                          style={{
                            padding: "10px 12px",
                            background: color.white,
                            border: "1px solid #3F95FF", borderRadius: 10,
                            fontSize: 13, fontWeight: 500, color: "#262633",
                            outline: "none", fontFamily: "inherit",
                          }}
                        />
                      )}
                      {newDraft?.columnId !== col.id && (
                        <button onClick={() => setNewDraft({ columnId: col.id, title: "" })}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 12px", background: "transparent",
                            border: "none", borderRadius: 8,
                            fontSize: 12.5, color: "rgba(38,38,51,0.5)",
                            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Добавить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && (
            <TasksListView tasks={tasks} departments={departments} onPick={id => setActiveTaskId(id)} onUpdate={async (id, patch) => {
              await fetch(`/api/mary/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
              reload();
            }} />
          )}
          {view === "due" && (
            <TasksListView
              tasks={tasks.filter(t => t.dueDate).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))}
              departments={departments} onPick={id => setActiveTaskId(id)} onUpdate={async (id, patch) => {
                await fetch(`/api/mary/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
                reload();
              }} emptyLabel="Нет задач с дедлайном" />
          )}
          {view === "timeline" && (
            <TasksWeekView tasks={tasks} departments={departments} onPick={id => setActiveTaskId(id)} />
          )}
        </div>
      </div>

      {/* Drawer задачи */}
      {activeTask && (
        <TaskDrawer
          task={activeTask}
          departments={departments}
          onClose={() => setActiveTaskId(null)}
          onUpdate={async (patch) => {
            await fetch(`/api/mary/tasks/${activeTask.id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(patch),
            });
            reload();
          }}
          onDelete={async () => {
            if (!confirm("Удалить задачу?")) return;
            await fetch(`/api/mary/tasks/${activeTask.id}`, { method: "DELETE" });
            setActiveTaskId(null);
            reload();
          }}
          onComment={async (text) => {
            await fetch(`/api/mary/tasks/${activeTask.id}/comment`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, author: "Виктория" }),
            });
            reload();
          }}
        />
      )}
    </div>
  );
}

export function TaskCard({ t, departments, onClick, draggable, onDragStart, onDragEnd, isDragging }) {
  const dept = departments.find(d => d.id === t.deptId);
  const src = SOURCE_TAG[t.source?.type] || SOURCE_TAG.manual;
  return (
    <div
      onClick={onClick}
      draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}
      style={{
        background: color.white, border: "1px solid rgba(38,38,51,0.08)",
        borderRadius: 10, padding: "12px 14px",
        cursor: "pointer", opacity: isDragging ? 0.4 : 1,
        transition: "opacity 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(38,38,51,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {dept && (
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginBottom: 6 }}>
          Отдел: <span style={{ color: dept.color, fontWeight: 500 }}>{dept.name}</span>
        </div>
      )}
      <div style={{
        fontSize: 13.5, fontWeight: 510, color: "#262633",
        lineHeight: 1.35, marginBottom: 10,
      }}>{t.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {t.ownerId && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 7px 2px 2px",
            background: "rgba(38,38,51,0.05)", borderRadius: 999,
            fontSize: 11.5, color: "#262633",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              background: dept?.color || "#7A86FF", color: color.white,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 600,
            }}>{(t.ownerId[0] || "?").toUpperCase()}</span>
            {t.ownerId}
          </span>
        )}
        <span style={{
          padding: "2px 8px", background: src.bg, color: src.fg,
          borderRadius: 999, fontSize: 11, fontWeight: 500,
        }}>{src.label}</span>
        {t.priority === "high" && (
          <span style={{
            padding: "2px 7px", background: "rgba(255,59,48,0.12)", color: "#FF3B30",
            borderRadius: 999, fontSize: 11, fontWeight: 500,
          }}>↑ важно</span>
        )}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        fontSize: 11, color: "rgba(38,38,51,0.5)",
      }}>
        {t.comments?.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t.comments.length}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {t.dueDate && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {t.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}

// ── List view: плоский список с сортировкой по колонке ──
export function TasksListView({ tasks, departments, onPick, onUpdate, emptyLabel = "Пока нет задач" }) {
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const sortClick = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const sorted = [...tasks].sort((a, b) => {
    const va = a[sortBy] || "", vb = b[sortBy] || "";
    const r = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? r : -r;
  });
  if (!sorted.length) {
    return (
      <div style={{
        padding: 60, textAlign: "center",
        fontSize: 14, color: "rgba(38,38,51,0.45)",
        border: "1px dashed rgba(38,38,51,0.12)", borderRadius: 12,
      }}>{emptyLabel}</div>
    );
  }
  const cols = [
    { id: "title",     label: "Задача", flex: 3 },
    { id: "deptId",    label: "Отдел",  flex: 1 },
    { id: "ownerId",   label: "Owner",  flex: 1 },
    { id: "status",    label: "Статус", flex: 1 },
    { id: "priority",  label: "Приор.", flex: 0.6 },
    { id: "dueDate",   label: "Due",    flex: 1 },
  ];
  return (
    <div style={{
      border: "1px solid rgba(38,38,51,0.08)", borderRadius: 12,
      overflow: "hidden", background: color.white,
    }}>
      {/* Заголовки */}
      <div style={{
        display: "flex", gap: 14, padding: "10px 16px",
        borderBottom: "1px solid rgba(38,38,51,0.08)",
        fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.55)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {cols.map(c => (
          <button key={c.id} onClick={() => sortClick(c.id)}
            style={{
              flex: c.flex, textAlign: "left", padding: 0,
              background: "transparent", border: "none",
              color: "inherit", fontWeight: "inherit", fontSize: "inherit",
              textTransform: "inherit", letterSpacing: "inherit", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 4,
              fontFamily: "inherit",
            }}>
            {c.label}
            {sortBy === c.id && <span style={{ color: "#262633" }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ))}
      </div>
      {/* Строки */}
      {sorted.map(t => {
        const dept = departments.find(d => d.id === t.deptId);
        const colObj = TASK_COLUMNS.find(c => c.id === t.status);
        return (
          <div key={t.id}
            onClick={() => onPick(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 16px",
              borderTop: "1px solid rgba(38,38,51,0.05)",
              cursor: "pointer", transition: transition.fast,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.025)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ flex: 3, fontSize: 13, fontWeight: 500, color: "#262633",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
            <div style={{ flex: 1, fontSize: 12, color: dept?.color || "rgba(38,38,51,0.55)" }}>
              {dept?.name || "—"}
            </div>
            <div style={{ flex: 1, fontSize: 12, color: "rgba(38,38,51,0.7)" }}>
              {t.ownerId || "—"}
            </div>
            <div style={{ flex: 1 }}>
              <select
                value={t.status}
                onClick={e => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); onUpdate(t.id, { status: e.target.value }); }}
                style={{
                  padding: "3px 7px",
                  background: (colObj?.color || "#000") + "1A",
                  color: colObj?.color || "#262633",
                  border: "none", borderRadius: 999,
                  fontSize: 11, fontWeight: 500, cursor: "pointer",
                  fontFamily: "inherit", outline: "none",
                }}>
                {TASK_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 0.6, fontSize: 12, color: t.priority === "high" ? "#FF3B30" : "rgba(38,38,51,0.6)" }}>
              {t.priority === "high" ? "↑ важно" : t.priority === "low" ? "↓ низкий" : "обычный"}
            </div>
            <div style={{ flex: 1, fontSize: 12, color: "rgba(38,38,51,0.6)" }}>
              {t.dueDate || "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Week view: 7-дневная сетка по дням текущей недели ──
export function TasksWeekView({ tasks, departments, onPick }) {
  // Понедельник как начало недели
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0=Пн, 6=Вс
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Группируем по dueDate (если parseable)
  const buckets = {};
  const noDate = [];
  for (const t of tasks) {
    if (!t.dueDate) { noDate.push(t); continue; }
    // Пытаемся парсить ISO либо «завтра» — кладём в noDate если не получилось
    const d = new Date(t.dueDate);
    if (!isNaN(d.getTime())) {
      const k = dayKey(d);
      (buckets[k] = buckets[k] || []).push(t);
    } else {
      noDate.push(t);
    }
  }

  const todayKey = dayKey(today);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {days.map((d, i) => {
          const k = dayKey(d);
          const items = buckets[k] || [];
          const isToday = k === todayKey;
          return (
            <div key={k} style={{
              background: isToday ? "rgba(63,149,255,0.04)" : color.white,
              border: isToday ? "1px solid rgba(63,149,255,0.25)" : "1px solid rgba(38,38,51,0.08)",
              borderRadius: 10, padding: 10, minHeight: 220,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 6,
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {labels[i]}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: isToday ? "#3F95FF" : "#262633" }}>
                  {d.getDate()}
                </span>
                <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)" }}>
                  {d.toLocaleDateString("ru", { month: "short" })}
                </span>
                <div style={{ flex: 1 }} />
                {items.length > 0 && (
                  <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>{items.length}</span>
                )}
              </div>
              {items.map(t => (
                <TaskCard key={t.id} t={t} departments={departments} onClick={() => onPick(t.id)} />
              ))}
              {items.length === 0 && (
                <div style={{
                  fontSize: 11, color: "rgba(38,38,51,0.35)",
                  textAlign: "center", padding: "20px 0",
                }}>—</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Без даты — отдельной полосой снизу */}
      {noDate.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            fontSize: 11, color: "rgba(38,38,51,0.55)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
          }}>Без даты · {noDate.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
            {noDate.map(t => (
              <TaskCard key={t.id} t={t} departments={departments} onClick={() => onPick(t.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskDrawer({ task, departments, onClose, onUpdate, onDelete, onComment }) {
  const [comment, setComment] = useState("");
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  useEffect(() => { setTitleDraft(task.title); }, [task.id, task.title]);
  const dept = departments.find(d => d.id === task.deptId);
  const src = SOURCE_TAG[task.source?.type] || SOURCE_TAG.manual;

  return (
    <aside style={{
      width: 420, minWidth: 420, borderLeft: "1px solid rgba(38,38,51,0.06)",
      background: color.white, display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", flex: 1 }}>{task.id}</span>
        <button onClick={onDelete} title="Удалить"
          style={{
            background: "transparent", border: "none", padding: 6, borderRadius: 6,
            color: "rgba(38,38,51,0.5)", cursor: "pointer", display: "inline-flex",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,59,48,0.08)"; e.currentTarget.style.color = "#FF3B30"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(38,38,51,0.5)"; }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button onClick={onClose}
          style={{
            background: "transparent", border: "none", padding: 6, borderRadius: 6,
            color: "rgba(38,38,51,0.55)", cursor: "pointer", display: "inline-flex",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {/* Title (editable on click) */}
        {titleEdit ? (
          <input
            autoFocus value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={() => { if (titleDraft.trim()) onUpdate({ title: titleDraft.trim() }); setTitleEdit(false); }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setTitleDraft(task.title); setTitleEdit(false); } }}
            style={{
              width: "100%", boxSizing: "border-box",
              fontSize: 18, fontWeight: 600, color: "#262633",
              border: "1px solid rgba(63,149,255,0.4)", borderRadius: 7,
              padding: "6px 9px", fontFamily: "inherit", outline: "none", marginBottom: 14,
            }}
          />
        ) : (
          <h2 onClick={() => setTitleEdit(true)} style={{
            fontSize: 18, fontWeight: 600, color: "#262633",
            margin: "0 0 14px", cursor: "text", lineHeight: 1.3,
          }}>{task.title}</h2>
        )}

        {/* Meta — status / dept / owner / priority / source / due */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          <DrawerRow label="Статус">
            <select value={task.status} onChange={e => onUpdate({ status: e.target.value })}
              style={{
                border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "5px 8px", fontSize: 12.5, color: "#262633",
                background: color.white, fontFamily: "inherit", cursor: "pointer", outline: "none",
              }}>
              {TASK_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </DrawerRow>
          <DrawerRow label="Отдел">
            <select value={task.deptId || "general"} onChange={e => onUpdate({ deptId: e.target.value })}
              style={{
                border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "5px 8px", fontSize: 12.5, color: "#262633",
                background: color.white, fontFamily: "inherit", cursor: "pointer", outline: "none",
              }}>
              <option value="general">Общий</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </DrawerRow>
          <DrawerRow label="Owner">
            <input value={task.ownerId || ""} onChange={e => onUpdate({ ownerId: e.target.value })}
              placeholder="имя или агент"
              style={{
                border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "5px 8px", fontSize: 12.5, color: "#262633",
                fontFamily: "inherit", outline: "none", width: 160,
              }} />
          </DrawerRow>
          <DrawerRow label="Приоритет">
            <select value={task.priority || "normal"} onChange={e => onUpdate({ priority: e.target.value })}
              style={{
                border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "5px 8px", fontSize: 12.5, color: "#262633",
                background: color.white, fontFamily: "inherit", cursor: "pointer", outline: "none",
              }}>
              <option value="high">↑ Важно</option>
              <option value="normal">Обычный</option>
              <option value="low">↓ Низкий</option>
            </select>
          </DrawerRow>
          <DrawerRow label="Due">
            <input type="text" value={task.dueDate || ""} onChange={e => onUpdate({ dueDate: e.target.value })}
              placeholder="ISO или 'завтра 18:00'"
              style={{
                border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "5px 8px", fontSize: 12.5, color: "#262633",
                fontFamily: "inherit", outline: "none", width: 160,
              }} />
          </DrawerRow>
          <DrawerRow label="Источник">
            <span style={{
              padding: "3px 8px", background: src.bg, color: src.fg,
              borderRadius: 999, fontSize: 11.5, fontWeight: 500,
            }}>{src.label}</span>
          </DrawerRow>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Описание
          </div>
          <textarea
            value={task.description || ""}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="Подробнее…"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(38,38,51,0.12)", borderRadius: 8,
              padding: "8px 10px", fontSize: 12.5, color: "#262633",
              fontFamily: "inherit", resize: "vertical", outline: "none",
            }}
          />
        </div>

        {/* Comments */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Комментарии · {task.comments?.length || 0}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {(task.comments || []).map((c, i) => (
              <div key={i} style={{
                background: "rgba(38,38,51,0.03)", borderRadius: 8, padding: "8px 10px",
              }}>
                <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginBottom: 3 }}>
                  {c.author} · {new Date(c.ts).toLocaleString("ru", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                </div>
                <div style={{ fontSize: 12.5, color: "#262633", whiteSpace: "pre-wrap" }}>{c.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && comment.trim()) { onComment(comment); setComment(""); } }}
              placeholder="Комментарий…"
              style={{
                flex: 1, border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                padding: "6px 10px", fontSize: 12.5, color: "#262633",
                fontFamily: "inherit", outline: "none",
              }} />
            <button onClick={() => { if (comment.trim()) { onComment(comment); setComment(""); } }}
              disabled={!comment.trim()}
              style={{
                padding: "6px 12px",
                background: comment.trim() ? "#262633" : "rgba(38,38,51,0.3)",
                color: color.white, border: "none", borderRadius: 7,
                fontSize: 12.5, fontWeight: 500,
                cursor: comment.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
              }}>Отправить</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DrawerRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", width: 90, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

export function TasksPage({ pendingTasks = [], onOpenChat }) {
  const [scope, setScope] = useState("smm/tg-kanal");
  const [smmOpen, setSmmOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | agents | people
  const peopleList = usePeople();
  const peopleSource = peopleList.length > 0 ? peopleList : MOCK_PEOPLE;

  // Все задачи: AGENTS.tasks + PEOPLE_TASKS + pendingTasks
  const agentTasks = AGENTS.flatMap(a =>
    (a.tasks || []).map((t, i) => ({
      id: `a-${a.id}-${i}`,
      title: t.title,
      desc:  t.desc,
      cron:  t.cron,
      tool:  t.tool,
      out:   t.out,
      status: t.status || "Запланирована",
      assigneeKind: "agent",
      assignee: a,
      dept: "smm",
      channel: "tg-kanal",
    }))
  );
  const peopleTasks = PEOPLE_TASKS.map(t => ({
    ...t,
    assignee: peopleSource.find(p => p.id === t.assigneeId),
  }));
  const pending = pendingTasks.map(t => ({
    id: `pend-${t.id}`,
    title: t.title,
    desc: `${t.kind === "agent" ? `${t.assignee}-агенту` : t.assignee}`,
    status: "Ожидает принятия",
    assigneeKind: t.kind,
    assignee: t.kind === "agent"
      ? AGENTS.find(a => a.label.toLowerCase() === t.assignee.toLowerCase())
      : peopleSource.find(p => p.name === t.assignee),
    dept: "smm",
    channel: "tg-kanal",
    pending: true,
  }));

  const all = [...pending, ...agentTasks, ...peopleTasks];

  function matchScope(t) {
    if (scope === "company")      return true;
    if (scope === "smm")          return t.dept === "smm";
    if (scope === "smm/tg-kanal") return t.dept === "smm" && t.channel === "tg-kanal";
    if (scope === "smm/inst")     return t.dept === "smm" && t.channel === "inst";
    if (scope === "hr")           return t.dept === "hr";
    return true;
  }
  function matchFilter(t) {
    if (filter === "all")     return true;
    if (filter === "agents")  return t.assigneeKind === "agent";
    if (filter === "people")  return t.assigneeKind === "person";
    return true;
  }
  function matchSearch(t) {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (t.title || "").toLowerCase().includes(q) || (t.desc || "").toLowerCase().includes(q);
  }
  const filtered = all.filter(t => matchScope(t) && matchFilter(t) && matchSearch(t));
  const scoped = all.filter(matchScope);
  const counts = {
    all:    scoped.length,
    agents: scoped.filter(t => t.assigneeKind === "agent").length,
    people: scoped.filter(t => t.assigneeKind === "person").length,
  };

  // Группировка по статусам
  function inColumn(t, colId) {
    if (t.pending) return colId === "Запланирована";
    return t.status === colId;
  }

  const scopeLabel =
    scope === "company"      ? "Все задачи компании" :
    scope === "smm"          ? "СММ-отдел" :
    scope === "smm/tg-kanal" ? "Тг-канал" :
    scope === "smm/inst"     ? "Инст" :
    scope === "hr"           ? "HR-отдел" :
    "Задачи";

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Вторичный сайдбар: дерево отделов */}
      <aside style={{
        width: 240, minWidth: 240,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        padding: "20px 12px",
        display: "flex", flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#262633" }}>Задачи</span>
        </div>
        <KbTreeRow
          icon={ic.kb}
          label="Компания"
          active={scope === "company"}
          onClick={() => setScope("company")}
          weight={500}
        />
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.dept}</span>}
          label="СММ-отдел"
          indent={14}
          active={scope === "smm"}
          onClick={() => setScope("smm")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setSmmOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{smmOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {smmOpen && (
          <>
            <KbTreeRow label="Тг-канал" indent={36} active={scope === "smm/tg-kanal"} onClick={() => setScope("smm/tg-kanal")} />
            <KbTreeRow label="Инстаграм" indent={36} dim active={scope === "smm/inst"} onClick={() => setScope("smm/inst")} />
          </>
        )}
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.hr}</span>}
          label="HR-отдел"
          indent={14}
          active={scope === "hr"}
          onClick={() => setScope("hr")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setHrOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{hrOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {hrOpen && <KbTreeRow label="(пусто)" indent={36} dim />}
      </aside>

      {/* Канбан */}
      <div style={{ flex: 1, minWidth: 0, padding: "20px 24px 80px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#262633" }}>{scopeLabel}</div>
          <span style={{ fontSize: 13, color: "rgba(38,38,51,0.5)" }}>· {filtered.length}</span>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск задач…"
            style={{
              width: 240,
              padding: "8px 12px",
              background: "rgba(38,38,51,0.04)",
              border: "none", borderRadius: 999,
              fontSize: 13, color: "#262633",
              fontFamily: "inherit", outline: "none",
            }}
          />
        </div>

        {/* Фильтр исполнителей */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          {[
            { id: "all",    label: "Все",        n: counts.all },
            { id: "agents", label: "Агенты",     n: counts.agents },
            { id: "people", label: "Сотрудники", n: counts.people },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: filter === s.id ? "#262633" : "rgba(38,38,51,0.05)",
                color: filter === s.id ? color.white : "#262633",
                border: "none", borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <span>{s.label}</span>
              <span style={{
                fontSize: 11,
                color: filter === s.id ? "rgba(255,255,255,0.6)" : "rgba(38,38,51,0.45)",
              }}>{s.n}</span>
            </button>
          ))}
        </div>

        {/* Канбан-колонки */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(220px, 1fr))`,
          gap: 12,
          alignItems: "start",
        }}>
          {KANBAN_COLUMNS.map(col => {
            const colTasks = filtered.filter(t => inColumn(t, col.id));
            return (
              <div key={col.id} style={{
                background: "rgba(38,38,51,0.025)",
                borderRadius: 12,
                padding: 10,
                minHeight: 200,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 6px 10px",
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{col.label}</span>
                  <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>· {colTasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {colTasks.map(t => <TaskKanbanCard key={t.id} t={t} />)}
                  {colTasks.length === 0 && (
                    <div style={{
                      padding: "16px 8px", textAlign: "center",
                      fontSize: 11.5, color: "rgba(38,38,51,0.4)",
                    }}>пусто</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

export function TaskKanbanCard({ t }) {
  const a = t.assignee;
  const isAgent = t.assigneeKind === "agent";
  return (
    <div style={{
      background: color.white,
      borderRadius: 10,
      padding: "10px 12px",
      border: t.pending ? "1px solid rgba(255,214,10,0.6)" : "1px solid rgba(38,38,51,0.06)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", lineHeight: 1.3 }}>{t.title}</div>
      {t.desc && (
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3, lineHeight: 1.35 }}>{t.desc}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        {a ? (
          isAgent ? (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 16, height: 16, borderRadius: 4,
                background: a.color + "22", color: a.color, flexShrink: 0,
              }}>
                <svg width={10} height={10} viewBox="0 0 24 24">
                  <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
                  <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
                  <circle cx="9.3" cy="13" r="1.4" fill="white" />
                  <circle cx="14.7" cy="13" r="1.4" fill="white" />
                </svg>
              </span>
              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>{a.label}-агент</span>
            </>
          ) : (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 16, height: 16, borderRadius: "50%",
                background: a.color, color: color.white,
                fontSize: 9, fontWeight: 600,
                flexShrink: 0,
              }}>{a.name?.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>{a.name}</span>
            </>
          )
        ) : (
          <span style={{ fontSize: 11, color: "rgba(38,38,51,0.45)" }}>не назначено</span>
        )}
        <div style={{ flex: 1 }} />
        {t.cron && (
          <span style={{
            fontSize: 9.5, color: "rgba(38,38,51,0.5)",
            fontFamily: "ui-monospace, SF Mono, monospace",
            whiteSpace: "nowrap",
          }}>{t.cron.replace(/^cron\s*/, "")}</span>
        )}
        {t.pending && (
          <span style={{
            fontSize: 10, fontWeight: 500,
            background: "rgba(255,214,10,0.18)",
            color: "#A8770A",
            padding: "1px 7px", borderRadius: 999,
          }}>Ожидает</span>
        )}
      </div>
    </div>
  );
}

// ── Страница «Чат Mary» (Claude-style: список чатов + thread) ──
// ── Sandbox: отдельная страница ?page=sandbox ──────────
// 3-зонный layout: runs sidebar / center prog. + assertions / right chat with Mary
