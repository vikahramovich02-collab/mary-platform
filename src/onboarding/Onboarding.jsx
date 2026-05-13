import { useState, useEffect, useRef } from "react";

const T = {
  white: "#FFFFFF",
  bg: "#F5F5F5",
  surface: "#F7F8FA",
  ink: "#18181B",
  soft: "rgba(42,40,48,0.3)",  // #2A2830 at 30%
  muted: "#818181",
  border: "#E8E8E8",
  red: "#FF3407",
  blue: "#0794FF",
  orange: "#FF4D00",
  green: "#34C759",
  purple: "#8A38F5",
  whiteSoft: "rgba(255,255,255,0.3)",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
};

async function askAI(system, messages, max, useSearch) {
  try {
    const key = import.meta.env.VITE_ANTHROPIC_KEY || "";
    const body = { model: "claude-sonnet-4-20250514", max_tokens: max || 1000, system, messages };
    if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": true },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (useSearch) return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n") || "";
    return (d.content && d.content[0] && d.content[0].text) || "";
  } catch (err) { return ""; }
}

function cleanMd(t) {
  return t.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,3}\s/g, "");
}

function isValidUrl(str) {
  if (!str || !str.trim()) return false;
  try {
    var u = str.indexOf("://") >= 0 ? str : "https://" + str;
    var parsed = new URL(u);
    return parsed.hostname.indexOf(".") >= 0 && parsed.hostname.length > 3;
  } catch (e) { return false; }
}

function BusinessLink(props) {
  var onSubmit = props.onSubmit;
  var ref = useRef(null);
  var _s = useState("");
  var url = _s[0]; var setUrl = _s[1];
  var _e = useState(false);
  var error = _e[0]; var setError = _e[1];

  function handleSubmit() {
    if (!url.trim()) return;
    if (isValidUrl(url)) { setError(false); onSubmit(url); }
    else { setError(true); }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 40px" }}>
        <span style={{ fontSize: 16, fontWeight: 450, color: T.soft, cursor: "pointer" }}>{"← Назад"}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "40px 24px 140px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 450, color: T.ink, margin: "0 0 14px", lineHeight: 1.15 }}>{"Расскажите про свой бизнес"}</div>
          <p style={{ fontSize: 16, fontWeight: 450, color: T.soft, margin: 0, lineHeight: 1.2 }}>{"Выберите сферу, чтобы мы подобрали лучшие"}<br />{"решения для вас"}</p>
        </div>
        <div style={{ width: "100%", maxWidth: 500, textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginBottom: 40, marginTop: 0, lineHeight: 1.2 }}>{"Вставьте ссылку на сайт или соц. сети"}</p>
          <div style={{ display: "flex", alignItems: "center", background: T.surface, borderRadius: 14, padding: url.trim() ? "5px 5px 5px 0" : "5px 0" }}>
            <input
              ref={ref}
              type="text"
              value={url}
              onChange={function(e) { setUrl(e.target.value); setError(false); }}
              onKeyDown={function(e) { if (e.key === "Enter") handleSubmit(); }}
              placeholder="https://"
              style={{ flex: 1, padding: "14px 20px", border: "none", fontSize: 16, fontFamily: T.font, outline: "none", color: T.ink, background: "transparent" }}
            />
            {url.trim() ? (
              <button onClick={handleSubmit} style={{ padding: "12px 24px", border: "none", background: T.ink, color: isValidUrl(url) ? "#FFFFFF" : T.whiteSoft, fontSize: 15, fontWeight: 450, cursor: "pointer", fontFamily: T.font, borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>{"Продолжить  →"}</button>
            ) : null}
          </div>
          <div style={{ minHeight: 30, marginTop: 10, textAlign: "left" }}>
            {error ? <span style={{ fontSize: 14, color: T.red }}>{"Некорректная ссылка"}</span> : null}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 450, color: T.soft, margin: "0 0 8px" }}>{"Нет ссылки? Пройдите опрос за "}<span style={{ background: T.surface, borderRadius: 6, padding: "2px 8px" }}>{"30 сек"}</span></p>
          <span onClick={function() { onSubmit(""); }} style={{ fontSize: 16, fontWeight: 450, color: T.ink, cursor: "pointer" }}>{"Пройти  →"}</span>
        </div>
      </div>
    </div>
  );
}

function Analyzing(props) {
  var url = props.url;
  var _i = useState(0); var idx = _i[0]; var setIdx = _i[1];
  var _f = useState(true); var fade = _f[0]; var setFade = _f[1];
  var _ph = useState(["Анализирую сайт...", "Изучаю структуру...", "Смотрю продукты и услуги..."]); var phrases = _ph[0]; var setPhrases = _ph[1];
  var fetched = useRef(false);

  // After 2s, fetch personalized pain-phrases from Claude
  useEffect(function() {
    if (fetched.current) return;
    fetched.current = true;
    var timer = setTimeout(function() {
      var sys = [
        "Сгенерируй 5 коротких фраз для экрана загрузки анализа бизнеса.",
        "Первые 2 фразы — что ты изучаешь (\"Изучаю вашу линейку курсов...\", \"Смотрю конкурентов...\").",
        "Последние 3 фразы — возможные боли этого бизнеса, сформулированные как наблюдения (\"Похоже, клиенты уходят после первой покупки...\", \"Вижу что воронка теряет лидов на этапе оплаты...\").",
        "Каждая фраза до 8 слов, с \"...\" в конце. Конкретно под ЭТОТ бизнес.",
        "ТОЛЬКО JSON массив строк."
      ].join("\n");
      var msg = url ? "Бизнес: " + url : "Малый бизнес";
      askAI(sys, [{ role: "user", content: msg }], 400).then(function(reply) {
        try {
          var s = reply.indexOf("["); var e = reply.lastIndexOf("]");
          if (s >= 0 && e > s) {
            var arr = JSON.parse(reply.slice(s, e + 1));
            if (arr.length >= 3) { setPhrases(arr); return; }
          }
        } catch(err) {}
        setPhrases([
          "Изучаю ваш сайт и продукты...",
          "Смотрю кто ваши конкуренты...",
          "Похоже, клиенты уходят после первого визита...",
          "Вижу возможности для автоматизации...",
          "Формирую персональный план..."
        ]);
      });
    }, 2000);
    return function() { clearTimeout(timer); };
  }, []);

  useEffect(function() {
    var t = setInterval(function() {
      setFade(false);
      setTimeout(function() {
        setIdx(function(p) { return (p + 1) % Math.max(phrases.length, 1); });
        setFade(true);
      }, 350);
    }, 2500);
    return function() { clearInterval(t); };
  }, [phrases]);

  // Extract domain for favicon
  var domain = "";
  if (url) {
    try {
      var u = url.indexOf("://") >= 0 ? url : "https://" + url;
      domain = new URL(u).hostname;
    } catch(e) { domain = url.replace(/https?:\/\//, "").split("/")[0]; }
  }
  var faviconUrl = domain ? "https://" + domain + "/favicon.ico" : "";
  var fallbackUrls = domain ? [
    "https://" + domain + "/favicon.ico",
    "https://" + domain + "/favicon.png",
    "https://icons.duckduckgo.com/ip3/" + domain + ".ico",
  ] : [];
  var _logoIdx = useState(0); var logoIdx = _logoIdx[0]; var setLogoIdx = _logoIdx[1];
  var _logoOk = useState(false); var logoOk = _logoOk[0]; var setLogoOk = _logoOk[1];

  function handleLogoError() {
    if (logoIdx < fallbackUrls.length - 1) {
      setLogoIdx(logoIdx + 1);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      {/* Text — on top */}
      <div style={{ fontSize: 20, fontWeight: 450, color: T.ink, opacity: fade ? 1 : 0, transition: "opacity .35s", minHeight: 30, textAlign: "center", marginBottom: 32 }}>{phrases[idx % phrases.length]}</div>
      {/* Spinner */}
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid " + T.border, borderTopColor: T.ink, animation: "spin 1s linear infinite", marginBottom: 32 }} />
      {/* Logo */}
      {fallbackUrls.length > 0 ? (
        <img
          src={fallbackUrls[logoIdx]}
          alt=""
          onLoad={function() { setLogoOk(true); }}
          onError={handleLogoError}
          style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 12, display: logoOk ? "block" : "none" }}
        />
      ) : null}
      {/* URL */}
      {url ? <div style={{ fontSize: 16, fontWeight: 450, color: T.soft }}>{url.indexOf("://") >= 0 ? url : "https://" + url}</div> : null}
    </div>
  );
}

function Problems(props) {
  var pains = props.pains; var onSelect = props.onSelect; var onBack = props.onBack;
  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font }}>
      <div style={{ padding: "20px 40px" }}>
        <span onClick={onBack} style={{ fontSize: 16, fontWeight: 450, color: T.soft, cursor: "pointer" }}>{"← Назад"}</span>
      </div>
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "20px 32px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 450, color: "#000000", margin: "0 0 20px", lineHeight: 1 }}>{"Делегируйте это ИИ-агентам"}</div>
          <p style={{ fontSize: 16, fontWeight: 450, color: "#000000", opacity: 0.3, margin: "0 auto", lineHeight: 1.2, maxWidth: 423 }}>{"Мы нашли задачи, которые можно передать ИИ-агентам прямо сейчас. Выберите — покажем решение за 2 минуты"}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {pains.map(function(p, i) {
            return (
              <div key={i} onClick={function() { onSelect(p); }} style={{ background: T.surface, borderRadius: 30, padding: 30, cursor: "pointer", transition: "box-shadow .2s, transform .15s", display: "flex", flexDirection: "column" }}
                onMouseEnter={function(e) { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                {/* Pills — solid bg */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "#FFD5CD" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.35 8.4C4.95 6.8 1.35 10.4 1.35 11.9l3.5.5h6.5c1.17-.67 2.4-2.33-2-3.5z" fill="#FF3407"/><circle cx="6.85" cy="3.4" r="2" fill="#FF3407"/><path d="M1.45 11.97c0-2.2 1.84-3.99 5.6-3.99s5.6 1.79 5.6 3.99c0 .35-.26.63-.57.63H2.02c-.32 0-.57-.28-.57-.63z" stroke="#FF3407" strokeWidth="1.5"/><path d="M9.15 3.5a2.1 2.1 0 11-4.2 0 2.1 2.1 0 014.2 0z" stroke="#FF3407" strokeWidth="1.5"/></svg>
                    <span style={{ fontSize: 14, fontWeight: 450, color: "#FF3407" }}>{p.human_time || "3 дня"}</span>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 10px", borderRadius: 8, background: "#CDE6FF" }}>
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none"><rect x="3.11" y="1.39" width="8.36" height="6.5" rx="1.86" fill="#0794FF"/><circle cx="5.9" cy="4.18" r=".93" fill="#EDE9FE"/><circle cx="8.68" cy="4.18" r=".93" fill="#EDE9FE"/><path d="M1.26 11.61a2.79 2.79 0 012.78-2.79h6.5a2.79 2.79 0 012.79 2.79v.93c0 .51-.42.93-.93.93H2.18c-.51 0-.93-.42-.93-.93v-.93z" fill="#0794FF"/><path d="M6.83.46h.93" stroke="#0794FF" strokeWidth=".93" strokeLinecap="round"/></svg>
                    <span style={{ fontSize: 14, fontWeight: 450, color: "#0794FF" }}>{p.ai_time || "15 мин"}</span>
                  </div>
                </div>
                {/* Title — 22px/590 */}
                <div style={{ fontSize: 22, fontWeight: 450, color: "#000000", margin: "0 0 16px", lineHeight: 1.2 }}>{p.title}</div>
                {/* Desc — 16px/510 */}
                <p style={{ fontSize: 16, fontWeight: 450, color: "#0D0D0E", lineHeight: 1.3, margin: "0 0 30px", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
                {/* Bottom row — agent 24px circle with stroke */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#000"/></svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 450, color: T.muted }}>{p.agent || "ИИ-Менеджер"}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 450, color: T.ink }}>{"Попробовать  →"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChatScreen(props) {
  var pain = props.pain; var url = props.url; var onBack = props.onBack; var onPaywall = props.onPaywall; var onPlatform = props.onPlatform;
  var _m = useState([]); var messages = _m[0]; var setMessages = _m[1];
  var _i = useState(""); var input = _i[0]; var setInput = _i[1];
  var _l = useState(false); var loading = _l[0]; var setLoading = _l[1];
  var _s = useState(false); var streaming = _s[0]; var setStreaming = _s[1];
  var _u = useState(0); var userMsgCount = _u[0]; var setUserMsgCount = _u[1];
  var _p = useState(false); var showPaywall = _p[0]; var setShowPaywall = _p[1];
  var _c = useState(null); var choiceCard = _c[0]; var setChoiceCard = _c[1];
  var endRef = useRef(null);
  var sentRef = useRef(false);

  useEffect(function() { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, streaming, choiceCard, showPaywall]);
  useEffect(function() { if (!streaming) return; var t = setInterval(function() { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, 150); return function() { clearInterval(t); }; }, [streaming]);

  function parseChoices(text) {
    var lines = text.split("\n");
    var numbered = [];
    var firstNumLine = -1;
    for (var i = 0; i < lines.length; i++) {
      if (/^\d+[\.\)]\s/.test(lines[i].trim())) {
        if (firstNumLine < 0) firstNumLine = i;
        numbered.push(lines[i].trim().replace(/^\d+[\.\)]\s*/, "").trim());
      }
    }
    if (numbered.length < 2) return null;
    // Question = last non-empty line before numbered list
    var q = "";
    for (var j = firstNumLine - 1; j >= 0; j--) {
      if (lines[j].trim()) { q = lines[j].trim(); break; }
    }
    if (!q || q.length < 3) q = "Выберите:";
    // beforeText = everything BEFORE the numbered list (all lines before first "1.")
    var beforeText = lines.slice(0, firstNumLine).join("\n").trim();
    return { question: q, options: numbered, beforeText: beforeText };
  }

  function sendMessage(text) {
    if (!text || !text.trim() || loading || streaming) return;
    setInput("");
    var newCount = userMsgCount + 1;
    setUserMsgCount(newCount);
    setChoiceCard(null);
    var userMsg = { role: "user", text: text };
    var updated = messages.concat([userMsg]);
    setMessages(updated);
    setLoading(true);

    var biz = url ? "Бизнес клиента: " + url + ". Ты уже изучила этот сайт." : "Малый бизнес.";
    var ex = updated.filter(function(m) { return m.role === "user"; }).length;

    var sys = [
      "Ты — Mary, Главный ИИ-Менеджер. " + biz,
      "",
      "Клиент выбрал задачу: \"" + pain.title + "\"",
      "Описание: " + pain.desc,
      "",
      "Это " + ex + "-е сообщение клиента в диалоге.",
      "",
      "У ТЕБЯ СТРОГИЙ СЦЕНАРИЙ ИЗ 4 ШАГОВ:",
      "",
      "ШАГ 1 — ПЛАН (твой первый ответ, " + ex + "=1):",
      "Покажи что понимаешь боль — 1-2 предложения эмпатии, конкретная ситуация из жизни владельца.",
      "Затем дай план: \"Вот что сделаю:\" с 4-5 пунктами через \"- \".",
      "В конце задай первый уточняющий вопрос с вариантами ответа.",
      "Пример вопроса: \"Как сейчас ведёте базу клиентов?\" с вариантами.",
      "",
      "ШАГ 2 — УТОЧНЕНИЯ (" + ex + "=2 или 3):",
      "Клиент ответил на вопрос. Отреагируй коротко (\"Отлично, CRM — это идеально.\").",
      "Объясни зачем тебе эта информация — 1 предложение.",
      "Задай СЛЕДУЮЩИЙ уточняющий вопрос с вариантами.",
      "Примеры вопросов: \"Какая CRM?\", \"Сколько клиентов в базе?\", \"Какой средний чек?\", \"Как сейчас привлекаете клиентов?\"",
      "ЗАДАВАЙ ВОПРОСЫ КОТОРЫЕ РЕАЛЬНО НУЖНЫ для решения выбранной задачи.",
      "",
      "ШАГ 3 — РЕШЕНИЕ (" + ex + "=3 или 4):",
      "У тебя достаточно информации. Покажи КОНКРЕТНОЕ решение:",
      "- Что именно сделаешь (пошагово)",
      "- Какой результат получит клиент (с цифрами если можно)",
      "- Сроки реализации",
      "Это должно быть впечатляюще и конкретно.",
      "",
      "ШАГ 4 — ПОДКЛЮЧЕНИЕ (после решения):",
      "Скажи: чтобы я начала работать — мне нужно подключиться к твоим данным/системам.",
      "Объясни КОНКРЕТНО что нужно: доступ к CRM, базе клиентов, аналитике и т.д.",
      "Тон: \"Чтобы я подключилась к [что-то конкретное] и вытянула [данные] — нужно подключить Mary к вашему бизнесу.\"",
      "ПОСЛЕДНЕЙ строкой напиши ровно: [ПОДКЛЮЧИТЬ]",
      "",
      "ОПРЕДЕЛИ НА КАКОМ ТЫ ШАГЕ по номеру сообщения (" + ex + ") и СЛЕДУЙ СЦЕНАРИЮ.",
      "Если " + ex + "=1 → Шаг 1. Если " + ex + "=2 → Шаг 2. Если " + ex + "=3 → Шаг 2 или 3. Если " + ex + ">=4 → Шаг 3+4.",
      "",
      "ФОРМАТ ВОПРОСА С ВАРИАНТАМИ:",
      "Текст вопроса?",
      "",
      "1. Вариант",
      "2. Вариант",
      "3. Вариант",
      "4. Напишите..",
      "",
      "ПРАВИЛА:",
      "- Пиши как умный друг: коротко, конкретно, по делу",
      "- НЕ используй звёздочки, markdown, хештеги",
      "- Буллеты только через \"- \"",
      "- Максимум 150 слов",
      "- [ПОДКЛЮЧИТЬ] ТОЛЬКО на шаге 4, НИКОГДА раньше"
    ].join("\n");

    var apiMsgs = updated.map(function(m) { return { role: m.role === "user" ? "user" : "assistant", content: m.text }; });

    askAI(sys, apiMsgs, 2000).then(function(reply) {
      if (!reply) reply = "Произошла ошибка. Попробуйте ещё раз.";
      var cleaned = cleanMd(reply);
      var hasMarker = cleaned.indexOf("[ПОДКЛЮЧИТЬ]") >= 0;
      var noMarker = cleaned.replace(/\[ПОДКЛЮЧИТЬ\]/g, "").trim();
      var choices = hasMarker ? null : parseChoices(noMarker);
      var mainText = choices ? choices.beforeText : noMarker;

      setLoading(false);
      var sid = Date.now();
      setMessages(function(prev) { return prev.concat([{ role: "assistant", text: "", _sid: sid }]); });
      setStreaming(true);

      var i = 0;
      function tick() {
        if (i >= mainText.length) {
          setMessages(function(prev) { return prev.map(function(m) { return m._sid === sid ? { role: "assistant", text: mainText } : m; }); });
          setStreaming(false);
          if (choices) { setTimeout(function() { setChoiceCard(choices); }, 400); }
          if (hasMarker) { setTimeout(function() { setShowPaywall(true); }, 1200); }
          return;
        }
        i = Math.min(i + 3, mainText.length);
        setMessages(function(prev) { return prev.map(function(m) { return m._sid === sid ? { role: "assistant", text: mainText.slice(0, i) } : m; }); });
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  useEffect(function() {
    if (!sentRef.current) { sentRef.current = true; setTimeout(function() { sendMessage(pain.title); }, 300); }
  }, []);

  function renderLine(line, li) {
    if (!line.trim()) return <div key={li} style={{ height: 10 }} />;
    if (line.trim().charAt(0) === "-" || line.trim().charAt(0) === "•") {
      return <div key={li} style={{ fontSize: 16, fontWeight: 450, color: "#18181B", lineHeight: 1.2, paddingLeft: 20, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 0 }}>{"•"}</span>{line.trim().replace(/^[-•·]\s*/, "")}</div>;
    }
    if ((line.trim().slice(-1) === ":" || line.trim().indexOf("Вот что") === 0) && line.trim().length < 50) {
      return <div key={li} style={{ fontSize: 20, fontWeight: 450, color: "#18181B", lineHeight: 1.2, marginTop: 16, marginBottom: 8 }}>{line}</div>;
    }
    if (line.trim().slice(-1) === "?") {
      return <div key={li} style={{ fontSize: 16, fontWeight: 450, color: "#18181B", lineHeight: 1.2, marginTop: 12 }}>{line}</div>;
    }
    return <div key={li} style={{ fontSize: 16, fontWeight: 450, color: "#18181B", lineHeight: 1.2 }}>{line}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 50px", display: "flex", alignItems: "center" }}>
        <span onClick={onBack} style={{ fontSize: 16, fontWeight: 450, color: "#2A2830", cursor: "pointer", whiteSpace: "nowrap" }}>{"← Назад"}</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#FAFAFA", border: "1px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#000"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 450, color: "#000000", lineHeight: 1 }}>{"Mary"}</div>
            <div style={{ fontSize: 14, fontWeight: 450, color: "#000000", opacity: 0.3, lineHeight: 1, marginTop: 5 }}>{"Главный ИИ-Менеджер"}</div>
          </div>
        </div>
        <button onClick={function() { setMessages([]); setUserMsgCount(0); setShowPaywall(false); setChoiceCard(null); sentRef.current = false; setTimeout(function() { sentRef.current = true; sendMessage(pain.title); }, 300); }}
          style={{ padding: "10px", borderRadius: 10, border: "none", background: "#F6F6F6", fontSize: 14, fontWeight: 450, color: "#000000", opacity: 0.3, cursor: "pointer", fontFamily: T.font, marginRight: 20, whiteSpace: "nowrap" }}>{"Очистить"}</button>
        <span onClick={onPlatform} style={{ fontSize: 16, fontWeight: 450, color: "#2A2830", cursor: "pointer", whiteSpace: "nowrap" }}>{"Перейти к платформе  →"}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 24px 32px" }}>
          {messages.map(function(m, i) {
            return (
              <div key={i} style={{ marginBottom: 24 }}>
                {m.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#18181B", color: "#FFFFFF", borderRadius: 16, padding: 16, fontSize: 16, fontWeight: 450, maxWidth: "65%", lineHeight: 1.2, wordBreak: "break-word" }}>{m.text}</div>
                  </div>
                ) : (
                  <div style={{ maxWidth: "80%", wordBreak: "break-word" }}>
                    {m.text.split("\n").map(renderLine)}
                  </div>
                )}
              </div>
            );
          })}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid " + T.border, borderTopColor: T.ink, animation: "spin .8s linear infinite" }} />
              <span style={{ fontSize: 15, color: T.muted }}>{"Печатает.."}</span>
            </div>
          ) : null}
          {choiceCard && !showPaywall ? (
            <div style={{ background: "#F7F8FA", borderRadius: 20, padding: 20, marginTop: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 450, color: T.ink, marginBottom: 30, padding: "0 0 0 0" }}>{choiceCard.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {choiceCard.options.map(function(opt, oi) {
                  var isWrite = opt.indexOf("Напишите") >= 0 || opt.indexOf("напишите") >= 0;
                  return (
                    <div key={oi} onClick={function() {
                      if (isWrite) { setChoiceCard(null); setTimeout(function() { var inp = document.querySelector("input[placeholder='Напишите..']"); if (inp) inp.focus(); }, 100); }
                      else { setChoiceCard(null); sendMessage(opt); }
                    }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 12px", borderRadius: 12, background: "#FFFFFF", cursor: "pointer" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "#141315", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 450, flexShrink: 0 }}>{oi + 1}</div>
                      <span style={{ fontSize: 16, fontWeight: 450, color: isWrite ? "#CFD2D7" : "#1F1F24" }}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {showPaywall ? (
            <div style={{ background: T.surface, borderRadius: 20, padding: "32px 28px 28px", marginTop: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 450, color: T.ink, margin: "0 0 24px", textAlign: "center" }}>{"Подключить Mary к вашему бизнесу?"}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={onBack} style={{ flex: 1, padding: "14px 20px", borderRadius: 100, border: "none", background: T.border, fontSize: 14, fontWeight: 450, color: T.ink, cursor: "pointer", fontFamily: T.font }}>{"Вернуться к промптам"}</button>
                <button onClick={onPaywall} style={{ flex: 1, padding: "14px 20px", borderRadius: 100, border: "none", background: T.ink, color: T.white, fontSize: 14, fontWeight: 450, cursor: "pointer", fontFamily: T.font }}>{"Подключить Mary"}</button>
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>
      {!showPaywall ? (
        <div style={{ padding: "12px 24px 24px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", background: T.surface, borderRadius: 16, padding: "4px 8px 4px 4px" }}>
              <span style={{ padding: "8px 12px", fontSize: 22, color: T.soft, cursor: "pointer", userSelect: "none", lineHeight: 1 }}>{"+"}</span>
              <input
                type="text"
                value={input}
                onChange={function(e) { setInput(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") sendMessage(input); }}
                placeholder="Напишите.."
                disabled={loading || streaming}
                style={{ flex: 1, padding: "12px 8px", border: "none", fontSize: 15, fontFamily: T.font, outline: "none", background: "transparent", color: T.ink }}
              />
              {input.trim() ? (
                <button onClick={function() { sendMessage(input); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FF4D00", color: T.white, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{"↑"}</button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GoogleAuth(props) {
  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 380, width: "100%", padding: "0 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="white"/></svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 450, color: T.ink, margin: "0 0 8px" }}>{"Подключить Mary"}</div>
        <p style={{ fontSize: 15, color: T.muted, margin: "0 0 36px" }}>{"Войдите чтобы продолжить"}</p>
        <button onClick={props.onAuth} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", padding: "14px 24px", borderRadius: 12, border: "1px solid " + T.border, background: T.white, fontSize: 15, fontWeight: 450, color: T.ink, cursor: "pointer", fontFamily: T.font }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {"Войти через Google"}
        </button>
      </div>
    </div>
  );
}

function Pricing(props) {
  var _s = useState(0); var sel = _s[0]; var setSel = _s[1];
  var plans = [
    { tab: "7 дней", price: "29,99 BYN", label: "Месяц" },
    { tab: "Месяц", price: "79,99 BYN", label: "Месяц" },
    { tab: "Год", price: "599,99 BYN", label: "Год" },
  ];
  var current = plans[sel];

  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "24px 40px" }}>
        <span onClick={props.onBack || function(){}} style={{ fontSize: 16, fontWeight: 450, color: T.soft, cursor: "pointer" }}>{"← Назад"}</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 0", maxWidth: 520, margin: "0 auto", width: "100%" }}>
        {/* Title */}
        <div style={{ fontSize: 28, fontWeight: 450, color: T.ink, margin: "0 0 12px", textAlign: "center" }}>{"Выберите план"}</div>
        <p style={{ fontSize: 16, fontWeight: 450, color: T.soft, margin: "0 0 32px", textAlign: "center" }}>{"Выберите сферу, чтобы подобрали лучшие"}<br />{"решения для вас"}</p>

        {/* Tab switcher */}
        <div style={{ display: "inline-flex", background: T.surface, borderRadius: 100, padding: 4, marginBottom: 40 }}>
          {plans.map(function(p, i) {
            var active = sel === i;
            return (
              <div key={i} onClick={function() { setSel(i); }} style={{
                padding: "10px 24px", borderRadius: 100,
                background: active ? T.ink : "transparent",
                color: active ? T.white : T.soft,
                fontSize: 14, fontWeight: 450, cursor: "pointer",
                transition: "all .15s",
              }}>{p.tab}</div>
            );
          })}
        </div>

        {/* Price card */}
        <div style={{ width: "100%", background: T.bg, borderRadius: 20, padding: "40px 32px", marginBottom: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 280 }}>
          <div style={{ fontSize: 16, fontWeight: 450, color: T.soft }}>{current.label}</div>
        </div>

        {/* Pay button */}
        <div style={{ width: "100%", marginTop: -1 }}>
          <button onClick={function() { props.onSelect(plans[sel]); }} style={{
            width: "100%", padding: "18px 24px", borderRadius: "0 0 20px 20px",
            border: "none", background: T.ink, color: T.white,
            fontSize: 16, fontWeight: 450, cursor: "pointer", fontFamily: T.font,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 450 }}>{current.price}</span>
            <span>{"Оплатить"}</span>
          </button>
        </div>

        {/* Skip */}
        <div style={{ textAlign: "center", padding: "28px 0 40px" }}>
          <span onClick={function() { props.onSelect(null); }} style={{ fontSize: 16, fontWeight: 450, color: T.soft, cursor: "pointer" }}>{"Пропустить  →"}</span>
        </div>
      </div>
    </div>
  );
}

function Survey(props) {
  var onDone = props.onDone; var onBack = props.onBack;
  var _step = useState(0); var step = _step[0]; var setStep = _step[1];
  var _answers = useState({}); var answers = _answers[0]; var setAnswers = _answers[1];
  var _custom = useState(""); var custom = _custom[0]; var setCustom = _custom[1];

  var steps = [
    {
      title: "Какая сфера?",
      sub: "Это поможет подобрать правильных агентов",
      type: "chips",
      options: ["SaaS / Tech", "E-commerce", "Образование", "Коучинг", "Агентство", "Финтех", "HR", "Недвижимость", "Event", "Юридические", "Медиа"],
      allowCustom: true
    },
    {
      title: "Сколько человек в команде?",
      sub: "Поймём масштаб и нагрузку",
      type: "chips",
      options: ["Только я", "2–5", "6–15", "16–50", "50+"],
      allowCustom: false
    },
    {
      title: "Что сейчас болит больше всего?",
      sub: "Начнём с самого важного",
      type: "list",
      options: ["Мало клиентов / лидов", "Клиенты приходят, но не возвращаются", "Команда не справляется с потоком", "Нет системности — всё на ручнике", "Не понимаю цифры бизнеса"],
      allowCustom: true
    },
    {
      title: "Какие инструменты используете?",
      sub: "Поймём к чему подключаться",
      type: "list",
      options: ["Google Sheets / Excel", "CRM (AmoCRM, Битрикс, HubSpot)", "Мессенджеры (Telegram, WhatsApp)", "Notion / Trello / Asana", "Ничего — всё в голове"],
      allowCustom: true
    }
  ];

  function select(option) {
    var newAnswers = {};
    for (var k in answers) newAnswers[k] = answers[k];
    newAnswers[step] = option;
    setAnswers(newAnswers);
    setCustom("");

    if (step < steps.length - 1) {
      setTimeout(function() { setStep(step + 1); }, 200);
    } else {
      var desc = "Сфера: " + (newAnswers[0] || "") + ". Команда: " + (newAnswers[1] || "") + ". Боль: " + (newAnswers[2] || "") + ". Инструменты: " + (newAnswers[3] || "");
      onDone(desc);
    }
  }

  function submitCustom() {
    if (custom.trim()) select(custom.trim());
  }

  var current = steps[step];
  var selected = answers[step];

  // Radio circle component
  function RadioCircle(props) {
    var active = props.active;
    return (
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + (active ? T.ink : T.border), background: active ? T.ink : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
        {active ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 40px", display: "flex", alignItems: "center" }}>
        <span onClick={step > 0 ? function() { setStep(step - 1); } : onBack} style={{ fontSize: 16, fontWeight: 450, color: T.soft, cursor: "pointer" }}>{"← Назад"}</span>
        <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 450, color: T.soft }}>{(step + 1) + " из " + steps.length}</div>
        <div style={{ width: 80 }} />
      </div>
      {/* Progress bar */}
      <div style={{ padding: "0 40px", marginBottom: 0 }}>
        <div style={{ width: "100%", height: 4, background: "#F1F1F1", borderRadius: 30, overflow: "hidden" }}>
          <div style={{ width: ((step + 1) / steps.length * 100) + "%", height: "100%", background: "#18181B", borderRadius: 30, transition: "width .3s" }} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 40px 80px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
        {/* Question */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, margin: "0 0 12px", textAlign: "center", lineHeight: 1.2 }}>{current.title}</div>
        <p style={{ fontSize: 16, fontWeight: 450, color: T.soft, margin: "0 0 0", textAlign: "center" }}>{current.sub}</p>

        <div style={{ flex: 1 }} />

        {/* CHIPS layout */}
        {current.type === "chips" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 700 }}>
            {current.options.map(function(opt, oi) {
              var isSelected = selected === opt;
              return (
                <div key={oi} onClick={function() { select(opt); }} style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", borderRadius: 16,
                  background: isSelected ? "#141516" : "#F7F8FA",
                  cursor: "pointer", transition: "all .15s",
                }}>
                  {isSelected ? (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#141516" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#CFD2D7" }} />
                  )}
                  <span style={{ fontSize: 16, fontWeight: 450, color: isSelected ? "#FFFFFF" : "#CFD2D7" }}>{opt}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* LIST layout (step 3, 4) */}
        {current.type === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 520 }}>
            {current.options.map(function(opt, oi) {
              var isSelected = selected === opt;
              return (
                <div key={oi} onClick={function() { select(opt); }} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "18px 20px", borderRadius: 14,
                  background: isSelected ? T.bg : T.surface,
                  cursor: "pointer", transition: "all .15s",
                }}>
                  <RadioCircle active={isSelected} />
                  <span style={{ fontSize: 15, fontWeight: 450, color: isSelected ? T.ink : T.soft }}>{opt}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Custom input — "Другое" */}
        {current.allowCustom ? (
          <div style={{ marginTop: 20, width: "100%", maxWidth: current.type === "chips" ? 200 : 520 }}>
            <div style={{ display: "flex", alignItems: "center", background: current.type === "list" ? T.surface : "transparent", borderRadius: 14, borderBottom: current.type === "chips" ? "1.5px solid " + T.border : "none", padding: current.type === "list" ? "4px 4px 4px 0" : "0" }}>
              <input
                type="text"
                value={custom}
                onChange={function(e) { setCustom(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") submitCustom(); }}
                placeholder="Другое"
                style={{ flex: 1, padding: current.type === "list" ? "14px 20px" : "10px 4px", border: "none", fontSize: 15, fontFamily: T.font, outline: "none", color: T.ink, background: "transparent" }}
              />
              {custom.trim() && current.type === "list" ? (
                <button onClick={submitCustom} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: T.ink, color: T.white, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{"→"}</button>
              ) : null}
              {custom.trim() && current.type === "chips" ? (
                <span onClick={submitCustom} style={{ fontSize: 14, color: T.ink, cursor: "pointer", fontWeight: 450, padding: "0 4px" }}>{"→"}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function Onboarding(props) {
  var onDone = props && props.onDone;
  var _sc = useState("link"); var screen = _sc[0]; var setScreen = _sc[1];
  var _u = useState(""); var url = _u[0]; var setUrl = _u[1];
  var _pa = useState([]); var pains = _pa[0]; var setPains = _pa[1];
  var _pn = useState(null); var pain = _pn[0]; var setPain = _pn[1];
  var _sd = useState(""); var surveyDesc = _sd[0]; var setSurveyDesc = _sd[1];

  function analyze(u) {
    setUrl(u);
    setScreen("analyzing");
    var sys = [
      "Ты — бизнес-аудитор. " + (u.indexOf("://") >= 0 || u.indexOf(".") >= 0 ? "Изучи сайт через web search и думай как директор этого бизнеса." : "Тебе описали бизнес. Думай как директор."),
      "",
      "ЗАДАЧА: придумай 4 реальные бизнес-задачи (не проблемы сайта — задачи директора).",
      "",
      "ПОРЯДОК КАРТОЧЕК:",
      "- Первые 2-3: задачи которые ИИ-агент решит СРАЗУ, без доступа к данным клиента. Агенты умеют: искать инфо в интернете, парсить конкурентов, строить стратегии, проверять документы, писать скрипты продаж, создавать контент-планы, строить Telegram-ботов.",
      "- Последние 1-2: задачи посложнее, требующие подключения к CRM/данным клиента.",
      "",
      "ФОРМАТ ЗАГОЛОВКА: задача с глагола, конкретная, под ЭТОТ бизнес.",
      "",
      "ОПИСАНИЕ: 1-2 предложения, почему это проблема.",
      "",
      "human_time — сколько человек тратит (\"~3 дня\", \"~1 день\")",
      "ai_time — сколько ИИ-агент потратит (\"~15 мин\", \"~30 мин\")",
      "",
      "СТРОГО JSON: [{\"title\":\"...\",\"desc\":\"...\",\"agent\":\"ИИ-Менеджер\",\"human_time\":\"~3 дня\",\"ai_time\":\"~15 мин\"}]",
      "ТОЛЬКО JSON."
    ].join("\n");

    var isUrl = u.indexOf(".") >= 0;
    var msg = isUrl
      ? "Изучи сайт: " + u + ". Что болит у директора?"
      : "Бизнес: " + u + ". " + (surveyDesc ? surveyDesc : "") + " Что болит у директора?";

    var p = isUrl ? askAI(sys, [{ role: "user", content: msg }], 2000, true) : Promise.resolve("");
    p.then(function(reply) {
      if (!reply) return askAI(sys, [{ role: "user", content: msg }], 2000);
      return reply;
    }).then(function(reply) {
      try {
        var s = reply.indexOf("[");
        var e = reply.lastIndexOf("]");
        if (s >= 0 && e > s) {
          var a = JSON.parse(reply.slice(s, e + 1));
          if (a.length >= 3) { setPains(a.slice(0, 4)); setScreen("problems"); return; }
        }
      } catch (err) {}
      setPains([
        { title: "Напомни клиентам, которые летали год назад, что пора снова", desc: "Огромная база, но после визита контакт обрывается..", agent: "ИИ-Менеджер", human_time: "~3 дня", ai_time: "~15 мин" },
        { title: "Посчитай, на чём зарабатываем — на турах, визах или страховках", desc: "Подключимся к CRM/таблицам, разобьём выручку по направлению..", agent: "ИИ-Менеджер", human_time: "~2 дня", ai_time: "~20 мин" },
        { title: "Проверь шаблоны договоров после изменений правил", desc: "Агент сверит с актуальными правилами, подсветит риски..", agent: "ИИ-Менеджер", human_time: "~1 день", ai_time: "~30 мин" },
        { title: "Покажи, когда менеджеры зашиваются, а когда скучают", desc: "Покажем нагрузку по месяцам, дадим план на сезон..", agent: "ИИ-Менеджер", human_time: "~2 дня", ai_time: "~10 мин" },
      ]);
      setScreen("problems");
    });
  }

  if (screen === "link") return <BusinessLink onSubmit={function(u) { if (u) analyze(u); else setScreen("survey"); }} />;
  if (screen === "survey") return <Survey onDone={function(desc) { setSurveyDesc(desc); analyze(desc); }} onBack={function() { setScreen("link"); }} />;
  if (screen === "analyzing") return <Analyzing url={url} />;
  if (screen === "problems") return <Problems pains={pains} onSelect={function(p) { setPain(p); setScreen("chat"); }} onBack={function() { setScreen("link"); }} />;
  if (screen === "chat") return <ChatScreen pain={pain} url={url} onBack={function() { setScreen("problems"); }} onPaywall={function() { setScreen("auth"); }} onPlatform={function() { setScreen("auth"); }} />;
  if (screen === "auth") return <GoogleAuth onAuth={function() { setScreen("pricing"); }} />;
  if (screen === "pricing") return <Pricing onSelect={function() { if (onDone) onDone(); else setScreen("done"); }} />;
  return (
    <div style={{ minHeight: "100vh", background: T.white, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{"✓"}</div>
      <div style={{ fontSize: 24, fontWeight: 450, color: T.ink, margin: 0 }}>{"Mary подключена"}</div>
      <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>{"Ваша команда агентов собирается"}</p>
      <button onClick={function() { setScreen("link"); setPains([]); setPain(null); setUrl(""); }} style={{ marginTop: 16, padding: "12px 32px", borderRadius: 12, border: "1px solid " + T.border, background: T.white, fontSize: 14, fontWeight: 450, cursor: "pointer", fontFamily: T.font, color: T.ink }}>{"Начать заново"}</button>
    </div>
  );
}
