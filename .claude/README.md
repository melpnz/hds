# Конвейер сборки пакетов знаний

`/guide <ссылки>` — точка входа. Дальше конвейер идёт сам: инвентаризует продукт,
строит роадмап, верстает элементы, ревьюит их против Figma и продакшена, правит
по находкам и принимает шаги коммитами.

```
skills/guide          оркестратор — ведёт весь цикл
skills/guide-spec     1. ТЗ и роадмап            → agents/guide-scout
skills/guide-build    2. снять и сверстать       → agents/guide-builder
skills/guide-review   3. ревью против источников → agents/guide-reviewer
skills/guide-fix      4. правки по ревью         → agents/guide-builder
skills/guide-accept   5. приёмка шага            → agents/guide-acceptor

guide/METHOD.md            общий контракт: структура пакета, иерархия источников, запреты
guide/spec-template.md     шаблон спецификации компонента
guide/review-checklist.md  20 проверок ревью и severity
guide/capture.mjs          скрипт съёмки DOM, computed styles, токенов и скриншотов
```

Образец готового пакета — `career/`. Он read-only: конвейер на него равняется,
но ничего в нём не меняет.

Скиллы 1–5 вызываются и по отдельности (`/guide-build`, `/guide-review`, …), когда
нужен один шаг, а не весь цикл.
