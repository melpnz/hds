# Аудит исторических страниц

Проведён 2 октября 2026 года после сборки двенадцати живых Vue/Nuxt-страниц.

Шесть записей прежнего раздела «Страницы» были статическими HTML-срезами
production от 7 сентября 2026 года. Они использовали preview-adapter вместо
production-карусели и не собирались из компонентов текущего Courses UI Kit.
Поэтому они не являются более качественной основой для новых страниц.

| Историческая запись | Актуальная замена | Что перенесено |
|---|---|---|
| `courses-listing` | `production-courses-listing` | sequence, sticky-header, rubric navigation, SEO-хвост |
| `education-centers-listing` | `production-education-centers-listing` | hero, SearchForm, сетка школ, ленты и LinkGrid |
| `rating` | `production-rating` | hero, поля поиска, full-bleed mobile RatingTable |
| `education-center` | `production-education-center` | EntityHeader, лимиты 8/6/4, ленты и InfoTable |
| `authors` | `production-authors` и `production-editors` | panel overlap, шаги 4/2/1, люди 4/3/1 |
| `author` | `production-author` | PersonHeader, семантика разделов, ProfileHistory 2/1 |

Полезные сведения сохранены в трёх канонических слоях:

- адресные sequence, measurements, boundary measurements и notes —
  `machine/page-analysis/pages/*.json`;
- общие правила композиции — `machine/page-analysis/source.json` и
  `docs/guide/production-pages.md`;
- неизменённые DOM/CSS и скриншоты — в `evidence/`, включая локальные
  production-reference.

Итог: исторические machine-patterns, их подробные Markdown-рецепты и статические
HTML-превью не содержат уникального действующего контракта. Они удаляются из
основного гайда. Evidence и архив v0.1 сохраняются; пустые, loading и backend-error
состояния по-прежнему не считаются исследованными.
