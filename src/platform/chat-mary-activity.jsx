import { useState, useEffect, useRef } from "react";
import { color, cv } from "../ui/tokens.js";
import { renderMarkdown } from "./markdown.jsx";
import { BuildNode, AgentNodeExpanded } from "./build-nodes.jsx";

// папки базы знаний по типу файла (порядок = порядок показа)
const KB_FOLDERS = [
  { id: "doc",   label: "Документы", match: /\.(pdf|docx?|xlsx?|pptx?|csv)$/i },
  { id: "image", label: "Фото",      match: /\.(png|jpe?g|gif|webp|svg|heic)$/i },
  { id: "video", label: "Видео",     match: /\.(mp4|mov|webm|mkv)$/i },
  { id: "audio", label: "Аудио",     match: /\.(mp3|wav|m4a|ogg)$/i },
  { id: "text",  label: "Тексты",    match: /.*/ }, // всё остальное — текст
];
function kbFolderOf(name = "") {
  return (KB_FOLDERS.find(f => f.match.test(name)) || KB_FOLDERS[KB_FOLDERS.length - 1]).id;
}

export function ActivityPanel({ build: buildProp, activity, currentTool, activeAgentIds, artifacts = [], onCloseArtifact, onClose, docRequest }) {
  const [localBuild, setLocalBuild] = useState(null); // воркфлоу, открытый из пикера "+"
  const build = localBuild || buildProp;
  const [tab, setTab] = useState(build ? "build" : "log");
  useEffect(() => { if (build && tab === "log" && activity.length <= 2) setTab("build"); }, [build]);
  const lastArtId = artifacts[artifacts.length - 1]?.id;
  useEffect(() => {
    if (lastArtId) setTab(`art:${lastArtId}`);
  }, [lastArtId]);
  const isArtifactTab = tab.startsWith("art:");
  const autoWidth = isArtifactTab ? 720 : ((build?.agents?.length || 0) >= 3 ? 620 : 540);
  const [userWidth, setUserWidth] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const width = userWidth ?? autoWidth;
  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    setIsResizing(true);
    const onMove = (ev) => setUserWidth(Math.max(360, Math.min(920, startW + (startX - ev.clientX))));
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const TOOL_LABELS = {
    create_department: (a) => `создаёт отдел «${a?.name || "…"}»`,
    add_channel:       (a) => `добавляет канал «${a?.name || "…"}»`,
    add_agent:         (a) => `добавляет агента «${a?.role || "…"}»`,
    set_department_integrations: () => "подключает интеграции",
    add_pipeline_node: (a) => `добавляет шаг «${a?.title || "…"}»`,
  };
  const toolLabel = currentTool ? (TOOL_LABELS[currentTool.name]?.(currentTool.args) || `выполняет ${currentTool.name}`) : null;

  // "+" — добавить файл или воркфлоу из базы знаний
  const [addOpen, setAddOpen] = useState(false);
  const [addView, setAddView] = useState(null); // null | "wf" | "kb"
  const [addSearch, setAddSearch] = useState("");
  const [addKb, setAddKb] = useState([]);
  const [addDepts, setAddDepts] = useState([]);
  const [openDoc, setOpenDoc] = useState(null); // { name, content, loading } — открытый файл из БЗ
  const [openKbFolder, setOpenKbFolder] = useState(null); // раскрытая папка БЗ в пикере
  const addRef = useRef(null);
  useEffect(() => {
    if (!addOpen) return;
    const onDoc = (e) => { if (!addRef.current?.contains(e.target)) { setAddOpen(false); setAddView(null); setAddSearch(""); } };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [addOpen]);
  const toggleAdd = async () => {
    const next = !addOpen;
    setAddOpen(next); setAddView(null); setAddSearch("");
    if (next) {
      const [kb, depts] = await Promise.all([
        fetch("/api/mary/kb/files").then(r => r.json()).catch(() => ({ files: [] })),
        fetch("/api/mary/departments").then(r => r.json()).catch(() => ({ departments: [] })),
      ]);
      setAddKb(kb.files || []);
      const deptList = Array.isArray(depts) ? depts : (depts.departments || []);
      setAddDepts(deptList);
    }
  };
  // открыть файл из БЗ прямо в панели-просмотрщике
  const openKbDoc = async (name) => {
    setOpenDoc({ name, content: "", loading: true });
    setTab("doc");
    const d = await fetch(`/api/mary/kb/file?name=${encodeURIComponent(name)}`).then(r => r.json()).catch(() => ({}));
    setOpenDoc({ name, content: d.content || "", loading: false });
  };
  // запрос на открытие файла, пришедший из чата (через проп docRequest)
  useEffect(() => {
    if (docRequest?.name) openKbDoc(docRequest.name);
  }, [docRequest?.ts]);
  const pickAdd = async (kind, item) => {
    setAddOpen(false); setAddView(null); setAddSearch("");
    if (kind === "wf") {
      setLocalBuild({
        name: item.name,
        color: item.color,
        deptId: item.id,
        channels: item.channels || [],
        agents: item.agents || [],
      });
      setTab("build");
      return;
    }
    openKbDoc(item);
  };
  const railBtn = {
    width: 28, height: 28, padding: 0, flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", borderRadius: 7,
    color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <aside style={{
      width: width + 20, minWidth: width + 20,
      display: "flex", flexDirection: "column",
      padding: "6px 10px 10px",
      position: "relative",
      transition: isResizing ? "none" : "width 0.2s ease",
    }}>
      <div onMouseDown={startResize} title="Потяните, чтобы изменить ширину"
        style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 8, cursor: "ew-resize", zIndex: 30 }} />
      <div style={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        backgroundColor: cv.bgCard,
        backgroundImage: "radial-gradient(var(--dot) 0.9px, transparent 0.9px), radial-gradient(var(--dot) 0.9px, transparent 0.9px), radial-gradient(var(--dot) 0.9px, transparent 0.9px), radial-gradient(var(--dot) 0.9px, transparent 0.9px), radial-gradient(var(--dot) 0.9px, transparent 0.9px)",
        backgroundSize: "23px 23px, 31px 31px, 41px 41px, 53px 53px, 67px 67px",
        backgroundPosition: "0 0, 11px 17px, 27px 5px, 7px 33px, 39px 23px",
        border: `1px solid ${cv.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}>
      {toolLabel && (
        <div style={{
          padding: "8px 14px",
          background: "linear-gradient(90deg, rgba(63,149,255,0.06), rgba(122,134,255,0.06))",
          borderBottom: "1px solid rgba(38,38,51,0.04)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#262633",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
          <span style={{ fontWeight: 500 }}>Mary</span>
          <span style={{ color: "rgba(38,38,51,0.6)" }}>{toolLabel}…</span>
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 3,
        padding: "6px 10px",
      }}>
        {/* свернуть панель */}
        <button onClick={onClose} title="Свернуть панель" style={railBtn}
          onMouseEnter={e => e.currentTarget.style.background = cv.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /><path d="m10 10-2 2 2 2" />
          </svg>
        </button>
        {/* + добавить файл/воркфлоу из базы знаний */}
        <div style={{ position: "relative" }} ref={addRef}>
          <button onClick={toggleAdd} title="Добавить файл или воркфлоу из базы знаний"
            style={{ ...railBtn, background: addOpen ? cv.hover : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => { if (!addOpen) e.currentTarget.style.background = "transparent"; }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {addOpen && (
            <div onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", left: 0, top: "calc(100% + 6px)",
                width: 256, zIndex: 50,
                background: color.white, border: "1px solid rgba(38,38,51,0.1)",
                borderRadius: 14, boxShadow: "0 12px 32px rgba(38,38,51,0.14)",
                padding: 6, display: "flex", flexDirection: "column", gap: 2,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", marginBottom: 2 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
                <input autoFocus value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Поиск ресурсов..."
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#262633", fontFamily: "inherit", padding: 0 }} />
              </div>
              {(() => {
                const q = addSearch.trim().toLowerCase();
                const wf = (addDepts || []).filter(d => !q || (d.name || d.id || "").toLowerCase().includes(q));
                const kb = (addKb || []).filter(f => !q || (f.name || "").toLowerCase().includes(q));
                const Section = ({ id, label, count, children }) => (
                  <>
                    <button onClick={() => setAddView(v => v === id ? null : id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 8px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 550, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: addView === id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                      <span style={{ flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)", fontWeight: 500 }}>{count}</span>
                    </button>
                    {addView === id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 1, paddingBottom: 2 }}>{children}</div>
                    )}
                  </>
                );
                const Item = ({ icon, label, onClick }) => (
                  <button onClick={onClick}
                    style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px 7px 26px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.45)", flexShrink: 0 }}>{icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                  </button>
                );
                return (
                  <>
                    <Section id="wf" label="Воркфлоу" count={wf.length}>
                      {wf.length === 0
                        ? <div style={{ padding: "6px 8px 6px 26px", fontSize: 12, color: "rgba(38,38,51,0.4)" }}>Пусто</div>
                        : wf.map(d => (
                          <Item key={d.id}
                            icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M6.5 10v4M6.5 14h7.5" /></svg>}
                            label={d.name || d.id} onClick={() => pickAdd("wf", d)} />
                        ))}
                    </Section>
                    <Section id="kb" label="База знаний" count={kb.length}>
                      {kb.length === 0 ? (
                        <div style={{ padding: "6px 8px 6px 26px", fontSize: 12, color: "rgba(38,38,51,0.4)" }}>Пусто</div>
                      ) : q ? (
                        // при поиске — плоский список совпадений
                        kb.map((f, i) => (
                          <Item key={i}
                            icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>}
                            label={f.name} onClick={() => pickAdd("kb", f.name)} />
                        ))
                      ) : (() => {
                        // группируем в папки по типу; внутри — новые файлы сверху; папка с самым свежим файлом первее
                        const ts = (f) => new Date(f.modified || 0).getTime();
                        const groups = KB_FOLDERS
                          .map(folder => ({
                            ...folder,
                            files: kb.filter(f => kbFolderOf(f.name) === folder.id).sort((a, b) => ts(b) - ts(a)),
                          }))
                          .filter(g => g.files.length > 0)
                          .sort((a, b) => ts(b.files[0]) - ts(a.files[0]));
                        return groups.map(g => (
                          <div key={g.id} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <button onClick={() => setOpenKbFolder(v => v === g.id ? null : g.id)}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px 7px 26px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: openKbFolder === g.id ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
                                <path d="m9 6 6 6-6 6" />
                              </svg>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                              <span style={{ flex: 1 }}>{g.label}</span>
                              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)", fontWeight: 500 }}>{g.files.length}</span>
                            </button>
                            {openKbFolder === g.id && g.files.map((f, i) => (
                              <button key={i} onClick={() => pickAdd("kb", f.name)}
                                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px 7px 44px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.45)", flexShrink: 0 }}>
                                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                                </span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                              </button>
                            ))}
                          </div>
                        ));
                      })()}
                    </Section>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        {build && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 6px 5px 10px", borderRadius: 8,
            background: color.white, border: `1px solid ${cv.border}`,
          }}>
            <button onClick={() => setTab("build")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "transparent", border: "none", padding: 0,
                fontSize: 12.5, color: tab === "build" ? "#262633" : "rgba(38,38,51,0.5)", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: build.color || "#7A86FF", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{build.name}</span>
            </button>
            <button onClick={() => { setTab("log"); setLocalBuild(null); }} title="Закрыть воркфлоу"
              style={{
                width: 16, height: 16, padding: 0, flexShrink: 0,
                background: "transparent", border: "none", borderRadius: 4,
                color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {artifacts.map(a => {
          const active = tab === `art:${a.id}`;
          return (
            <div key={a.id} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 4px 5px 10px",
              background: color.white, border: `1px solid ${cv.border}`,
              borderRadius: 8,
            }}>
              <button onClick={() => setTab(`art:${a.id}`)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none",
                  fontSize: 12.5, color: "#262633", fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit", padding: 0,
                  maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: a.agentColor }} />
                <span>{a.title}</span>
              </button>
              <button onClick={() => {
                onCloseArtifact?.(a.id);
                if (active) setTab(build ? "build" : "log");
              }} title="Закрыть"
                style={{
                  width: 16, height: 16, padding: 0,
                  background: "transparent", border: "none", borderRadius: 4,
                  color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
        {openDoc && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "5px 4px 5px 10px",
            background: color.white, border: `1px solid ${cv.border}`,
            borderRadius: 8,
          }}>
            <button onClick={() => setTab("doc")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none",
                fontSize: 12.5, color: tab === "doc" ? "#262633" : "rgba(38,38,51,0.5)", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit", padding: 0,
                maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{openDoc.name}</span>
            </button>
            <button onClick={() => { setOpenDoc(null); if (tab === "doc") setTab(build ? "build" : "log"); }} title="Закрыть файл"
              style={{
                width: 16, height: 16, padding: 0, flexShrink: 0,
                background: "transparent", border: "none", borderRadius: 4,
                color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div style={{ flex: 1 }} />
        {build && (
          <button onClick={() => window.__maryNavigate?.(`dept://${build.deptId}`)} title="Развернуть воркфлоу в полном виде"
            style={railBtn}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </button>
        )}
      </div>

      {tab === "doc" && openDoc ? (
        <DocView doc={openDoc} onClose={() => { setOpenDoc(null); setTab(build ? "build" : "log"); }} />
      ) : tab.startsWith("art:") ? (
        <ArtifactView artifact={artifacts.find(a => `art:${a.id}` === tab)} />
      ) : tab === "build" && build ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <BuildCanvas build={build} activeAgentIds={activeAgentIds} />
          <WorkflowLogs build={build} />
        </div>
      ) : (
        <ActivityLog activity={activity} />
      )}

      </div>
    </aside>
  );
}

export function ArtifactView({ artifact }) {
  const [copied, setCopied] = useState(false);
  if (!artifact) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.4)", fontSize: 13 }}>Артефакт не найден</div>;
  }
  const onCopy = () => {
    navigator.clipboard?.writeText(artifact.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const onSaveKb = async () => {
    const name = `${artifact.agentRole} · ${new Date(artifact.ts).toLocaleDateString("ru")}.md`;
    try {
      await fetch("/api/mary/kb/file", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: artifact.content }),
      });
      alert(`Сохранено в Базу знаний: «${name}»`);
    } catch (e) { alert("Не удалось сохранить: " + e.message); }
  };
  const initial = (artifact.agentRole || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: cv.bgCard }}>
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: artifact.agentColor, color: color.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {artifact.title}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
            <span>{artifact.agentRole}</span>
            <span>·</span>
            <span>{new Date(artifact.ts).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {artifact.chainBasedOn && (
              <>
                <span style={{ color: "rgba(38,38,51,0.35)" }}>· основано на:</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: artifact.chainBasedOn.agentColor }} />
                  <span style={{ color: "#262633", fontWeight: 500 }}>{artifact.chainBasedOn.agentRole}</span>
                </span>
              </>
            )}
            {artifact.chainSeq > 1 && (
              <span style={{
                padding: "0 6px", marginLeft: 4, borderRadius: 999,
                background: artifact.agentColor + "22", color: artifact.agentColor,
                fontSize: 10, fontWeight: 600,
              }}>шаг {artifact.chainSeq}</span>
            )}
          </div>
        </div>
        <button onClick={onCopy} title="Копировать"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: copied ? "rgba(52,199,89,0.12)" : "transparent",
            color: copied ? "#34C759" : "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
        <button onClick={onSaveKb} title="Сохранить в Базу знаний"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          В БЗ
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "18px 22px" }}>
        <div style={{ fontSize: 14, color: "#262633", lineHeight: 1.6 }}>
          {renderMarkdown(artifact.content || "")}
        </div>
      </div>
    </div>
  );
}

export function DocView({ doc, onClose }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("preview"); // preview | code
  const ext = (doc.name.split(".").pop() || "").toUpperCase();
  const onCopy = () => {
    navigator.clipboard?.writeText(doc.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const onDownload = () => {
    const blob = new Blob([doc.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name || "файл.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const segBtn = (active) => ({
    width: 28, height: 26, padding: 0, flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: active ? color.white : "transparent",
    color: active ? "#262633" : "rgba(38,38,51,0.45)",
    border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
    boxShadow: active ? "0 1px 2px rgba(38,38,51,0.12)" : "none",
  });
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: cv.bgCard }}>
      {/* шапка как у артефакта Claude: переключатель Превью/Код · название · MD · Copy · закрыть */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0,
          background: "rgba(38,38,51,0.05)", borderRadius: 8, padding: 2,
        }}>
          <button onClick={() => setMode("preview")} title="Превью" style={segBtn(mode === "preview")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <button onClick={() => setMode("code")} title="Исходник" style={segBtn(mode === "code")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.name.replace(/\.[^.]+$/, "")}
          </span>
          {ext && <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(38,38,51,0.4)", flexShrink: 0 }}>· {ext}</span>}
        </div>
        <button onClick={onCopy} title="Копировать"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: copied ? "rgba(52,199,89,0.12)" : "transparent",
            color: copied ? "#34C759" : "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
          {!copied && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
        <button onClick={onDownload} title="Скачать файл"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: "transparent", color: "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
          Скачать
        </button>
        <button onClick={onClose} title="Закрыть"
          style={{ width: 30, height: 30, padding: 0, flexShrink: 0,
            background: "transparent", border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            color: "#262633", cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: mode === "code" ? "14px 18px" : "18px 22px" }}>
        {doc.loading ? (
          <div style={{ fontSize: 13, color: "rgba(38,38,51,0.45)" }}>Загрузка файла…</div>
        ) : doc.content ? (
          mode === "code" ? (
            <pre style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#262633",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {doc.content}
            </pre>
          ) : (
            <div style={{ fontSize: 14, color: "#262633", lineHeight: 1.6 }}>
              {renderMarkdown(doc.content)}
            </div>
          )
        ) : (
          <div style={{ fontSize: 13, color: "rgba(38,38,51,0.45)" }}>Файл пустой или не удалось прочитать содержимое.</div>
        )}
      </div>
    </div>
  );
}

function jsonType(v) {
  if (Array.isArray(v)) return "array";
  if (v === null || v === undefined) return "null";
  return typeof v; // object | string | number | boolean
}

function JsonTypeBadge({ t }) {
  const map = {
    object:  ["rgba(38,38,51,0.07)", "rgba(38,38,51,0.55)"],
    array:   ["rgba(122,134,255,0.16)", "#7A86FF"],
    string:  ["rgba(52,199,89,0.16)", "#2Fa84f"],
    number:  ["rgba(63,149,255,0.16)", "#3F95FF"],
    boolean: ["rgba(255,139,61,0.18)", "#FF8B3D"],
    null:    ["rgba(38,38,51,0.07)", "rgba(38,38,51,0.4)"],
  };
  const [bg, fg] = map[t] || map.object;
  return <span style={{ padding: "1px 7px", borderRadius: 999, background: bg, color: fg, fontSize: 10.5, fontWeight: 600 }}>{t}</span>;
}

function JsonRow({ k, value, depth }) {
  const t = jsonType(value);
  const isBranch = (t === "object" && value && Object.keys(value).length > 0) || (t === "array" && value.length > 0);
  const [open, setOpen] = useState(depth < 1);
  const entries = t === "array" ? value.map((it, i) => [String(i), it]) : (value ? Object.entries(value) : []);
  return (
    <div style={{ paddingLeft: depth ? 12 : 0 }}>
      <div onClick={isBranch ? () => setOpen(o => !o) : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
          cursor: isBranch ? "pointer" : "default",
          borderLeft: depth ? "1px solid rgba(38,38,51,0.08)" : "none", paddingLeft: depth ? 10 : 0,
        }}>
        {isBranch ? (
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
            <path d="m9 18 6-6-6-6" />
          </svg>
        ) : <span style={{ width: 12, flexShrink: 0 }} />}
        <span style={{ fontSize: 13.5, fontWeight: 550, color: "#262633" }}>{k}</span>
        <JsonTypeBadge t={t} />
        {t === "array" && <span style={{ fontSize: 12, color: "rgba(38,38,51,0.5)" }}>{value.length} items</span>}
        {!isBranch && t !== "object" && t !== "array" && (
          <span style={{ fontSize: 12.5, color: "rgba(38,38,51,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>
            {String(value)}
          </span>
        )}
      </div>
      {isBranch && open && (
        <div>{entries.map(([ck, cvv]) => <JsonRow key={ck} k={ck} value={cvv} depth={depth + 1} />)}</div>
      )}
    </div>
  );
}

export function WorkflowLogs({ build }) {
  const DURS = ["34.57s", "1m 3s", "1m 4s", "58s", "1m 12s", "47s"];
  const steps = [
    { name: "Start", kind: "start", dur: "24ms", color: "#3F95FF" },
    ...build.agents.map((a, i) => ({ name: a.role, kind: "agent", dur: DURS[i % DURS.length], color: a.color || "#7A86FF", agent: a })),
  ];
  const [sel, setSel] = useState(steps.length - 1);
  const [io, setIo] = useState("output");
  const [collapsed, setCollapsed] = useState(false);
  const step = steps[Math.min(sel, steps.length - 1)] || steps[0];

  if (collapsed) {
    return (
      <div style={{
        height: 38, flexShrink: 0, borderTop: `1px solid ${cv.border}`,
        display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
        background: color.white, borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#262633" }}>Logs</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCollapsed(false)} title="Показать логи"
          style={{ width: 26, height: 26, padding: 0, background: "transparent", border: "none", borderRadius: 6,
            color: "rgba(38,38,51,0.5)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      </div>
    );
  }

  const agentOutput = (a) => ({
    result: { summary: `${a.role}: ${a.tasks || "шаг выполнен"}`, status: "ok" },
    items: (a.tasks ? a.tasks.split(/[,;·]/).map(s => s.trim()).filter(Boolean) : ["шаг 1", "шаг 2", "шаг 3"]),
    meta: { model: "claude-sonnet-4-6", tokens: 1240, retries: 0 },
  });
  const agentInput = (a) => ({
    messages: `Ты — ${a.role}.`,
    context: { department: build.name, channels: build.channels.length },
    tools: "—",
  });
  const data = step.kind === "start"
    ? (io === "output" ? { inputs: { company: "—", contact_name: "—" }, started_at: new Date().toISOString() } : { trigger: "manual" })
    : (io === "output" ? agentOutput(step.agent) : agentInput(step.agent));

  return (
    <div style={{ height: 240, flexShrink: 0, borderTop: `1px solid ${cv.border}`, display: "flex", background: color.white, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, overflow: "hidden" }}>
      {/* Logs */}
      <div style={{ width: "42%", minWidth: 180, borderRight: `1px solid ${cv.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 14px 6px", fontSize: 12.5, fontWeight: 600, color: "#262633" }}>Logs</div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setSel(i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 8px",
                background: i === sel ? "rgba(38,38,51,0.05)" : "transparent",
                border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: s.color + "26", color: s.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={13} height={13} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" /><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" /><circle cx="9.3" cy="13" r="1.4" fill="white" /><circle cx="14.7" cy="13" r="1.4" fill="white" /></svg>
              </span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", flexShrink: 0 }}>{s.dur}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Inspector */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px 6px" }}>
          {["output", "input"].map(t => (
            <button key={t} onClick={() => setIo(t)}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12.5, fontWeight: 600, color: io === t ? "#262633" : "rgba(38,38,51,0.4)" }}>
              {t === "output" ? "Output" : "Input"}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setCollapsed(true)} title="Скрыть логи"
            style={{ background: "transparent", border: "none", padding: 4, cursor: "pointer",
              display: "inline-flex", alignItems: "center", color: "rgba(38,38,51,0.45)" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "2px 14px 12px" }}>
          {Object.entries(data).map(([k, v]) => <JsonRow key={k} k={k} value={v} depth={0} />)}
        </div>
      </div>
    </div>
  );
}

export function ActivityLog({ activity }) {
  if (activity.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(38,38,51,0.45)", fontSize: 13, padding: 20, textAlign: "center",
      }}>
        Здесь появится всё что Mary делает: вызовы агентов, чтения базы знаний, создание файлов.
      </div>
    );
  }
  const TOOL_LABEL = {
    get_research_insights: { label: "Свежий ресёрч от Ресерчера", icon: "🔍" },
    generate_ideas:        { label: "Идеи постов от Маркетолога", icon: "💡" },
    write_post:            { label: "Текст поста от Копирайтера",  icon: "✍️" },
    search_kb:             { label: "Поиск в базе знаний",         icon: "📚" },
    create_task:           { label: "Создание задачи",              icon: "📋" },
    publish_post:          { label: "Публикация в Telegram",        icon: "🚀" },
    kb_list:               { label: "Список файлов в БЗ",           icon: "📁" },
    kb_read:               { label: "Чтение файла из БЗ",           icon: "📄" },
    kb_write:              { label: "Сохранение файла в БЗ",        icon: "💾" },
    read_chat:             { label: "Чтение чата отдела",           icon: "💬" },
    list_departments:      { label: "Список отделов",               icon: "🏢" },
    create_department:     { label: "Создание отдела",              icon: "✨" },
    add_channel:           { label: "Добавление канала",            icon: "📡" },
    add_agent:             { label: "Добавление агента",            icon: "🤖" },
    set_department_integrations: { label: "Настройка интеграций",   icon: "🔌" },
  };
  const fmtTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}с назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {activity.map((a, i) => {
          const t = TOOL_LABEL[a.name] || { label: a.name, icon: "⚙" };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px",
              background: color.white,
              border: `1px solid ${cv.border}`,
              borderRadius: 10,
              animation: i === 0 ? "build-pop 0.4s ease" : "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: a.ok ? "rgba(52,199,89,0.14)" : "rgba(255,77,46,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 13,
              }}>{a.ok ? t.icon : "❌"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", gap: 8 }}>
                  <span>{fmtTime(a.ts)}</span>
                  {a.durationMs != null && <span>· {a.durationMs < 1000 ? `${a.durationMs}ms` : `${Math.round(a.durationMs / 1000)}с`}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BuildCanvas({ build, activeAgentIds }) {
  const [expandedAgentIdx, setExpandedAgentIdx] = useState(null);
  const activeSet = activeAgentIds instanceof Set ? activeAgentIds : new Set();

  const NODE_W = 200, NODE_H = 56, GAP_X = 24, ROW_GAP = 64;
  const channelsCount = build.channels.length;
  const agentsCount   = build.agents.length;

  const rowWidth = (n) => n > 0 ? n * NODE_W + (n - 1) * GAP_X : NODE_W;
  const maxRowW = Math.max(rowWidth(channelsCount), NODE_W, rowWidth(agentsCount));
  const PAD_X = 30, PAD_TOP = 44, PAD_BOTTOM = 40;
  const totalW = maxRowW + PAD_X * 2;

  const yChannels = PAD_TOP;
  const yAgents   = yChannels + NODE_H + ROW_GAP * 2 + 20;
  const expandH   = expandedAgentIdx !== null ? 200 : 0;
  const canvasH   = yAgents + NODE_H + PAD_BOTTOM + expandH;

  const xFor = (n, i) => {
    const startX = (totalW - rowWidth(n)) / 2;
    return startX + i * (NODE_W + GAP_X);
  };
  const hubX = totalW / 2;
  const hubY = (yChannels + NODE_H + yAgents) / 2;

  const vpath = (x1, y1, x2, y2) => {
    const dy = Math.max(28, (y2 - y1) * 0.5);
    return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  };

  return (
    <div style={{
      flex: 1, position: "relative", overflow: "auto",
      background: "transparent",
    }}>
        <div style={{ position: "relative", width: totalW, minHeight: canvasH, margin: "0 auto" }}>
          <svg width={totalW} height={canvasH} style={{
            position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible",
          }}>
            {build.channels.map((_, i) => (
              <path key={`ch-${i}`}
                d={vpath(
                  xFor(channelsCount, i) + NODE_W / 2, yChannels + NODE_H,
                  hubX, hubY,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
            {build.agents.map((_, i) => (
              <path key={`ag-${i}`}
                d={vpath(
                  hubX, hubY,
                  xFor(agentsCount, i) + NODE_W / 2, yAgents,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
            <circle cx={hubX} cy={hubY} r="3.5" fill="rgba(38,38,51,0.25)" />
          </svg>

          {build.channels.map((c, i) => (
            <BuildNode key={c.id || i}
              x={xFor(channelsCount, i)} y={yChannels}
              w={NODE_W} h={NODE_H}
              icon="ch" iconBg="#FFF4D1" iconColor="#FFB800"
              title={c.name} sub={c.type || "канал"}
              animate={i === channelsCount - 1}
            />
          ))}

          {build.agents.map((a, i) => (
            <BuildNode key={a.id || i}
              x={xFor(agentsCount, i)} y={yAgents}
              w={NODE_W} h={NODE_H}
              icon="agent" iconBg={(a.color || "#7A86FF") + "26"} iconColor={a.color || "#7A86FF"}
              title={a.role} sub={a.tasks || "AI-агент"}
              animate={i === agentsCount - 1}
              expanded={expandedAgentIdx === i}
              active={activeSet.has(a.id)}
              onClick={() => setExpandedAgentIdx(expandedAgentIdx === i ? null : i)}
            />
          ))}

          {expandedAgentIdx !== null && build.agents[expandedAgentIdx] && (
            <AgentNodeExpanded
              agent={build.agents[expandedAgentIdx]}
              x={Math.max(PAD_X, Math.min(xFor(agentsCount, expandedAgentIdx) + NODE_W / 2 - 140, totalW - PAD_X - 280))}
              y={yAgents + NODE_H + 16}
              w={280}
              onClose={() => setExpandedAgentIdx(null)}
            />
          )}
        </div>

      <style>{`
        @keyframes build-pop {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
