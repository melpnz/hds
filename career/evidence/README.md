# Career References — manifest

Дата: 2 сентября 2026.

Две библиотеки изображений с разным назначением.

```
source/     первоисточник и доказательство      «откуда мы это знаем»
curated/    эталонный визуальный пример          «как выглядит хороший Career»
```

Правило отбора в `curated/`: изображение попадает сюда, только если оно показывает
**композицию, состояние или поведение**, которое нельзя увидеть в живой витрине
`showcase/`. Скриншот одиночного компонента в curated не входит — для этого
есть вёрстка.

---

## 1. Инвентаризация существующих source-изображений

26 файлов, собранных на этапе component audit. Классификация после появления
живой `showcase/`.

### KEEP AS SOURCE EVIDENCE — 12 файлов

| Файл | Почему остаётся |
|---|---|
| `figma/fig-01-button-M-main.png` | Component set с матрицей статусов `inactive · hover · focus · disable · loading`. **Визуальные решения hover и focus из него не извлечены** — это до сих пор открытый вопрос |
| `figma/fig-03-button-L-icon.png` | То же для круглой кнопки, плюс статус `selected`, которого нет у обычных |
| `figma/fig-05-button-L-filter.png` | Filter-кнопка с бейджем; единственный источник по варианту `filter` |
| `figma/fig-02-avatar-user-sizes.png` | **Единственное изображение, где видна форма аватара.** Метаданные Figma форму не кодируют — правило «человек круг / сущность квадрат» опирается на замер production и на эту картинку |
| `figma/fig-04-avatar-anonymous-score.png` | Редкое состояние: вид аватара зависит от рейтинга (4 диапазона). Не воспроизведено нигде |
| `figma/fig-06-module-onboarding-tooltip.png` | Оригинал единственного модуля, разобранного целиком |
| `storybook/sb-11-segmented-tabs.png` | Нерешённый конфликт: фиолетовый активный сегмент |
| `storybook/sb-12-segmented-long.png` | Тот же конфликт + встроенный горизонтальный скролл |
| `storybook/sb-17-vacancy-card.png` | Вариант «Full» с двойной обёрткой и голубой подложкой — предполагаемое промо-состояние |
| `storybook/sb-18-vacancy-card-min.png` | Вариант «Minimal» для сравнения с production |
| `storybook/sb-19-conversation-card.png` | Домен «Диалоги» — 37 компонентов, ни один не воспроизведён |
| `storybook/sb-20-salary-bar.png` | Модуль salary-bar; в production найден его живой аналог, сопоставление не проведено |

### REDUNDANT AFTER LIVE REFERENCE → `source/archive/storybook/` — 14 файлов

Одиночные компоненты, которые теперь есть живой вёрсткой в `showcase/`
с точными значениями. **Файлы не удалены** — перемещены, чтобы evidence не потерялся.

```
sb-01-base-button          sb-02-base-button-affixes   sb-03-icon-button
sb-04-filter-button-badge  sb-05-ghost-button          sb-06-ai-button
sb-07-chip-variants        sb-08-chip-interactive      sb-09-input-label-errors
sb-10-select               sb-13-pagination            sb-14-notification
sb-15-notification-alert   sb-16-base-section
```

### KEEP AS CURATED REFERENCE — 0 файлов

Ни один из старых скриншотов не показывает композицию: все сняты в изоляции
Storybook на пустом фоне. Curated-набор собран заново.

---

## 2. Новое: production-evidence в машиночитаемом виде

`source/production/*.json` — 16 файлов, по одному на страницу. Каждый содержит
снимок композиции на четырёх вьюпортах (1440 / 1024 / 768 / 375):

оболочка · контейнеры · колонки · поток главной колонки с отступами и радиусами ·
заголовки с размерами · повторяющиеся блоки с шагом · sticky-элементы ·
навигация · кнопки · плотность · медиазапросы.

Это первоисточник всех выводов раздела «Page composition» в
`../research/system-audit.md`. Значения в документах можно проверить по ним,
не открывая браузер.

---

## 3. Curated dataset — 34 изображения

Все сняты 2 сентября 2026 в headless Chrome с принудительной светлой темой.
Виджет поддержки Jivo (тёмная плашка «Напишите нам») присутствует на части
снимков — **это сторонний виджет, не часть Career**.

---

### LISTING — 6

#### `listing/listing-vacancies-1440.png`
* **Source:** production `career.habr.com/vacancies`
* **Page type:** Listing (устаревающая реализация, Rails)
* **Viewport:** 1440
* **Demonstrates:** эталонная оболочка Career; сетка 752 + 24 + 300; шапка страницы как карточка; плотность списка
* **Important patterns:** заголовок страницы **внутри** карточки вместе с поиском и сортировкой · вертикальный список одинаковых карточек с шагом 12 · фильтры в правом сайдбаре · промо-блок над фильтрами · продвигаемые вакансии с цветной рамкой 2px
* **Related components:** BaseSection, TextInput, BaseSelect, BaseChip, BaseButton main/main-border, BaseIconButton
* **Related rules:** L-1, L-2, L-3, L-6, C-1, C-4
* **Use when:** строите список однотипных сущностей с фильтрацией
* **Do not use for:** лендинги, Курсы, брендированные страницы компаний
* **Confidence:** ВЫСОКАЯ

#### `listing/listing-vacancies-1024.png`
* **Source:** production · **Viewport:** 1024 · **Page type:** Listing
* **Demonstrates:** поведение ровно на границе брейкпоинта — сайдбар ещё на месте, шапка ещё 112
* **Important patterns:** сайдбар **фиксирован 300**, сжимается только главная колонка (776 → 685)
* **Use when:** проверяете, что колонка не ломается на узком десктопе
* **Do not use for:** вывод о планшете — на 1023 раскладка уже другая
* **Confidence:** ВЫСОКАЯ

#### `listing/listing-vacancies-375.png`
* **Source:** production · **Viewport:** 375 · **Page type:** Listing / Responsive
* **Demonstrates:** мобильная раскладка списка
* **Important patterns:** одна колонка · фильтры свёрнуты в кнопку · шапка 144 (три яруса по 48) · карточки во всю ширину, шаг 12 сохраняется
* **Related rules:** R-1, R-2, R-4
* **Use when:** проектируете мобильный список
* **Confidence:** ВЫСОКАЯ

#### `listing/listing-companies-1440.png`
* **Source:** production `/companies` · **Viewport:** 1440
* **Demonstrates:** второй тип карточки листинга — компания вместо вакансии
* **Important patterns:** тот же каркас и тот же шаг 12 при другом содержимом карточки · поиск в шапке-карточке без сортировки
* **Use when:** нужен листинг сущностей другого типа
* **Confidence:** ВЫСОКАЯ

#### `listing/listing-experts-1440.png`
* **Source:** production `/experts` · **Viewport:** 1440
* **Demonstrates:** самая плотная карточка Career — эксперт с аватаром, ставкой, навыками и статистикой
* **Important patterns:** аватар человека круглый · цена услуги как акцентное число · много метаданных в одной карточке
* **Use when:** карточка человека в списке
* **Confidence:** ВЫСОКАЯ

#### `listing/listing-resumes-new-impl-1440.png`
* **Source:** production `/resumes` — **новая реализация (Nuxt + Tailwind)**
* **Viewport:** 1440 · **Page type:** Listing
* **Demonstrates:** как выглядит тот же тип страницы на новом стеке
* **Important patterns:** **та же геометрия колонок** `grid-template-columns: 752px 300px; gap: 24px` · те же карточки, тот же шаг · микро-метки 12/16 внутри карточки специалиста
* **Related rules:** L-1, C-6, S-1
* **Use when:** нужно понять, что переезд на новый стек **не меняет** композицию
* **Do not use for:** вывод, что весь продукт уже переехал — переехали отдельные разделы
* **Confidence:** ВЫСОКАЯ

---

### DETAIL — 4

#### `detail/detail-vacancy-1440.png`
* **Source:** production `/vacancies/1000163170` · **Viewport:** 1440
* **Demonstrates:** страница сущности целиком: шапка-карточка, секции описания, сайдбар «Похожие вакансии»
* **Important patterns:** тот же контейнер и та же сетка, что у листинга · сайдбар несёт связанные сущности, а не фильтры
* **Related rules:** D-1, D-2, D-5
* **Use when:** страница одной сущности с длинным описанием
* **Confidence:** ВЫСОКАЯ

#### `detail/detail-vacancy-header-1440.png`
* **Source:** production, обрезка по шапке сущности · **Viewport:** 1440
* **Demonstrates:** **эталон entity header Career** — самый информативный кадр набора
* **Important patterns:** H1 28/32 · дата 14/20 gray-3 в правом верхнем углу · зарплата 18/22·600 оранжевым · пояснение ссылкой с пунктирным подчёркиванием · **микро-метки групп 12/16·400 gray-3** («Требования», «Условия») · под каждой меткой строка чипов · **два тона чипов: голубой `#ebf3ff` для структурных атрибутов, серый тинт для свободных навыков** · основное действие внизу слева внутри той же карточки
* **Related components:** BaseChip, BaseButton main L
* **Related rules:** D-2, D-3, D-4, C-2, C-3, CT-1, CT-2
* **Use when:** любая страница сущности; любой блок «атрибуты объекта»
* **Do not use for:** списки — там метаданные подаются иначе
* **Confidence:** ВЫСОКАЯ

#### `detail/detail-vacancy-768.png`
* **Source:** production · **Viewport:** 768
* **Demonstrates:** как detail теряет сайдбар
* **Important patterns:** сайдбар **не переезжает вниз, а исчезает**; его содержимое перерисовывается в главной колонке горизонтальной каруселью
* **Related rules:** R-3
* **Use when:** проектируете планшет для страницы сущности
* **Confidence:** ВЫСОКАЯ

#### `detail/detail-vacancy-375.png`
* **Source:** production · **Viewport:** 375
* **Demonstrates:** мобильная страница сущности
* **Important patterns:** карточка во всю ширину, padding сохраняется · действие остаётся в шапке-карточке, не становится липким
* **Confidence:** ВЫСОКАЯ

---

### PROFILE — 4

#### `profile/profile-user-1440.png`
* **Source:** production `/dvizigin` · **Viewport:** 1440 · **Page type:** Profile
* **Demonstrates:** **сайдбар слева** — единственное семейство Career с таким порядком
* **Important patterns:** личность (аватар 140 круглый, имя H1 28/32, роль, ожидания, действие) живёт в **левой колонке 300** · содержание — в правой 752 · действие прикреплено к личности, а не к контенту · секции содержания — белые плашки radius 24 с заголовком 20/24·600
* **Related rules:** P-1, P-2, P-3
* **Use when:** страница человека или организации
* **Do not use for:** списки и страницы сущностей-объектов — там сайдбар справа
* **Confidence:** ВЫСОКАЯ

#### `profile/profile-user-375.png`
* **Source:** production · **Viewport:** 375
* **Demonstrates:** порядок стека на мобильном
* **Important patterns:** идентификационный блок оказывается **сверху**, содержание под ним — порядок DOM совпадает с визуальным приоритетом
* **Related rules:** R-5
* **Confidence:** ВЫСОКАЯ

#### `profile/profile-company-1440.png`
* **Source:** production `/companies/cronalabs` (компания без брендированного профиля) · **Viewport:** 1440
* **Demonstrates:** что **компания без брендинга — это тот же Profile**, а не отдельное семейство
* **Important patterns:** сайдбар слева · H1 здесь 20/24·600 внутри контента, а имя компании — в сайдбаре · сегментированные табы рейтинга h40
* **Use when:** страница организации
* **Do not use for:** брендированные профили — см. `module-composition/module-branded-company-1440.png`
* **Confidence:** ВЫСОКАЯ

#### `profile/profile-company-sidebar-1440.png`
* **Source:** production, обрезка по сайдбару · **Viewport:** 1440
* **Demonstrates:** анатомия идентификационной колонки организации
* **Important patterns:** логотип квадратный со скруглением (в отличие от круглого аватара человека) · рейтинг · счётчики · действие
* **Related rules:** P-2, CT-5
* **Confidence:** ВЫСОКАЯ

---

### DASHBOARD — 4

#### `dashboard/dashboard-salaries-1440.png`
* **Source:** production `/salaries` — **новая реализация** · **Viewport:** 1440
* **Demonstrates:** единственное семейство Career, где композиция строится вокруг данных
* **Important patterns:** шапка-карточка во **всю ширину 1076** (не 752) · под ней асимметричная пара **264 + 800** с шагом 12 · левая колонка — список выбираемых строк, активная залита `primary @ 10%` с фиолетовой границей · правая — крупное число **42/48·600** с разбивкой и полосой распределения · info-нотификация внутри секции
* **Related components:** BaseSection, BaseNotification, BaseButton main L, FilterButton
* **Related rules:** DB-1, DB-2, DB-3
* **Use when:** аналитический экран, сравнение, метрика с разрезами
* **Do not use for:** списки и страницы сущностей
* **Confidence:** ВЫСОКАЯ

#### `dashboard/dashboard-salaries-768.png`
* **Source:** production · **Viewport:** 768
* **Demonstrates:** поведение асимметричной пары при сужении
* **Important patterns:** левая колонка остаётся **фиксированной 264**, сжимается только правая (800 → 453) · трёхколоночные гриды карточек схлопываются **сразу в одну колонку**, минуя две
* **Related rules:** R-6
* **Confidence:** ВЫСОКАЯ

#### `dashboard/dashboard-salaries-grid-1440.png`
* **Source:** production, обрезка по гриду · **Viewport:** 1440
* **Demonstrates:** трёхколоночная сетка карточек — единственное место, где карточка Career имеет видимую границу и уменьшенный радиус
* **Important patterns:** `334 × 3`, шаг 12 · radius **12** вместо 24 · граница 1px `#ededed` · **радиус кодирует плотность**
* **Related rules:** C-5
* **Confidence:** ВЫСОКАЯ

#### `dashboard/dashboard-ratings-1440.png`
* **Source:** production `/companies/ratings` · **Viewport:** 1440 · **Page type:** Dashboard / Rating
* **Demonstrates:** рейтинг как гибрид листинга и дашборда
* **Important patterns:** каркас листинга (752 + 300) при содержимом дашборда · табы фильтрации размера компании над списком · номер позиции слева от карточки
* **Use when:** ранжированный список
* **Confidence:** ВЫСОКАЯ

---

### FORMS — 2

#### `forms/forms-filter-sidebar-1440.png`
* **Source:** production `/vacancies`, обрезка по фильтрам · **Viewport:** 1440
* **Demonstrates:** **эталон формы Career** — единственная развитая форма, доступная гостю
* **Important patterns:** группы полей с шагом **24** · метка поля 16/24·600 с отступом **8** до контрола · ширина поля 250 внутри карточки 300 (padding 24) · вперемешку input, select, checkbox · чекбоксы без обёрток, строкой
* **Related components:** BaseInputLabel, TextInput, BaseSelect, checkbox
* **Related rules:** F-1, F-2, F-3
* **Use when:** любая форма фильтрации или настройки
* **Do not use for:** формы входа и регистрации — они не принадлежат Career
* **Confidence:** ВЫСОКАЯ

#### `forms/forms-search-header-1440.png`
* **Source:** production `/companies`, обрезка по поиску · **Viewport:** 1440
* **Demonstrates:** поиск как часть шапки страницы
* **Important patterns:** поле поиска h40 r12 с иконкой справа, живёт внутри карточки-шапки, а не над ней
* **Confidence:** СРЕДНЯЯ — снят один вариант из двух (второй, с сортировкой, виден на `listing-vacancies-1440`)

---

### STATES — 4

#### `states/state-empty-search-1440.png`
* **Source:** production `/vacancies?q=<мусор>` · **Viewport:** 1440
* **Demonstrates:** пустой результат **в контексте страницы**
* **Important patterns:** шапка страницы, фильтры и сайдбар **остаются на месте** · исчезает только список · пустой блок занимает место одной карточки
* **Related rules:** ST-1
* **Use when:** проектируете «ничего не найдено»
* **Confidence:** ВЫСОКАЯ

#### `states/state-empty-block-1440.png`
* **Source:** production, обрезка по `.no-content` · **Viewport:** 1440
* **Demonstrates:** сам блок пустого состояния
* **Important patterns:** заголовок **18/24·600**, описание 14/20·400 gray-3, по центру, блок 702×220 · **ни иллюстрации, ни кнопки**
* **Related rules:** ST-2
* **Use when:** пустое состояние внутри списка
* **Do not use for:** пустые состояния профиля и служебных экранов — там в библиотеке Figma есть 25 иллюстраций 96×96, но живого примера не найдено
* **Confidence:** ВЫСОКАЯ — и **исправляет** более раннюю запись research о заголовке 28/32

#### `states/state-404-1440.png`
* **Source:** production `/vacancies/999999999` · **Viewport:** 1440
* **Demonstrates:** служебный экран
* **Important patterns:** сетка отменяется целиком — одна колонка во всю ширину · H1 28/32 · без сайдбара
* **Related rules:** ST-3
* **Confidence:** ВЫСОКАЯ

#### `states/state-guest-cta-1440.png`
* **Source:** production, обрезка по гостевому блоку на странице вакансии · **Viewport:** 1440
* **Demonstrates:** различие «гость / авторизованный» — единственное доступное без учётной записи
* **Important patterns:** вместо формы отклика — блок с призывом создать профиль; primary L и белая вторичная L рядом
* **Related rules:** ST-4
* **Use when:** нужно показать функцию, требующую входа
* **Do not use for:** вывод о состоянии авторизованного пользователя — оно **не исследовано**
* **Confidence:** СРЕДНЯЯ — вторая половина пары не наблюдалась

---

### RESPONSIVE — 4

#### `responsive/responsive-header-1440.png`
* **Source:** production, обрезка по шапке · **Viewport:** 1440
* **Demonstrates:** десктопная шапка 112 = 48 тёмная панель Хабра + 64 навигация Career
* **Important patterns:** первый ярус тёмный `#303b44` — **единственная тёмная плоскость Career** · шапка `static`, не липкая
* **Related rules:** SH-1, SH-2
* **Confidence:** ВЫСОКАЯ

#### `responsive/responsive-header-375.png`
* **Source:** production, обрезка по шапке · **Viewport:** 375
* **Demonstrates:** мобильная шапка 144
* **Important patterns:** **три яруса по 48** · второй ярус на мобильном становится тёмным и получает бургер · третий — горизонтально прокручиваемая навигация на белом
* **Related rules:** R-1, R-2
* **Confidence:** ВЫСОКАЯ

#### `responsive/responsive-listing-768.png`
* **Source:** production `/vacancies` · **Viewport:** 768
* **Demonstrates:** планшетный листинг
* **Important patterns:** сайдбар фильтров **уехал под список**, а не исчез · над списком появилась кнопка «Фильтры» · контейнер продолжает сжиматься линейно
* **Related rules:** R-3, R-4
* **Confidence:** ВЫСОКАЯ

#### `responsive/responsive-salaries-cards-375.png`
* **Source:** production `/salaries` · **Viewport:** 375
* **Demonstrates:** поведение карточных гридов новой реализации на телефоне
* **Important patterns:** грид 334×3 → одна колонка · часть блоков превращается в горизонтальный скроллер с фиксированной шириной элемента
* **Related rules:** R-6, R-7
* **Confidence:** СРЕДНЯЯ — механика скроллера видна, точные ширины сняты только на `/companies/ibs`

---

### MODULE COMPOSITION — 6

#### `module-composition/module-vacancy-card-1440.png`
* **Source:** production, обрезка по карточке · **Viewport:** 1440
* **Demonstrates:** эталонный модуль Career
* **Important patterns:** дата справа сверху · логотип 48 r8 слева · инфоблок с отступом под логотип · чипы навыков внизу · футер выровнен по левому краю **текста**, а не карточки · **при наведении меняется только цвет заголовка**
* **Related rules:** M-1, M-2
* **Confidence:** ВЫСОКАЯ

#### `module-composition/module-company-card-1440.png`
* **Source:** production `/companies` · **Viewport:** 1440
* **Demonstrates:** карточка организации в списке
* **Important patterns:** логотип квадратный · рейтинг зелёным · описание в 2–3 строки с обрезкой
* **Confidence:** ВЫСОКАЯ

#### `module-composition/module-expert-card-1440.png`
* **Source:** production `/experts` · **Viewport:** 1440
* **Demonstrates:** самый плотный модуль
* **Important patterns:** круглый аватар · цена как акцентное число · навыки чипами · статистика в строку
* **Confidence:** ВЫСОКАЯ

#### `module-composition/module-rating-card-1440.png`
* **Source:** production `/companies/ratings` · **Viewport:** 1440
* **Demonstrates:** карточка с рангом и раскрываемыми отзывами
* **Important patterns:** позиция крупной цифрой слева · оценка зелёным · вложенный раскрываемый блок отзыва внутри карточки
* **Confidence:** СРЕДНЯЯ — селектор захватил внешнюю плашку, внутренняя структура читается, но не измерена отдельно

#### `module-composition/module-sidebar-box-1440.png`
* **Source:** production `/vacancies` · **Viewport:** 1440
* **Demonstrates:** блок сайдбара
* **Important patterns:** ширина 300, padding 24, radius 24, граница 1px · заголовок 16/24·600 (мельче, чем в главной колонке)
* **Related rules:** C-6
* **Confidence:** ВЫСОКАЯ

#### `module-composition/module-branded-company-1440.png`
* **Source:** production `/companies/ibs` · **Viewport:** 1440
* **Demonstrates:** **брендированный профиль компании — отдельное семейство страниц**
* **Important patterns:** типографика 40/40 и 24/28, которой нет больше нигде · полноширинные блоки, карусели, фирменный цвет компании · продуктовая сетка Career не действует
* **Use when:** нужно понять границу: где заканчивается интерфейс Career и начинается пространство рекламодателя
* **Do not use for:** **никогда не переносите эти решения в продуктовые экраны Career**
* **Confidence:** ВЫСОКАЯ

---

## 4. Чего в наборе нет и почему

| Не снято | Причина |
|---|---|
| Состояния авторизованного пользователя | Нет учётной записи. Всё исследование — гостевое |
| Loading / skeleton | Не пойман; страницы отдаются сервером готовыми |
| Ошибка формы в живом виде | Единственная доступная гостю форма — фильтры, где ошибок нет |
| Модальные окна | Ни одно не открывается без авторизации |
| Собственные экраны входа и регистрации | Их у Career нет: `/users/sign_in` уводит на Хабр Аккаунт с другой дизайн-системой (кнопка `#558cb7`, radius 3px). **Это граница продукта, а не пробел** |
| Раздел «Диалоги» | Требует авторизации; 37 компонентов Storybook остаются непроверенными |
| Журнал как отдельное семейство | Снят в JSON, но это legacy-вёрстка блога вне общей сетки; в curated не включён намеренно |
