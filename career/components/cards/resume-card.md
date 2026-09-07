# ResumeCard · Карточка резюме

| | |
|---|---|
| **Категория** | Карточки |
| **Корневой класс** | — |
| **CSS** | `ui/components/cards.css` |
| **Живая реализация** | нет — см. «Ограничения» |
| **Snapshot Storybook** | 0 из 3 |

## Назначение

Карточка специалиста в поиске резюме: аватар, имя, специализация, навыки, действия.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-rank-bronze` | `#d1a584` | из `:root` Career |
| `--color-ui-gray` | `#ccc` | из `:root` Career |
| `--color-ui-orange` | `#fdad0d` | из `:root` Career |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
.gold { fill:var(--color-ui-orange) }
.silver { fill:var(--color-ui-gray) }
.bronze { fill:var(--color-rank-bronze) }
```

## Ограничения

- Все три story сломаны в самом Storybook Career (недостающие чанки сборки, HTTP 404). Разметка не снята.
- Собственный CSS компонента — 158 байт: почти вся карточка собрана утилитами прямо в разметке, поэтому из CSS её вид не восстанавливается.
- ЧЕГО НЕ ХВАТАЕТ: рабочего Storybook, либо snapshot страницы `/resumes` production, либо узла Figma с карточкой резюме.

## Источники

- Файлы в репозитории `career-web`: `./src/components/resumes/resume-card/resume-card.stories.ts`
- Storybook `career-web`: `resumes-resumecard--specialist`, `resumes-resumecard--specialist-searching`, `resumes-resumecard--habr-specialist`
- CSS: секция `resume-card` в `ui/components/cards.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
