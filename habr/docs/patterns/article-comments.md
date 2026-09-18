## 5 · ARTICLE COMMENTS

| | |
|---|---|
| **Источники** | production: `https://habr.com/ru/articles/1006666/comments/` |
| **Наблюдений** | 1 страница, 867 веток комментариев |
| **Production/Figma** | Production |
| **Confidence** | HIGH для дерева и оболочки |
| **Статус** | **CONFIRMED** |

Вариант §4: та же оболочка и колонка 660px, но сверху остаётся краткая
`.tm-article-comments__article-body`, а основным содержимым становится
`.tm-article-comments` → `.tm-comments-wrapper` → pinned comments →
`.tm-comments__tree`. Узел дерева — `.tm-comment-thread`; вложенность
задаётся `.tm-comment-thread__children` и уровнями отступа, внутри находятся
user info, body, голосование и действия. На мобильном структура сохраняется,
но горизонтальный отступ ветки уменьшается. На desktop справа расположен
контентный сайдбар: слот 300×600 → «Читают сейчас» → stories → слот 300×250;
на mobile он не участвует в потоке.

---
