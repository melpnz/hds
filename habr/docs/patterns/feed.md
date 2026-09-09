## 2 · CONTENT FEED / LISTING

| | |
|---|---|
| **Источники** | production: `feed`, `articles-all`, `news`, `hub`, `company`, `user-posts`, `sandbox` |
| **Наблюдений** | 7 страниц |
| **Production/Figma** | Production |
| **Confidence** | HIGH |
| **Статус** | **CONFIRMED** |

**Layout regions.** Shell → главная колонка: (опционально) H1 + Tabs
(поток-навигация, `.tabs.tm-tabs_page-header`) → вертикальный список
`article-snippet` → `tm-pagination`. Сайдбар пуст для гостя (см. §1), кроме
`user-posts` (facts-блок автора).

**Hierarchy.** Список карточек первичен; H1/Tabs — второстепенная
навигация над списком, не всегда есть (`feed` без Tabs — лента
персональная, `articles-all`/`news`/`hub`/`sandbox` — с Tabs).

**Reusable modules.** `article-snippet` (MODULE, 9/16, **не специфицирован
отдельно — стал критичным для этого паттерна**, см. чекпойнт §6),
`tm-pagination` (специфицирован), `tabs` (специфицирован).

**Primary actions.** Нет общего для всех — на `feed` есть форма фильтра
типов публикаций (`checkbox` + `my-feed-filter`, page-bound).

**Responsive.** Список не меняет структуру (одна колонка карточек на всех
ширинах) — сжимается вместе с главной колонкой.

**States.** Не наблюдалось пустого результата ни на одной из 7 страниц
(везде были статьи). **GAP.**

---
