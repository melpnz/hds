# TestItem · Карточка теста

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | — собственных классов нет, блок собран утилитами; корень снимка — `div.grid.gap-0.5.px-6` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | частичная |
| **Snapshot Storybook** | 7 из 59 |

## Назначение

Карточка теста в профиле: название, результат, дата, настройки видимости. Один и тот же компонент показывает все исходы — пройден, провален, просрочен.

## Анатомия

В Storybook исходы разложены по отдельным записям (`TestItemPassed`, `TestItemFailed`, `TestItemExpired`), но это не разные компоненты: у `TestItem` есть story на каждый исход, и они снялись. Здесь сведено в одну сущность.

```
div.grid.gap-0.5.px-6
  div.relative.grid.gap-2.rounded-t-xl.p-4.bg-ui-green-12
    div.text-body-m.font-semibold.uppercase.text-ui-green
      · «Пройден»
    div.flex.items-center.gap-2
      img.h-6.w-6.rounded
      div.text-body-m
        · «Хантфлоу»
    div.text-body-m
      · «Тест от 15 января 2024»
    div.-mt-1.5.font-semibold.capitalize
      · «Уровень «Middle»»
```

_Разметка story `tests-cards-testitem--passed`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Слоты

- `mainBlock`
- `additionalBlock`

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `provider` | TestResultProvider | — | — | — |
| `hasVisibilitySettings` | boolean | — | — | — |
| `isHidden` | boolean | — | — | — |
| `appearance` | "passed" \| "expired" \| "failed" | — | — | — |
| `statusName` | string | — | — | — |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-icon-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-ui-gray` | `#ccc` | из `:root` Career |
| `--color-ui-gray-1` | `#1b272c` | из `:root` Career |
| `--color-ui-gray-2` | `#55798b` | из `:root` Career |
| `--color-ui-gray-3-10` | `color-mix(in srgb,var(--color-ui-gray-3) 10%,transparent)` | из `:root` Career |
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-12` | `color-mix(in srgb,var(--color-ui-green) 12%,transparent)` | из `:root` Career |
| `--color-ui-orange-dirty` | `var(--color-ui-orange-accent)` | из `:root` Career |
| `--color-ui-orange-dirty-12` | `color-mix(in srgb,var(--color-ui-orange-dirty) 12%,transparent)` | из `:root` Career |
| `--color-ui-primary-60` | `color-mix(in srgb,var(--color-ui-primary) 60%,transparent)` | из `:root` Career |
| `--color-ui-red` | `#f8651b` | из `:root` Career |
| `--color-ui-red-overlay` | `color-mix(in srgb,var(--color-ui-red) 12%,transparent)` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#crossed-eye` | `ui/assets/icons/sprite.svg` |
| `sprite.svg` | `#eye` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Видимость теста переключается отдельным компонентом VisibilitySettings — круглой кнопкой с иконкой `#eye` / `#crossed-eye`.

## Разметка

```html
<div class="grid gap-0.5 px-6">
  <div class="relative grid gap-2 rounded-t-xl p-4 bg-ui-green-12">
    <div class="text-body-m font-semibold uppercase text-ui-green">Пройден</div>
    <div class="flex items-center gap-2">
      <img src="../../ui/assets/illustrations/avatar-default-company.svg" class="h-6 w-6 rounded" alt="Логотип компании Хантфлоу">
      <div class="text-body-m">Хантфлоу</div>
    </div>
    <div class="text-body-m">Тест от 15 января 2024</div>
    <div class="-mt-1.5 font-semibold capitalize">Уровень «Middle»</div>
  </div>
</div>
```

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Логотип провайдера в блоке «Разметка» — заглушка `avatar-default-company.svg`. Настоящий `huntflow.svg` из корпуса недоступен, см. `coverage.md`.
- Из 59 story группы Tests снялось 13. Остальные сломаны в самом Storybook (недостающие чанки сборки).
- Снятыми оказались все семь исходов `TestItem` — то есть смысловое покрытие полное, хотя количественное низкое.
- ЧЕГО НЕ ХВАТАЕТ: разметки `TestResultItem` и `TestResultAdditional` — развёрнутого результата с разбором по темам.

## Источники

- Файлы в репозитории `career-web`: `./src/components/tests/cards/test-item.stories.ts`, `./src/components/tests/cards/test-item-passed.stories.ts`, `./src/components/tests/cards/test-item-failed.stories.ts`, `./src/components/tests/cards/test-item-expired.stories.ts`, `./src/components/tests/cards/specs-test-item-passed.stories.ts`, `./src/components/tests/cards/basic-screening-card.stories.ts`, `./src/components/tests/cards/test-result-item.stories.ts`, `./src/components/tests/cards/test-result-additional.stories.ts`
- Storybook `career-web`: `tests-cards-testitem--passed`, `tests-cards-testitem--expired`, `tests-cards-testitem--failed`, `tests-cards-testitem--visible-to-all`, `tests-cards-testitem--hidden-from-others`, `tests-cards-testitem--guest-visibility`, `tests-cards-testitem--with-additional-block`, `tests-cards-testitempassed--guest-view`, `tests-cards-testitempassed--owner-with-paid-attempts`, `tests-cards-testitempassed--owner-already-paid`, `tests-cards-testitempassed--owner-unpaid`, `tests-cards-testitempassed--owner-with-payment-error`, `tests-cards-testitempassed--hidden-result`, `tests-cards-testitempassed--with-level`, `tests-cards-testitempassed--with-available-attempts`, `tests-cards-testitempassed--type-spec`, `tests-cards-testitemfailed--can-pass-again`, `tests-cards-testitemfailed--cannot-pass-again`, `tests-cards-testitemfailed--with-paid-attempts`, `tests-cards-testitemfailed--with-available-attempts`, `tests-cards-testitemfailed--paid-attempts-cannot-pass-again`, `tests-cards-testitemexpired--owner-can-pass-again`, `tests-cards-testitemexpired--owner-cannot-pass-again`, `tests-cards-testitemexpired--owner-with-paid-attempts`, `tests-cards-testitemexpired--guest-view`, `tests-cards-testitemexpired--with-level`, `tests-cards-testitemexpired--hidden`, `tests-cards-testitemexpired--with-report-payment-required`, `tests-cards-specstestitempassed--guest-view`, `tests-cards-specstestitempassed--owner-can-pass-again`, `tests-cards-specstestitempassed--owner-cannot-pass-again`, `tests-cards-specstestitempassed--owner-with-paid-attempts`, `tests-cards-specstestitempassed--with-level`, `tests-cards-specstestitempassed--hidden`, `tests-cards-basicscreeningcard--guest-view`, `tests-cards-basicscreeningcard--owner-view`, `tests-cards-basicscreeningcard--already-sent`, `tests-cards-basicscreeningcard--with-description`, `tests-cards-basicscreeningcard--marked`, `tests-cards-basicscreeningcard--marked-not-highlighted`, `tests-cards-basicscreeningcard--with-screening-info`, `tests-cards-testresultitem--skill-passed-owner`, `tests-cards-testresultitem--skill-passed-guest`, `tests-cards-testresultitem--spec-passed-owner`, `tests-cards-testresultitem--spec-passed-guest`, `tests-cards-testresultitem--expired-owner-can-pass-again`, `tests-cards-testresultitem--expired-owner-cannot-pass-again`, `tests-cards-testresultitem--expired-guest`, `tests-cards-testresultitem--failed-can-pass-again`, `tests-cards-testresultitem--failed-cannot-pass-again`, `tests-cards-testresultitem--failed-with-paid-attempts`, `tests-cards-testresultitem--passed-with-paid-attempts`, `tests-cards-testresultitem--passed-hidden`, `tests-cards-testresultadditional--has-report`, `tests-cards-testresultadditional--payment-required`, `tests-cards-testresultadditional--free-period-report`, `tests-cards-testresultadditional--payment-cancelled`, `tests-cards-testresultadditional--payment-processing`, `tests-cards-testresultadditional--curator-view`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
