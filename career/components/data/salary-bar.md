# SalaryBar · Зарплатная шкала

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | `salary-bar` |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 11 из 11 |

## Назначение

Горизонтальная шкала зарплатной вилки с медианой. Главный элемент раздела зарплат и блока «зарплаты» в профиле компании.

## Анатомия

```
div.mx-auto.w-[804px].max-w-full.p-6.py-12
  div.salary-bar.salary-bar--has-user-avatar
    div.salary-bar__container
      div.salary-bar__min.v-popper--has-tooltip
        · «12k»
      div.salary-bar__max.v-popper--has-tooltip
        · «479k»
      div.salary-bar__circle-container
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.hidden.phone:block
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
        div.salary-bar__circle-item.phone:hidden
      div.salary-bar__sub-bar
        div.salary-bar__sub-bar-values
          div.salary-bar__sub-bar-min.v-popper--has-tooltip
            · «90k»
          div.salary-bar__sub-bar-max.v-popper--has-tooltip
            · «250k»
      div.salary-bar__median-divider
      div.salary-bar__median-arrow
      div.salary-bar__median-divider-value.v-popper--has-tooltip
        · «180k»
      div.salary-bar__user-salary-divider
      div.salary-bar__my-avatar.v-popper--has-tooltip
        div.salary-bar__my-avatar-wrapper
          img.salary-bar__my-avatar-image
      div.salary-bar__avatar-arrow
```

_Разметка story `salary-salarybar--user-salary-within-range`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

SalaryBar — визуализация данных без интерактивных UI states. `hideValues` и наличие пользовательской зарплаты — data variants, а не selected/disabled.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `generalGraphGroup` | GeneralGraphData | — | — | `object` |
| `hideValues` | boolean | — | — | `boolean` |
| `userSalary` | UserSalariesStruct | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-font-gray` | `var(--color-ui-gray-2)` | из `:root` Career |
| `--color-graph-violet` | `#8164f7` | из `:root` Career |
| `--color-graph-violet-70` | `rgba(151,135,253,.7)` | из `:root` Career |
| `--color-ui-gray-bg` | `#ededed` | из `:root` Career |
| `--color-ui-gray-bg-60` | `color-mix(in srgb,var(--color-ui-gray-bg) 60%,transparent)` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |
| `--color-ui-orange-12` | `color-mix(in srgb,var(--color-ui-orange) 12%,transparent)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |
| `--mask-image-url` | — | задаётся компонентом или средой, значения в сборке нет |
| `--salary-hidden-value-mask` | `url("data:image/svg+xml,…")` | не из сборки: `ui/assets/illustrations/mask.svg`, встроенный пакетом — см. «Заглушка вместо скрытой цены» |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#info` | `ui/assets/icons/sprite.svg` |

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- `hideValues` убирает числа, оставляя только форму распределения, — так шкала показывается пользователям без доступа к данным.

## Разметка

```html
<div class="mx-auto w-[804px] max-w-full p-6 py-12">
  <div class="salary-bar salary-bar--has-user-avatar">
    <div class="salary-bar__container">
      <div class="salary-bar__min v-popper--has-tooltip">12k</div>
      <div class="salary-bar__max v-popper--has-tooltip">479k</div>
      <div class="salary-bar__circle-container">
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item hidden phone:block"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
        <div class="salary-bar__circle-item phone:hidden"></div>
      </div>
      <div class="salary-bar__sub-bar" style="left: max(10px, 16.7024%); width: max(40px, 34.2612%);">
        <div class="salary-bar__sub-bar-values">
          <div class="salary-bar__sub-bar-min v-popper--has-tooltip">90k</div>
          <div class="salary-bar__sub-bar-max v-popper--has-tooltip">250k</div>
        </div>
      </div>
      <div class="salary-bar__median-divider" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-arrow" style="left: clamp(10px, 35.9743%, 100% - 10px);"></div>
      <div class="salary-bar__median-divider-value v-popper--has-tooltip" style="left: clamp(10px, 35.9743%, 100% - 10px);">180k</div>
      <div class="salary-bar__user-salary-divider" style="left: clamp(22px, 40.257%, 100% - 22px);"></div>
      <div class="salary-bar__my-avatar v-popper--has-tooltip" style="left: clamp(22px, 40.257%, 100% - 22px);">
        <div class="salary-bar__my-avatar-wrapper">
          <img class="salary-bar__my-avatar-image" src="../../ui/assets/illustrations/avatar-default-user.svg" alt="Аватар пользователя" style="width: 40px; height: auto; transform: translate(0px, calc(-50% + 20px));">
        </div>
      </div>
      <div class="salary-bar__avatar-arrow" style="left: clamp(22px, 40.257%, 100% - 22px);"></div>
    </div>
  </div>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.salary-notice { background:linear-gradient(0deg,var(--color-ui-orange-12),var(--color-ui-orange-12)),var(--color-ui-white);border:1px solid var(--color-ui-orange);border-radius:12px;display:flex;gap:8px;margin-bottom:24px;margin-left:auto;max-width:355px;padding:12px 16px }
.salary-notice.salary-notice--wide { max-width:500px }
.salary-notice__icon { color:var(--color-ui-orange);flex-shrink:0 }
.salary-notice__text { color:var(--color-font-black);font-size:14px;line-height:20px }
.salary-bar { margin-bottom:52px;margin-top:0 }
.salary-bar--has-user-avatar { margin-top:52px }
.salary-bar--with-notice { margin-top:-8px }
.salary-bar__container { background:var(--color-ui-gray-bg-60);border-radius:12px;position:relative }
.salary-bar__circle-container,.salary-bar__container { height:32px;width:100% }
.salary-bar__circle-container { display:flex;justify-content:space-between;overflow:hidden;padding:14px 24px 0;position:absolute;top:0 }
.salary-bar__circle-item { background:var(--color-ui-gray-bg);border-radius:50%;height:4px;width:4px }
.salary-bar__min { left:0 }
.salary-bar__max { right:0 }
.salary-bar__max,.salary-bar__min { color:var(--color-font-gray);cursor:pointer;font-weight:600;line-height:24px;position:absolute;top:100% }
.salary-bar__max.salary-bar__max--top,.salary-bar__min.salary-bar__min--top { bottom:100%;top:unset }
.salary-bar__avatar-arrow,.salary-bar__median-arrow,.salary-bar__median-divider,.salary-bar__median-divider-value,.salary-bar__my-avatar,.salary-bar__user-salary-divider { position:absolute;transform:translate(-50%) }
.salary-bar__median-divider { background:var(--color-ui-white);box-shadow:0 5px 25px #0000001a }
.salary-bar__median-arrow { border-bottom:8px solid var(--color-graph-violet);border-left:8px solid transparent;border-right:8px solid transparent;top:52px }
.salary-bar__median-divider-value { bottom:-52px;color:var(--color-font-black);cursor:pointer;font-size:18px;font-weight:600;line-height:24px }
.salary-bar__user-salary-divider { background:var(--color-ui-orange) }
.salary-bar__median-divider,.salary-bar__user-salary-divider { border-radius:6px;height:24px;top:4px;width:4px }
.salary-bar__sub-bar { background:linear-gradient(90deg,var(--color-graph-violet-70) 0,var(--color-graph-violet) 100%);border:2px solid var(--color-ui-white);border-radius:12px;box-shadow:0 4px 16px #8e7af63d;height:32px;position:absolute }
.salary-bar__sub-bar-values { align-items:center;color:var(--color-graph-violet);display:flex;font-size:16px;font-weight:600;justify-content:space-between;left:0;line-height:24px;min-width:100%;position:absolute;top:calc(100% + 12px);white-space:nowrap;width:-moz-max-content;width:max-content }
.salary-bar__sub-bar-values--align-right { left:auto;right:0 }
.salary-bar__sub-bar-max,.salary-bar__sub-bar-min { cursor:pointer;flex:none }
.salary-bar__avatar-arrow { border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid var(--color-ui-orange);top:-4px }
.salary-bar__my-avatar { align-items:center;border:2px solid var(--color-ui-orange);border-radius:50%;cursor:pointer;display:flex;height:44px;justify-content:center;top:-52px;width:44px }
.salary-bar__my-avatar-wrapper { border-radius:50%;height:40px;overflow:hidden;width:40px }
.salary-bar__my-avatar-image { -o-object-fit:cover;object-fit:cover }
.salary-bar--hide-values .salary-bar__median-divider-value,.salary-bar--hide-values .salary-bar__sub-bar-max,.salary-bar--hide-values .salary-bar__sub-bar-min { display:flex;opacity:.6 }
.salary-bar--hide-values .salary-bar__max .salary-bar__hidden-value,.salary-bar--hide-values .salary-bar__min .salary-bar__hidden-value { filter:grayscale(100%) brightness(500%) brightness(70%) }
.salary-bar--hide-values .salary-bar__median-divider-value { bottom:-56px;color:var(--color-graph-violet);transform:translate(-20px) }
.salary-bar--hide-values .salary-bar__max,.salary-bar--hide-values .salary-bar__min { color:var(--color-font-gray);display:flex;opacity:.6 }
.salary-bar--hide-values .salary-bar__hidden-value { background-image:var(--mask-image-url);background-size:cover;color:transparent }
@media (max-width:767px) {
  .salary-notice { margin-bottom:16px }
}
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Заглушка вместо скрытой цены

В варианте `salary-bar--hide-values` вместо каждой суммы стоит
`.salary-bar__hidden-value` — коробка с текстом-заполнителем, поверх которого
рисуется точечная заглушка, и суффикс `k` рядом.

Извлечённое правило рисует заглушку фоном: `background-image:var(--mask-image-url)`.
**Значения переменной в сборке нет** — его подставляет приложение, поэтому в пакете
заглушка не отображалась вовсе. Файл при этом в пакете есть:
`ui/assets/illustrations/mask.svg`.

Пакет закрывает пробел в `ui/components.css` (слой «чего в сборке нет»), с одним
отличием от сборки: изображение подключается **CSS-маской с заливкой
`currentColor`**, а не фоном. Причина — цвет. `mask.svg` нарисован одним
фиолетовым, а заглушка стоит рядом с подписями трёх цветов: серой у краёв шкалы
(`--color-font-gray`), фиолетовой у границ разреза и у медианы
(`--color-graph-violet`). Сборка добивается серого фильтром
`grayscale + brightness` поверх фиолетового; маска берёт цвет прямо у подписи,
поэтому этот фильтр в пакете снят.

Два следствия, важные при переносе:

* `color:transparent` из сборки гасил и текст-заполнитель, и `currentColor`.
  Цвет возвращается наследованием, а текст гасится `text-fill-color` — он
  не влияет на `currentColor` и сохраняет ширину коробки, заданную глифами.
* Маска встроена в CSS как data-URI, а не подключена по пути. Chrome не даёт
  CSS-маске подтянуть внешний файл со страницы, открытой как `file://`,
  а витрину пакета открывают именно так.
* Полотно берётся своего размера (`mask-size: auto`), а коробка подписи просто
  вырезает из него окно. Извлечённое правило масштабировало картинку
  (`background-size: cover`), но это было рассчитано на фон: под коробку ~30x24
  полотно 128x52 ужимается, и точки становятся меньше пикселя.

## Источники

- Файлы в репозитории `career-web`: `./src/components/salary/salary-bar.stories.ts`
- Storybook `career-web`: `salary-salarybar--user-salary-within-range`, `salary-salarybar--user-salary-at-minimum`, `salary-salarybar--user-salary-at-maximum`, `salary-salarybar--high-user-salary`, `salary-salarybar--low-user-salary`, `salary-salarybar--hidden-user-salary`, `salary-salarybar--without-user-salary`, `salary-salarybar--hidden-values-for-guest`, `salary-salarybar--update-salary-notice`, `salary-salarybar--calculator-access-without-current-salary`, `salary-salarybar--mobile`
- CSS: секция `salary-bar` в `ui/components/cards.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт base scope

Визуальная шкала оборачивается в `figure` с `figcaption` либо получает `role="img"` и полное `aria-label`: диапазон, медиана и положение зарплаты пользователя. Декоративные circles/dividers скрываются от accessibility tree. Tooltips не должны быть единственным источником значений.

Если `hideValues=true` ограничивает доступ к данным, скрытые числа не должны оставаться в DOM/ARIA. Вместо них сообщается, что значения доступны после требуемого действия. Форматирование валюты и разрядов выполняется локализованно; значения и позиции вычисляются из одного набора данных.
