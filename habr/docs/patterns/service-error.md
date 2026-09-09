## 12 · SERVICE / ERROR

| | |
|---|---|
| **Источники** | нет — `/articles/999999999/` вернул HTTP 404 без тела ответа |
| **Confidence** | — |
| **Статус** | **MISSING** |

В отличие от Career, где 404 отдавал полноценную HTML-страницу с версткой,
Habr отдаёт пустой 404-ответ на этом пути (либо редиректит, либо не рендерит
SPA-страницу ошибки на сервере) — не удалось получить ни одного факта
о служебном экране. Честный пробел, не грех, не дозаполнять.

---

## Свод по статусам

| Семейство | Статус | Источник |
|---|---|---|
| Shell | CONFIRMED | Production |
| Content feed/listing | CONFIRMED | Production |
| Directory listing | CONFIRMED | Production |
| Article detail | CONFIRMED / PARTIAL | Production |
| Article comments | PARTIAL | Production |
| Profile/entity | CONFIRMED | Production (+ Figma admin, кросс-подтверждение) |
| Search | PARTIAL | Production |
| Editor/content creation | MISSING | Figma (иконки, не композиция) |
| Admin — section screen | CONFIRMED | Figma |
| Admin — form/wizard | CONFIRMED | Figma |
| Admin — management list | CONFIRMED | Figma |
| Modal/overlay | CONFIRMED (компонент) / PARTIAL (паттерн) | Storybook |
| Settings/forms вне admin | MISSING | — |
| Service/error | MISSING | — |
