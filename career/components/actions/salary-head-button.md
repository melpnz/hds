# SalaryHeadButton · Кнопка зарплаты

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `salary-head-button` |
| **CSS** | `ui/components/buttons.css`, `ui/state-contract.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Составная кнопка в шапке раздела зарплат: показывает текущее значение и даёт добавить или обновить данные.

## Анатомия

```
div.salary-head-button
  a.salary-head-button__companies-link  [href="salaries/reports"]
    · «Для компаний»
  button.salary-head-button__update-btn.base-button.inline-flex.appearance-main.size-l.is-sizeable.salary-head-button__update-btn  [type="button" target="_self"]
    span.base-button__inner
      span.base-button__content
        · «Обновить мои данные»
```

_Разметка story `common-buttons-salaryheadbutton--salary-head-button-story`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

SalaryHeadButton — композиция ссылки и Button, а не новый button primitive.
Состояния `default`, `hover`, `focus-visible`, `pressed`, `disabled` и `loading`
принадлежат вложенному Button и наследуют его контракт. Loading задаётся как
`.is-loading` + `aria-busy="true"`; disabled — нативным `disabled`.

Ссылка `salary-head-button__companies-link` поддерживает `hover` и
`focus-visible`, но не получает искусственные disabled/loading состояния. Если
переход недоступен, ссылку следует не рендерить. Корневой контейнер собственных
интерактивных состояний не имеет.

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `hasAnySalary` | boolean | — | — | `boolean` |
| `showAdd` | boolean | — | — | `boolean` |
| `hasServices` | boolean | — | — | `boolean` |

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

Компонент реагирует на: `(max-width:767px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<div class="salary-head-button">
  <a href="salaries/reports" rel="noopener noreferrer" class="salary-head-button__companies-link">Для компаний</a>
  <button class="salary-head-button__update-btn base-button inline-flex appearance-main size-l is-sizeable salary-head-button__update-btn" type="button" target="_self">
    <span class="base-button__inner">
      <span class="base-button__content">Обновить мои данные</span>
    </span>
  </button>
</div>
```

## CSS

```css
.salary-head-button__update-btn { margin-left:16px }
.salary-head-button__companies-link { font-weight:600 }
@media (max-width:767px) {
  .salary-head-button__update-btn { height:40px;margin:0;width:100% }
  .salary-head-button__companies-link { display:block;margin-bottom:16px }
  .salary-head-button { width:100% }
}
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/buttons/salary-head-button/salary-head-button.stories.ts`
- Storybook `career-web`: `common-buttons-salaryheadbutton--salary-head-button-story`
- CSS: секция `salary-head-button` в `ui/components/buttons.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
