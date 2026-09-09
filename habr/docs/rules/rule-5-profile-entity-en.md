## 5 · Profile / Entity · EN

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **EN-1** | **Identity-карточка сущности — в верхней части главной колонки, не в сайдбаре.** Подтверждено позиционным сравнением DOM на всех трёх страницах | `tm-hub-card`/`user-card`/`tm-company-profile-card` идут в разметке раньше `tm-page__sidebar` | 3/14 | HIGH |
| **EN-2** | То же построение (identity вверху главной колонки) повторяется в admin: карточка компании в admin-дашборде устроена тем же способом | скриншот admin-дашборда (Figma) | 1 доп. наблюдение, другая среда | MEDIUM — кросс-подтверждение, но разные источники |
| **EN-3** | Сайдбар сущности несёт **вторичные факты** (`DescriptionList`: специализация/квалификация/навыки), не идентичность | `tm-user-basic-info`, `tm-user-specialization` | 3/14 (user, company явно; hub не проверен детально) | MEDIUM |
| **EN-4** | Действие «Подписаться»/«Написать» — на identity-карточке, рядом с сущностью, не в конце страницы | `tm-button-follow` внутри `tm-hub-card`/`tm-company-profile-card` | 3/14 | HIGH |
| **EN-5** | Три identity-модуля (`hub-card`/`user-card`/`company-profile-card`) наблюдались с **разными наборами полей** — не один параметризуемый компонент | сравнение разметки трёх страниц | 3/3 внутри семейства | MEDIUM |
| **EN-6** | Под identity-карточкой — `Tabs` навигации по разделам сущности, затем либо `ArticleCard`-фид (hub/company), либо `Block`-секции (user: badges, description-list) | разметка трёх страниц | 3/14 | MEDIUM |

---
