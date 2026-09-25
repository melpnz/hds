# Courses · аудит preview активного provider

Отчёт генерируется из machine-каталога, provider mapping и `machine/aliases.json`.
В интегрированном режиме реализация provider является основным визуальным
источником. Статические HTML-примеры сохраняются как fallback для GitHub Pages;
при state-gap они также остаются проверяемым примером отсутствующего состояния.

## Итог

- прямых component mappings: **72**;
- provider-primary: **69**;
- hybrid из-за state-gap: **3**;
- минимальных redirects старых имён: **9**.

## Компоненты

| Guide id | Стратегия | Не хватает в provider | Статический fallback |
|---|---|---|---|
| `ad-card` | provider-primary | — | `examples/components/ad-card/index.html` |
| `ad-slot` | provider-primary | — | `examples/components/ad-slot/index.html` |
| `article-card` | provider-primary | — | `examples/components/article-card/index.html` |
| `authors-block` | provider-primary | — | `examples/components/authors-block/index.html` |
| `avatar` | provider-primary | — | `examples/components/avatar/sizes.html`<br>`examples/components/avatar/index.html` |
| `avatar-stack` | provider-primary | — | `examples/components/avatar-stack/index.html` |
| `breadcrumbs` | provider-primary | — | `examples/components/breadcrumbs/index.html` |
| `button` | provider-primary | — | `examples/components/button/index.html` |
| `button-group` | hybrid | `loading` | `examples/components/button-group/index.html`<br>`examples/components/button-group/hero.html` |
| `card-grid` | provider-primary | — | `examples/components/card-grid/index.html` |
| `carousel` | provider-primary | — | `examples/components/carousel/index.html` |
| `catalog-menu` | provider-primary | — | `examples/components/catalog-menu/index.html` |
| `checkbox` | hybrid | `loading` | `examples/components/checkbox/index.html` |
| `chip` | provider-primary | — | `examples/components/chip/index.html` |
| `course-card` | provider-primary | — | `examples/components/course-card/index.html` |
| `demand-chart` | provider-primary | — | `examples/components/demand-chart/index.html` |
| `empty-state` | provider-primary | — | `examples/components/empty-state/index.html` |
| `entity-header` | provider-primary | — | `examples/components/entity-header/index.html` |
| `entity-logo` | provider-primary | — | `examples/components/entity-logo/sizes.html`<br>`examples/components/entity-logo/index.html` |
| `faq-block` | provider-primary | — | `examples/components/faq-block/index.html` |
| `faq-item` | provider-primary | — | `examples/components/faq-item/index.html` |
| `feedback-form` | provider-primary | — | `examples/components/feedback-form/index.html` |
| `filter-bar` | provider-primary | — | `examples/components/filter-bar/index.html` |
| `filter-chip` | provider-primary | — | `examples/components/filter-chip/index.html`<br>`examples/components/filter-chip/menu-switch.html` |
| `filter-modal` | provider-primary | — | `examples/components/filter-modal/index.html` |
| `header-dropdown` | provider-primary | — | `examples/components/header-dropdown/index.html` |
| `icon-button` | provider-primary | — | `examples/components/icon-button/index.html` |
| `info-table` | provider-primary | — | `examples/components/info-table/index.html` |
| `informer` | provider-primary | — | `examples/components/informer/index.html` |
| `learning-step` | provider-primary | — | `examples/components/learning-step/index.html` |
| `link` | provider-primary | — | `examples/components/link/index.html` |
| `link-grid` | provider-primary | — | `examples/components/link-grid/index.html` |
| `loader` | provider-primary | — | `examples/components/loader/index.html` |
| `mobile-menu` | provider-primary | — | `examples/components/mobile-menu/index.html` |
| `modal` | provider-primary | — | `examples/components/modal/index.html` |
| `multi-select` | provider-primary | — | `examples/components/multi-select/index.html` |
| `numbered-course-item` | provider-primary | — | `examples/components/numbered-course-item/index.html` |
| `option-item` | provider-primary | — | `examples/components/option-item/index.html` |
| `option-list` | provider-primary | — | `examples/components/option-list/index.html` |
| `page-hero` | provider-primary | — | `examples/components/page-hero/index.html` |
| `page-toc` | provider-primary | — | `examples/components/page-toc/index.html` |
| `pagination` | provider-primary | — | `examples/components/pagination/index.html` |
| `person-card` | provider-primary | — | `examples/components/person-card/index.html` |
| `person-header` | provider-primary | — | `examples/components/person-header/index.html` |
| `price-sheet` | provider-primary | — | `examples/components/price-sheet/index.html` |
| `profession-card` | provider-primary | — | `examples/components/profession-card/index.html` |
| `profile-history` | provider-primary | — | `examples/components/profile-history/index.html` |
| `promo-card` | provider-primary | — | `examples/components/promo-card/index.html` |
| `promo-code-modal` | provider-primary | — | `examples/components/promo-code-modal/index.html` |
| `prose` | provider-primary | — | `examples/components/prose/index.html` |
| `radio-button` | provider-primary | — | `examples/components/radio-button/index.html` |
| `rating-badge` | provider-primary | — | `examples/components/rating-badge/index.html` |
| `rating-table` | provider-primary | — | `examples/components/rating-table/index.html` |
| `review-card` | provider-primary | — | `examples/components/review-card/index.html` |
| `school-card` | provider-primary | — | `examples/components/school-card/index.html` |
| `search-form` | provider-primary | — | `examples/components/search-form/index.html` |
| `search-input` | hybrid | `error` | `examples/components/search-input/index.html` |
| `section` | provider-primary | — | `examples/components/section/index.html` |
| `select` | provider-primary | — | `examples/components/select/index.html` |
| `service-logo` | provider-primary | — | `examples/components/service-logo/index.html` |
| `site-footer` | provider-primary | — | `examples/components/site-footer/index.html` |
| `site-header` | provider-primary | — | `examples/components/site-header/index.html` |
| `social-icon` | provider-primary | — | `examples/components/social-icon/index.html` |
| `sort-sheet` | provider-primary | — | `examples/components/sort-sheet/index.html` |
| `step-card` | provider-primary | — | `examples/components/step-card/index.html` |
| `switch` | provider-primary | — | `examples/components/switch/index.html` |
| `text-input` | provider-primary | — | `examples/components/text-input/index.html` |
| `textarea` | provider-primary | — | `examples/components/textarea/index.html` |
| `tile-filter` | provider-primary | — | `examples/components/tile-filter/index.html` |
| `toast` | provider-primary | — | `examples/components/toast/index.html` |
| `tooltip` | provider-primary | — | `examples/components/tooltip/index.html` |
| `vacancy-card` | provider-primary | — | `examples/components/vacancy-card/index.html` |

## Старые адреса

| Старый id | Сохранённый адрес | Канонический preview |
|---|---|---|
| `badge` | `examples/components/badge/index.html` | `examples/components/chip/index.html` |
| `meta-pill` | `examples/components/meta-pill/index.html` | `examples/components/chip/index.html` |
| `counter-pill` | `examples/components/counter-pill/index.html` | `examples/components/chip/index.html` |
| `specialization-tag` | `examples/components/specialization-tag/index.html` | `examples/components/chip/index.html` |
| `segmented-control` | `examples/components/segmented-control/index.html` | `examples/components/button-group/hero.html` |
| `tab` | `examples/components/tab/index.html` | `examples/components/filter-chip/menu-switch.html` |
| `project-icon` | `examples/components/project-icon/index.html` | `examples/components/service-logo/index.html` |
| `sprite-icon` | `examples/components/sprite-icon/index.html` | `examples/foundations/iconography/index.html` |
| `rubrication-bar` | `examples/components/rubrication-bar/index.html` | `examples/pages/courses-listing/index.html` |
