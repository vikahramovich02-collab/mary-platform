# Design QA — карточка психолога Intreatment

- Source visual truth 1: `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_Z1CBfp/Снимок экрана 2026-07-30 в 20.08.51.png`
- Source visual truth 2: `/var/folders/j0/2qtxy6r93v54x53jc04n5gf40000gn/T/TemporaryItems/NSIRD_screencaptureui_x8VduR/Снимок экрана 2026-07-30 в 20.09.21.png`
- Browser-rendered implementation: недоступна — подключённый браузер не найден.
- Viewport and implementation dimensions: проверить не удалось.
- State: карточка рекомендованного психолога в чате.

## Implemented

- Рейтинг и стаж удалены из карточки.
- Сохранены стоимость, длительность и состояние ближайшей записи.
- Плашки получили компактный белый фон, тонкую серую рамку, радиус 6 px и спокойный серый текст по первому референсу.
- Положение информации сохранено справа, как во втором референсе.

## Verification

- Production build: passed.
- Targeted interaction and source tests: 9 passed.
- Full-view comparison: blocked because a browser-rendered capture is unavailable.
- Focused comparison: blocked for the same reason.
- Browser console: not checked.

## Remaining finding

- [P2] Нужна проверка реального переноса длинной плашки на mobile/tablet/desktop после публикации или открытия локального preview в браузере.

final result: blocked
