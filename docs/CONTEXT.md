# Mary Landing — Ключевая информация по проекту

## Файлы
- **JSX**: `mary-landing.jsx` (~2400 строк) — React компонент
- **HTML**: `mary-landing.html` — standalone HTML (React CDN + compiled JS)
- **Сборка**: `build.js` в `/home/claude/` — Babel компиляция JSX→JS
- **Картинки**: base64 внутри JSX (`PLATFORM_CHAT_IMG`, `PLATFORM_DATA_IMG`, `DOG_1002..DOG_1011`)

## Процесс сборки
```bash
cd /home/claude && node build.js  # компилирует JSX в app-compiled.js
# Затем собирается HTML: head + React CDN + compiled JS
```

---

## UI Kit токены

```
Шрифт: SF Pro (system-ui, -apple-system, BlinkMacSystemFont), веса 400/500/600
Цвет ink: #262633
  - 100%: #262633
  - 80%: rgba(38,38,51,0.8)
  - 50%: rgba(38,38,51,0.5)
  - 30%: rgba(38,38,51,0.3)
  - 10%: rgba(38,38,51,0.1)
  - 5%:  rgba(38,38,51,0.05)
  - 3%:  rgba(38,38,51,0.03)
Accent: #6C5CE7
Карточки/фоны: #F3F3F3
Border: rgba(38,38,51,0.08)
Green: #28C840 (или из V.green)
White: #FFFFFF
```

### Контейнеры
- Wide: 1440px
- Content: 1012px
- Text: 780px
- Narrow: 640px
- Input: 538px

### Отступы
- Боковые паддинги секций: `clamp(20px, 6.9vw, 100px)` — 100px на 1440
- Заголовок → контент: 60px на 1440
- Пропорциональные скругления: 50→20, 40→24, 20→12, 16→10, 14→10, 12→8

---

## Структура лендинга (порядок блоков)

### 1. Hero (100vh)
- **Фиксированный навбар** (`position: fixed`, glass effect `saturate(180%) blur(20px)`, `rgba(255,255,255,0.65)`)
  - Прячется при скролле вниз, появляется при скролле вверх (дедзона 5px)
  - Логотип Mary (SVG) слева
  - Бургер (onClick → `setMenuOpen(true)`) + "Войти" справа
- `paddingTop: 88px` для компенсации fixed nav
- Заголовок: "Команда ии-агентов, которая работает за вас"
- Подзаголовок: "Вставьте ссылку — проанализируем и подберём решение"
- Инпут URL + кнопка стрелка
- 5 собак (webp base64 в hero) + анимированные плашки "Делают быстро" с курсорами

### 2. Scroll-reveal текст (100vh)
- "Скажите что нужно — Mary разберётся кому поручить, команда сделает, а вам останется только посмотреть готовое"
- Слова появляются по скроллу (серые → тёмные)
- **5 собак-агентов** расположены вокруг текста (absolute positioned):
  - DOG_1002 (Немецкая овчарка) — Аналитик — top:8%, left:5%
  - DOG_1004 (Джек-рассел) — Продажник — top:6%, right:8%
  - DOG_1006 (Золотистый ретривер) — Маркетолог — bottom:18%, center
  - DOG_1008 (Бордер-колли) — Разработчик — bottom:12%, left:8%
  - DOG_1011 (Австралийская овчарка) — Менеджер — bottom:10%, right:6%
- Под каждой собакой тёмная плашка с ролью (bg: #262633, белый текст, borderRadius: 8px)

### 3. Stacking Mac-окна (sticky, 400vh)
- **Заголовок фиксирован сверху**, меняется при скролле:
  1. "Агенты ведут процесс"
  2. "Задачи распределяются сами"
  3. "Ваши данные в одном месте"
- **3 Mac-окна наслаиваются** при скролле (плавный translateY привязан к scroll progress)
  - Предыдущие: scale(0.97), translateY(-8px)
  - MacWindow компонент: серый `#F3F3F3`, `borderRadius: clamp(24px, 3.5vw, 50px)`, без обводки
    - Три точки (12px, gap 8, красная/жёлтая/зелёная) на белом фоне, без серого тулбара
    - Контент: `padding: "0 20px 20px"`, картинка с `borderRadius: clamp(20px, 2.8vw, 40px)`
  - Карточка 1-2: `PLATFORM_CHAT_IMG` (скриншот чата)
  - Карточка 3: `PLATFORM_DATA_IMG` (скриншот страницы "Данные")
  - `objectFit: "contain"`, `objectPosition: "top left"`
- `paddingTop: clamp(60px, 6.9vw, 100px)` на sticky контейнере

### 4. УДАЛЁН: Блок с бегущей собакой (шаги 1→2→3)
- **НУЖНО ВЕРНУТЬ!** — был удалён при переделке блока 3
- Заголовок "Mary поможет начать"
- 3 карточки (горизонтальный скролл): "Изучит бизнес" → "Даст решения" → "Подберёт команду"
- Бегущая собака 🐕 синхронизирована со скроллом (translateX + bounce)
- Sticky, 300vh

### 5. Аккордеон "Это не «очередная нейронка»" (sticky, 300vh)
- 3 пункта: "Работают без вас", "Помнят всё о бизнесе", "Результат, а не текст"
- Grid 1fr 1fr, фиксированные колонки, opacity transition
- borderRadius: clamp(20px, 3.5vw, 50px), bg rgba(38,38,51,0.05)

### 6. Mary vs ChatGPT — сравнительная таблица
- Заголовок: "Это не очередной ChatGPT"
- Одна серая карточка `#F3F3F3`, `borderRadius: 40px`, `padding: 24-32px`
- Шапка: SVG логотип Mary + "Mary" | 💬 + "ChatGPT" (бледный)
- 8 строк: gridTemplateColumns: "140px 1fr 1fr"
  - Подход, Контекст, Результат, Память, Инициатива, Проверка, Интеграции, Каналы
  - Mary: тёмный fontWeight 500 | ChatGPT: rgba(38,38,51,0.25)
- Тонкие разделители rgba(38,38,51,0.05)

### 7. Карусель "Вы получаете готовый результат" (sticky, 400vh)
- 4 квадратные карточки `clamp(320px, 35vw, 504px)` × `clamp(320px, 35vw, 504px)`
- `borderRadius: clamp(24px, 2.8vw, 40px)`, bg `rgba(38,38,51,0.05)`
- Каждая: тёмная плашка-тег + preview, заголовок + описание, скриншот платформы снизу
- Горизонтальный скролл привязан к вертикальному
- Первая/последняя карточка по центру экрана
- Подпись: "Нейронка даёт *текст*. Mary даёт **результат**."
- Карточки:
  1. SEO-аудит за 30 секунд (📊 Маркетолог)
  2. Контент-план на месяц (✍ Копирайтер)
  3. Транскрипт встречи + задачи (🎙 Секретарь)
  4. Дизайн-макет (🎨 Дизайнер)

### 8. Интеграции — сетка 3×2
- Заголовок: "Подключается к вашим инструментам"
- 6 карточек: Telegram, Google Drive, Slack, Bitrix24/amoCRM, Календарь, Аналитика
- Карточки: `rgba(38,38,51,0.03)`, `borderRadius: clamp(20px, 2.8vw, 40px)`
- "И ещё 27 интеграций" подпись

### 9. Telegram — двухколоночный
- Заголовок: "Управляйте бизнесом прямо из Telegram"
- Плашка "✈️ Telegram" сверху
- Слева: 3 пункта (задачи голосом, утренние отчёты, согласование)
- Справа: мок переписки с Mary (аватарка M, 4 сообщения, user/mary bubbles)

### 10. Тарифы с переключателем периода
- Плашка: 7 дней / 1 месяц / Год (−20%)
- 3 карточки: Starter $49, Business $149 (акцент, тёмный фон), Enterprise $499
- Динамические цены при переключении

### 11. Финальный CTA (100vh, центрирован)
- "Всё что вы увидели — сделано через Mary"

### 12. Footer
- Логотип, email, ссылки, юридические данные (`#F5F5F5` фон)

---

## Фиксированные элементы

### Навбар (fixed top)
- Glass effect: `saturate(180%) blur(20px)`, `rgba(255,255,255, 0.65)`
- Скролл вниз → translateY(-100%), скролл вверх → translateY(0)
- Дедзона 5px

### Нижняя плашка (fixed bottom)
- Кнопки "Меню" (бургер + текст) + "Начать"
- Glass effect: `saturate(180%) blur(20px)`, `rgba(255,255,255, 0.65)`
- `padding: 8px`, `gap: 8px`
- Без тени, без обводки
- Появляется при скролле вниз после hero

---

## Полноэкранное меню (Яндекс ID стиль)

- Открывается по "Меню" (навбар + нижняя плашка) → `setMenuOpen(true)`
- States: `menuOpen`, `menuSection`, `spheresOpen`
- `background: rgba(255,255,255,.97)`, `backdropFilter: blur(20px)`
- Логотип Mary (полный SVG) + крестик закрытия

### Пункты (42px заголовки):
1. **Бесплатный аудит бизнеса** → `onScan()` (запускает сканирование)
2. **Интеграции** → подстраница с сеткой 6 сервисов
3. **Сферы бизнеса** → раскрывающийся список pill-кнопок (10 сфер)
4. **Тарифы** → подстраница с 3 карточками + сравнительная таблица (9 строк)
5. **Telegram-бот** → подстраница с описанием
6. **Контакты** → email, Telegram, юрлицо

---

## Собаки-агенты (породы и роли)

| Порода | Роль | Описание |
|--------|------|----------|
| Лабрадор | Директор | Координирует команду, распределяет задачи |
| Бордер-колли | Разработчик | Код, интеграции, автоматизация |
| Немецкая овчарка | Аналитик | Данные, отчёты, закономерности |
| Корги | Редактор | Тексты, ошибки, тон и стиль |
| Далматинец | Арт-директор | Визуал, баннеры, макеты |
| Золотистый ретривер | Маркетолог | Стратегия, контент-планы, аудитория |
| Джек-рассел-терьер | Продажник | КП, лиды, переписка с клиентами |
| Австралийская овчарка | Менеджер | Проекты, дедлайны, синхронизация |
| Самоед | Саппорт | Обращения клиентов, проблемы |
| Доберман | Юрист | Документы, договоры, риски |

### Картинки собак (base64 в JSX):
- `DOG_1002` = Немецкая овчарка (image_1002.webp)
- `DOG_1004` = Джек-рассел (image_1004.webp)
- `DOG_1006` = Золотистый ретривер (image_1006.webp)
- `DOG_1008` = Бордер-колли (image_1008.webp)
- `DOG_1011` = Австралийская овчарка (image_1011.webp)

---

## Картинки платформы (base64 в JSX):
- `PLATFORM_CHAT_IMG` = Platform_Chat-2.webp — экран чата Mary
- `PLATFORM_DATA_IMG` = Platform_Данны.webp — экран "Данные"

---

## Что нужно доработать (TODO)

1. **ВЕРНУТЬ блок с бегущей собакой** (шаги 1→2→3) — был удалён
2. **Убрать лишний отступ** в Mac-окне (padding контента)
3. Нужна картинка для экрана "Задачи" (пока используется чат)
4. Адаптивность карусели и таблицы сравнения на мобильных

---

## Юридическая информация
- ООО «МэриРоуз», УНП 193889413
- г. Минск, Беларусь
- email: hello@mary.team
- Telegram: @mary_team
================================================================================
MARY LANDING — ПОЛНЫЙ ПАКЕТ ФАЙЛОВ
================================================================================

================================================================================
ФАЙЛ 1: КОНТЕКСТ И СВОДКА (mary-landing-context.md)
================================================================================

# Mary Landing — Контекст сессии 30.03.2026

## Что сделано

### Структура лендинга (11 блоков)
1. **Hero** (100vh) — заголовок "Команда ии-агентов, которая работает за вас" + подзаголовок + инпут URL + 5 собак + анимированные плашки с курсором
2. **Процесс** — scroll-reveal текст "Скажите что нужно — Mary разберётся кому поручить, команда сделает, а вам останется только посмотреть готовое" (44px, 510→500 weight, maxWidth 780px, два цвета: чёрный + 30% opacity)
3. Видео-демо (60 сек)
4. "Это не ChatGPT" — таблица сравнения
5. Почему можно доверять — 6 карточек
6. 3 шага начать
7. **Фичи** (НОВЫЙ) — интеграции, данные, 9 департаментов, артефакты, дашборд, веб+Telegram
8. Цена с якорем — 500к/мес команда vs 990₽/нед Mary
9. Финальный CTA — "Этот лендинг сделала Mary за 4 минуты"
10. Footer

### UI Kit (mary-ui-kit.jsx)
- **Шрифт:** SF Pro — единственный шрифт для всего
- **Начертания:** 400 Regular (body), 500 Medium (все заголовки, кнопки), 600 Semibold (labels, captions)
- **Цвета:** один цвет #262633 с разной прозрачностью: 100%, 80%, 50%, 30%, 10%, 5%, 3%. Accent: #6C5CE7
- **Адаптив:** базовая точка 1440px, всё через clamp() пропорционально до мобилки 375px
- **Контейнеры:** 1440 (wide), 1012 (content), 780 (text), 640 (narrow), 538 (input)
- **Shadows:** убраны из UI Kit (не нужны)
- Вкладки: Colors, Typography, Spacing, Components

### Адаптивность
- Саша даёт значения для 1440px — я автоматически пересчитываю в clamp()
- Формула: X при 1440 → clamp(X*0.5, X/1440*100vw, Xpx)
- Применено ко ВСЕМ блокам: паддинги, шрифты, размеры, гриды

### Hero — текущая реализация
- Навбар: текстовый логотип "mary" + бургер + кнопка "Войти"
- Контент: paddingTop clamp(32px, 4.2vw, 60px) от навбара
- Заголовок: clamp(36px, 5.5vw, 80px), fontWeight 500
- Подзаголовок: clamp(18px, 2.6vw, 38px), color rgba(38,38,51,0.3)
- Инпут: maxWidth clamp(300px, 37.4vw, 538px), стрелка скрыта при пустом инпуте
- 5 собак расставлены absolute: корги, Mary с подписью, далматин, доберман, самоед
- При hover на собаку: scale(1.08) + tooltip с описанием

### Анимированные плашки с курсором
- 6 плашек: "Работают 24/7", "Не срывают дедлайны", "Делают быстро", "Контролируют качество сами", "Помнят всё", "Дешевле команды x10"
- Курсор (SVG из Figma) кликает → плашка появляется → оба исчезают → следующая
- Одна плашка за раз, зацикленная анимация
- Плашка: #262633, SF Pro Medium 20px, height 46px, borderRadius 0 80 80 20 (правые) / 80 0 20 80 (левые)
- Курсор зеркалится для левых плашек (scaleX(-1))
- Курсор кончиком указывает в угол 0 (острый угол) плашки
- 4 фазы по ~300-800мс: появление курсора → клик → показ плашки → исчезание

### Блок 2 — scroll-reveal
- Слова появляются по скроллу: серый #DCDCDC → чёрный #262633
- ВСЕ слова становятся чёрными до конца (dim убран)
- fontSize clamp(24px, 3.1vw, 44px), fontWeight 500, maxWidth clamp(320px, 54.2vw, 780px)

## Собаки — текущее состояние
Загружены (раздельно собака + подпись):
1. ✅ Лабрадор (Mary) — собака + подпись "Главный Менеджер"
2. ✅ Далматин — собака
3. ✅ Корги — собака  
4. ✅ Снежок (самоед) — собака
5. ✅ Доберман — собака

НЕ загружены:
6. ❌ Голден ретривер
7. ❌ Джек-рассел
8. ❌ Бордер-колли
9. ❌ Австралийская овчарка
10. ❌ Овчарка

Подписи — пока только Mary загружена картинкой. Остальные планировали делать CSS шрифтом Caveat + SVG стрелка.

## Hover-механика для собак (утверждена)
3 слоя:
1. Подпись (рукописная) — всегда видна
2. Статичная собака — по умолчанию
3. Анимированная собака (из Jitter/Higgsfield) — при hover
+ Плашка tooltip с описанием при hover (светлая с border)

## Удалённые элементы
- SVG логотип в навбаре (заменён на текст "mary")
- Floating advantage pills с эмодзи (заменены на анимированные плашки с курсором)
- Бейджи собак в h1 заголовке
- Arc-карусель собак (отдельный блок)

## PENDING
- [ ] Загрузить оставшихся 5 собак
- [ ] Расставить все 10 собак на оба блока (hero + блок 2)
- [ ] Подписи к собакам — CSS Caveat + SVG стрелка
- [ ] Анимации собак из Jitter (animated WebP для hover)
- [ ] Собрать блоки 3-10 по новой структуре
- [ ] Видео-демо для блока 3

## Файлы
- `/mnt/user-data/outputs/mary-landing.jsx` — основной React-компонент
- `/mnt/user-data/outputs/mary-landing.html` — самодостаточный HTML (открывается в браузере)
- `/mnt/user-data/outputs/mary-ui-kit.jsx` — UI Kit
- Figma file key: `o1syNp93H3v2dyA3JHp4em`


================================================================================
ФАЙЛ 2: UI KIT (mary-ui-kit.jsx)
================================================================================

import { useState } from "react";

/* ═══════════════════════════════════════════════
   MARY UI KIT — Design Tokens & Component Library
   Base: 1440px | Font: SF Pro | Style: Minimal warm
   ═══════════════════════════════════════════════ */

// ═══ DESIGN TOKENS ═══
const T = {
  // Colors
  color: {
    ink:        "#262633",     // Primary text
    ink80:      "rgba(38,38,51,0.8)",  // Secondary text
    ink50:      "rgba(38,38,51,0.5)",  // Tertiary text
    ink30:      "rgba(38,38,51,0.3)",  // Muted text / placeholders
    ink10:      "rgba(38,38,51,0.1)",  // Borders light
    ink05:      "rgba(38,38,51,0.05)", // Surface tint
    ink03:      "rgba(38,38,51,0.03)", // Input bg
    white:      "#FFFFFF",
    bg:         "#FAFAFA",     // Page background
    surface:    "#F5F5F5",     // Card surface
    border:     "#EBEBEB",     // Default border
    border2:    "#DCDCDC",     // Stronger border
    accent:     "#6C5CE7",     // Brand purple
    accentBg:   "rgba(108,92,231,0.06)",
    green:      "#0EA5E9",     // Status / online
    greenBg:    "rgba(14,165,233,0.06)",
    warm:       "#FF6B00",     // Warning / progress
    pink:       "#F0786A",     // Accent secondary
    pinkBg:     "rgba(240,120,106,0.06)",
    error:      "#E53E3E",
    success:    "#38A169",
  },

  // Typography — SF Pro
  font: {
    primary: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
  },

  // Type scale (desktop 1440 → mobile 375)
  type: {
    hero:     { size: "clamp(36px, 5.5vw, 80px)",  weight: 500, leading: 1.1,  tracking: "-1.5px" },
    h1:       { size: "clamp(28px, 4.3vw, 62px)",  weight: 500, leading: 1.0,  tracking: "-1.5px" },
    h2:       { size: "clamp(24px, 3.4vw, 48px)",  weight: 500, leading: 1.1,  tracking: "-1.5px" },
    h3:       { size: "clamp(22px, 3.1vw, 44px)",  weight: 500, leading: 1.2,  tracking: "-0.5px" },
    h4:       { size: "clamp(18px, 2.5vw, 36px)",  weight: 500, leading: 1.2,  tracking: "-0.5px" },
    subtitle: { size: "clamp(18px, 2.6vw, 38px)",  weight: 500, leading: 1.4,  tracking: "0" },
    body:     { size: "clamp(14px, 1.1vw, 15px)",  weight: 400, leading: 1.65, tracking: "0" },
    bodyLg:   { size: "clamp(15px, 1.2vw, 18px)",  weight: 400, leading: 1.6,  tracking: "0" },
    caption:  { size: "clamp(11px, 0.9vw, 13px)",  weight: 600, leading: 1.4,  tracking: "0.08em" },
    label:    { size: "clamp(11px, 0.8vw, 12px)",  weight: 600, leading: 1.4,  tracking: "0.05em" },
    input:    { size: "clamp(16px, 1.8vw, 26px)",  weight: 500, leading: 1.4,  tracking: "0" },
  },

  // Spacing scale (desktop → mobile proportional)
  space: {
    xs:   "clamp(4px, 0.3vw, 4px)",
    sm:   "clamp(6px, 0.6vw, 8px)",
    md:   "clamp(10px, 1.1vw, 16px)",
    lg:   "clamp(16px, 1.7vw, 24px)",
    xl:   "clamp(24px, 2.8vw, 40px)",
    "2xl": "clamp(32px, 3.3vw, 48px)",
    "3xl": "clamp(40px, 5.5vw, 80px)",
    "4xl": "clamp(56px, 6.9vw, 100px)",
    "5xl": "clamp(80px, 11.1vw, 160px)",
    section: "clamp(48px, 6.9vw, 100px) clamp(20px, 3.3vw, 48px)",
    sectionLg: "clamp(60px, 9.7vw, 140px) clamp(20px, 3.3vw, 48px)",
  },

  // Border radius
  radius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    "2xl": 20,
    "3xl": 23,
    full: "50%",
  },

  // Shadows
  shadow: {
    sm:  "0 1px 2px rgba(0,0,0,.03)",
    md:  "0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)",
    lg:  "0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
  },

  // Breakpoints
  bp: {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },

  // Container
  container: {
    max: 1440,
    content: 1012,
    text: 780,
    narrow: 640,
    input: 538,
  },

  // Transitions
  ease: {
    default: "all .15s ease",
    smooth: "all .4s cubic-bezier(.4,0,.2,1)",
    spring: "all .4s cubic-bezier(.22,1,.36,1)",
    color: "color .3s ease",
  },
};


// ═══ SWATCH COMPONENT ═══
function Swatch({ color, name, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: color, border: "1px solid rgba(0,0,0,.08)", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{name}</div>
        <div style={{ fontSize: 12, color: "#999" }}>{value}</div>
      </div>
    </div>
  );
}

// ═══ TYPE SAMPLE ═══
function TypeSample({ name, style, font }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #EBEBEB" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: style.size, fontWeight: style.weight, lineHeight: style.leading, letterSpacing: style.tracking, fontFamily: font || T.font.primary, color: "#262633" }}>
        Команда ии-агентов
      </div>
      <div style={{ fontSize: 11, color: "#CCC", marginTop: 6 }}>
        {style.size} · {style.weight} · {style.leading} · {style.tracking}
      </div>
    </div>
  );
}

// ═══ SPACE BLOCK ═══
function SpaceBlock({ name, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#262633", width: 40 }}>{name}</div>
      <div style={{ height: 24, background: "rgba(108,92,231,0.15)", borderRadius: 4, width: value, minWidth: 4, transition: "width .3s" }} />
      <div style={{ fontSize: 11, color: "#999" }}>{value}</div>
    </div>
  );
}


// ═══ MAIN UI KIT ═══
export default function MaryUIKit() {
  const [tab, setTab] = useState("colors");

  const tabs = ["colors", "typography", "spacing", "components"];

  return (
    <div style={{ fontFamily: T.font.primary, color: T.color.ink, background: T.color.white, minHeight: "100vh" }}>
      
      {/* Header */}
      <div style={{ padding: "40px 48px 0", borderBottom: "1px solid " + T.color.border }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Mary UI Kit</div>
        <div style={{ fontSize: 14, color: T.color.ink30, marginBottom: 24 }}>Design tokens · Typography · Colors · Spacing · Components</div>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 20px", border: "none", borderBottom: tab === t ? "2px solid #262633" : "2px solid transparent",
              background: "none", fontSize: 14, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#262633" : "#999", cursor: "pointer", fontFamily: T.font.primary,
              textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "40px 48px 80px", maxWidth: 960 }}>

        {/* ═══ COLORS ═══ */}
        {tab === "colors" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Primary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 40 }}>
              <Swatch color="#262633" name="ink" value="#262633 · 100%" />
              <Swatch color="rgba(38,38,51,0.8)" name="ink/80" value="#262633 · 80%" />
              <Swatch color="rgba(38,38,51,0.5)" name="ink/50" value="#262633 · 50%" />
              <Swatch color="rgba(38,38,51,0.3)" name="ink/30" value="#262633 · 30%" />
              <Swatch color="rgba(38,38,51,0.1)" name="ink/10" value="#262633 · 10%" />
              <Swatch color="rgba(38,38,51,0.05)" name="ink/05" value="#262633 · 5%" />
              <Swatch color="rgba(38,38,51,0.03)" name="ink/03" value="#262633 · 3%" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Surfaces</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 40 }}>
              <Swatch color="#FFFFFF" name="white" value="#FFFFFF" />
              <Swatch color="#FAFAFA" name="bg" value="#FAFAFA" />
              <Swatch color="#F5F5F5" name="surface" value="#F5F5F5" />
              <Swatch color="#EBEBEB" name="border" value="#EBEBEB" />
              <Swatch color="#DCDCDC" name="border2" value="#DCDCDC" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Accent</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 40 }}>
              <Swatch color="#6C5CE7" name="accent" value="#6C5CE7" />
              <Swatch color="rgba(108,92,231,0.06)" name="accent/bg" value="#6C5CE7 · 6%" />
              <Swatch color="#0EA5E9" name="green" value="#0EA5E9" />
              <Swatch color="rgba(14,165,233,0.06)" name="green/bg" value="#0EA5E9 · 6%" />
              <Swatch color="#FF6B00" name="warm" value="#FF6B00" />
              <Swatch color="#F0786A" name="pink" value="#F0786A" />
              <Swatch color="rgba(240,120,106,0.06)" name="pink/bg" value="#F0786A · 6%" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Rule</div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, maxWidth: 600, padding: "16px 20px", background: "#FAFAFA", borderRadius: 10 }}>
              Всё строится на одном цвете — <strong>#262633</strong> с разной прозрачностью. Заголовки 100%, body 80%, muted 30%, borders 10%, surfaces 5%, inputs 3%. Accent (#6C5CE7) только для интерактива и акцентов. Минимум цветов = максимум чистоты.
            </div>
          </div>
        )}

        {/* ═══ TYPOGRAPHY ═══ */}
        {tab === "typography" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Font Family</div>
            <div style={{ display: "flex", gap: 20, marginBottom: 40, padding: "20px 24px", background: "#FAFAFA", borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>SF Pro</div>
                <div style={{ fontSize: 12, color: "#999" }}>Единый шрифт для всего: заголовки, body, UI, кнопки</div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Type Scale</div>
            
            <TypeSample name="HERO" style={T.type.hero} />
            <TypeSample name="H1" style={T.type.h1} />
            <TypeSample name="H2" style={T.type.h2} />
            <TypeSample name="H3" style={T.type.h3} />
            <TypeSample name="H4" style={T.type.h4} />
            <TypeSample name="SUBTITLE" style={T.type.subtitle} />
            <TypeSample name="BODY LG" style={T.type.bodyLg} font={T.font.primary} />
            <TypeSample name="BODY" style={T.type.body} font={T.font.primary} />
            <TypeSample name="CAPTION" style={T.type.caption} font={T.font.primary} />
            <TypeSample name="LABEL" style={T.type.label} font={T.font.primary} />
            <TypeSample name="INPUT" style={T.type.input} font={T.font.primary} />

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, marginTop: 40 }}>Weights used</div>
            <div style={{ display: "flex", gap: 32, padding: "20px 24px", background: "#FAFAFA", borderRadius: 10 }}>
              {[
                { w: 400, name: "Regular", use: "Body, описания" },
                { w: 500, name: "Medium", use: "Все заголовки, кнопки" },
                { w: 600, name: "Semibold", use: "Labels, captions" },
              ].map(w => (
                <div key={w.w}>
                  <div style={{ fontSize: 24, fontWeight: w.w, marginBottom: 4 }}>{w.w}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: "#CCC" }}>{w.use}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SPACING ═══ */}
        {tab === "spacing" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Scale (desktop → mobile)</div>
            
            {[
              { name: "xs", px: "4px" },
              { name: "sm", px: "8px" },
              { name: "md", px: "16px" },
              { name: "lg", px: "24px" },
              { name: "xl", px: "40px" },
              { name: "2xl", px: "48px" },
              { name: "3xl", px: "80px" },
              { name: "4xl", px: "100px" },
              { name: "5xl", px: "160px" },
            ].map(s => <SpaceBlock key={s.name} name={s.name} value={s.px} />)}

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, marginTop: 40 }}>Containers (max-width)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Wide", w: 1440 },
                { name: "Content", w: 1012 },
                { name: "Text", w: 780 },
                { name: "Narrow", w: 640 },
                { name: "Input", w: 538 },
              ].map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, width: 60 }}>{c.name}</div>
                  <div style={{ height: 32, background: "rgba(108,92,231,0.1)", borderRadius: 6, width: (c.w / 1440) * 100 + "%", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#6C5CE7" }}>{c.w}px</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, marginTop: 40 }}>Border Radius</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { name: "sm", r: 6 },
                { name: "md", r: 10 },
                { name: "lg", r: 12 },
                { name: "xl", r: 16 },
                { name: "2xl", r: 20 },
                { name: "3xl", r: 23 },
                { name: "full", r: "50%" },
              ].map(r => (
                <div key={r.name} style={{ textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, background: "rgba(38,38,51,0.05)", border: "1.5px solid #DCDCDC", borderRadius: r.r, marginBottom: 6 }} />
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: "#CCC" }}>{typeof r.r === "number" ? r.r + "px" : r.r}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, marginTop: 40 }}>Hover rule</div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, padding: "16px 20px", background: "#FAFAFA", borderRadius: 10 }}>
              Текстовые ссылки и кнопки "Назад" при hover используют <strong>color transition</strong> (затемнение), не background.
            </div>
          </div>
        )}

        {/* ═══ COMPONENTS ═══ */}
        {tab === "components" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Buttons</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "#6C5CE7", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font.primary, boxShadow: T.shadow.md }}>Primary</button>
              <button style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "#262633", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font.primary }}>Dark</button>
              <button style={{ padding: "10px 22px", borderRadius: 8, border: "1px solid #EBEBEB", background: "#fff", color: "#262633", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font.primary }}>Outline</button>
              <button style={{ padding: "14px 32px", borderRadius: 8, border: "none", background: "#6C5CE7", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.font.primary, boxShadow: T.shadow.md }}>Large</button>
              <button style={{ padding: "18px 48px", borderRadius: 14, border: "none", background: "#262633", color: "#fff", fontSize: 18, fontWeight: 600, cursor: "pointer", fontFamily: T.font.primary }}>CTA Hero</button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Input</div>
            <div style={{ maxWidth: 538, marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(38,38,51,0.03)", borderRadius: 23, padding: "8px 16px 8px 23px", height: 79 }}>
                <input placeholder="https://" style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 26, fontWeight: 500, fontFamily: T.font.primary, color: "#262633" }} />
                <div style={{ width: 47, height: 47, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M14 6l6 6-6 6" stroke="#262633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#CCC", marginTop: 8 }}>Hero input · h:79 · r:23 · bg: ink/03 · no border</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Pills / Tags</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
              <span style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(38,38,51,0.03)", fontSize: 14, fontWeight: 500, color: "rgba(38,38,51,0.3)" }}>Advantage pill</span>
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "#F5F5F5", fontSize: 10, fontWeight: 600, color: "#999" }}>Tag</span>
              <span style={{ padding: "6px 14px", borderRadius: 8, background: "#262633", fontSize: 12, fontWeight: 600, color: "#fff" }}>Active tab</span>
              <span style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 12, fontWeight: 600, color: "#999" }}>Inactive tab</span>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.15)", fontSize: 12, fontWeight: 600, color: "#0EA5E9" }}>AI time</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Cards</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ background: "#fff", border: "1.5px solid #EBEBEB", borderRadius: 12, padding: "22px", boxShadow: T.shadow.sm }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#262633", marginBottom: 8 }}>Card title</div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>Card description with muted text</div>
              </div>
              <div style={{ background: "#FAFAFA", border: "1.5px solid #EBEBEB", borderRadius: 12, padding: "20px 24px" }}>
                <span style={{ fontSize: 26, display: "block", marginBottom: 8 }}>📊</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Feature card</div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>With emoji icon and surface bg</div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>Nav</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, marginBottom: 40 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>mary</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(38,38,51,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 18H4M20 12H4M20 6H4" stroke="#262633" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <button style={{ width: 120, height: 48, borderRadius: 16, background: "#262633", color: "#fff", border: "none", fontSize: 16, fontWeight: 500, cursor: "pointer" }}>Войти</button>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Hover rule</div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, padding: "16px 20px", background: "#FAFAFA", borderRadius: 10 }}>
              Текстовые ссылки и кнопки "Назад" при hover используют <strong>color transition</strong> (затемнение), не background. Кнопки CTA — <strong>transform: scale(1.03) + opacity: 0.9</strong>.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


================================================================================
ФАЙЛ 3: ЛЕНДИНГ (mary-landing.jsx)
================================================================================

import { useState, useEffect, useRef } from "react";

const V = {
  bg: "#FAFAFA", white: "#FFFFFF", ink: "#262633", ink2: "#444444",
  muted: "#999999", muted2: "#CCCCCC", border: "#EBEBEB", border2: "#DCDCDC",
  surface2: "#F5F5F5", pink: "#F0786A", green: "#0EA5E9", warm: "#FF6B00",
  accent: "#6C5CE7", accentBg: "rgba(108,92,231,.06)",
  greenBg: "rgba(14,165,233,.06)", pinkBg: "rgba(240,120,106,.06)",
  r: 10, rLg: 12, rSm: 6,
  shadow: "0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)",
  shadowSm: "0 1px 2px rgba(0,0,0,.03)",
  shadowLg: "0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
  serif: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
};

function Nav({ step, onBack, rightEl }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px", background: V.white, borderBottom: "1px solid " + V.border, position: "sticky", top: 0, zIndex: 100, fontFamily: V.sans }}>
      <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 700 }}>Mary<em style={{ fontStyle: "italic", color: V.accent }}>.</em></div>
      <div></div>
      <div style={{ minWidth: 80, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "1px solid " + V.border, background: V.white, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: V.sans, color: V.ink }}>← Назад</button>}
        {rightEl}
      </div>
    </nav>
  );
}

function Btn({ children, onClick, variant, full, lg }) {
  let bg = V.accent, color = "#fff", border = "none";
  if (variant === "outline") { bg = V.white; color = V.ink; border = "1px solid " + V.border; }
  if (variant === "dark") { bg = V.ink; color = "#fff"; }
  return (<button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: full ? "center" : undefined, gap: 8, padding: lg ? "14px 32px" : "10px 22px", borderRadius: 8, border, background: bg, color, cursor: "pointer", fontFamily: V.sans, fontSize: lg ? 15 : 14, fontWeight: 600, transition: "all .15s", width: full ? "100%" : undefined, boxShadow: variant === "outline" ? "none" : V.shadow }}>{children}</button>);
}

/* ═══ AGENTS DEMO (для лендинга) ═══ */
function AgentsDemo({ onTry }) {
  const [active, setActive] = useState(0);
  const agents = [
    {
      id: "smm", icon: "📣", name: "SMM-менеджер",
      sidebar: ["Контент-план", "Посты", "Аналитика", "Reels"],
      chatMsgs: [
        { from: "agent", text: "Привет! Я проанализировал конкурентов и подготовил контент-план на апрель." },
        { from: "agent", text: "12 постов, 8 Reels, 4 Stories-серии. Оптимальное время: ВТ и ЧТ в 12:00." },
        { from: "user", text: "Покажи аналитику за прошлую неделю" },
        { from: "agent", text: "Охват +47%, лучший пост: карусель про закулисье (+2.3к лайков). Вовлечённость 4.2% — выше среднего." },
      ],
      tasks: [
        { title: "Контент-план апрель", status: "done" },
        { title: "12 текстов для постов", status: "progress", pct: 60 },
        { title: "Съёмка Reels (8 шт)", status: "new" },
      ],
      tokens: 4200,
    },
    {
      id: "designer", icon: "🎨", name: "Дизайнер",
      sidebar: ["Макеты", "Сторис", "UI-кит", "Бренд"],
      chatMsgs: [
        { from: "agent", text: "Готовы 15 сторис-шаблонов для FitLife. Экспортированы в Figma." },
        { from: "user", text: "Сделай ещё 3 варианта обложки для Reels" },
        { from: "agent", text: "Готово! 3 варианта в папке «FitLife / Reels». Использовал фирменные цвета + новый шрифт." },
      ],
      tasks: [
        { title: "15 шаблонов Stories", status: "done" },
        { title: "3 обложки Reels", status: "done" },
        { title: "Каталог мебели Лофт", status: "progress", pct: 30 },
      ],
      tokens: 3800,
    },
    {
      id: "dev", icon: "💻", name: "Разработчик",
      sidebar: ["Задачи", "Баги", "Деплой", "Мониторинг"],
      chatMsgs: [
        { from: "agent", text: "Лендинг ClinicPro готов на 80%. Hero + 5 секций. Lighthouse: Performance 96." },
        { from: "user", text: "Добавь форму записи с отправкой в Telegram" },
        { from: "agent", text: "Сделано. Форма → Telegram-бот @clinicpro_bot. Тестовое сообщение отправлено." },
      ],
      tasks: [
        { title: "Лендинг ClinicPro", status: "progress", pct: 80 },
        { title: "Форма → Telegram", status: "done" },
        { title: "Интеграция с CRM", status: "new" },
      ],
      tokens: 1200,
    },
    {
      id: "acc", icon: "🧮", name: "Бухгалтер",
      sidebar: ["Расходы", "P&L", "Подписки", "Налоги"],
      chatMsgs: [
        { from: "agent", text: "Проанализировал подписки. Нашёл 3 сервиса без использования." },
        { from: "agent", text: "Figma Business ×2 лишних — 18к₽/мес. Miro — 12к₽/мес. Zoom Pro — 8к₽/мес." },
        { from: "user", text: "Сделай P&L за март" },
        { from: "agent", text: "Готово. Выручка 1.24М₽, расходы 890к₽, прибыль 350к₽. Отчёт в Google Sheets." },
      ],
      tasks: [
        { title: "Аудит подписок", status: "done" },
        { title: "P&L за март", status: "done" },
        { title: "P&L за апрель", status: "new" },
      ],
      tokens: 1600,
    },
    {
      id: "pm", icon: "📋", name: "Менеджер",
      sidebar: ["Проекты", "Дедлайны", "Команда", "Отчёт"],
      chatMsgs: [
        { from: "agent", text: "Статус 5 проектов: 2 в графике, 2 с рисками. Дизайнер перегружен на 130%." },
        { from: "user", text: "Что горит?" },
        { from: "agent", text: "ClinicPro — дедлайн пятница, лендинг 80%. FitLife — дизайнер не успевает, рекомендую передать каталог Лофт копирайтеру." },
      ],
      tasks: [
        { title: "Еженедельный отчёт", status: "done" },
        { title: "Трекинг дедлайнов", status: "progress", pct: 100 },
        { title: "Перераспределение задач", status: "new" },
      ],
      tokens: 2100,
    },
    {
      id: "lawyer", icon: "⚖️", name: "Юрист",
      sidebar: ["Договоры", "Риски", "Шаблоны", "152-ФЗ"],
      chatMsgs: [
        { from: "agent", text: "Проверил 3 договора. В договоре с ЭкоМаркет — нет лимита правок. Риск бесконечной работы." },
        { from: "user", text: "Исправь и пришли новый вариант" },
        { from: "agent", text: "Готово. Добавил: лимит 3 раунда правок, неустойка 0.1%/день, срок оплаты 5 дней. Файл прикреплён." },
      ],
      tasks: [
        { title: "Проверка 3 договоров", status: "done" },
        { title: "Исправление договора ЭкоМаркет", status: "done" },
        { title: "NDA с подрядчиком", status: "new" },
      ],
      tokens: 800,
    },
  ];

  const cur = agents[active];
  const stColor = (s) => s === "done" ? V.green : s === "progress" ? V.warm : V.muted2;

  return (
    <div style={{ padding: "clamp(40px, 5.5vw, 80px) clamp(20px, 3.3vw, 48px)", background: V.white, fontFamily: V.sans }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: V.accent, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Посмотрите как это работает</p>
          <h2 style={{ fontSize: 42, fontWeight: 400, letterSpacing: "-1.5px" }}>Каждый агент — конкретный результат</h2>
        </div>

        {/* icon tabs — monochrome, active = pill button */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 0", borderBottom: "1px solid " + V.border }}>
          {agents.map((a, i) => {
            const on = i === active;
            return (
              <button key={i} onClick={() => setActive(i)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: on ? "8px 16px" : "8px 10px",
                borderRadius: 8,
                border: on ? "1px solid " + V.border : "1px solid transparent",
                background: on ? V.white : "transparent",
                boxShadow: on ? V.shadow : "none",
                fontSize: 14, fontWeight: on ? 600 : 400,
                color: on ? V.ink : V.muted,
                cursor: "pointer", fontFamily: V.sans,
              }}>
                {on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: V.ink, flexShrink: 0 }} />}
                {on ? a.name : <span style={{ fontSize: 16, opacity: 0.4, filter: "grayscale(100%)" }}>{a.icon}</span>}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={() => onTry("yoursite.com")} style={{ padding: "8px 20px", borderRadius: 8, background: V.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: V.sans }}>Попробовать →</button>
        </div>

        {/* SERVICE UI PREVIEW */}
        <div style={{ border: "1px solid " + V.border, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden", display: "flex", height: 480 }}>

          {/* mini sidebar */}
          <div style={{ width: 180, background: V.white, borderRight: "1px solid " + V.border, padding: "16px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, padding: "0 8px" }}>Mary<span style={{ color: V.accent }}>.</span></div>
            {cur.sidebar.map((item, i) => (
              <div key={i} style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 2, fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? V.ink : V.muted, background: i === 0 ? V.surface2 : "transparent" }}>{item}</div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", borderTop: "1px solid " + V.border, marginTop: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: V.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>М</div>
              <div style={{ fontSize: 11, color: V.muted }}>Мария</div>
            </div>
          </div>

          {/* chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid " + V.border }}>
            {/* chat header */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid " + V.border, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{cur.icon}</span>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{cur.name}</div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: V.green }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: V.green }} />Онлайн</div>
            </div>
            {/* messages */}
            <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", background: V.bg }}>
              {cur.chatMsgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  {m.from === "user" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ background: V.ink, color: "#fff", borderRadius: 12, padding: "8px 14px", fontSize: 13, maxWidth: "70%", lineHeight: 1.5 }}>{m.text}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: V.ink2, lineHeight: 1.6, maxWidth: "85%" }}>{m.text}</div>
                  )}
                </div>
              ))}
            </div>
            {/* input */}
            <div style={{ padding: "10px 18px", borderTop: "1px solid " + V.border, background: V.white }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, border: "1px solid " + V.border, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: V.muted, background: V.bg }}>Написать {cur.name}...</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: V.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>↑</div>
              </div>
            </div>
          </div>

          {/* right panel — tokens + tasks */}
          <div style={{ width: 240, padding: "16px", overflowY: "auto", background: V.white, flexShrink: 0 }}>
            {/* tokens */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Токены</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{cur.tokens.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>из 10 000</div>
              <div style={{ height: 3, background: V.surface2, borderRadius: 8, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.min(cur.tokens / 100, 100) + "%", background: V.accent, borderRadius: 8 }} />
              </div>
            </div>

            {/* tasks */}
            <div style={{ fontSize: 10, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Задачи</div>
            {cur.tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < cur.tasks.length - 1 ? "1px solid " + V.border : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: stColor(t.status), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.status === "done" ? V.muted : V.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                </div>
                {t.pct !== undefined && t.status === "progress" && (
                  <div style={{ width: 36, height: 3, background: V.surface2, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: t.pct + "%", background: V.warm, borderRadius: 8 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 1. ЛЕНДИНГ — Equip style ═══ */
function Landing({ onScan, onLogin, onSphere }) {
  const [url, setUrl] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const agentsRef = useRef(null);

  useEffect(() => {
    function handleScroll() { setScrollY(window.scrollY); }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const agents = [
    { name: "Маркетолог", breed: "🐕‍🦺", role: "Аналитика, реклама, воронки, трафик, SEO", color: "#FF6B4A" },
    { name: "Дизайнер", breed: "🦮", role: "Макеты, баннеры, UI/UX, визуал", color: "#FFD93D" },
    { name: "Разработчик", breed: "🐕", role: "Код, сайты, API, интеграции, деплой", color: "#4A90FF" },
    { name: "Копирайтер", breed: "🐩", role: "Тексты, скрипты продаж, контент-планы", color: "#E8A4FF" },
    { name: "Mary — Директор", breed: "🐾", role: "Управляет всей командой агентов", color: "#6C5CE7" },
  ];

  const pains = [
    { emoji: "😰", title: "Делаю всё сам", desc: "Маркетинг, дизайн, тексты, сайт — вы работаете за пятерых" },
    { emoji: "💸", title: "Фрилансеры дорого", desc: "Команда = 4000$/мес. И ещё нужно управлять" },
    { emoji: "🐌", title: "Всё медленно", desc: "Неделя на дизайн. 3 дня на текст. Конкуренты уходят" },
    { emoji: "🔥", title: "Реклама сгорает", desc: "80% трафика — платное. ROI падает каждый месяц" },
  ];

  return (
    <div style={{ background: V.white, fontFamily: V.sans, color: V.ink }}>

      {/* ═══ BLOCK 1: HERO — Figma 1979-1945 ═══ */}

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(20px, 2.7vw, 39px) clamp(20px, 5.7vw, 82px)", position: "relative", zIndex: 10 }}>
        <div><svg width="116" height="37" viewBox="0 0 116 37" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="5.10298" cy="17.6292" rx="5.10298" ry="14.845" fill="#262633"/><ellipse cx="13.4533" cy="17.6285" rx="5.10298" ry="17.6285" fill="#262633"/><ellipse cx="22.7069" cy="20.2255" rx="5.10298" ry="15.309" transform="rotate(3.41655 22.7069 20.2255)" fill="#262633"/><path d="M37.2481 30.4053V12.157H41.5175V15.0836H41.6208C41.9995 14.0851 42.6365 13.2875 43.5317 12.6907C44.4269 12.0824 45.477 11.7783 46.6821 11.7783C47.5314 11.7783 48.2946 11.9275 48.9717 12.2259C49.6489 12.5128 50.2227 12.9317 50.6933 13.4826C51.1753 14.022 51.5253 14.6819 51.7434 15.4624H51.8295C52.1279 14.7049 52.5525 14.0565 53.1034 13.517C53.6658 12.9661 54.32 12.5415 55.066 12.2431C55.8234 11.9332 56.6383 11.7783 57.5105 11.7783C58.7156 11.7783 59.76 12.0365 60.6437 12.553C61.5389 13.058 62.2333 13.7695 62.7268 14.6877C63.2318 15.5944 63.4842 16.6617 63.4842 17.8897V30.4053H59.1976V18.9399C59.1976 18.1824 59.0714 17.5397 58.8189 17.0117C58.5664 16.4838 58.1991 16.0821 57.7171 15.8067C57.2351 15.5312 56.6383 15.3935 55.9267 15.3935C55.2381 15.3935 54.6298 15.5542 54.1019 15.8755C53.5854 16.1854 53.178 16.6215 52.8796 17.1839C52.5927 17.7463 52.4492 18.3947 52.4492 19.1292V30.4053H48.2831V18.7161C48.2831 18.0275 48.1511 17.4364 47.8872 16.9429C47.6232 16.4494 47.2502 16.0706 46.7682 15.8067C46.2861 15.5312 45.7123 15.3935 45.0466 15.3935C44.358 15.3935 43.7497 15.5599 43.2218 15.8928C42.6939 16.2256 42.275 16.6789 41.9651 17.2528C41.6667 17.8266 41.5175 18.4865 41.5175 19.2325V30.4053H37.2481ZM72.3157 30.7151C71.1106 30.7151 70.0433 30.4856 69.1137 30.0265C68.1955 29.556 67.4782 28.9075 66.9617 28.0812C66.4568 27.2434 66.2043 26.2851 66.2043 25.2062V25.1718C66.2043 24.0815 66.474 23.1519 67.0134 22.3829C67.5643 21.6025 68.3562 20.9885 69.3891 20.5409C70.422 20.0818 71.673 19.8064 73.142 19.7146L80.1143 19.2842V22.1247L73.7446 22.5207C72.6887 22.5895 71.8796 22.842 71.3172 23.2781C70.7549 23.7142 70.4737 24.2938 70.4737 25.0169V25.0341C70.4737 25.7801 70.7549 26.3711 71.3172 26.8073C71.8911 27.2319 72.6485 27.4442 73.5896 27.4442C74.416 27.4442 75.1505 27.2778 75.7932 26.945C76.4474 26.6122 76.9638 26.1588 77.3426 25.585C77.7213 25.0111 77.9107 24.3627 77.9107 23.6397V18.1652C77.9107 17.247 77.618 16.524 77.0327 15.996C76.4589 15.4566 75.6268 15.1869 74.5365 15.1869C73.5265 15.1869 72.7174 15.405 72.1091 15.8411C71.5009 16.2658 71.1221 16.8166 70.9729 17.4938L70.9385 17.6487H66.979L66.9962 17.4421C67.088 16.3633 67.4495 15.3992 68.0807 14.55C68.712 13.6892 69.5842 13.0121 70.6975 12.5185C71.8222 12.025 73.1535 11.7783 74.6914 11.7783C76.2178 11.7783 77.5377 12.0308 78.6509 12.5358C79.7757 13.0407 80.6422 13.7466 81.2505 14.6532C81.8702 15.5599 82.1801 16.6273 82.1801 17.8553V30.4053H77.9107V27.5992H77.8074C77.4631 28.2304 77.0155 28.7813 76.4646 29.2518C75.9137 29.7224 75.2825 30.0839 74.5709 30.3364C73.8708 30.5889 73.1191 30.7151 72.3157 30.7151ZM85.6576 30.4053V12.157H89.927V15.3074H90.0303C90.3057 14.2057 90.805 13.3449 91.528 12.7251C92.2625 12.0939 93.1577 11.7783 94.2136 11.7783C94.4776 11.7783 94.7301 11.7955 94.9711 11.8299C95.2121 11.8644 95.4129 11.9045 95.5736 11.9504V15.8239C95.4015 15.755 95.1547 15.6976 94.8334 15.6517C94.5235 15.6058 94.1849 15.5829 93.8177 15.5829C93.0143 15.5829 92.3199 15.7493 91.7346 16.0821C91.1493 16.4035 90.7017 16.8798 90.3918 17.511C90.0819 18.1422 89.927 18.9112 89.927 19.8178V30.4053H85.6576ZM100.807 36.4651C100.394 36.4651 99.9865 36.4421 99.5848 36.3962C99.1946 36.3618 98.8675 36.3216 98.6035 36.2757V33.022C98.7642 33.045 98.965 33.0736 99.206 33.1081C99.4471 33.1425 99.7225 33.1597 100.032 33.1597C100.859 33.1597 101.513 33.0163 101.995 32.7293C102.477 32.4539 102.856 31.9317 103.131 31.1627L103.389 30.4225L96.8303 12.157H101.496L106.041 27.6508L105.386 26.7556H106.299L105.645 27.6508L110.189 12.157H114.7L108.124 31.025C107.665 32.3563 107.108 33.418 106.454 34.2099C105.8 35.0132 105.008 35.5871 104.078 35.9314C103.16 36.2872 102.07 36.4651 100.807 36.4651Z" fill="#262633"/></svg></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(38,38,51,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 18H4M20 12H4M20 6H4" stroke="#262633" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <button onClick={onLogin} style={{ width: 120, height: 48, borderRadius: 16, background: "#262633", color: "#fff", border: "none", fontSize: 16, fontWeight: 500, cursor: "pointer", fontFamily: V.sans }}>Войти</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "hidden" }}>

        {/* Dogs around hero */}
        {(() => {
          var _h = useState(null); var hov = _h[0]; var setHov = _h[1];
          var labelSize = "clamp(70px, 9vw, 130px)";
          var dogs = [
            { id: "corgi", img: "data:image/webp;base64,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",
              x: "6%", y: "45%", h: "clamp(82px, 10.8vw, 155px)", labelImg: null,
              desc: "Приведёт клиентов из соцсетей" },
            { id: "mary", img: "data:image/webp;base64,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",
              x: "38%", y: "56%", h: "clamp(80px, 10.4vw, 150px)", labelImg: "data:image/webp;base64,UklGRuAOAABXRUJQVlA4WAoAAAAQAAAAgQAAdwAAQUxQSC4HAAAB8Idt27G52f9t+3Gc19xjtbFt1m2w2Kkdc2rb5tS2ldS2rdj2M42TWvcfc0/wLNf1GBExAfx/mpKUbBKVXQkGO1XbuQYJbvT4YvGy6RWfv9QEU1ASiWq9b92tZrPO/WsjElrwSWMqSz4qQmD2VyLFhavPnBwzcwUeSd+FkVm2oywQm4EnHyAAERM27LqqIW7N6iPAd4g5FNZEsSBKvhuEg9Pmx71Z1YksJs6ITCXNMG03GbS8f/4eWCw4PSY7YNTefAxNVtY2bn5h5gi44f6eZDSBtkHQ9aV1b3dBxMQJV+HIo5l3Yod+K87dXHrJROUv6PHeJ9UkBAjk5iGoklT40I8PtgYRj9Kj3TEFnptMxAM303/Lnlz0IJe8D+V3EYzRPURxLlvrHLa0JZgRj0bLt4JwTvuluixa1qHLn0u+fHfZpVlbdqXrN2UeVLj5ABqsbpV//d5H3H5qCmFOw8FERlyKGl2R0TY9jBQHrmbK+XUatqtodO0r1W7/6VIIDJtBtZff5KX08jfumzLRTFQ24tbpczlu7DXo+E+AER+kFt/6R3rz7MlDjPun3vxVulGf3xa+CjutrgH1emBGrMrIKCqfsKey9OWhN3y0d1mD4ujGX6zulveG3/4Zky8qWlRuObP2VtHCi3AUK5nlAHIAdcl6/Qhg0H1Tz+PYubChT/2NtWm3LDd3QxcmfYrJiHETlSULuacdU5vU+pM1voJWS2H39dlDN+c0/L6hZ0FRjKmSUbUXX5ZHh4FKfXH3c5vKsipO4bJnAW770BVbVaqSB5FZ1DzhzI40PDtwwueNBp/64cL2srhSKEIosJUuZGQ0QKnLvpyyZcPOiJg27pweSWRUcLZSIRgYQBZjBxMR01LB6nR7VHhOCTIqq4qtlAOIuA6c+emrZ8GHG7IVyL7oSAMkwIIrEwgzYtuiJQeMn8wL6VNJ0Xnq42s7h3xBhFOliHnn8Ipol+9e/HpuF6PVvHHXPpdz9PUUfNRfdL7pilzJDVm8GVOvJ+vJR9vNzKfg402fPZrD0ycUfjQ5j6Gryt45TxFkgaH4Mtr+2hrByS9lvT//t7u6QPa8p6emm9JxcTUmj4Zur834ti3CABdY7ASumIrI8ttuC2Nbvnkk6KD0+9e/j26YdUHFRDX+YMPxu50xvXkoBgwQgNyFBbdYMCbfq4BofhjQYeEdfZmUbnHbmWLqy+WD4er0scCpE19b3p5AWRdRKyCqNsWAOLgjRkZ36l44kJXzmLE/3PgyOG/81jKVxzlf3/HofeLwdDf6/NAWaj5cnqtdxwxqT6zKAAGM76FTO+Ph3efrGh/8CXT6YdSkOedQ88/rqbf5g0DOgvL3jvDF6fcmP5UtxYBbhswKRmahU3qKY9Onjn953cW26vud8j97y7g23dD8pC+GTW6g0UtIfTGOEAPb0Q0XCHB6r3vw2Stbsl966B7L073tmJ+PBx5Z/W0LKL8Xpo3B46hqhSjQdyVA6PbQ9BWnj/pm9uyKvUKLsvU/VIPSGccN+mROrhRnGXtsKPXIgHbFsHcf+k1bXvHRmFe/OLLx6D9mzbi6FBHroWtdddpcE4EZuAE0P7Q+hKEPHXHCGyWAiHOnT0UhrTbWrQQmMMcAc4AvTiAEEetS4TuT6LSxMFPV5gZytxn95cS9yFvw2i2LXWznnQMJKFL3LRmHb6+EFBjbX8mAHG2/5BR/91vSiaI7U4mXmtHcLNEIPFROtC2eMFLDNe2JtgFLFpxT1jXCvCqj4cmEZMG56sfjQEEZpKKFxxBZomAMWzKlD+AhuJtTd2MZuCeEO4CTd8HGqafXJLPovun+hiAlgZHZofbVSza/fcO4gfu0rOXQel766q4kodNzMAJDAej34Jcr1637eeWqF3OxY5enP2uBxZ3T+fdHCBiAnMr5xU0aHzw0Iq9s1XdLe+AxZzSet/YQgmjjAPJgVDlhww83NMSIebl/e/EHzcw49i8FEhklmVvpW7/eUI0EDNz7RIdpAS9Pj8PZSin/m+V7QpDiLrDfD6mrbqTXG+mJGFtrtLksRRCxb9Rf24vHzn1w+uObG4TItRUZjfgXYdqpaMD0y/M/Pp5tl4h/WfZrTxBAjF4RUr2uvqSaCUyZEtFo+TguTDkLh/LEp4NOvhw3Etk5bBanV5RQ8+OTgH1yUJKoUuDxm7R2PIxNl9H74zlXEJQgGY2DurKkOUOWvI/PvJNnBcgTJeOVX390b8URlKWHPHwLLUYjEtaM1NgeTG6eO3/150cX+POHWXR6MUqSzDoof9ScPT6D41+DW5ZEShq5AZ334u432j/VJ6fs590wEtgAs/1rnDn5rfQBOMksQxB1v/UuElxA9eoL7h5SU0klcs6aNPGdKSN7FpLQUp2vHt479fpuJHfg8qtgyJtEpqRyxpwS8ew4AoktGr3NXq+4keDOMbc/uBuJhhhaF5HsAiPpXfyHeFZQOCCMBwAA0CQAnQEqggB4AD5RIo5Fo6GhEr6teDgFBLSFC1Lkw8jPMJfwA/Svx9/t3hH4QfSnthlOP3fkn3l++zUC/F/5duhOZ/3D0AvUr5z/t/Al/qvQD6o+hH+kf6L0S/tP+A8Sn5R/a/1m+AD+Nfzj/kf4L3Pv3H/lf5bzI/l39k/5/99+AL+O/0D/Xf3P/H+8X6v/2H9ib9PP+OWrtzGo4zr+tUPmGe+NHVbr7Xq4rentRRoFvv/sTWY1zLYlD5a0oiM9pj0q6faa0ljfla7V0YvAWHY1f93GUtd6ON/9WLdoRZp5BeP7T3ZCtt11P99iShMcdVJcH6Den89bd1jMIpTvqrXnEh1z7q1T6Mvfio3LzWsjy5t3w6hrQq2rOTickE/tUOu2SQLJTXpDzWcfGI/gAP7/xu8EXSfAOtiPXh/wuWJF2F/gdltyH0l3Zk8cxvjQgHsZwYgJMY7itZvl/P+598jy9WLmeFVq0HL/L80779JKJeeL1v+Vf4NPNwSjQ5vSlT9d9jaPfdmh3frLNsr9mVLS4BzOE9NVvA60wATIX+HT//We0r9AUqZMrYX+ZJxiWxeT9Z2vxJiZYD0EjMW9x82qus9d660yqVpub19TE5jHq7vb9Pi3UXE7hTDg5stIYe0ShoFKkRtlU9Fnb6oOCacHdlnMZP5IpbZeELEQ7Ew82knC/4NMv+qPy6wanzYXmNxaGlW5eSxv9rS/Hed3aiAsa8SElu+Xw4Ce+hrsVdqaFXdh2azoWexHEUoWlRktJy+rknwhNmVmYjgGNrCJtaSdQ/MZYZWRcWH8JYB83XnWage+p0l/rgE3M9rS90nWb3dVxIoJa9mBpakS+OS1LbQMgZpGpx/N6vVqEZa6/lKhDxhTikwdAAnpjByURZjMQHHOlcIn0nbdZ0tN5L67AqNxCNzb01ngAE5wn0UxEpJbW226fj7M0oA9VcEnzubquJahwhI1SQ3qkEmVd2IRNbQKcwIrBTi3zLynydi55iQ4wfKbXlW2RQhXC8+bl/dwXy280Jtn+yafztOjEjWXKutTx7mp2yAOTTAmGdtqJgOc2xq0x0U1NLfAy24F9JOEVlmrfPA+UPLY+JCWfc6SWez1t3HaUjHsJ5pmW4zt1InJhsD7kVpC5mnU81pm6sMux/+QQlinFwdzVOrAqh1K0jdJOKnY3fReVxvaHAMJerEbHdBkJVrPhq7LKdZ7czQH2h/GxfJb9Mx68//mH0bAAOmVSOSVQad7EqQeesGPV8MU+tu/HJz9W/m/RBefrxTgABgFhOovxQgkDzaa1rWTOnonISHb9PvoMY9IKbLJN+35nEFKIWekhgr4WmoEjarnvZHfnGwBkLuHsp4C542oWjRv+Ymeu0VpPwtOi+VV4to21Cr14MnQ8y5b8ybRGcgfP3hWvHFxezRPOgX0jqcKykFCTF01Upl/RhnrcK7otJewbjkQAwJFp4FzC632kAa20p4/1ly9s5Gdm4xWMirzXOCkv6jAusBV2XyigMSS5i6PaAnltq+9Y3ypr6V4bpCyfbKotjEEjBcdPfvg/vvFOHSThC1PWWCaAsro/ZddJuL2F5smPKRmexPyUH9RnG6AbSe/LUZpkimvN8FPDjAFvlAl4ISkJxISepK40OvZTLTukcHKJinQ9aoYgCTSYHGvaOk/5ef5d1FCG+ynUM6x+v1oylGxvJ4mR7rK4vBFidv0XAj2FztsNlxe0maxFvRORGsD2TbJnLvtc22Yf4yfLUKPwqIhGGPPq5QPbr6TCtq94VpMLK500/6FJ+MX3FPubO/GuYrf0MvLEnbUX9u/H1Mk5mu8owh37SpFAuxXGJF0fn0if/31VmkgburpG5tgdukG0BxR+G2ECCipWghqgB0CEM+wAAPBxqRwO8ReIgM1O7BD7Fu84ALntFYEMpYc1q52vUnaXXD/9nZCg6NENmPiJ9BafqPz+mhjEP+XzmQQlQNKeh8BI2bmM47nPA07zgmjSa3WOz2O+XJ2iZmFWbwTsdMv5N4ngntS4pNeW3X6sdYatrLeYNzXr7GL+H9/JG+Y9hvv8X0BTEdrTK9n9Ua7GYyKvh58oS1HZOOJ3VT2h0zQBKD0MpbJk2GwP/cmb0yFjg0Q+aYHTCGXh6V7lO9EvjuYC5L+TPTidydOQN3MhUPGPdxXN3a8nfbFbuWin620GZ/A+h4kmO011CJxuT2QEVNQl+8/X+5w/dFlLtRh57PQFmVYsxmGJGAukiO3Y3aDfNnmvH0wO3/s1B6tiPsHaxLnQg/Fr9F0W+YCkmm/bHQtXrhgZBjrbZ8X6Km9SHGQFLdqSUIhRqFhh81mh3XGuwVA1c2xqe5/8L6GFYyOg7SMzKqwRgGY1I+vDJX4feaNopSgufF1xlYw9GlmPTymwt7iv7usPwmMveZp7qKCkR+fLvF1Ey9P1UA61Xv/QYNQ4lv6EK2n3wz+8tds9uZASTp9MRGfRHZwXi39ri6czPEe0aHerK/TvgoBXlvuMp+fuQ42dlcoGAhMNWO/9BbVvKzbT2vQugGPTOfSHz0CDiJVRu2YyfbZ7veGM//ZVv6ESceXVACAAAAA", labelSide: "left",
              desc: "Управляет всей командой агентов" },
            { id: "dalmatian", img: "data:image/webp;base64,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",
              x: "72%", y: "42%", h: "clamp(80px, 10.4vw, 150px)", labelImg: null,
              desc: "Сделает макеты и баннеры" },
            { id: "doberman", img: "data:image/webp;base64,UklGRpAUAABXRUJQVlA4WAoAAAAQAAAAbgAAkAAAQUxQSCoJAAABsEXbtiHZ1lx7x7XNZ9u2bdu2bdu2bdu+fDYPrn1PnY255kdkRkbuiOefiJgA/Cfe7J9LAKwtC9MK2GV/WEsBsCkFXO1nm66C0I5hr8Mx4YArnC4ds5tZKwFX//NJl7QwFbO9/6LtWddGbMRs/79Lb0GcSsQtlJn8SdY10uFp2ijbr4wwkQ7P98SktyE2Yjsc6SXpSdZNxLojVFj0pz1hTURcV5XJP4YwjYDLsp91d3SNvFqJ0t8OgE2iw0OUSCb/EGILhj03K/uWk3R1xIm8dUHVpj1hDQS79FlMeuYX/a7TMItHqJD0opshtoCPKFf98a96H8IUAi5Fr72s17cQcN5TWUkVfRU2hQ53Uma/6piI9Xd4qRLJWnTsLmYTiHjrEvd6CYS1Ycdfq5Bk0Q+DYYp2jArpJJOegG5d0a6nygW+5RBYe4Zzn+GVlJNZ30BYV8AnlBaw6rqI7UW7tioXVd92Hth6DAedpEo6yaI7TgLPUuqJZNZtENfT4eHKXJT0FHTNGfY9XmVZ0qvQrcfiEQvkZNZXzJrr8GBlki45mfUd2FoiLsdK0ntFP4RZa7bjMV5I14KiP+8CW89rlUhq0a93ba7DnVS4SOxfEWEdFo5UJn1B1dnnRmgshB97T0uy7m3dGgIunrySkkRWLxdvLeJ2KiS1LOnViGvo7NFKHJIu2lqwbygPcLLoH7vDxgv4hvIAZt0bXVMBF08k3ReJZNU1EEcLuMx2VtJ7Tia9oLGI1ymRWk4y6anoRuvs4UoktSTra7CWDAed4nWVol/vYtazELvFMZj1Aj6nPKhoy+6whjrcU5n0AU5WnXYQYuiiYcXYxQ4XPIOV9AVysuiGiA0F+3xPQ0nWfMOI/gHnu959HvWMZz/+ng+/0aX3MQCwpyuR1ICkl6FrJ+ACyetqSe/DQZd59Lu+evw2La/HH/PRp9383PiA8gpFR+5g1kzEHZRJ+hAnq//tPSdS/ZpzSjmn4uqf8fU/eyV9iUjSr4DQ0BuUSGoFUhJzyrVyea0lpyKJJDUo6X7oWjGEX6nQNbxXc+W4NdcVnMz6jIVWAi6ayJXEge6uvrv7gsUaVnXWOREa6XAnZVIr+wLXyu4LXINJFt0IsZkXKo0hucZ216okk16GrpnXjtWwk1nfhTUS8EVl0idWtXlvWBOG/baokpo0WZ2XQmgi4Nzb5oD0KyM2ctENr/Sp1erXQGiiw92UOT1m3QNdI3eYh6KbIDYRcWOVOSCv1MzVvU7NyaqNQxCaCLiCODWSWd/ewayR85/tlZzeTRHRpGHXv6qQPiXvPRxdGzB83zPJyf3UrJEO79YGSU6reroYQhsRN5N8WiKZ9GB0bQC48oe2qk4t60edNRJwpe+e5ZyUk9XrBRDasO5YFU5LJItujdhEwLnOZiV9Uk4mPRNdI5ctXklN7/2ITURcU5X0yWV9EqGJDndRnocvNfNopXn4GayRZ/Y0A59DaOQ5PZ9c0jsRG3n6XDwDXSMPnZ6TzLoV4ng2JOI+ynNAXQ1hrBgQ45DbqsxA1UkHw0YKgAFmiwIuuOGV9CmRzPoxDOMG3OijR3/o1kAHwOIO3T6bNQNJL0Q3TsBj1f/QuWBdQP/dStMruvVIETdQSSVnbX0ogEOvc+/H3eVzytNysuq4vWAjfcoTSWbps/f+0qnqk9Mimfz9iBjTEI9Q6bFmSao55drTdEmy6gqj7fk31QVkzrlyqU/HSWZ9MQSMdODxPTlXdE2XZOHfz42RAi6w4T35Mqe7pkwy606IGNew299UepK7u2ZwwUtiGMvCz3rUfDpZdfZ+sHHQ4c2eSPp8iGTmw9GNFHFVsZKcESeTPo4wEgKeMjcis34MGyvaxWfpCMBGCnin0gx9AQHjBpxzm1e6ZtTJpOejG6nDY5VIzSnJolsijmO2+6+80OeEZPHf7AgbJ+BcSXVWSDLpmegwbsTtS+GMOEkWP/XcFkbq8FwlUnPpJFlKuTkCRo5445ywn1z3Q4fx3qtMn5Oqs+6MiLHNdj5SZTacZOUnL4GA8bDHJtU5KXrnTohYx77/UJkT8sS/XRFhvIDzb1edDfWkWyGu4/DT58RJJj4I3ToulLy6ZtPJpGet55KVs/Oi9Zx/Q3Oi3qsR13HB7T47j0e3jouVWXEy627ruXD2ylkpugnieIZDTlUl58S3XQhhHTv+RmVWqjbtCRsPAd9QJn0mnCw6pltLxDuVVnL3CWV9GQFr7PCgHodwoU+DZNLz0a0j4sYqg5zLfTKPXI/hoJNVSV/Cfq7sT6Pq2ojrQMAnlUgOcin36K05WfSX3WFr6fAA5RV0xqs3lCoXens/w5oCznmW12Uki/6Iy39bygvYFMmkDyJivRZ+4IXksqQXRIQnnaGaK0mu5hzoIxTdEt2aOjxaiaQPeDF2BM7/YUljOFcc5mTVqQfA1hRw+CleSfacLNpyIEIErnr/v3hZyUmyLMyVpA8imfRuRKw74qVKJOkukcy6MzqEAHxGmfRh7GspSa5Sea0Ggl2o1MyBiQ9DB2DH7lVKo/gv//qHXx57xAeP97pS0dHBbG0IeLqUywA9eEHEzVRIrlI9n3/33bsI/Eh5kJNMegQ6NBhwu99LJeVaa9nu5UIIAAyHnKFK+hAni34U0O+OVCF9UPEt+5i1gIBdX7ZJyx+NgL7ZN5VXS3o+djCziPcrD3GSWfdHRJsR2Pv2b/rGlq0n/PED10HAwg6PVCI5hL1nowMQ8ZiVqv6yh4VGYAEA9tn3wF2AgMUBFy8k6cOKboq44CoiySFFH0BEuxajAUCMWB7wKc8kh1VdfYHh4FNUSR+Q9RzrGuqbmWFoxI2VSeeQqrPOgwAAAV/wTNJdcieZ/IVobXXb4afKJH2Ibzv/oohbKXFw0hMnF3AFlkKS3vNevugihPgFbdQBiX/dDzYxRDxOuXJo9a37wBaY7f8NMeVSay0pSbdHxOQjXqySh2zTxxCx2LDbK8+WJErSpnsjYgYjni7lVGrNOSfq5MtYWIIAXPhpX/nd6dzy49fcb28Y5tACrv8zLS+fuDgMAy0C2PG8l9wXACJmMmCHO73lJ6du/dE3P/LsSwEBw0Nn6HfRMJsRQDhkf/RDwOoWgmFeLXYAYLEL+GdpZob/FwVWUDggQAsAALAyAJ0BKm8AkQA+USSORKOiIRTZ7cg4BQSkR4UAAysLevA/1Xm0V//Mfy3guKZ83Hmzx9eoD9Efpt8AH6edIDzAfuB6qP9l9Tf979QD+0dQj6Ev8A6mj9xv3KxF/+tdsn+48PfJt8tldd+ODf+24ieAE7XtAvbD7T3x2o13+803i2KAX6S/XD2Zs+/1d7BH60f9PsD+hx+0jWCPaHR6Qc082uYlOs09CFGjXMde16s9vw1V3cq3qHQLKYOl/xkfqfSR6OShYNnbq0Atv4VcsxlmSsca+JKbRWq6zcmaQsRfqbIkvDrbSZGpJXtdcL/3VSU1biqB5tOvaTs1NrxQ28ooD/IgmXf1eSJ8nD+GAxz/tKxGU+XR0CQ1Bwx4c3073ImyD4bcQc8TS/V+96r4HGy7Fr8X79VyMVVJeJFX4zxIqxDH+7IvP4XrPf3MYcRTy0H/D88z43mkiL/Im05NB2cZ7kyLbdV2eXRgU46NjCS/klb5JLfcaXhvTOMOg2b7+JX4PPoYRInvJGXbyjOlOBRRfD4aKsrHQSWMXlpfAAD+8BOsz7ctid8Vk5lCn7qQc6UE2hBorSq7ytR7B8cp4mdo/Y6hdHPUyUarGmaQNRLNAfStZSvzmny8i8WVDICAGpRICrP6oqo0oyAyQMIVpp8bbCG0nNu1WMm+oVGbceePvTs8lc5DafAqc5X5wPBcfAQFOihPNOf+n8ZgDM/ctalLGL6xDSVcUewfy1dyMn0rpS+CqwIg4+EezHbTqfjvzFTt/6wLUYepLtJwL7+aUmOpXxPFdecIWwqqco9TrNvArbUiVlI9eInCC3jmlem+2CHtCK6jU7HeoMQxwHb8txXEnDfeGRxdD0O798DVxQX+mcUPKAcrKGS2OjHth6so2dXuX3yK1pISP5GsT4f+UK0lN0VFCJA14YqetDmsuXxnn/rQjE1cbov9QjLRp279onPzY7j3F+518hmdfTjYycotlpFgrWeEEppba5XWBpXvGe5QUiwTSshC4X+jGVKwvqe/qq0fGppKpMK+2jxwb/edrLxaH9OnLBEq6KHPcYGj5/8GXQbAYv9UlYdVm4sD2z1Ufq7ROa1Hz9JOXk19SD/34E90XIHt3Wxrh4RoL/ViohzuDN0GAQVl+yZElAvIJNHy5Wv7fFsbZrOYg2jqMb7HYO9WU1AWnhqXPOHQrx5UjH8YpVXdNA4vmHRCK7U3noKgw7K53RTpb/JEvq52zhsJcJudoqJC7/S+NHzssbgteCfoxMsaOjNe/j/s1p6usraQxlZos86mC/AwLxVv6cNQAI6Q0gNmT585lgus0qd4VNMe2HtPZD7zE5stbVQESYppQGre9UwCL+C1893QBTmZuqKY6jBCYKefHIPL/1MgwnyS8GImsJ9iLidvsHZ8KxSBg2DAhjLBTqHVbO9Gtkl9uBkZupJc8B7omqSB+ND58q5kc8xfuDV03BiMJcDlSiLI+2om/21nF2DV54i0u+hHFaBp65T8Ykupin9jR6bmfoOD5OBddIhrvYn5nQlxeCwWyyYWU+SKSofb8RSL+Y+XDaRgDZyPYCRzbtLqIggv+OW0Q+XguvuShuhS0wOV5mXXpkXGR3FDQZ3bDL5UIDLeDbrOoWmFEessqp4TlyZQm6vPqEsl2QD/DLcaRKYI9hnawItKKbaKbxptt9lUzSQwbQDJxjtJPU8veSt4HFt97KqeE7PofQ4DGTWBV9s/v+ledGUv82rCMQ0WVFQSa+xHBoU3mlXozxTsVEmax8snX4NDbrWrgEZdkVCjVIycjw2QXGwErArx5Ke1QQwzFJ3A7vv4IjINLHLu8Xw1kEeehFM4kFOXNH65t385UgLnJDxrDQEgvaBLQbDWFXUBM60t34u1Xe3MrRc0Bwfpw4ipqMsFn3t1DmS7DDkEQwL/W3lUwnZtgJ7gNiF5zWBtIVHDfPIrllr/gBnsYYt9svESpTXLkI00QDT8s6doQ/zI5clzrIJuSKl3qsODvPlZqji4nKMm2zsn8fhLt3dPbxEL1wCstz89bbaytsbdSiOUyP8KUDzXoq/aFRIxNScJcelNF/9tykW5IboZ6KK6YeKahG6vNWRnuma0ScYbsLLuGr1+Gb4sCVX68dVY2QOZOQfVnEb2iaOMS6OQPSDwqHLfNJfQRMXPk+bBFXyO1McL3ekDULLUiQQrkUTCmrTMxcTVH0E9n1Tr5S4Uw15fQ9Vz2SmqO9PI0FYIZTgToSHaVkmV6naqMeQ2RN9EtdK3U+BkOFANjQSe+ozIBykh1pd1HnrRGiSYwUKXs6MN7af62Nh0fLAm2996oUeodZBZlajkzpWSIKLxwSC23zUXx/PW0NXPBPSA1XdphTvmZdKtv62MV7Pkijo3LLzOEw1os3XyxUts12lOn3Jy9fXl5UiG2KDzMWFPL1js7EWg11qgKTa9fwcaKey68LCk9cXHcxvfF9jPgjW87odOqY4hUbIaGGqUfyf11sCXtlGGykHWCgUJnH//HY7oIGip2jtyRCyc3z+TZuzqZswFbZZyLyTJ15eMicdUDSF7dOzTbWYbf1EMMVUGtF0S0vmHu9vuI5GL0nk9/upJHRv/4ZgNym1+/JQsNH5GyG0wZB5cmbj5DyVgqpbXLwkdcAJijnZ/LyGwiGuNXftXQsQf9GFTXS+f+op6z/JsoAOWT/PZN8V96bz5ZWArvruwj6pxeVD0QuyCsIM1/4gLwAkFMlMU5OfQSdDg9IwPoQ0VwXI8SExxXnkDNJJ/u9mR+qTJc7QEDf/K+EdS/hbV8Pn9cq3odorLjL9PXkRWwKyElgWi7j5ICWKLeJ5D1gzYWKObvdU4rlpSwyRzoewi1MRHsx/jPeg3R/j84I8znfapvBiN7Hj2beAC8nMbY7EYMXTiwbnArB81N1L8UzKkVVA6+o74tM3YsrLCnArRIlf0SxwmD/G82W3yvD4u08MAewy81Iwf3Dff+RAbdCHAH4FX6V9ERYRsAWdi5eKqfarBzfclHaJua0BXLJ58aaCT8txrtS0mdXtNAwHu6G+mCF/6BjY8/ND1gSBhZYXBRNgE3JLiaGynMlz+YiKS8x+1T6D04O1H31yWOWGM2mozEkEjAmQmvwkSUBGOnXUVZ3x0h8QJTEKv3gJL9OFEpxe25uux7lHs8EjW0zwgV55jLgXp/7G1VEfqE4kwa+sRZBEkC7HvSVrcDZk74peJYpD3ERm0OixEF02BjoFhUek9SMdBhIjjpaR8UPK5WVI3o2yO4/NLWDq7n8sLV+wesWXXA0MZYw2mescAVm8dCN2Ak3c9j8FdXZy7R3brn0iM1iK4Ji0h0J4A0fIug4z99ktKzGbLxxbPVAxwGPzWpXomKPoj3k1YgLD+EZOFhYdNOQ7H3vQ92WdOsGr6Ru0evwEy8S19EkEuE8/XgQ209gaFL36q69LU0npw4lcvRBL0z9tK1Plyw4+GPBAnWhVG4CRAtxChTcxrA4Wjf1U31JZsZIKogu77R7xFf3mWXrdwgFrLeVs09d18PpZ+aJJ7LMF7dk6CZl8TO+epsP24apPzvo4x/M5IGSyIOtKpwMRI729KqyCTy5l8R3KxnTNJctnmf/nFP/wx14M/GUNjIznZV4D0AWkPZeCC50/kPRWNxXbfv3BpxT26BKF8JMjnaz3ahHbXmZPWanFuHFMwbrKDD6RqAtfINbdQjMKSsb1mcRd41X52uYq5JtXyW986KWW9UXJtpIGvs6XUdKJJeLYoqfxzsrhoSXmHb5neSvHeYCbEm51nhUoa4KerthWK33eaSU4VQyRNKXdOZEpIMSTOxb1T/YZN9R25LZi9uZ5f20ACgD+gAAAAAA==",
              x: "22%", y: "72%", h: "clamp(77px, 10.1vw, 145px)", labelImg: null,
              desc: "Проверит договоры за минуту" },
            { id: "samoyed", img: "data:image/webp;base64,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",
              x: "58%", y: "75%", h: "clamp(72px, 9.4vw, 135px)", labelImg: null,
              desc: "Ответит клиентам 24/7" },
          ];
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              {dogs.map(function(d) {
                var isHov = hov === d.id;
                return (
                  <div key={d.id}
                    onMouseEnter={function(){setHov(d.id)}}
                    onMouseLeave={function(){setHov(null)}}
                    style={{ position: "absolute", left: d.x, top: d.y, cursor: "pointer" }}>
                    {d.labelImg && (
                      <img src={d.labelImg} style={{
                        position: "absolute",
                        right: d.labelSide === "left" ? "100%" : "auto",
                        left: d.labelSide === "right" ? "100%" : "auto",
                        top: -10, marginRight: d.labelSide === "left" ? -10 : 0,
                        width: labelSize, height: "auto", pointerEvents: "none",
                      }} />
                    )}
                    <img src={d.img} draggable={false} style={{
                      height: d.h, width: "auto",
                      transition: "transform .3s ease",
                      transform: isHov ? "scale(1.08)" : "scale(1)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: -12, left: "50%",
                      transform: "translateX(-50%)" + (isHov ? " translateY(0)" : " translateY(4px)"),
                      background: "#fff", border: "1.5px solid #EBEBEB", borderRadius: "clamp(8px, 0.8vw, 12px)",
                      padding: "clamp(6px, 0.7vw, 10px) clamp(10px, 1.1vw, 16px)",
                      fontSize: "clamp(11px, 0.9vw, 14px)", color: "#262633",
                      whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
                      opacity: isHov ? 1 : 0, transition: "opacity .2s ease, transform .2s ease",
                      pointerEvents: "none",
                    }}>
                      {d.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Animated click pills */}
        {(() => {
          var _s = useState({ idx: 0, phase: 0 }); var state = _s[0]; var setState = _s[1];
          var refId = useRef(null);
          var pills = [
            { text: "Работают 24/7", px: 68, py: 40, side: 1 },
            { text: "Не срывают дедлайны", px: 4, py: 48, side: -1 },
            { text: "Делают быстро", px: 72, py: 56, side: 1 },
            { text: "Контролируют качество сами", px: 2, py: 65, side: -1 },
            { text: "Помнят всё", px: 70, py: 75, side: 1 },
            { text: "Дешевле команды x10", px: 4, py: 84, side: -1 },
          ];
          var total = pills.length;

          useEffect(function() {
            if (refId.current) clearTimeout(refId.current);
            function run(idx, phase) {
              setState({ idx: idx, phase: phase });
              var delays = [300, 200, 800, 300];
              if (phase < 3) {
                refId.current = setTimeout(function() { run(idx, phase + 1); }, delays[phase]);
              } else {
                refId.current = setTimeout(function() { run((idx + 1) % total, 0); }, delays[phase]);
              }
            }
            run(0, 0);
            return function() { clearTimeout(refId.current); };
          }, []);

          var p = pills[state.idx];
          var ph = state.phase;
          var isRight = p.side === 1;
          var cursorSize = "clamp(22px, 3vw, 44px)";

          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
              {/* Cursor - tip points into corner-0 of pill */}
              <div key={"c" + state.idx} style={{
                position: "absolute",
                left: isRight ? "calc(" + p.px + "% - " + cursorSize + " + 4px)" : "calc(" + p.px + "% + " + cursorSize + " - 4px)",
                top: "calc(" + p.py + "% - " + cursorSize + " + 4px)",
                transform: (isRight ? "" : "scaleX(-1) ") + (ph === 1 ? "scale(0.82)" : "scale(1)"),
                opacity: ph === 3 ? 0 : 1,
                transition: "opacity .25s ease, transform .15s ease",
              }}>
                <svg width={cursorSize} height={cursorSize} viewBox="0 0 55 55" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0376 47.9536C9.61911 48.1258 9.15906 48.1702 8.71539 48.0813C8.27173 47.9925 7.8643 47.7742 7.54446 47.4541C7.22463 47.1341 7.00671 46.7265 6.91817 46.2827C6.82963 45.839 6.87444 45.379 7.04693 44.9607L23.0886 6.00233C23.2604 5.58494 23.5516 5.22758 23.9258 4.97507C24.2999 4.72257 24.7403 4.58617 25.1916 4.58299C25.643 4.57981 26.0852 4.70998 26.4629 4.95719C26.8405 5.20439 27.1368 5.55761 27.3144 5.97254L33.4676 20.3298C33.6993 20.8704 34.1301 21.3012 34.6707 21.533L49.028 27.6861C49.4429 27.8638 49.7961 28.16 50.0433 28.5376C50.2905 28.9153 50.4207 29.3575 50.4175 29.8089C50.4143 30.2603 50.2779 30.7006 50.0254 31.0747C49.7729 31.4489 49.4156 31.7401 48.9982 31.9119L10.0376 47.9536Z" fill="#262633"/>
                </svg>
              </div>
              {/* Pill - borderRadius flips for left side */}
              <div key={"p" + state.idx} style={{
                position: "absolute", left: p.px + "%", top: p.py + "%",
                padding: "clamp(4px, 0.6vw, 8px) clamp(8px, 1.1vw, 16px)",
                borderRadius: isRight
                  ? "0 clamp(40px, 5.6vw, 80px) clamp(40px, 5.6vw, 80px) clamp(10px, 1.4vw, 20px)"
                  : "clamp(40px, 5.6vw, 80px) 0 clamp(10px, 1.4vw, 20px) clamp(40px, 5.6vw, 80px)",
                background: "#262633", color: "#fff",
                fontSize: "clamp(12px, 1.4vw, 20px)", fontWeight: 500,
                height: "clamp(22px, 3.2vw, 46px)",
                display: "inline-flex", alignItems: "center",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
                opacity: ph >= 2 ? (ph === 3 ? 0 : 1) : 0,
                transform: ph === 2 ? "scale(1)" : "scale(0.92)",
                transition: "opacity .25s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.22,1,.36,1)",
              }}>
                {p.text}
              </div>
            </div>
          );
        })()}

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 1012, padding: "clamp(32px, 4.2vw, 60px) clamp(20px, 3.3vw, 48px) 0" }}>
          {/* Headline with inline dog icons */}
          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 80px)", fontWeight: 500, lineHeight: 1.1, color: "#262633", marginBottom: "clamp(16px, 2.1vw, 30px)" }}>
            {"Команда ии-агентов,"}<br />
            {"которая работает за вас"}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: "clamp(18px, 2.6vw, 38px)", fontWeight: 500, color: "rgba(42,40,48,0.3)", marginBottom: "clamp(20px, 2.8vw, 40px)", lineHeight: 1.4, maxWidth: 800 }}>
            {"Вставьте ссылку — подберём решение"}
          </p>

          {/* Input */}
          <div style={{ maxWidth: "clamp(300px, 37.4vw, 538px)", margin: "0 auto clamp(16px, 1.7vw, 24px)", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(38,38,51,0.03)", border: "none", borderRadius: "clamp(16px, 1.6vw, 23px)", padding: "8px 16px 8px 23px", height: "clamp(56px, 5.5vw, 79px)" }}>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: "clamp(16px, 1.8vw, 26px)", fontWeight: 500, fontFamily: V.sans, color: "#262633" }} />
              <div onClick={() => onScan(url || "yoursite.com")} style={{ width: 47, height: 47, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: url ? "pointer" : "default", opacity: url ? 1 : 0, transition: "opacity .2s ease", pointerEvents: url ? "auto" : "none" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M14 6l6 6-6 6" stroke="#262633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══ BLOCK 2: Процесс ═══ */}
      {(() => {
        const revealRef2 = useRef(null);
        const [revealP, setRevealP] = useState(0);

        useEffect(() => {
          function handleScroll() {
            if (!revealRef2.current) return;
            var rect = revealRef2.current.getBoundingClientRect();
            var p = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - rect.top) / (rect.height * 0.5)));
            setRevealP(p);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        var words = [
          { text: "Скажите" },
          { text: "что" },
          { text: "нужно" },
          { text: "—" },
          { text: "Mary" },
          { text: "разберётся" },
          { text: "кому" },
          { text: "поручить," },
          { text: "команда" },
          { text: "сделает," },
          { text: "а" },
          { text: "вам" },
          { text: "останется" },
          { text: "только" },
          { text: "посмотреть" },
          { text: "готовое" },
        ];

        var totalWords = words.length;
        var revealedCount = Math.floor(revealP * (totalWords + 2));

        return (
          <div ref={revealRef2} style={{ padding: "clamp(60px, 9.7vw, 140px) clamp(20px, 3.3vw, 48px) clamp(56px, 8.3vw, 120px)", background: V.white, position: "relative", overflow: "hidden" }}>
            <div style={{ maxWidth: "clamp(320px, 54.2vw, 780px)", margin: "0 auto", textAlign: "center" }}>
              <p style={{ fontSize: "clamp(24px, 3.1vw, 44px)", fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.5px", color: "#262633" }}>
                {words.map(function(w, i) {
                  var revealed = i < revealedCount;
                  return (
                    <span key={i} style={{
                      color: revealed ? "#262633" : "#DCDCDC",
                      transition: "color .4s cubic-bezier(.22,1,.36,1)",
                    }}>{w.text}{" "}</span>
                  );
                })}
              </p>
            </div>
          </div>
        );
      })()}

      
      {/* ═══ BLOCK 3: Mary поможет начать — Figma exact layout ═══ */}
      {(() => {
        const containerRef = useRef(null);
        const [progress, setProgress] = useState(0);

        useEffect(() => {
          function handleScroll() {
            if (!containerRef.current) return;
            var rect = containerRef.current.getBoundingClientRect();
            var total = rect.height - window.innerHeight;
            var p = Math.max(0, Math.min(1, -rect.top / total));
            var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            setProgress(eased);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        var steps = [
          { num: "1", title: "Изучит бизнес", desc: "Нужна лишь ссылка на сайт Mary сама проанализирует" },
          { num: "2", title: "Даст решения", desc: "Покажет конкретные проблемы и предложит план действий" },
          { num: "3", title: "Подберёт команду", desc: "Автоматически назначит агентов на каждую задачу" },
        ];

        var activeStep = Math.min(2, Math.floor(progress * 2.99));
        // Cards: each card ~30vw wide, shift by 30vw per step
        var translateX = progress * -60;
        // Dog: starts at 5%, ends at 92% — synced with cards
        var dogX = 5 + progress * 87;
        var dogBounce = Math.sin(progress * Math.PI * 12) * 3;

        return (
          <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
            <div style={{
              position: "sticky", top: 0, height: "100vh",
              display: "flex", flexDirection: "column",
              overflow: "hidden", background: V.white,
            }}>
              {/* Title */}
              <div style={{ padding: "clamp(40px, 5.5vw, 80px) clamp(20px, 3.3vw, 48px) clamp(24px, 2.8vw, 40px)", textAlign: "center" }}>
                <h2 style={{ fontSize: "clamp(28px, 4.3vw, 62px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1, color: "#262633" }}>Mary поможет начать</h2>
              </div>

              {/* Horizontal scrolling content */}
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60, position: "relative", overflow: "hidden" }}>
                <div style={{
                  display: "flex", gap: 0,
                  transform: "translateX(" + translateX + "vw)",
                  transition: "transform .15s cubic-bezier(.22,1,.36,1)",
                  width: "max-content",
                  alignItems: "flex-start",
                }}>
                  {steps.map((step, i) => {
                    var active = i === activeStep;
                    var past = i < activeStep;
                    return (
                      <div key={i} style={{
                        width: "30vw",
                        minWidth: 380,
                        padding: "0 20px",
                        flexShrink: 0,
                        opacity: active ? 1 : past ? 0.35 : 0.2,
                        transition: "opacity .5s cubic-bezier(.22,1,.36,1)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                        {/* Number circle */}
                        <div style={{
                          width: 59, height: 59, borderRadius: "50%",
                          background: "rgba(38,38,51,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: 32,
                        }}>
                          <span style={{ fontSize: "clamp(20px, 2.2vw, 32px)", fontWeight: 500, color: "#262633" }}>{step.num}</span>
                        </div>
                        {/* Step title */}
                        <div style={{ fontSize: "clamp(22px, 2.9vw, 42px)", fontWeight: 500, color: "#262633", lineHeight: 1, marginBottom: 24 }}>{step.title}</div>
                        {/* Step description */}
                        <div style={{ fontSize: "clamp(16px, 1.9vw, 28px)", fontWeight: 400, color: "rgba(38,38,51,0.3)", lineHeight: 1.2, maxWidth: 400 }}>{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Running dog at bottom */}
              <div style={{ position: "relative", height: 80, margin: "0 48px 40px" }}>
                <div style={{
                  position: "absolute",
                  left: dogX + "%",
                  bottom: 0,
                  fontSize: 48,
                  transition: "left .15s cubic-bezier(.22,1,.36,1)",
                  transform: "translateX(-50%) translateY(" + dogBounce + "px) scaleX(-1)",
                }}>🐕</div>
              </div>
            </div>
          </div>
        );
      })()}




      {/* ═══ BLOCK: Scroll-reveal — Яндекс ID style ═══ */}
      {(() => {
        const sectionRef = useRef(null);
        const [activeIdx, setActiveIdx] = useState(0);

        useEffect(() => {
          function handleScroll() {
            if (!sectionRef.current) return;
            var rect = sectionRef.current.getBoundingClientRect();
            var sectionH = rect.height;
            var scrolled = -rect.top + window.innerHeight * 0.4;
            var progress = Math.max(0, Math.min(1, scrolled / sectionH));
            var idx = Math.floor(progress * 5);
            if (idx > 4) idx = 4;
            setActiveIdx(idx);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        const items = [
          {
            title: "Ставите задачу как сотруднику",
            desc: "Не нужно подбирать промты и формулировки. Говорите что нужно — Mary сама поймёт, декомпозирует и распределит по агентам.",
          },
          {
            title: "Агенты работают параллельно",
            desc: "Пока Маркетолог анализирует SEO, Копирайтер пишет тексты, а Разработчик чинит скорость. Одновременно, не последовательно.",
          },
          {
            title: "Проверяют друг друга",
            desc: "Если один агент находит ошибку — возвращает задачу другому сам. Вы получаете только проверенный результат. Без вашего участия.",
          },
          {
            title: "Помнит ваш бизнес",
            desc: "Mary подключена к вашим данным: файлы, встречи, CRM, мессенджеры. Не нужно объяснять контекст — она уже знает.",
          },
          {
            title: "Выдаёт готовый результат",
            desc: "Не текст для переделки, а готовый артефакт: SEO-аудит, контент-план, макет, транскрипт встречи с задачами.",
          },
        ];

        return (
          <div ref={sectionRef} style={{ padding: "clamp(56px, 8.3vw, 120px) clamp(20px, 3.3vw, 48px)", minHeight: "200vh", background: V.white }}>
            <div style={{ maxWidth: 900, margin: "0 auto", position: "sticky", top: "15vh" }}>
              <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 56, textAlign: "center" }}>Это не «очередная нейронка»</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item, i) => {
                  var active = i === activeIdx;
                  return (
                    <div key={i} onClick={() => setActiveIdx(i)} style={{
                      padding: active ? "36px 40px" : "20px 40px",
                      borderRadius: 20,
                      background: active ? "#F0EFE8" : "transparent",
                      cursor: "pointer",
                      transition: "all .4s cubic-bezier(.4,0,.2,1)",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 40,
                    }}>
                      <div style={{
                        fontSize: active ? "clamp(22px, 2.5vw, 36px)" : "clamp(18px, 1.9vw, 28px)",
                        fontWeight: 500,
                        color: active ? V.ink : V.muted2,
                        lineHeight: 1.2,
                        transition: "all .4s cubic-bezier(.4,0,.2,1)",
                        flex: "0 0 auto",
                        maxWidth: active ? "45%" : "100%",
                      }}>
                        {item.title}
                      </div>
                      {active && (
                        <div style={{ fontSize: 15, color: V.ink2, lineHeight: 1.6, flex: 1, animation: "fadeIn .4s ease", paddingTop: 4 }}>
                          {item.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

            {/* ═══ BLOCK: Результат, а не процесс ═══ */}
      <div style={{ padding: "clamp(48px, 6.9vw, 100px) clamp(20px, 3.3vw, 48px)", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: V.accent, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Не промты, а артефакты</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1 }}>Вы получаете готовый результат</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(12px, 1.4vw, 20px)" }}>
            {[
              { title: "SEO-аудит за 30 секунд", desc: "Не «советы по улучшению SEO», а конкретный отчёт: какие страницы создать, какие мета-теги пустые, почему скорость 4.2 сек — и план действий.", tag: "📊 Маркетолог", preview: "30 страниц · 15 ошибок · план на 3 мес" },
              { title: "Контент-план на месяц", desc: "Не «напиши пост про...», а готовый план: 12 постов, 8 Reels, оптимальное время, хештеги, адаптация под вашу нишу.", tag: "✍ Копирайтер", preview: "12 постов · 8 Reels · 4 Stories" },
              { title: "Транскрипт встречи + задачи", desc: "Не «расскажи о чём говорили», а полный транскрипт, саммари, извлечённые задачи с дедлайнами — автоматически.", tag: "🎙 Секретарь", preview: "45 мин · 7 задач · 3 инсайта" },
              { title: "Дизайн-макет", desc: "Не «опиши как должен выглядеть», а готовый макет баннера, карточки товара или лендинга — под ваш бренд-бук.", tag: "🎨 Дизайнер", preview: "3 варианта · адаптив · исходники" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 20, background: V.white, border: "1px solid " + V.border, overflow: "hidden" }}>
                {/* Preview bar */}
                <div style={{ padding: "16px 24px", background: "#262633", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{item.tag}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{item.preview}</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: V.muted, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 16, color: V.ink2, lineHeight: 1.6 }}>
              Нейронка даёт <strong style={{ color: V.muted }}>текст</strong>. Mary даёт <strong style={{ color: V.accent }}>результат</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ BLOCK: Ваш бизнес — внутри ═══ */}
      <div style={{ padding: "clamp(48px, 6.9vw, 100px) clamp(20px, 3.3vw, 48px)", background: V.white }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 24 }}>Mary знает ваш бизнес</h2>
          <p style={{ fontSize: 18, color: V.muted, lineHeight: 1.6, marginBottom: 48 }}>Это не чат без памяти. Mary подключается к вашим данным<br />и работает в контексте именно вашего бизнеса.</p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: "📁", title: "Файлы и документы", desc: "Загружайте — Mary использует в работе" },
              { icon: "🎙", title: "Записи встреч", desc: "Транскрибация, саммари, задачи" },
              { icon: "📊", title: "Метрики бизнеса", desc: "Дашборды и виджеты в реальном времени" },
              { icon: "🔗", title: "33 интеграции", desc: "CRM, мессенджеры, аналитика" },
            ].map((f, i) => (
              <div key={i} style={{ width: 180, padding: "24px 16px", borderRadius: 16, border: "1px solid " + V.border, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: V.muted, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

                  {/* ═══ FINAL CTA ═══ */}
      <div style={{ background: V.white, padding: "clamp(48px, 6.9vw, 100px) clamp(20px, 3.3vw, 48px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.3vw, 48px)", fontWeight: 500, letterSpacing: "-1.5px", color: V.ink, marginBottom: 16, lineHeight: 1.15 }}>Всё что вы увидели —<br />сделано через Mary</h2>
          <p style={{ fontSize: 20, color: V.muted, marginBottom: 48 }}>Хотите так же?</p>
          <button onClick={() => onScan(url || "yoursite.com")} style={{ padding: "clamp(14px, 1.2vw, 18px) clamp(28px, 3.3vw, 48px)", borderRadius: 14, background: V.ink, color: "#fff", border: "none", fontSize: 18, fontWeight: 600, cursor: "pointer", fontFamily: V.sans, transition: "transform .15s, opacity .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}>
            Попробовать бесплатно →
          </button>
        </div>
      </div>

      {/* FOOTER — mymeet style */}
      <div style={{ background: "#F5F5F5", padding: "clamp(32px, 4.2vw, 60px) clamp(20px, 3.3vw, 48px) clamp(24px, 2.8vw, 40px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Top row: logo + email */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>🐾</span>
            </div>
            <div>
              <div style={{ fontSize: 13, color: V.muted, marginBottom: 6 }}>Техническая поддержка</div>
              <div style={{ fontSize: "clamp(20px, 2.2vw, 32px)", fontWeight: 500, color: V.ink }}>hello@mary.team</div>
            </div>
          </div>

          {/* Links grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "clamp(16px, 2.2vw, 32px)", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>О продукте</div>
              {["Стоимость", "Telegram-бот", "Расширение", "API"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Решения</div>
              {["Маркетинг", "AI Чат", "AI Отчёты", "Для бизнеса", "Продажи", "Рекрутмент"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Ресурсы</div>
              {["Бонусная программа", "База знаний", "Обновления", "Блог", "Юзкейсы"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Компания</div>
              {["Telegram-канал", "Приватность", "Условия пользования"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ borderTop: "1px solid " + V.border, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 13, color: V.muted }}>©2026 mary.team</div>
            <div style={{ fontSize: 12, color: V.muted, maxWidth: 500, textAlign: "right", lineHeight: 1.5 }}>
              ООО «МэриРоуз» УНП 193889413 Юридический адрес: г. Минск, Беларусь
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ═══ 2. ВВОД ССЫЛКИ ═══ */
function UrlInput({ onScan, onSurvey, onBack }) {
  const [url, setUrl] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={0} onBack={onBack} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontFamily: V.serif, fontSize: 32, fontWeight: 500, marginBottom: 8 }}>Покажите свой бизнес</div>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 40 }}>Мэри изучит и подумает как директор: что болит, где деньги</p>
          <div style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: 32, boxShadow: V.shadow, textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: V.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Ссылка</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yoursite.com..." style={{ fontFamily: V.sans, fontSize: 14, border: "1.5px solid " + V.border, borderRadius: V.rSm, padding: "12px 16px", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            <Btn onClick={() => onScan(url || "yoursite.com")} full>Запустить аудит →</Btn>
            <div style={{ height: 1, background: V.border, margin: "24px 0" }} />
            <p style={{ fontSize: 13, color: V.muted, textAlign: "center", marginBottom: 12 }}>Нет ссылки?</p>
            <Btn variant="outline" onClick={onSurvey} full>Пройти опрос →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 3. ОПРОС ═══ */
const SQ = [
  { q: "Какая сфера?", type: "pills", opts: ["SaaS / Tech", "E-commerce", "EdTech", "Недвижимость", "Финтех", "HR", "Юридические", "Медиа", "Производство", "Услуги", "Другое"] },
  { q: "Сколько человек в команде?", type: "radio", opts: ["Только я", "2-5", "6-20", "21-50", "Больше 50"] },
  { q: "Что отнимает больше всего времени?", type: "pills", multi: true, opts: ["Продажи и клиенты", "Финансы и отчёты", "Найм и управление", "Маркетинг", "Операции и логистика", "Аналитика", "Другое"] },
  { q: "Что мешает расти?", type: "radio", opts: ["Всё держится на мне", "Не вижу куда уходят деньги", "Команда перегружена", "Хаос в процессах", "Не знаю с чего начать"] },
];

function Survey({ onГотово, onBack }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [anim, setAnim] = useState(false);
  const cur = SQ[step];
  function goNext() { if (step >= SQ.length - 1) { onГотово(); return; } setAnim(true); setTimeout(() => { setStep(s => s + 1); setAnim(false); }, 250); }
  function goBack2() { if (step <= 0) { onBack(); return; } setAnim(true); setTimeout(() => { setStep(s => s - 1); setAnim(false); }, 250); }
  function sel(o) { if (cur.multi) { const p = ans[step] || []; setAns({ ...ans, [step]: p.includes(o) ? p.filter(x => x !== o) : [...p, o] }); } else { setAns({ ...ans, [step]: o }); setTimeout(goNext, 300); } }
  function isSel(o) { return cur.multi ? (ans[step] || []).includes(o) : ans[step] === o; }
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={0} onBack={goBack2} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <h1 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 48 }}>Расскажите про свой бизнес</h1>
          <div style={{ display: "flex", gap: 5, marginBottom: 40 }}>{Array.from({ length: SQ.length }).map((_, i) => (<div key={i} style={{ height: 3.5, flex: 1, borderRadius: 3, background: i <= step ? "#2563EB" : "#E5E5E3" }} />))}</div>
          <div style={{ opacity: anim ? 0 : 1, transform: anim ? "translateX(30px)" : "none", transition: "all .25s" }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 22 }}>{cur.q}</h2>
            {cur.type === "pills" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{cur.opts.map(o => { const a = isSel(o); return (<button key={o} onClick={() => sel(o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px 9px 11px", borderRadius: 8, border: a ? "2px solid " + V.ink : "1.5px dashed " + V.border2, background: a ? V.ink : "#fff", color: a ? "#fff" : V.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: V.sans, whiteSpace: "nowrap" }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: a ? "#fff" : "#EAEAE8", color: a ? V.ink : V.muted2, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>a</span>{o}</button>); })}</div>}
            {cur.type === "radio" && <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{cur.opts.map(o => { const a = isSel(o); return (<button key={o} onClick={() => sel(o)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 2px", border: "none", borderBottom: "1px solid " + (a ? "transparent" : "#F3F3F1"), background: "none", cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 400, color: a ? V.ink : V.muted, fontFamily: V.sans, textAlign: "left", width: "100%" }}><span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (a ? V.ink : "#D0D0CE"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a && <span style={{ width: 8, height: 8, borderRadius: "50%", background: V.ink }} />}</span>{o}</button>); })}</div>}
            {cur.multi && <div style={{ marginTop: 32 }}><Btn onClick={goNext}>Продолжить →</Btn></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 4. SCAN ═══ */
function ScanOverlay({ url, onГотово }) {
  const [p, setP] = useState(0); const [done, setГотово] = useState([false, false, false, false, false]);
  useEffect(() => { const iv = setInterval(() => { setP(pr => { const n = pr + 3.5; setГотово(d => d.map((_, i) => i <= Math.floor(n / 22))); if (n >= 100) { clearInterval(iv); setTimeout(onГотово, 400); } return Math.min(n, 100); }); }, 55); return () => clearInterval(iv); }, []);
  const labels = ["Изучаем компанию", "Анализируем модель бизнеса", "Ищем узкие места", "Оцениваем процессы", "Формируем рекомендации"];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(247,246,243,.96)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: V.sans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 440, background: V.white, borderRadius: V.rLg, boxShadow: V.shadowLg, padding: 40, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "2.5px solid " + V.border, borderTopColor: V.ink, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 24px" }} />
        <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Мэри изучает ваш бизнес</div>
        <div style={{ color: V.muted, fontSize: 13, marginBottom: 28 }}>Думает как директор: что болит, где деньги</div>
        <div style={{ background: V.surface2, borderRadius: 8, height: 3, overflow: "hidden", marginBottom: 24 }}><div style={{ height: "100%", background: V.ink, borderRadius: 8, width: p + "%", transition: "width .4s" }} /></div>
        <ul style={{ listStyle: "none", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
          {labels.map((l, i) => (<li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: done[i] ? V.ink : V.muted, fontWeight: done[i] ? 500 : 400 }}><div style={{ width: 18, height: 18, borderRadius: "50%", border: done[i] ? "none" : "1.5px solid " + V.border2, background: done[i] ? V.ink : "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>{done[i] ? "✓" : ""}</div>{l}</li>))}
        </ul>
      </div>
    </div>
  );
}

/* ═══ 5. ПРОБЛЕМЫ ═══ */
function Problems({ url, onPick, onBack }) {
  const tasks = [
    { e: "📦", t: "Посчитай, сколько товара лежит без движения", d: "Деньги заморожены в остатках — никто точно не знает сколько.", agent: "Агент по запасам", tag: "Склад", ai: "30 сек", human: "~2 дня", cost: "~$90" },
    { e: "👥", t: "Найди, кто перегружен, а кто скучает", d: "Нет прозрачности кто чем занят и насколько загружен.", agent: "HR-агент", tag: "Команда", ai: "1 мин", human: "~8 часов", cost: "~$120" },
    { e: "💸", t: "Покажи, куда утекают деньги каждый месяц", d: "Выручка есть, но на счету мало. Полной картины нет.", agent: "Финансовый агент", tag: "Финансы", ai: "2 мин", human: "~6 часов", cost: "~$85" },
    { e: "📊", t: "Собери отчёт, который директор будет читать", d: "Данные разбросаны. Единой картины для решений нет.", agent: "Аналитик данных", tag: "Данные", ai: "45 сек", human: "~4 часа", cost: "~$70" },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={1} onBack={onBack} />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(24px, 3.3vw, 48px) clamp(16px, 1.7vw, 24px) clamp(40px, 5.5vw, 80px)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: V.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Что нашла Мэри</div>
        <div style={{ fontFamily: V.serif, fontSize: 26, fontWeight: 500, marginBottom: 6, letterSpacing: "-.5px" }}>4 точки, где бизнес теряет деньги</div>
        <div style={{ fontSize: 14, color: V.muted, marginBottom: 28 }}>Выберите — Мэри расскажет как это исправить</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {tasks.map((tk, i) => (
            <div key={i} onClick={() => onPick(i)} style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: "22px 22px 18px", cursor: "pointer", boxShadow: V.shadowSm, position: "relative", transition: "all .18s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{tk.e}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: V.surface2, color: V.muted }}>{tk.tag}</span>
              </div>
              <div style={{ fontFamily: V.serif, fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.35, color: V.ink }}>{tk.t}</div>
              <div style={{ fontSize: 13, color: V.muted, lineHeight: 1.5, marginBottom: 14 }}>{tk.d}</div>

              {/* AI vs Human comparison — small oval pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, background: "rgba(14,165,233,.07)", border: "1px solid rgba(14,165,233,.15)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: V.green }}>{tk.ai}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, background: V.surface2, border: "1px solid " + V.border }}>
                  <span style={{ fontSize: 12, color: V.muted }}>Сотрудник {tk.human} · {tk.cost}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: V.muted }}>{tk.agent}</span>
                <span style={{ fontSize: 13, color: V.ink, fontWeight: 600 }}>Узнать →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   6. ЧАТ-КОНСУЛЬТАЦИЯ (полностью новый)
   ═══════════════════════════════════════ */
const CHAT_DATA = [
  {
    agent: "Агент по запасам",
    messages: [
      { type: "text", text: "Привет! Я изучила ваш бизнес и нашла кое-что интересное про склад 📦" },
      { type: "text", text: "Вы закупаете товар заранее — блокноты, материалы, расходники. Что-то уходит быстро, а что-то лежит месяцами." },
      { type: "card", title: "Что нашли", items: [{ label: "~340 000 ₽", desc: "заморожено в остатках" }, { label: "47 позиций", desc: "без движения 3+ месяца" }, { label: "12%", desc: "товара — пора распродать" }] },
      { type: "text", text: "Мой агент по запасам умеет с этим работать. Вот что он сделает:" },
      { type: "steps", items: ["Покажет, что залежалось и на какую сумму", "Подскажет, что пора распродать со скидкой", "Рассчитает, сколько реально закупать в следующий раз"] },
      { type: "text", text: "Ожидаемый эффект: высвобождение 15-25% оборотных средств. Деньги перестанут лежать на полке 💰" },
      { type: "question", text: "Хотите, чтобы он начал прямо сейчас?" },
    ],
  },
  {
    agent: "HR-агент",
    messages: [
      { type: "text", text: "Привет! Я посмотрела на вашу команду и вижу дисбаланс 👥" },
      { type: "text", text: "Часть сотрудников работает за троих и выгорает, а часть — недогружена. При этом нанимать новых дорого." },
      { type: "card", title: "Что нашли", items: [{ label: "2 человека", desc: "перегружены (140%+ нагрузки)" }, { label: "1 человек", desc: "загружен меньше чем на 50%" }, { label: "~180 000 ₽/мес", desc: "можно сэкономить на найме" }] },
      { type: "text", text: "HR-агент разберёт нагрузку по каждому:" },
      { type: "steps", items: ["Покажет кто реально перегружен с цифрами", "Найдёт кто может взять больше задач", "Поможет распределить так, чтобы не нанимать лишних"] },
      { type: "text", text: "Результат: команда работает ровнее, без выгорания и лишних расходов на найм." },
      { type: "question", text: "Запустить анализ команды?" },
    ],
  },
  {
    agent: "Финансовый агент",
    messages: [
      { type: "text", text: "Привет! Я покопалась в ваших расходах — и нашла интересное 💸" },
      { type: "text", text: "Выручка есть, но на счету всегда мало. Подписки, сервисы, мелкие расходы — всё складывается, а полной картины нет." },
      { type: "card", title: "Что нашли", items: [{ label: "23 подписки", desc: "активных — часть не используется" }, { label: "~67 000 ₽/мес", desc: "можно сэкономить" }, { label: "0", desc: "прозрачных отчётов по расходам" }] },
      { type: "text", text: "Финансовый агент наведёт порядок:" },
      { type: "steps", items: ["Соберёт все расходы в одну таблицу", "Покажет где утекает больше всего", "Подскажет что можно безболезненно убрать"] },
      { type: "text", text: "Обычно находит 10-20% экономии. Деньги, которые вы даже не замечали." },
      { type: "question", text: "Навести порядок в финансах?" },
    ],
  },
  {
    agent: "Аналитик данных",
    messages: [
      { type: "text", text: "Привет! Я заглянула в ваши данные — и вижу проблему 📊" },
      { type: "text", text: "Данные разбросаны: часть в Google Sheets, часть в CRM, часть в головах. Когда нужно решение — приходится собирать по кусочкам." },
      { type: "card", title: "Что нашли", items: [{ label: "5+ источников", desc: "данных без единой картины" }, { label: "~2 часа", desc: "уходит на сбор одного отчёта" }, { label: "0", desc: "автоматических дашбордов" }] },
      { type: "text", text: "Аналитик данных это исправит:" },
      { type: "steps", items: ["Соберёт ключевые метрики в один дашборд", "Настроит автообновление — без ручной работы", "Директор увидит главное за 30 секунд, не за 2 часа"] },
      { type: "text", text: "Решения будут быстрее и точнее — потому что картина перед глазами." },
      { type: "question", text: "Собрать ваш первый дашборд?" },
    ],
  },
];

function ChatScreen({ problemIdx, onContinue, onBack, onSwitch }) {
  const historyStore = useRef({});
  function getStore(idx) {
    if (!historyStore.current[idx]) {
      historyStore.current[idx] = { chatLog: [], phase: -1, quickReplies: [], showFinal: false };
    }
    return historyStore.current[idx];
  }

  const store = getStore(problemIdx);
  const [chatLog, setChatLog] = useState(store.chatLog);
  const [maryTyping, setMaryTyping] = useState(false);
  const [phase, setPhase] = useState(store.phase);
  const [inputVal, setInputVal] = useState("");
  const [quickReplies, setQuickReplies] = useState(store.quickReplies);
  const [showFinal, setShowFinal] = useState(store.showFinal);
  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const data = CHAT_DATA[problemIdx] || CHAT_DATA[0];

  // save state back to store whenever it changes
  useEffect(() => {
    historyStore.current[problemIdx] = { chatLog, phase, quickReplies, showFinal };
  }, [chatLog, phase, quickReplies, showFinal, problemIdx]);

  function scroll() {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  }

  function addMary(msg, delay) {
    return new Promise((resolve) => {
      setMaryTyping(true);
      scroll();
      timerRef.current = setTimeout(() => {
        setMaryTyping(false);
        setChatLog((prev) => [...prev, { from: "mary", ...msg }]);
        scroll();
        resolve();
      }, delay || 900);
    });
  }

  function addUser(text) {
    setChatLog((prev) => [...prev, { from: "user", type: "text", text }]);
    setQuickReplies([]);
    scroll();
  }

  async function runPhase0() {
    setPhase(0);
    const msgs = data.messages;
    await addMary(msgs[0], 600);
    await addMary(msgs[1], 1000);
    setQuickReplies(["Да, расскажи подробнее", "А сколько это стоит?", "Какие результаты?"]);
  }

  async function runPhase1(userReply) {
    addUser(userReply);
    setPhase(1);
    const msgs = data.messages;
    await addMary({ type: "text", text: "Отлично, показываю что нашла:" }, 700);
    await addMary(msgs[2], 1400);
    await addMary(msgs[3], 800);
    await addMary(msgs[4], 1200);
    setQuickReplies(["А какой эффект будет?", "Сколько это займёт?", "Хочу попробовать"]);
  }

  async function runPhase2(userReply) {
    addUser(userReply);
    setPhase(2);
    const msgs = data.messages;
    await addMary(msgs[5], 900);
    await addMary(msgs[6], 700);
    setQuickReplies([]);
    setShowFinal(true);
    scroll();
  }

  // on switch: restore saved state or start fresh
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMaryTyping(false);
    setInputVal("");

    const saved = historyStore.current[problemIdx];
    if (saved && saved.phase >= 0) {
      // restore saved conversation
      setChatLog(saved.chatLog);
      setPhase(saved.phase);
      setQuickReplies(saved.quickReplies);
      setShowFinal(saved.showFinal);
      scroll();
    } else {
      // first visit — start conversation
      setChatLog([]);
      setPhase(-1);
      setQuickReplies([]);
      setShowFinal(false);
      runPhase0();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [problemIdx]);

  function handleQuickReply(text) {
    if (phase === 0) runPhase1(text);
    else if (phase === 1) runPhase2(text);
  }

  function handleSend() {
    if (!inputVal.trim()) return;
    const txt = inputVal.trim();
    setInputVal("");
    if (phase === 0) runPhase1(txt);
    else if (phase === 1) runPhase2(txt);
    else {
      addUser(txt);
      setMaryTyping(true);
      scroll();
      setTimeout(() => {
        setMaryTyping(false);
        setChatLog((prev) => [...prev, { from: "mary", type: "text", text: "Отличный вопрос! Чтобы я могла ответить детально — давайте подключим всю команду. Там я распишу всё пошагово." }]);
        setShowFinal(true);
        scroll();
      }, 1200);
    }
  }

  function renderBubble(msg, i) {
    const isUser = msg.from === "user";

    if (isUser) {
      return (
        <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ background: V.ink, color: "#fff", borderRadius: 20, padding: "12px 20px", fontSize: 14, lineHeight: 1.6, maxWidth: "75%" }}>{msg.text}</div>
        </div>
      );
    }

    if (msg.type === "text" || msg.type === "question") {
      return (
        <div key={i} style={{ marginBottom: 16, animation: "msgIn .4s ease" }}>
          <div style={{ fontSize: 15, color: V.ink, lineHeight: 1.75 }}>
            {msg.type === "question" ? <strong>{msg.text}</strong> : msg.text}
          </div>
        </div>
      );
    }

    if (msg.type === "card") {
      return (
        <div key={i} style={{ marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {msg.items.map((item, j) => (
              <div key={j} style={{ flex: "1 1 120px", padding: "14px 16px", background: V.white, border: "1.5px solid " + V.border, borderRadius: V.r, textAlign: "center", minWidth: 120 }}>
                <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: V.muted, lineHeight: 1.3 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (msg.type === "steps") {
      return (
        <div key={i} style={{ marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ padding: "16px 20px", background: V.white, border: "1.5px solid " + V.border, borderRadius: V.r }}>
            {msg.items.map((step, j) => (
              <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: j < msg.items.length - 1 ? "1px solid " + V.surface2 : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: V.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{j + 1}</div>
                <div style={{ fontSize: 14, color: V.ink2, lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: V.white, fontFamily: V.sans }}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes dots{0%,80%,100%{opacity:.3}40%{opacity:1}}`}</style>
      <Nav step={1} onBack={onBack} />

      {/* problem tabs strip — sticky under nav */}
      <div style={{ background: V.white, borderBottom: "1px solid " + V.border, padding: "10px 48px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, overflowX: "auto" }}>
        {[
          { e: "📦", label: "Склад", ai: "30 сек" },
          { e: "👥", label: "Команда", ai: "1 мин" },
          { e: "💸", label: "Финансы", ai: "2 мин" },
          { e: "📊", label: "Данные", ai: "45 сек" },
        ].map((tab, i) => {
          const active = i === problemIdx;
          return (
            <button key={i} onClick={() => { if (!active && onSwitch) onSwitch(i); }} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px 6px 10px", borderRadius: 8,
              border: active ? "1.5px solid " + V.ink : "1.5px solid " + V.border,
              background: active ? V.ink : V.white,
              color: active ? "#fff" : V.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: V.sans, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>{tab.e}</span>
              {tab.label}
              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>{tab.ai}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={onContinue} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 20px", borderRadius: 8,
          background: V.green, color: "#fff", border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: V.sans, whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: "0 1px 4px rgba(14,165,233,.3)",
        }}>
          Хочу всю команду →
        </button>
      </div>

      {/* chat body */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "32px 48px 16px" }}>
        <div style={{ maxWidth: 680 }}>
          {/* agent title */}
          <div style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 24, letterSpacing: "-.5px" }}>{data.agent}</div>

          {chatLog.map((msg, i) => renderBubble(msg, i))}

          {/* typing indicator */}
          {maryTyping && (
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "dots 1.4s infinite" }}><circle cx="8" cy="8" r="6" fill="none" stroke={V.muted2} strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" /></svg>
              <span style={{ fontSize: 13, color: V.muted }}>Мэри думает...</span>
            </div>
          )}

          {/* quick replies */}
          {quickReplies.length > 0 && !maryTyping && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, marginBottom: 16, justifyContent: "flex-end", animation: "msgIn .3s ease" }}>
              {quickReplies.map((qr, qi) => (
                <button key={qi} onClick={() => handleQuickReply(qr)} style={{
                  padding: "10px 20px", borderRadius: 20,
                  border: "1.5px solid " + V.border, background: V.bg,
                  fontSize: 13, fontWeight: 500, color: V.ink, cursor: "pointer",
                  fontFamily: V.sans, transition: "all .15s",
                }}>{qr}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* input bar — clean, like the reference */}
      <div style={{ borderTop: "1px solid " + V.border, background: V.white, padding: "12px 48px 16px", flexShrink: 0 }}>
        <div style={{ maxWidth: 680, border: "1.5px solid " + V.border, borderRadius: 16, padding: "12px 16px", background: V.white }}>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={"Спросите " + data.agent + "..."}
            rows={1}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              fontSize: 14, fontFamily: V.sans, color: V.ink, background: "transparent",
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 16, color: V.muted2, cursor: "pointer" }}>+</span>
              <span style={{ fontSize: 14, color: V.muted2, cursor: "pointer" }}>⚙</span>
            </div>
            <button onClick={handleSend} style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: inputVal.trim() ? V.ink : V.border,
              color: "#fff", cursor: inputVal.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, transition: "background .2s",
            }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 7. MEET TEAM ═══ */
function MeetTeam({ onContinue }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <style>{`@keyframes sp2{to{transform:rotate(360deg)}}`}</style>
      <Nav step={2} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: V.ink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontFamily: V.serif, fontSize: 36, color: "#fff", fontWeight: 700, fontStyle: "italic", boxShadow: V.shadowLg, position: "relative" }}>M<div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1.5px dashed " + V.muted2, animation: "sp2 20s linear infinite" }} /></div>
          <h2 style={{ fontFamily: V.serif, fontSize: 38, fontWeight: 500, marginBottom: 8 }}>Привет, я <em style={{ fontStyle: "italic", color: V.accent }}>Мэри</em></h2>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 36 }}>Нашла проблемы — собрала команду агентов под каждую боль.</p>
          <div style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: "24px 28px", marginBottom: 32, textAlign: "left", boxShadow: V.shadowSm }}>
            <span style={{ fontFamily: V.serif, fontSize: 52, color: V.border2, lineHeight: 0.5, marginBottom: 12, display: "block" }}>"</span>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: V.ink2 }}>Я буду раздавать задачи, контролировать каждого агента и отвечать за результат. Просто скажите что болит.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            {["📦", "👥", "💸", "📊", "⚙️"].map((e, i) => (<div key={i} style={{ width: 44, height: 44, borderRadius: "50%", background: ["#FEF7E0", "#E8F0FE", "#FCE8E6", "#E6F4EA", "#F3E8FD"][i], border: "2.5px solid " + V.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginLeft: i > 0 ? -8 : 0, boxShadow: V.shadowSm }}>{e}</div>))}
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2.5px solid " + V.bg, background: V.surface2, marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: V.muted }}>+15</div>
          </div>
          <p style={{ fontSize: 12, color: V.muted2, marginBottom: 32 }}>Команда подберётся под ваши задачи</p>
          <Btn onClick={onContinue} lg full>Запустить команду →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══ 8. ONBOARD ═══ */
function Onboard({ onГотово }) {
  const [step, setStep] = useState(1);
  const ls = { display: "block", fontSize: 12, fontWeight: 600, color: V.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" };
  const is = { fontFamily: V.sans, fontSize: 14, border: "1.5px solid " + V.border, borderRadius: V.rSm, padding: "11px 16px", width: "100%", outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={3} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: 40, boxShadow: V.shadow }}>
          {step === 1 && (<div>
            <div style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Создайте аккаунт</div>
            <div style={{ fontSize: 14, color: V.muted, marginBottom: 28 }}>Команда ждёт. Меньше минуты.</div>
            <div style={{ marginBottom: 18 }}><label style={ls}>Email</label><input placeholder="you@company.com" style={is} /></div>
            <div style={{ marginBottom: 18 }}><label style={ls}>Имя</label><input placeholder="Как вас зовут?" style={is} /></div>
            <Btn onClick={() => setStep(3)} full>Продолжить →</Btn>
          </div>)}
          {step === 3 && (<div>
            <div style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Запустить команду</div>
            <div style={{ background: V.surface2, borderRadius: V.rSm, padding: "16px 18px", marginBottom: 20, fontSize: 13, color: V.ink2, lineHeight: 1.6, borderLeft: "3px solid " + V.muted2 }}>Серверы, токены, работа агентов — реальные расходы. Цена покрывает только затраты.</div>
            <div style={{ background: "linear-gradient(135deg,#F7F6F3,#EFEDE8)", border: "1.5px solid " + V.border, borderRadius: V.r, padding: 24, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontFamily: V.serif, fontSize: 44, fontWeight: 700, letterSpacing: "-2px" }}>990₽ <span style={{ fontSize: 14, color: V.muted, fontFamily: V.sans, fontWeight: 400 }}>/ неделя</span></div>
              <div style={{ fontSize: 13, color: V.muted, margin: "6px 0 18px" }}>7 дней — сделайте вывод</div>
              <ul style={{ listStyle: "none", textAlign: "left", display: "flex", flexDirection: "column", gap: 9 }}>
                {["Мэри + 20 агентов", "Склад, HR, финансы, данные", "Неограниченные задачи", "Дашборд и аналитика"].map((it, i) => (<li key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: V.ink2 }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: V.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>✓</div>{it}</li>))}
              </ul>
            </div>
            <Btn onClick={onГотово} lg full>Попробовать неделю →</Btn>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: V.muted }}>Отмена в 1 клик.</p>
          </div>)}
        </div>
      </div>
    </div>
  );
}

/* ═══ 9. PLATFORM — Chat-first + Agent setup ═══ */
function Dash({ onReset }) {
  const [chatInput, setChatInput] = useState("");
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [activeChat, setActiveChat] = useState("mary");
  const [msgIndex, setMsgIndex] = useState(0);
  const [userMsgs, setUserMsgs] = useState([]);
  const [typing, setTyping] = useState(false);

  const P = { white: "#fff", bg: "#FAFAFA", border: "#EBEBEB", ink: "#262633", ink2: "#444", muted: "#999", muted2: "#CCC", accent: "#6C5CE7", accentBg: "rgba(108,92,231,.06)", green: "#0EA5E9", greenBg: "rgba(14,165,233,.06)", pink: "#F0786A", warm: "#FF6B00", r: 10, shadow: "0 1px 3px rgba(0,0,0,.04)", font: "'DM Sans', system-ui, sans-serif" };

  const agents = [
    { id: "manager", emoji: "📋", name: "ИИ-Менеджер", status: "setup", desc: "Управление командой, задачи, дедлайны" },
    { id: "smm", emoji: "📣", name: "Маркетолог", status: "locked", desc: "Контент, SMM, аналитика охватов" },
    { id: "designer", emoji: "🎨", name: "Дизайнер", status: "locked", desc: "Макеты, баннеры, UI" },
    { id: "accountant", emoji: "🧮", name: "Бухгалтер", status: "locked", desc: "Расходы, P&L, подписки" },
  ];

  // Mary's auto-messages based on onboarding pain "автоматизировать рутину менеджера"
  const maryFlow = [
    { from: "mary", text: "Привет, Мария! 👋\n\nНа основе аудита я вижу вашу главную боль — вы сами менеджерите команду, трекаете задачи и переписываетесь в чатах вместо того, чтобы заниматься стратегией.", delay: 0 },
    { from: "mary", text: "Я предлагаю подключить ИИ-Менеджера — он будет:", delay: 1500 },
    { from: "mary", type: "card", data: {
      title: "ИИ-Менеджер",
      items: [
        "Ставить задачи сотрудникам в Telegram",
        "Собирать статусы: кто что делает",
        "Напоминать о дедлайнах",
        "Присылать вам утреннюю сводку",
        "Эскалировать если что-то горит",
      ],
    }, delay: 2500 },
    { from: "mary", text: "Для начала мне нужно подключить Telegram — чтобы я могла общаться с вашей командой.\n\nЭто займёт 2 минуты.", delay: 4000 },
    { from: "mary", type: "action", data: {
      title: "Подключить Telegram",
      desc: "Mary создаст бота для вашей команды",
      btn: "Подключить",
    }, delay: 5000 },
  ];

  // Auto-reveal messages
  useEffect(() => {
    if (activeChat === "mary" && msgIndex < maryFlow.length) {
      const msg = maryFlow[msgIndex];
      const timer = setTimeout(() => {
        setMsgIndex(prev => prev + 1);
      }, msg.delay + 800);
      return () => clearTimeout(timer);
    }
  }, [msgIndex, activeChat]);

  const visibleMsgs = maryFlow.slice(0, msgIndex);

  function handleSend(txt) {
    if (!txt.trim()) return;
    setChatInput("");
    setUserMsgs(prev => [...prev, { text: txt, afterIdx: msgIndex }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const lower = txt.toLowerCase();
      let reply = "Поняла! Давайте сначала подключим Telegram — и я начну работать с вашей командой.";
      if (lower.includes("подключ") || lower.includes("telegram") || lower.includes("да")) {
        reply = "Отлично! Вот ссылка на бота: @mary_manager_bot\n\nДобавьте его в рабочий чат с командой. Как только добавите — я увижу участников и начну настройку.\n\nПосле этого мне нужно будет:\n1. Узнать имена сотрудников\n2. Понять кто за что отвечает\n3. Настроить расписание сводок";
      }
      if (lower.includes("как") && lower.includes("работа")) {
        reply = "Каждое утро в 9:00 я пришлю вам сводку в Telegram:\n\n📋 Статус задач: кто что сделал вчера\n⚠️ Что горит: просроченные дедлайны\n📊 Нагрузка: кто перегружен, кто свободен\n\nВ течение дня я сама ставлю задачи, напоминаю о дедлайнах и эскалирую вам если нужно решение.";
      }
      if (lower.includes("сколько") || lower.includes("стои")) {
        reply = "Сейчас у вас Trial — 7 дней бесплатно с ИИ-Менеджером. После — 990₽/нед за пакет из 4 агентов (Менеджер + Маркетолог + Дизайнер + Бухгалтер).";
      }
      if (lower.includes("сотрудн") || lower.includes("команд") || lower.includes("лена") || lower.includes("катя")) {
        reply = "Записала! Когда подключите Telegram-бота в рабочий чат — я автоматически увижу всех участников и предложу распределение ролей.";
      }
      setUserMsgs(prev => [...prev, { text: reply, fromMary: true, afterIdx: msgIndex }]);
    }, 1000);
  }

  // Build combined message list
  const allMsgs = [];
  visibleMsgs.forEach((m, i) => {
    allMsgs.push(m);
    userMsgs.filter(u => u.afterIdx === i + 1).forEach(u => allMsgs.push(u));
  });
  userMsgs.filter(u => u.afterIdx >= msgIndex).forEach(u => allMsgs.push(u));

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: P.font, background: P.bg }}>

      {/* SIDEBAR */}
      <div style={{ width: 260, flexShrink: 0, background: P.white, borderRight: "1px solid " + P.border, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 18px 16px" }}>
          <div onClick={onReset} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Mary<span style={{ color: P.accent }}>.</span></div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "0 8px", overflowY: "auto" }}>
          {/* Mary main chat */}
          <div onClick={() => setActiveChat("mary")} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            background: activeChat === "mary" ? P.bg : "transparent",
            border: activeChat === "mary" ? "1px solid " + P.border : "1px solid transparent",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: P.ink }}>Mary</div>
              <div style={{ fontSize: 11, color: P.muted }}>Главный чат</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.green }} />
          </div>

          {/* Agents section */}
          <div style={{ marginTop: 16 }}>
            <div onClick={() => setAgentsOpen(!agentsOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
              <span style={{ fontSize: 9, transform: agentsOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>▶</span>
              ИИ-агенты
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: P.accent, background: P.accentBg, padding: "1px 7px", borderRadius: 8 }}>4</span>
            </div>

            {agentsOpen && agents.map((a) => (
              <div key={a.id} onClick={() => { if (a.status !== "locked") setActiveChat(a.id); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 28px", borderRadius: 8, cursor: a.status === "locked" ? "default" : "pointer",
                opacity: a.status === "locked" ? .5 : 1,
                background: activeChat === a.id ? P.bg : "transparent",
              }}>
                <span style={{ fontSize: 15, filter: a.status === "locked" ? "grayscale(100%)" : "none" }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: a.status === "locked" ? P.muted : P.ink }}>{a.name}</div>
                </div>
                {a.status === "setup" && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: P.warm, color: "#fff", fontWeight: 700 }}>Настройка</span>}
                {a.status === "locked" && <span style={{ fontSize: 12 }}>🔒</span>}
              </div>
            ))}
          </div>
        </div>

        {/* user */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid " + P.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.pink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>М</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Мария</div>
              <div style={{ fontSize: 11, color: P.muted }}>Trial · 7 дней</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat header */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid " + P.border, background: P.white, display: "flex", alignItems: "center", gap: 12 }}>
          {activeChat === "mary" ? (<>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>M</div>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: P.ink }}>Mary</div><div style={{ fontSize: 12, color: P.green }}>● Онлайн</div></div>
          </>) : (<>
            <span style={{ fontSize: 24 }}>{agents.find(a => a.id === activeChat)?.emoji}</span>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: P.ink }}>{agents.find(a => a.id === activeChat)?.name}</div><div style={{ fontSize: 12, color: P.warm }}>● Настройка</div></div>
          </>)}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: P.greenBg, fontSize: 12, fontWeight: 600, color: P.green }}>Trial · 7 дней</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 16px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {allMsgs.map((m, i) => {
              // User message
              if (m.text && !m.from && !m.fromMary) {
                return (<div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <div style={{ background: P.ink, color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "12px 18px", fontSize: 14, maxWidth: "70%", lineHeight: 1.6 }}>{m.text}</div>
                </div>);
              }
              // Mary reply to user
              if (m.fromMary) {
                return (<div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: P.ink2, lineHeight: 1.7, whiteSpace: "pre-line", background: P.white, border: "1px solid " + P.border, borderRadius: "4px 16px 16px 16px", padding: "14px 18px", maxWidth: "85%" }}>{m.text}</div>
                </div>);
              }
              // Mary auto-message: text
              if (m.from === "mary" && !m.type) {
                return (<div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: P.ink2, lineHeight: 1.7, whiteSpace: "pre-line", maxWidth: "85%" }}>{m.text}</div>
                </div>);
              }
              // Card type
              if (m.type === "card") {
                return (<div key={i} style={{ marginBottom: 16, background: P.white, border: "1px solid " + P.border, borderRadius: 12, padding: "20px", maxWidth: 480, boxShadow: P.shadow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>📋</span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: P.ink }}>{m.data.title}</div>
                  </div>
                  {m.data.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: P.ink2, lineHeight: 1.5 }}>
                      <span style={{ color: P.green, flexShrink: 0, marginTop: 2 }}>✓</span>{item}
                    </div>
                  ))}
                </div>);
              }
              // Action type (CTA button)
              if (m.type === "action") {
                return (<div key={i} style={{ marginBottom: 16, background: "linear-gradient(135deg, " + P.accent + ", #8B5CF6)", borderRadius: 12, padding: "22px", maxWidth: 400, color: "#fff" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{m.data.title}</div>
                  <div style={{ fontSize: 13, opacity: .8, marginBottom: 16 }}>{m.data.desc}</div>
                  <button onClick={() => handleSend("Подключить Telegram")} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.2)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: P.font, backdropFilter: "blur(4px)" }}>{m.data.btn} →</button>
                </div>);
              }
              return null;
            })}

            {typing && (
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>M</div>
                <span style={{ fontSize: 13, color: P.muted }}>Mary печатает...</span>
              </div>
            )}

            {msgIndex < maryFlow.length && !typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: P.muted, fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.accent, animation: "pulse 1.5s infinite" }} />
                Mary печатает...
              </div>
            )}
          </div>
        </div>

        {/* Quick replies */}
        {msgIndex >= 3 && userMsgs.length === 0 && (
          <div style={{ padding: "0 24px 8px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Подключить Telegram", "Как это будет работать?", "Кто в моей команде?", "Сколько стоит?"].map((q, i) => (
                <button key={i} onClick={() => handleSend(q)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + P.border, background: P.white, fontSize: 13, cursor: "pointer", fontFamily: P.font, color: P.ink }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 24px 16px", background: P.white, borderTop: "1px solid " + P.border }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, border: "1.5px solid " + (chatInput ? P.accent : P.border), borderRadius: 12, padding: "12px 16px", background: P.bg, transition: "border .15s" }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(chatInput); }} placeholder="Написать Mary..." style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontFamily: P.font, background: "transparent", color: P.ink }} />
              </div>
              <button onClick={() => handleSend(chatInput)} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: chatInput.trim() ? P.accent : P.border, color: "#fff", cursor: chatInput.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>↑</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ APP ═══ */
/* ═══ SPHERE LANDING PAGES ═══ */
const SPHERES = [
  { emoji: "💻", name: "SaaS / Tech", who: "CEO стартапа, 5-30 человек, pre-seed/seed",
    hero: "Runway горит, а дашборда для инвестора до сих пор нет",
    pains: ["Разработка медленная — а деньги тают каждый месяц. Runway 8 месяцев, а PMF всё ещё нет", "MRR, churn, LTV считаете в Google Sheets на глаз. Инвестор спросит — и вы 2 дня собираете цифры", "CTO перегружен на 160%, джуны не тянут без менторства, а вы сами ведёте спринты и продаёте"],
    fears: ["Деньги закончатся до product-market fit", "Конкуренты из YC выпускают фичи за неделю, а вы — за месяц"],
    trigger: "Инвестор попросил unit-economics дашборд — а его нет. Собирать из 5 источников — 2 дня работы CTO, которому и так некогда.",
    solution: "Аналитик-агент Mary собрал дашборд за 45 секунд. Менеджер-агент ведёт спринты. Разработчик-агент мониторит баги и uptime 24/7.",
    agents: ["📊 Аналитик", "📋 Менеджер", "💻 Разработчик", "🧮 Бухгалтер"] },
  { emoji: "🛒", name: "E-commerce", who: "Селлер WB/Ozon или владелец магазина, 1-15 человек",
    hero: "340 000 ₽ заморожено в товаре, а на рекламу денег нет",
    pains: ["Товар лежит на складе 3+ месяца без движения — деньги заморожены, а вы не знаете точные суммы", "Реальную маржу не считаете — Excel с ошибками, конкуренты демпингуют, вы реагируете с опозданием", "Возвраты и брак не отслеживаете до конца месяца — узнаёте о потерях когда уже поздно"],
    fears: ["Закупите партию на 500к — а она не продастся, кассовый разрыв", "Другие селлеры уже автоматизировали аналитику, а вы вручную"],
    trigger: "Остатки на 340к, денег на рекламу нет — замкнутый круг. Нужно распродать, но не знаете что именно.",
    solution: "Агент по запасам нашёл 47 позиций без движения с суммами. Распродали за неделю — высвободили 140к на трафик.",
    agents: ["📦 Складской", "🧮 Бухгалтер", "📊 Аналитик", "📣 Маркетолог"] },
  { emoji: "🎓", name: "EdTech", who: "Продюсер или эксперт, 3-20 человек",
    hero: "Очередной запуск в минус, а эксперт хочет уйти",
    pains: ["CPA вырос в 3 раза за год — юнит-экономика не сходится, каждый запуск как рулетка", "Контента нужно в 5 раз больше: Reels, статьи, email, вебинары — а людей не хватает", "Эксперт выгорает: записывает, продаёт, поддерживает студентов сам — ещё один запуск и он уйдёт"],
    fears: ["Вложите 500к в новый курс — и он не окупится, как предыдущий", "Все перешли на мини-курсы и Shorts, а у вас нет ресурса даже попробовать"],
    trigger: "Очередной запуск в минус. Эксперт говорит «я так больше не могу». А 47 подписок на сервисы сжирают бюджет.",
    solution: "Бухгалтер-агент нашёл 8 подписок которыми никто не пользуется — 67к/мес. Маркетолог-агент генерит контент 24/7.",
    agents: ["📣 Маркетолог", "🧮 Бухгалтер", "📋 Менеджер", "📊 Аналитик"] },
  { emoji: "🏠", name: "Недвижимость", who: "Директор агентства или брокер, 3-30 человек",
    hero: "Забыли позвонить клиенту — он подписал с конкурентом",
    pains: ["Сделки длятся 2-6 месяцев — клиенты теряются между этапами, забываете перезвонить", "Каждая сделка — 40+ страниц документов на проверку, юрист тратит 2 дня на один договор", "5 объектов одновременно — путаете этапы, клиент нервничает и уходит"],
    fears: ["Пропустите дедлайн по сделке на 15М — потеряете комиссию 450к", "Конкуренты уже с CRM и автообзвоном, а вы в блокноте"],
    trigger: "Забыли позвонить клиенту на этапе одобрения — он подписал с другим агентом. Потерянная комиссия — 450к.",
    solution: "Менеджер-агент ведёт воронку и напоминает. Юрист-агент проверяет договор за 10 минут вместо 2 дней.",
    agents: ["📋 Менеджер", "⚖️ Юрист", "🧮 Бухгалтер", "📣 Маркетолог"] },
  { emoji: "🏦", name: "Финтех", who: "CEO платёжного/кредитного сервиса, 10-100 человек",
    hero: "Аудитор нашёл несоответствие — штраф 500к",
    pains: ["Регуляторика ЦБ меняется каждый квартал — не успеваете отслеживать все изменения", "Compliance стоит 300к/мес на юристов, а они всё равно пропускают", "Один отчёт для ЦБ собирается 3 дня из разных систем"],
    fears: ["Пропустите требование ЦБ — штраф от 500к до отзыва лицензии", "Конкуренты автоматизировали KYC, а у вас 20 минут на клиента вручную"],
    trigger: "Аудитор нашёл несоответствие, которое пропустили 3 юриста. Штраф — 500к. И это не первый раз.",
    solution: "Юрист-агент мониторит изменения 24/7. Бухгалтер готовит отчёты автоматически. Замена 1 юриста = 300к/мес экономии.",
    agents: ["⚖️ Юрист", "🧮 Бухгалтер", "📊 Аналитик", "📋 Менеджер"] },
  { emoji: "👥", name: "HR / Рекрутинг", who: "Директор HR-агентства или HRD, 5-50 человек",
    hero: "Senior принял оффер конкурента, пока вы согласовывали",
    pains: ["Вакансии висят 45+ дней — нанимать мучительно долго, бизнес простаивает", "200 откликов на вакансию — скрининг вручную 3 дня, 90% нерелевантных", "Лучшие кандидаты принимают оффер за 48 часов, а вы думаете неделю"],
    fears: ["Потеряете ключевого сотрудника и не найдёте замену 3 месяца", "Компании с AI-скринингом закрывают вакансии за 2 недели, а вы за 2 месяца"],
    trigger: "Senior-разработчик принял оффер конкурента пока вы согласовывали зарплату внутри. Time-to-hire убивает.",
    solution: "HR-агент проскринил 200 откликов за 5 минут, выдал топ-10. Time-to-hire с 45 до 12 дней.",
    agents: ["👥 HR-агент", "📋 Менеджер", "📊 Аналитик", "🧮 Бухгалтер"] },
  { emoji: "⚖️", name: "Юридические", who: "Управляющий партнёр юрфирмы, 3-30 человек",
    hero: "Пропустили неустойку в договоре — клиент потерял 2М",
    pains: ["Проверка одного договора — 4 часа работы юриста, клиент ждёт и нервничает", "Документооборот съедает 40% рабочего времени партнёра — того, кто должен продавать", "Младшие юристы пропускают риски — приходится перепроверять каждый документ"],
    fears: ["Пропустите рисковый пункт — клиент подаст в суд на вас", "LegalTech-конкуренты проверяют договор за 5 минут онлайн"],
    trigger: "Пропустили пункт о неустойке в договоре с поставщиком. Клиент потерял 2М. Репутация под ударом.",
    solution: "Юрист-агент проверил 12 договоров за 10 минут, нашёл 3 критичных риска. Раньше это 4 часа юриста за 15к.",
    agents: ["⚖️ Юрист", "📋 Менеджер", "🧮 Бухгалтер", "📊 Аналитик"] },
  { emoji: "📱", name: "Медиа / Контент", who: "Главред, продюсер или блогер, 2-20 человек",
    hero: "Охваты упали на 60% после смены алгоритма",
    pains: ["Нужно 30 единиц контента в неделю, а команда делает 5 — не хватает рук", "Алгоритмы меняются — охваты падают, нужно адаптироваться за дни, а не недели", "Качество падает когда давите на количество — выбирать между ними невозможно"],
    fears: ["Алгоритм поменяется и охваты упадут в ноль за одну ночь", "Конкурент нанял AI-редакцию и выпускает контент в 6 раз больше"],
    trigger: "Охваты упали на 60% после очередного обновления алгоритма. Контент-план летит, дедлайны горят.",
    solution: "Маркетолог-агент генерит контент-план и драфты 24/7. Было 5 постов/нед — стало 25 без найма.",
    agents: ["📣 Маркетолог", "💻 Разработчик", "📋 Менеджер", "📊 Аналитик"] },
  { emoji: "🏭", name: "Производство", who: "Директор малого/среднего производства, 10-200 человек",
    hero: "Клиент вернул партию — убыток 800к и подорванное доверие",
    pains: ["Простой оборудования — каждый час = 50к потерь, а мониторинга нет", "Брак не отслеживается до отгрузки — узнаёте когда клиент возвращает", "Склад — хаос: пересортица, списания, неучтёнка, закупки сырья наугад"],
    fears: ["Партия брака уйдёт ключевому клиенту — потеряете контракт на 10М", "Конкуренты ставят MES-системы, а вы на бумажках"],
    trigger: "Клиент вернул партию из-за брака. Убыток 800к. Мастер смены скрывал проблему чтобы не портить отчёт.",
    solution: "Агент по запасам считает склад в реальном времени. Аналитик мониторит брак. Предотвращение одного возврата окупает Mary на год.",
    agents: ["📦 Складской", "📊 Аналитик", "📋 Менеджер", "🧮 Бухгалтер"] },
  { emoji: "🤝", name: "Услуги", who: "Эксперт-практик: консультант, врач, тренер, 1-50 человек",
    hero: "Заболели на неделю — потеряли 3 клиентов и 200к выручки",
    pains: ["Вы = бизнес. Клиенты ценят только ваше время, а его 24 часа в сутках", "Сам продаёте, консультируете, считаете, управляете — масштабироваться невозможно", "Чтобы нанять помощника нужно 100к/мес, которых нет — замкнутый круг"],
    fears: ["Уйдёте в отпуск на 2 недели — бизнес встанет, клиенты разбегутся", "Конкуренты ставят ботов и обрабатывают заявки 24/7, а вы спите"],
    trigger: "Заболели на неделю. Потеряли 3 клиентов и 200к выручки. Поняли что бизнес без вас не работает.",
    solution: "Менеджер-агент ведёт клиентов 24/7. Маркетолог генерит лиды. Команда агентов за 990₽/нед вместо помощника за 100к/мес.",
    agents: ["📋 Менеджер", "📣 Маркетолог", "🧮 Бухгалтер", "⚖️ Юрист"] },
  { emoji: "🎪", name: "Event", who: "Ивент-продюсер или владелец агентства, 2-15 человек",
    hero: "Кейтеринг отменился за 2 дня до ивента на 200 человек",
    pains: ["200+ задач на каждый ивент — что-то всегда забывается в последний момент", "Подрядчики срывают — нет плана Б, бюджет плывёт на 20-30% от сметы", "5 ивентов параллельно — путаете подрядчиков, дедлайны, клиентов"],
    fears: ["В день мероприятия что-то критичное пойдёт не так — репутация на кону", "Крупные агентства используют PM-системы, а вы в чатах и заметках"],
    trigger: "Кейтеринг отменился за 2 дня до ивента на 200 человек. Отчёт для клиента собираете 3 дня из хаоса.",
    solution: "Менеджер-агент ведёт чек-лист каждого ивента. Бухгалтер контролирует бюджет в реальном времени. Отчёт — за 45 секунд.",
    agents: ["📋 Менеджер", "🧮 Бухгалтер", "📣 Маркетолог", "📊 Аналитик"] },
];

function SphereLanding({ sphereIdx, onBack, onScan, onLogin }) {
  const s = SPHERES[sphereIdx];
  const [url, setUrl] = useState("");
  return (
    <div style={{ background: V.bg, fontFamily: V.sans }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px", background: V.white, borderBottom: "1px solid " + V.border, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: V.serif, fontSize: 22, fontWeight: 500, cursor: "pointer" }} onClick={onBack}>Mary<em style={{ fontStyle: "italic", color: V.accent }}>.</em></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, border: "1.5px solid " + V.border2, background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: V.sans, color: V.ink }}>← Назад</button>
          <Btn variant="outline" onClick={onLogin}>Войти</Btn>
        </div>
      </nav>

      {/* Hero with audit form */}
      <div style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>{s.emoji}</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Mary для {s.name}</div>
          <h1 style={{ fontFamily: V.serif, fontSize: 42, fontWeight: 500, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 16 }}>{s.hero}</h1>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 32 }}>{s.who}</p>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 8, background: V.white, border: "1.5px solid " + V.border, borderRadius: 8, padding: "6px 6px 6px 22px", boxShadow: V.shadow }}>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ссылка на ваш сайт..." style={{ flex: 1, border: "none", background: "none", outline: "none", padding: "8px 0", fontSize: 14, fontFamily: V.sans }} />
              <Btn onClick={() => onScan(url || "yoursite.com")}>Проверить бесплатно</Btn>
            </div>
            <p style={{ fontSize: 12, color: V.muted2, marginTop: 10 }}>30 секунд. Без регистрации. Без карты.</p>
          </div>
        </div>
      </div>

      {/* Боли */}
      <div style={{ padding: "60px 32px", background: V.white }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Знакомо?</div>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 32 }}>Боли, о которых вы не говорите вслух</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {s.pains.map((p, i) => (
              <div key={i} style={{ padding: "20px 24px", borderRadius: V.rLg, border: "1.5px solid " + V.border, background: V.bg, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: V.accent, fontWeight: 700, fontSize: 18, flexShrink: 0, marginTop: 2 }}>✕</span>
                <div style={{ fontSize: 15, color: V.ink2, lineHeight: 1.6 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Страхи и FOMO */}
      <div style={{ padding: "60px 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.warm, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Что не даёт спать</div>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 32 }}>Страхи фаундера</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {s.fears.map((f, i) => (
              <div key={i} style={{ padding: "20px 24px", borderRadius: V.rLg, border: "1.5px solid " + V.border, background: V.white }}>
                <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>{i === 0 ? "😰" : "⚡"}</span>
                <div style={{ fontSize: 14, color: V.ink2, lineHeight: 1.6 }}>{f}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Триггер */}
      <div style={{ padding: "60px 32px", background: V.ink }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Последняя капля</div>
          <p style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 24 }}>{s.trigger}</p>
          <div style={{ width: 60, height: 2, background: V.pink, margin: "0 auto 24px", borderRadius: 8 }} />
          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6 }}>{s.solution}</p>
        </div>
      </div>

      {/* Агенты для этой сферы */}
      <div style={{ padding: "60px 32px", background: V.white }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>Команда Mary для {s.name}</h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {s.agents.map((a, i) => (
              <div key={i} style={{ padding: "12px 20px", borderRadius: 8, border: "1.5px solid " + V.border, background: V.bg, fontSize: 14, fontWeight: 600, color: V.ink }}>{a}</div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => onScan("yoursite.com")} style={{ background: V.ink, color: "#fff", border: "none", borderRadius: 8, padding: "15px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: V.sans }}>Попробовать бесплатно →</button>
            <p style={{ fontSize: 12, color: V.muted2, marginTop: 10 }}>30 секунд. Без регистрации.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [scr, setScr] = useState("landing");
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [probIdx, setProbIdx] = useState(0);
  const [sphereIdx, setSphereIdx] = useState(0);
  function startScan(u) { setUrl(u); setScanning(true); }
  function go(s) { setScr(s); }
  return (
    <div>
      {scanning && <ScanOverlay url={url} onГотово={() => { setScanning(false); go("problems"); }} />}
      {scr === "landing" && <Landing onScan={startScan} onLogin={() => go("urlinput")} onSphere={(i) => { setSphereIdx(i); go("sphere"); }} />}
      {scr === "sphere" && <SphereLanding sphereIdx={sphereIdx} onBack={() => go("landing")} onScan={startScan} onLogin={() => go("urlinput")} />}
      {scr === "urlinput" && <UrlInput onScan={startScan} onSurvey={() => go("survey")} onBack={() => go("landing")} />}
      {scr === "survey" && <Survey onГотово={() => go("problems")} onBack={() => go("urlinput")} />}
      {scr === "problems" && <Problems url={url} onPick={(i) => { setProbIdx(i); go("chat"); }} onBack={() => go("landing")} />}
      {scr === "chat" && <ChatScreen problemIdx={probIdx} onContinue={() => go("meet")} onBack={() => go("problems")} onSwitch={(i) => setProbIdx(i)} />}
      {scr === "meet" && <MeetTeam onContinue={() => go("onboard")} />}
      {scr === "onboard" && <Onboard onГотово={() => go("dash")} />}
      {scr === "dash" && <Dash onReset={() => go("landing")} />}
    </div>
  );
}

---

# ТЕКУЩИЙ КОД (mary-landing.jsx)
```jsx
import { useState, useEffect, useRef } from "react";

const V = {
  bg: "#FAFAFA", white: "#FFFFFF", ink: "#262633", ink2: "#444444",
  muted: "#999999", muted2: "#CCCCCC", border: "#EBEBEB", border2: "#DCDCDC",
  surface2: "#F5F5F5", pink: "#F0786A", green: "#0EA5E9", warm: "#FF6B00",
  accent: "#6C5CE7", accentBg: "rgba(108,92,231,.06)",
  greenBg: "rgba(14,165,233,.06)", pinkBg: "rgba(240,120,106,.06)",
  r: 10, rLg: 12, rSm: 6,
  shadow: "0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)",
  shadowSm: "0 1px 2px rgba(0,0,0,.03)",
  shadowLg: "0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
  serif: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
};
var PLATFORM_CHAT_IMG = "data:image/webp;base64,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";
var PLATFORM_DATA_IMG = "data:image/webp;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vGJPU39v7wKgU4k9Tf2/vPrd38Sov0QD6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";
// Dog images for block 2
var DOG_1002 = "data:image/webp;base64,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";
var DOG_1004 = "data:image/webp;base64,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";
var DOG_1006 = "data:image/webp;base64,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";
var DOG_1008 = "data:image/webp;base64,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";
var DOG_1011 = "data:image/webp;base64,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";


function Nav({ step, onBack, rightEl }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px", background: V.white, borderBottom: "1px solid " + V.border, position: "sticky", top: 0, zIndex: 100, fontFamily: V.sans }}>
      <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 700 }}>Mary<em style={{ fontStyle: "italic", color: V.accent }}>.</em></div>
      <div></div>
      <div style={{ minWidth: 80, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "1px solid " + V.border, background: V.white, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: V.sans, color: V.ink }}>← Назад</button>}
        {rightEl}
      </div>
    </nav>
  );
}

function Btn({ children, onClick, variant, full, lg }) {
  let bg = V.accent, color = "#fff", border = "none";
  if (variant === "outline") { bg = V.white; color = V.ink; border = "1px solid " + V.border; }
  if (variant === "dark") { bg = V.ink; color = "#fff"; }
  return (<button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: full ? "center" : undefined, gap: 8, padding: lg ? "14px 32px" : "10px 22px", borderRadius: 8, border, background: bg, color, cursor: "pointer", fontFamily: V.sans, fontSize: lg ? 15 : 14, fontWeight: 600, transition: "all .15s", width: full ? "100%" : undefined, boxShadow: variant === "outline" ? "none" : V.shadow }}>{children}</button>);
}

/* ═══ AGENTS DEMO (для лендинга) ═══ */
function AgentsDemo({ onTry }) {
  const [active, setActive] = useState(0);
  const agents = [
    {
      id: "smm", icon: "📣", name: "SMM-менеджер",
      sidebar: ["Контент-план", "Посты", "Аналитика", "Reels"],
      chatMsgs: [
        { from: "agent", text: "Привет! Я проанализировал конкурентов и подготовил контент-план на апрель." },
        { from: "agent", text: "12 постов, 8 Reels, 4 Stories-серии. Оптимальное время: ВТ и ЧТ в 12:00." },
        { from: "user", text: "Покажи аналитику за прошлую неделю" },
        { from: "agent", text: "Охват +47%, лучший пост: карусель про закулисье (+2.3к лайков). Вовлечённость 4.2% — выше среднего." },
      ],
      tasks: [
        { title: "Контент-план апрель", status: "done" },
        { title: "12 текстов для постов", status: "progress", pct: 60 },
        { title: "Съёмка Reels (8 шт)", status: "new" },
      ],
      tokens: 4200,
    },
    {
      id: "designer", icon: "🎨", name: "Дизайнер",
      sidebar: ["Макеты", "Сторис", "UI-кит", "Бренд"],
      chatMsgs: [
        { from: "agent", text: "Готовы 15 сторис-шаблонов для FitLife. Экспортированы в Figma." },
        { from: "user", text: "Сделай ещё 3 варианта обложки для Reels" },
        { from: "agent", text: "Готово! 3 варианта в папке «FitLife / Reels». Использовал фирменные цвета + новый шрифт." },
      ],
      tasks: [
        { title: "15 шаблонов Stories", status: "done" },
        { title: "3 обложки Reels", status: "done" },
        { title: "Каталог мебели Лофт", status: "progress", pct: 30 },
      ],
      tokens: 3800,
    },
    {
      id: "dev", icon: "💻", name: "Разработчик",
      sidebar: ["Задачи", "Баги", "Деплой", "Мониторинг"],
      chatMsgs: [
        { from: "agent", text: "Лендинг ClinicPro готов на 80%. Hero + 5 секций. Lighthouse: Performance 96." },
        { from: "user", text: "Добавь форму записи с отправкой в Telegram" },
        { from: "agent", text: "Сделано. Форма → Telegram-бот @clinicpro_bot. Тестовое сообщение отправлено." },
      ],
      tasks: [
        { title: "Лендинг ClinicPro", status: "progress", pct: 80 },
        { title: "Форма → Telegram", status: "done" },
        { title: "Интеграция с CRM", status: "new" },
      ],
      tokens: 1200,
    },
    {
      id: "acc", icon: "🧮", name: "Бухгалтер",
      sidebar: ["Расходы", "P&L", "Подписки", "Налоги"],
      chatMsgs: [
        { from: "agent", text: "Проанализировал подписки. Нашёл 3 сервиса без использования." },
        { from: "agent", text: "Figma Business ×2 лишних — 18к₽/мес. Miro — 12к₽/мес. Zoom Pro — 8к₽/мес." },
        { from: "user", text: "Сделай P&L за март" },
        { from: "agent", text: "Готово. Выручка 1.24М₽, расходы 890к₽, прибыль 350к₽. Отчёт в Google Sheets." },
      ],
      tasks: [
        { title: "Аудит подписок", status: "done" },
        { title: "P&L за март", status: "done" },
        { title: "P&L за апрель", status: "new" },
      ],
      tokens: 1600,
    },
    {
      id: "pm", icon: "📋", name: "Менеджер",
      sidebar: ["Проекты", "Дедлайны", "Команда", "Отчёт"],
      chatMsgs: [
        { from: "agent", text: "Статус 5 проектов: 2 в графике, 2 с рисками. Дизайнер перегружен на 130%." },
        { from: "user", text: "Что горит?" },
        { from: "agent", text: "ClinicPro — дедлайн пятница, лендинг 80%. FitLife — дизайнер не успевает, рекомендую передать каталог Лофт копирайтеру." },
      ],
      tasks: [
        { title: "Еженедельный отчёт", status: "done" },
        { title: "Трекинг дедлайнов", status: "progress", pct: 100 },
        { title: "Перераспределение задач", status: "new" },
      ],
      tokens: 2100,
    },
    {
      id: "lawyer", icon: "⚖️", name: "Юрист",
      sidebar: ["Договоры", "Риски", "Шаблоны", "152-ФЗ"],
      chatMsgs: [
        { from: "agent", text: "Проверил 3 договора. В договоре с ЭкоМаркет — нет лимита правок. Риск бесконечной работы." },
        { from: "user", text: "Исправь и пришли новый вариант" },
        { from: "agent", text: "Готово. Добавил: лимит 3 раунда правок, неустойка 0.1%/день, срок оплаты 5 дней. Файл прикреплён." },
      ],
      tasks: [
        { title: "Проверка 3 договоров", status: "done" },
        { title: "Исправление договора ЭкоМаркет", status: "done" },
        { title: "NDA с подрядчиком", status: "new" },
      ],
      tokens: 800,
    },
  ];

  const cur = agents[active];
  const stColor = (s) => s === "done" ? V.green : s === "progress" ? V.warm : V.muted2;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)", background: V.white, fontFamily: V.sans }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(32px, 4.2vw, 60px)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: V.accent, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Посмотрите как это работает</p>
          <h2 style={{ fontSize: 42, fontWeight: 400, letterSpacing: "-1.5px" }}>Каждый агент — конкретный результат</h2>
        </div>

        {/* icon tabs — monochrome, active = pill button */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 0", borderBottom: "1px solid " + V.border }}>
          {agents.map((a, i) => {
            const on = i === active;
            return (
              <button key={i} onClick={() => setActive(i)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: on ? "8px 16px" : "8px 10px",
                borderRadius: 8,
                border: on ? "1px solid " + V.border : "1px solid transparent",
                background: on ? V.white : "transparent",
                boxShadow: on ? V.shadow : "none",
                fontSize: 14, fontWeight: on ? 600 : 400,
                color: on ? V.ink : V.muted,
                cursor: "pointer", fontFamily: V.sans,
              }}>
                {on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: V.ink, flexShrink: 0 }} />}
                {on ? a.name : <span style={{ fontSize: 16, opacity: 0.4, filter: "grayscale(100%)" }}>{a.icon}</span>}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={() => onTry("yoursite.com")} style={{ padding: "8px 20px", borderRadius: 8, background: V.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: V.sans }}>Попробовать →</button>
        </div>

        {/* SERVICE UI PREVIEW */}
        <div style={{ border: "1px solid " + V.border, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden", display: "flex", height: 480 }}>

          {/* mini sidebar */}
          <div style={{ width: 180, background: V.white, borderRight: "1px solid " + V.border, padding: "16px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, padding: "0 8px" }}>Mary<span style={{ color: V.accent }}>.</span></div>
            {cur.sidebar.map((item, i) => (
              <div key={i} style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 2, fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? V.ink : V.muted, background: i === 0 ? V.surface2 : "transparent" }}>{item}</div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", borderTop: "1px solid " + V.border, marginTop: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: V.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>М</div>
              <div style={{ fontSize: 11, color: V.muted }}>Мария</div>
            </div>
          </div>

          {/* chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid " + V.border }}>
            {/* chat header */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid " + V.border, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{cur.icon}</span>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{cur.name}</div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: V.green }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: V.green }} />Онлайн</div>
            </div>
            {/* messages */}
            <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", background: V.bg }}>
              {cur.chatMsgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  {m.from === "user" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ background: V.ink, color: "#fff", borderRadius: 12, padding: "8px 14px", fontSize: 13, maxWidth: "70%", lineHeight: 1.5 }}>{m.text}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: V.ink2, lineHeight: 1.6, maxWidth: "85%" }}>{m.text}</div>
                  )}
                </div>
              ))}
            </div>
            {/* input */}
            <div style={{ padding: "10px 18px", borderTop: "1px solid " + V.border, background: V.white }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, border: "1px solid " + V.border, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: V.muted, background: V.bg }}>Написать {cur.name}...</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: V.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>↑</div>
              </div>
            </div>
          </div>

          {/* right panel — tokens + tasks */}
          <div style={{ width: 240, padding: "16px", overflowY: "auto", background: V.white, flexShrink: 0 }}>
            {/* tokens */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Токены</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{cur.tokens.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>из 10 000</div>
              <div style={{ height: 3, background: V.surface2, borderRadius: 8, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.min(cur.tokens / 100, 100) + "%", background: V.accent, borderRadius: 8 }} />
              </div>
            </div>

            {/* tasks */}
            <div style={{ fontSize: 10, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Задачи</div>
            {cur.tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < cur.tasks.length - 1 ? "1px solid " + V.border : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: stColor(t.status), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.status === "done" ? V.muted : V.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                </div>
                {t.pct !== undefined && t.status === "progress" && (
                  <div style={{ width: 36, height: 3, background: V.surface2, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: t.pct + "%", background: V.warm, borderRadius: 8 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 1. ЛЕНДИНГ — Equip style ═══ */
function Landing({ onScan, onLogin, onSphere }) {
  const [url, setUrl] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [scrollDir, setScrollDir] = useState("down");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState(null);
  const [spheresOpen, setSpheresOpen] = useState(false);
  const lastScrollY = useRef(0);
  const agentsRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      var y = window.scrollY;
      if (y > lastScrollY.current + 5) setScrollDir("down");
      else if (y < lastScrollY.current - 5) setScrollDir("up");
      lastScrollY.current = y;
      setScrollY(y);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const agents = [
    { name: "Маркетолог", breed: "🐕‍🦺", role: "Аналитика, реклама, воронки, трафик, SEO", color: "#FF6B4A" },
    { name: "Дизайнер", breed: "🦮", role: "Макеты, баннеры, UI/UX, визуал", color: "#FFD93D" },
    { name: "Разработчик", breed: "🐕", role: "Код, сайты, API, интеграции, деплой", color: "#4A90FF" },
    { name: "Копирайтер", breed: "🐩", role: "Тексты, скрипты продаж, контент-планы", color: "#E8A4FF" },
    { name: "Mary — Директор", breed: "🐾", role: "Управляет всей командой агентов", color: "#6C5CE7" },
  ];

  const pains = [
    { emoji: "😰", title: "Делаю всё сам", desc: "Маркетинг, дизайн, тексты, сайт — вы работаете за пятерых" },
    { emoji: "💸", title: "Фрилансеры дорого", desc: "Команда = 4000$/мес. И ещё нужно управлять" },
    { emoji: "🐌", title: "Всё медленно", desc: "Неделя на дизайн. 3 дня на текст. Конкуренты уходят" },
    { emoji: "🔥", title: "Реклама сгорает", desc: "80% трафика — платное. ROI падает каждый месяц" },
  ];

  return (
    <div style={{ background: V.white, fontFamily: V.sans, color: V.ink }}>

      {/* ═══ BLOCK 1: HERO — Figma 1979-1945 ═══ */}

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px clamp(20px, 6.9vw, 100px)",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 150,
        background: "rgba(255,255,255,.65)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)",
        transform: scrollDir === "down" && scrollY > 100 ? "translateY(-100%)" : "translateY(0)",
        transition: "transform .4s cubic-bezier(.22,1,.36,1)",
      }}>
        <div><svg width="116" height="37" viewBox="0 0 116 37" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="5.10298" cy="17.6292" rx="5.10298" ry="14.845" fill="#262633"/><ellipse cx="13.4533" cy="17.6285" rx="5.10298" ry="17.6285" fill="#262633"/><ellipse cx="22.7069" cy="20.2255" rx="5.10298" ry="15.309" transform="rotate(3.41655 22.7069 20.2255)" fill="#262633"/><path d="M37.2481 30.4053V12.157H41.5175V15.0836H41.6208C41.9995 14.0851 42.6365 13.2875 43.5317 12.6907C44.4269 12.0824 45.477 11.7783 46.6821 11.7783C47.5314 11.7783 48.2946 11.9275 48.9717 12.2259C49.6489 12.5128 50.2227 12.9317 50.6933 13.4826C51.1753 14.022 51.5253 14.6819 51.7434 15.4624H51.8295C52.1279 14.7049 52.5525 14.0565 53.1034 13.517C53.6658 12.9661 54.32 12.5415 55.066 12.2431C55.8234 11.9332 56.6383 11.7783 57.5105 11.7783C58.7156 11.7783 59.76 12.0365 60.6437 12.553C61.5389 13.058 62.2333 13.7695 62.7268 14.6877C63.2318 15.5944 63.4842 16.6617 63.4842 17.8897V30.4053H59.1976V18.9399C59.1976 18.1824 59.0714 17.5397 58.8189 17.0117C58.5664 16.4838 58.1991 16.0821 57.7171 15.8067C57.2351 15.5312 56.6383 15.3935 55.9267 15.3935C55.2381 15.3935 54.6298 15.5542 54.1019 15.8755C53.5854 16.1854 53.178 16.6215 52.8796 17.1839C52.5927 17.7463 52.4492 18.3947 52.4492 19.1292V30.4053H48.2831V18.7161C48.2831 18.0275 48.1511 17.4364 47.8872 16.9429C47.6232 16.4494 47.2502 16.0706 46.7682 15.8067C46.2861 15.5312 45.7123 15.3935 45.0466 15.3935C44.358 15.3935 43.7497 15.5599 43.2218 15.8928C42.6939 16.2256 42.275 16.6789 41.9651 17.2528C41.6667 17.8266 41.5175 18.4865 41.5175 19.2325V30.4053H37.2481ZM72.3157 30.7151C71.1106 30.7151 70.0433 30.4856 69.1137 30.0265C68.1955 29.556 67.4782 28.9075 66.9617 28.0812C66.4568 27.2434 66.2043 26.2851 66.2043 25.2062V25.1718C66.2043 24.0815 66.474 23.1519 67.0134 22.3829C67.5643 21.6025 68.3562 20.9885 69.3891 20.5409C70.422 20.0818 71.673 19.8064 73.142 19.7146L80.1143 19.2842V22.1247L73.7446 22.5207C72.6887 22.5895 71.8796 22.842 71.3172 23.2781C70.7549 23.7142 70.4737 24.2938 70.4737 25.0169V25.0341C70.4737 25.7801 70.7549 26.3711 71.3172 26.8073C71.8911 27.2319 72.6485 27.4442 73.5896 27.4442C74.416 27.4442 75.1505 27.2778 75.7932 26.945C76.4474 26.6122 76.9638 26.1588 77.3426 25.585C77.7213 25.0111 77.9107 24.3627 77.9107 23.6397V18.1652C77.9107 17.247 77.618 16.524 77.0327 15.996C76.4589 15.4566 75.6268 15.1869 74.5365 15.1869C73.5265 15.1869 72.7174 15.405 72.1091 15.8411C71.5009 16.2658 71.1221 16.8166 70.9729 17.4938L70.9385 17.6487H66.979L66.9962 17.4421C67.088 16.3633 67.4495 15.3992 68.0807 14.55C68.712 13.6892 69.5842 13.0121 70.6975 12.5185C71.8222 12.025 73.1535 11.7783 74.6914 11.7783C76.2178 11.7783 77.5377 12.0308 78.6509 12.5358C79.7757 13.0407 80.6422 13.7466 81.2505 14.6532C81.8702 15.5599 82.1801 16.6273 82.1801 17.8553V30.4053H77.9107V27.5992H77.8074C77.4631 28.2304 77.0155 28.7813 76.4646 29.2518C75.9137 29.7224 75.2825 30.0839 74.5709 30.3364C73.8708 30.5889 73.1191 30.7151 72.3157 30.7151ZM85.6576 30.4053V12.157H89.927V15.3074H90.0303C90.3057 14.2057 90.805 13.3449 91.528 12.7251C92.2625 12.0939 93.1577 11.7783 94.2136 11.7783C94.4776 11.7783 94.7301 11.7955 94.9711 11.8299C95.2121 11.8644 95.4129 11.9045 95.5736 11.9504V15.8239C95.4015 15.755 95.1547 15.6976 94.8334 15.6517C94.5235 15.6058 94.1849 15.5829 93.8177 15.5829C93.0143 15.5829 92.3199 15.7493 91.7346 16.0821C91.1493 16.4035 90.7017 16.8798 90.3918 17.511C90.0819 18.1422 89.927 18.9112 89.927 19.8178V30.4053H85.6576ZM100.807 36.4651C100.394 36.4651 99.9865 36.4421 99.5848 36.3962C99.1946 36.3618 98.8675 36.3216 98.6035 36.2757V33.022C98.7642 33.045 98.965 33.0736 99.206 33.1081C99.4471 33.1425 99.7225 33.1597 100.032 33.1597C100.859 33.1597 101.513 33.0163 101.995 32.7293C102.477 32.4539 102.856 31.9317 103.131 31.1627L103.389 30.4225L96.8303 12.157H101.496L106.041 27.6508L105.386 26.7556H106.299L105.645 27.6508L110.189 12.157H114.7L108.124 31.025C107.665 32.3563 107.108 33.418 106.454 34.2099C105.8 35.0132 105.008 35.5871 104.078 35.9314C103.16 36.2872 102.07 36.4651 100.807 36.4651Z" fill="#262633"/></svg></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div onClick={function() { setMenuOpen(true); }} style={{ width: 48, height: 48, borderRadius: "clamp(10px, 1.1vw, 16px)", background: "rgba(38,38,51,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 18H4M20 12H4M20 6H4" stroke="#262633" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <button onClick={onLogin} style={{ width: 120, height: 48, borderRadius: "clamp(10px, 1.1vw, 16px)", background: "#262633", color: "#fff", border: "none", fontSize: 16, fontWeight: 500, cursor: "pointer", fontFamily: V.sans }}>Войти</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "hidden", paddingTop: 88 }}>

        {/* Dogs around hero */}
        {(() => {
          var _h = useState(null); var hov = _h[0]; var setHov = _h[1];
          var labelSize = "clamp(70px, 9vw, 130px)";
          var dogs = [
            { id: "corgi", img: "data:image/webp;base64,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",
              x: "6%", y: "45%", h: "clamp(82px, 10.8vw, 155px)", labelImg: null,
              desc: "Приведёт клиентов из соцсетей" },
            { id: "mary", img: "data:image/webp;base64,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",
              x: "38%", y: "56%", h: "clamp(80px, 10.4vw, 150px)", labelImg: "data:image/webp;base64,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", labelSide: "left",
              desc: "Управляет всей командой агентов" },
            { id: "dalmatian", img: "data:image/webp;base64,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",
              x: "72%", y: "42%", h: "clamp(80px, 10.4vw, 150px)", labelImg: null,
              desc: "Сделает макеты и баннеры" },
            { id: "doberman", img: "data:image/webp;base64,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",
              x: "22%", y: "72%", h: "clamp(77px, 10.1vw, 145px)", labelImg: null,
              desc: "Проверит договоры за минуту" },
            { id: "samoyed", img: "data:image/webp;base64,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",
              x: "58%", y: "75%", h: "clamp(72px, 9.4vw, 135px)", labelImg: null,
              desc: "Ответит клиентам 24/7" },
          ];
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              {dogs.map(function(d) {
                var isHov = hov === d.id;
                return (
                  <div key={d.id}
                    onMouseEnter={function(){setHov(d.id)}}
                    onMouseLeave={function(){setHov(null)}}
                    style={{ position: "absolute", left: d.x, top: d.y, cursor: "pointer" }}>
                    {d.labelImg && (
                      <img src={d.labelImg} style={{
                        position: "absolute",
                        right: d.labelSide === "left" ? "100%" : "auto",
                        left: d.labelSide === "right" ? "100%" : "auto",
                        top: -10, marginRight: d.labelSide === "left" ? -10 : 0,
                        width: labelSize, height: "auto", pointerEvents: "none",
                      }} />
                    )}
                    <img src={d.img} draggable={false} style={{
                      height: d.h, width: "auto",
                      transition: "transform .3s ease",
                      transform: isHov ? "scale(1.08)" : "scale(1)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: -12, left: "50%",
                      transform: "translateX(-50%)" + (isHov ? " translateY(0)" : " translateY(4px)"),
                      background: "#fff", border: "1.5px solid #EBEBEB", borderRadius: "clamp(8px, 0.8vw, 12px)",
                      padding: "clamp(6px, 0.7vw, 10px) clamp(10px, 1.1vw, 16px)",
                      fontSize: "clamp(11px, 0.9vw, 14px)", color: "#262633",
                      whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
                      opacity: isHov ? 1 : 0, transition: "opacity .2s ease, transform .2s ease",
                      pointerEvents: "none",
                    }}>
                      {d.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Animated click pills */}
        {(() => {
          var _s = useState({ idx: 0, phase: 0 }); var state = _s[0]; var setState = _s[1];
          var refId = useRef(null);
          var pills = [
            { text: "Работают 24/7", px: 68, py: 40, side: 1 },
            { text: "Не срывают дедлайны", px: 4, py: 48, side: -1 },
            { text: "Делают быстро", px: 72, py: 56, side: 1 },
            { text: "Контролируют качество сами", px: 2, py: 65, side: -1 },
            { text: "Помнят всё", px: 70, py: 75, side: 1 },
            { text: "Дешевле команды x10", px: 4, py: 84, side: -1 },
          ];
          var total = pills.length;

          useEffect(function() {
            if (refId.current) clearTimeout(refId.current);
            function run(idx, phase) {
              setState({ idx: idx, phase: phase });
              var delays = [300, 200, 800, 300];
              if (phase < 3) {
                refId.current = setTimeout(function() { run(idx, phase + 1); }, delays[phase]);
              } else {
                refId.current = setTimeout(function() { run((idx + 1) % total, 0); }, delays[phase]);
              }
            }
            run(0, 0);
            return function() { clearTimeout(refId.current); };
          }, []);

          var p = pills[state.idx];
          var ph = state.phase;
          var isRight = p.side === 1;
          var cursorSize = "clamp(22px, 3vw, 44px)";

          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
              {/* Cursor - tip points into corner-0 of pill */}
              <div key={"c" + state.idx} style={{
                position: "absolute",
                left: isRight ? "calc(" + p.px + "% - " + cursorSize + " + 4px)" : "calc(" + p.px + "% + " + cursorSize + " - 4px)",
                top: "calc(" + p.py + "% - " + cursorSize + " + 4px)",
                transform: (isRight ? "" : "scaleX(-1) ") + (ph === 1 ? "scale(0.82)" : "scale(1)"),
                opacity: ph === 3 ? 0 : 1,
                transition: "opacity .25s ease, transform .15s ease",
              }}>
                <svg width={cursorSize} height={cursorSize} viewBox="0 0 55 55" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0376 47.9536C9.61911 48.1258 9.15906 48.1702 8.71539 48.0813C8.27173 47.9925 7.8643 47.7742 7.54446 47.4541C7.22463 47.1341 7.00671 46.7265 6.91817 46.2827C6.82963 45.839 6.87444 45.379 7.04693 44.9607L23.0886 6.00233C23.2604 5.58494 23.5516 5.22758 23.9258 4.97507C24.2999 4.72257 24.7403 4.58617 25.1916 4.58299C25.643 4.57981 26.0852 4.70998 26.4629 4.95719C26.8405 5.20439 27.1368 5.55761 27.3144 5.97254L33.4676 20.3298C33.6993 20.8704 34.1301 21.3012 34.6707 21.533L49.028 27.6861C49.4429 27.8638 49.7961 28.16 50.0433 28.5376C50.2905 28.9153 50.4207 29.3575 50.4175 29.8089C50.4143 30.2603 50.2779 30.7006 50.0254 31.0747C49.7729 31.4489 49.4156 31.7401 48.9982 31.9119L10.0376 47.9536Z" fill="#262633"/>
                </svg>
              </div>
              {/* Pill - borderRadius flips for left side */}
              <div key={"p" + state.idx} style={{
                position: "absolute", left: p.px + "%", top: p.py + "%",
                padding: "clamp(4px, 0.6vw, 8px) clamp(8px, 1.1vw, 16px)",
                borderRadius: isRight
                  ? "0 clamp(40px, 5.6vw, 80px) clamp(40px, 5.6vw, 80px) clamp(10px, 1.4vw, 20px)"
                  : "clamp(40px, 5.6vw, 80px) 0 clamp(10px, 1.4vw, 20px) clamp(40px, 5.6vw, 80px)",
                background: "#262633", color: "#fff",
                fontSize: "clamp(12px, 1.4vw, 20px)", fontWeight: 500,
                height: "clamp(22px, 3.2vw, 46px)",
                display: "inline-flex", alignItems: "center",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif",
                opacity: ph >= 2 ? (ph === 3 ? 0 : 1) : 0,
                transform: ph === 2 ? "scale(1)" : "scale(0.92)",
                transition: "opacity .25s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.22,1,.36,1)",
              }}>
                {p.text}
              </div>
            </div>
          );
        })()}

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 1012, padding: "clamp(32px, 4.2vw, 60px) clamp(20px, 6.9vw, 100px) 0" }}>
          {/* Headline with inline dog icons */}
          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 80px)", fontWeight: 500, lineHeight: 1.1, color: "#262633", marginBottom: "clamp(16px, 2.1vw, 30px)" }}>
            {"Команда ии-агентов,"}<br />
            {"которая работает за вас"}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: "clamp(18px, 2.6vw, 38px)", fontWeight: 500, color: "rgba(42,40,48,0.3)", marginBottom: "clamp(20px, 2.8vw, 40px)", lineHeight: 1.4, maxWidth: 800 }}>
            {"Вставьте ссылку — подберём решение"}
          </p>

          {/* Input */}
          <div style={{ maxWidth: "clamp(300px, 37.4vw, 538px)", margin: "0 auto clamp(16px, 1.7vw, 24px)", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(38,38,51,0.03)", border: "none", borderRadius: "clamp(16px, 1.6vw, 23px)", padding: "8px 16px 8px 23px", height: "clamp(56px, 5.5vw, 79px)" }}>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: "clamp(16px, 1.8vw, 26px)", fontWeight: 500, fontFamily: V.sans, color: "#262633" }} />
              <div onClick={() => onScan(url || "yoursite.com")} style={{ width: 47, height: 47, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: url ? "pointer" : "default", opacity: url ? 1 : 0, transition: "opacity .2s ease", pointerEvents: url ? "auto" : "none" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M14 6l6 6-6 6" stroke="#262633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══ BLOCK 2: Процесс ═══ */}
      {(() => {
        const revealRef2 = useRef(null);
        const [revealP, setRevealP] = useState(0);

        useEffect(() => {
          function handleScroll() {
            if (!revealRef2.current) return;
            var rect = revealRef2.current.getBoundingClientRect();
            var p = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - rect.top) / (rect.height * 0.5)));
            setRevealP(p);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        var words = [
          { text: "Скажите" },
          { text: "что" },
          { text: "нужно" },
          { text: "—" },
          { text: "Mary" },
          { text: "разберётся" },
          { text: "кому" },
          { text: "поручить," },
          { text: "команда" },
          { text: "сделает," },
          { text: "а" },
          { text: "вам" },
          { text: "останется" },
          { text: "только" },
          { text: "посмотреть" },
          { text: "готовое" },
        ];

        var totalWords = words.length;
        var revealedCount = Math.floor(revealP * (totalWords + 2));

        return (
          <div ref={revealRef2} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(60px, 9.7vw, 140px) clamp(20px, 6.9vw, 100px)", background: V.white, position: "relative", overflow: "hidden" }}>
            {/* Dogs with name tags */}
            <div style={{ position: "absolute", top: "8%", left: "5%" }}>
              <img src={DOG_1002} style={{ width: "clamp(80px, 10vw, 140px)" }} />
              <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, background: V.ink, color: "#fff", fontSize: 11, fontWeight: 500, display: "inline-block" }}>Аналитик</div>
            </div>
            <div style={{ position: "absolute", top: "6%", right: "8%" }}>
              <img src={DOG_1004} style={{ width: "clamp(70px, 9vw, 120px)" }} />
              <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, background: V.ink, color: "#fff", fontSize: 11, fontWeight: 500, display: "inline-block" }}>Продажник</div>
            </div>
            <div style={{ position: "absolute", bottom: "18%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <img src={DOG_1006} style={{ width: "clamp(70px, 8vw, 110px)" }} />
              <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, background: V.ink, color: "#fff", fontSize: 11, fontWeight: 500, display: "inline-block" }}>Маркетолог</div>
            </div>
            <div style={{ position: "absolute", bottom: "12%", left: "8%" }}>
              <img src={DOG_1008} style={{ width: "clamp(70px, 9vw, 120px)" }} />
              <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, background: V.ink, color: "#fff", fontSize: 11, fontWeight: 500, display: "inline-block" }}>Разработчик</div>
            </div>
            <div style={{ position: "absolute", bottom: "10%", right: "6%" }}>
              <img src={DOG_1011} style={{ width: "clamp(70px, 9vw, 120px)" }} />
              <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, background: V.ink, color: "#fff", fontSize: 11, fontWeight: 500, display: "inline-block" }}>Менеджер</div>
            </div>
            <div style={{ maxWidth: "clamp(320px, 54.2vw, 780px)", margin: "0 auto", textAlign: "center" }}>
              <p style={{ fontSize: "clamp(24px, 3.1vw, 44px)", fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.5px", color: "#262633" }}>
                {words.map(function(w, i) {
                  var revealed = i < revealedCount;
                  return (
                    <span key={i} style={{
                      color: revealed ? "#262633" : "#DCDCDC",
                      transition: "color .4s cubic-bezier(.22,1,.36,1)",
                    }}>{w.text}{" "}</span>
                  );
                })}
              </p>
            </div>
          </div>
        );
      })()}

      

      {/* ═══ BLOCK: Stacking Mac windows — platform screens ═══ */}
      {(() => {
        function MacWindow(props) {
          return (
            <div style={{ borderRadius: "clamp(24px, 3.5vw, 50px)", background: "#F3F3F3", overflow: "hidden", height: "100%" }}>
              {/* Dots only — no gray bar */}
              <div style={{ display: "flex", alignItems: "center", padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
                </div>
              </div>
              <div style={{ height: "calc(100% - 44px)", padding: 20, overflow: "hidden" }}>{props.children}</div>
            </div>
          );
        }

        var cards = [
          { title: "Агенты ведут процесс", img: PLATFORM_CHAT_IMG },
          { title: "Задачи распределяются сами", img: PLATFORM_CHAT_IMG },
          { title: "Ваши данные в одном месте", img: PLATFORM_DATA_IMG },
        ];

        var stackRef = useRef(null);
        var _stp2 = useState(0); var stackP2 = _stp2[0]; var setStackP2 = _stp2[1];
        useEffect(function() {
          function handleScroll() {
            if (!stackRef.current) return;
            var rect = stackRef.current.getBoundingClientRect();
            var scrollable = rect.height - window.innerHeight;
            if (scrollable <= 0) return;
            setStackP2(Math.max(0, Math.min(1, -rect.top / scrollable)));
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return function() { window.removeEventListener("scroll", handleScroll); };
        }, []);
        var activeCard = Math.min(cards.length - 1, Math.floor(stackP2 * cards.length));

        return (
          <div ref={stackRef} style={{ height: (cards.length + 1) * 100 + "vh", position: "relative" }}>
            <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", padding: "clamp(60px, 6.9vw, 100px) clamp(20px, 6.9vw, 100px)" }}>
              {/* Title — fixed at top, changes with scroll */}
              <div style={{ textAlign: "center", marginBottom: "clamp(24px, 2.2vw, 32px)", flexShrink: 0 }}>
                <h2 style={{ fontSize: "clamp(28px, 4.3vw, 62px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1, color: V.ink, transition: "opacity .2s" }}>{cards[activeCard].title}</h2>
              </div>

              {/* Mac window — stacking area */}
              <div style={{ flex: 1, minHeight: 0, position: "relative", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
                {cards.map(function(card, i) {
                  var cardStart = i / cards.length;
                  var cardEnd = (i + 1) / cards.length;
                  // How far this card has progressed into view (0 = not started, 1 = fully in)
                  var cardProgress = Math.max(0, Math.min(1, (stackP2 - cardStart) / (cardEnd - cardStart)));
                  var isVisible = stackP2 >= cardStart;
                  var isPast = stackP2 >= cardEnd;
                  
                  // Smooth translateY: 100% → 0% as cardProgress goes 0 → 1
                  var translateY = isVisible ? (1 - cardProgress) * 100 : 100;
                  // Past cards scale down slightly
                  var scale = isPast ? 0.97 : 1;
                  var yShift = isPast ? -8 : 0;
                  
                  return (
                    <div key={i} style={{
                      position: "absolute", inset: 0,
                      transform: "translateY(" + (isVisible ? (isPast ? yShift + "px" : translateY + "%") : "100%") + ") scale(" + scale + ")",
                      opacity: isVisible ? 1 : 0,
                      zIndex: i + 1,
                    }}>
                      <MacWindow>
                        <img src={card.img} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top left", display: "block", borderRadius: "clamp(20px, 2.8vw, 40px)" }} />
                      </MacWindow>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ BLOCK: Scroll-reveal — Яндекс ID style ═══ */}
      {(() => {
        const sectionRef = useRef(null);
        const [activeIdx, setActiveIdx] = useState(0);

        const items = [
          {
            title: "Работают без вас",
            desc: "Агенты сами распределяют задачи, проверяют друг друга и эскалируют только если нужно ваше решение. Вы получаете готовый результат.",
          },
          {
            title: "Помнят всё о бизнесе",
            desc: "Подключены к вашим файлам, встречам, CRM и мессенджерам. Не нужно каждый раз объяснять контекст — Mary уже знает.",
          },
          {
            title: "Результат, а не текст",
            desc: "Не «советы по улучшению», а готовый артефакт: SEO-аудит, контент-план, макет, отчёт с цифрами. Бери и используй.",
          },
        ];

        var itemCount = items.length;

        useEffect(() => {
          function handleScroll() {
            if (!sectionRef.current) return;
            var rect = sectionRef.current.getBoundingClientRect();
            var scrollable = rect.height - window.innerHeight;
            if (scrollable <= 0) return;
            var scrolled = -rect.top;
            var progress = Math.max(0, Math.min(1, scrolled / scrollable));
            var idx = Math.min(itemCount - 1, Math.floor(progress * itemCount));
            setActiveIdx(idx);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        return (
          <div ref={sectionRef} style={{ height: itemCount * 100 + "vh", position: "relative", background: V.white }}>
            <div style={{
              position: "sticky", top: 0, height: "100vh",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 clamp(20px, 6.9vw, 100px)",
            }}>
              <div style={{ maxWidth: 1240, width: "100%", margin: "0 auto" }}>
                <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 32, textAlign: "center" }}>Это не «очередная нейронка»</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {items.map((item, i) => {
                    var active = i === activeIdx;
                    return (
                      <div key={i} onClick={() => setActiveIdx(i)} style={{
                        padding: "clamp(20px, 1.9vw, 28px) clamp(24px, 2.8vw, 40px)",
                        borderRadius: "clamp(20px, 3.5vw, 50px)",
                        background: active ? "rgba(38,38,51,0.05)" : "transparent",
                        cursor: "pointer",
                        transition: "background .4s cubic-bezier(.4,0,.2,1)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "clamp(20px, 2.8vw, 40px)",
                        alignItems: "center",
                      }}>
                        <div style={{
                          fontSize: "clamp(24px, 2.9vw, 42px)",
                          fontWeight: 500,
                          color: active ? V.ink : "rgba(38,38,51,0.3)",
                          lineHeight: 1.2,
                          transition: "color .4s cubic-bezier(.4,0,.2,1)",
                        }}>
                          {item.title}
                        </div>
                        <div style={{
                          fontSize: "clamp(18px, 1.9vw, 28px)", fontWeight: 500, color: "rgba(38,38,51,0.3)", lineHeight: 1.2,
                          opacity: active ? 1 : 0,
                          transition: "opacity .4s cubic-bezier(.4,0,.2,1)",
                        }}>
                          {item.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ BLOCK: Mary vs ChatGPT ═══ */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)", background: V.white }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, color: V.ink }}>Это не очередной ChatGPT</h2>
          </div>

          <div style={{ borderRadius: "clamp(20px, 2.8vw, 40px)", background: "#F3F3F3", overflow: "hidden", padding: "clamp(24px, 2.2vw, 32px)" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 0, padding: "0 0 20px", borderBottom: "1px solid rgba(38,38,51,0.08)", marginBottom: 4 }}>
              <div />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><ellipse cx="5" cy="14" rx="4" ry="11" fill="#262633"/><ellipse cx="11.5" cy="14" rx="4" ry="13.5" fill="#262633"/><ellipse cx="18.5" cy="15.5" rx="4" ry="12" transform="rotate(3 18.5 15.5)" fill="#262633"/></svg>
                <span style={{ fontSize: 16, fontWeight: 600, color: V.ink }}>Mary</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(38,38,51,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💬</div>
                <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(38,38,51,0.35)" }}>ChatGPT</span>
              </div>
            </div>

            {/* Rows */}
            {[
              { label: "Подход", mary: "55 агентов-специалистов", gpt: "Один чат на всё" },
              { label: "Контекст", mary: "Ваши данные, CRM, файлы", gpt: "Только промт" },
              { label: "Результат", mary: "Готовый отчёт, макет, план", gpt: "Текст для доработки" },
              { label: "Память", mary: "Помнит бизнес навсегда", gpt: "Забывает после закрытия" },
              { label: "Инициатива", mary: "Сама находит проблемы", gpt: "Ждёт ваш запрос" },
              { label: "Проверка", mary: "Агенты проверяют друг друга", gpt: "Нет проверки" },
              { label: "Интеграции", mary: "33 сервиса", gpt: "Плагины" },
              { label: "Каналы", mary: "Веб + Telegram + API", gpt: "Только веб" },
            ].map(function(row, i, arr) {
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 0, padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(38,38,51,0.05)" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(38,38,51,0.35)" }}>{row.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: V.ink }}>{row.mary}</div>
                  <div style={{ fontSize: 15, color: "rgba(38,38,51,0.25)" }}>{row.gpt}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

            {/* ═══ BLOCK: Результат — горизонтальная карусель ═══ */}
      {(() => {
        var carouselRef = useRef(null);
        var _cp = useState(0); var carouselProgress = _cp[0]; var setCarouselProgress = _cp[1];

        var cards = [
          { title: "SEO-аудит за 30 секунд", desc: "Конкретный отчёт: страницы, мета-теги, скорость — и план действий." },
          { title: "Контент-план на месяц", desc: "Готовый план: посты, Reels, время публикации — под вашу нишу." },
          { title: "Транскрипт встречи + задачи", desc: "Транскрипт, саммари и задачи с дедлайнами — автоматически." },
          { title: "Дизайн-макет", desc: "Готовый макет баннера или лендинга — под ваш бренд-бук." },
        ];

        useEffect(function() {
          function handleScroll() {
            if (!carouselRef.current) return;
            var rect = carouselRef.current.getBoundingClientRect();
            var scrollable = rect.height - window.innerHeight;
            if (scrollable <= 0) return;
            var p = Math.max(0, Math.min(1, -rect.top / scrollable));
            setCarouselProgress(p);
          }
          window.addEventListener("scroll", handleScroll, { passive: true });
          return function() { window.removeEventListener("scroll", handleScroll); };
        }, []);

        // Cards centered: first card starts centered, last card ends centered
        var cardW = 35;
        var gapW = 1.7;
        // Offset to center first card: 50vw - half card width
        var startOffset = 50 - cardW / 2;
        // Position of last card center relative to first card left
        var lastCardCenter = (cards.length - 1) * (cardW + gapW) + cardW / 2;
        // Total distance to shift from first-centered to last-centered
        var totalShift = lastCardCenter - cardW / 2;
        var translateX = startOffset - carouselProgress * totalShift;

        return (
          <div ref={carouselRef} style={{ height: cards.length * 100 + "vh", position: "relative", background: V.white }}>
            <div style={{
              position: "sticky", top: 0, height: "100vh",
              display: "flex", flexDirection: "column", justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* Title */}
              <div style={{ padding: "0 clamp(20px, 6.9vw, 100px)", textAlign: "center", marginBottom: 60 }}>
                <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, color: V.ink }}>Вы получаете готовый результат</h2>
              </div>

              {/* Scrolling cards */}
              <div style={{ overflow: "hidden", padding: "0 clamp(20px, 6.9vw, 100px)" }}>
                <div style={{
                  display: "flex", gap: "clamp(16px, 1.7vw, 24px)",
                  transform: "translateX(" + translateX + "vw)",
                  transition: "transform .1s linear",
                }}>
                  {cards.map(function(card, i) {
                    return (
                      <div key={i} style={{
                        width: "clamp(320px, 35vw, 504px)", height: "clamp(320px, 35vw, 504px)", flexShrink: 0,
                        background: "rgba(38,38,51,0.05)", borderRadius: "clamp(24px, 2.8vw, 40px)",
                        overflow: "hidden",
                        display: "flex", flexDirection: "column",
                        padding: "clamp(24px, 2.2vw, 32px)",
                      }}>
                        {/* Tag pill */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ padding: "6px 14px", borderRadius: 100, background: V.ink, fontSize: 12, fontWeight: 500, color: "#fff" }}>{card.tag}</div>
                          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.25)" }}>{card.preview}</div>
                        </div>
                        {/* Text content */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: "clamp(18px, 1.7vw, 24px)", fontWeight: 500, color: V.ink, marginBottom: 8, lineHeight: 1.2 }}>{card.title}</div>
                          <div style={{ fontSize: "clamp(13px, 1vw, 15px)", color: "rgba(38,38,51,0.3)", lineHeight: 1.5 }}>{card.desc}</div>
                        </div>
                        {/* White placeholder */}
                        <div style={{
                          flex: 1, borderRadius: "clamp(18px, 2.1vw, 30px)",
                          background: "#FFFFFF",
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ═══ BLOCK: Интеграции — сетка логотипов ═══ */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: V.white, padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)" }}>
        <div style={{ maxWidth: 1240, width: "100%", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, color: V.ink }}>Подключается к вашим инструментам</h2>
            <p style={{ fontSize: "clamp(16px, 1.2vw, 18px)", color: V.muted, lineHeight: 1.6, marginTop: 20 }}>Mary работает с сервисами, которые вы уже используете</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(12px, 1.4vw, 20px)", maxWidth: 800, margin: "0 auto" }}>
            {[
              { icon: "✈️", name: "Telegram", desc: "Управляйте через бота" },
              { icon: "📁", name: "Google Drive", desc: "Файлы и документы" },
              { icon: "💬", name: "Slack", desc: "Уведомления и задачи" },
              { icon: "📋", name: "Bitrix24 / amoCRM", desc: "Клиенты и сделки" },
              { icon: "📅", name: "Календарь", desc: "Встречи и дедлайны" },
              { icon: "📊", name: "Аналитика", desc: "GA, Метрика, данные" },
            ].map(function(s, i) {
              return (
                <div key={i} style={{
                  padding: "clamp(24px, 2.2vw, 32px)",
                  borderRadius: "clamp(20px, 2.8vw, 40px)",
                  background: "rgba(38,38,51,0.03)",
                  textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                }}>
                  <div style={{ fontSize: "clamp(32px, 3.3vw, 48px)", lineHeight: 1 }}>{s.icon}</div>
                  <div style={{ fontSize: "clamp(15px, 1.2vw, 18px)", fontWeight: 500, color: V.ink }}>{s.name}</div>
                  <div style={{ fontSize: "clamp(12px, 0.9vw, 14px)", color: "rgba(38,38,51,0.3)", lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14, color: V.muted }}>И ещё 27 интеграций — подключаются за пару кликов</p>
          </div>
        </div>
      </div>

      {/* ═══ BLOCK: Telegram — как это работает ═══ */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: V.white, padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)" }}>
        <div style={{ maxWidth: 1240, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 5.5vw, 80px)", alignItems: "center" }}>
          {/* Left — text */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 100, background: "rgba(38,38,51,0.05)", marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>✈️</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: V.ink }}>Telegram</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.3vw, 48px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.15, color: V.ink, marginBottom: 24 }}>Управляйте бизнесом<br />прямо из Telegram</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { title: "Ставьте задачи голосом или текстом", desc: "Напишите или надиктуйте — Mary поймёт и распределит по агентам" },
                { title: "Получайте отчёты каждое утро", desc: "Сводка за день: что сделано, что горит, кто перегружен" },
                { title: "Согласовывайте в один клик", desc: "Агенты присылают результат — вы одобряете или просите переделать" },
              ].map(function(item, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(38,38,51,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>{i + 1}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "clamp(15px, 1.2vw, 18px)", fontWeight: 500, color: V.ink, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: "clamp(13px, 1vw, 15px)", color: "rgba(38,38,51,0.4)", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — Telegram chat mock */}
          <div style={{
            borderRadius: "clamp(20px, 2.8vw, 40px)",
            background: "rgba(38,38,51,0.03)",
            padding: "clamp(24px, 2.2vw, 32px)",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* Chat header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid " + V.border }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: V.ink, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 600 }}>M</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.ink }}>Mary</div>
                <div style={{ fontSize: 12, color: V.green }}>онлайн</div>
              </div>
            </div>
            {/* Messages */}
            {[
              { from: "mary", text: "Доброе утро! Вот сводка за вчера:" },
              { from: "mary", text: "✅ SEO-аудит готов — 15 ошибок найдено\n📝 Контент-план на апрель — 12 постов\n⚠️ Дизайнер перегружен на 130%" },
              { from: "user", text: "Перекинь часть задач на копирайтера" },
              { from: "mary", text: "Готово! Перенесла 3 задачи. Копирайтер начнёт через 10 минут." },
            ].map(function(msg, i) {
              var isUser = msg.from === "user";
              return (
                <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isUser ? V.ink : "#fff",
                    color: isUser ? "#fff" : V.ink,
                    fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line",
                  }}>{msg.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* ═══ BLOCK: PRICING ═══ */}
      {(() => {
        var _bp = useState("month"); var billingPeriod = _bp[0]; var setBillingPeriod = _bp[1];
        var periods = [
          { id: "week", label: "7 дней", suffix: "/нед" },
          { id: "month", label: "1 месяц", suffix: "/мес" },
          { id: "year", label: "Год", suffix: "/год", save: "−20%" },
        ];
        var plans = [
          {
            name: "Starter",
            prices: { week: "$14", month: "$49", year: "$470" },
            desc: "Для малого бизнеса и фрилансеров",
            features: ["10 AI-агентов", "1 пользователь", "5 млн токенов", "Веб-платформа + Telegram", "Email-поддержка"],
            cta: "Начать бесплатно",
            accent: false,
          },
          {
            name: "Business",
            prices: { week: "$39", month: "$149", year: "$1 430" },
            desc: "Для среднего бизнеса",
            features: ["Все 55 агентов", "5 пользователей", "25 млн токенов", "AI-браузер для исследований", "Приоритетная поддержка"],
            cta: "Попробовать 7 дней",
            accent: true,
            badge: "Популярный",
          },
          {
            name: "Enterprise",
            prices: { week: "$129", month: "$499", year: "$4 790" },
            desc: "Для крупных компаний",
            features: ["Все 55 агентов", "20 пользователей", "100 млн токенов", "Неограниченные каналы связи", "SLA 99.9% · выделенный менеджер"],
            cta: "Связаться с нами",
            accent: false,
          },
        ];
        var activePeriod = periods.find(function(p) { return p.id === billingPeriod; });

        return (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)", background: V.white }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: "clamp(32px, 4.2vw, 60px)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: V.accent, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Тарифы</p>
                <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.1, color: V.ink }}>Команда из 55 агентов —<br />дешевле одного сотрудника</h2>
              </div>

              {/* ── Period toggle ── */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(32px, 3.3vw, 48px)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", background: V.white, border: "1.5px solid " + V.border, borderRadius: "clamp(8px, 0.8vw, 12px)", padding: 4, gap: 0 }}>
                  {periods.map(function(p) {
                    var active = billingPeriod === p.id;
                    return (
                      <button key={p.id} onClick={function() { setBillingPeriod(p.id); }} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "10px 22px", borderRadius: 9, border: "none",
                        background: active ? V.ink : "transparent",
                        color: active ? "#fff" : V.muted,
                        fontSize: 14, fontWeight: active ? 600 : 500,
                        cursor: "pointer", fontFamily: V.sans,
                        transition: "all .2s cubic-bezier(.22,1,.36,1)",
                        position: "relative",
                      }}>
                        {p.label}
                        {p.save && (
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            padding: "2px 8px", borderRadius: 6,
                            background: active ? "rgba(255,255,255,.2)" : "rgba(108,92,231,.08)",
                            color: active ? "#fff" : V.accent,
                            whiteSpace: "nowrap",
                          }}>{p.save}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(12px, 1.4vw, 20px)", alignItems: "start" }}>
                {plans.map(function(plan, i) {
                  return (
                  <div key={i} style={{
                    background: plan.accent ? V.ink : V.white,
                    border: plan.accent ? "none" : "1.5px solid " + V.border,
                    borderRadius: "clamp(12px, 1.4vw, 20px)",
                    padding: "clamp(28px, 2.8vw, 40px)",
                    position: "relative",
                    transition: "transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s",
                  }}
                    onMouseEnter={function(e) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = V.shadowLg; }}
                    onMouseLeave={function(e) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {plan.badge && (
                      <div style={{
                        position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                        background: V.accent, color: "#fff", fontSize: 11, fontWeight: 600,
                        padding: "4px 16px", borderRadius: 20, letterSpacing: ".02em", whiteSpace: "nowrap",
                      }}>{plan.badge}</div>
                    )}

                    <div style={{ fontSize: 13, fontWeight: 600, color: plan.accent ? "rgba(255,255,255,.5)" : V.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>{plan.name}</div>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: "clamp(36px, 3.5vw, 52px)", fontWeight: 500, letterSpacing: "-2px", color: plan.accent ? "#fff" : V.ink }}>{plan.prices[billingPeriod]}</span>
                      <span style={{ fontSize: 15, color: plan.accent ? "rgba(255,255,255,.4)" : V.muted }}>{activePeriod.suffix}</span>
                    </div>

                    <p style={{ fontSize: 14, color: plan.accent ? "rgba(255,255,255,.6)" : V.muted, marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                      {plan.features.map(function(f, fi) {
                        return (
                        <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            background: plan.accent ? "rgba(255,255,255,.15)" : "rgba(38,38,51,.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, color: plan.accent ? "#fff" : V.ink,
                          }}>✓</div>
                          <span style={{ fontSize: 14, color: plan.accent ? "rgba(255,255,255,.85)" : V.ink2, lineHeight: 1.4 }}>{f}</span>
                        </div>
                        );
                      })}
                    </div>

                    <button onClick={function() { onScan(url || "yoursite.com"); }} style={{
                      width: "100%", padding: "14px 24px", borderRadius: "clamp(8px, 0.8vw, 12px)", border: "none",
                      background: plan.accent ? "#fff" : V.ink,
                      color: plan.accent ? V.ink : "#fff",
                      fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: V.sans,
                      transition: "opacity .15s, transform .15s",
                    }}
                      onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
                      onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
                    >{plan.cta}</button>
                  </div>
                  );
                })}
              </div>

              <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: V.muted, lineHeight: 1.6 }}>
                7 дней бесплатно на любом тарифе. Отмена в 1 клик. Без карты.
              </p>
            </div>
          </div>
        );
      })()}

                  {/* ═══ FINAL CTA ═══ */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: V.white, padding: "clamp(48px, 5.5vw, 80px) clamp(20px, 6.9vw, 100px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", width: "100%" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.3vw, 48px)", fontWeight: 500, letterSpacing: "-1.5px", color: V.ink, marginBottom: 16, lineHeight: 1.15 }}>Всё что вы увидели —<br />сделано через Mary</h2>
          <p style={{ fontSize: 20, color: V.muted, marginBottom: 48 }}>Хотите так же?</p>
          <button onClick={() => onScan(url || "yoursite.com")} style={{ padding: "clamp(14px, 1.2vw, 18px) clamp(28px, 3.3vw, 48px)", borderRadius: "clamp(10px, 1vw, 14px)", background: V.ink, color: "#fff", border: "none", fontSize: 18, fontWeight: 600, cursor: "pointer", fontFamily: V.sans, transition: "transform .15s, opacity .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}>
            Попробовать бесплатно →
          </button>
        </div>
      </div>

      {/* FOOTER — mymeet style */}
      <div style={{ background: "#F5F5F5", padding: "clamp(32px, 4.2vw, 60px) clamp(20px, 6.9vw, 100px) clamp(24px, 2.8vw, 40px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Top row: logo + email */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>🐾</span>
            </div>
            <div>
              <div style={{ fontSize: 13, color: V.muted, marginBottom: 6 }}>Техническая поддержка</div>
              <div style={{ fontSize: "clamp(20px, 2.2vw, 32px)", fontWeight: 500, color: V.ink }}>hello@mary.team</div>
            </div>
          </div>

          {/* Links grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "clamp(16px, 2.2vw, 32px)", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>О продукте</div>
              {["Стоимость", "Telegram-бот", "Расширение", "API"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Решения</div>
              {["Маркетинг", "AI Чат", "AI Отчёты", "Для бизнеса", "Продажи", "Рекрутмент"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Ресурсы</div>
              {["Бонусная программа", "База знаний", "Обновления", "Блог", "Юзкейсы"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: V.muted, marginBottom: 16 }}>Компания</div>
              {["Telegram-канал", "Приватность", "Условия пользования"].map((l, i) => (
                <div key={i} style={{ fontSize: 15, color: V.ink, marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ borderTop: "1px solid " + V.border, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 13, color: V.muted }}>©2026 mary.team</div>
            <div style={{ fontSize: 12, color: V.muted, maxWidth: 500, textAlign: "right", lineHeight: 1.5 }}>
              ООО «МэриРоуз» УНП 193889413 Юридический адрес: г. Минск, Беларусь
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FIXED BOTTOM NAV — appears from block 2 ═══ */}
      {(() => {
        var pastHero = scrollY > (typeof window !== "undefined" ? window.innerHeight * 0.8 : 800);
        var show = pastHero && scrollDir === "down";
        return (
          <div style={{
            position: "fixed", bottom: "clamp(16px, 2.2vw, 32px)", left: "50%", transform: "translateX(-50%)" + (show ? " translateY(0)" : " translateY(calc(100% + 40px))"),
            zIndex: 200, opacity: show ? 1 : 0,
            transition: "transform .45s cubic-bezier(.22,1,.36,1), opacity .35s ease",
            pointerEvents: show ? "auto" : "none",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: 8,
              background: "rgba(255,255,255,.65)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)",
              borderRadius: "clamp(14px, 1.4vw, 20px)",
            }}>
              {/* Menu */}
              <button onClick={function() { setMenuOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: "clamp(10px, 1vw, 14px)", background: "rgba(38,38,51,0.05)", border: "none", cursor: "pointer", fontFamily: V.sans, fontSize: 15, fontWeight: 500, color: V.ink }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 18H4M20 12H4M20 6H4" stroke="#262633" strokeWidth="2" strokeLinecap="round"/></svg>
                Меню
              </button>
              {/* CTA */}
              <button onClick={function() { onScan(url || "yoursite.com"); }} style={{
                height: 44, padding: "0 28px", borderRadius: "clamp(10px, 1vw, 14px)",
                background: V.ink, color: "#fff", border: "none",
                fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: V.sans,
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "opacity .15s, transform .15s",
              }}
                onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >Начать</button>
            </div>
          </div>
        );
      })()}

      {/* ═══ FULLSCREEN MENU ═══ */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(255,255,255,.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column",
          fontFamily: V.sans, color: V.ink,
          animation: "fadeIn .3s ease",
          overflowY: "auto",
        }}>
          {/* Menu header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px clamp(20px, 6.9vw, 100px)", flexShrink: 0 }}>
            <svg width="116" height="37" viewBox="0 0 116 37" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="5.10298" cy="17.6292" rx="5.10298" ry="14.845" fill="#262633"/><ellipse cx="13.4533" cy="17.6285" rx="5.10298" ry="17.6285" fill="#262633"/><ellipse cx="22.7069" cy="20.2255" rx="5.10298" ry="15.309" transform="rotate(3.41655 22.7069 20.2255)" fill="#262633"/><path d="M37.2481 30.4053V12.157H41.5175V15.0836H41.6208C41.9995 14.0851 42.6365 13.2875 43.5317 12.6907C44.4269 12.0824 45.477 11.7783 46.6821 11.7783C47.5314 11.7783 48.2946 11.9275 48.9717 12.2259C49.6489 12.5128 50.2227 12.9317 50.6933 13.4826C51.1753 14.022 51.5253 14.6819 51.7434 15.4624H51.8295C52.1279 14.7049 52.5525 14.0565 53.1034 13.517C53.6658 12.9661 54.32 12.5415 55.066 12.2431C55.8234 11.9332 56.6383 11.7783 57.5105 11.7783C58.7156 11.7783 59.76 12.0365 60.6437 12.553C61.5389 13.058 62.2333 13.7695 62.7268 14.6877C63.2318 15.5944 63.4842 16.6617 63.4842 17.8897V30.4053H59.1976V18.9399C59.1976 18.1824 59.0714 17.5397 58.8189 17.0117C58.5664 16.4838 58.1991 16.0821 57.7171 15.8067C57.2351 15.5312 56.6383 15.3935 55.9267 15.3935C55.2381 15.3935 54.6298 15.5542 54.1019 15.8755C53.5854 16.1854 53.178 16.6215 52.8796 17.1839C52.5927 17.7463 52.4492 18.3947 52.4492 19.1292V30.4053H48.2831V18.7161C48.2831 18.0275 48.1511 17.4364 47.8872 16.9429C47.6232 16.4494 47.2502 16.0706 46.7682 15.8067C46.2861 15.5312 45.7123 15.3935 45.0466 15.3935C44.358 15.3935 43.7497 15.5599 43.2218 15.8928C42.6939 16.2256 42.275 16.6789 41.9651 17.2528C41.6667 17.8266 41.5175 18.4865 41.5175 19.2325V30.4053H37.2481ZM72.3157 30.7151C71.1106 30.7151 70.0433 30.4856 69.1137 30.0265C68.1955 29.556 67.4782 28.9075 66.9617 28.0812C66.4568 27.2434 66.2043 26.2851 66.2043 25.2062V25.1718C66.2043 24.0815 66.474 23.1519 67.0134 22.3829C67.5643 21.6025 68.3562 20.9885 69.3891 20.5409C70.422 20.0818 71.673 19.8064 73.142 19.7146L80.1143 19.2842V22.1247L73.7446 22.5207C72.6887 22.5895 71.8796 22.842 71.3172 23.2781C70.7549 23.7142 70.4737 24.2938 70.4737 25.0169V25.0341C70.4737 25.7801 70.7549 26.3711 71.3172 26.8073C71.8911 27.2319 72.6485 27.4442 73.5896 27.4442C74.416 27.4442 75.1505 27.2778 75.7932 26.945C76.4474 26.6122 76.9638 26.1588 77.3426 25.585C77.7213 25.0111 77.9107 24.3627 77.9107 23.6397V18.1652C77.9107 17.247 77.618 16.524 77.0327 15.996C76.4589 15.4566 75.6268 15.1869 74.5365 15.1869C73.5265 15.1869 72.7174 15.405 72.1091 15.8411C71.5009 16.2658 71.1221 16.8166 70.9729 17.4938L70.9385 17.6487H66.979L66.9962 17.4421C67.088 16.3633 67.4495 15.3992 68.0807 14.55C68.712 13.6892 69.5842 13.0121 70.6975 12.5185C71.8222 12.025 73.1535 11.7783 74.6914 11.7783C76.2178 11.7783 77.5377 12.0308 78.6509 12.5358C79.7757 13.0407 80.6422 13.7466 81.2505 14.6532C81.8702 15.5599 82.1801 16.6273 82.1801 17.8553V30.4053H77.9107V27.5992H77.8074C77.4631 28.2304 77.0155 28.7813 76.4646 29.2518C75.9137 29.7224 75.2825 30.0839 74.5709 30.3364C73.8708 30.5889 73.1191 30.7151 72.3157 30.7151ZM85.6576 30.4053V12.157H89.927V15.3074H90.0303C90.3057 14.2057 90.805 13.3449 91.528 12.7251C92.2625 12.0939 93.1577 11.7783 94.2136 11.7783C94.4776 11.7783 94.7301 11.7955 94.9711 11.8299C95.2121 11.8644 95.4129 11.9045 95.5736 11.9504V15.8239C95.4015 15.755 95.1547 15.6976 94.8334 15.6517C94.5235 15.6058 94.1849 15.5829 93.8177 15.5829C93.0143 15.5829 92.3199 15.7493 91.7346 16.0821C91.1493 16.4035 90.7017 16.8798 90.3918 17.511C90.0819 18.1422 89.927 18.9112 89.927 19.8178V30.4053H85.6576ZM100.807 36.4651C100.394 36.4651 99.9865 36.4421 99.5848 36.3962C99.1946 36.3618 98.8675 36.3216 98.6035 36.2757V33.022C98.7642 33.045 98.965 33.0736 99.206 33.1081C99.4471 33.1425 99.7225 33.1597 100.032 33.1597C100.859 33.1597 101.513 33.0163 101.995 32.7293C102.477 32.4539 102.856 31.9317 103.131 31.1627L103.389 30.4225L96.8303 12.157H101.496L106.041 27.6508L105.386 26.7556H106.299L105.645 27.6508L110.189 12.157H114.7L108.124 31.025C107.665 32.3563 107.108 33.418 106.454 34.2099C105.8 35.0132 105.008 35.5871 104.078 35.9314C103.16 36.2872 102.07 36.4651 100.807 36.4651Z" fill="#262633"/></svg>
            <button onClick={function() { setMenuOpen(false); setMenuSection(null); setSpheresOpen(false); }} style={{
              width: 48, height: 48, borderRadius: "clamp(10px, 1.1vw, 16px)",
              background: "rgba(38,38,51,0.05)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: V.ink,
            }}>✕</button>
          </div>

          {/* Menu content */}
          <div style={{ flex: 1, padding: "0 clamp(20px, 6.9vw, 100px)", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
            {!menuSection ? (
              /* Main menu items */
              <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 20 }}>
                {[
                  { id: "audit", label: "Бесплатный аудит бизнеса", icon: "→" },
                  { id: "integrations", label: "Интеграции", icon: "" },
                  { id: "spheres", label: "Сферы бизнеса", icon: "›", expandable: true },
                  { id: "pricing", label: "Тарифы", icon: "" },
                  { id: "telegram", label: "Telegram-бот", icon: "" },
                  { id: "contacts", label: "Контакты", icon: "" },
                ].map(function(item, i) {
                  var isActive = item.expandable && spheresOpen;
                  return (
                    <div key={i}>
                      <div onClick={function() {
                        if (item.id === "audit") { setMenuOpen(false); onScan(url || "yoursite.com"); }
                        else if (item.expandable) { setSpheresOpen(!spheresOpen); }
                        else { setMenuSection(item.id); }
                      }} style={{
                        padding: "clamp(20px, 2.2vw, 32px) clamp(24px, 2.8vw, 40px)",
                        borderRadius: "clamp(20px, 3.5vw, 50px)",
                        background: isActive ? "rgba(38,38,51,0.05)" : "transparent",
                        cursor: "pointer",
                        transition: "background .3s",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: "clamp(24px, 2.9vw, 42px)", fontWeight: 500, color: V.ink }}>{item.label}</span>
                        {item.icon && <span style={{ fontSize: "clamp(24px, 2.9vw, 42px)", color: "rgba(38,38,51,0.3)", transform: isActive ? "rotate(90deg)" : "none", transition: "transform .3s" }}>{item.icon}</span>}
                      </div>
                      {/* Spheres dropdown */}
                      {item.expandable && spheresOpen && (
                        <div style={{ padding: "0 clamp(24px, 2.8vw, 40px) clamp(16px, 1.4vw, 20px)", display: "flex", flexWrap: "wrap", gap: "clamp(8px, 0.7vw, 12px)" }}>
                          {["Студия / Агентство", "E-commerce", "SaaS / Tech", "Финтех", "EdTech", "Недвижимость", "Производство", "Услуги", "Event", "HR"].map(function(sphere, si) {
                            return (
                              <button key={si} onClick={function() { setMenuOpen(false); onSphere(si); }} style={{
                                padding: "10px 20px", borderRadius: 100,
                                background: "rgba(38,38,51,0.05)", border: "none",
                                fontSize: "clamp(14px, 1.1vw, 16px)", fontWeight: 500, color: V.ink,
                                cursor: "pointer", fontFamily: V.sans,
                                transition: "background .2s",
                              }}>{sphere}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Sub-page content */
              <div style={{ paddingTop: 20 }}>
                <button onClick={function() { setMenuSection(null); }} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 500, color: V.muted, fontFamily: V.sans,
                  marginBottom: 32, padding: 0,
                  transition: "color .3s",
                }}>← Назад</button>

                {menuSection === "integrations" && (
                  <div>
                    <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", marginBottom: 40 }}>Интеграции</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                      {[
                        { icon: "✈️", name: "Telegram", desc: "Управление через бота, уведомления, задачи" },
                        { icon: "📁", name: "Google Drive", desc: "Синхронизация файлов и документов" },
                        { icon: "💬", name: "Slack", desc: "Каналы, уведомления, отчёты" },
                        { icon: "📋", name: "Bitrix24 / amoCRM", desc: "Клиенты, сделки, воронки" },
                        { icon: "📅", name: "Google Calendar", desc: "Встречи, напоминания, дедлайны" },
                        { icon: "📊", name: "GA / Метрика", desc: "Трафик, конверсии, аудитории" },
                      ].map(function(s, i) {
                        return (
                          <div key={i} style={{ padding: 28, borderRadius: "clamp(20px, 2.8vw, 40px)", background: "rgba(38,38,51,0.03)", display: "flex", flexDirection: "column", gap: 12 }}>
                            <span style={{ fontSize: 36 }}>{s.icon}</span>
                            <div style={{ fontSize: 18, fontWeight: 500 }}>{s.name}</div>
                            <div style={{ fontSize: 14, color: V.muted, lineHeight: 1.5 }}>{s.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 14, color: V.muted, marginTop: 24 }}>И ещё 27 интеграций — подключаются за пару кликов</p>
                  </div>
                )}

                {menuSection === "pricing" && (
                  <div>
                    <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", marginBottom: 40 }}>Тарифы</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
                      {[
                        { name: "Starter", price: "$49", period: "/мес", desc: "10 агентов · 1 пользователь · 5 млн токенов", accent: false },
                        { name: "Business", price: "$149", period: "/мес", desc: "55 агентов · 5 пользователей · 25 млн токенов", accent: true },
                        { name: "Enterprise", price: "$499", period: "/мес", desc: "55 агентов · 20 пользователей · 100 млн токенов", accent: false },
                      ].map(function(p, i) {
                        return (
                          <div key={i} style={{ padding: 32, borderRadius: "clamp(20px, 2.8vw, 40px)", background: p.accent ? V.ink : "rgba(38,38,51,0.03)", color: p.accent ? "#fff" : V.ink }}>
                            <div style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.5, marginBottom: 16 }}>{p.name}</div>
                            <div style={{ fontSize: 42, fontWeight: 500, letterSpacing: "-2px" }}>{p.price}<span style={{ fontSize: 16, opacity: 0.4 }}>{p.period}</span></div>
                            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 12, lineHeight: 1.5 }}>{p.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Comparison table */}
                    <h3 style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>Сравнение тарифов</h3>
                    <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid " + V.border }}>
                      {[
                        { label: "", vals: ["Starter", "Business", "Enterprise"], header: true },
                        { label: "Агенты", vals: ["10", "55", "55"] },
                        { label: "Пользователи", vals: ["1", "5", "20"] },
                        { label: "Токены", vals: ["5 млн", "25 млн", "100 млн"] },
                        { label: "AI-браузер", vals: ["—", "✓", "✓"] },
                        { label: "Telegram-бот", vals: ["✓", "✓", "✓"] },
                        { label: "Интеграции", vals: ["6", "33", "Безлимит"] },
                        { label: "Поддержка", vals: ["Email", "Приоритет", "Выделенный менеджер"] },
                        { label: "SLA", vals: ["—", "99%", "99.9%"] },
                      ].map(function(row, i) {
                        return (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", borderBottom: i < 8 ? "1px solid " + V.border : "none", background: row.header ? "rgba(38,38,51,0.03)" : "transparent" }}>
                            <div style={{ padding: "14px 20px", fontSize: row.header ? 13 : 14, fontWeight: row.header ? 600 : 400, color: V.ink }}>{row.label}</div>
                            {row.vals.map(function(v, vi) {
                              return (<div key={vi} style={{ padding: "14px 20px", fontSize: row.header ? 13 : 14, fontWeight: row.header ? 600 : 400, color: v === "✓" ? V.green : v === "—" ? V.muted2 : V.ink, textAlign: "center" }}>{v}</div>);
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {menuSection === "telegram" && (
                  <div>
                    <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", marginBottom: 24 }}>Telegram-бот</h2>
                    <p style={{ fontSize: 18, color: V.muted, lineHeight: 1.6, marginBottom: 32 }}>Управляйте бизнесом из Telegram — ставьте задачи, получайте отчёты, согласовывайте результаты.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {[
                        "Напишите задачу текстом или голосом — Mary распределит по агентам",
                        "Утренняя сводка: что сделано, что горит, кто перегружен",
                        "Агенты присылают результат — одобряйте или просите переделать",
                        "Бот работает 24/7, отвечает за секунды",
                      ].map(function(t, i) {
                        return (
                          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(38,38,51,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: V.ink }}>{i + 1}</div>
                            <span style={{ fontSize: 16, color: V.ink, lineHeight: 1.5 }}>{t}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {menuSection === "contacts" && (
                  <div>
                    <h2 style={{ fontSize: "clamp(32px, 4.3vw, 56px)", fontWeight: 500, letterSpacing: "-1.5px", marginBottom: 24 }}>Контакты</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 14, color: V.muted, marginBottom: 6 }}>Техническая поддержка</div>
                        <div style={{ fontSize: 24, fontWeight: 500 }}>hello@mary.team</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: V.muted, marginBottom: 6 }}>Telegram</div>
                        <div style={{ fontSize: 24, fontWeight: 500 }}>@mary_team</div>
                      </div>
                      <div style={{ marginTop: 20, fontSize: 14, color: V.muted, lineHeight: 1.6 }}>
                        ООО «МэриРоуз» УНП 193889413<br />
                        Юридический адрес: г. Минск, Беларусь
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

/* ═══ 2. ВВОД ССЫЛКИ ═══ */
function UrlInput({ onScan, onSurvey, onBack }) {
  const [url, setUrl] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={0} onBack={onBack} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontFamily: V.serif, fontSize: 32, fontWeight: 500, marginBottom: 8 }}>Покажите свой бизнес</div>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 40 }}>Мэри изучит и подумает как директор: что болит, где деньги</p>
          <div style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: 32, boxShadow: V.shadow, textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: V.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Ссылка</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yoursite.com..." style={{ fontFamily: V.sans, fontSize: 14, border: "1.5px solid " + V.border, borderRadius: V.rSm, padding: "12px 16px", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            <Btn onClick={() => onScan(url || "yoursite.com")} full>Запустить аудит →</Btn>
            <div style={{ height: 1, background: V.border, margin: "24px 0" }} />
            <p style={{ fontSize: 13, color: V.muted, textAlign: "center", marginBottom: 12 }}>Нет ссылки?</p>
            <Btn variant="outline" onClick={onSurvey} full>Пройти опрос →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 3. ОПРОС ═══ */
const SQ = [
  { q: "Какая сфера?", type: "pills", opts: ["SaaS / Tech", "E-commerce", "EdTech", "Недвижимость", "Финтех", "HR", "Юридические", "Медиа", "Производство", "Услуги", "Другое"] },
  { q: "Сколько человек в команде?", type: "radio", opts: ["Только я", "2-5", "6-20", "21-50", "Больше 50"] },
  { q: "Что отнимает больше всего времени?", type: "pills", multi: true, opts: ["Продажи и клиенты", "Финансы и отчёты", "Найм и управление", "Маркетинг", "Операции и логистика", "Аналитика", "Другое"] },
  { q: "Что мешает расти?", type: "radio", opts: ["Всё держится на мне", "Не вижу куда уходят деньги", "Команда перегружена", "Хаос в процессах", "Не знаю с чего начать"] },
];

function Survey({ onГотово, onBack }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [anim, setAnim] = useState(false);
  const cur = SQ[step];
  function goNext() { if (step >= SQ.length - 1) { onГотово(); return; } setAnim(true); setTimeout(() => { setStep(s => s + 1); setAnim(false); }, 250); }
  function goBack2() { if (step <= 0) { onBack(); return; } setAnim(true); setTimeout(() => { setStep(s => s - 1); setAnim(false); }, 250); }
  function sel(o) { if (cur.multi) { const p = ans[step] || []; setAns({ ...ans, [step]: p.includes(o) ? p.filter(x => x !== o) : [...p, o] }); } else { setAns({ ...ans, [step]: o }); setTimeout(goNext, 300); } }
  function isSel(o) { return cur.multi ? (ans[step] || []).includes(o) : ans[step] === o; }
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={0} onBack={goBack2} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <h1 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 48 }}>Расскажите про свой бизнес</h1>
          <div style={{ display: "flex", gap: 5, marginBottom: 40 }}>{Array.from({ length: SQ.length }).map((_, i) => (<div key={i} style={{ height: 3.5, flex: 1, borderRadius: 3, background: i <= step ? "#2563EB" : "#E5E5E3" }} />))}</div>
          <div style={{ opacity: anim ? 0 : 1, transform: anim ? "translateX(30px)" : "none", transition: "all .25s" }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 22 }}>{cur.q}</h2>
            {cur.type === "pills" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{cur.opts.map(o => { const a = isSel(o); return (<button key={o} onClick={() => sel(o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px 9px 11px", borderRadius: 8, border: a ? "2px solid " + V.ink : "1.5px dashed " + V.border2, background: a ? V.ink : "#fff", color: a ? "#fff" : V.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: V.sans, whiteSpace: "nowrap" }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: a ? "#fff" : "#EAEAE8", color: a ? V.ink : V.muted2, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>a</span>{o}</button>); })}</div>}
            {cur.type === "radio" && <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{cur.opts.map(o => { const a = isSel(o); return (<button key={o} onClick={() => sel(o)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 2px", border: "none", borderBottom: "1px solid " + (a ? "transparent" : "#F3F3F1"), background: "none", cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 400, color: a ? V.ink : V.muted, fontFamily: V.sans, textAlign: "left", width: "100%" }}><span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (a ? V.ink : "#D0D0CE"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a && <span style={{ width: 8, height: 8, borderRadius: "50%", background: V.ink }} />}</span>{o}</button>); })}</div>}
            {cur.multi && <div style={{ marginTop: 32 }}><Btn onClick={goNext}>Продолжить →</Btn></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 4. SCAN ═══ */
function ScanOverlay({ url, onГотово }) {
  const [p, setP] = useState(0); const [done, setГотово] = useState([false, false, false, false, false]);
  useEffect(() => { const iv = setInterval(() => { setP(pr => { const n = pr + 3.5; setГотово(d => d.map((_, i) => i <= Math.floor(n / 22))); if (n >= 100) { clearInterval(iv); setTimeout(onГотово, 400); } return Math.min(n, 100); }); }, 55); return () => clearInterval(iv); }, []);
  const labels = ["Изучаем компанию", "Анализируем модель бизнеса", "Ищем узкие места", "Оцениваем процессы", "Формируем рекомендации"];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(247,246,243,.96)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: V.sans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 440, background: V.white, borderRadius: V.rLg, boxShadow: V.shadowLg, padding: 40, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "2.5px solid " + V.border, borderTopColor: V.ink, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 24px" }} />
        <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Мэри изучает ваш бизнес</div>
        <div style={{ color: V.muted, fontSize: 13, marginBottom: 28 }}>Думает как директор: что болит, где деньги</div>
        <div style={{ background: V.surface2, borderRadius: 8, height: 3, overflow: "hidden", marginBottom: 24 }}><div style={{ height: "100%", background: V.ink, borderRadius: 8, width: p + "%", transition: "width .4s" }} /></div>
        <ul style={{ listStyle: "none", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
          {labels.map((l, i) => (<li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: done[i] ? V.ink : V.muted, fontWeight: done[i] ? 500 : 400 }}><div style={{ width: 18, height: 18, borderRadius: "50%", border: done[i] ? "none" : "1.5px solid " + V.border2, background: done[i] ? V.ink : "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>{done[i] ? "✓" : ""}</div>{l}</li>))}
        </ul>
      </div>
    </div>
  );
}

/* ═══ 5. ПРОБЛЕМЫ ═══ */
function Problems({ url, onPick, onBack }) {
  const tasks = [
    { e: "📦", t: "Посчитай, сколько товара лежит без движения", d: "Деньги заморожены в остатках — никто точно не знает сколько.", agent: "Агент по запасам", tag: "Склад", ai: "30 сек", human: "~2 дня", cost: "~$90" },
    { e: "👥", t: "Найди, кто перегружен, а кто скучает", d: "Нет прозрачности кто чем занят и насколько загружен.", agent: "HR-агент", tag: "Команда", ai: "1 мин", human: "~8 часов", cost: "~$120" },
    { e: "💸", t: "Покажи, куда утекают деньги каждый месяц", d: "Выручка есть, но на счету мало. Полной картины нет.", agent: "Финансовый агент", tag: "Финансы", ai: "2 мин", human: "~6 часов", cost: "~$85" },
    { e: "📊", t: "Собери отчёт, который директор будет читать", d: "Данные разбросаны. Единой картины для решений нет.", agent: "Аналитик данных", tag: "Данные", ai: "45 сек", human: "~4 часа", cost: "~$70" },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={1} onBack={onBack} />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(24px, 3.3vw, 48px) clamp(16px, 1.7vw, 24px) clamp(40px, 5.5vw, 80px)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: V.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Что нашла Мэри</div>
        <div style={{ fontFamily: V.serif, fontSize: 26, fontWeight: 500, marginBottom: 6, letterSpacing: "-.5px" }}>4 точки, где бизнес теряет деньги</div>
        <div style={{ fontSize: 14, color: V.muted, marginBottom: 28 }}>Выберите — Мэри расскажет как это исправить</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {tasks.map((tk, i) => (
            <div key={i} onClick={() => onPick(i)} style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: "22px 22px 18px", cursor: "pointer", boxShadow: V.shadowSm, position: "relative", transition: "all .18s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{tk.e}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: V.surface2, color: V.muted }}>{tk.tag}</span>
              </div>
              <div style={{ fontFamily: V.serif, fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.35, color: V.ink }}>{tk.t}</div>
              <div style={{ fontSize: 13, color: V.muted, lineHeight: 1.5, marginBottom: 14 }}>{tk.d}</div>

              {/* AI vs Human comparison — small oval pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, background: "rgba(14,165,233,.07)", border: "1px solid rgba(14,165,233,.15)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: V.green }}>{tk.ai}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, background: V.surface2, border: "1px solid " + V.border }}>
                  <span style={{ fontSize: 12, color: V.muted }}>Сотрудник {tk.human} · {tk.cost}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: V.muted }}>{tk.agent}</span>
                <span style={{ fontSize: 13, color: V.ink, fontWeight: 600 }}>Узнать →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   6. ЧАТ-КОНСУЛЬТАЦИЯ (полностью новый)
   ═══════════════════════════════════════ */
const CHAT_DATA = [
  {
    agent: "Агент по запасам",
    messages: [
      { type: "text", text: "Привет! Я изучила ваш бизнес и нашла кое-что интересное про склад 📦" },
      { type: "text", text: "Вы закупаете товар заранее — блокноты, материалы, расходники. Что-то уходит быстро, а что-то лежит месяцами." },
      { type: "card", title: "Что нашли", items: [{ label: "~340 000 ₽", desc: "заморожено в остатках" }, { label: "47 позиций", desc: "без движения 3+ месяца" }, { label: "12%", desc: "товара — пора распродать" }] },
      { type: "text", text: "Мой агент по запасам умеет с этим работать. Вот что он сделает:" },
      { type: "steps", items: ["Покажет, что залежалось и на какую сумму", "Подскажет, что пора распродать со скидкой", "Рассчитает, сколько реально закупать в следующий раз"] },
      { type: "text", text: "Ожидаемый эффект: высвобождение 15-25% оборотных средств. Деньги перестанут лежать на полке 💰" },
      { type: "question", text: "Хотите, чтобы он начал прямо сейчас?" },
    ],
  },
  {
    agent: "HR-агент",
    messages: [
      { type: "text", text: "Привет! Я посмотрела на вашу команду и вижу дисбаланс 👥" },
      { type: "text", text: "Часть сотрудников работает за троих и выгорает, а часть — недогружена. При этом нанимать новых дорого." },
      { type: "card", title: "Что нашли", items: [{ label: "2 человека", desc: "перегружены (140%+ нагрузки)" }, { label: "1 человек", desc: "загружен меньше чем на 50%" }, { label: "~180 000 ₽/мес", desc: "можно сэкономить на найме" }] },
      { type: "text", text: "HR-агент разберёт нагрузку по каждому:" },
      { type: "steps", items: ["Покажет кто реально перегружен с цифрами", "Найдёт кто может взять больше задач", "Поможет распределить так, чтобы не нанимать лишних"] },
      { type: "text", text: "Результат: команда работает ровнее, без выгорания и лишних расходов на найм." },
      { type: "question", text: "Запустить анализ команды?" },
    ],
  },
  {
    agent: "Финансовый агент",
    messages: [
      { type: "text", text: "Привет! Я покопалась в ваших расходах — и нашла интересное 💸" },
      { type: "text", text: "Выручка есть, но на счету всегда мало. Подписки, сервисы, мелкие расходы — всё складывается, а полной картины нет." },
      { type: "card", title: "Что нашли", items: [{ label: "23 подписки", desc: "активных — часть не используется" }, { label: "~67 000 ₽/мес", desc: "можно сэкономить" }, { label: "0", desc: "прозрачных отчётов по расходам" }] },
      { type: "text", text: "Финансовый агент наведёт порядок:" },
      { type: "steps", items: ["Соберёт все расходы в одну таблицу", "Покажет где утекает больше всего", "Подскажет что можно безболезненно убрать"] },
      { type: "text", text: "Обычно находит 10-20% экономии. Деньги, которые вы даже не замечали." },
      { type: "question", text: "Навести порядок в финансах?" },
    ],
  },
  {
    agent: "Аналитик данных",
    messages: [
      { type: "text", text: "Привет! Я заглянула в ваши данные — и вижу проблему 📊" },
      { type: "text", text: "Данные разбросаны: часть в Google Sheets, часть в CRM, часть в головах. Когда нужно решение — приходится собирать по кусочкам." },
      { type: "card", title: "Что нашли", items: [{ label: "5+ источников", desc: "данных без единой картины" }, { label: "~2 часа", desc: "уходит на сбор одного отчёта" }, { label: "0", desc: "автоматических дашбордов" }] },
      { type: "text", text: "Аналитик данных это исправит:" },
      { type: "steps", items: ["Соберёт ключевые метрики в один дашборд", "Настроит автообновление — без ручной работы", "Директор увидит главное за 30 секунд, не за 2 часа"] },
      { type: "text", text: "Решения будут быстрее и точнее — потому что картина перед глазами." },
      { type: "question", text: "Собрать ваш первый дашборд?" },
    ],
  },
];

function ChatScreen({ problemIdx, onContinue, onBack, onSwitch }) {
  const historyStore = useRef({});
  function getStore(idx) {
    if (!historyStore.current[idx]) {
      historyStore.current[idx] = { chatLog: [], phase: -1, quickReplies: [], showFinal: false };
    }
    return historyStore.current[idx];
  }

  const store = getStore(problemIdx);
  const [chatLog, setChatLog] = useState(store.chatLog);
  const [maryTyping, setMaryTyping] = useState(false);
  const [phase, setPhase] = useState(store.phase);
  const [inputVal, setInputVal] = useState("");
  const [quickReplies, setQuickReplies] = useState(store.quickReplies);
  const [showFinal, setShowFinal] = useState(store.showFinal);
  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const data = CHAT_DATA[problemIdx] || CHAT_DATA[0];

  // save state back to store whenever it changes
  useEffect(() => {
    historyStore.current[problemIdx] = { chatLog, phase, quickReplies, showFinal };
  }, [chatLog, phase, quickReplies, showFinal, problemIdx]);

  function scroll() {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  }

  function addMary(msg, delay) {
    return new Promise((resolve) => {
      setMaryTyping(true);
      scroll();
      timerRef.current = setTimeout(() => {
        setMaryTyping(false);
        setChatLog((prev) => [...prev, { from: "mary", ...msg }]);
        scroll();
        resolve();
      }, delay || 900);
    });
  }

  function addUser(text) {
    setChatLog((prev) => [...prev, { from: "user", type: "text", text }]);
    setQuickReplies([]);
    scroll();
  }

  async function runPhase0() {
    setPhase(0);
    const msgs = data.messages;
    await addMary(msgs[0], 600);
    await addMary(msgs[1], 1000);
    setQuickReplies(["Да, расскажи подробнее", "А сколько это стоит?", "Какие результаты?"]);
  }

  async function runPhase1(userReply) {
    addUser(userReply);
    setPhase(1);
    const msgs = data.messages;
    await addMary({ type: "text", text: "Отлично, показываю что нашла:" }, 700);
    await addMary(msgs[2], 1400);
    await addMary(msgs[3], 800);
    await addMary(msgs[4], 1200);
    setQuickReplies(["А какой эффект будет?", "Сколько это займёт?", "Хочу попробовать"]);
  }

  async function runPhase2(userReply) {
    addUser(userReply);
    setPhase(2);
    const msgs = data.messages;
    await addMary(msgs[5], 900);
    await addMary(msgs[6], 700);
    setQuickReplies([]);
    setShowFinal(true);
    scroll();
  }

  // on switch: restore saved state or start fresh
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMaryTyping(false);
    setInputVal("");

    const saved = historyStore.current[problemIdx];
    if (saved && saved.phase >= 0) {
      // restore saved conversation
      setChatLog(saved.chatLog);
      setPhase(saved.phase);
      setQuickReplies(saved.quickReplies);
      setShowFinal(saved.showFinal);
      scroll();
    } else {
      // first visit — start conversation
      setChatLog([]);
      setPhase(-1);
      setQuickReplies([]);
      setShowFinal(false);
      runPhase0();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [problemIdx]);

  function handleQuickReply(text) {
    if (phase === 0) runPhase1(text);
    else if (phase === 1) runPhase2(text);
  }

  function handleSend() {
    if (!inputVal.trim()) return;
    const txt = inputVal.trim();
    setInputVal("");
    if (phase === 0) runPhase1(txt);
    else if (phase === 1) runPhase2(txt);
    else {
      addUser(txt);
      setMaryTyping(true);
      scroll();
      setTimeout(() => {
        setMaryTyping(false);
        setChatLog((prev) => [...prev, { from: "mary", type: "text", text: "Отличный вопрос! Чтобы я могла ответить детально — давайте подключим всю команду. Там я распишу всё пошагово." }]);
        setShowFinal(true);
        scroll();
      }, 1200);
    }
  }

  function renderBubble(msg, i) {
    const isUser = msg.from === "user";

    if (isUser) {
      return (
        <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ background: V.ink, color: "#fff", borderRadius: 20, padding: "12px 20px", fontSize: 14, lineHeight: 1.6, maxWidth: "75%" }}>{msg.text}</div>
        </div>
      );
    }

    if (msg.type === "text" || msg.type === "question") {
      return (
        <div key={i} style={{ marginBottom: 16, animation: "msgIn .4s ease" }}>
          <div style={{ fontSize: 15, color: V.ink, lineHeight: 1.75 }}>
            {msg.type === "question" ? <strong>{msg.text}</strong> : msg.text}
          </div>
        </div>
      );
    }

    if (msg.type === "card") {
      return (
        <div key={i} style={{ marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {msg.items.map((item, j) => (
              <div key={j} style={{ flex: "1 1 120px", padding: "14px 16px", background: V.white, border: "1.5px solid " + V.border, borderRadius: V.r, textAlign: "center", minWidth: 120 }}>
                <div style={{ fontFamily: V.serif, fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: V.muted, lineHeight: 1.3 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (msg.type === "steps") {
      return (
        <div key={i} style={{ marginBottom: 20, animation: "msgIn .4s ease" }}>
          <div style={{ padding: "16px 20px", background: V.white, border: "1.5px solid " + V.border, borderRadius: V.r }}>
            {msg.items.map((step, j) => (
              <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: j < msg.items.length - 1 ? "1px solid " + V.surface2 : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: V.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{j + 1}</div>
                <div style={{ fontSize: 14, color: V.ink2, lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: V.white, fontFamily: V.sans }}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes dots{0%,80%,100%{opacity:.3}40%{opacity:1}}`}</style>
      <Nav step={1} onBack={onBack} />

      {/* problem tabs strip — sticky under nav */}
      <div style={{ background: V.white, borderBottom: "1px solid " + V.border, padding: "10px 48px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, overflowX: "auto" }}>
        {[
          { e: "📦", label: "Склад", ai: "30 сек" },
          { e: "👥", label: "Команда", ai: "1 мин" },
          { e: "💸", label: "Финансы", ai: "2 мин" },
          { e: "📊", label: "Данные", ai: "45 сек" },
        ].map((tab, i) => {
          const active = i === problemIdx;
          return (
            <button key={i} onClick={() => { if (!active && onSwitch) onSwitch(i); }} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px 6px 10px", borderRadius: 8,
              border: active ? "1.5px solid " + V.ink : "1.5px solid " + V.border,
              background: active ? V.ink : V.white,
              color: active ? "#fff" : V.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: V.sans, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>{tab.e}</span>
              {tab.label}
              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>{tab.ai}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={onContinue} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 20px", borderRadius: 8,
          background: V.green, color: "#fff", border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: V.sans, whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: "0 1px 4px rgba(14,165,233,.3)",
        }}>
          Хочу всю команду →
        </button>
      </div>

      {/* chat body */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "32px 48px 16px" }}>
        <div style={{ maxWidth: 680 }}>
          {/* agent title */}
          <div style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 24, letterSpacing: "-.5px" }}>{data.agent}</div>

          {chatLog.map((msg, i) => renderBubble(msg, i))}

          {/* typing indicator */}
          {maryTyping && (
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "dots 1.4s infinite" }}><circle cx="8" cy="8" r="6" fill="none" stroke={V.muted2} strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" /></svg>
              <span style={{ fontSize: 13, color: V.muted }}>Мэри думает...</span>
            </div>
          )}

          {/* quick replies */}
          {quickReplies.length > 0 && !maryTyping && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, marginBottom: 16, justifyContent: "flex-end", animation: "msgIn .3s ease" }}>
              {quickReplies.map((qr, qi) => (
                <button key={qi} onClick={() => handleQuickReply(qr)} style={{
                  padding: "10px 20px", borderRadius: 20,
                  border: "1.5px solid " + V.border, background: V.bg,
                  fontSize: 13, fontWeight: 500, color: V.ink, cursor: "pointer",
                  fontFamily: V.sans, transition: "all .15s",
                }}>{qr}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* input bar — clean, like the reference */}
      <div style={{ borderTop: "1px solid " + V.border, background: V.white, padding: "12px 48px 16px", flexShrink: 0 }}>
        <div style={{ maxWidth: 680, border: "1.5px solid " + V.border, borderRadius: 16, padding: "12px 16px", background: V.white }}>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={"Спросите " + data.agent + "..."}
            rows={1}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              fontSize: 14, fontFamily: V.sans, color: V.ink, background: "transparent",
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 16, color: V.muted2, cursor: "pointer" }}>+</span>
              <span style={{ fontSize: 14, color: V.muted2, cursor: "pointer" }}>⚙</span>
            </div>
            <button onClick={handleSend} style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: inputVal.trim() ? V.ink : V.border,
              color: "#fff", cursor: inputVal.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, transition: "background .2s",
            }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 7. MEET TEAM ═══ */
function MeetTeam({ onContinue }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <style>{`@keyframes sp2{to{transform:rotate(360deg)}}`}</style>
      <Nav step={2} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: V.ink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontFamily: V.serif, fontSize: 36, color: "#fff", fontWeight: 700, fontStyle: "italic", boxShadow: V.shadowLg, position: "relative" }}>M<div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1.5px dashed " + V.muted2, animation: "sp2 20s linear infinite" }} /></div>
          <h2 style={{ fontFamily: V.serif, fontSize: 38, fontWeight: 500, marginBottom: 8 }}>Привет, я <em style={{ fontStyle: "italic", color: V.accent }}>Мэри</em></h2>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 36 }}>Нашла проблемы — собрала команду агентов под каждую боль.</p>
          <div style={{ background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: "24px 28px", marginBottom: 32, textAlign: "left", boxShadow: V.shadowSm }}>
            <span style={{ fontFamily: V.serif, fontSize: 52, color: V.border2, lineHeight: 0.5, marginBottom: 12, display: "block" }}>"</span>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: V.ink2 }}>Я буду раздавать задачи, контролировать каждого агента и отвечать за результат. Просто скажите что болит.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            {["📦", "👥", "💸", "📊", "⚙️"].map((e, i) => (<div key={i} style={{ width: 44, height: 44, borderRadius: "50%", background: ["#FEF7E0", "#E8F0FE", "#FCE8E6", "#E6F4EA", "#F3E8FD"][i], border: "2.5px solid " + V.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginLeft: i > 0 ? -8 : 0, boxShadow: V.shadowSm }}>{e}</div>))}
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2.5px solid " + V.bg, background: V.surface2, marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: V.muted }}>+15</div>
          </div>
          <p style={{ fontSize: 12, color: V.muted2, marginBottom: 32 }}>Команда подберётся под ваши задачи</p>
          <Btn onClick={onContinue} lg full>Запустить команду →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══ 8. ONBOARD ═══ */
function Onboard({ onГотово }) {
  const [step, setStep] = useState(1);
  const ls = { display: "block", fontSize: 12, fontWeight: 600, color: V.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" };
  const is = { fontFamily: V.sans, fontSize: 14, border: "1.5px solid " + V.border, borderRadius: V.rSm, padding: "11px 16px", width: "100%", outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: V.bg, fontFamily: V.sans }}>
      <Nav step={3} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: V.white, border: "1.5px solid " + V.border, borderRadius: V.rLg, padding: 40, boxShadow: V.shadow }}>
          {step === 1 && (<div>
            <div style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Создайте аккаунт</div>
            <div style={{ fontSize: 14, color: V.muted, marginBottom: 28 }}>Команда ждёт. Меньше минуты.</div>
            <div style={{ marginBottom: 18 }}><label style={ls}>Email</label><input placeholder="you@company.com" style={is} /></div>
            <div style={{ marginBottom: 18 }}><label style={ls}>Имя</label><input placeholder="Как вас зовут?" style={is} /></div>
            <Btn onClick={() => setStep(3)} full>Продолжить →</Btn>
          </div>)}
          {step === 3 && (<div>
            <div style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Запустить команду</div>
            <div style={{ background: V.surface2, borderRadius: V.rSm, padding: "16px 18px", marginBottom: 20, fontSize: 13, color: V.ink2, lineHeight: 1.6, borderLeft: "3px solid " + V.muted2 }}>Серверы, токены, работа агентов — реальные расходы. Цена покрывает только затраты.</div>
            <div style={{ background: "linear-gradient(135deg,#F7F6F3,#EFEDE8)", border: "1.5px solid " + V.border, borderRadius: V.r, padding: 24, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontFamily: V.serif, fontSize: 44, fontWeight: 700, letterSpacing: "-2px" }}>990₽ <span style={{ fontSize: 14, color: V.muted, fontFamily: V.sans, fontWeight: 400 }}>/ неделя</span></div>
              <div style={{ fontSize: 13, color: V.muted, margin: "6px 0 18px" }}>7 дней — сделайте вывод</div>
              <ul style={{ listStyle: "none", textAlign: "left", display: "flex", flexDirection: "column", gap: 9 }}>
                {["Мэри + 20 агентов", "Склад, HR, финансы, данные", "Неограниченные задачи", "Дашборд и аналитика"].map((it, i) => (<li key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: V.ink2 }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: V.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>✓</div>{it}</li>))}
              </ul>
            </div>
            <Btn onClick={onГотово} lg full>Попробовать неделю →</Btn>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: V.muted }}>Отмена в 1 клик.</p>
          </div>)}
        </div>
      </div>
    </div>
  );
}

/* ═══ 9. PLATFORM — Chat-first + Agent setup ═══ */
function Dash({ onReset }) {
  const [chatInput, setChatInput] = useState("");
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [activeChat, setActiveChat] = useState("mary");
  const [msgIndex, setMsgIndex] = useState(0);
  const [userMsgs, setUserMsgs] = useState([]);
  const [typing, setTyping] = useState(false);

  const P = { white: "#fff", bg: "#FAFAFA", border: "#EBEBEB", ink: "#262633", ink2: "#444", muted: "#999", muted2: "#CCC", accent: "#6C5CE7", accentBg: "rgba(108,92,231,.06)", green: "#0EA5E9", greenBg: "rgba(14,165,233,.06)", pink: "#F0786A", warm: "#FF6B00", r: 10, shadow: "0 1px 3px rgba(0,0,0,.04)", font: "'DM Sans', system-ui, sans-serif" };

  const agents = [
    { id: "manager", emoji: "📋", name: "ИИ-Менеджер", status: "setup", desc: "Управление командой, задачи, дедлайны" },
    { id: "smm", emoji: "📣", name: "Маркетолог", status: "locked", desc: "Контент, SMM, аналитика охватов" },
    { id: "designer", emoji: "🎨", name: "Дизайнер", status: "locked", desc: "Макеты, баннеры, UI" },
    { id: "accountant", emoji: "🧮", name: "Бухгалтер", status: "locked", desc: "Расходы, P&L, подписки" },
  ];

  // Mary's auto-messages based on onboarding pain "автоматизировать рутину менеджера"
  const maryFlow = [
    { from: "mary", text: "Привет, Мария! 👋\n\nНа основе аудита я вижу вашу главную боль — вы сами менеджерите команду, трекаете задачи и переписываетесь в чатах вместо того, чтобы заниматься стратегией.", delay: 0 },
    { from: "mary", text: "Я предлагаю подключить ИИ-Менеджера — он будет:", delay: 1500 },
    { from: "mary", type: "card", data: {
      title: "ИИ-Менеджер",
      items: [
        "Ставить задачи сотрудникам в Telegram",
        "Собирать статусы: кто что делает",
        "Напоминать о дедлайнах",
        "Присылать вам утреннюю сводку",
        "Эскалировать если что-то горит",
      ],
    }, delay: 2500 },
    { from: "mary", text: "Для начала мне нужно подключить Telegram — чтобы я могла общаться с вашей командой.\n\nЭто займёт 2 минуты.", delay: 4000 },
    { from: "mary", type: "action", data: {
      title: "Подключить Telegram",
      desc: "Mary создаст бота для вашей команды",
      btn: "Подключить",
    }, delay: 5000 },
  ];

  // Auto-reveal messages
  useEffect(() => {
    if (activeChat === "mary" && msgIndex < maryFlow.length) {
      const msg = maryFlow[msgIndex];
      const timer = setTimeout(() => {
        setMsgIndex(prev => prev + 1);
      }, msg.delay + 800);
      return () => clearTimeout(timer);
    }
  }, [msgIndex, activeChat]);

  const visibleMsgs = maryFlow.slice(0, msgIndex);

  function handleSend(txt) {
    if (!txt.trim()) return;
    setChatInput("");
    setUserMsgs(prev => [...prev, { text: txt, afterIdx: msgIndex }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const lower = txt.toLowerCase();
      let reply = "Поняла! Давайте сначала подключим Telegram — и я начну работать с вашей командой.";
      if (lower.includes("подключ") || lower.includes("telegram") || lower.includes("да")) {
        reply = "Отлично! Вот ссылка на бота: @mary_manager_bot\n\nДобавьте его в рабочий чат с командой. Как только добавите — я увижу участников и начну настройку.\n\nПосле этого мне нужно будет:\n1. Узнать имена сотрудников\n2. Понять кто за что отвечает\n3. Настроить расписание сводок";
      }
      if (lower.includes("как") && lower.includes("работа")) {
        reply = "Каждое утро в 9:00 я пришлю вам сводку в Telegram:\n\n📋 Статус задач: кто что сделал вчера\n⚠️ Что горит: просроченные дедлайны\n📊 Нагрузка: кто перегружен, кто свободен\n\nВ течение дня я сама ставлю задачи, напоминаю о дедлайнах и эскалирую вам если нужно решение.";
      }
      if (lower.includes("сколько") || lower.includes("стои")) {
        reply = "Сейчас у вас Trial — 7 дней бесплатно с ИИ-Менеджером. После — 990₽/нед за пакет из 4 агентов (Менеджер + Маркетолог + Дизайнер + Бухгалтер).";
      }
      if (lower.includes("сотрудн") || lower.includes("команд") || lower.includes("лена") || lower.includes("катя")) {
        reply = "Записала! Когда подключите Telegram-бота в рабочий чат — я автоматически увижу всех участников и предложу распределение ролей.";
      }
      setUserMsgs(prev => [...prev, { text: reply, fromMary: true, afterIdx: msgIndex }]);
    }, 1000);
  }

  // Build combined message list
  const allMsgs = [];
  visibleMsgs.forEach((m, i) => {
    allMsgs.push(m);
    userMsgs.filter(u => u.afterIdx === i + 1).forEach(u => allMsgs.push(u));
  });
  userMsgs.filter(u => u.afterIdx >= msgIndex).forEach(u => allMsgs.push(u));

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: P.font, background: P.bg }}>

      {/* SIDEBAR */}
      <div style={{ width: 260, flexShrink: 0, background: P.white, borderRight: "1px solid " + P.border, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 18px 16px" }}>
          <div onClick={onReset} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Mary<span style={{ color: P.accent }}>.</span></div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "0 8px", overflowY: "auto" }}>
          {/* Mary main chat */}
          <div onClick={() => setActiveChat("mary")} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            background: activeChat === "mary" ? P.bg : "transparent",
            border: activeChat === "mary" ? "1px solid " + P.border : "1px solid transparent",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: P.ink }}>Mary</div>
              <div style={{ fontSize: 11, color: P.muted }}>Главный чат</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.green }} />
          </div>

          {/* Agents section */}
          <div style={{ marginTop: 16 }}>
            <div onClick={() => setAgentsOpen(!agentsOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
              <span style={{ fontSize: 9, transform: agentsOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>▶</span>
              ИИ-агенты
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: P.accent, background: P.accentBg, padding: "1px 7px", borderRadius: 8 }}>4</span>
            </div>

            {agentsOpen && agents.map((a) => (
              <div key={a.id} onClick={() => { if (a.status !== "locked") setActiveChat(a.id); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 28px", borderRadius: 8, cursor: a.status === "locked" ? "default" : "pointer",
                opacity: a.status === "locked" ? .5 : 1,
                background: activeChat === a.id ? P.bg : "transparent",
              }}>
                <span style={{ fontSize: 15, filter: a.status === "locked" ? "grayscale(100%)" : "none" }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: a.status === "locked" ? P.muted : P.ink }}>{a.name}</div>
                </div>
                {a.status === "setup" && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: P.warm, color: "#fff", fontWeight: 700 }}>Настройка</span>}
                {a.status === "locked" && <span style={{ fontSize: 12 }}>🔒</span>}
              </div>
            ))}
          </div>
        </div>

        {/* user */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid " + P.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.pink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>М</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Мария</div>
              <div style={{ fontSize: 11, color: P.muted }}>Trial · 7 дней</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat header */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid " + P.border, background: P.white, display: "flex", alignItems: "center", gap: 12 }}>
          {activeChat === "mary" ? (<>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>M</div>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: P.ink }}>Mary</div><div style={{ fontSize: 12, color: P.green }}>● Онлайн</div></div>
          </>) : (<>
            <span style={{ fontSize: 24 }}>{agents.find(a => a.id === activeChat)?.emoji}</span>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: P.ink }}>{agents.find(a => a.id === activeChat)?.name}</div><div style={{ fontSize: 12, color: P.warm }}>● Настройка</div></div>
          </>)}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: P.greenBg, fontSize: 12, fontWeight: 600, color: P.green }}>Trial · 7 дней</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 16px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {allMsgs.map((m, i) => {
              // User message
              if (m.text && !m.from && !m.fromMary) {
                return (<div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <div style={{ background: P.ink, color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "12px 18px", fontSize: 14, maxWidth: "70%", lineHeight: 1.6 }}>{m.text}</div>
                </div>);
              }
              // Mary reply to user
              if (m.fromMary) {
                return (<div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: P.ink2, lineHeight: 1.7, whiteSpace: "pre-line", background: P.white, border: "1px solid " + P.border, borderRadius: "4px 16px 16px 16px", padding: "14px 18px", maxWidth: "85%" }}>{m.text}</div>
                </div>);
              }
              // Mary auto-message: text
              if (m.from === "mary" && !m.type) {
                return (<div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: P.ink2, lineHeight: 1.7, whiteSpace: "pre-line", maxWidth: "85%" }}>{m.text}</div>
                </div>);
              }
              // Card type
              if (m.type === "card") {
                return (<div key={i} style={{ marginBottom: 16, background: P.white, border: "1px solid " + P.border, borderRadius: 12, padding: "20px", maxWidth: 480, boxShadow: P.shadow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>📋</span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: P.ink }}>{m.data.title}</div>
                  </div>
                  {m.data.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: P.ink2, lineHeight: 1.5 }}>
                      <span style={{ color: P.green, flexShrink: 0, marginTop: 2 }}>✓</span>{item}
                    </div>
                  ))}
                </div>);
              }
              // Action type (CTA button)
              if (m.type === "action") {
                return (<div key={i} style={{ marginBottom: 16, background: "linear-gradient(135deg, " + P.accent + ", #8B5CF6)", borderRadius: 12, padding: "22px", maxWidth: 400, color: "#fff" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{m.data.title}</div>
                  <div style={{ fontSize: 13, opacity: .8, marginBottom: 16 }}>{m.data.desc}</div>
                  <button onClick={() => handleSend("Подключить Telegram")} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.2)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: P.font, backdropFilter: "blur(4px)" }}>{m.data.btn} →</button>
                </div>);
              }
              return null;
            })}

            {typing && (
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: P.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>M</div>
                <span style={{ fontSize: 13, color: P.muted }}>Mary печатает...</span>
              </div>
            )}

            {msgIndex < maryFlow.length && !typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: P.muted, fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.accent, animation: "pulse 1.5s infinite" }} />
                Mary печатает...
              </div>
            )}
          </div>
        </div>

        {/* Quick replies */}
        {msgIndex >= 3 && userMsgs.length === 0 && (
          <div style={{ padding: "0 24px 8px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Подключить Telegram", "Как это будет работать?", "Кто в моей команде?", "Сколько стоит?"].map((q, i) => (
                <button key={i} onClick={() => handleSend(q)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + P.border, background: P.white, fontSize: 13, cursor: "pointer", fontFamily: P.font, color: P.ink }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 24px 16px", background: P.white, borderTop: "1px solid " + P.border }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, border: "1.5px solid " + (chatInput ? P.accent : P.border), borderRadius: 12, padding: "12px 16px", background: P.bg, transition: "border .15s" }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(chatInput); }} placeholder="Написать Mary..." style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontFamily: P.font, background: "transparent", color: P.ink }} />
              </div>
              <button onClick={() => handleSend(chatInput)} style={{ width: 44, height: 44, borderRadius: "clamp(8px, 0.8vw, 12px)", border: "none", background: chatInput.trim() ? P.accent : P.border, color: "#fff", cursor: chatInput.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>↑</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ APP ═══ */
/* ═══ SPHERE LANDING PAGES ═══ */
const SPHERES = [
  { emoji: "💻", name: "SaaS / Tech", who: "CEO стартапа, 5-30 человек, pre-seed/seed",
    hero: "Runway горит, а дашборда для инвестора до сих пор нет",
    pains: ["Разработка медленная — а деньги тают каждый месяц. Runway 8 месяцев, а PMF всё ещё нет", "MRR, churn, LTV считаете в Google Sheets на глаз. Инвестор спросит — и вы 2 дня собираете цифры", "CTO перегружен на 160%, джуны не тянут без менторства, а вы сами ведёте спринты и продаёте"],
    fears: ["Деньги закончатся до product-market fit", "Конкуренты из YC выпускают фичи за неделю, а вы — за месяц"],
    trigger: "Инвестор попросил unit-economics дашборд — а его нет. Собирать из 5 источников — 2 дня работы CTO, которому и так некогда.",
    solution: "Аналитик-агент Mary собрал дашборд за 45 секунд. Менеджер-агент ведёт спринты. Разработчик-агент мониторит баги и uptime 24/7.",
    agents: ["📊 Аналитик", "📋 Менеджер", "💻 Разработчик", "🧮 Бухгалтер"] },
  { emoji: "🛒", name: "E-commerce", who: "Селлер WB/Ozon или владелец магазина, 1-15 человек",
    hero: "340 000 ₽ заморожено в товаре, а на рекламу денег нет",
    pains: ["Товар лежит на складе 3+ месяца без движения — деньги заморожены, а вы не знаете точные суммы", "Реальную маржу не считаете — Excel с ошибками, конкуренты демпингуют, вы реагируете с опозданием", "Возвраты и брак не отслеживаете до конца месяца — узнаёте о потерях когда уже поздно"],
    fears: ["Закупите партию на 500к — а она не продастся, кассовый разрыв", "Другие селлеры уже автоматизировали аналитику, а вы вручную"],
    trigger: "Остатки на 340к, денег на рекламу нет — замкнутый круг. Нужно распродать, но не знаете что именно.",
    solution: "Агент по запасам нашёл 47 позиций без движения с суммами. Распродали за неделю — высвободили 140к на трафик.",
    agents: ["📦 Складской", "🧮 Бухгалтер", "📊 Аналитик", "📣 Маркетолог"] },
  { emoji: "🎓", name: "EdTech", who: "Продюсер или эксперт, 3-20 человек",
    hero: "Очередной запуск в минус, а эксперт хочет уйти",
    pains: ["CPA вырос в 3 раза за год — юнит-экономика не сходится, каждый запуск как рулетка", "Контента нужно в 5 раз больше: Reels, статьи, email, вебинары — а людей не хватает", "Эксперт выгорает: записывает, продаёт, поддерживает студентов сам — ещё один запуск и он уйдёт"],
    fears: ["Вложите 500к в новый курс — и он не окупится, как предыдущий", "Все перешли на мини-курсы и Shorts, а у вас нет ресурса даже попробовать"],
    trigger: "Очередной запуск в минус. Эксперт говорит «я так больше не могу». А 47 подписок на сервисы сжирают бюджет.",
    solution: "Бухгалтер-агент нашёл 8 подписок которыми никто не пользуется — 67к/мес. Маркетолог-агент генерит контент 24/7.",
    agents: ["📣 Маркетолог", "🧮 Бухгалтер", "📋 Менеджер", "📊 Аналитик"] },
  { emoji: "🏠", name: "Недвижимость", who: "Директор агентства или брокер, 3-30 человек",
    hero: "Забыли позвонить клиенту — он подписал с конкурентом",
    pains: ["Сделки длятся 2-6 месяцев — клиенты теряются между этапами, забываете перезвонить", "Каждая сделка — 40+ страниц документов на проверку, юрист тратит 2 дня на один договор", "5 объектов одновременно — путаете этапы, клиент нервничает и уходит"],
    fears: ["Пропустите дедлайн по сделке на 15М — потеряете комиссию 450к", "Конкуренты уже с CRM и автообзвоном, а вы в блокноте"],
    trigger: "Забыли позвонить клиенту на этапе одобрения — он подписал с другим агентом. Потерянная комиссия — 450к.",
    solution: "Менеджер-агент ведёт воронку и напоминает. Юрист-агент проверяет договор за 10 минут вместо 2 дней.",
    agents: ["📋 Менеджер", "⚖️ Юрист", "🧮 Бухгалтер", "📣 Маркетолог"] },
  { emoji: "🏦", name: "Финтех", who: "CEO платёжного/кредитного сервиса, 10-100 человек",
    hero: "Аудитор нашёл несоответствие — штраф 500к",
    pains: ["Регуляторика ЦБ меняется каждый квартал — не успеваете отслеживать все изменения", "Compliance стоит 300к/мес на юристов, а они всё равно пропускают", "Один отчёт для ЦБ собирается 3 дня из разных систем"],
    fears: ["Пропустите требование ЦБ — штраф от 500к до отзыва лицензии", "Конкуренты автоматизировали KYC, а у вас 20 минут на клиента вручную"],
    trigger: "Аудитор нашёл несоответствие, которое пропустили 3 юриста. Штраф — 500к. И это не первый раз.",
    solution: "Юрист-агент мониторит изменения 24/7. Бухгалтер готовит отчёты автоматически. Замена 1 юриста = 300к/мес экономии.",
    agents: ["⚖️ Юрист", "🧮 Бухгалтер", "📊 Аналитик", "📋 Менеджер"] },
  { emoji: "👥", name: "HR / Рекрутинг", who: "Директор HR-агентства или HRD, 5-50 человек",
    hero: "Senior принял оффер конкурента, пока вы согласовывали",
    pains: ["Вакансии висят 45+ дней — нанимать мучительно долго, бизнес простаивает", "200 откликов на вакансию — скрининг вручную 3 дня, 90% нерелевантных", "Лучшие кандидаты принимают оффер за 48 часов, а вы думаете неделю"],
    fears: ["Потеряете ключевого сотрудника и не найдёте замену 3 месяца", "Компании с AI-скринингом закрывают вакансии за 2 недели, а вы за 2 месяца"],
    trigger: "Senior-разработчик принял оффер конкурента пока вы согласовывали зарплату внутри. Time-to-hire убивает.",
    solution: "HR-агент проскринил 200 откликов за 5 минут, выдал топ-10. Time-to-hire с 45 до 12 дней.",
    agents: ["👥 HR-агент", "📋 Менеджер", "📊 Аналитик", "🧮 Бухгалтер"] },
  { emoji: "⚖️", name: "Юридические", who: "Управляющий партнёр юрфирмы, 3-30 человек",
    hero: "Пропустили неустойку в договоре — клиент потерял 2М",
    pains: ["Проверка одного договора — 4 часа работы юриста, клиент ждёт и нервничает", "Документооборот съедает 40% рабочего времени партнёра — того, кто должен продавать", "Младшие юристы пропускают риски — приходится перепроверять каждый документ"],
    fears: ["Пропустите рисковый пункт — клиент подаст в суд на вас", "LegalTech-конкуренты проверяют договор за 5 минут онлайн"],
    trigger: "Пропустили пункт о неустойке в договоре с поставщиком. Клиент потерял 2М. Репутация под ударом.",
    solution: "Юрист-агент проверил 12 договоров за 10 минут, нашёл 3 критичных риска. Раньше это 4 часа юриста за 15к.",
    agents: ["⚖️ Юрист", "📋 Менеджер", "🧮 Бухгалтер", "📊 Аналитик"] },
  { emoji: "📱", name: "Медиа / Контент", who: "Главред, продюсер или блогер, 2-20 человек",
    hero: "Охваты упали на 60% после смены алгоритма",
    pains: ["Нужно 30 единиц контента в неделю, а команда делает 5 — не хватает рук", "Алгоритмы меняются — охваты падают, нужно адаптироваться за дни, а не недели", "Качество падает когда давите на количество — выбирать между ними невозможно"],
    fears: ["Алгоритм поменяется и охваты упадут в ноль за одну ночь", "Конкурент нанял AI-редакцию и выпускает контент в 6 раз больше"],
    trigger: "Охваты упали на 60% после очередного обновления алгоритма. Контент-план летит, дедлайны горят.",
    solution: "Маркетолог-агент генерит контент-план и драфты 24/7. Было 5 постов/нед — стало 25 без найма.",
    agents: ["📣 Маркетолог", "💻 Разработчик", "📋 Менеджер", "📊 Аналитик"] },
  { emoji: "🏭", name: "Производство", who: "Директор малого/среднего производства, 10-200 человек",
    hero: "Клиент вернул партию — убыток 800к и подорванное доверие",
    pains: ["Простой оборудования — каждый час = 50к потерь, а мониторинга нет", "Брак не отслеживается до отгрузки — узнаёте когда клиент возвращает", "Склад — хаос: пересортица, списания, неучтёнка, закупки сырья наугад"],
    fears: ["Партия брака уйдёт ключевому клиенту — потеряете контракт на 10М", "Конкуренты ставят MES-системы, а вы на бумажках"],
    trigger: "Клиент вернул партию из-за брака. Убыток 800к. Мастер смены скрывал проблему чтобы не портить отчёт.",
    solution: "Агент по запасам считает склад в реальном времени. Аналитик мониторит брак. Предотвращение одного возврата окупает Mary на год.",
    agents: ["📦 Складской", "📊 Аналитик", "📋 Менеджер", "🧮 Бухгалтер"] },
  { emoji: "🤝", name: "Услуги", who: "Эксперт-практик: консультант, врач, тренер, 1-50 человек",
    hero: "Заболели на неделю — потеряли 3 клиентов и 200к выручки",
    pains: ["Вы = бизнес. Клиенты ценят только ваше время, а его 24 часа в сутках", "Сам продаёте, консультируете, считаете, управляете — масштабироваться невозможно", "Чтобы нанять помощника нужно 100к/мес, которых нет — замкнутый круг"],
    fears: ["Уйдёте в отпуск на 2 недели — бизнес встанет, клиенты разбегутся", "Конкуренты ставят ботов и обрабатывают заявки 24/7, а вы спите"],
    trigger: "Заболели на неделю. Потеряли 3 клиентов и 200к выручки. Поняли что бизнес без вас не работает.",
    solution: "Менеджер-агент ведёт клиентов 24/7. Маркетолог генерит лиды. Команда агентов за 990₽/нед вместо помощника за 100к/мес.",
    agents: ["📋 Менеджер", "📣 Маркетолог", "🧮 Бухгалтер", "⚖️ Юрист"] },
  { emoji: "🎪", name: "Event", who: "Ивент-продюсер или владелец агентства, 2-15 человек",
    hero: "Кейтеринг отменился за 2 дня до ивента на 200 человек",
    pains: ["200+ задач на каждый ивент — что-то всегда забывается в последний момент", "Подрядчики срывают — нет плана Б, бюджет плывёт на 20-30% от сметы", "5 ивентов параллельно — путаете подрядчиков, дедлайны, клиентов"],
    fears: ["В день мероприятия что-то критичное пойдёт не так — репутация на кону", "Крупные агентства используют PM-системы, а вы в чатах и заметках"],
    trigger: "Кейтеринг отменился за 2 дня до ивента на 200 человек. Отчёт для клиента собираете 3 дня из хаоса.",
    solution: "Менеджер-агент ведёт чек-лист каждого ивента. Бухгалтер контролирует бюджет в реальном времени. Отчёт — за 45 секунд.",
    agents: ["📋 Менеджер", "🧮 Бухгалтер", "📣 Маркетолог", "📊 Аналитик"] },
];

function SphereLanding({ sphereIdx, onBack, onScan, onLogin }) {
  const s = SPHERES[sphereIdx];
  const [url, setUrl] = useState("");
  return (
    <div style={{ background: V.bg, fontFamily: V.sans }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px", background: V.white, borderBottom: "1px solid " + V.border, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: V.serif, fontSize: 22, fontWeight: 500, cursor: "pointer" }} onClick={onBack}>Mary<em style={{ fontStyle: "italic", color: V.accent }}>.</em></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, border: "1.5px solid " + V.border2, background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: V.sans, color: V.ink }}>← Назад</button>
          <Btn variant="outline" onClick={onLogin}>Войти</Btn>
        </div>
      </nav>

      {/* Hero with audit form */}
      <div style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>{s.emoji}</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Mary для {s.name}</div>
          <h1 style={{ fontFamily: V.serif, fontSize: 42, fontWeight: 500, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 16 }}>{s.hero}</h1>
          <p style={{ fontSize: 15, color: V.muted, marginBottom: 32 }}>{s.who}</p>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 8, background: V.white, border: "1.5px solid " + V.border, borderRadius: 8, padding: "6px 6px 6px 22px", boxShadow: V.shadow }}>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ссылка на ваш сайт..." style={{ flex: 1, border: "none", background: "none", outline: "none", padding: "8px 0", fontSize: 14, fontFamily: V.sans }} />
              <Btn onClick={() => onScan(url || "yoursite.com")}>Проверить бесплатно</Btn>
            </div>
            <p style={{ fontSize: 12, color: V.muted2, marginTop: 10 }}>30 секунд. Без регистрации. Без карты.</p>
          </div>
        </div>
      </div>

      {/* Боли */}
      <div style={{ padding: "60px 32px", background: V.white }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Знакомо?</div>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 32 }}>Боли, о которых вы не говорите вслух</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {s.pains.map((p, i) => (
              <div key={i} style={{ padding: "20px 24px", borderRadius: V.rLg, border: "1.5px solid " + V.border, background: V.bg, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: V.accent, fontWeight: 700, fontSize: 18, flexShrink: 0, marginTop: 2 }}>✕</span>
                <div style={{ fontSize: 15, color: V.ink2, lineHeight: 1.6 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Страхи и FOMO */}
      <div style={{ padding: "60px 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.warm, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Что не даёт спать</div>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 32 }}>Страхи фаундера</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {s.fears.map((f, i) => (
              <div key={i} style={{ padding: "20px 24px", borderRadius: V.rLg, border: "1.5px solid " + V.border, background: V.white }}>
                <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>{i === 0 ? "😰" : "⚡"}</span>
                <div style={{ fontSize: 14, color: V.ink2, lineHeight: 1.6 }}>{f}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Триггер */}
      <div style={{ padding: "60px 32px", background: V.ink }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: V.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Последняя капля</div>
          <p style={{ fontFamily: V.serif, fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 24 }}>{s.trigger}</p>
          <div style={{ width: 60, height: 2, background: V.pink, margin: "0 auto 24px", borderRadius: 8 }} />
          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6 }}>{s.solution}</p>
        </div>
      </div>

      {/* Агенты для этой сферы */}
      <div style={{ padding: "60px 32px", background: V.white }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: V.serif, fontSize: 28, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>Команда Mary для {s.name}</h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {s.agents.map((a, i) => (
              <div key={i} style={{ padding: "12px 20px", borderRadius: 8, border: "1.5px solid " + V.border, background: V.bg, fontSize: 14, fontWeight: 600, color: V.ink }}>{a}</div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => onScan("yoursite.com")} style={{ background: V.ink, color: "#fff", border: "none", borderRadius: 8, padding: "15px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: V.sans }}>Попробовать бесплатно →</button>
            <p style={{ fontSize: 12, color: V.muted2, marginTop: 10 }}>30 секунд. Без регистрации.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [scr, setScr] = useState("landing");
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [probIdx, setProbIdx] = useState(0);
  const [sphereIdx, setSphereIdx] = useState(0);
  function startScan(u) { setUrl(u); setScanning(true); }
  function go(s) { setScr(s); }
  return (
    <div>
      {scanning && <ScanOverlay url={url} onГотово={() => { setScanning(false); go("problems"); }} />}
      {scr === "landing" && <Landing onScan={startScan} onLogin={() => go("urlinput")} onSphere={(i) => { setSphereIdx(i); go("sphere"); }} />}
      {scr === "sphere" && <SphereLanding sphereIdx={sphereIdx} onBack={() => go("landing")} onScan={startScan} onLogin={() => go("urlinput")} />}
      {scr === "urlinput" && <UrlInput onScan={startScan} onSurvey={() => go("survey")} onBack={() => go("landing")} />}
      {scr === "survey" && <Survey onГотово={() => go("problems")} onBack={() => go("urlinput")} />}
      {scr === "problems" && <Problems url={url} onPick={(i) => { setProbIdx(i); go("chat"); }} onBack={() => go("landing")} />}
      {scr === "chat" && <ChatScreen problemIdx={probIdx} onContinue={() => go("meet")} onBack={() => go("problems")} onSwitch={(i) => setProbIdx(i)} />}
      {scr === "meet" && <MeetTeam onContinue={() => go("onboard")} />}
      {scr === "onboard" && <Onboard onГотово={() => go("dash")} />}
      {scr === "dash" && <Dash onReset={() => go("landing")} />}
    </div>
  );
}
```
