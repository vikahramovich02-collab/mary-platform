import { useState, useRef, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn } from "../chat-panel.jsx";
import { AGENTS } from "../agents-config.js";

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

export function userItemIcon(kind) {
  if (kind === "image") return ic.image;
  if (kind === "link")  return ic.link;
  if (kind === "text")  return ic.text;
  return ic.file;
}
export const KIND_META = {
  image: { color: "#3F95FF", label: "Фото" },
  link:  { color: "#34C759", label: "Ссылка" },
  text:  { color: "#FF8B3D", label: "Текст" },
  file:  { color: "#7A86FF", label: "Файл" },
};
export function UserItemThumb({ it }) {
  if (it.kind === "image" && it.data) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(38,38,51,0.05)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={it.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const meta = KIND_META[it.kind] || KIND_META.file;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: meta.color + "22",
      color: meta.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{userItemIcon(it.kind)}</div>
  );
}
export function UserItemKindBadge({ kind }) {
  const meta = KIND_META[kind] || KIND_META.file;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "1px 7px",
      background: meta.color + "1F",
      color: meta.color,
      borderRadius: 999,
      fontSize: 10, fontWeight: 500,
    }}>{meta.label}</span>
  );
}
export function fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function parseViews(v) {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return /k$/i.test(v) ? n * 1000 : n;
}

function PostCard({ p }) {
  const [open, setOpen] = useState(false);
  const url = `https://t.me/${p.ch}/${p.id}`;
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 12,
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a
          href={`https://t.me/${p.ch}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, color: "#3F95FF",
            textDecoration: "none",
          }}
        >
          <span style={{ display: "flex" }}>{ic.paperPlane}</span>
          @{p.ch}
        </a>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {p.time}</span>
        {p.hasMedia && (
          <span title="Есть медиа" style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            marginLeft: "auto",
          }}>
            {ic.mediaPic}
          </span>
        )}
      </div>

      <div
        onClick={() => setOpen(v => !v)}
        style={{
          fontSize: 13, color: "#262633", lineHeight: 1.5,
          marginTop: 8,
          cursor: "pointer",
          display: open ? "block" : "-webkit-box",
          WebkitLineClamp: open ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: open ? "visible" : "hidden",
        }}
      >{p.text}</div>

      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginTop: 10,
        fontSize: 11.5, color: "rgba(38,38,51,0.6)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.eye} {p.views || p.view || "—"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.heart} {p.reactions}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.bubbleSm} {p.comments}
        </span>
        <a
          href={url}
          target="_blank" rel="noreferrer"
          style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, color: "#262633", fontWeight: 500,
            textDecoration: "none",
            padding: "4px 8px",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 7,
          }}
        >
          Открыть в ТГ {ic.externalLink}
        </a>
      </div>
    </div>
  );
}

const PERIOD_DAYS = { today: 0, week: 7, month: 30, all: Infinity };
const PERIOD_LABEL = {
  today: "За сегодня",
  week:  "За неделю",
  month: "За месяц",
  all:   "За всё время",
};
const MODE_LABEL = {
  feed:  "По постам",
  group: "По каналам",
};
const SORT_FN = {
  views:     (a, b) => parseViews(b.views || b.view) - parseViews(a.views || a.view),
  reactions: (a, b) => (b.reactions || 0) - (a.reactions || 0),
  comments:  (a, b) => (b.comments  || 0) - (a.comments  || 0),
  newest:    (a, b) => (a.daysAgo   || 0) - (b.daysAgo   || 0),
};
const SORT_LABEL = {
  views:     "По охвату",
  reactions: "По реакциям",
  comments:  "По комментам",
  newest:    "По времени",
};

function DropdownChip({ value, options, onChange, openId, setOpenId, id }) {
  const open = openId === id;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpenId(open ? null : id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 32, padding: "0 12px",
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 999,
          fontSize: 13, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span>{options[value]}</span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)" }}>{ic.chevron}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(38,38,51,0.1)",
          zIndex: 5, minWidth: 160, padding: 4,
        }}>
          {Object.entries(options).map(([k, label]) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpenId(null); }}
              style={{
                display: "block", width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: value === k ? "rgba(38,38,51,0.05)" : "transparent",
                border: "none", borderRadius: 7,
                fontSize: 13, color: "#262633",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsViewer({ rows }) {
  const [mode, setMode] = useState("feed");
  const [period, setPeriod] = useState("today");
  const [sort, setSort] = useState("views");
  const [openId, setOpenId] = useState(null);

  const maxDays = PERIOD_DAYS[period];
  const filtered = rows.filter(r => (r.daysAgo ?? 0) <= maxDays);
  const sorted = [...filtered].sort(SORT_FN[sort]);

  const grouped = {};
  filtered.forEach(r => { (grouped[r.ch] ||= []).push(r); });
  Object.keys(grouped).forEach(ch => grouped[ch].sort(SORT_FN[sort]));
  const channels = Object.keys(grouped);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <DropdownChip id="period" value={period} options={PERIOD_LABEL} onChange={setPeriod} openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="mode"   value={mode}   options={MODE_LABEL}   onChange={setMode}   openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="sort"   value={sort}   options={SORT_LABEL}   onChange={setSort}   openId={openId} setOpenId={setOpenId} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", alignSelf: "center" }}>
          {filtered.length} {mode === "group" ? `· ${channels.length} каналов` : "постов"}
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={{
          fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center",
          padding: 32,
        }}>За этот период постов нет</div>
      )}

      {mode === "feed" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
      {mode === "group" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {channels.map(ch => (
            <ChannelGroup key={ch} ch={ch} posts={grouped[ch]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelGroup({ ch, posts }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 4px 8px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)", transform: open ? "" : "rotate(-90deg)", transition: transition.fast }}>
          {ic.chevron}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#262633" }}>@{ch}</span>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {posts.length}</span>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
    </div>
  );
}

export function TextViewerPopup({ item, onClose }) {
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
          width: 560, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(122,134,255,0.14)", color: "#7A86FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.text}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{item.meta} · загрузил(а) ты</div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          <div style={{
            background: "rgba(38,38,51,0.03)",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 13.5, color: "#262633", lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>{item.body}</div>
        </div>
      </div>
    </div>
  );
}

export function AddKbPopup({ onAdd, onClose }) {
  const [over, setOver] = useState(false);
  const [askLink, setAskLink] = useState(false);
  const [askText, setAskText] = useState(false);
  const [linkVal, setLinkVal] = useState("");
  const [textVal, setTextVal] = useState("");
  const [pasteFlash, setPasteFlash] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    function onPaste(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      if ((tag === "input" || tag === "textarea") && askText) return;
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type?.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            const named = new File([file], file.name && file.name !== "image.png" ? file.name : `clipboard_${Date.now()}.${(file.type.split("/")[1] || "png")}`, { type: file.type });
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 250);
            handleFiles([named]);
            return;
          }
        }
      }
      const txt = e.clipboardData?.getData("text")?.trim();
      if (txt) {
        e.preventDefault();
        setPasteFlash(true);
        setTimeout(() => setPasteFlash(false), 250);
        if (/^https?:\/\//i.test(txt) && !/\s/.test(txt)) {
          onAdd({ kind: "link", name: txt, meta: "ссылка" });
        } else {
          const firstLine = txt.split("\n")[0].slice(0, 60) || "Заметка";
          onAdd({ kind: "text", name: firstLine, meta: `${txt.length} симв.`, body: txt });
        }
        onClose();
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [askText]);

  function handleFiles(fileList) {
    Array.from(fileList).forEach(f => {
      const isImg = f.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          kind: isImg ? "image" : "file",
          name: f.name,
          meta: fmtBytes(f.size),
          mime: f.type,
          data: reader.result,
        });
      };
      reader.readAsDataURL(f);
    });
    onClose();
  }
  function handleDrop(e) {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
      return;
    }
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && /^https?:\/\//i.test(url.trim())) {
      onAdd({ kind: "link", name: url.trim(), meta: "ссылка" });
      onClose();
    }
  }
  function addLink() {
    const v = linkVal.trim();
    if (!v) return;
    const url = /^https?:\/\//i.test(v) ? v : "https://" + v;
    onAdd({ kind: "link", name: url, meta: "ссылка" });
    setLinkVal("");
    setAskLink(false);
    onClose();
  }
  function addText() {
    const v = textVal.trim();
    if (!v) return;
    const firstLine = v.split("\n")[0].slice(0, 60) || "Заметка";
    onAdd({ kind: "text", name: firstLine, meta: `${v.length} симв.`, body: v });
    setTextVal("");
    setAskText(false);
    onClose();
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
          padding: "14px 16px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#262633", flex: 1 }}>
            Добавить в базу знаний
          </span>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        <div style={{ padding: 18 }}>
          <div
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.18)"}`,
              background: pasteFlash ? "rgba(122,134,255,0.16)" : over ? "rgba(122,134,255,0.06)" : "rgba(38,38,51,0.02)",
              borderRadius: 12,
              padding: "28px 18px",
              textAlign: "center",
              cursor: "pointer",
              transition: transition.fast,
            }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.55)",
              marginBottom: 10,
            }}>{ic.uploadCloud}</div>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
              Перетащи файл, картинку или ссылку
            </div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 4 }}>
              кликни, чтобы выбрать с компьютера, или вставь Cmd+V
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }}
          />

          {askLink && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <input
                autoFocus
                value={linkVal}
                onChange={e => setLinkVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setAskLink(false); }}
                placeholder="https://..."
                style={{
                  flex: 1, height: 36, padding: "0 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={addLink} style={{
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {askText && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              <textarea
                autoFocus
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addText();
                  if (e.key === "Escape") setAskText(false);
                }}
                placeholder="Вставь или напиши текст…"
                style={{
                  width: "100%", minHeight: 120, padding: "10px 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633", lineHeight: 1.5,
                  fontFamily: "inherit", outline: "none",
                  resize: "vertical",
                }}
              />
              <button onClick={addText} style={{
                alignSelf: "flex-end",
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {!askLink && !askText && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={() => setAskText(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.text}</span>
                <span>Текст</span>
              </button>
              <button onClick={() => setAskLink(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.link}</span>
                <span>Ссылка</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const smallActionBtn = {
  flex: 1,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  height: 36,
  background: color.white,
  border: "1px solid rgba(38,38,51,0.1)",
  borderRadius: 9,
  fontSize: 13, color: "#262633", fontWeight: 500,
  cursor: "pointer", fontFamily: "inherit",
};

const KB_CONTENT = {
  "Каналы для парсинга": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@YakovPartners",            meta: "канал" },
      { name: "@ai_product",               meta: "канал" },
      { name: "@app_growth",               meta: "канал" },
      { name: "@bogdanisssimo",            meta: "канал" },
      { name: "@business_by",              meta: "канал" },
      { name: "@cryptoEssay",              meta: "канал" },
      { name: "@danokhlopkov",             meta: "канал" },
      { name: "@dashalovesstartups",       meta: "канал" },
      { name: "@dimabeseda",               meta: "канал" },
      { name: "@gleb_pro_ai",              meta: "канал" },
      { name: "@gordeyai",                 meta: "канал" },
      { name: "@ict_moscow_ai",            meta: "канал" },
      { name: "@ikspertnaya",              meta: "канал" },
      { name: "@ilya_krasinsky",           meta: "канал" },
      { name: "@its_capitan",              meta: "канал" },
      { name: "@kgrbnv",                   meta: "канал" },
      { name: "@linkedinhero",             meta: "канал" },
      { name: "@machinelearning_interview",meta: "канал" },
      { name: "@marketpsy",                meta: "канал" },
      { name: "@microfounders",            meta: "канал" },
      { name: "@mnk_stories",              meta: "канал" },
      { name: "@neural_prosecco",          meta: "канал" },
      { name: "@pervmarketing",            meta: "канал" },
      { name: "@pohodu_media",             meta: "канал" },
      { name: "@salikov_i",                meta: "канал" },
      { name: "@showstartup",              meta: "канал" },
      { name: "@telega_Rinata",            meta: "канал" },
      { name: "@tvoi_memolog",             meta: "канал" },
      { name: "@vladimir_merkushev",       meta: "канал" },
      { name: "@your_pet_project",         meta: "канал" },
      { name: "@zheleznyak_gi",            meta: "канал" },
    ],
  },
  "Ручные материалы": {
    type: "files",
    rows: [
      { name: "brief_smm_q2.pdf",        meta: "1.2 MB · 2 дня назад" },
      { name: "competitor_audit.xlsx",   meta: "320 KB · 1 неделя"   },
      { name: "voice_examples.md",       meta: "8 KB · 5 дней назад"  },
      { name: "swipe_file_2026.pdf",     meta: "4.5 MB · 2 недели"    },
    ],
  },
  "Tone of voice Mary": {
    type: "text",
    body: "Mary говорит:\n• Просто и без воды — никаких «синергий» и «таргетов»\n• С эмпатией к индихакеру и no-code-разработчику\n• С лёгкой иронией, но без сарказма\n• Конкретные примеры > общие советы\n• Эмодзи редко, только смыслово\n• Длина — 300–800 знаков для ТГ-постов",
  },
  "Контент-план (шаблон)": {
    type: "list",
    rows: [
      { name: "Понедельник",    meta: "Кейс / разбор" },
      { name: "Среда",          meta: "Чек-лист / гайд" },
      { name: "Пятница",        meta: "Тренд / новость с разбором" },
      { name: "Воскресенье",    meta: "Опрос / обсуждение" },
    ],
  },
  "Инсайт-карточки от Ресерчера": {
    type: "cards",
    rows: [
      { title: "Тренд: AI-агенты для SMM", meta: "12 постов конкурентов · хайп" },
      { title: "Boom: no-code запуски",    meta: "8 постов · растущий" },
      { title: "Дискуссия: рилсы vs посты", meta: "15 постов · затухание"  },
      { title: "+ ещё 9 карточек",         meta: "не показаны" },
    ],
  },
  "Утверждённые идеи": {
    type: "cards",
    rows: [
      { title: "Чек-лист: что проверить в SMM-стратегии до запуска", meta: "практика" },
      { title: "Кейс: как мы подняли вовлечённость в ТГ на 40%",     meta: "кейс с цифрами" },
      { title: "Разбор: почему рилсы заходят, а посты нет",          meta: "разбор тренда" },
    ],
  },
  "Примеры лучших постов": {
    type: "cards",
    rows: [
      { title: "5 ошибок в SMM, которые убивают охват", meta: "12.4k охват · 324 реакции" },
      { title: "Как мы выросли с 0 до 50k за 3 месяца", meta: "8.7k охват · 201 реакция"  },
      { title: "+ ещё 22 поста",                        meta: "не показаны"               },
    ],
  },
  "Опубликованные посты": {
    type: "cards",
    rows: [
      { title: "Пост #38 · Чек-лист SMM",   meta: "5 мая · 4.2k охват · ER 6.8%" },
      { title: "Пост #37 · Кейс роста",     meta: "3 мая · 5.8k охват · ER 8.1%" },
      { title: "Пост #36 · Разбор рилсов",  meta: "1 мая · 3.1k охват · ER 4.2%" },
      { title: "+ ещё 35 постов",           meta: "не показаны" },
    ],
  },
  "История метрик": {
    type: "text",
    body: "Средние показатели за квартал:\n• Охват: 4.6k (+18% к предыдущему кварталу)\n• ER: 6.2% (+0.8 п.п.)\n• Подписчиков: +1.2k\n• Лучший пост: #37 (ER 8.1%)\n• Худший пост: #29 (ER 2.3%)",
  },
  "Конкуренты для бенчмарка": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@marketing_pro",   meta: "12.4k · ER 5.4%" },
      { name: "@growth_hacks",    meta: "8.7k · ER 7.8%"  },
      { name: "@content_kitchen", meta: "6.2k · ER 6.1%"  },
    ],
  },
  "Идеи постов": {
    type: "cards",
    rows: [
      { title: "Чек-лист SMM",     meta: "практика · апрувнуто" },
      { title: "Кейс роста +40%",  meta: "кейс · апрувнуто" },
      { title: "Разбор рилсов",    meta: "разбор · апрувнуто" },
    ],
  },
  "Концепты": {
    type: "cards",
    rows: [
      { title: "#1 Чек-лист", meta: "хук → 7 пунктов → CTA на гайд" },
      { title: "#2 Кейс",     meta: "крюк → цифры → метод → вывод"   },
      { title: "#3 Разбор",   meta: "тренд → почему → антитренд → mary" },
    ],
  },
  "Готовые тексты": {
    type: "cards",
    rows: [
      { title: "Текст #1 (Чек-лист)",  meta: "638 знаков · готов" },
      { title: "Текст #2 (Кейс)",      meta: "742 знака · в работе" },
      { title: "Текст #3 (Разбор)",    meta: "не начат" },
    ],
  },
  "A/B варианты": {
    type: "cards",
    rows: [
      { title: "Чек-лист · вариант A", meta: "хук про ошибки" },
      { title: "Чек-лист · вариант B", meta: "хук про экономию" },
    ],
  },
  "Обложки постов": {
    type: "list",
    rows: [
      { name: "cover_v1.png", meta: "1080×1080 · оранжевая" },
      { name: "cover_v2.png", meta: "1080×1080 · синяя"     },
      { name: "cover_v3.png", meta: "1080×1080 · фиолетовая" },
    ],
  },
  "Финал": {
    type: "list",
    rows: [
      { name: "post_38_final.png", meta: "1080×1080 · ready to publish" },
    ],
  },
  "Аналитика поста": {
    type: "text",
    body: "Пост #37 «Кейс роста +40%»\n\n• Охват: 5.8k (+12% от среднего)\n• Реакции: 412\n• Комментариев: 28\n• ER: 8.1%\n• Поделились: 47\n• Подписки после: +18\n\nЗашло благодаря конкретным цифрам в первой строке.",
  },
  "Рекомендации на след.": {
    type: "text",
    body: "Что улучшить в следующих постах:\n• Цифры в хук — работает\n• Длинные посты (>700 знаков) теряют 30% охвата\n• Картинки с лицами вовлекают на 22% сильнее\n• Опросы в комментах поднимают ER на 1.5 п.п.\n• Лучшее время паблиша — 10:00–11:00 в будние",
  },
  "Дайджест трендов": {
    type: "text",
    body: "Топ-3 тренда за неделю:\n• AI-агенты для SMM — 12 постов, растёт\n• No-code запуски — 8 постов, растёт\n• Рилсы vs посты — 15 постов, затухает\n\nЧто отбросили:\n• Споры про ИИ-этику (не наша ниша)\n• Истории про увольнения (offtopic)",
  },
  "Свежие посты": {
    type: "posts",
    rows: [
      { ch: "neural_prosecco",           id: 4821, daysAgo: 0, time: "сегодня 08:42", text: "OpenAI выкатили новый Realtime API — теперь GPT-4o умеет слушать, говорить и видеть в одной сессии. Latency упала до 320 мс — это уже почти как живой собеседник. Цена 5$/1M токенов ввода.", views: "18.2k", reactions: 412, comments: 67, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1208, daysAgo: 0, time: "сегодня 07:15", text: "Маркетинг 2026 — это не «делай рилсы». Это: личный бренд + комьюнити + автоматизация на агентах. Кто залип в 2018-м — будет догонять.", views: "9.4k", reactions: 287, comments: 43, hasMedia: false },
      { ch: "ai_product",                id: 991,  daysAgo: 1, time: "вчера 19:30", text: "Anthropic запустили Computer Use — Claude может сам кликать по экрану и работать с браузером. Демо: бронирование столика за 4 минуты.", views: "12.8k", reactions: 356, comments: 89, hasMedia: true  },
      { ch: "bogdanisssimo",             id: 433,  daysAgo: 1, time: "вчера 16:42", text: "Indie hackers, которые сделали MRR $10k за полгода в 2026 — почти все на одном паттерне: нишевый AI-tool под конкретную профессию. Не «AI для всех», а «AI для дантистов».", views: "6.2k", reactions: 198, comments: 34, hasMedia: false },
      { ch: "microfounders",             id: 287,  daysAgo: 1, time: "вчера 14:18", text: "Запустил MVP за выходные — лендинг + Stripe + один Claude prompt в бэке. Первая продажа на 3-й день. Стоимость разработки: 0$, только время.", views: "4.7k", reactions: 142, comments: 28, hasMedia: false },
      { ch: "gleb_pro_ai",               id: 612,  daysAgo: 1, time: "вчера 12:05", text: "Сравнил Sonnet 4.6 и GPT-4o на 100 задачах из реальной работы (саммари митингов, кодинг, аналитика данных). Sonnet выигрывает в 73% случаев. Полный отчёт в комментах.", views: "8.1k", reactions: 245, comments: 91, hasMedia: true  },
      { ch: "marketpsy",                 id: 1547, daysAgo: 1, time: "вчера 10:30", text: "Психология ЦА в 2026: люди устали от «продающих» постов. Работает только то, что выглядит как личный опыт. Кейс: переписали 5 постов из «эксперт» в «я попробовал» — ER вырос в 2.4 раза.", views: "5.6k", reactions: 178, comments: 22, hasMedia: false },
      { ch: "dashalovesstartups",        id: 821,  daysAgo: 2, time: "2 дня назад", text: "Сходила на питч-сессию 30 AI-стартапов. 27 из 30 — обёртки над Claude/GPT. 3 — реально интересные. Делюсь шорт-листом.", views: "4.3k", reactions: 156, comments: 41, hasMedia: false },
      { ch: "machinelearning_interview", id: 2103, daysAgo: 2, time: "2 дня назад", text: "Большой разбор: как готовиться к ML-собесам в 2026, когда LLM знают всё. Ключ — не зубрить алгоритмы, а уметь объяснять решения и считать unit-economics модели.", views: "11.4k", reactions: 312, comments: 56, hasMedia: true  },
      { ch: "danokhlopkov",              id: 678,  daysAgo: 2, time: "2 дня назад", text: "За 3 года в продукте я видел 100+ growth-экспериментов. Работают 3 из 100. И это нормально. Главное — научиться быстро убивать неработающее.", views: "7.2k", reactions: 224, comments: 38, hasMedia: false },
      { ch: "app_growth",                id: 1832, daysAgo: 3, time: "3 дня назад", text: "Топ-5 ASO-фишек 2026: 1) видеообложка обязательна, 2) субтитры в первые 3 сек, 3) локализация на 5 языков минимум, 4) A/B иконки каждые 2 недели, 5) ответы на ВСЕ ревью.", views: "5.8k", reactions: 167, comments: 29, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 412,  daysAgo: 4, time: "4 дня назад", text: "Менеджмент, который реально работает — это меньше митингов и больше письменного контекста. Линеры, ноушены, лупы — всё это инструменты. Главное — культура «писать, не созваниваться».", views: "3.9k", reactions: 134, comments: 24, hasMedia: false },
      { ch: "zheleznyak_gi",             id: 905,  daysAgo: 5, time: "5 дней назад", text: "Как я набрал 50k подписчиков в ТГ за год без рекламы: 1) пишу каждый день, 2) пишу про ниша, в которой топ-5 в стране, 3) комменты под каждым постом, 4) мемы по теме раз в неделю.", views: "13.7k", reactions: 398, comments: 78, hasMedia: true  },
      { ch: "showstartup",               id: 564,  daysAgo: 6, time: "6 дней назад", text: "Проанализировал 200 pitch-deck-ов за 2026 год. Слайд №2 (Problem) убивает 60% инвесторов на старте. Если проблема не понятна за 5 секунд — pitch проигран.", views: "6.5k", reactions: 189, comments: 32, hasMedia: false },
      { ch: "kgrbnv",                    id: 1109, daysAgo: 7, time: "1 неделя",    text: "Сделал side-проект на Cursor + Claude за 2 вечера. Запустил, получил 23 платных юзера за неделю. Цена — 9$/мес. Maintenance — 1 час в неделю.", views: "4.8k", reactions: 156, comments: 47, hasMedia: false },
      { ch: "YakovPartners",             id: 778,  daysAgo: 10, time: "10 дней назад", text: "VC-рынок 2026: чек инвестиций сократился на 18%, но количество сделок выросло на 22%. Тренд — ранние раунды и микро-фонды.", views: "9.1k", reactions: 268, comments: 45, hasMedia: false },
      { ch: "tvoi_memolog",              id: 3201, daysAgo: 12, time: "12 дней назад", text: "Когда твой агент впервые сам апрувнул задачу без тебя 🤖", views: "22.4k", reactions: 1240, comments: 134, hasMedia: true },
      { ch: "salikov_i",                 id: 654,  daysAgo: 14, time: "2 недели назад", text: "За 7 лет в дизайне я понял одно: лучшие интерфейсы — это те, которые ты не замечаешь. Если юзеру нужен онбординг — ты проиграл.", views: "7.8k", reactions: 234, comments: 41, hasMedia: false },
      { ch: "your_pet_project",          id: 187,  daysAgo: 18, time: "18 дней назад", text: "Запустил pet-project в декабре, забыл про него на 4 месяца, зашёл — 312 платных подписок $5/мес. Урок: иногда лучшее, что можешь сделать со своим продуктом — оставить его в покое.", views: "16.3k", reactions: 521, comments: 87, hasMedia: false },
      { ch: "pohodu_media",              id: 928,  daysAgo: 22, time: "3 недели назад", text: "Контент-маркетинг 2026: TG-каналы заменили блоги, рилсы заменили YouTube, Substack заменил рассылки. А podcasts всё там же — 5% аудитории, 0.5% дохода.", views: "5.4k", reactions: 178, comments: 33, hasMedia: false },
      { ch: "linkedinhero",              id: 1455, daysAgo: 28, time: "месяц назад",   text: "LinkedIn algorithm change: посты с 1-3 хэштегами получают +40% impressions vs 5+. Качество > количество. Запостил, дождался первых 10 комментов — алгоритм даёт +120% reach.", views: "8.6k", reactions: 298, comments: 52, hasMedia: false },
      { ch: "ict_moscow_ai",             id: 412,  daysAgo: 45, time: "1.5 месяца назад", text: "Москва запустила пилот: 50 школ — учителя используют AI-агентов для проверки сочинений. Время проверки сократилось в 4 раза, качество (по двойному аудиту) — выше человеческого.", views: "11.2k", reactions: 387, comments: 96, hasMedia: true  },
      { ch: "gordeyai",                  id: 209,  daysAgo: 65, time: "2 месяца назад",   text: "Думал собрать AI-фреймворк сам — оказалось проще написать обёртку над Claude SDK на 200 строк. 90% сложности AI-проектов это не модель, а данные и UX.", views: "6.8k", reactions: 187, comments: 28, hasMedia: false },
      { ch: "ai_product",                id: 1002, daysAgo: 0, time: "сегодня 10:18", text: "Apple Intelligence добавили нативный API для агентов в iOS 19. Можно запускать действия в любом приложении голосом — Calendar, Notes, Mail и любые third-party. Анонс с WWDC.", views: "24.6k", reactions: 587, comments: 142, hasMedia: true  },
      { ch: "telega_Rinata",             id: 711,  daysAgo: 0, time: "сегодня 09:55", text: "Опросил 50 фаундеров: какой инструмент сильнее всего изменил их работу в 2026? Топ-3: 1) Cursor (28), 2) Claude Sonnet (22), 3) Linear AI (19).", views: "5.7k", reactions: 178, comments: 31, hasMedia: false },
      { ch: "cryptoEssay",               id: 489,  daysAgo: 0, time: "сегодня 09:12", text: "Crypto + AI = новый narrative. Tokens of agent platforms за неделю выросли в среднем на 38%. Самые активные: Bittensor, Fetch, Render.", views: "8.3k", reactions: 234, comments: 56, hasMedia: false },
      { ch: "pervmarketing",             id: 1841, daysAgo: 0, time: "сегодня 08:30", text: "Реклама в ТГ 2026: средний CPM в нишевых каналах — 480₽, в массовых — 240₽. Но конверсия в нишевых в 4-5 раз выше. Считайте CAC, а не клики.", views: "4.2k", reactions: 145, comments: 28, hasMedia: false },
      { ch: "dimabeseda",                id: 624,  daysAgo: 1, time: "вчера 22:10", text: "Год работы remote: 320 митингов, 1200 PR-ов, 8 продуктов. Главный инсайт — деление команды на «делает» и «решает» убивает skill-set обоих.", views: "6.9k", reactions: 215, comments: 47, hasMedia: false },
      { ch: "its_capitan",               id: 388,  daysAgo: 1, time: "вчера 18:42", text: "Капитанский совет: если ты Product Owner и не можешь объяснить новому стажёру свой роадмап за 5 минут — у тебя не роадмап, а wishlist.", views: "5.1k", reactions: 167, comments: 34, hasMedia: false },
      { ch: "ikspertnaya",               id: 1156, daysAgo: 1, time: "вчера 15:18", text: "Эксперт-маркетинг сдох в 2024-м. То, что работает в 2026: «делюсь, потому что сама пробую». Обзоры > советы.", views: "4.6k", reactions: 156, comments: 22, hasMedia: false },
      { ch: "linkedinhero",              id: 1502, daysAgo: 1, time: "вчера 13:30", text: "LinkedIn: новая фича Comment Boost — посты с >50 комментов в первые 30 минут получают +400% reach. Попросите комьюнити поддержать в первые часы.", views: "9.8k", reactions: 312, comments: 78, hasMedia: false },
      { ch: "mnk_stories",               id: 822,  daysAgo: 1, time: "вчера 11:00", text: "История от подписчика: 2 года работал в найме на 250к, ушёл в свой проект на $500/мес. Через год — $14k MRR. Главный страх — съехать с ипотеки — оказался необоснованным.", views: "12.1k", reactions: 423, comments: 89, hasMedia: true  },
      { ch: "salikov_i",                 id: 712,  daysAgo: 2, time: "2 дня назад", text: "Дизайн-системы 2026: variables в Figma + Tokens Studio + автоматическая синхронизация в Tailwind. Время от изменения цвета в Figma до прода — 30 минут.", views: "5.3k", reactions: 189, comments: 36, hasMedia: false },
      { ch: "your_pet_project",          id: 195,  daysAgo: 2, time: "2 дня назад", text: "Запустил pet ровно неделю назад. Метрики: 1.2k посещений, 87 регистраций, 14 платных подписок ($5/мес). CAC = 0₽ (только TG), MRR = $70. Доволен.", views: "7.8k", reactions: 256, comments: 45, hasMedia: false },
      { ch: "machinelearning_interview", id: 2118, daysAgo: 2, time: "2 дня назад", text: "Топ-10 ошибок в ML-инфраструктуре, которые видели на собесах в 2026: 1) пайплайн без версионирования данных, 2) нет мониторинга drift, 3) фичи на боевом контуре считаются по-другому. Полный список — в комментах.", views: "10.5k", reactions: 287, comments: 92, hasMedia: false },
      { ch: "marketpsy",                 id: 1561, daysAgo: 3, time: "3 дня назад", text: "Когнитивная дешёвая ловушка: «я подпишусь, потом разберусь». 80% подписок на каналы > 6 месяцев — это просто шум в подписках. Делайте регулярную чистку.", views: "4.9k", reactions: 167, comments: 28, hasMedia: false },
      { ch: "bogdanisssimo",             id: 451,  daysAgo: 4, time: "4 дня назад", text: "Запустил No-Code MVP на Cursor — построил, развернул, нашёл первого юзера за 6 часов. Раньше на это уходили недели. Главный навык 2026 — не программирование, а постановка задач.", views: "6.7k", reactions: 224, comments: 41, hasMedia: false },
      { ch: "ai_product",                id: 1015, daysAgo: 5, time: "5 дней назад", text: "Тренд: AI Personality Layer — компании добавляют «характер» к своим LLM-ассистентам. Notion AI стал «друг», Linear AI — «строгий менеджер». UX через personality.", views: "8.4k", reactions: 256, comments: 53, hasMedia: true  },
      { ch: "showstartup",               id: 578,  daysAgo: 6, time: "6 дней назад", text: "Что отличает успешный pitch от провального: не идея, не команда, не traction. А способность фаундера за 30 секунд объяснить, почему именно сейчас, именно эта команда, именно эта проблема.", views: "5.6k", reactions: 178, comments: 32, hasMedia: false },
      { ch: "pohodu_media",              id: 941,  daysAgo: 7, time: "1 неделя",     text: "Контент-маркетинг 2026: один длинный лонгрид > 10 коротких постов. Глубокие материалы цитируют, в них возвращаются, на них ссылаются. Короткие — пролистывают.", views: "4.3k", reactions: 145, comments: 24, hasMedia: false },
      { ch: "neural_prosecco",           id: 4795, daysAgo: 11, time: "11 дней назад", text: "Anthropic выкатили Claude Memory — модель помнит контекст между сессиями. Можно построить персонального помощника, который реально знает историю общения. Цена памяти — отдельный пул токенов.", views: "16.8k", reactions: 489, comments: 102, hasMedia: true  },
      { ch: "tvoi_memolog",              id: 3245, daysAgo: 15, time: "2 недели",     text: "Ребрендинг 2026: «AI стартап» теперь звучит как «дотком стартап» в 2002. Все они есть. Ищите тех, кто говорит «agentic platform» или «autonomous workflow».", views: "18.2k", reactions: 712, comments: 124, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 442,  daysAgo: 19, time: "19 дней назад", text: "Корпоративная этика 2026: использование AI для работы — норма. Но скрывать это перед заказчиком — токсично. Открытость = доверие. Прозрачность = премиум-цена.", views: "4.7k", reactions: 156, comments: 31, hasMedia: false },
      { ch: "kgrbnv",                    id: 1145, daysAgo: 24, time: "3.5 недели",   text: "Запустил агентскую систему, заменил 3 человека из команды. Освободил $18k/мес. Заработал $0 — всё ушло на токены и мониторинг. Реальная экономия — внимание, а не деньги.", views: "7.2k", reactions: 234, comments: 48, hasMedia: false },
      { ch: "danokhlopkov",              id: 695,  daysAgo: 27, time: "месяц назад",  text: "Лучший Growth-эксперимент 2025-го у нас: убрали онбординг полностью. Конверсия в paid выросла на 23%. Иногда меньше — больше.", views: "8.6k", reactions: 287, comments: 56, hasMedia: false },
      { ch: "YakovPartners",             id: 821,  daysAgo: 38, time: "1.3 месяца",  text: "Q1 2026 в venture: $42B, deals 2840. AI/agents забрали 38% всего объёма. SaaS classic упал до 12%. Видеть в физическом b2b — реально новая ниша.", views: "13.4k", reactions: 412, comments: 87, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1188, daysAgo: 52, time: "1.7 месяца",  text: "Маркетинг как когнитивная архитектура: что в голове клиента, когда он видит твой бренд? Это не «awareness», это слой смыслов. И он строится годами.", views: "7.9k", reactions: 245, comments: 38, hasMedia: false },
      { ch: "microfounders",             id: 312,  daysAgo: 78, time: "2.5 месяца",  text: "Микробизнес 2026: 1 человек, $5-30k MRR, 0-1 сотрудников. Это новая золотая середина. Не unicorn, не лайфстайл — просто умная экономия скейла.", views: "11.7k", reactions: 356, comments: 67, hasMedia: false },
    ],
  },
  "Инсайт-карточки тем": {
    type: "cards",
    rows: [
      { title: "AI-агенты для SMM",      meta: "хайп · 12 постов" },
      { title: "No-code запуски",        meta: "растёт · 8 постов" },
      { title: "Рилсы vs посты",         meta: "затухает · 15 постов" },
      { title: "+ ещё 9 карточек",       meta: "не показаны" },
    ],
  },
};

function normalizeTgUsername(input) {
  let s = (input || "").trim();
  s = s.replace(/^https?:\/\//, "").replace(/^t\.me\//, "").replace(/^@/, "");
  s = s.replace(/[^a-zA-Z0-9_]/g, "");
  return s ? "@" + s : "";
}

function EditableTgList({ initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [draft, setDraft] = useState("");
  const [hoverIdx, setHoverIdx] = useState(-1);

  function add() {
    const u = normalizeTgUsername(draft);
    if (!u) return;
    if (rows.some(r => r.name === u)) { setDraft(""); return; }
    setRows([...rows, { name: u, meta: "новый" }]);
    setDraft("");
  }
  function remove(i) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="@username или t.me/username"
          style={{
            flex: 1, height: 36,
            padding: "0 12px",
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 9,
            fontSize: 13, color: "#262633",
            fontFamily: "inherit", outline: "none",
          }}
        />
        <button
          onClick={add}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            height: 36, padding: "0 14px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >+ Добавить</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center", padding: "24px 0" }}>
            Список пуст. Добавь первый канал.
          </div>
        )}
        {rows.map((r, i) => {
          const u = r.name.replace(/^@/, "");
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              style={drawerRow}
            >
              <a
                href={`https://t.me/${u}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  flex: 1, minWidth: 0,
                  textDecoration: "none", color: "inherit",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(63,149,255,0.12)", color: "#3F95FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{ic.paperPlane}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                </div>
              </a>
              <button
                onClick={() => remove(i)}
                title="Удалить"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  background: "transparent", border: "none", borderRadius: 7,
                  cursor: "pointer", color: "#FF3407",
                  opacity: hoverIdx === i ? 1 : 0,
                  transition: transition.fast,
                  fontFamily: "inherit",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KbPopup({ item, onClose }) {
  const data = KB_CONTENT[item.title];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: item.agent.color + "1A", color: item.agent.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.book}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.agent.color }} />
              <span>{item.agent.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          {!data && (
            <div style={{ fontSize: 13, color: "rgba(38,38,51,0.55)", textAlign: "center", padding: "24px 0" }}>
              Содержимое ещё не подгружено
            </div>
          )}
          {data?.type === "text" && (
            <div style={{
              fontSize: 13.5, color: "#262633", lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              padding: "12px 14px",
              background: "rgba(38,38,51,0.03)",
              borderRadius: 10,
            }}>{data.body}</div>
          )}
          {data?.type === "list" && data?.editable === "tg" && (
            <EditableTgList initialRows={data.rows} />
          )}
          {(data?.type === "list" || data?.type === "files") && !data?.editable && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={drawerRow}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(38,38,51,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(38,38,51,0.5)", flexShrink: 0,
                  }}>{data.type === "files" ? ic.file : (
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                  )}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                    {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {data?.type === "posts" && <PostsViewer rows={data.rows} />}
          {data?.type === "cards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.title}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3 }}>{r.meta}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: "12px 18px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          display: "flex", gap: 8,
        }}>
          <button style={{
            flex: 1, height: 36,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Открыть в чате с {item.agent.label}
          </button>
          <button style={{
            height: 36, padding: "0 14px",
            background: color.white, color: "#262633",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}
