## 3 · DIRECTORY LISTING

| | |
|---|---|
| **Источники** | production: `hubs-list`, `companies-list`, `authors` |
| **Наблюдений** | 3 страницы |
| **Production/Figma** | Production |
| **Confidence** | MEDIUM (3 наблюдения, но структурно однородны) |
| **Статус** | **CONFIRMED** |

Формально похоже на §2 (Shell → Tabs → список → Pagination), но список —
не статьи, а карточки сущностей (`.tm-hub`, компании, `.author-item`), и,
в отличие от §2, **сайдбар населён функционально**: `companies-list` —
фильтр («Фильтр» + счётчик), `authors` — статистика («Статистика»,
«Всего»), `hubs-list` — пуст (как §2).

**Reusable modules.** Карточка сущности в списке — своя на каждый тип
(не единый модуль, в отличие от `article-snippet`), не специфицирована
(page-bound по source-map). `tm-companies-filter` — page-bound.

**Primary actions.** Подписка/переход в сущность — на самой карточке,
не на уровне страницы.

**Responsive.** Не проверено детально — GAP.

**States.** Не наблюдалось.

---
