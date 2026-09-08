# Конвейер сборки пакетов знаний

`/guide <ссылки>` — точка входа. Конвейер инвентаризует продукт (или сверяет
существующий гайд с источниками), строит роадмап, верстает элементы, ревьюит их
против Figma и продакшена, правит по находкам, собирает ключевые страницы,
выводит из них дизайн-принципы, делает машиночитаемый слой и принимает шаги
коммитами.

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

guide/METHOD.md            общий контракт: режимы, виды продукта, источники, инварианты
guide/guide-structure.md   разделы гайда и устройство статей — по образцу Контур.Гайдов
guide/writing-style.md     тон, формулировки, три уровня запретов, примеры парами
guide/spec-template.md     шаблон статьи о компоненте
guide/principles-axes.md   17 осей вывода правил и пороги доказательности
guide/machine-layer.md     схемы machine/*.json и контракт для модели-потребителя
guide/review-checklist.md  40 проверок ревью и severity
guide/capture.mjs          съёмка DOM, computed styles, токенов и скриншотов
```

Результат — гайд в двух проекциях: человекочитаемой (разделы, статьи, примеры)
и машиночитаемой (`machine/*.json` + `AGENTS.md`), по которой модель собирает
интерфейс, не читая текста.

Эталон организации — [Контур.Гайды](https://guides.kontur.ru/). Структура
готового пакета описана в `guide/METHOD.md` §2; `career/` в репозитории —
замороженный пример, конвейер его не читает и не меняет.

Скиллы вызываются и по отдельности (`/guide-audit`, `/guide-pages`,
`/guide-principles`, …), когда нужен один шаг, а не весь цикл.
