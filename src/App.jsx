import { useEffect, useMemo, useState } from "react";
import "./intreatment.css";
import "./figma-nav.css";

const specialists = [
  { id: "darya", name: "Дарья Микула", initials: "ДМ", photo: "/intreatment/site/04-person-4.jpg", role: "Практикующий психолог", quote: "Работаю с творческими людьми, которые хотят создавать свои проекты и проявляться.", tags: ["Тревога", "Самооценка"], experience: "Опыт 5 лет", fit: "9 из 10", price: 4800, format: "Онлайн", approach: "КПТ и схема-терапия", reason: "Вы отметили тревогу и желание вернуть опору в себе. Дарья работает с этими запросами бережно и структурно.", slots: ["11:00", "11:30", "18:30", "19:00"] },
  { id: "mariana", name: "Марьяна Марковская", initials: "ММ", photo: "/intreatment/site/03-person-3.jpg", role: "Практикующий психолог", quote: "Сопровождаю выход из отношений, помогаю преодолевать кризис расставания с партнёром.", tags: ["Отношения", "Границы"], experience: "Опыт 8 лет", fit: "8 из 10", price: 5200, format: "Онлайн", approach: "Эмоционально-фокусированная терапия", reason: "Марьяна помогает проживать кризисы отношений и безопасно проходить через расставание.", slots: ["10:00", "10:30", "16:00", "16:30"] },
  { id: "inna", name: "Инна Башкова", initials: "ИБ", photo: "/intreatment/site/02-person-2.jpg", role: "Практикующий психолог", quote: "Работаю со сложными чувствами и состояниями, когда у жизни нет вкуса или смысла.", tags: ["Выгорание", "Тревога"], experience: "Опыт 11 лет", fit: "8 из 10", price: 5500, format: "Онлайн и очно", approach: "Интегративный подход", reason: "Инна работает с истощением, тяжёлыми состояниями и помогает вернуть ощущение опоры.", slots: [] },
  { id: "elena", name: "Елена Попова", initials: "ЕП", photo: "/intreatment/site/01-person-1.jpg", role: "Практикующий психолог", quote: "Помогаю организовать родительство без надрыва, жертв и чувства вины.", tags: ["Тревога", "Родительство"], experience: "Опыт 7 лет", fit: "7 из 10", price: 4900, format: "Онлайн", approach: "Интегративный подход", reason: "Елена подойдёт, если важны бережность, опора и работа с повседневной перегрузкой.", slots: ["12:00", "12:30", "17:00"] },
  { id: "yulia", name: "Юлия Никифорова", initials: "ЮН", photo: "/intreatment/site/05-person-5.jpg", role: "Практикующий психолог", quote: "Помогаю женщинам, которые хотят большего, но застревают в ожидании «подходящего момента», в самокритике и сомнениях.", tags: ["Самооценка", "Перемены"], experience: "Опыт 6 лет", fit: "7 из 10", price: 5000, format: "Онлайн", approach: "КПТ", reason: "Юлия подойдёт, если запрос связан с самокритикой, сомнениями и движением к изменениям.", slots: ["13:00", "13:30"] },
  { id: "diana", name: "Диана Протас", initials: "ДП", photo: "/intreatment/site/06-person-6.jpg", role: "Практикующий психолог", quote: "Я психотравматолог, помогаю с тяжёлыми жизненными историями: насилие, травмы, посттравматический стресс.", tags: ["Травма", "Безопасность"], experience: "Опыт 9 лет", fit: "7 из 10", price: 5600, format: "Онлайн", approach: "Травма-фокусированный подход", reason: "Диана нужна там, где важны устойчивость, безопасность и опыт работы с травматичным опытом.", slots: [] },
];

const chatSteps = [
  {
    id: "name",
    prompt: "Как к вам можно обращаться?",
    options: ["Пропустить"],
    freeTextMode: "name",
  },
  {
    id: "topic",
    prompt: "В какой сфере вы хотели бы изменений или улучшений? С какой сложностью столкнулись? Какую задачу хотели бы решить?",
    options: ["Трудности в отношениях", "Я родитель, мне сложно", "Перемены в жизни", "Самореализация"],
  },
  {
    id: "relationships",
    prompt: "Что сейчас ближе всего к вашему запросу?",
    options: ["Частые конфликты", "Расставание или дистанция", "Сложно выстраивать границы", "Хочу понять себя в отношениях"],
    branchFor: "Трудности в отношениях",
  },
  {
    id: "parenting",
    prompt: "Что сейчас ощущается самым трудным?",
    options: ["Усталость и перегрузка", "Раздражение и вина", "Сложно с ребёнком", "Нужна поддержка и опора"],
    branchFor: "Я родитель, мне сложно",
  },
  {
    id: "changes",
    prompt: "Что больше всего тревожит в этой ситуации?",
    options: ["Неопределённость", "Потеря опоры", "Страх ошибиться", "Не могу собраться и начать"],
    branchFor: "Перемены в жизни",
  },
  {
    id: "self_realization",
    prompt: "Что сильнее всего мешает сейчас?",
    options: ["Прокрастинация", "Страх проявляться", "Сомнения в себе", "Не понимаю, куда двигаться"],
    branchFor: "Самореализация",
  },
  {
    id: "free_text_clarify",
    prompt: "Что сейчас важнее всего: снизить напряжение, разобраться в ситуации или начать действовать?",
    options: ["Снизить напряжение", "Разобраться в ситуации", "Начать действовать"],
    branchFor: "__free_text__",
  },
];

function Logo() { return <a className="logo" href="#top" aria-label="InTreatment, на главную"><span>●</span>InTreatment</a>; }
function Button({ children, variant = "primary", className = "", ...props }) { return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>; }
function Header({ onHome, compact = false }) { return <header className="site-header"><Logo /><nav aria-label="Основная навигация">{!compact && <button className="text-link" onClick={onHome}>Как это работает</button>}<span className="login-copy">Уже есть аккаунт?</span><Button variant="quiet">Войти</Button></nav></header>; }
function Avatar({ person, large = false }) { return <div className={`avatar ${large ? "avatar--large" : ""}`} aria-hidden="true">{person.photo ? <img src={person.photo} alt="" /> : person.initials}</div>; }
function BadgeIcon({ type }) {
  if (type === "fit") return <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.25a4.75 4.75 0 1 0 4.75 4.75" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="M7 3.15a2.85 2.85 0 1 0 2.85 2.85" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="m7 7 3.55-3.55" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><circle cx="10.55" cy="3.45" r=".9" fill="currentColor" /></svg>;
  return <svg viewBox="0 0 14 14" aria-hidden="true"><path d="m7 1.4 1.55 3.15 3.48.5-2.52 2.46.6 3.46L7 9.35l-3.11 1.62.6-3.46L1.97 5.05l3.48-.5L7 1.4Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg>;
}
function MetaBadge({ type, children }) { return <span><BadgeIcon type={type} />{children}</span>; }
function CloseIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }

function FigmaAssistantBlock({ className = "", text, time = "10:45" }) { return <div className={`figma-assistant ${className}`.trim()}><div className="figma-assistant__head"><span><img src="/intreatment-figma/asset-6.svg" alt="" /></span><div><b>Ассистент</b><small>ИИ-помощник Intreatment</small></div></div><div className="journey-assistant-copy">{text}</div><time>{time}</time></div>; }
function JourneyUserMessage({ className = "", text, time = "10:45" }) { return <div className={`journey-user-message ${className}`.trim()}><div className="journey-user-bubble">{text}</div><time>{time}</time></div>; }
function JourneyRecommendationCard({ person, onOpen }) { return <article className="journey-recommendation-card"><div className="journey-recommendation-card__top"><div className="journey-recommendation-card__person"><Avatar person={person} /><div><h3>{person.name}</h3><p>{person.role}</p><div className="journey-recommendation-card__badges"><MetaBadge type="fit">{person.fit}</MetaBadge><MetaBadge type="experience">{person.experience}</MetaBadge></div></div></div><div className="journey-recommendation-card__meta"><span>{person.price.toLocaleString("ru-RU")} ₽ · 50 минут</span><span>{person.slots.length ? "Ближайшая запись: сегодня, 18:30" : "Нет ближайших слотов"}</span></div></div><p className="journey-recommendation-card__quote">«{person.quote}»</p><div className="journey-recommendation-card__actions"><button className="journey-recommendation-card__link" type="button" onClick={onOpen}>Подробнее о психологе</button><Button onClick={onOpen}>{person.slots.length ? "Выбрать время" : "Посмотреть профиль"}</Button></div></article>; }
function ProfileModal({ person, onClose, onChoose, onNext }) {
  const days = [
    { dow: "пн", date: "3", label: "Пн, 3 августа" },
    { dow: "вт", date: "4", label: "Вт, 4 августа" },
    { dow: "ср", date: "5", label: "Ср, 5 августа" },
    { dow: "чт", date: "6", label: "Чт, 6 августа" },
    { dow: "пт", date: "7", label: "Пт, 7 августа" },
    { dow: "сб", date: "8", label: "Сб, 8 августа" },
    { dow: "вс", date: "9", label: "Вс, 9 августа", muted: true },
    { dow: "", date: "10", label: "Пн, 10 августа" },
    { dow: "", date: "11", label: "Вт, 11 августа" },
    { dow: "", date: "12", label: "Ср, 12 августа" },
    { dow: "", date: "13", label: "Чт, 13 августа" },
    { dow: "", date: "14", label: "Пт, 14 августа" },
    { dow: "", date: "15", label: "Сб, 15 августа" },
    { dow: "", date: "16", label: "Вс, 16 августа", muted: true },
  ];
  const slotsByDay = useMemo(() => {
    if (!person.slots.length) {
      return Object.fromEntries(days.map((day) => [day.date, []]));
    }
    const pool = person.slots;
    return {
      "3": pool.slice(0, 2),
      "4": pool.slice(1, 3),
      "5": pool.slice(0, 1),
      "6": pool.slice(2, 4),
      "7": pool,
      "8": pool.slice(0, 2),
      "9": [],
      "10": pool.slice(1, 2),
      "11": pool.slice(0, 3),
      "12": pool.slice(2, 4),
      "13": pool.slice(0, 2),
      "14": pool.slice(1, 4),
      "15": pool.slice(0, 1),
      "16": [],
    };
  }, [person.slots]);
  const initialDayIndex = Math.max(0, days.findIndex((day) => day.date === "7"));
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);
  const selectedDay = days[selectedDayIndex];
  const availableSlots = slotsByDay[selectedDay.date] || [];
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0] || "");
  useEffect(() => {
    setSelectedSlot(availableSlots[0] || "");
  }, [selectedDayIndex, person.id]);
  return <div className="profile-modal-overlay" role="dialog" aria-modal="true" aria-label={`Профиль психолога ${person.name}`}>
    <div className="profile-modal">
      <button className="profile-modal__close" type="button" aria-label="Закрыть" onClick={onClose}><CloseIcon /></button>
      <div className="profile-modal__hero">
        <Avatar person={person} large />
        <div className="profile-modal__hero-copy">
          <h2>{person.name}</h2>
          <p>{person.role} · {person.tags.join(" · ").toLowerCase()}</p>
          <div className="profile-modal__meta">
            <span>{person.price.toLocaleString("ru-RU")} ₽ · 50 минут</span>
            <span>{person.slots.length ? "Ближайшая запись: сегодня, 18:30" : "Нет ближайших слотов"}</span>
          </div>
        </div>
      </div>
      <section className="profile-modal__section">
        <h3>О специалисте</h3>
        <p>{person.quote} На консультации можно бережно исследовать ваш запрос и двигаться в своём темпе.</p>
        <div className="profile-modal__tags">{person.tags.map((tag) => <span key={tag}>{tag.toLowerCase()}</span>)}</div>
      </section>
      <section className="profile-modal__section">
        <h3>Образование</h3>
        <p>Высшее психологическое образование и дополнительная профессиональная подготовка в направлении практической психологии.</p>
      </section>
      <section className="profile-modal__section profile-modal__section--schedule">
        <h3>Расписание</h3>
        <p>Ваше время: Минск, Беларусь</p>
        <div className="profile-modal__calendar-head">
          <button type="button" aria-label="Предыдущая неделя">‹</button>
          <strong>3–16 августа</strong>
          <button type="button" aria-label="Следующая неделя">›</button>
        </div>
        <div className="profile-modal__calendar-grid">
          {days.map((day, index) => <button key={`${day.dow}-${day.date}`} type="button" disabled={day.muted} aria-pressed={selectedDayIndex === index} className={`${selectedDayIndex === index ? "is-selected" : ""} ${day.muted ? "is-muted" : ""}`.trim()} onClick={() => !day.muted && setSelectedDayIndex(index)}><small>{day.dow}</small><span>{day.date}</span></button>)}
        </div>
        <div className="profile-modal__slots">
          <h4>Выберите время</h4>
          <div>{availableSlots.length ? availableSlots.map((slot) => <button key={slot} type="button" className={selectedSlot === slot ? "is-selected" : ""} onClick={() => setSelectedSlot(slot)}>{slot}</button>) : <button type="button" className="is-selected">Нет слотов</button>}</div>
        </div>
      </section>
      <div className="profile-modal__footer">
        <Button disabled={!selectedSlot || !availableSlots.length} onClick={() => onChoose({ slot: selectedSlot, day: selectedDay })}>Выбрать время</Button>
        <Button variant="quiet" onClick={onNext}>Посмотреть других</Button>
      </div>
    </div>
  </div>;
}

function JourneyLayout({ children }) { return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><main className="figma-viewport journey-viewport"><div className="figma-screen journey-screen">{children}</div></main></div>; }

function LandingLegacy({ onStart }) { return <JourneyLayout><section className="figma-chat" aria-label="Подбор психолога" data-node-id="9243:6984"><FigmaAssistantBlock className="first journey-assistant--start" text={<>Здравствуйте! Я Анастасия, основательница психолог InTreatment.<br /><br />Помогу подобрать специалиста, с которым будет спокойно начать. Это займёт около 3 минут — можно выбирать варианты или писать своими словами.</>} /><button className="journey-start-cta" onClick={onStart}>Начать</button><form className="figma-input journey-input" onSubmit={e => { e.preventDefault(); onStart(); }}><label className="sr-only" htmlFor="figma-text">Расскажите</label><input id="figma-text" placeholder="Расскажите.." /><button type="submit"><img src="/intreatment-figma/asset-2.svg" alt="" />Отправить</button></form><p className="figma-safety journey-safety"><strong>Если вам сейчас небезопасно</strong> <span>Пожалуйста, обратитесь в экстренные службы вашего региона.</span></p></section></JourneyLayout>; }

function PlatformNav({ onStart }) { return <header className="source-header"><nav className="source-nav" aria-label="Главная навигация"><ul className="source-nav__left"><li><a href="#top" className="source-nav__link">Главная</a></li><li><a href="#psychologists" className="source-nav__link">Для психологов</a></li><li><a href="#journal" className="source-nav__link">Журнал</a></li></ul><a className="source-nav__logo" href="#top" aria-label="InTreatment"><span className="source-nav__logo-icon"><svg viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="source-logo-dot" cx="4.5" cy="6.5" r="4" fill="#2d2c2a"/><circle className="source-logo-ring" cx="14.5" cy="6.5" r="5" stroke="#2d2c2a" strokeWidth="1" strokeDasharray="1 1" fill="none"/></svg></span><span className="source-nav__logo-text">InTreatment<span className="source-term-card" role="tooltip"><span className="source-term-card__head"><span>[ИН ТРИ́ТМЭНТ]</span><span className="source-term-card__speaker" role="button" tabIndex="0" aria-label="Прослушать произношение">◖</span></span><span className="source-term-card__body"><span>Мы вдохновились названием сериала InTreatment, которое дословно переводится «В терапии» — сюжет каждой серии разворачивается в кабинете психолога.</span><span>Обычно «Я в терапии» говорят, когда регулярно ходят к психологу.</span><span>Мы и сами в терапии. Это влияет на каждого из нас в отдельности и на качество отношений внутри проекта. И, конечно, на качество работы — ничто не развивает специалиста лучше, чем его личная терапия.</span></span></span></span></a><ul className="source-nav__right"><li><a href="#tests" className="source-nav__link">Тесты</a></li><li><a href="#contacts" className="source-nav__link">Контакты</a></li></ul><div className="source-nav__actions"><button className="source-btn source-btn--cta" onClick={onStart}><span className="source-btn__icon"><img src="/intreatment-figma/site-cta-icon.svg" alt="" /></span><span>Начать подбор</span></button><button className="source-btn source-btn--icon" type="button" aria-label="Открыть меню"><span className="source-menu-lines" aria-hidden="true" /></button></div></nav><div className="source-nav__divider" /></header>; }

function Landing({ onBook }) {
  const [modalPerson, setModalPerson] = useState(null);
  const openPerson = ({ person }) => setModalPerson(person);
  const chooseInModal = ({ slot, day }) => {
    if (!modalPerson) return;
    onBook({ person: modalPerson, day: { label: day.label, date: `${day.date} авг` }, slot });
  };
  const nextInModal = () => setModalPerson((prev) => {
    if (!prev) return prev;
    const index = specialists.findIndex((item) => item.id === prev.id);
    return specialists[(index + 1) % specialists.length];
  });
  return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><Chat embedded onDone={openPerson} onHome={() => {}} />{modalPerson ? <ProfileModal person={modalPerson} onClose={() => setModalPerson(null)} onChoose={chooseInModal} onNext={nextInModal} /> : null}</div>;
}

function Progress({ current }) { return <div className="progress" aria-label={`Вопрос ${current + 1} из ${questions.length}`}><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>; }
function AssistantLabel() { return <div className="assistant-label"><span className="assistant-mark">●</span><div><strong>Ассистент</strong><small>Помощник InTreatment</small></div></div>; }

function Chat({ onDone, onHome, embedded = false }) {
  const flow = chatSteps;
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [text, setText] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [resultPerson, setResultPerson] = useState(null);
  const [visitorName, setVisitorName] = useState("");
  const [postMatchMode, setPostMatchMode] = useState(false);
  const current = flow[step];
  const postMatchOptions = [
    "Больше поддержки и бережности",
    "Более структурный подход",
    "Важно, чтобы было дешевле",
    "Показать ещё вариант",
  ];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length, postMatchMode, resultPerson]);

  const isUnsafe = (value) => /убить|самоуб|суицид|навредить себе|не хочу жить|угрожа(ют|ть)/i.test(value);
  const greetingName = visitorName ? `${visitorName}, ` : "";
  const topicToBranch = {
    "Трудности в отношениях": "relationships",
    "Я родитель, мне сложно": "parenting",
    "Перемены в жизни": "changes",
    "Самореализация": "self_realization",
  };
  const findStepIndex = (id) => flow.findIndex((item) => item.id === id);
  const resolvePerson = (nextAnswers) => {
    const joined = nextAnswers.join(" ").toLowerCase();
    if (/травм|насили|посттрав|тяж[её]л|опасн/.test(joined)) return specialists.find((item) => item.id === "diana");
    if (/родител|реб[её]н|вина|материн|раздраж/.test(joined)) return specialists.find((item) => item.id === "elena");
    if (/отношени|близк|границ|расстав|конфликт|партн/.test(joined)) return specialists.find((item) => item.id === "mariana");
    if (/выгора|устал|сил мало|нет вкуса|нет смысла|неопредел|потеря опоры|поддержк|напряж/.test(joined)) return specialists.find((item) => item.id === "inna");
    if (/самореал|прокраст|проявл|сомнен|двигат|проект|творч|уверен/.test(joined)) return specialists.find((item) => item.id === "darya");
    if (/самокрит|жду подходящего|не начинаю/.test(joined)) return specialists.find((item) => item.id === "yulia");
    return specialists.find((item) => item.id === "darya");
  };
  const createRecommendationMessage = (person) => ({ role: "recommendation", person });
  const finishWithPerson = (nextMessages, nextAnswers, lead = "Вот специалист, который может подойти под ваш запрос.") => {
    const person = resolvePerson(nextAnswers);
    setPostMatchMode(false);
    setResultPerson(person);
    setMessages([
      ...nextMessages,
      { role: "assistant", text: `${greetingName}${lead}`.trim() },
      createRecommendationMessage(person),
    ]);
  };
  const continueMatching = () => {
    setPostMatchMode(true);
    setMessages((prev) => [...prev, { role: "assistant", text: `${greetingName}Могу уточнить подбор. Что для вас сейчас важнее?`.trim() }]);
    const input = window.document.getElementById("journey-next-text");
    window.requestAnimationFrame(() => input?.focus());
  };
  const showNextRecommendation = () => {
    if (!resultPerson) return;
    const index = specialists.findIndex((item) => item.id === resultPerson.id);
    const next = specialists[(index + 1) % specialists.length];
    setResultPerson(next);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: `${greetingName}Показываю ещё одного специалиста.`.trim() },
      createRecommendationMessage(next),
    ]);
  };
  const resolveRefinedPerson = (option) => {
    if (option === "Показать ещё вариант") {
      const currentIndex = specialists.findIndex((item) => item.id === resultPerson?.id);
      return specialists[(currentIndex + 1 + specialists.length) % specialists.length];
    }
    if (option === "Больше поддержки и бережности") return specialists.find((item) => item.id === "inna");
    if (option === "Более структурный подход") return specialists.find((item) => item.id === "darya");
    if (option === "Важно, чтобы было дешевле") {
      return [...specialists].sort((a, b) => a.price - b.price)[0];
    }
    return resultPerson;
  };
  const answerPostMatch = (value) => {
    const nextPerson = resolveRefinedPerson(value);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: value },
      { role: "assistant", text: `${greetingName}${value === "Показать ещё вариант" ? "Показываю ещё одного специалиста." : "Поняла. Тогда покажу более точный вариант."}`.trim() },
      createRecommendationMessage(nextPerson),
    ]);
    setResultPerson(nextPerson);
    setPostMatchMode(false);
  };

  const pushAnswer = (raw) => {
    const value = raw.trim();
    if (!value) return;
    if (isUnsafe(value)) { setCrisis(true); return; }
    if (resultPerson && postMatchMode && postMatchOptions.includes(value)) {
      answerPostMatch(value);
      setText("");
      return;
    }
    if (resultPerson && !postMatchMode) {
      setMessages((prev) => [...prev, { role: "user", text: value }]);
      setText("");
      continueMatching();
      return;
    }
    if (current.id === "name") {
      const nextName = value === "Пропустить" ? "" : value;
      setVisitorName(nextName);
      const nextMessages = [...messages, ...(value === "Пропустить" ? [] : [{ role: "user", text: value }])];
      const nextStep = findStepIndex("topic");
      setStep(nextStep);
      setText("");
      setMessages([...nextMessages, { role: "assistant", text: `${nextName ? `${nextName}, ` : ""}${flow[nextStep].prompt}` }]);
      return;
    }
    const nextAnswers = [...answers, value];
    const nextMessages = [...messages, { role: "user", text: value }];
    setAnswers(nextAnswers);
    setText("");
    if (value in topicToBranch) {
      const branchId = topicToBranch[value];
      const nextStep = findStepIndex(branchId);
      setStep(nextStep);
      setMessages([...nextMessages, { role: "assistant", text: `${greetingName}${flow[nextStep].prompt}`.trim() }]);
      return;
    }
    if (current.id === "topic" && !(value in topicToBranch)) {
      const nextStep = findStepIndex("free_text_clarify");
      setStep(nextStep);
      setMessages([...nextMessages, { role: "assistant", text: `${greetingName}Поняла. Тогда покажу специалиста, который может подойти под такой запрос.\n\n${flow[nextStep].prompt}`.trim() }]);
      return;
    }
    if (["relationships", "parenting", "changes", "self_realization", "free_text_clarify"].includes(current.id)) {
      finishWithPerson(nextMessages, nextAnswers);
      return;
    }
  };

  const startFlow = () => {
    setStep(0);
    setAnswers([]);
    setText("");
    setResultPerson(null);
    setVisitorName("");
    setPostMatchMode(false);
    setMessages([
      { role: "assistant", text: "Как к вам можно обращаться?" },
    ]);
  };

  useEffect(() => {
    startFlow();
  }, []);

  if (crisis) return <SafetyState onHome={onHome} />;

  const answerButtons = resultPerson
    ? (postMatchMode
      ? postMatchOptions.map((option) => <button key={option} onClick={() => pushAnswer(option)}>{option}</button>)
      : <><button onClick={continueMatching}>Продолжить подбор</button><button onClick={showNextRecommendation}>Показать ещё вариант</button></>)
    : current.options.map((option) => <button key={option} type="button" onClick={() => pushAnswer(option)}>{option}</button>);

  const body = <section className="journey-flow" aria-label="Подбор психолога"><div className="journey-thread">{messages.map((message, index) => {
    if (message.role === "assistant") {
      return <FigmaAssistantBlock key={index} className="journey-thread-block" text={message.text.split("\n\n").map((part, partIndex) => <span key={partIndex}>{part}{partIndex < message.text.split("\n\n").length - 1 ? <><br /><br /></> : null}</span>)} />;
    }
    if (message.role === "recommendation") {
      return <JourneyRecommendationCard key={index} person={message.person} onOpen={() => onDone({ person: message.person })} />;
    }
    return <JourneyUserMessage key={index} className="journey-thread-user" text={message.text} />;
  })}</div><div className="journey-bottom-underlay" aria-hidden="true" /><section className="figma-answers journey-answers" aria-label="Варианты ответа"><p>Выберите вариант ответа или напишите</p>{answerButtons}</section><form className="figma-input journey-input" onSubmit={e => { e.preventDefault(); pushAnswer(text); }}><input aria-label="Расскажите" id="journey-next-text" value={text} onChange={e => setText(e.target.value)} placeholder="Расскажите.." /><button type="submit"><img src="/intreatment-figma/asset-2.svg" alt="" />Отправить</button></form><p className="figma-safety journey-safety"><strong>Если вам сейчас небезопасно</strong> <span>Пожалуйста, обратитесь в экстренные службы вашего региона.</span></p></section>;
  if (embedded) return body;
  return <main className="flow-page"><Header compact onHome={onHome} />{body}</main>;
}

function EmailPrompt({ email, setEmail }) { const [saved, setSaved] = useState(false); return <form className="email-prompt" onSubmit={e => { e.preventDefault(); if (email.includes("@")) setSaved(true); }}><label htmlFor="email">Хотите получить подборку на почту?</label><div><input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setSaved(false); }} placeholder="Ваш email" /><button type="submit">{saved ? "Сохранено" : "Оставить email"}</button></div><small>Необязательно — рекомендации будут доступны и без email.</small></form>; }

function SafetyState({ onHome }) { return <main className="flow-page"><Header compact onHome={onHome} /><section className="safety-state" role="alert"><div className="eyebrow">Важное сообщение</div><h1>Похоже, вам может быть сейчас небезопасно</h1><p>InTreatment не заменяет экстренную или кризисную помощь. Пожалуйста, не оставайтесь с этим в одиночестве: обратитесь в экстренные службы вашего региона или к человеку, которому доверяете.</p><p>Если есть непосредственная угроза жизни или здоровью, позвоните в местную службу экстренной помощи прямо сейчас.</p><Button onClick={onHome}>Вернуться на главную</Button></section></main>; }

function Recommendations({ onProfile, onRestart }) { const [filter, setFilter] = useState("Все"); const [email, setEmail] = useState(""); const shown = useMemo(() => filter === "Все" ? specialists : specialists.filter(s => s.tags.includes(filter)), [filter]); return <main className="flow-page"><Header compact onHome={onRestart} /><section className="results"><div className="flow-heading"><div><div className="eyebrow">Ваш результат</div><h1>Вот подходящие варианты</h1><p>Мы выбрали специалистов, которые работают с вашим запросом. Можно уточнить подборку.</p></div><Button variant="quiet" onClick={onRestart}>Пройти заново</Button></div><div className="filters" aria-label="Уточнить подборку">{["Все", "Тревога", "Отношения", "Выгорание"].map(x => <button onClick={() => setFilter(x)} className={filter === x ? "selected" : ""} key={x}>{x}</button>)}</div><div className="specialist-list">{shown.length ? shown.map(person => <SpecialistCard key={person.id} person={person} onOpen={() => onProfile(person)} />) : <div className="empty-state"><h2>Пока нет точных совпадений</h2><p>Попробуйте другой фильтр — или пройдите подбор ещё раз и опишите запрос своими словами.</p><Button variant="quiet" onClick={onRestart}>Уточнить запрос</Button></div>}</div><EmailPrompt email={email} setEmail={setEmail} /></section></main>; }
function SpecialistCard({ person, onOpen }) { return <article className="specialist-card"><div className="person-main"><Avatar person={person} /><div><h2>{person.name}</h2><p>{person.role}</p><div className="tags"><span>{person.fit}</span><span>{person.experience}</span></div></div></div><p className="quote">«{person.quote}»</p><div className="card-aside"><span>{person.price.toLocaleString("ru-RU")} ₽ · 50 минут</span><span>{person.slots.length ? "Ближайшая запись: сегодня, 18:30" : "Нет ближайших слотов"}</span></div><p className="reason">Почему подходит: {person.reason}</p><div className="card-actions"><button className="text-link" onClick={onOpen}>Подробнее о психологе</button><Button onClick={onOpen}>{person.slots.length ? "Выбрать время" : "Посмотреть профиль"}</Button></div></article>; }

function Profile({ person, onBook, onBack }) { const [tab, setTab] = useState("О специалисте"); return <main className="flow-page"><Header compact onHome={onBack} /><section className="profile"><button className="back-link" onClick={onBack}>← К рекомендациям</button><div className="profile-hero"><Avatar person={person} large /><div><div className="eyebrow">{person.role}</div><h1>{person.name}</h1><p>{person.quote}</p><div className="tags"><span>{person.experience}</span><span>{person.format}</span></div></div><aside><strong>{person.price.toLocaleString("ru-RU")} ₽</strong><span>50 минут</span><Button onClick={() => onBook(person)}>{person.slots.length ? "Выбрать время" : "Сообщить о датах"}</Button></aside></div><div className="tabs" role="tablist">{["О специалисте", "Подход и запросы", "Время"].map(x => <button role="tab" aria-selected={tab === x} className={tab === x ? "selected" : ""} onClick={() => setTab(x)} key={x}>{x}</button>)}</div><div className="profile-content">{tab === "О специалисте" && <><h2>О специалисте</h2><p>Практикующий психолог с профильным образованием и регулярной супервизией. Работает бережно, с уважением к темпу и границам клиента.</p><h2>Формат</h2><p>{person.format}. Видеовстречи в защищённом сервисе.</p></>}{tab === "Подход и запросы" && <><h2>{person.approach}</h2><p>В работе соединяет внимание к переживаниям человека и понятные практические шаги между сессиями.</p><div className="tags">{person.tags.map(t => <span key={t}>{t}</span>)}</div></>}{tab === "Время" && <Button onClick={() => onBook(person)}>{person.slots.length ? "Открыть расписание" : "Узнать о новых датах"}</Button>}</div></section></main>; }

function Booking({ person, onBack, onConfirm }) { const [day, setDay] = useState(0); const [slot, setSlot] = useState(""); const [notice, setNotice] = useState(false); const days = [{ label: "Сегодня", date: "24 июл" }, { label: "Завтра", date: "25 июл" }, { label: "Сб", date: "26 июл", holiday: true }, { label: "Вс", date: "27 июл", holiday: true }, { label: "Пн", date: "28 июл" }]; if (!person.slots.length) return <main className="flow-page"><Header compact onHome={onBack} /><section className="no-slots"><button className="back-link" onClick={onBack}>← К профилю</button><div className="eyebrow">Расписание</div><h1>Сейчас нет свободных слотов</h1><p>У {person.name} ближайшие даты пока недоступны. Оставьте email — сообщим, когда появится время.</p>{notice ? <p className="success-note">Готово, сообщим о новых датах на ваш email.</p> : <Button onClick={() => setNotice(true)}>Сообщить о новых датах</Button>}</section></main>; return <main className="flow-page"><Header compact onHome={onBack} /><section className="booking"><button className="back-link" onClick={onBack}>← К профилю</button><div className="flow-heading"><div><div className="eyebrow">Выбор времени</div><h1>Встреча с {person.name.split(" ")[0]}</h1><p>{person.price.toLocaleString("ru-RU")} ₽ · 50 минут · онлайн</p></div></div><div className="day-picker" aria-label="Даты">{days.map((d, i) => <button disabled={d.holiday} className={`${day === i ? "selected" : ""} ${d.holiday ? "holiday" : ""}`} onClick={() => setDay(i)} key={d.date}><strong>{d.label}</strong><span>{d.holiday ? "Отпуск" : d.date}</span></button>)}</div><p className="slot-label">Доступное время · шаг 30 минут</p><div className="slot-grid">{person.slots.map(time => <button onClick={() => setSlot(time)} className={slot === time ? "selected" : ""} key={time}>{time}</button>)}</div><div className="booking-footer"><div>{slot ? <><strong>{days[day].label}, {slot}</strong><span>Сеанс будет подтверждён после оплаты</span></> : <span>Выберите удобное время</span>}</div><Button disabled={!slot} onClick={() => onConfirm({ person, day: days[day], slot })}>Подтвердить запись</Button></div></section></main>; }

function CheckoutDetails({ booking, onBack, onNext }) {
  const [plan, setPlan] = useState("single");
  const [cardType, setCardType] = useState("ru");
  const [promo, setPromo] = useState("");
  const [phone, setPhone] = useState("+375 29 168 71 87");
  const singlePrice = booking.person.price;
  const bundlePrice = Math.round(singlePrice * 0.98);
  const finalPrice = plan === "single" ? singlePrice : bundlePrice;
  return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><main className="flow-page"><section className="checkout-page"><div className="checkout-page__title"><Avatar person={booking.person} /><h1>Запись к психологу</h1></div><div className="checkout-layout"><div className="checkout-main"><div className="checkout-plan-grid"><button type="button" className={`checkout-option ${plan === "single" ? "is-selected" : ""}`} onClick={() => setPlan("single")}><strong>1 сессия</strong><span>{singlePrice.toLocaleString("ru-RU")} ₽ за сессию</span></button><button type="button" className={`checkout-option ${plan === "bundle" ? "is-selected" : ""}`} onClick={() => setPlan("bundle")}><strong>Абонемент</strong><span>4 сессии · {bundlePrice.toLocaleString("ru-RU")} ₽ за сессию</span><small>-2% от базовой стоимости</small></button></div><div className="checkout-card"><h2>Способ оплаты</h2><div className="checkout-segmented"><button type="button" className={cardType === "ru" ? "is-selected" : ""} onClick={() => setCardType("ru")}>Российская карта</button><button type="button" className={cardType === "foreign" ? "is-selected" : ""} onClick={() => setCardType("foreign")}>Зарубежная карта</button></div><label className="checkout-field"><span>Промокод</span><div className="checkout-inline-field"><input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Введите промокод" /><button type="button">Применить</button></div></label></div><div className="checkout-card"><label className="checkout-field"><span>Номер телефона</span><input value={phone} onChange={(e) => setPhone(e.target.value)} /></label></div></div><aside className="checkout-sidebar"><div className="checkout-summary"><h2>Информация о сессии</h2><div className="checkout-summary__meta"><span>Онлайн</span><span>только вы</span></div><p>{booking.day.date}, {booking.day.label.toLowerCase()}, {booking.slot} (50 минут)</p><p>Europe, Minsk</p><div className="checkout-summary__divider" /><div className="checkout-summary__price"><span>Стоимость</span><strong>{finalPrice.toLocaleString("ru-RU")} ₽</strong></div><Button onClick={onNext}>Перейти к оплате</Button></div><div className="checkout-note checkout-note--mint"><p>Оплатить сессию можно в течение 20 минут. За это время другие клиенты не смогут записаться на ваше время.</p></div><div className="checkout-note checkout-note--rose"><p>Пришлём всю необходимую информацию после оплаты.</p></div></aside></div></section></main></div>;
}

function AuthChoice({ booking, onBack, onNext }) {
  const [provider, setProvider] = useState("");
  return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><main className="flow-page"><section className="payment"><button className="back-link" onClick={onBack}>← Назад</button><div className="eyebrow">Регистрация</div><h1>Войдите, чтобы открыть платформу</h1><p>Оплата уже подтверждена. Остался последний шаг: выбрать провайдера входа и перейти в личный кабинет.</p><div className="payment-panel"><div className="order"><Avatar person={booking.person} /><div><strong>{booking.person.name}</strong><span>{booking.day.label}, {booking.slot} · 50 минут</span></div><b>{booking.person.price.toLocaleString("ru-RU")} ₽</b></div><div className="providers"><button className={provider === "yandex" ? "selected" : ""} onClick={() => setProvider("yandex")}>Войти через Яндекс ID</button><button className={provider === "vk" ? "selected" : ""} onClick={() => setProvider("vk")}>Войти через VK ID</button></div><div className="payment-actions"><Button disabled={!provider} onClick={() => onNext(provider)}>Открыть платформу</Button><small>Это интерфейсный сценарий: вход реально не выполняется.</small></div></div></section></main></div>;
}

function Payment({ booking, onBack, onSuccess }) {
  return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><main className="flow-page"><section className="payment"><button className="back-link" onClick={onBack}>← К оформлению</button><div className="eyebrow">Демо-оплата</div><h1>Подтвердите запись</h1><p>Ниже — демонстрационная точка оплаты. Кнопка завершает пользовательский путь без реального списания.</p><div className="payment-panel"><div className="order"><Avatar person={booking.person} /><div><strong>{booking.person.name}</strong><span>{booking.day.label}, {booking.slot} · 50 минут</span></div><b>{booking.person.price.toLocaleString("ru-RU")} ₽</b></div><div className="payment-summary"><div><span>Формат</span><strong>Онлайн-встреча</strong></div><div><span>Длительность</span><strong>50 минут</strong></div><div><span>Дата и время</span><strong>{booking.day.label}, {booking.slot}</strong></div><div><span>К оплате</span><strong>{booking.person.price.toLocaleString("ru-RU")} ₽</strong></div></div><div className="payment-actions"><Button onClick={onSuccess}>Оплатить {booking.person.price.toLocaleString("ru-RU")} ₽</Button><small>Деньги не списываются. Это только демонстрация checkout-сценария.</small></div></div></section></main></div>;
}
function PlatformHome({ booking, onRestart }) {
  return <div className="copied-first-screen journey-page"><PlatformNav onStart={() => {}} /><main className="flow-page"><section className="platform-home platform-dashboard"><aside className="platform-dashboard__sidebar"><div className="platform-dashboard__brand"><span className="platform-dashboard__brand-mark">●</span><strong>InTreatment</strong></div><div className="platform-dashboard__group"><span>Основное</span><button className="is-active" type="button">Ближайшая встреча</button><button type="button">История встреч</button><button type="button">Повторный подбор</button></div><div className="platform-dashboard__group"><span>Сервис</span><button type="button">Оплаты и документы</button><button type="button">Сообщения</button><button type="button">Поддержка</button></div><div className="platform-dashboard__profile"><Avatar person={booking.person} /><div><strong>{booking.person.name}</strong><span>Клиент платформы</span></div></div></aside><div className="platform-dashboard__main"><div className="platform-home__head"><h1>Встреча запланирована</h1><p>Ваш кабинет уже создан. Здесь будет ближайшая запись, история встреч, оплаты и повторный подбор специалиста.</p></div><div className="platform-dashboard__hero"><div className="platform-dashboard__hero-top"><span className="platform-dashboard__pill">Ближайшая запись</span><span className="platform-dashboard__pill">Онлайн · 50 минут</span></div><div className="platform-dashboard__session-card"><div className="order"><Avatar person={booking.person} /><div><strong>{booking.person.name}</strong><span>{booking.day.label}, {booking.slot} · 50 минут</span></div><b>{booking.person.price.toLocaleString("ru-RU")} ₽</b></div><p>Перед встречей пришлём ссылку на видеозвонок и напоминание. Если планы изменятся, запись можно будет перенести или отменить внутри платформы.</p><div className="platform-dashboard__hero-actions"><Button>Открыть детали записи</Button><Button variant="quiet" onClick={onRestart}>Выбрать другого психолога</Button></div></div></div><div className="platform-shell"><div className="platform-card"><h2>Что дальше</h2><ul className="platform-list"><li>За 15 минут до начала пришлём ссылку на видеовстречу.</li><li>После первой встречи здесь появится история следующих записей.</li><li>Все подтверждения и чеки будут доступны в разделе оплат.</li></ul></div><div className="platform-card"><h2>Быстрые действия</h2><div className="platform-actions"><button type="button">Перенести встречу</button><button type="button">Скачать чек</button><button type="button">Написать в поддержку</button></div></div><div className="platform-card"><h2>Структура платформы</h2><ul className="platform-list"><li>Ближайшая запись</li><li>История встреч</li><li>Оплаты и документы</li><li>Повторный подбор специалиста</li></ul></div></div></div></section></main></div>;
}

export default function App() { const [screen, setScreen] = useState("landing"); const [selected, setSelected] = useState(null); const [booking, setBooking] = useState(null); const [authProvider, setAuthProvider] = useState(""); const home = () => { setScreen("landing"); setSelected(null); setBooking(null); setAuthProvider(""); }; if (screen === "results") return <Recommendations onProfile={p => { setSelected(p); setScreen("profile"); }} onRestart={() => setScreen("landing")} />; if (screen === "profile") return <Profile person={selected} onBook={p => { setSelected(p); setScreen("booking"); }} onBack={() => setScreen("results")} />; if (screen === "booking") return <Booking person={selected} onBack={() => setScreen("profile")} onConfirm={b => { setBooking(b); setScreen("checkout"); }} />; if (screen === "checkout") return <CheckoutDetails booking={booking} onBack={() => setScreen("booking")} onNext={() => setScreen("payment")} />; if (screen === "payment") return <Payment booking={booking} onBack={() => setScreen("checkout")} onSuccess={() => setScreen("auth")} />; if (screen === "auth") return <AuthChoice booking={booking} onBack={() => setScreen("payment")} onNext={(provider) => { setAuthProvider(provider); setScreen("platform"); }} />; if (screen === "platform") return <PlatformHome booking={booking} onRestart={() => setScreen("landing")} />; return <Landing onBook={(b) => { setSelected(b.person); setBooking(b); setScreen("checkout"); }} />; }
