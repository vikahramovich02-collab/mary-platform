import { color } from "../../ui/tokens.js";

const CHAN_ICONS = {
  tg: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z"/></svg>,
  inst: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>,
  vk: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/></svg>,
  email: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  other: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
};

const CHAN_COLORS = {
  tg: { fg: "#2AABEE", bg: "#E8F7FE" },
  inst: { fg: "#E1306C", bg: "#FDE8F0" },
  vk: { fg: "#2787F5", bg: "#E6F1FE" },
  email: { fg: "#FF9500", bg: "#FFF3E0" },
  other: { fg: "#8E8EA0", bg: "#F0F0F4" },
};

function getChannelKind(ch) {
  const s = `${ch?.id || ""} ${ch?.name || ""} ${ch?.type || ""}`.toLowerCase();
  if (s.includes("inst") || s.includes("инст")) return "inst";
  if (s.includes("vk") || s.includes("вк")) return "vk";
  if (s.includes("email") || s.includes("почт")) return "email";
  if (s.includes("tg") || s.includes("telegram") || s.includes("телег")) return "tg";
  return "other";
}

function getDeptOutcome(dept) {
  const name = (dept?.name || "").toLowerCase();
  if (name.includes("запис")) return "Записывает визит и подтверждает клиенту";
  if (name.includes("поддерж")) return "Закрывает вопрос или эскалирует человеку";
  if (name.includes("продаж")) return "Доводит до следующего шага сделки";
  if (name.includes("smm") || name.includes("контент")) return "Готовит и передаёт результат в публикацию";
  return "Фиксирует результат и двигает процесс дальше";
}

function buildWorkflowSteps(dept) {
  const channels = dept?.channels || [];
  const integrations = dept?.integrations || [];
  const firstChannel = channels[0]?.name || "канал";
  const outcome = getDeptOutcome(dept);
  const triggerLabel = channels.length > 1 ? "Сообщение из каналов" : `Сообщение из ${firstChannel}`;
  const stepThree = integrations.length > 0
    ? "Проверяет данные"
    : "Опирается на контекст";

  return [
    {
      id: "start",
      kind: "start",
      title: "Start",
      sub: "Точка запуска сценария",
    },
    {
      id: "trigger",
      kind: "trigger",
      title: triggerLabel,
      sub: channels.length > 1 ? channels.map((ch) => ch.name).join(" • ") : "Вход клиента в отдел",
    },
    {
      id: "understand",
      kind: "llm",
      title: "Mary понимает запрос",
      sub: "Определяет намерение клиента и чего он хочет добиться",
    },
    {
      id: "reply",
      kind: "agent",
      title: "Отвечает и уточняет",
      sub: "Сама ведёт диалог и добирает только недостающие детали",
    },
    {
      id: "operate",
      kind: integrations.length > 0 ? "integration" : "agent",
      title: stepThree,
      sub: integrations.length > 0 ? "Календарь, CRM, таблицы, база знаний" : "Сценарий ещё можно докрутить интеграциями позже",
    },
    {
      id: "result",
      kind: "result",
      title: outcome,
      sub: "Клиент получает понятный следующий шаг без ручной рутины",
    },
  ];
}

function IconWrap({ kind }) {
  const tone = CHAN_COLORS[kind] || CHAN_COLORS.other;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 12,
      background: tone.bg,
      color: tone.fg,
      flexShrink: 0,
    }}>
      {CHAN_ICONS[kind] || CHAN_ICONS.other}
    </span>
  );
}

function StatPill({ value, label }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 92,
      padding: "12px 14px",
      background: "#FFFFFF",
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 14,
    }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: "#262633", lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontSize: 12, color: "rgba(38,38,51,0.48)" }}>{label}</span>
    </div>
  );
}

function TopFilter({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
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
      }}
    >
      {children}
    </button>
  );
}

function ActionButton({ primary = false, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 40,
        padding: "0 16px",
        borderRadius: 12,
        border: primary ? "none" : "1px solid rgba(38,38,51,0.12)",
        background: primary ? "#262633" : "#FFFFFF",
        color: primary ? color.white : "#262633",
        fontSize: 13.5,
        fontWeight: 550,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function FlowStepCard({ step, accent }) {
  const kindStyles = {
    start: { bg: "#FFF5D8", fg: "#D9981E", border: "#F1D28B", label: "Start" },
    trigger: { bg: "#EEF4FF", fg: "#3F95FF", border: "#D5E6FF", label: "Trigger" },
    llm: { bg: "#FCEBFA", fg: "#D946A8", border: "#F4CDEC", label: "LLM" },
    agent: { bg: `${accent}14`, fg: accent, border: `${accent}2A`, label: "Agent" },
    integration: { bg: "#EEF8F2", fg: "#34C759", border: "#CDEBD7", label: "Integration" },
    result: { bg: "#F1FAF4", fg: "#34C759", border: "#C7E7D0", label: "Result" },
  };
  const tone = kindStyles[step.kind] || kindStyles.agent;

  return (
    <div style={{
      width: 224,
      minHeight: 138,
      background: "#FFFFFF",
      border: `1px solid ${tone.border}`,
      borderRadius: 20,
      padding: 18,
      boxShadow: "0 1px 2px rgba(38,38,51,0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 72,
          height: 28,
          padding: "0 10px",
          borderRadius: 999,
          background: tone.bg,
          color: tone.fg,
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}>
          {tone.label}
        </span>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: tone.fg,
          boxShadow: `0 0 0 6px ${tone.fg}18`,
          flexShrink: 0,
        }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#262633", lineHeight: 1.3 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.52)", lineHeight: 1.5, marginTop: 8 }}>
          {step.sub}
        </div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "rgba(38,38,51,0.24)",
      flexShrink: 0,
      padding: "0 2px",
    }}>
      <span style={{ width: 24, height: 1.5, background: "currentColor" }} />
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
      <span style={{ width: 24, height: 1.5, background: "currentColor" }} />
    </div>
  );
}

function SectionCard({ title, actionLabel, onAction, children }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(38,38,51,0.07)",
      borderRadius: 22,
      padding: 18,
      boxShadow: "0 1px 2px rgba(38,38,51,0.025)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{title}</div>
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 12,
              background: "rgba(38,38,51,0.05)",
              border: "none",
              color: "#262633",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function RowItem({ icon, title, sub, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: "#FFFFFF",
        border: "1px solid rgba(38,38,51,0.07)",
        borderRadius: 18,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        fontFamily: "inherit",
      }}
    >
      {icon}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 550, color: "#262633", lineHeight: 1.25 }}>
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.5)", lineHeight: 1.45, marginTop: 4 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {meta && <span style={{ fontSize: 12.5, color: "rgba(38,38,51,0.42)" }}>{meta}</span>}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "rgba(38,38,51,0.05)",
          color: "rgba(38,38,51,0.7)",
        }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

export function DepartmentOverviewPage({ dept, onNavigate, onOpenChat }) {
  const channels = dept?.channels || [];
  const agents = dept?.agents || [];
  const integrations = dept?.integrations || [];
  const accent = dept?.color || "#FF8B3D";
  const steps = buildWorkflowSteps(dept);
  const firstChannelPage = channels[0]?.page;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 28,
      height: "100%",
      minHeight: 0,
      maxWidth: 1080,
      margin: "0 auto",
      padding: "56px 28px 88px",
      background: color.white,
      overflow: "auto",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ fontSize: 44, lineHeight: 1.02, fontWeight: 600, color: "#262633", letterSpacing: "-0.04em" }}>
            Автоматизации
          </div>
          <div style={{ maxWidth: 760, fontSize: 17, lineHeight: 1.5, color: "rgba(38,38,51,0.52)" }}>
            {dept?.name
              ? `Отдел «${dept.name}»: здесь виден старт сценария, как Mary ведёт клиента по шагам и что подключено вокруг процесса.`
              : "Здесь виден старт сценария, как Mary ведёт клиента по шагам и что подключено вокруг процесса."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ActionButton onClick={() => onOpenChat?.({
            id: "ctx-" + Date.now(),
            agentId: "mary",
            text: dept?.name
              ? `Я открыл отдел ${dept.name}. Покажи, что здесь лучше докрутить в первую очередь.`
              : "Покажи, что здесь лучше докрутить в первую очередь.",
          })}>
            Спросить Mary
          </ActionButton>
          <ActionButton primary onClick={() => onNavigate?.("sandbox")}>
            Тестировать сценарий
          </ActionButton>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
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
          <TopFilter active>Сценарий</TopFilter>
          <TopFilter onClick={() => firstChannelPage && onNavigate?.(firstChannelPage)}>Канал</TopFilter>
          <TopFilter onClick={() => onNavigate?.("integrations")}>Интеграции</TopFilter>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatPill value={channels.length} label={channels.length === 1 ? "канал" : "каналов"} />
          <StatPill value={agents.length} label={agents.length === 1 ? "агент" : "агентов"} />
          <StatPill value={integrations.length} label={integrations.length === 1 ? "интеграция" : "интеграций"} />
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
        <SectionCard
          title="Основной сценарий"
          actionLabel={firstChannelPage ? "Открыть канал" : null}
          onAction={firstChannelPage ? () => onNavigate?.(firstChannelPage) : undefined}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, color: "rgba(38,38,51,0.48)", lineHeight: 1.5 }}>
              Сценарий читается слева направо: старт, входящее сообщение, работа Mary, действие в системе и итог для клиента.
            </div>
            <div style={{ overflowX: "auto", paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "stretch", gap: 14, minWidth: "max-content" }}>
                {steps.map((step, idx) => (
                  <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <FlowStepCard step={step} accent={accent} />
                    {idx < steps.length - 1 && <FlowArrow />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Каналы входа" actionLabel="Добавить канал">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {channels.length === 0 && (
              <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(38,38,51,0.48)", padding: "6px 2px" }}>
                Каналы пока не добавлены. Попросите Mary собрать первый входящий сценарий.
              </div>
            )}
            {channels.map((ch) => {
              const kind = getChannelKind(ch);
              return (
                <RowItem
                  key={ch.id}
                  title={ch.name}
                  sub="Точка входа клиента в автоматизацию"
                  onClick={ch.page ? () => onNavigate?.(ch.page) : undefined}
                  icon={<IconWrap kind={kind} />}
                />
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Кто работает внутри">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {agents.length === 0 && (
              <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(38,38,51,0.48)", padding: "6px 2px" }}>
                Агенты ещё не добавлены. Здесь появится состав отдела, когда Mary его соберёт.
              </div>
            )}
            {agents.slice(0, 6).map((agent) => (
              <RowItem
                key={agent.id}
                title={agent.role || agent.name || "Агент"}
                sub={agent.tasks || agent.systemPrompt?.slice(0, 110) || "Внутренний шаг процесса"}
                meta={agent.model || null}
                icon={
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: `${accent}16`,
                    color: accent,
                    flexShrink: 0,
                  }}>
                    <svg width={18} height={18} viewBox="0 0 24 24">
                      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/>
                      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/>
                      <circle cx="9.3" cy="13" r="1.4" fill="white"/>
                      <circle cx="14.7" cy="13" r="1.4" fill="white"/>
                    </svg>
                  </span>
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Что докрутить дальше">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              integrations.length === 0 ? "Добавить интеграции, чтобы Mary работала не только по диалогу." : "Проверить, какие интеграции реально нужны в первом показе.",
              "Пройти ещё 2–3 живых кейса клиента и убрать лишние уточнения.",
              "После этого уже расширять сценарий новыми ветками, а не раньше.",
            ].map((line, idx) => (
              <RowItem
                key={idx}
                title={line}
                sub="Следующий понятный продуктовый шаг"
                icon={
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "rgba(38,38,51,0.05)",
                    color: accent,
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: 16,
                  }}>+</span>
                }
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
