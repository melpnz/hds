# SkillChip · Чип навыка

| | |
|---|---|
| **Категория** | Метки и статусы |
| **Корневой класс** | `skill-chip` |
| **CSS** | `ui/components/chips.css` |
| **Живая реализация** | `showcase/components.html` |
| **Snapshot Storybook** | 4 из 4 |

## Назначение

Навык в профиле, резюме и вакансии. Надстройка над BaseChip: добавляет название, иконку подтверждения и грейд. Подтверждённый навык использует вариант `--approved`.

## Анатомия

```
div.flex.flex-wrap.gap-2
  button.base-chip.base-chip--default.base-chip--clickable.base-chip--interactive.skill-chip  [type="button"]
    span.base-chip__content
      span.skill-chip__title
        · «JavaScript»
  button.base-chip.base-chip--approved.base-chip--clickable.base-chip--interactive.skill-chip  [type="button"]
    span.base-chip__content
      span.skill-chip__title
        · «TypeScript»
      svg.svg-icon.skill-chip__icon
        use  [xlink:href="/career-web/images/sprites/sprite.svg?v=5.63.0#check-approved"]
      span.skill-chip__grade
        · «expert»
```

_Разметка story `skills-skillchip--gallery`, снятая из DOM. Vue-скоуп `data-v-*` снят._

## Состояния

В production-снимке собственных состояний SkillChip нет: интерактивные состояния наследуются от BaseChip. Нормативные состояния нового кода перечислены ниже.

## Props

| Prop | Тип | По умолчанию | Значения | Control |
|---|---|---|---|---|
| `skill` | ResumeSkill \| HabrResumeSkill | — | — | `object` |
| `tooltipText` | string | — | — | `text` |
| `disabled` | boolean | `false` | — | `boolean` |
| `hasHtml` | boolean | `false` | — | `boolean` |
| `clickable` | boolean | `true` | — | `boolean` |
| `click` | other | — | — | `object` |

## Токены

| Переменная | Значение | Статус |
|---|---|---|
| `--color-ui-green` | `#3dc24a` | из `:root` Career |
| `--color-ui-green-accent` | `#00ad3a` | из `:root` Career |

## Иконки

| Спрайт | Символ | Локальный файл |
|---|---|---|
| `sprite.svg` | `#check-approved` | `ui/assets/icons/sprite.svg` |

## Responsive

_В CSS и разметке компонента брейкпоинтов не объявлено — он подстраивается только под ширину контейнера._

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## Поведение

- `hasHtml` разрешает разметку внутри названия — так подсвечивается совпадение с поисковым запросом тегом `mark`.
- Грейд (`expert` и подобные) — отдельный узел `skill-chip__grade` после иконки, а не часть названия.

## Разметка

```html
<div class="flex flex-wrap gap-2">
  <button type="button" class="base-chip base-chip--default base-chip--clickable base-chip--interactive skill-chip">
    <span class="base-chip__content">
      <span class="skill-chip__title">JavaScript</span>
    </span>
  </button>
  <button type="button" class="base-chip base-chip--approved base-chip--clickable base-chip--interactive skill-chip">
    <span class="base-chip__content">
      <span class="skill-chip__title">TypeScript</span>
      <svg class="svg-icon skill-chip__icon" width="24" height="24" style="width: 24px; height: 24px;">
        <use xlink:href="../../ui/assets/icons/sprite.svg#check-approved"/>
      </svg>
      <span class="skill-chip__grade">expert</span>
    </span>
  </button>
</div>
```

_Пути к спрайтам и изображениям в этом блоке — локальные, от папки спецификации. В блоке «Анатомия» выше сохранён продовый путь: это протокол снятого DOM, а не образец для вёрстки._

## CSS

```css
.skill-chip { border-radius:.5rem;padding:.25rem }
.skill-chip__title { padding-left:.25rem;padding-right:.25rem }
.skill-chip__icon { fill:var(--color-ui-green);color:var(--color-ui-green) }
.skill-chip__grade { color:var(--color-ui-green-accent);margin-right:6px;text-transform:capitalize }
```

## Ограничения

- Не выявлено: разметка, CSS и props извлечены полностью.

## Источники

- Файлы в репозитории `career-web`: `./src/components/skills/skill-chip.stories.ts`
- Storybook `career-web`: `skills-skillchip--default`, `skills-skillchip--approved`, `skills-skillchip--html-title`, `skills-skillchip--gallery`
- CSS: секция `skill-chip` в `ui/components/chips.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)

## Нормативный контракт R2-D

SkillChip наследует контракт Chip. Для простого навыка используйте `span`; для перехода — `a`; для действия или выбора — `button`.

| Состояние | Контракт |
|---|---|
| `default` | статический или интерактивный навык |
| `hover` | наследуется от интерактивного BaseChip |
| `focus-visible` | наследуется от интерактивного BaseChip |
| `selected` | `aria-pressed="true"`, только если навык выбирается |
| `disabled` | `disabled`/`aria-disabled="true"`; событие `click` не отправляется |

`approved` — вариант данных (подтверждённый навык), а не состояние `selected`.
