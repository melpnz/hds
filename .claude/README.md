# Конвейер сборки пакетов знаний

`/guide <ссылки>` — точка входа. Конвейер инвентаризует продукт (или сверяет
существующий гайд с источниками), строит роадмап, верстает элементы, ревьюит их
против Figma и продакшена, правит по находкам, собирает ключевые страницы,
выводит из них дизайн-принципы, делает машиночитаемый слой и принимает шаги
коммитами. Компоненты обрабатываются batch по 2–4 элемента одного семейства.

```
skills/guide             оркестратор — ведёт весь цикл
skills/guide-audit       0. сверка существующего пакета     → agents/guide-scout
skills/guide-spec        1. ТЗ и роадмап                    → agents/guide-scout
skills/guide-build       2. снять и сверстать               → agents/guide-builder
skills/guide-review      3. ревью против источников         → agents/guide-reviewer
skills/guide-fix         4. правки по ревью                 → agents/guide-builder
skills/guide-accept      5. приёмка шага                    → agents/guide-acceptor
skills/guide-pages       6. ключевые страницы и блоки       → agents/guide-builder
skills/guide-principles  7. дизайн-принципы из страниц      → agents/guide-analyst
skills/guide-machine     8. машинный слой и AGENTS.md       → agents/guide-analyst

guide/METHOD.md            короткий маршрутизатор фаз и областных документов
guide/core-contract.md     предмет, факт/GAP, две проекции и границы
guide/package-layout.md    структура человеко- и машиночитаемого пакета
guide/evidence.md          источники, съёмка и экономное чтение evidence
guide/naming-states.md     канонические имена, категории, виды и состояния
guide/package-invariants.md проверяемые инварианты результата
guide/principles-method.md пороги доказательности дизайн-принципов
guide/guide-structure.md   разделы гайда и устройство статей — по образцу Контур.Гайдов
guide/writing-style.md     тон, формулировки, три уровня запретов, примеры парами
guide/spec-template.md     шаблон статьи о компоненте
guide/principles-axes.md   17 осей вывода правил и пороги доказательности
guide/machine-layer.md     схемы machine/*.json и контракт для модели-потребителя
guide/review-checklist.md  40 проверок ревью и severity
guide/capture.mjs          съёмка DOM, computed styles, токенов и скриншотов
guide/query-evidence.mjs   компактный срез computed.json по selector и свойствам
guide/validate-step.mjs    автоматические гейты элемента или batch
```

Результат — гайд в двух проекциях: человекочитаемой (разделы, статьи, примеры)
и машиночитаемой (`machine/*.json` + `AGENTS.md`), по которой модель собирает
интерфейс, не читая текста.

Эталон организации — [Контур.Гайды](https://guides.kontur.ru/). Структура
готового пакета описана в `guide/package-layout.md`; `career/` в репозитории —
замороженный пример, конвейер его не читает и не меняет.

Каждый фазовый skill запускается в профильном изолированном агенте и вызывается
отдельно (`/guide-review`, `/guide-pages`, `/guide-principles`, …), когда нужен
один шаг. `/guide` оркестрирует те же входы для полного цикла; лишнего слоя
`agent → выбор skill` в этом маршруте нет.

`image-slerm` создаёт тематические иллюстрации для блоков лендинга по локальным
оригиналам. Он ищет 1–2 референса скриптом, сохраняет результат как локальный
asset и фиксирует применение одновременно в `docs/guide/assets.md` и
`machine/assets.json`.
