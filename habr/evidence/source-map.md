# Source map — production CSS Habr

Технический список всех 111 файлов сборки `2.346.1`: 101 подключается
хотя бы одной из 16 просканированных production-страниц, ещё 6 — реальные
продуктовые компоненты, найденные только в Storybook-снимке (монтируются по
клику и не попадают в статический `<link>`-манифест), и 4 — Storybook-only
обвязка или дубли, исключённые из корпуса. Это рабочий журнал полноты,
а не материал для чтения AI — в обычной задаче сюда заглядывать не нужно,
см. `components/INDEX.md`.

Столбцы: **source file** → **usage type** (классификация по переиспользуемости,
самостоятельной семантике и зависимости от конкретной page family — не по имени
файла) → **pages** (сколько из 16 просканированных типов страниц подключают файл)
→ **destination** (куда идёт в пакете) → **spec/pattern** (если есть).

Storybook и production для release `2.346.1` отдают **побайтово идентичные**
файлы (проверено по хэшам в путях) — конфликтов CURRENT между ними в этом срезе
не бывает по построению; Storybook используется здесь только за состояниями
и props, которых нет в статическом CSS.

## Runtime — глобальная оболочка, не компонент

Назначение по умолчанию: **ui/foundations.css или ui/layout.css**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `index-C5LRQg16.css` | 15/16 | `loads` | shell: html/body reset, header, layout, keyframes |
| `scroll-lock-transition-DptUpVQt.css` | 15/16 | `scrollbar` | скролл-локер при открытых оверлеях |
| `svg-icon-R4RmUFby.css` | 15/16 | `tm-svg-icon` | обвязка <svg> для инлайн-иконок |
| `svg-img-r1n9vzM8.css` | 15/16 | `tm-svg-img` | обвязка <img> для растровых картинок |
| `swiper-DTw_kYGC.css` | 15/16 | `swiper-container` | сторонняя библиотека каруселей |
| `layout-sidebar--vqxs7EG.css` | 7/16 | `tm-layout-sidebar` | контейнер сайдбара уровня разметки страницы |
| `use-uuid-3pUaeD3o.css` | 7/16 | `tm-misprint-area` | служебный класс, 0 правил в срезе |
| `sub-page-h7kVRmzG.css` | 3/16 | `tm-sub-page` | обёртка вложенной страницы (модалка-страница) |

## Theme — переменные тем

Назначение по умолчанию: **ui/themes.css**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `light-v2.css` | 16/16* | `—` | токены светлой темы, 43 переменные :root |

\* темы подключаются отдельным `<link media="prefers-color-scheme">`, поэтому не попадают в манифест по `<link>` компонентного CSS; проверены напрямую — на всех 16 страницах.

## Primitive — переиспользуемый атом → components/

Назначение по умолчанию: **ui/components/*.css + components/<cat>/*.md**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `base-popover-DIfjoqU2.css` | 15/16 | `base-popover` | обвязка поповера, используется Dialog/Dropdown/Hint |
| `button-base-BdvEVC2k.css` | 15/16 | `btn` | .btn — базовый класс, Storybook ButtonBase |
| `button-Ccclp6vQ.css` | 15/16 | `tm-button` | .tm-button цветовые модификаторы, Storybook Button |
| `tabs-NcEC6QlL.css` | 14/16 | `tabs` | Figma: tab/tab-panel, 3 размера × 6 состояний |
| `pagination-button-DjQECuh-.css` | 11/16 | `tm-pagination` | Storybook PaginationButton |
| `pagination-I5St5IpN.css` | 11/16 | `tm-pagination` | Storybook Pagination |
| `title-Dx1eIaw5.css` | 9/16 | `tm-title` | .tm-title — заголовок-ссылка, инвариант к типу сущности |
| `bookmarks-button-CJSOFWtd.css` | 8/16 | `bookmarks-button` | кнопка закладки, используется везде |
| `icon-counter-BmPpUBhH.css` | 8/16 | `tm-icon-counter` | счётчик с иконкой — просмотры/комментарии/закладки |
| `section-name-63iRq3Ei.css` | 8/16 | `tm-section-name` | заголовок секции с иконкой |
| `rss-button-C2lGnars.css` | 7/16 | `tm-rss-button` | кнопка RSS, используется в разных списках |
| `button-follow-Bar2fZBL.css` | 6/16 | `tm-button-follow` | кнопка подписки — переиспользуется (хаб/юзер/компания) |
| `input-text-decorated-CFeKi8Lh.css` | 5/16 | `tm-input-text-decorated` | реальный класс text input, см. конфликт с Figma Input |
| `description-list-_JTaFT72.css` | 4/16 | `tm-description-list` | список термин/значение, общего назначения |
| `bordered-card-XBXkhzQo.css` | 3/16 | `tm-bordered-card` | обёртка-карточка с рамкой общего назначения |
| `notice-CJMGtgdu.css` | 2/16 | `tm-notice` | универсальный информер/notice |
| `checkbox-CJ1LCFDi.css` | 1/16 | `checkbox` | Figma: checkbox/radiobutton |
| `inline-list-QYVxvp52.css` | 1/16 | `inline-separator` | разделитель списка — Career-эквивалент inline-separator |
| `BaseDialog-CrJ9tGzP.css` | Storybook** | `—` | Storybook Dialog (10 story). Не подключается ни на одной из 16 страниц — монтируется по клику, лежит вне статического харвеста |
| `dropdown-B6xIm0Cp.css` | Storybook** | `—` | Storybook Dropdown (8 story). Та же причина отсутствия в харвесте |
| `base-hint-DHY34kLY.css` | Storybook** | `—` | Storybook BaseHint (5 story) — базовый тултип/хинт |
| `informer-hint-Bf4XvRzJ.css` | Storybook** | `—` | Storybook InformerHint (4 story) |
| `restriction-hint-CHvNMITd.css` | Storybook** | `—` | Storybook RestrictionHint (4 story) |
| `block-hX4sg17k.css` | Storybook** | `—` | Storybook Block (5 story) — обёртка секции с header/body/footer и вариантами padding; НЕ найден ни в одном из 101 production-файлов, но высокая композиционная ценность |

\*\* найден только в Storybook-снимке: компонент монтируется по клику (диалог/дропдаун/хинт) и не входит в статический `<link>`-манифест ни одной из 16 страниц. Это ограничение метода харвеста, не признак того, что компонент не продуктовый — имя файла собрано тем же пайплайном сборки, что и остальные 101.

## Composed module — переиспользуемый составной блок → components/

Назначение по умолчанию: **ui/components/*.css + components/<cat>/*.md**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `article-datetime-published-mCvYLFVV.css` | 9/16 | `tm-article-datetime-published` | дата публикации, используется в article-snippet и на детальной |
| `article-snippet-B1AKowH-.css` | 9/16 | `tm-article-complexity` | карточка статьи — переиспользуется в фиде/хабе/компании, НЕ presenter одной страницы |
| `article-comments-counter-link-BbnQY3y7.css` | 8/16 | `article-comments-counter-link-wrapper` | счётчик комментариев со ссылкой |
| `data-icons-UIQKMN1V.css` | 8/16 | `article-rating` | строка рейтинг+голос+шаринг под карточкой/статьёй |
| `new-sidebar-CVR81Cu8.css` | 8/16 | `sidebar` | обёртка сайдбар-блока, используется многими виджетами |
| `publication-label-D1N8NdVO.css` | 8/16 | `publication-label` | ярлык типа публикации — Роадмэп/Кейс/Интервью и т.д., см. Figma chips |
| `user-info-DEXNWEJ2.css` | 8/16 | `tm-user-info` | строка автор+дата+хаб, используется в карточках |
| `votes-meter-BFDy0ADQ.css` | 7/16 | `tm-votes-meter` | блок голосования статьи |
| `flows-Mfq3W4SI.css` | 6/16 | `tm-suggest-button` | карточка потока/специализации в сайдбаре |
| `promo-block-BjDUi6nP.css` | 6/16 | `tm-promo-block` | промо-карусель, встречается в нескольких листингах |
| `navigation-filters-spoiler-D5wYlMIU.css` | 5/16 | `tm-navigation-filters-spoiler` | сворачиваемый блок фильтров |
| `reach-counter-DUy9zrm3.css` | 5/16 | `stats-container` | блок охвата в статистике автора |
| `votes-lever-XAPVRp2k.css` | 5/16 | `vote-hint-popup` | рычаг голосования +/- с попапом причины |
| `events-widget-8ZixiKDR.css` | 4/16 | `tm-events-block` | виджет мероприятий в сайдбаре |
| `navigation-dropdown-33s59Rq2.css` | 4/16 | `tm-navigation-dropdown` | выпадающее меню навигации — состав из dropdown+пункты |
| `navigation-filters-BSznuft_.css` | 4/16 | `tm-navigation-filters` | панель фильтров листинга |
| `navigation-filters-tabs-DMZKMF67.css` | 4/16 | `tm-navigation-filters-tabs` | табы внутри панели фильтров |
| `navigation-search-BPZh-5Ba.css` | 4/16 | `tm-navigation-search` | строка поиска в навигации, оборачивает input-text-decorated |
| `navigation-sorting-BZysfQAw.css` | 4/16 | `tm-navigation-sorting` | переключатель сортировки листинга |
| `stories-B3WmWLhI.css` | 4/16 | `image-button` | карусель historie/сторис на фиде |
| `article-extra-menu-vdAxZGFQ.css` | 3/16 | `separator` | контекстное меню действий статьи |
| `news-block-D7UTENDN.css` | 3/16 | `news-block-item` | блок новостей, переиспользуется (сайдбар/лента) |
| `user-card-BdcjvV9G.css` | 3/16 | `blacklist-dialog` | карточка автора — карма, кнопка ЧС, переключатель голоса |
| `article-redirects-2rVJQLrh.css` | 2/16 | `article-card-list` | виджет похожих статей в сайдбаре |
| `company-snippet-BBVlodgz.css` | 2/16 | `tm-company-snippet` | карточка компании в списке |
| `tags-list-D8puhLyp.css` | 2/16 | `tm-separated-list` | список тегов с разделителем |
| `user-notice-DFDSZhth.css` | 2/16 | `user-notice` | информер профиля (карма/бан и т.п.) |
| `user-snippet-BY4AW1ld.css` | 2/16 | `tm-user-snippet` | карточка пользователя в списке |
| `badges-BRoB8PSV.css` | 1/16 | `badges` | список наград профиля |
| `digest-subscription-wrapper-CREbAoOg.css` | 1/16 | `title` | промо подписки на дайджест, сайдбар-виджет |
| `post-snippet-BfE_uaVl.css` | 1/16 | `meta` | карточка поста в фиде компании |
| `publication-type-label-gEJ3nUjm.css` | 1/16 | `publication-type-label` | ярлык типа публикации, короткий вариант |

## Mixed — файл содержит и переиспользуемую часть, и page-bound часть

Назначение по умолчанию: **ui/components/*.css (раздельно по частям, см. примечание)**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `article-blocks-Wdo7C-3d.css` | 1/16 | `tm-article-comments-counter-button` | tm-height-limiter — переиспользуемый MODULE сворачивания; остальное PAGE-BOUND |
| `my-feed-8t8yK4rG.css` | 1/16 | `tm-button-link` | .tm-button-link — PRIMITIVE (кнопка-ссылка); .my-feed-filter — PAGE-BOUND |

## Page presenter — вся страница целиком → pattern, не spec

Назначение по умолчанию: **ui/ (CSS переносится) + showcase/pages.html (паттерн)**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `article-presenter-qr679rag.css` | 1/16 | `tm-popup` | вся страница статьи целиком |
| `companies-B2INw-SX.css` | 1/16 | `tm-companies-filter` | страница списка компаний целиком |
| `companies-C2px0xcF.css` | 1/16 | `tm-companies` | страница списка компаний целиком |
| `user-profile-CZz1D8dM.css` | 1/16 | `tm-show-more-handler` | страница профиля целиком |
| `users-list-BxUv7FO7.css` | 1/16 | `tm-users-list` | страница списка пользователей целиком |

## Page-bound fragment — используется в одном типе размещения → ui/, без spec

Назначение по умолчанию: **ui/ (CSS переносится, если код воспроизводит реальный экран)**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `check-content-B5yILTmZ.css` | 8/16 | `sidebar-window` | боковая панель проверки правописания — фича редактора |
| `articles-list-B6grF93z.css` | 6/16 | `blacklist-article-placeholder` | обёртка списка на конкретных listing-страницах |
| `random-project-block-C7jz2gmb.css` | 6/16 | `tm-salary-distribution` | виджет "случайный проект", один тип размещения |
| `daily-pack-B6LQ_-JL.css` | 4/16 | `preview-card` | подборка дня — один тип размещения на фиде |
| `reach-and-readers-popup-CqS5bpAT.css` | 4/16 | `icon-button-loader` | попап статистики охвата — авторский кабинет |
| `hubs-contribution-block-BdwjPflT.css` | 3/16 | `tm-hub-block` | виджет вклада в хаб |
| `hubs-list-presenter-C3WUVKgm.css` | 2/16 | `tm-hub` | страница списка хабов целиком |
| `user-CqBifhNZ.css` | 2/16 | `tm-write-note` | заметка о пользователе — фрагмент профиля |
| `vacancies-BNdwc-Q5.css` | 2/16 | `tm-project-block` | блок вакансий/курсов — один тип размещения |
| `article-comments-QU5eNU7Q.css` | 1/16 | `tm-article-comments` | форма и лента комментариев целиком — фича, не примитив |
| `article-poll-B3W_KGMm.css` | 1/16 | `article-poll` | опрос в статье |
| `build-page-producer-dimension-DUUblpig.css` | 1/16 | `swiper-container` | карусель специального лендинга |
| `comment-footer-CVulTiWi.css` | 1/16 | `user-profile-data` | форма ответа в ленте комментариев — фича |
| `comments-C7foazUQ.css` | 1/16 | `tm-article-comments-disabled` | лента комментариев целиком — фича |
| `company-card-wHlbajtI.css` | 1/16 | `tm-company-subscribers` | виджет подписчиков компании — один тип размещения |
| `company-onboarding-subscribers-DDLVqgS8.css` | 1/16 | `company-onboarding-subscribers-block` | онбординг компании — фича, не примитив |
| `company-widgets-BhX0iMBA.css` | 1/16 | `tm-company-card` | набор виджетов страницы компании |
| `hub-card-DVRXd10n.css` | 1/16 | `tm-hub-card` | карточка хаба на странице списка хабов |
| `sandbox-articles-list-CgTknPGD.css` | 1/16 | `tm-sandbox-articles-list` | список песочницы целиком |
| `search-7QaR2PSY.css` | 1/16 | `search` | обёртка страницы поиска, использует input-text-decorated |
| `user-publication-presenter-opr9GWzo.css` | 1/16 | `publication-draft-notice` | уведомление о черновике публикации |
| `users-CmnDSIOv.css` | 1/16 | `tm-users-list` | таблица рейтинга на /users — один тип размещения |

## Micro / нет самостоятельной семантики → ui/, без spec

Назначение по умолчанию: **ui/ (переносится вместе с модулем-контейнером, отдельно не документируется)**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `current-viewers-BthVhL8c.css` | 2/16 | `container` | кто сейчас смотрит статью — микро-виджет |
| `user-specialization-gX5AZorR.css` | 2/16 | `tm-user-basic-info` | строка специализации в карточке юзера |
| `authors-CO0hxr1G.css` | 1/16 | `karmagraph` | мини-график кармы в списке авторов |
| `await-invite-CzlMDAVk.css` | 1/16 | `await-about-text` | текст-заглушка песочницы |
| `company-basic-info-BVMNvWJn.css` | 1/16 | `tm-company-basic-info` | строка мета-данных компании |
| `company-CldqJ5bd.css` | 1/16 | `tm-company-branding-preview` | превью бренд-плашки компании, узкий срез |
| `hub-CvZQi7f2.css` | 1/16 | `tm-hub` | мини-обёртка страницы хаба |
| `hub-posts-3PycVzo2.css` | 1/16 | `tm-company-publications-feed` | 0 правил — пустой срез |
| `multiwidget-block-B8g6UzDm.css` | 1/16 | `tm-vacancy-card` | пустой почти срез, 6 объявлений |
| `radio-like-button-C0J2V37S.css` | 1/16 | `radio-like-button` | радио в виде кнопки, узкое использование |
| `sandbox-JI3W96NW.css` | 1/16 | `tm-sandbox` | пустой срез |
| `selection-label-CqNjpaNb.css` | 1/16 | `selection-label` | узкий вспомогательный ярлык |
| `user-publication-8eVtRXjz.css` | 1/16 | `tm-page-article` | пустой срез |

## Excluded — не продуктовый CSS или дубль другого чанка

Назначение по умолчанию: **не переносится никуда**

| Файл | Стр. | Что это | Примечание |
|---|---|---|---|
| `vote-hint-popup-D6BJBETV.css` | Storybook** | `—` | дублирует чанк votes-lever-XAPVRp2k.css (идентичное содержимое + keyframe) — не отдельный компонент |
| `Tokens-DJ-Q8VMz.css` | Storybook** | `—` | внутренняя обвязка Storybook (демо-страница/сторителлинг), не продуктовый CSS |
| `HintStoryTrigger-BJ5BafP9.css` | Storybook** | `—` | внутренняя обвязка Storybook (демо-страница/сторителлинг), не продуктовый CSS |
| `StoryVariantSection-BSy86dUg.css` | Storybook** | `—` | внутренняя обвязка Storybook (демо-страница/сторителлинг), не продуктовый CSS |

\*\* найден только в Storybook-снимке: компонент монтируется по клику (диалог/дропдаун/хинт) и не входит в статический `<link>`-манифест ни одной из 16 страниц. Это ограничение метода харвеста, не признак того, что компонент не продуктовый — имя файла собрано тем же пайплайном сборки, что и остальные 101.

---

## Как читать "Стр."

Число страниц из 16 просканированных типов (`feed`, `articles-all`, `article`,
`article-comments`, `news`, `hubs-list`, `hub`, `companies-list`, `company`,
`user`, `user-posts`, `search`, `authors`, `sandbox`), которые подключают файл
через `<link>`. Это нижняя граница реального использования: компонент может
использоваться и внутри авторизованных экранов, недоступных этому срезу.

## Известные MIXED-файлы

Два файла физически содержат больше одной сущности разного типа:

* `my-feed-8t8yK4rG.css` — `.tm-button-link` (переиспользуемая кнопка-ссылка,
  идёт в семью Button) и `.my-feed-filter` (page-bound, фильтр страницы «Моя лента»);
* `article-blocks-Wdo7C-3d.css` — `.tm-height-limiter` (переиспользуемый механизм
  сворачивания, аналог Career `collapsed-content`) и остальное (page-bound
  действия статьи).

При извлечении из этих файлов берётся только переиспользуемая часть; page-bound
часть переносится в `ui/` без отдельной спецификации.
