## 3 · Directory Listing · DR

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **DR-1** | Тот же каркас, что FD (Shell → Tabs → список → Pagination), но список — карточки сущностей, не статей | `hubs-list`, `companies-list`, `authors` | 3/14 | MEDIUM |
| **DR-2** | Каждый тип directory использует **свою** карточку сущности — не общий переиспользуемый модуль, в отличие от `ArticleCard` | `.tm-hub` / компания / `.author-item` — три разных класса | 3/3 внутри семейства | MEDIUM |
| **DR-3** | Сайдбар в directory функционален чаще, чем пуст: фильтр (`companies-list`) или статистика (`authors`); `hubs-list` — пуст, как FD | DOM-срез сайдбара | 2/3 заполнены | MEDIUM |

---
