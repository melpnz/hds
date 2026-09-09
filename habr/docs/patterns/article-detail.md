## 4 · ARTICLE / CONTENT DETAIL

| | |
|---|---|
| **Источники** | production: `article` |
| **Наблюдений** | 1 страница |
| **Production/Figma** | Production |
| **Confidence** | LOW-MEDIUM (одно наблюдение, но богатое) |
| **Статус** | **CONFIRMED** (как факт), **PARTIAL** (как обобщаемое правило) |

**Layout regions.** Shell → главная колонка: заголовок статьи (`Title`)
→ метаданные (дата, автор — `user-card`-подобный блок) → тело статьи
→ `article-poll` (опционально) → `tm-notice` → `tabs` (переключатель
«Комментарии/Похожие» — ведёт к §5) → related `article-snippet` список.
Сайдбар пуст для гостя.

**Hierarchy.** Контент статьи первичен и монополизирует главную колонку;
всё остальное — довесок под текстом, не сбоку.

**Reusable modules.** `user-card` (карточка автора, не специфицирован
отдельно — MODULE, требует отдельного разбора), `tm-notice`, `tabs`,
`article-poll` (page-bound), related `article-snippet`.

**Primary actions.** Не найдено явной CTA в захваченном срезе (гость не
видит формы отклика/действий автора) — **GAP**.

**Responsive.** Не проверено детально на этой итерации — GAP.

**States.** `ST-guest`: гость не видит формы, требующие входа (см. §9
`ADJACENT/OUTSIDE`).

---
