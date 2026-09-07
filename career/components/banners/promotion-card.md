# PromotionCard · Карточка продвижения

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | — |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | нет — см. «Ограничения» |
| **Snapshot Storybook** | 0 из 1 |

## Назначение

Промо-карточка платной возможности в боковой колонке.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-font-black` | `var(--color-ui-gray-1)` | из `:root` Career |
| `--color-ui-white` | `#fff` | из `:root` Career |

## Responsive

Компонент реагирует на: `(max-width:479px)`, `(max-width:1023px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.promotion-modal { padding:0 24px 24px;text-align:left }
.promotion-modal__description { color:var(--color-font-black);font-size:16px;font-weight:400;line-height:20px }
.promotion-modal__actions { display:flex;gap:8px;margin-top:24px }
.promotion-card { align-items:center;background:radial-gradient(120.12% 28471.04% at 104.17% 101.5%,#d1a8fa 0,#8164f7 65.06%),#fff;border-radius:8px;color:var(--color-ui-white);cursor:pointer;display:grid;position:relative }
.promotion-card--appearance-header { border-radius:4px;grid-template-columns:28px 1fr 24px;padding:2px 4px 2px 0 }
.promotion-card--appearance-resumes { grid-template-columns:44px 1fr 32px;padding:6px 8px 6px 0 }
.promotion-card__icon--appearance-header { height:28px;width:28px }
.promotion-card__icon--appearance-resumes { height:44px;width:44px }
.promotion-card__button--appearance-resumes { height:32px;width:32px }
.promotion-card__info { display:grid;grid-auto-flow:row;text-align:left }
.promotion-card__title { display:none }
.promotion-card__title--short.promotion-card__title--appearance-header { display:block }
.promotion-card__title--appearance-resumes { display:block;font-size:16px;font-weight:600;line-height:20px }
.promotion-card__title--appearance-resumes.promotion-card__title--short { display:none }
.promotion-card__title--appearance-header { font-size:14px;font-weight:600;line-height:20px;margin-right:8px }
.promotion-card__description { color:#ffffffb3;font-size:14px;font-weight:400;line-height:20px }
.promotion-card__description--appearance-header { display:none }
.promotion-card__button--appearance-header { height:24px;width:24px }
@media (max-width:479px) {
  .promotion-modal { padding:0 24px 16px }
  .promotion-modal__actions { margin-top:16px }
}
@media (max-width:1023px) {
  .promotion-card--appearance-header { grid-template-columns:44px 1fr 32px;padding:6px 8px 6px 0 }
  .promotion-card__icon--appearance-header { height:44px;width:44px }
  .promotion-card__title--short.promotion-card__title--appearance-header { display:none }
  .promotion-card__title--appearance-header { display:block;font-size:16px;margin-right:0 }
  .promotion-card__description--appearance-header { display:block }
  .promotion-card__button--appearance-header { height:32px;width:32px }
}
```

## Ограничения

- Единственная story сломана в самом Storybook Career (недостающие чанки сборки).
- CSS компонента сохранён (2 142 байта) — геометрия и цвета восстановимы, структура DOM нет.
- ЧЕГО НЕ ХВАТАЕТ: разметки. Достаточно одного snapshot production страницы, где карточка показана.

## Источники

- Файлы в репозитории `career-web`: `./src/components/promotion-card/promotion-card.stories.ts`
- Storybook `career-web`: `banners-promotioncard--default`
- CSS: секция `promotion-card` в `ui/components/cards.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
