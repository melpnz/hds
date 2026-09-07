# ResumesGuideCard · Карточка гайда

| | |
|---|---|
| **Категория** | Баннеры |
| **Корневой класс** | `desktop-only:max-w-[300px]` |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 1 из 1 |

## Назначение

Промо-карточка обучающего материала в боковой колонке поиска резюме.

## Анатомия

```
div.desktop-only:max-w-[300px]
  section.base-section.base-section--background-white.rounded-3xl.resumes-guide-card.relative.bg-[112px_auto].bg-no-repeat.tablet:pl-[120px].desktop-only:!bg-none
    picture.block.text-[0px]
      source
      img.max-w-full.tablet:hidden
    h3.mb-2.mt-3.text-display-s.font-semibold
      · «Гайд «Как искать по базе»»
    p.mb-3.mt-0.text-body-m
      · «Как эффективно использовать сочетание фи…»
    a.resumes-guide-card__button.relative.z-20.base-button.inline-flex.appearance-main.size-l.is-sizeable.resumes-guide-card__button.relative.z-20  [href="/info/resumes_search" target="_blank"]
      span.base-button__inner
        span.base-button__content
          · «Узнать больше»
    a.absolute.bottom-0.left-0.right-0.top-0.z-10.text-mute  [href="/info/resumes_search" target="_blank"]
```

_Разметка story `banners-resumesguidecard--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

Подтверждены CSS и разметкой: `.is-sizeable`.

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--32b2ffb0` | — | задаётся компонентом или средой, значения в сборке нет |
| `--32b2ffee` | — | задаётся компонентом или средой, значения в сборке нет |

## Responsive

Компонент реагирует на: `(min-width:1024px)`, `(-webkit-min-device-pixel-ratio:1.5)`, `(max-width:1023px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- Вся карточка кликабельна за счёт растянутой ссылки-накладки поверх содержимого; кнопка внутри поднята `z-20`, чтобы оставаться отдельной целью.
- Иллюстрация ведёт себя по-разному на трёх ширинах: фоном справа на десктопе (`desktop-only:!bg-none` отключает), отдельным `img` на узком, с отступом `tablet:pl-[120px]` на среднем.

## Разметка

```html
<div class="desktop-only:max-w-[300px]">
  <section class="base-section base-section--background-white rounded-3xl resumes-guide-card relative bg-[112px_auto] bg-no-repeat tablet:pl-[120px] desktop-only:!bg-none" style="--32b2ffee: url(https://assets.habr.com/staging-career-web/career-web/images/spec_help_mobile_1x.png); --32b2ffb0: url(https://assets.habr.com/staging-career-web/career-web/images/spec_help_mobile_2x.png);">
    <picture class="block text-[0px]">
      <source srcset="https://assets.habr.com/staging-career-web/career-web/images/spec_help_1x.jpg 1x, https://assets.habr.com/staging-career-web/career-web/images/spec_help_2x.jpg 1.5x">
      <img class="max-w-full tablet:hidden" src="../../ui/assets/images/spec_help_2x.jpg" alt width="252" height="150">
    </picture>
    <h3 class="mb-2 mt-3 text-display-s font-semibold">Гайд «Как искать по базе»</h3>
    <p class="mb-3 mt-0 text-body-m">Как эффективно использовать сочетание фильтров и поисковой строки</p>
    <a class="resumes-guide-card__button relative z-20 base-button inline-flex appearance-main size-l is-sizeable resumes-guide-card__button relative z-20" href="/info/resumes_search" target="_blank">
      <span class="base-button__inner">
        <span class="base-button__content">Узнать больше</span>
      </span>
    </a>
    <a class="absolute bottom-0 left-0 right-0 top-0 z-10 text-mute" target="_blank" href="/info/resumes_search" title="Узнать больше"></a>
  </section>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.resumes-guide-card { background-image:var(--32b2ffee) }
.resumes-guide-card__button { display:flex;margin:0;width:-moz-fit-content;width:fit-content }
@media (min-width:1024px) {
  .resumes-guide-card__button { margin:0 auto }
}
@media (-webkit-min-device-pixel-ratio:1.5) {
  .resumes-guide-card { background-image:var(--32b2ffb0) }
}
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/resumes/resumes-guide-card.stories.ts`
- Storybook `career-web`: `banners-resumesguidecard--default`
- CSS: секция `resumes-guide-card` в `ui/components/cards.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
