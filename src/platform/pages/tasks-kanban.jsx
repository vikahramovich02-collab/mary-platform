import { useState, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { TaskCard, TasksListView, TaskDrawer, TasksWeekView } from "./tasks-page.jsx";

const TASK_COLUMNS = [
  { id: "backlog", label: "Бэклог",   color: "#3F95FF" },
  { id: "doing",   label: "В работе", color: "#FF8B3D" },
  { id: "blocked", label: "Блокеры",  color: "#FF3B30" },
  { id: "done",    label: "Готово",   color: "#34C759" },
];

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
