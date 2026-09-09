## 6 · Surfaces · SF

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **SF-1** | Поверхность = белый фон на сером фоне страницы (SH-3), не рамка на белом, как у Career | во всех карточках/блоках | 14/14 косвенно | HIGH |
| **SF-2** | `Block` — универсальная обёртка секции: header (eyebrow uppercase ИЛИ крупный) + body (9 именованных вариантов плотности) + footer | Storybook `Block`, 5 story | Storybook-only, не в 101 production-файле | MEDIUM |
| **SF-3** | Плотность body у `Block` называется по **смыслу расположения** (`condensed`/`stucked`/`island`/`equal`), а не по размеру (Career: size-s/size-m) | `ui/components/block.css` | Storybook-only | MEDIUM |
| **SF-4** | `.tm-block_variant-border-bottom` рисует разделитель через `inset box-shadow`, не `border` — не меняет box model | CSS | Storybook-only | HIGH (сам факт CSS однозначен) |
| **SF-5** | `BorderedCard` — облегчённая альтернатива `Block`: только рамка + padding, без header/footer/вариантов | production, `page-article.html` (related-статьи) | 3/16 | MEDIUM |

---
