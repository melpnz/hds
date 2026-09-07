# Avatar · Аватар

| | |
|---|---|
| **Категория** | Отображение данных |
| **Корневой класс** | — |
| **CSS** | `ui/components/primitives.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 0 из 0 |

## Назначение

Изображение пользователя или компании. Размер и радиус задаются не классами, а инлайновыми переменными `--avatar-size` и `--avatar-radius` — поэтому шкала размеров не фиксирована в CSS.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--avatar-radius` | — | задаётся компонентом или средой, значения в сборке нет |
| `--avatar-size` | — | задаётся компонентом или средой, значения в сборке нет |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- `--avatar-radius: 9999px` даёт круг для человека; для компании ставится небольшой радиус.

## CSS

```css
.base-avatar { --avatar-size:24px;--avatar-radius:8px;display:inline-block;flex-shrink:0;height:var(--avatar-size);overflow:visible;position:relative;width:var(--avatar-size) }
.base-avatar,.base-avatar__img { border-radius:var(--avatar-radius) }
.base-avatar__img { display:block;height:100%;-o-object-fit:cover;object-fit:cover;width:100% }
.user-avatar { border-radius:3px;display:block;-o-object-fit:cover;object-fit:cover;overflow:hidden }
.user-avatar--rounded { border-radius:50% }
```

## Ограничения

- Своих story нет. Шкала размеров, которая используется в продукте, извлечена из production-замеров, а не из Storybook: см. `ui/components.css`, класс `.avatar--*`.

## Источники

- Storybook `career-web`: 
- CSS: секция `base-avatar` в `ui/components/primitives.css`, секция `user-avatar` в `ui/components/primitives.css`
- Production: шкала 20/24/32/36/40/48/56/72/96/140 замерена в production
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-E

Avatar — неинтерактивный primitive без UI states. Если аватар открывает профиль или меню, интерактивность принадлежит `a`/`AvatarButton`, а не изображению.

- Фотография, дублирующая видимое имя: `alt=""`.
- Самостоятельно значимое изображение: `alt` содержит имя человека или компании.
- Размер задаётся `--avatar-size`, форма — `--avatar-radius`; для нового кода корень `base-avatar`.
