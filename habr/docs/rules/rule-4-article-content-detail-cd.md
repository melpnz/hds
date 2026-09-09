## 4 · Article / Content Detail · CD

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **CD-1** | Контент статьи монополизирует главную колонку — ничего не стоит сбоку от текста | `article` | 1/14 | MEDIUM (одно наблюдение) |
| **CD-2** | Порядок под текстом: (опционально) опрос → `Notice` → `Tabs` (Комментарии/Похожие) → related `ArticleCard` | `article` | 1/14 | MEDIUM |
| **CD-3** | Комментарии — отдельная подстраница (`/comments/`), не разворачиваются на той же странице | `article-comments` — отдельный URL с той же оболочкой | 2/14 (article + article-comments) | MEDIUM |
| **CD-4** | Явной CTA гостю на странице статьи не найдено | `article` | 1/14 | GAP |
| **CD-5** | Заголовок статьи — **32px/40px Fira Sans w500**, не базовые 24px `.tm-title_h1`. Модификатор `.article-snippet.full-article` увеличивает title детальной страницы | `getComputedStyle` на живом `habr.com/ru/articles/…`, CSS-правило найдено Visual Foundations pass'ом — было пропущено при первой выборке | 1/14, дважды подтверждено (CSS + рендер) | HIGH |

---
