## 12 · SERVICE / ERROR

| | |
|---|---|
| **Источники** | Figma `🧶habr`, node `30995:354578`; локальные SVG-заглушки |
| **Confidence** | HIGH |
| **Статус** | **CONFIRMED по Figma** |

Глобальные варианты: 401, 403, 404, 451, 500, 502, 503 и 504; кроме них
есть продуктовые заглушки для поиска, блокировок, компаний и дайджеста.
Общая композиция: шапка → адаптивная SVG-иллюстрация (480×240 на desktop,
280×140 на mobile) → код/заголовок → пояснение → recovery action. В гайд
включены 403, 404 и 500 как базовые разновидности; остальные используют
тот же каркас и соответствующий локальный SVG.

---

## Свод по статусам

| Семейство | Статус | Источник |
|---|---|---|
| Shell | CONFIRMED | Production |
| Content feed/listing | CONFIRMED | Production |
| Directory listing | CONFIRMED | Production |
| Article detail | CONFIRMED | Production |
| Article comments | CONFIRMED | Production |
| Profile/entity | CONFIRMED | Production (+ Figma admin, кросс-подтверждение) |
| Search | CONFIRMED | Production |
| Editor/content creation | CONFIRMED | Figma, полный экран 1024/768/320 |
| Admin — section screen | CONFIRMED | Figma |
| Admin — form/wizard | CONFIRMED | Figma |
| Admin — management list | CONFIRMED | Figma |
| Modal/overlay | CONFIRMED | Storybook + Figma usage |
| Settings/forms вне admin | CONFIRMED | Figma |
| Service/error | CONFIRMED | Figma + локальные SVG |
