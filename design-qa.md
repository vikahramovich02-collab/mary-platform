# Design QA — страница «Процессы»

- Source visual truth: `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_fTD2u7/Снимок экрана 2026-07-30 в 17.15.20.png`
- Browser-rendered implementation: `/private/tmp/mary-processes-default.png`
- Full comparison: `/private/tmp/mary-processes-comparison-final.png`
- Focused comparison: `/private/tmp/mary-processes-focused-comparison.png`
- Source pixels: `2468 × 1422`
- Implementation pixels: `1600 × 922`
- CSS viewport: `1600 × 922`
- Device scale factor: `1`
- Density normalization: source proportionally scaled and padded to `1600 × 922`; implementation captured at `1600 × 922`
- State: desktop, default filter `Все`, three connected and three available processes

## Full-view comparison evidence

The normalized side-by-side comparison confirms the same page hierarchy and rhythm: title and description, filter/search row, connected section, available section, compact rows, left icons, and right switches. The sidebar intentionally follows the newer MVP navigation contract rather than the obsolete items visible in the reference.

## Focused region comparison evidence

The focused filter/row comparison confirms matching pill geometry, search-field height, section dividers, row height, title/description hierarchy, icon containers, and switch sizing/alignment.

## Findings

No actionable P0/P1/P2 differences remain.

Accepted intentional differences:

- The implementation uses the final MVP sidebar: `Главная`, `Процессы`, `Чат`, `Обращения`, `Контакты`, `База знаний`, `Подключения`, `Команда`.
- Process switching opens an impact preview and requires explicit confirmation, as required by the Mary product contract.

## Required fidelity surfaces

- Fonts and typography: existing Mary font stack retained; title corrected from 42 px to 32 px to match the reference hierarchy.
- Spacing and layout rhythm: content width adjusted to 1140 px; header-to-filter gap and row density now align with the source.
- Colors and visual tokens: neutral Mary palette retained with one blue semantic accent for active switches.
- Image quality and asset fidelity: no raster content is required; existing project outline icons are used consistently.
- Copy and content: filters, section labels, process names, descriptions, and search placeholder match the selected reference and current Mary terminology.

## Primary interactions tested

- initial application render;
- navigation to `Процессы`;
- `Рекомендуемые` filter;
- switch count and state;
- impact-preview dialog;
- cancel action.

Browser console errors checked: none.

## Comparison history

1. Initial browser pass found a runtime P0: the process icon component was invoked without a props object. Fixed with an explicit empty props object; the complete screen then rendered.
2. First visual pass found P2 drift: title was too large and content column too wide. Reduced the title from 42 px to 32 px, tightened the header gap, and adjusted the content width.
3. Second visual pass found minor column-width drift. Adjusted the content maximum from 1080 px to 1140 px. The final full and focused comparisons show no actionable P0/P1/P2 differences.

## Follow-up polish

- P3: verify the same density on the user's exact desktop scaling if a new screenshot shows OS-level font rasterization differences.

final result: passed

---

# Design QA — состояния цифрового отдела

- Product contract:
  - `/Users/vika/Documents/Codex/2026-07-24/new-chat/mary-unified-platform/BUSINESS_PROCESS_DEPARTMENT_STATES.md`
- Visual sources:
  - `docs/assets/process-states/01-setup.png`
  - `docs/assets/process-states/02-active.png`
  - `docs/assets/process-states/03-needs-decision.png`
  - `docs/assets/process-states/04-integration-error.png`
- Browser-rendered implementation:
  - `/private/tmp/mary-department-active.png`
  - `/private/tmp/mary-department-setup.png`
  - `/private/tmp/mary-department-error.png`
  - `/private/tmp/mary-department-paused.png`
- Desktop viewport: `1440 × 1000`

## Contract alignment

- The screen is read-first and explains a digital department rather than
  exposing a technical editor.
- Header has one state-dependent Mary action and a separate rare-actions menu.
- Active, setup, decision, employee, integration-error, and paused states share
  one stable page structure.
- Connections, knowledge files, participants, and their business roles live in
  one expandable resource block.
- Test run, history, duplicate, pause/resume, archive, and delete are grouped in
  the `⋮` menu. Important and destructive actions show impact before applying.
- Trigger, AI-agent, employee, and condition nodes retain black, blue, yellow,
  and neutral semantic treatments.

## Browser checks

- active department and value metrics;
- all resource accordions;
- department-level Mary context;
- history entry and return to workflow;
- duplicate feedback;
- pause confirmation and paused state;
- setup checklist on `Возврат клиентов`;
- safe fallback and recovery on `Поддержка клиентов`;
- browser runtime errors: none.

No actionable P0/P1/P2 differences remain.

final result: passed

---

# Design QA — страница «Главная»

- Source visual truth:
  - `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_YqaLCi/Снимок экрана 2026-07-31 в 16.18.47.png`
- Browser-rendered implementation:
  - `/private/tmp/mary-home-desktop.png`
  - `/private/tmp/mary-home-mobile.png`
  - `/private/tmp/mary-home-comparison-final.png`
- Desktop viewport: `2068 × 1462`, DPR `1`
- Mobile viewport: `390 × 844`
- State: default Home screen

## Comparison evidence

The normalized full-view comparison confirms the reference hierarchy and
rhythm: expanded navigation, compact title area, three summary metrics,
decision queue, Mary results, and the integration status footer. Focused visual
inspection covered the navigation density, decision rows, metric dividers, and
bottom status links.

## Findings and fixes

1. P2: the previous compact navigation was narrower and omitted several product
   sections. Restored the complete menu and counters, set the sidebar to 300 px,
   and aligned 44 px menu rows with the reference.
2. P2: the first implementation was visually too small at the reference
   viewport. Increased the page typography and vertical rhythm while retaining
   the existing Mary tokens and restrained border treatment.
3. P2: dashboard content was initially static. Connected the decision rows to
   Inbox, the result footer to Analytics, the service status to Integrations,
   and the primary Mary action to its dialog.
4. P3: menu icons are loaded from the existing Tabler icon source used by the
   prototype. They may be localized later if a fully offline build is required.

## Primary interactions tested

- initial Home render;
- period selection;
- opening and closing the Mary dialog;
- decision-row transition to Inbox;
- return through the Home navigation item;
- transitions to Analytics and Integrations;
- mobile layout and horizontal-overflow check;
- browser runtime errors: none.

No actionable P0/P1/P2 differences remain.

final result: passed

---

# Design QA — страница «База знаний»

- Source visual truth:
  - `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_4yxBeI/Снимок экрана 2026-07-31 в 00.42.41.png`
  - `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_LtSHgM/Снимок экрана 2026-07-31 в 00.42.52.png`
  - `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_u9IDco/Снимок экрана 2026-07-31 в 00.43.02.png`
- Browser-rendered implementation:
  - `/private/tmp/mary-kb-list.png`
  - `/private/tmp/mary-kb-drawer.png`
  - `/private/tmp/mary-kb-add.png`
  - `/private/tmp/mary-kb-mobile.png`
- Desktop viewport: `1600 × 1050`
- Mobile viewport: `390 × 844`
- States: list, selected source drawer, add-with-Mary modal, responsive list

## Comparison evidence

The implementation reproduces the reference hierarchy: compact page heading,
three-part source summary, segmented filters, right-aligned search, bordered
source table, recommendations, a fixed right detail drawer, and a centered
add-with-Mary modal.

The current Mary navigation is intentionally retained. Source and action icons
use local image assets; Google Drive uses the official multicolor mark.

## Findings and fixes

1. P1: mobile table metadata remained visible because inline `display` overrode
   responsive CSS. Fixed with a scoped responsive override.
2. P2: the cropped Mary brand glyph exposed the first letter of the wordmark.
   Tightened the crop to show only the symbol.
3. P2: the first Google Drive asset was monochrome. Replaced it with the
   official multicolor product icon used by the reference.
4. P3: typography is slightly denser than the source because the existing Mary
   interface uses a more compact global scale. This is intentional and keeps
   the screen aligned with adjacent prototype pages.

## Primary interactions tested

- initial render and navigation to `База знаний`;
- opening and closing `Услуги и цены`;
- opening and closing `Добавить знания`;
- desktop list, drawer, and modal captures;
- mobile navigation, responsive list, and horizontal-overflow check;
- browser runtime errors: none.

No actionable P0/P1/P2 differences remain.

final result: passed
