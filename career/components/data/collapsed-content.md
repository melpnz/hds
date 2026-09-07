# CollapsedContent · Свёрнутый блок

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | — |
| **CSS** | `ui/components/primitives.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Ограничение длинного текста по высоте с кнопкой «показать полностью». Применяется к описаниям вакансий и компаний.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

Компонент имеет два состояния: `collapsed` и `expanded`. Визуальные legacy-классы не заменяют ARIA-состояние управляющей кнопки.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.collapsed-content { will-change:height }
.collapsed-content--overflow { overflow:hidden }
.collapsed-content--animated { transition:height .25s ease-in-out }
.collapsed-content__body { opacity:0;transition:opacity .25s ease-in-out;will-change:opacity }
.collapsed-content__body--notTransparent,.collapsed-content__body--show { opacity:1 }
```

## Ограничения

- Собственных story нет — данные из CSS.

## Источники

- Storybook `career-web`: 
- CSS: секция `collapsed-content` в `ui/components/primitives.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

```html
<div class="collapsed-content" data-state="collapsed">
  <div class="collapsed-content__body" id="vacancy-description">…</div>
  <button class="collapsed-content__toggle" type="button"
          aria-expanded="false" aria-controls="vacancy-description">
    Показать полностью
  </button>
</div>
```

В `collapsed` текст ограничен по высоте, кнопка сообщает `aria-expanded="false"`. В `expanded` ограничение снимается, `aria-expanded="true"`, подпись меняется на «Свернуть». Фокус остаётся на кнопке; клавиши Enter и Space работают нативно. Если текст помещается, trigger не рендерится. При reduced motion переход становится практически мгновенным.
