# SocialIcon · Иконка сервиса

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | `svg-icon` |
| **CSS** | _только утилиты_ |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 2 из 2 |

## Назначение

Иконки внешних сервисов и контактов: github, telegram, linkedin и прочие. Берутся из отдельных спрайтов `contacts.svg` и `social-v3.1.svg`.

## Анатомия

```
svg.svg-icon
  use  [xlink:href="/career-web/images/sprites/social-v3.1.svg#facebook"]
```

_Разметка story `icons-socialicon--default`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `icon` | SocialIconVariant | — | facebook · twitter · instagram · youtube · vk · dzen · github · telegram · telegram-bot | `select` |
| `size` | string\|number | `24` | — | `number` |

## Токены

_Компонент не обращается к переменным напрямую._

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `social-v3.1.svg` | `#dzen` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#facebook` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#github` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#instagram` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#telegram` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#telegram-bot` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#twitter` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#vk` | `ui/assets/icons/social-v3.1.svg` |
| `social-v3.1.svg` | `#youtube` | `ui/assets/icons/social-v3.1.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Разметка

```html
<svg class="svg-icon" width="24" height="24" style="width: 24px; height: 24px;">
  <use xlink:href="../../ui/assets/icons/social-v3.1.svg#facebook"/>
</svg>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

_Собственного CSS нет: компонент собран утилитами Tailwind прямо в разметке. Все нужные правила — в `ui/utilities.css`._

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/icons/social-icon.stories.ts`
- Storybook `career-web`: `icons-socialicon--default`, `icons-socialicon--all-variants`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

SocialIcon — неинтерактивный primitive без собственных состояний. В ссылке иконка декоративна (`aria-hidden="true"`, `focusable="false"`), а ссылка получает имя вроде `aria-label="GitHub компании"`. Не используйте имя файла или бренда как единственный текст без контекста назначения ссылки.
