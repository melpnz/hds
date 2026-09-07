# Ассеты Career

Настоящая графика продукта, перенесённая из сборки `career-web`.
Ничего не перерисовано и не заменено заглушками.

Источник — страница-каталог Storybook `assets-images--all-images`. Сама она
**инструментом Storybook и является**: её классы (`assets-gallery`, `asset-card`)
в интерфейсе Career не встречаются и в пакет не переносились. Взята только графика.

| Папка | Что внутри | Файлов | Размер |
|---|---|---|---|
| `icons/` | спрайты иконок и отдельные векторные значки | 17 | 378 КБ |
| `illustrations/` | иллюстрации пустых состояний, ошибок, служебная графика | 41 | 169 КБ |
| `images/` | растровые изображения продукта: фоны баннеров, логотипы, аватары | 53 | 2604 КБ |

---

## Иконки

В исходном Career иконки выводятся через `<svg><use …#id></use></svg>`, но этот
способ ломается при открытии HTML через `file://`. В UI kit каждая иконка —
отдельный SVG в `single/`: монохромная вставляется как inline SVG и наследует
`currentColor`, цветная — обычным `<img>`. Спрайты сохранены только как
неизменяемый источник evidence.

```html
<svg class="svg-icon icon-inline" width="24" height="24" viewBox="0 0 24 24">
  <!-- точное содержимое ui/assets/icons/single/sprite/filter.svg -->
</svg>
```

Все иконки видно вживую в [`../../showcase/components.html`](../../showcase/components.html), раздел «Иконки».

### `sprite.svg` — 90 символов, набор пакета — 76

`spinner` · `arrow` · `arrow-bold` · `grade` · `format` · `trash` · `star` · `empty-star` · `bell` · `ny-bell` · `person` · `user` · `mail` · `location-legacy` · `gear` · `plus` · `minus` · `pen` · `info` · `emoji-add` · `dots` · `down` · `readBy` · `arrow-back` · `arrow-forward` · `arrow-big` · `favorite` · `edit_new` · `message` · `home` · `blue-loader` · `button-loader` · `search` · `filter` · `direction` · `eye` · `crossed-eye` · `cert` · `cert-blank` · `copy` · `arrow-right` · `arrow-left-rounded` · `place-mark` · `more` · `bar-arrow` · `accreditation` · `share` · `update` · `arrow-down-small` · `danger` · `single-check` · `globe` · `phone` · `invite` · `expert-icon` · `habr-icon` · `mobile-menu` · `hh` · `postpone-circle` · `check-circle-empty` · `minus-circle` · `reviews` · `check-approved` · `sort` · `close` · `datepicker` · `question-circle` · `download` · `up` · `selection` · `banner` · `additional-menu` · `settings` · `recover` · `booster` · `card`

### `services.svg` — 21 символов

`service-habr` · `service-habr-career` · `service-habr-qa` · `service-github` · `service-gitlab` · `service-behance` · `service-dribbble` · `service-stackoverflow` · `service-instagram` · `service-telegram` · `service-linkedin` · `service-vk` · `service-facebook` · `service-web` · `service-twitter` · `service-skype` · `service-livejournal` · `service-geektimes` · `service-habr-qa-detailed` · `service-habr-detailed` · `service-habr-career-detailed`

### `contacts.svg` — 14 символов

`career` · `link` · `skype` · `linkedin` · `phone` · `email` · `facebook` · `vkontakte` · `telegram` · `github` · `stackoverflow` · `gitlab` · `dribbble` · `behance`

### `social-v3.1.svg` — 9 символов

`facebook` · `vk` · `twitter` · `telegram` · `instagram` · `telegram-bot` · `youtube` · `dzen` · `github`

### `reactions.svg` — 7 символов

`angry` · `slight_frown` · `confused` · `neutral_face` · `slight_smile` · `grinning` · `heart_eyes`

> В спрайте Career восемь символов. Восьмой — `twitter`, иконка шаринга,
> попавшая к эмодзи по недосмотру. Реакцией она не является, поэтому в набор
> отдельных иконок не вынесена и в витрине не показана. Сам `reactions.svg`
> оставлен нетронутым: он побайтово совпадает с продуктовым и служит первоисточником.

**В пяти спрайтах 146 символов; отдельными файлами лежит 127.**
Разница — девятнадцать. Пять не выносились вовсе: `twitter` из `reactions.svg`
и четыре `decorated-modal-*`, перенесённые в `illustrations/`. Ещё четырнадцать
убраны из `single/sprite/` при нормализации набора — см. ниже. Списки выше
перечисляют то, что лежит в пакете сейчас.

### `icons/inline/` — 7 встроенных SVG

Иконки, которые Career рисует прямо в разметке, а не через спрайт.
Имена — хеш содержимого плюс размеры, потому что собственных имён у них нет.

---

## Отдельные иконки и пак

Спрайты разобраны на самостоятельные файлы — по одному SVG на символ.
Каждый файл автономен: если символ ссылался на общий `<defs>` спрайта,
нужное определение перенесено внутрь. Все проверены отрисовкой в браузере.

Пять символов не выносились вовсе, хотя в спрайтах остались:

- `twitter` из `reactions.svg` — иконка шаринга, попавшая к эмодзи;
- четыре `decorated-modal-*` из `sprite.svg` — это иллюстрации 96×96,
  они лежат в `illustrations/` вместе с остальной служебной графикой.

Исходные спрайты не тронуты: они побайтово совпадают с продуктовыми.

### `single/sprite/` — нормализованный набор, а не дословная выкладка

Остальные четыре папки `single/` повторяют свой спрайт один в один. `sprite/` —
больше нет: из него убраны дубликаты по смыслу, чтобы у каждого значения
интерфейса остался один значок. Спрайт при этом не менялся, и спецификации,
которые ссылаются на `sprite.svg#имя`, продолжают работать: убранные символы
в спрайте на месте.

| Убрано | Осталось | Почему |
|---|---|---|
| `check` | `single-check` | `check` был прибит к зелёному `#64C178` и не наследовал цвет |
| `bookmark`, `bookmark-filled` | `favorite` | одна иконка с двумя состояниями вместо двух файлов |
| `location` | `location-legacy` | одинаковое начертание |
| `cross`, `cross-separator`, `cross-large`, `cross-old` | `close` | четыре крестика одного смысла |
| `arrow-down` | `arrow` | одинаковое начертание |
| `sort-2` | `sort` | файлы совпадали побайтово |
| `habr-icon-14` | `habr-icon` | различался только исходный размер |
| `check-circle` | `check-circle-empty` | залитый кружок против контурного, смысл один |
| `star-small`, `sharp-star` | `star` | три звезды одного смысла |

Отдельно исправлены четыре начертания:

- `danger` — в пути остался нулевой сегмент из экспорта Figma, он рисовал шип
  на вершине треугольника;
- `spinner` — в файле был голый `<circle>` без обводки, поэтому рисовался
  чёрный круг. Теперь это дуга `currentColor` с анимацией вращения, встроенной
  в сам файл, и замедлением при `prefers-reduced-motion`. Анимация написана
  на CSS внутри SVG, поэтому идёт при inline-вставке — штатном способе для
  монохромных иконок — и стоит, если файл подключить через `<img>`:
  CSS-анимации внутри SVG-картинки браузер не проигрывает;
- `share` — обводка была прибита к `#929CA5`; переведена на `currentColor`,
  заливка и обводка сведены в одну фигуру;
- `favorite` — соседствовали заливка `currentColor` и обводка `#929CA5`.
  Теперь оба `currentColor`, а базовое состояние — контур: заливку добавляет
  активное состояние.

Иконки с контуром объявляют `fill="none"` **на пути**, а не на корне: на корне
его перебивает `.svg-icon{fill:currentColor}` из `ui/components/primitives.css`.

| Папка | Откуда | Файлов |
|---|---|---|
| `single/sprite/` | `sprite.svg` | 76 |
| `single/contacts/` | `contacts.svg` | 14 |
| `single/services/` | `services.svg` | 21 |
| `single/social-v3.1/` | `social-v3.1.svg` | 9 |
| `single/reactions/` | `reactions.svg` | 7 |

### `pack/` — объединённый набор, 21 иконок

**Подложка приведена к одной форме** — квадрат со скруглением 8px. В спрайтах
она разная: contacts рисует круг, social — квадрат без скругления, services —
квадрат со скруглением 2. Радиус задан долей стороны (1/3), поэтому читается
как 8px при отрисовке в базовом размере 24 и не ломается на других размерах.

Форму несёт сам файл: там, где заливка нарисована сплошным полотном поверх
подложки (`M48 0H0V48H48V0Z` — след экспорта из Figma), полотно обрезано
`clipPath` с тем же радиусом. У `instagram` собственной подложки в спрайте нет:
фирменный градиент встроен в файл пака двумя `radialGradient` — значение
перенесено из `.icon-instagram` (`ui/components.css`), где оно остаётся для
иконки подвала из `social-v3.1`.

Один значок на сервис. В спрайтах один и тот же сервис встречается дважды:
круглым значком в `contacts.svg`, цветной плиткой в `social-v3.1.svg` и мелкой
плиткой с префиксом `service-` в `services.svg`. В пак попадает один:

| Убрано | Осталось |
|---|---|
| `vkontakte` | `vk` |
| `service-vk` | `vk` |
| `service-skype` | `skype` |
| `service-linkedin` | `linkedin` |
| `service-facebook` | `facebook` |
| `service-instagram` | `instagram` |
| `service-twitter` | `twitter` |
| `service-github` | `github` |
| `service-dribbble` | `dribbble` |
| `service-gitlab` | `gitlab` |
| `service-behance` | `behance` |
| `service-telegram` | `telegram` |
| `service-stackoverflow` | `stackoverflow` |
| `service-web` | `link` |
| `service-habr-detailed` | `service-habr` |
| `service-habr-qa-detailed` | `service-habr-qa` |
| `service-habr-career-detailed` | `service-habr-career` |
| `career` | `service-habr-career` |
| `service-livejournal` | `null` |
| `service-geektimes` | `null` |

В папках `single/contacts`, `single/social-v3.1` и `single/services` убранные
значки остаются: они повторяют спрайты как есть.

Сложен в заданном порядке: сначала `contacts.svg`, затем `social-v3.1.svg`,
затем `services.svg`. При совпадении имени файл НЕ заменяется — остаётся тот,
что попал раньше. Поэтому `facebook`, `telegram` и `github` взяты из `contacts.svg`,
а одноимённые из `social-v3.1.svg` пропущены: это единственные три совпадения.

Обратите внимание, что наборы разные по природе: `contacts` — круглые значки 24×24,
`social-v3.1` — цветные плитки 48×48, `services` — мелкие значки 16×16 с префиксом
`service-`. В паке они лежат рядом, но взаимозаменяемыми не являются.

---

## Иллюстрации

Именно эти файлы стоят в настоящих пустых состояниях Career — см. компонент
[`EmptyPlaceholder`](../../components/feedback/empty-placeholder.md).

**Пустые состояния** — `empty-cart.svg`, `empty-conversation.svg`, `empty-page.svg`, `locked-cart.svg`, `no-content.svg`, `no-conversations-templates.svg`, `no-conversations.svg`, `no-cp-statistics.svg`, `no-photo.svg`, `no-quiz.svg`, `no-resumes.svg`, `no-subscriptions.svg`, `no-transactions.svg`, `no-user.svg`, `no_content01.svg`, `no_content25_colored.svg`

**Ошибки и служебные страницы** — `404.svg`, `500.svg`, `limited_access.svg`

**Успешные исходы** — `decorated-modal-success.svg`, `payment_success.svg`, `score-sent.svg`, `thankyou-logo.svg`

**Знаки и логотипы** — `logo_border_blue.svg`, `logo_border_green.svg`, `logo_border_marine.svg`, `logo_border_pink.svg`, `logo_border_violet.svg`, `new_label_with_flame.svg`, `ny-logo.svg`, `thankyou-logo.svg`, `top_label.svg`

**Прочее** — `avatar-default-company.svg`, `avatar-default-user.svg`, `decorated-modal-error.svg`, `decorated-modal-loading.svg`, `decorated-modal-warning.svg`, `mask.svg`, `salary-chart-mobile.svg`, `salary-chart.svg`, `salary-skeleton.svg`

---

## Заглушки аватара

Что показывается, когда изображение не загружено:

| Файл | Для чего | Форма |
|---|---|---|
| `illustrations/avatar-default-user.svg` | человек | круг |
| `illustrations/avatar-default-company.svg` | компания | квадрат со скруглением |

**Единственные два файла в пакете, не извлечённые из корпуса** — их прислали
отдельно. Те же изображения есть и в продукте, растром 200×200:
`images/user-4ae9…png` и `images/medium_default-8646…png`. Векторные версии
нужны потому, что шкала аватара доходит до 140, а растр 200×200 на этом размере
уже мылит. Хеш-имена оставлены как есть: на них ссылается снятая разметка.

---

## Шрифт

Здесь его нет. Career использует переменный Inter и раздаёт его с `assets.habr.com`
четырнадцатью подмножествами по `unicode-range`. Пакет описывает визуальный язык,
а не раздаёт ассеты Хабра, поэтому берёт тот же Inter из Google Fonts —
подключение в [`../fonts.css`](../fonts.css). Начертания совпадают, различается
только разбиение на подмножества.

---

## Чего здесь нет

`huntflow.svg` — логотип внешнего сервиса, встречающийся в карточке импорта вакансий.
В корпус Storybook он не попал, а дозагрузить его не удалось: узел `habratest`
отдаёт сертификат, которому эта машина не доверяет. Единственный отсутствующий файл.

В витрине и в спецификации на его месте стоит штатная заглушка
`illustrations/avatar-default-company.svg` — то, что продукт показывает,
когда логотип не загрузился. Подстановка помечена на месте
и записана в [`../../evidence/coverage.md`](../../evidence/coverage.md).
