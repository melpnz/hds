# Именование и состояния

- Каноническое имя — PascalCase по смыслу интерфейса. Имена Figma/Storybook
  сохраняются в `legacyAliases`, но не становятся каноном автоматически.
- `id` — kebab-case от канонического имени.
- Категории: `actions`, `forms`, `navigation`, `collections`, `data-display`,
  `feedback`, `overlays`, `layout`, `frame-modules`, `entities`.
- Виды: `primitive`, `component`, `module`, `adapter`.
- Статусы: `complete`, `partial`, `planned`, `legacy-only`, `figma-only`.
- Состояния: `default`, `hover`, `focus-visible`, `pressed`, `selected`,
  `current`, `checked`, `indeterminate`, `expanded`, `collapsed`, `open`,
  `closed`, `disabled`, `readOnly`, `loading`, `invalid`, `error`, `success`,
  `empty`, `dragActive`.

Не используй неоднозначные состояния `active`, `focus`, `select`, `inactive`.
