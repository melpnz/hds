# BoosterGradientWrapper · Градиентная обёртка

| | |
|---|---|
| **Категория** | Обратная связь |
| **Корневой класс** | — |
| **CSS** | `ui/components/primitives.css` |
| **Живая реализация** | `showcase/components.html#d-avatar` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Градиентная рамка вокруг блока для платных возможностей («бустер»). Режим `avatar` отмечает профиль пользователя с подпиской, поэтому живой пример стоит рядом со шкалой аватаров, а не среди служебных display roots. Career держит для этого отдельные токены-градиенты: `--color-booster-gradient`, `--color-booster-badge`, `--color-booster-banner-bg`.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-booster-gradient` | `radial-gradient(circle at 0% 0%,var(--color-ui-orange) 10%,var(--color-ui-pink) 40%,var(--color-ui-primary-light) 80%)` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.booster-gradient-wrapper { height:-moz-min-content;height:min-content;position:relative;width:-moz-min-content;width:min-content }
.booster-gradient-wrapper:before { background:var(--color-booster-gradient);content:"";-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;position:absolute }
.booster-gradient-wrapper--mode-avatar:before { border-radius:50%;top:-4px;right:-4px;bottom:-4px;left:-4px;padding:2px }
.booster-gradient-wrapper--mode-card { height:auto;width:auto }
.booster-gradient-wrapper--mode-card:before { border-radius:24px;top:0;right:0;bottom:0;left:0;padding:2px }
.booster-gradient-wrapper--mode-card .base-section { border:none }
.booster-gradient-wrapper>span.base-avatar { display:block }
```

## Ограничения

- Собственных story нет — данные из CSS и токенов.

## Источники

- Storybook `career-web`: 
- CSS: секция `booster-gradient-wrapper` в `ui/components/primitives.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт base scope

BoosterGradientWrapper — декоративный wrapper без UI states и без собственной семантики. Канонические modes: `avatar` и `card`; они меняют геометрию рамки, а не смысл содержимого. Псевдоэлемент не попадает в accessibility tree, поэтому имя и интерактивность всегда принадлежат вложенному Avatar, Card или действию.

Не используйте booster-gradient как единственный признак платной функции: статус должен быть продублирован текстом или доступной меткой.
