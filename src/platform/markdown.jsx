// Markdown-рендер для чатов Mary + парсеры опций (numbered / checklist).
// Извлечено из TgKanalPage.jsx (Phase 1 refactor).

// Inline markdown: **bold** *italic* `code` [text](url). React-элементы, без dangerouslySetInnerHTML.
export function renderInline(text) {
  if (!text) return text;
  const re = /(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(`[^`\n]+`)|(\[[^\]]+\]\([^)\s]+\))/g;
  const out = [];
  let last = 0, m, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (m[1]) out.push(<strong key={key++} style={{ fontWeight: 600 }}>{tok.slice(2, -2)}</strong>);
    else if (m[2]) out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    else if (m[3]) out.push(<code key={key++} style={{
      fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 12.5,
      background: "rgba(38,38,51,0.06)", padding: "1px 6px", borderRadius: 4,
    }}>{tok.slice(1, -1)}</code>);
    else if (m[4]) {
      const linkMatch = tok.match(/\[([^\]]+)\]\(([^)\s]+)\)/);
      const href = linkMatch[2];
      const label = linkMatch[1];
      if (href.startsWith("dept://") || href.startsWith("page://")) {
        out.push(
          <button key={key++} onClick={() => window.__maryNavigate?.(href)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", marginRight: 2,
              background: "rgba(63,149,255,0.1)",
              border: "1px solid rgba(63,149,255,0.25)", borderRadius: 7,
              color: "#1a6fcc", fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", verticalAlign: "baseline",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(63,149,255,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(63,149,255,0.1)"; }}
          >
            {label}
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        );
      } else {
        out.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer"
          style={{ color: "#3F95FF", textDecoration: "underline" }}>{label}</a>);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((p, i) => typeof p === "string" ? <span key={"s"+i}>{p}</span> : p);
}

// Блочный markdown: # / ## / ### заголовки, - / * / 1. списки, > цитаты, ``` блоки кода, --- разделители, | таблицы |.
export function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const sizes = { 1: 22, 2: 18, 3: 16 };
      blocks.push(<div key={blocks.length} style={{
        fontSize: sizes[level], fontWeight: 600,
        marginTop: blocks.length === 0 ? 0 : 14, marginBottom: 6,
      }}>{renderInline(h[2])}</div>);
      i++; continue;
    }
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(<blockquote key={blocks.length} style={{
        margin: "8px 0", paddingLeft: 12,
        borderLeft: "3px solid rgba(38,38,51,0.18)",
        color: "rgba(38,38,51,0.7)",
      }}>{renderInline(quoteLines.join("\n"))}</blockquote>);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} style={{
        border: "none", borderTop: "1px solid rgba(38,38,51,0.1)", margin: "10px 0",
      }} />);
      i++; continue;
    }
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(<pre key={blocks.length} style={{
        background: "rgba(38,38,51,0.05)", padding: "10px 12px", borderRadius: 8,
        fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 12.5,
        overflowX: "auto", margin: "8px 0",
      }}>{codeLines.join("\n")}</pre>);
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const splitRow = (s) => s.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim());
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={blocks.length} style={{ overflowX: "auto", margin: "10px 0" }}>
          <table style={{
            borderCollapse: "collapse", width: "100%",
            fontSize: 13, color: "#262633",
          }}>
            <thead>
              <tr>{header.map((h, k) => (
                <th key={k} style={{
                  textAlign: "left", padding: "8px 10px",
                  fontWeight: 600, color: "#262633",
                  borderBottom: "1px solid rgba(38,38,51,0.18)",
                }}>{renderInline(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>{row.map((c, k) => (
                  <td key={k} style={{
                    padding: "8px 10px", verticalAlign: "top",
                    borderBottom: "1px solid rgba(38,38,51,0.06)",
                  }}>{renderInline(c)}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(<ul key={blocks.length} style={{
        margin: "6px 0", paddingLeft: 22,
      }}>{items.map((it, k) => <li key={k} style={{ marginBottom: 2 }}>{renderInline(it)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(<ol key={blocks.length} style={{
        margin: "6px 0", paddingLeft: 22,
      }}>{items.map((it, k) => <li key={k} style={{ marginBottom: 2 }}>{renderInline(it)}</li>)}</ol>);
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    const para = [];
    while (i < lines.length && lines[i].trim() !== ""
           && !/^(#|>|---|```|[-*]\s|\d+\.\s|\|)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) {
      blocks.push(<p key={blocks.length} style={{ margin: "4px 0" }}>{renderInline(para.join(" "))}</p>);
    } else {
      i++;
    }
  }
  return blocks;
}

// Извлекает хвост из ≥2 пронумерованных строк (1. ... 2. ...) в конце текста.
// Возвращает { body: текст до списка, options: [строки опций без префикса] | null }.
export function parseNumberedOptions(text) {
  if (!text) return { body: text, options: null };
  const lines = text.split("\n");
  let i = lines.length - 1;
  while (i >= 0 && lines[i].trim() === "") i--;
  const collected = [];
  while (i >= 0) {
    const m = lines[i].match(/^\s*\d+\.\s+(.+?)\s*$/);
    if (!m) break;
    collected.unshift(m[1].replace(/\*\*/g, ""));
    i--;
  }
  if (collected.length < 2) return { body: text, options: null };
  const bodyLines = lines.slice(0, i + 1);
  while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") bodyLines.pop();
  return { body: bodyLines.join("\n"), options: collected };
}

// Multi-select: хвост из строк "- [ ] вариант" или "* [ ] вариант" в конце текста.
export function parseChecklistOptions(text) {
  if (!text) return { body: text, options: null };
  const lines = text.split("\n");
  let i = lines.length - 1;
  while (i >= 0 && lines[i].trim() === "") i--;
  const collected = [];
  while (i >= 0) {
    const m = lines[i].match(/^\s*[-*]\s*\[\s*\]\s+(.+?)\s*$/);
    if (!m) break;
    collected.unshift(m[1].replace(/\*\*/g, ""));
    i--;
  }
  if (collected.length < 2) return { body: text, options: null };
  const bodyLines = lines.slice(0, i + 1);
  while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") bodyLines.pop();
  return { body: bodyLines.join("\n"), options: collected };
}
