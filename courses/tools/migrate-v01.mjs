import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workspace = resolve(root, '..');
const source = resolve(workspace, 'archive/courses/v0.1');

if (!existsSync(join(source, 'machine/components.json'))) {
  throw new Error(`Courses v0.1 archive is missing: ${source}`);
}

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};
const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
};
const filesBelow = dir => readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => join(entry.parentPath, entry.name));
const kebab = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rulePath = id => `machine/rules/${kebab(id)}.json`;

const components = readJson(join(source, 'machine/components.json'));
const patterns = readJson(join(source, 'machine/patterns.json'));
const rules = readJson(join(source, 'machine/rules.json'));
const tokens = readJson(join(source, 'machine/tokens.json'));
const content = readJson(join(source, 'machine/content.json'));

const textareaRecord = {
  id: 'textarea',
  name: 'Textarea',
  category: 'forms',
  kind: 'component',
  spec: 'components/forms/textarea.md',
  status: 'complete',
  sourceScope: 'figma-only',
  step: 'v0.2-field-family',
  cssRoots: ['crs-field', 'crs-field--textarea'],
  dependsOn: [],
  usage: {
    when: 'Используйте для многострочного свободного текста: комментария, описания или сообщения.',
    whenNot: ['Для короткого однострочного значения — `TextInput`.'],
    related: ['text-input'],
  },
  a11y: { keyboard: 'Нативный `<textarea>` получает фокус по Tab; видимая подпись связывается через `label` или `aria-label`.' },
  limits: ['Production-вхождения Textarea в снятом публичном корпусе не найдены.'],
  provenance: 'Добавлен в v0.2 по Courses Figma `education-lib`, textarea, node `4058:4529`.',
  anchor: 'viewer/index.html#textarea',
  states: {
    required: ['default', 'hover', 'focus-visible', 'disabled', 'invalid'],
    captured: ['default', 'hover', 'focus-visible', 'disabled', 'invalid'],
    normative: [],
    uncaptured: [],
  },
  rules: [],
  evidence: {
    figma: [{ fileKey: 'KG36iTkwvKDmrw8XQhk7d6', fileName: 'education-lib', layerName: 'textarea', nodeId: '4058:4529', componentKey: null }],
    production: null,
    storybook: null,
  },
  sourceConflicts: [],
  markup: { html: '<textarea aria-label="Текст" placeholder="Placeholder"></textarea>', requires: ['ui/courses.css'] },
};
const radioButtonRecord = {
  id: 'radio-button',
  name: 'RadioButton',
  category: 'forms',
  kind: 'component',
  spec: 'components/forms/radio-button.md',
  status: 'complete',
  sourceScope: 'figma-only',
  step: 'v0.2-control-family',
  cssRoots: ['crs-control', 'crs-control--radio'],
  dependsOn: [],
  usage: {
    when: 'Выбор одного значения из взаимоисключающей группы.',
    whenNot: ['Для независимого выбора нескольких значений — `Checkbox`; для немедленного включения настройки — `Switch`.'],
    related: ['checkbox', 'switch'],
  },
  a11y: { keyboard: 'Группа нативных `<input type="radio">`: Tab переносит фокус в группу, стрелки меняют выбранный вариант.' },
  limits: ['Production- и Storybook-вхождения RadioButton в снятом корпусе не найдены.'],
  provenance: 'Добавлен в v0.2 по Courses Figma `education-lib`, radiobutton, node `693:1585`.',
  anchor: 'viewer/index.html#radio-button',
  states: {
    required: ['default', 'hover', 'focus-visible', 'checked', 'disabled', 'loading'],
    captured: ['default', 'hover', 'focus-visible', 'checked', 'disabled', 'loading'],
    normative: [],
    uncaptured: [],
  },
  rules: [],
  evidence: {
    figma: [{ fileKey: 'KG36iTkwvKDmrw8XQhk7d6', fileName: 'education-lib', layerName: 'radiobutton', nodeId: '693:1585', componentKey: null }],
    production: null,
    storybook: null,
  },
  sourceConflicts: [],
  markup: { html: '<label><input type="radio" name="option"> Вариант</label>', requires: ['ui/courses.css'] },
};
const modalRecord = {
  id: 'modal',
  name: 'Modal',
  category: 'overlays',
  kind: 'module',
  spec: 'components/overlays/modal.md',
  status: 'complete',
  sourceScope: 'figma-only',
  step: 'v0.2-modal-family',
  cssRoots: ['crs-modal'],
  dependsOn: ['button', 'sprite-icon'],
  usage: {
    when: 'Базовая диалоговая оболочка для содержимого, требующего отдельного контекста, подтверждения или отмены.',
    whenNot: ['Для быстрого мобильного выбора используйте специализированный bottom sheet.', 'Не создавайте новую модальную оболочку для каждого доменного сценария — наполняйте слоты Modal.'],
    related: ['promo-code-modal', 'filter-modal', 'button'],
  },
  a11y: { keyboard: 'Корень использует role="dialog" и aria-modal="true"; Escape закрывает диалог, после закрытия фокус возвращается в trigger.' },
  limits: ['Production-вхождения базовой оболочки в снятом публичном корпусе не подтверждены; спецификация собрана по Courses Figma.'],
  provenance: 'Добавлен в v0.2 по Courses Figma education-lib, Modal component set node 1144:25049.',
  anchor: 'viewer/index.html#modal',
  states: {
    required: ['default', 'open', 'closed', 'scroll'],
    captured: ['default', 'open', 'closed', 'scroll'],
    normative: [],
    uncaptured: [],
  },
  rules: [],
  evidence: {
    figma: [{ fileKey: 'KG36iTkwvKDmrw8XQhk7d6', fileName: 'education-lib', layerName: 'Modal', nodeId: '1144:25049', componentKey: null }],
    production: null,
    storybook: null,
  },
  sourceConflicts: [],
  markup: { html: '<div class="crs-modal" role="dialog" aria-modal="true" aria-label="Modal"></div>', requires: ['ui/courses.css'] },
};
const textInputIndex = components.findIndex(record => record.id === 'text-input');
components.splice(textInputIndex + 1, 0, textareaRecord);
const checkboxIndex = components.findIndex(record => record.id === 'checkbox');
components.splice(checkboxIndex + 1, 0, radioButtonRecord);
const promoCodeModalIndex = components.findIndex(record => record.id === 'promo-code-modal');
components.splice(promoCodeModalIndex, 0, modalRecord);

for (const path of ['machine/foundations', 'machine/components', 'machine/patterns', 'machine/rules', 'examples']) {
  rmSync(join(root, path), { recursive: true, force: true });
  mkdirSync(join(root, path), { recursive: true });
}
rmSync(join(root, 'ui/demo.css'), { force: true });

copy(join(source, 'ui'), join(root, 'ui'));
const spritePath = join(root, 'ui/assets/icons/sprite.svg');
const sprite = readFileSync(spritePath, 'utf8');
writeFileSync(spritePath, sprite.replace(/<\/svg>\s*$/, `  <svg id="arrow-down-figma" viewBox="0 0 24 24">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.22922 9.23657C6.53485 8.92114 7.03037 8.92114 7.336 9.23657L12 14.0501L16.664 9.23657C16.9696 8.92114 17.4652 8.92114 17.7708 9.23657C18.0764 9.55199 18.0764 10.0634 17.7708 10.3788L12.5534 15.7634C12.2478 16.0789 11.7522 16.0789 11.4466 15.7634L6.22922 10.3788C5.92359 10.0634 5.92359 9.55199 6.22922 9.23657Z" fill="currentColor"/>
  </svg>
</svg>`));
const pageExamplesCssPath = join(root, 'ui/page-examples.css');
copy(join(source, 'showcase/pages.css'), pageExamplesCssPath);
writeFileSync(pageExamplesCssPath, readFileSync(pageExamplesCssPath, 'utf8')
  .replace('font: 400 13px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;', 'font: 400 13px/1.45 Inter, sans-serif;')
  .replace('font: 400 11px/1.3 var(--doc-mono, ui-monospace, monospace);', 'font: 400 11px/1.3 Inter, sans-serif;'));
copy(join(source, 'evidence'), join(root, 'evidence'));
copy(join(source, 'docs/guide'), join(root, 'docs/guide'));
copy(join(source, 'components'), join(root, 'guide/components'));
copy(join(source, 'pages'), join(root, 'guide/pages'));
writeFileSync(join(root, 'guide/components/forms/textarea.md'), `# Textarea

## Статус

Спецификация v0.2 по Courses Figma; production-вхождения в снятом публичном корпусе не найдены.

## Назначение

Многострочный свободный текст: комментарий, описание или сообщение. Для короткого однострочного значения используйте [TextInput](text-input.md).

## Геометрия

- базовый корпус: 182×82 px в эталонном инстансе;
- border radius: 12 px;
- внутренние отступы: 12 px по горизонтали и 8 px по вертикали;
- текст: 16 px / 22 px, regular;
- текстовый контейнер получает дополнительные 2 px сверху.

## Состояния

\`default\`, \`hover\`, \`focus-visible\`, \`disabled\`, \`invalid\`; для каждого состояния в Figma существуют пустой и заполненный варианты.

## Доступность

Используйте нативный \`<textarea>\`. Видимая подпись связывается через \`label\`; при её отсутствии требуется \`aria-label\`. Ошибка передаётся через \`aria-invalid="true"\` и связанный текст ошибки.

## Источник

Courses Figma \`education-lib\`, node \`4058:4529\`.
`);
writeFileSync(join(root, 'guide/components/forms/radio-button.md'), `# RadioButton

## Статус

Спецификация v0.2 по Courses Figma; production- и Storybook-вхождения в снятом корпусе не найдены.

## Назначение

Выбор одного значения из взаимоисключающей группы. Для нескольких независимых значений используйте [Checkbox](checkbox.md), для немедленного включения настройки — [Switch](switch.md).

## Геометрия

- строка компонента: 26 px;
- слот контрола: 24×24 px, круг внутри — 22×22 px;
- выбранная точка: 12×12 px;
- gap между контролом и текстом: 8 px;
- текст: 16 px / 22 px, regular, со смещением 2 px сверху;
- focus-контур: 2 px, внешний размер 28×28 px.

## Состояния

\`default\`, \`hover\`, \`focus-visible\`, \`disabled\`, \`loading\`; каждое показано для \`off\` и \`on\`.

## Группы

Между элементами вертикальной группы — 16 px, горизонтальной — 24 px. Радиокнопки одной смысловой группы используют одинаковый атрибут \`name\`.

## Доступность

Используйте нативные \`<input type="radio">\`. Видимая подпись должна быть частью \`label\`; группа получает \`fieldset\` и \`legend\` либо эквивалентное доступное имя.

## Источник

Courses Figma \`education-lib\`: radiobutton node \`693:1585\`, control-list node \`717:191\`.
`);
writeFileSync(join(root, 'guide/components/overlays/modal.md'), `# Modal

## Статус

Спецификация v0.2 по Courses Figma; production-вхождения базовой оболочки в снятом публичном корпусе не подтверждены.

## Назначение

Базовая модальная оболочка для содержимого, требующего отдельного контекста, подтверждения или отмены. Доменный контент передаётся через слоты; например, [PromoCodeModal](promo-code-modal.md) — частный сценарий этого компонента.

## Анатомия и варианты

- optional image высотой 140 px;
- header: back icon, title и optional right action;
- body: до 12 content slots, gap 16 px, собственный вертикальный scroll;
- footer: optional secondary/main Button M;
- device: desktop, tablet и mobile;
- pinHeader / pinFooter управляют разделителями закреплённых областей.

Desktop и tablet используют оболочку шириной 320 px с полным radius 24 px и max-height 800 px. Mobile занимает ширину viewport, закрепляется снизу, получает radius 24 px только сверху, белый handle 64×4 px и max-height 700 px.

## Поведение

Header и footer остаются на месте, прокручивается только body. Overlay закрывает диалог по клику; Escape выполняет то же действие и возвращает фокус в trigger.

## Доступность

Используйте \`role="dialog"\`, \`aria-modal="true"\` и \`aria-labelledby\`. При открытии переносите фокус внутрь диалога; при закрытии возвращайте его в элемент, открывший Modal.

## Источник

Courses Figma \`education-lib\`, Modal component set node \`1144:25049\`; device variants: desktop \`1144:29417\`, tablet \`4726:1139\`, mobile \`1144:31171\`.
`);
copy(join(source, 'CHANGELOG.md'), join(root, 'docs/history/v0.1-changelog.md'));
copy(join(source, 'ROADMAP.md'), join(root, 'docs/history/v0.1-roadmap.md'));
copy(join(source, 'BRIEF.md'), join(root, 'docs/reference/research-brief-v0.1.md'));
copy(join(source, '.pipeline/principles-evidence.md'), join(root, 'docs/reference/principles-evidence-v0.1.md'));

for (const path of filesBelow(join(root, 'guide/components')).filter(path => path.endsWith('.md'))) {
  let text = readFileSync(path, 'utf8')
    .replaceAll('../../showcase/components.html#c-', '../../../viewer/index.html#')
    .replaceAll('showcase/components.html#c-', 'viewer/index.html#');
  if (path.endsWith('INDEX.md')) {
    text = text
      .replace('Что в пакете есть, где это лежит и как читать спецификацию. Машиночитаемая\nверсия того же самого — [`manifest.json`](manifest.json); форма спецификации —\n[`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md); порядок работ — [`../ROADMAP.md`](../ROADMAP.md).', 'Что в пакете есть, где это лежит и как читать спецификацию. Канонический\nмашинный маршрут — [`machine/catalog.json`](../../machine/catalog.json);\n`manifest.json` сохранён как подробный реестр v0.1. Форма спецификации —\n[`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md); текущие задачи — [`../../ROADMAP.md`](../../ROADMAP.md).')
      .replace('Реестр собран из [`.pipeline/inventory.json`](../.pipeline/inventory.json) на шаге\nR0-05', 'Реестр перенесён в [`machine/migration-map.json`](../../machine/migration-map.json);\nисходный `.pipeline/inventory.json` сохранён в локальном архиве v0.1. Реестр\nсобран на шаге R0-05');
  }
  if (path.endsWith('SPEC-TEMPLATE.md')) {
    text = text
      .replaceAll('../../.claude/guide/', '../../../.claude/guide/')
      .replace('| **Живая реализация** | [`viewer/index.html#<id>`](../../viewer/index.html#<id>) |', '| **Живая реализация** | `viewer/index.html#<id>` |');
  }
  if (path.endsWith('data-display\\avatar.md') || path.endsWith('data-display/avatar.md')) {
    text += '\n\n## Дополнение v0.2 · дефолтное изображение и размеры\n\nВ viewer добавлена полная шкала `avatar/user` из Courses Figma: 24, 32, 36, 40, 48, 56, 68 и 100 px. На всех размерах используется круг `radius/full = 200px`. Форма дефолтной SVG-иллюстрации пользователя переиспользована из Career v1.2 как `ui/assets/images/avatar-default-user.svg`, палитра адаптирована к Courses: фон `#F1F1F1`, графика `#D3D3D4`. Геометрия взята из `education-lib`, node `722:1599`. Прежний production-контекст 100 px сохранён отдельным примером.\n';
  }
  if (path.endsWith('data-display\\entity-logo.md') || path.endsWith('data-display/entity-logo.md')) {
    text += '\n\n## Дополнение v0.2 · дефолтное изображение и размеры\n\nВ viewer добавлена полная шкала `avatar/school` из Courses Figma: 24, 32, 36, 40, 48, 56, 68 и 100 px. Радиусы: 6, 8, 12, 12, 12, 12, 16 и 24 px соответственно. Форма дефолтной SVG-иллюстрации компании переиспользована из Career v1.2 как `ui/assets/images/avatar-default-company.svg`, палитра адаптирована к Courses: фон `#F1F1F1`, графика `#D3D3D4`; геометрия взята из `education-lib`, node `722:1639`. Прежний production-контекст 40 px с белой рамкой сохранён отдельным примером.\n';
  }
  const portablePath = path.replaceAll('\\', '/');
  if (portablePath.endsWith('/actions/icon-button.md')) {
    text += '\n\n## Дополнение v0.2 · состояния из Courses Figma\n\nВ viewer показаны `default`, `hover`, `focus-visible`, `disabled` и `loading` из `education-lib`, node `653:664`. Корпус — 36×36 px, иконка — SVG 24×24 с `viewBox="0 0 24 24"`; focus-контур толщиной 2 px расположен снаружи с зазором 2 px.\n';
  }
  if (portablePath.endsWith('/navigation/tab.md')) {
    text += '\n\n## Уточнение v0.2 · FilterChip Menu / Switch\n\nИсторический id `tab` сохранён ради совместимости, но пользовательское имя компонента — `FilterChip · Menu / Switch`. Это расширенные варианты семейства FilterChip: `FilterChipMenu` получает ведущую иконку и шеврон раскрытия, `FilterChipSwitch` — компактный switch справа. В viewer показаны `default`, `hover`, `focus-visible`, `pressed`, `disabled`, `loading`, а для Menu также `open` с dropdown. Источник: Courses Figma `education-lib`, node `904:1723`.\n';
  }
  if (portablePath.endsWith('/navigation/segmented-control.md')) {
    text += '\n\n## Уточнение v0.2 · HeroTabs\n\nПользовательское имя компонента — `HeroTabs`; исторический id `segmented-control` сохранён. Это табы для цветного hero-фона. В viewer показаны `default`, `hover`, `focus-visible`, `selected`, `disabled` и `loading` по Courses Figma `education-lib`, node `4274:1422`. Группа сегментов всегда лежит на единой подложке `rgba(0,0,0,0.12)` с радиусом 12 px и без внутренних отступов по node `4261:1716`; состояния отдельных сегментов накладываются поверх неё.\n';
  }
  if (portablePath.endsWith('/navigation/button-group.md')) {
    text += '\n\n## Уточнение v0.2 · PageTabs\n\nПользовательское имя компонента — `PageTabs`; исторический id `button-group` сохранён. Это табы для светлого фона страницы, карточки или формы. В viewer показаны `default`, `hover`, `focus-visible`, `selected`, `disabled` и `loading` по Courses Figma `education-lib`, node `4813:238`. Группа сегментов лежит на единой подложке `#F1F1F1` с радиусом 16 px и внутренним отступом 4 px по node `4813:288`; выбранный белый сегмент и его тень накладываются поверх неё.\n';
  }
  if (portablePath.endsWith('/frame-modules/site-header.md')) {
    text += [
      '', '', '## Дополнение v0.2 · семейство и применение', '',
      '`SiteHeader` — семейство из трёх контекстов. Исторический production-снимок сохранён отдельным примером; Figma-варианты собраны в одном responsive-playground.', '',
      '| Имя | Варианты | Когда использовать |', '|---|---|---|',
      '| `ListingHeader` | `Hero`, `Page`, `PageSticky` | Hero — верхнеуровневая листинговая страница без sticky; Page — второй уровень; PageSticky — его сокращённое состояние при прокрутке. |',
      '| `CoursesHeader` | `Hero`, `Page`, `PageSticky` | Та же иерархия для страниц курсов: постоянные Catalog/Search, SEO-блок на Page и сокращение на sticky. |',
      '| `SimplePageHeader` | один | Низкоуровневые и служебные страницы без поиска, SEO и фильтров. |', '',
      'Компонентная responsive-шкала следует трём Figma-режимам: mobile `≤479`, tablet `480–1023`, desktop `≥1024`. Кадры-эталоны имеют ширину 320, 744 и 1024 px. Это отдельная шкала `SiteHeader`: название Figma `tablet` при ширине 744 не равно старому продуктовому префиксу `phone:` с границей 767 px.', '',
      'Высоты полного компонента:', '',
      '| Контекст | Mobile | Tablet | Desktop |', '|---|---:|---:|---:|',
      '| Listing · Hero | 744 | 464 | 472 |', '| Listing · Page | 216 | 200 | 208 |', '| Listing · PageSticky | 172 | 156 | 156 |',
      '| Courses · Hero | 142 | 110 | 110 |', '| Courses · Page | 306 | 266 | 266 |', '| Courses · PageSticky | 172 | 124 | 124 |',
      '| SimplePageHeader | 56 | 56 | 64 |', '',
      'Источники: Figma `02_Education-NEW`, section `15071:230717`; `header / list pages` node `15058:236426`, `header / courses` node `15065:242662`, `header / simple pages` node `15065:245602`. Sticky допустим только для `Page`.',
    ].join('\n');
  }
  if (portablePath.endsWith('/forms/filter-chip.md')) {
    text += '\n\n## Уточнение v0.2 · семейство Filter Chip\n\nЭтот компонент — базовый `FilterChip`. Расширенные варианты `FilterChipMenu` и `FilterChipSwitch` документированы на историческом адресе [`tab`](../navigation/tab.md); в viewer все записи собраны в одной группе `Filter Chips`. Старые id сохранены для совместимости.\n';
  }
  if (['/forms/checkbox.md', '/forms/radio-button.md', '/forms/switch.md'].some(suffix => portablePath.endsWith(suffix))) {
    text += '\n\n## Уточнение v0.2 · выравнивание подписи\n\nТекстовая подпись получает `padding-top: 1px` относительно верхнего края слота контрола. Между визуальным контролом и подписью сохраняется `gap: 8px`.\n';
  }
  if (portablePath.endsWith('/forms/search-input.md')) {
    text += '\n\n## Исправление v0.2 · живой пример\n\nВ viewer показан настоящий `input[type="search"]` с плейсхолдером «Искать на Хабр Курсах» и SVG-иконкой `#search`. SSR-заглушка `.courses-filter-search-top-panel-placeholder` сохранена в архиве v0.1 как свидетельство загрузочного состояния, но больше не используется как пример самого компонента.\n';
  }
  if (['/forms/select.md', '/forms/multi-select.md', '/forms/search-input.md', '/forms/text-input.md'].some(suffix => portablePath.endsWith(suffix))) {
    text += '\n\n## Дополнение v0.2 · общее семейство полей\n\nКомпонент использует общую оболочку полей Courses: radius 12 px, gap 4 px, SVG-иконки 24×24, текст 16/22 regular и состояния `default`, `hover`, `focus-visible`, `disabled`, `invalid`. Подтверждены размеры `M` 40 px с горизонтальными отступами 12 px и `XL / SearchForm` 56 px с отступом 16 px слева и 12 px справа. Состояния взяты из `education-lib`, canvas node `670:8259`; XL — из живого SearchForm, node `15074:233173`.\n';
  }
  if (['/forms/select.md', '/forms/multi-select.md'].some(suffix => portablePath.endsWith(suffix))) {
    text += '\n\n## Дополнение v0.2 · открытый dropdown\n\nВ viewer показан открытый вариант `M`: между полем и панелью 4 px, панель высотой 216 px с border 1 px `#E9E9EA`, radius 12 px и двухслойной тенью; список имеет вертикальный отступ 8 px, строки высотой 40 px с отступами 16 px слева и 24 px справа, текст 14/20 regular. Select раскрывает стрелку вверх; MultiSelect сохраняет выбранное значение в чипе. Геометрия сверена с Courses Figma: `education-lib`, Select node `4850:2101`, MultiSelect dropdown node `4393:6213`.\n';
  }
  if (portablePath.endsWith('/forms/search-form.md')) {
    text += '\n\n## Уточнение v0.2 · составной контрол\n\nВсе поля `SearchForm` — `Select XL` высотой 56 px. На desktop они собраны в одну горизонтальную оболочку без промежутков: соседние поля разделяет линия 1 px, скругление 12 px принадлежит только внешней границе группы. На mobile та же оболочка становится вертикальной, а разделители поворачиваются в горизонтальные; кнопка отделена от группы на 16 px и занимает всю ширину. Геометрия XL сверена с Education Figma, node `15074:233173`.\n';
  }
  if (['/forms/checkbox.md', '/forms/switch.md'].some(suffix => portablePath.endsWith(suffix))) {
    text += '\n\n## Дополнение v0.2 · полная матрица состояний\n\nВ viewer показаны `default`, `hover`, `focus-visible`, `disabled` и `loading`, каждое для выключенного и включённого значения. Строка имеет высоту 26 px, слот контрола — 24 px, gap до текста — 8 px; текст — 16/22 regular со смещением 2 px сверху. Геометрия и состояния взяты из Courses Figma `education-lib`, controls canvas node `698:1858`.\n';
  }
  if (portablePath.endsWith('/forms/checkbox.md')) {
    text += '\n\n## Дополнение v0.2 · группы контролов\n\nДля вертикального списка Checkbox используется gap 16 px, для горизонтального — 24 px. Правило и живые примеры сверены с Courses Figma `control-list`, node `717:191`. Состояние `indeterminate` в этом узле не показано и остаётся непроверенным.\n';
  }
  if (portablePath.endsWith('/layout/ad-slot.md')) {
    text += '\n\n## Исправление v0.2 · живой пример\n\nСнятый production-узел `.adfox-banner` пуст до выполнения стороннего рекламного скрипта, поэтому его исходная разметка сама по себе ничего не показывает. В viewer вместо внешнего рекламного содержимого используется безопасная локальная заглушка внутри структуры `AdSlot → Carousel → AdCard`: desktop-слайд 568×232 px, mobile-слайд следует пропорции 272:280. Это демонстрирует геометрию слота и не имитирует реальный креатив рекламодателя.\n';
  }
  if (portablePath.endsWith('/overlays/header-dropdown.md')) {
    text += '\n\n## Исправление v0.2 · живой пример\n\nProduction snapshot хранит только закрытое SSR-состояние с классом `hidden`. В viewer та же панель показана открытой по умолчанию; кнопка-триггер переключает `aria-expanded` и атрибут `hidden`, позволяя проверить `open` и `closed`. Геометрия и четыре ссылки взяты из production-разметки. Само JS-поведение продукта не было снято, поэтому интеракция в viewer является документирующей реконструкцией, а не подтверждением реализации production.\n';
  }
  if (portablePath.endsWith('/overlays/filter-modal.md')) {
    text += '\n\n## Уточнение v0.2 · responsive и скролл\n\nЖивой пример перестроен по Education Figma: общий сценарий `14627:233015`, мобильный компонент `modal-filter / mobile` node `14627:228239`. Оболочка имеет ограниченную высоту 620 px: шапка 72 px и футер остаются на месте, а длинное тело с десятью группами фильтров получает собственный `overflow-y: auto`. Поэтому прокрутка страницы не уносит основные действия модалки.\n\nНа ширине 320 px боковые отступы тела равны 24 px, футер имеет высоту 136 px и содержит две полноширинные L-кнопки столбцом: основное действие первым, очистку вторым. На desktop максимальная ширина модалки 568 px, футер 96 px и кнопки стоят в строку. Карточки рекомендаций и иконки уровней сохранены локальными экспортами из указанного Figma-узла.\n';
  }
  if (portablePath.endsWith('/overlays/sort-sheet.md') || portablePath.endsWith('/overlays/price-sheet.md')) {
    const isSortSheetDoc = portablePath.endsWith('/overlays/sort-sheet.md');
    text += `\n\n## Уточнение v0.2 · mobile-only сценарий\n\n${isSortSheetDoc ? '`SortSheet`' : '`PriceSheet`'} применяется только в мобильном ряду быстрых фильтров. Эталонный контекст — экран 320×568 из Education Figma, общий canvas \`9094:48333\`; открытая панель — node \`${isSortSheetDoc ? '9356:50311' : '9356:52508'}\` размером \`${isSortSheetDoc ? '320×264' : '320×176'}\`. На tablet и desktop этот bottom sheet не масштабируется: ${isSortSheetDoc ? 'сортировка остаётся обычным control/menu' : 'цена открывается как dropdown/popover рядом с trigger'}.\n\nViewer показывает полный цикл \`trigger → open → close\`: sheet закреплён снизу поверх overlay, закрывается по клику на затемнение и Escape, затем возвращает фокус в trigger. ${isSortSheetDoc ? 'Выбор строки обновляет trigger и сразу закрывает панель.' : '«Сбросить» очищает поля без закрытия, «Готово» применяет значение и закрывает панель.'}\n`;
  }
  if (portablePath.endsWith('/overlays/promo-code-modal.md')) {
    text += '\n\n## Уточнение v0.2 · вариант Modal\n\n`PromoCodeModal` — доменный вариант базового [`Modal`](modal.md), а не отдельная модальная оболочка. Он наследует геометрию, responsive-поведение, прокрутку тела, закрепление header/footer и правила закрытия от `Modal`; собственными остаются только два сценария содержимого: ввод промокода и сообщение об акции. Путь и id сохранены для обратной совместимости.\n';
  }
  writeFileSync(path, text);
}
for (const path of filesBelow(join(root, 'guide/pages')).filter(path => path.endsWith('.md'))) {
  const text = readFileSync(path, 'utf8')
    .replace(/\.\.\/showcase\/pages\.html#p-([a-z0-9-]+)/g, '../../viewer/index.html#$1')
    .replace(/\.\.\/showcase\/pages\/([a-z0-9-]+)\.html/g, '../../examples/pages/$1/index.html')
    .replace(/showcase\/pages\.html#p-([a-z0-9-]+)/g, 'viewer/index.html#$1')
    .replace(/showcase\/pages\/([a-z0-9-]+)\.html/g, 'examples/pages/$1/index.html')
    .replaceAll('showcase/pages.css', 'ui/page-examples.css');
  writeFileSync(path, text);
}
for (const path of filesBelow(join(root, 'docs/guide')).filter(path => path.endsWith('.md'))) {
  let text = readFileSync(path, 'utf8')
    .replaceAll('../../components/', '../../guide/components/')
    .replaceAll('../../pages/', '../../guide/pages/')
    .replaceAll('../../showcase/pages.html', '../../viewer/index.html')
    .replaceAll('showcase/pages.html', 'viewer/index.html')
    .replaceAll('../../.pipeline/principles-evidence.md', '../reference/principles-evidence-v0.1.md');
  if (path.replaceAll('\\', '/').endsWith('/docs/guide/typography.md')) {
    text += '\n\n## Правило v0.2 · единое семейство\n\n**Inter — единственный интерфейсный шрифт Courses.** Он обязателен для страниц, компонентов, состояний, форм, кнопок, модальных окон и всех живых примеров viewer. Базовое объявление — `body, html { font-family: Inter, sans-serif; }`; локальный CSS должен наследовать его или повторять стек `Inter, sans-serif`, но не подменять семейство на Arial, PT Sans, системный UI-шрифт или другой гротеск.\n\nМоноширинный шрифт разрешён только семантическим техническим фрагментам `<code>`, `<pre>`, `<kbd>` и `<samp>` в документации. Он не применяется к продуктовому тексту и демонстрационным заглушкам. Локальные WOFF2-файлы Inter подключаются через `ui/fonts.css`; viewer проверяет фактическую загрузку Inter и computed styles всех примеров.\n';
  }
  writeFileSync(path, text);
}

const groupTitles = {
  actions: 'Действия',
  collections: 'Коллекции',
  'data-display': 'Данные и контент',
  entities: 'Карточки и сущности',
  feedback: 'Обратная связь',
  forms: 'Поля и выбор',
  'frame-modules': 'Каркас страницы',
  layout: 'Раскладка',
  navigation: 'Навигация',
  overlays: 'Оверлеи',
};

const elementGroupTitles = {
  actions: 'Действия',
  forms: 'Поля и выбор',
  navigation: 'Навигация',
  'data-display': 'Данные и индикаторы',
  collections: 'Данные и индикаторы',
  overlays: 'Подсказки',
  feedback: 'Обратная связь',
};

const blockGroupTitles = {
  forms: 'Формы',
  entities: 'Карточки и сущности',
  collections: 'Коллекции и списки',
  'data-display': 'Контентные блоки',
  navigation: 'Навигационные блоки',
  'frame-modules': 'Каркас страницы',
  layout: 'Каркас страницы',
  overlays: 'Оверлеи',
  feedback: 'Обратная связь',
};

function navigationFor(record, normalizedKind) {
  if (['modal', 'promo-code-modal'].includes(record.id)) return {
    navSection: 'blocks',
    navSectionTitle: 'Блоки',
    navGroup: 'modals',
    navGroupTitle: 'Modals',
  };
  if (['filter-chip', 'tab'].includes(record.id)) return {
    navSection: 'elements',
    navSectionTitle: 'Элементы',
    navGroup: 'filter-chips',
    navGroupTitle: 'Filter Chips',
  };
  if (['segmented-control', 'button-group'].includes(record.id)) return {
    navSection: 'elements',
    navSectionTitle: 'Элементы',
    navGroup: 'tabs',
    navGroupTitle: 'Табы',
  };
  if (normalizedKind === 'component') return {
    navSection: 'elements',
    navSectionTitle: 'Элементы',
    navGroup: record.category === 'collections' ? 'data-display' : record.category,
    navGroupTitle: elementGroupTitles[record.category] || groupTitles[record.category] || record.category,
  };
  return {
    navSection: 'blocks',
    navSectionTitle: 'Блоки',
    navGroup: ['frame-modules', 'layout'].includes(record.category) ? 'page-frame' : record.category,
    navGroupTitle: blockGroupTitles[record.category] || groupTitles[record.category] || record.category,
  };
}

function displayTitleFor(record) {
  if (record.id === 'filter-chip') return 'FilterChip · Basic';
  if (record.id === 'tab') return 'FilterChip · Menu / Switch';
  if (record.id === 'segmented-control') return 'HeroTabs';
  if (record.id === 'button-group') return 'PageTabs';
  return record.name;
}

function purposeFor(record) {
  if (record.id === 'site-header') return 'Responsive-семейство шапок: ListingHeader для листингов, CoursesHeader для страниц курсов и SimplePageHeader для низкоуровневых страниц.';
  if (record.id === 'tab') return 'Расширенные FilterChip: Menu с ведущей иконкой и dropdown, Switch с компактным переключателем справа.';
  if (record.id === 'segmented-control') return 'HeroTabs: переключение между вкладками на цветном hero-фоне.';
  if (record.id === 'button-group') return 'PageTabs: переключение между вкладками на светлом фоне страницы, карточки или формы.';
  return record.usage?.when || `Назначение ${record.name} зафиксировано в исходной спецификации.`;
}

const catalog = [];
const migrationComponents = [];
const allStateNames = new Set();

function evidenceArray(record) {
  const result = [];
  for (const [type, value] of Object.entries(record.evidence || {})) {
    if (value !== null && (!(Array.isArray(value)) || value.length)) result.push({ type, data: value });
  }
  return result;
}

const intrinsicPresentations = {
  'entity-logo': { layout: 'context', width: 80, height: 60 },
  'icon-button': { layout: 'constrained', width: 620 },
  loader: { layout: 'canvas', width: 360 },
  prose: { layout: 'constrained', width: 640 },
  select: { layout: 'constrained', width: 360 },
  'multi-select': { layout: 'constrained', width: 360 },
  'search-input': { layout: 'constrained', width: 560 },
  'text-input': { layout: 'constrained', width: 360 },
  switch: { layout: 'constrained', width: 320 },
  tooltip: { layout: 'constrained', width: 312 },
  'demand-chart': { layout: 'constrained', width: 315 },
  'page-toc': { layout: 'constrained', width: 315 },
};

const baselineSensitiveIds = new Set(['sprite-icon', 'project-icon', 'avatar']);

function presentationFor(record, normalizedKind) {
  if (normalizedKind !== 'component') return null;
  return intrinsicPresentations[record.id] || { layout: 'fit-content' };
}

const figmaButtonPreviewCss = `
.crs-button-playground{display:grid;gap:16px;font-family:Inter,sans-serif;color:#202735}
.crs-button-presets{display:grid;gap:10px;padding:16px;border:1px solid #dce2eb;border-radius:16px;background:#fff}
.crs-button-presets__head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.crs-button-presets__title{margin:0;font-size:14px;line-height:20px}
.crs-button-presets__meta{color:#697386;font-size:12px;line-height:18px}
.crs-button-presets__list{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px}
.crs-button-preset-wrap{display:grid;justify-items:start;gap:5px}
.crs-button-preset-label{color:#697386;font-size:11px;line-height:16px}
.crs-button-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:16px;border:1px solid #dce2eb;border-radius:16px;background:#f7f9fc}
.crs-button-control{display:grid;gap:6px;min-width:0;font-size:12px;font-weight:700;color:#596170}
.crs-button-control select{box-sizing:border-box;width:100%;height:36px;padding:0 10px;border:1px solid #cbd3df;border-radius:9px;background:#fff;color:#202735;font:14px/20px Inter,sans-serif}
.crs-button-control--check{display:flex;align-items:center;gap:8px;min-height:36px;padding-top:20px;cursor:pointer}
.crs-button-control--check input{width:18px;height:18px;margin:0}
.crs-button-canvas{display:grid;gap:12px;padding:24px;border:1px solid #dce2eb;border-radius:16px;background:#fff}
.crs-button-slot{width:min(360px,100%)}
.crs-button-slot[data-stretch=false]{width:max-content;max-width:100%}
.crs-button-slot[data-stretch=true]>.crs-figma-button{width:100%}
.crs-button-source{margin:0;color:#697386;font-size:12px;line-height:18px}
.crs-button-source strong{color:#202735}
.crs-figma-button{--button-fill:#2c2e34;--button-hover:#3b3d43;--button-border:var(--button-fill);--button-text:#fff;--button-focus:#909194;position:relative;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:var(--button-gap);height:var(--button-height);padding:0 var(--button-padding);border:1px solid var(--button-border);border-radius:12px;background:var(--button-fill);color:var(--button-text);font:600 var(--button-font-size)/var(--button-line-height) Inter,sans-serif;white-space:nowrap;cursor:pointer;transition:background-color .15s ease,border-color .15s ease,box-shadow .15s ease}
.crs-figma-button[data-icon=true]{padding-left:var(--button-icon-padding)}
.crs-figma-button[data-size=m]{--button-height:40px;--button-padding:16px;--button-icon-padding:8px;--button-gap:4px;--button-font-size:14px;--button-line-height:20px}
.crs-figma-button[data-size=l]{--button-height:48px;--button-padding:20px;--button-icon-padding:12px;--button-gap:6px;--button-font-size:16px;--button-line-height:24px}
.crs-figma-button[data-size=xl]{--button-height:56px;--button-padding:24px;--button-icon-padding:16px;--button-gap:8px;--button-font-size:16px;--button-line-height:24px}
.crs-figma-button[data-tone=secondary]{--button-fill:#f1f1f1;--button-hover:#e9e9ea;--button-border:var(--button-fill);--button-text:#2c2e34;--button-focus:#a6a7a9}
.crs-figma-button[data-tone=danger]{--button-fill:#e84444;--button-hover:#f37676;--button-border:var(--button-fill);--button-text:#fff;--button-focus:#f37676}
.crs-figma-button[data-tone=danger-outline]{--button-fill:#fff;--button-hover:#fce9e9;--button-hover-border:#f37676;--button-border:#f37676;--button-text:#e84444;--button-focus:#f37676}
.crs-figma-button[data-tone=success]{--button-fill:#34b24f;--button-hover:#5bcd72;--button-border:var(--button-fill);--button-text:#fff;--button-focus:#5bcd72}
.crs-figma-button[data-tone=success-outline]{--button-fill:#fff;--button-hover:#e7f6ea;--button-hover-border:#5bcd72;--button-border:#5bcd72;--button-text:#34b24f;--button-focus:#5bcd72}
.crs-figma-button[data-state=default]:not(:disabled):hover{background:var(--button-hover);border-color:var(--button-hover-border,var(--button-hover))}
.crs-figma-button[data-state=hover]{background:var(--button-hover);border-color:var(--button-hover-border,var(--button-hover))}
.crs-figma-button[data-state=focus]{box-shadow:0 0 0 2px #fff,0 0 0 3px var(--button-focus)}
.crs-figma-button:disabled{border-color:#dededf;background:#dededf;color:#fff;cursor:not-allowed}
.crs-figma-button[data-tone$=outline]:disabled,.crs-figma-button[data-tone=secondary]:disabled{border-color:#f1f1f1;background:#fff;color:#d3d3d4}
.crs-button-preset[aria-pressed=true]{box-shadow:0 0 0 2px #fff,0 0 0 3px #346ef4}
.crs-button-icon{display:block;width:24px;height:24px;flex:0 0 24px}
.crs-button-loading-layout{display:inline-flex;align-items:center;gap:var(--button-gap);visibility:hidden}
.crs-button-spinner{display:block;width:16px;height:16px;box-sizing:border-box;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:crs-button-spin .8s linear infinite}
.crs-figma-button[data-state=loading]>.crs-button-spinner{position:absolute}
@keyframes crs-button-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.crs-button-spinner{animation:none}}
@media(max-width:560px){.crs-button-controls{grid-template-columns:1fr 1fr}.crs-button-control--check{padding-top:0}}
@media(max-width:360px){.crs-button-controls{grid-template-columns:1fr}}
`;

function figmaButtonMarkup(size, tone, state, withIcon, extraClass = '', extraAttributes = '') {
  const disabled = ['disabled', 'loading'].includes(state) ? ' disabled' : '';
  const busy = state === 'loading' ? ' aria-busy="true"' : '';
  const normalContent = `${withIcon ? '<svg class="crs-button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><path d="M9.75 9.5a2.35 2.35 0 1 1 3.5 2.05c-.78.45-1.25.85-1.25 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16.25" r=".85" fill="currentColor"/></svg>' : ''}<span>Button</span>`;
  const content = state === 'loading'
    ? `<span class="crs-button-loading-layout" aria-hidden="true">${normalContent}</span><span class="crs-button-spinner" aria-hidden="true"></span><span class="visually-hidden">Загрузка</span>`
    : normalContent;
  return `<button type="button" class="crs-figma-button${extraClass ? ` ${extraClass}` : ''}" data-size="${size}" data-tone="${tone}" data-state="${state}" data-icon="${withIcon}"${extraAttributes ? ` ${extraAttributes}` : ''}${disabled}${busy}>${content}</button>`;
}

const buttonVariantMatrix = {
  sizes: {
    m: { tones: ['main', 'secondary', 'danger', 'danger-outline', 'success', 'success-outline'] },
    l: { tones: ['main', 'secondary', 'danger', 'danger-outline', 'success', 'success-outline'] },
    xl: { tones: ['main', 'secondary'] },
  },
  states: ['default', 'hover', 'focus-visible', 'disabled', 'loading'],
  icon: [false, true],
  combinations: 140,
};

function buttonPlaygroundMarkup() {
  const toneLabels = {
    main: 'main',
    secondary: 'secondary',
    danger: 'danger',
    'danger-outline': 'danger outline',
    success: 'success',
    'success-outline': 'success outline',
  };
  const presets = buttonVariantMatrix.sizes.m.tones.map(tone => `<span class="crs-button-preset-wrap">
        <span class="crs-button-preset-label">${toneLabels[tone]}</span>
        ${figmaButtonMarkup('m', tone, 'default', true, 'crs-button-preset', `aria-label="Выбрать ${toneLabels[tone]}" aria-pressed="${tone === 'main'}"`)}
      </span>`).join('');
  return `<div class="crs-button-playground">
    <section class="crs-button-presets" aria-labelledby="button-presets-title">
      <div class="crs-button-presets__head">
        <h2 class="crs-button-presets__title" id="button-presets-title">Разновидности</h2>
        <span class="crs-button-presets__meta">M · с иконкой · наведите</span>
      </div>
      <div class="crs-button-presets__list">${presets}</div>
    </section>
    <form class="crs-button-controls" aria-label="Настройки примера кнопки">
      <label class="crs-button-control">Размер
        <select id="button-size"><option value="m">M</option><option value="l">L</option><option value="xl">XL</option></select>
      </label>
      <label class="crs-button-control">Тон
        <select id="button-tone"><option value="main">main</option><option value="secondary">secondary</option><option value="danger">danger</option><option value="danger-outline">danger outline</option><option value="success">success</option><option value="success-outline">success outline</option></select>
      </label>
      <label class="crs-button-control">Состояние
        <select id="button-state"><option value="default">default</option><option value="hover">hover</option><option value="focus">focus</option><option value="disabled">disabled</option><option value="loading">loading</option></select>
      </label>
      <label class="crs-button-control crs-button-control--check"><input id="button-icon" type="checkbox"> С ведущей иконкой</label>
      <label class="crs-button-control crs-button-control--check"><input id="button-stretch" type="checkbox"> Растянуть в контейнере</label>
    </form>
    <div class="crs-button-canvas">
      <div class="crs-button-slot" data-stretch="false">${figmaButtonMarkup('m', 'main', 'default', false, 'crs-button-target')}</div>
      <p class="crs-button-source" id="button-source"><strong>Production + Figma.</strong> Ширина по содержимому.</p>
    </div>
  </div>`;
}

const buttonPlaygroundScript = `
const sizeControl=document.querySelector('#button-size');
const toneControl=document.querySelector('#button-tone');
const stateControl=document.querySelector('#button-state');
const iconControl=document.querySelector('#button-icon');
const stretchControl=document.querySelector('#button-stretch');
const slot=document.querySelector('.crs-button-slot');
const button=document.querySelector('.crs-button-target');
const presets=[...document.querySelectorAll('.crs-button-preset')];
const source=document.querySelector('#button-source');
const allowed={m:['main','secondary','danger','danger-outline','success','success-outline'],l:['main','secondary','danger','danger-outline','success','success-outline'],xl:['main','secondary']};
const icon='<svg class="crs-button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><path d="M9.75 9.5a2.35 2.35 0 1 1 3.5 2.05c-.78.45-1.25.85-1.25 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16.25" r=".85" fill="currentColor"/></svg>';
const spinner='<span class="crs-button-spinner" aria-hidden="true"></span><span class="visually-hidden">Загрузка</span>';
function render(){
  const size=sizeControl.value;
  for(const option of toneControl.options)option.disabled=!allowed[size].includes(option.value);
  if(!allowed[size].includes(toneControl.value))toneControl.value='main';
  const tone=toneControl.value;
  const state=stateControl.value;
  const withIcon=iconControl.checked;
  const normal=(withIcon?icon:'')+'<span>Button</span>';
  button.dataset.size=size;
  button.dataset.tone=tone;
  button.dataset.state=state;
  button.dataset.icon=String(withIcon);
  button.disabled=state==='disabled';
  if(state==='loading')button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy');
  button.innerHTML=state==='loading'?'<span class="crs-button-loading-layout" aria-hidden="true">'+normal+'</span>'+spinner:normal;
  for(const preset of presets)preset.setAttribute('aria-pressed',String(size==='m'&&tone===preset.dataset.tone&&state==='default'&&withIcon));
  slot.dataset.stretch=String(stretchControl.checked);
  const figmaOnly=!['main','secondary'].includes(tone)||state==='loading';
  source.innerHTML='<strong>'+(figmaOnly?'Figma-only.':'Production + Figma.')+'</strong> '+(stretchControl.checked?'Растянута правилом контейнера, это не вариант Button.':'Ширина по содержимому.');
}
document.querySelector('.crs-button-controls').addEventListener('change',render);
for(const preset of presets)preset.addEventListener('click',()=>{
  sizeControl.value='m';
  toneControl.value=preset.dataset.tone;
  stateControl.value='default';
  iconControl.checked=true;
  render();
});
render();
`;

const iconButtonPreviewCss = `
.crs-icon-button-states{display:flex;align-items:flex-start;flex-wrap:wrap;gap:24px;padding:8px 4px 4px;font-family:Inter,sans-serif;color:#2c2e34}
.crs-icon-button-state{display:grid;justify-items:center;gap:10px;min-width:64px;color:#697386;font-size:11px;line-height:16px}
.crs-icon-button{position:relative;box-sizing:border-box;display:inline-flex;width:36px;height:36px;align-items:center;justify-content:center;padding:5px;border:1px solid #e9e9ea;border-radius:200px;background:#fff;color:#a6a7a9;box-shadow:0 4px 3px rgba(0,0,0,.05),0 2px 2px rgba(0,0,0,.05);cursor:pointer;transition:color .15s ease,border-color .15s ease,box-shadow .15s ease}
.crs-icon-button svg{display:block;width:24px;height:24px;flex:0 0 24px;transform:rotate(-90deg)}
.crs-icon-button[data-state=default]:hover,.crs-icon-button[data-state=hover]{color:#2c2e34}
.crs-icon-button[data-state=focus],.crs-icon-button:focus,.crs-icon-button:focus-visible{color:#2c2e34;outline:0;box-shadow:0 0 0 2px #fff,0 0 0 4px #a6a7a9,0 4px 3px rgba(0,0,0,.05),0 2px 2px rgba(0,0,0,.05)}
.crs-icon-button:disabled{border-color:#f1f1f1;color:#d3d3d4;cursor:not-allowed}
.crs-icon-button[data-state=loading]{color:#bcbdbf;cursor:wait}
.crs-icon-button[data-state=loading] svg{transform:none;animation:crs-icon-button-spin .8s linear infinite}
@keyframes crs-icon-button-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.crs-icon-button[data-state=loading] svg{animation:none}}
`;

function iconButtonStatesMarkup() {
  const states = [
    ['default', 'Default', 'arrow-down-figma', ''],
    ['hover', 'Hover', 'arrow-down-figma', ''],
    ['focus', 'Focus', 'arrow-down-figma', ''],
    ['disabled', 'Disabled', 'arrow-down-figma', ' disabled'],
    ['loading', 'Loading', 'loader', ' aria-busy="true"'],
  ];
  return `<div class="crs-icon-button-states">${states.map(([state, label, icon, attrs]) => `<span class="crs-icon-button-state">
    <button type="button" class="crs-icon-button" data-state="${state}" aria-label="${label}"${attrs}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#${icon}"></use></svg></button>
    <span>${label}</span>
  </span>`).join('')}</div>`;
}

const navigationContextsCss = `
.crs-navigation-context{box-sizing:border-box;width:min(440px,100%);padding:24px;border-radius:20px;font-family:Inter,sans-serif}
.crs-navigation-context--hero{background:#346ef4}
.crs-navigation-context--page{border:1px solid #e9e9ea;background:#fff}
.crs-navigation-context--chips{background:#f7f9fc}
.crs-navigation-context>div{margin:0!important}
`;

const filterChipPreviewCss = `
.crs-filter-chip-guide{display:grid;gap:28px;color:#2c2e34;font-family:Inter,sans-serif}
.crs-filter-chip-section{display:grid;gap:12px}
.crs-filter-chip-title{margin:0;font-size:14px;line-height:20px}
.crs-filter-chip-variants{display:flex;flex-wrap:wrap;gap:20px}
.crs-filter-chip-sample{display:grid;justify-items:start;gap:6px}
.crs-filter-chip-caption,.crs-filter-chip-matrix__head,.crs-filter-chip-state{color:#697386;font-size:11px;line-height:16px}
.crs-filter-chip-matrix{display:grid;gap:16px}
.crs-filter-chip-matrix__head,.crs-filter-chip-matrix__row{display:grid;grid-template-columns:72px repeat(2,minmax(0,1fr));gap:16px;align-items:center}
.crs-filter-chip{position:relative;box-sizing:border-box;display:inline-flex;width:max-content;height:36px;align-items:center;justify-content:center;gap:0;padding:8px 12px;border:1px solid #e9e9ea;border-radius:200px;background:#fff;color:#2c2e34;font:400 14px/20px Inter,sans-serif;white-space:nowrap;cursor:pointer}
.crs-filter-chip:hover,.crs-filter-chip[data-state=hover],.crs-filter-chip[data-state=focus]{border-color:#dededf}
.crs-filter-chip:focus-visible,.crs-filter-chip[data-state=focus]{outline:0;box-shadow:0 0 0 2px #fff,0 0 0 4px #a6a7a9}
.crs-filter-chip[data-state=pressed]{border-color:#94bdfc;background:#eff5ff;color:#346ef4}
.crs-filter-chip:disabled,.crs-filter-chip[data-state=disabled]{color:#909194;cursor:not-allowed}
.crs-filter-chip[data-state=loading]{min-width:53px;color:transparent;cursor:wait}
.crs-filter-chip--switch{gap:2px;padding-left:12px;padding-right:8px}
.crs-filter-chip--switch[data-state=loading]{width:166px}
.crs-filter-chip__label{display:flex;height:24px;align-items:center;padding:0 2px}
.crs-filter-chip__icon{display:block;width:20px;height:20px;flex:0 0 20px}
.crs-filter-chip__arrow{color:currentColor}
.crs-filter-chip[data-state=open]{border-color:#dededf;background:#f1f1f1}
.crs-filter-chip[data-state=open] .crs-filter-chip__arrow{transform:rotate(180deg)}
.crs-filter-chip__badge{position:absolute;top:-5px;right:-5px;box-sizing:border-box;min-width:16px;height:16px;padding:0 4px;border-radius:200px;background:#346ef4;color:#fff;font:600 12px/16px Inter,sans-serif;text-align:center}
.crs-filter-chip__switch{position:relative;width:32px;height:20px;flex:0 0 32px}
.crs-filter-chip__switch-track{position:absolute;top:2px;left:2px;width:28px;height:16px;border-radius:100px;background:#dededf}
.crs-filter-chip:hover .crs-filter-chip__switch-track,.crs-filter-chip[data-state=hover] .crs-filter-chip__switch-track,.crs-filter-chip[data-state=focus] .crs-filter-chip__switch-track{background:#d3d3d4}
.crs-filter-chip[data-state=pressed] .crs-filter-chip__switch-track{background:#346ef4}
.crs-filter-chip[data-state=disabled] .crs-filter-chip__switch-track{background:#e9e9ea}
.crs-filter-chip__switch img{position:absolute;z-index:1;top:0;left:0;width:20px;height:20px}
.crs-filter-chip[data-state=pressed] .crs-filter-chip__switch img{left:12px}
.crs-filter-chip__loader{position:absolute;top:50%;left:50%;width:24px;height:24px;color:#a6a7a9;transform:translate(-50%,-50%)}
.crs-filter-chip-open{position:relative;width:182px;padding-bottom:220px}
.crs-filter-chip-dropdown{position:absolute;top:39px;left:0;box-sizing:border-box;width:182px;height:216px;overflow:hidden;padding:8px 16px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -2px rgba(0,0,0,.05)}
.crs-filter-chip-dropdown span{display:flex;height:40px;align-items:center;font-size:14px;line-height:20px}
@media(max-width:600px){.crs-filter-chip-matrix__head{display:none}.crs-filter-chip-matrix__row{grid-template-columns:1fr;gap:8px}.crs-filter-chip-state{margin-top:8px}}
`;

function navSpriteIcon(id, className) {
  return `<svg class="${className}" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#${id}"></use></svg>`;
}

function filterChipMarkup(kind, state = 'default') {
  const selected = state === 'pressed';
  const disabled = ['disabled', 'loading'].includes(state) ? ' disabled' : '';
  const loading = state === 'loading';
  const open = state === 'open';
  const attrs = kind === 'menu' ? ` aria-expanded="${open}" aria-haspopup="listbox" aria-pressed="${selected}"` : ` aria-pressed="${selected}"`;
  const tooltip = selected ? 'filter-chip-tooltip-selected.svg' : state === 'disabled' ? 'filter-chip-tooltip-disabled.svg' : 'filter-chip-tooltip.svg';
  const content = loading
    ? `<span class="crs-filter-chip__label">${kind === 'menu' ? 'Фильтр' : 'Акции и скидки'}</span><svg class="crs-filter-chip__loader" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#loader"></use></svg>`
    : kind === 'menu'
      ? `<img class="crs-filter-chip__icon" src="ui/assets/controls/${tooltip}" alt=""><span class="crs-filter-chip__label">Фильтр</span>${navSpriteIcon('arrow-small', 'crs-filter-chip__icon crs-filter-chip__arrow')}${selected ? '<span class="crs-filter-chip__badge">0</span>' : ''}`
      : `<span class="crs-filter-chip__label">Акции и скидки</span><span class="crs-filter-chip__switch" aria-hidden="true"><span class="crs-filter-chip__switch-track"></span><img src="ui/assets/controls/filter-chip-dot.svg" alt=""></span>`;
  return `<button type="button" class="crs-filter-chip crs-filter-chip--${kind}" data-state="${state}" aria-label="${kind === 'menu' ? 'Фильтр' : 'Акции и скидки'}"${attrs}${loading ? ' aria-busy="true"' : ''}${disabled}>${content}</button>`;
}

function filterChipFamilyMarkup() {
  const states = [['default', 'Inactive'], ['hover', 'Hover'], ['focus', 'Focus'], ['pressed', 'Pressed'], ['disabled', 'Disabled'], ['loading', 'Loading']];
  const rows = states.map(([state, label]) => `<div class="crs-filter-chip-matrix__row"><span class="crs-filter-chip-state">${label}</span>${filterChipMarkup('menu', state)}${filterChipMarkup('switch', state)}</div>`).join('');
  return `<div class="crs-filter-chip-guide"><section class="crs-filter-chip-section"><h2 class="crs-filter-chip-title">Разновидности</h2><div class="crs-filter-chip-variants"><span class="crs-filter-chip-sample"><span class="crs-filter-chip-caption">FilterChipMenu</span>${filterChipMarkup('menu')}</span><span class="crs-filter-chip-sample"><span class="crs-filter-chip-caption">FilterChipSwitch</span>${filterChipMarkup('switch')}</span></div></section><section class="crs-filter-chip-section"><h2 class="crs-filter-chip-title">Состояния</h2><div class="crs-filter-chip-matrix"><div class="crs-filter-chip-matrix__head"><span></span><span>Menu</span><span>Switch</span></div>${rows}</div></section><section class="crs-filter-chip-section"><h2 class="crs-filter-chip-title">Open · FilterChipMenu</h2><div class="crs-filter-chip-open">${filterChipMarkup('menu', 'open')}<div class="crs-filter-chip-dropdown" role="listbox" aria-label="Фильтры"><span role="option" aria-selected="false">Дизайн</span><span role="option" aria-selected="false">Разработка</span><span role="option" aria-selected="false">Маркетинг</span><span role="option" aria-selected="false">Аналитика</span><span role="option" aria-selected="false">Менеджмент</span></div></div></section></div>`;
}

const contextualTabsPreviewCss = `
.crs-tabs-guide{display:grid;gap:24px;font-family:Inter,sans-serif}
.crs-tabs-context{box-sizing:border-box;width:100%;padding:24px;border-radius:20px}
.crs-tabs-context--hero{background:#346ef4;color:#fff}
.crs-tabs-context--page{border:1px solid #e9e9ea;background:#fff;color:#2c2e34}
.crs-tabs-section{display:grid;gap:12px}
.crs-tabs-title{margin:0;font-size:14px;line-height:20px}
.crs-tabs-context--hero .crs-tabs-title{color:#fff}
.crs-tabs-states{display:flex;flex-wrap:wrap;gap:20px}
.crs-tabs-sample{display:grid;justify-items:center;gap:6px}
.crs-tabs-caption{font-size:11px;line-height:16px;opacity:.72}
`;

function contextualTabMarkup(state = 'default') {
  const disabled = ['disabled', 'loading'].includes(state) ? ' disabled' : '';
  const selected = state === 'selected';
  const loading = state === 'loading';
  return `<button type="button" role="tab" class="crs-context-tab" data-state="${state}" aria-selected="${selected}"${loading ? ' aria-busy="true"' : ''}${disabled}>${loading ? `<span>Tab</span><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#loader"></use></svg>` : 'Tab'}</button>`;
}

function contextualTabsMarkup(context) {
  const states = [['default', 'Inactive'], ['hover', 'Hover'], ['focus', 'Focus'], ['selected', 'Selected'], ['disabled', 'Disabled'], ['loading', 'Loading']];
  return `<div class="crs-tabs-guide"><div class="crs-tabs-context crs-tabs-context--${context}"><section class="crs-tabs-section"><h2 class="crs-tabs-title">В группе</h2><div class="crs-tabs-group crs-tabs-group--${context}" role="tablist" aria-label="Раздел">${contextualTabMarkup('selected')}${contextualTabMarkup('default')}${contextualTabMarkup('default')}</div></section></div><div class="crs-tabs-context crs-tabs-context--${context}"><section class="crs-tabs-section"><h2 class="crs-tabs-title">Состояния</h2><div class="crs-tabs-states" role="tablist" aria-label="Состояния вкладки">${states.map(([state, label]) => `<span class="crs-tabs-sample"><span class="crs-tabs-group crs-tabs-group--${context}">${contextualTabMarkup(state)}</span><span class="crs-tabs-caption">${label}</span></span>`).join('')}</div></section></div></div>`;
}

const figmaFieldIds = new Set(['select', 'multi-select', 'search-input', 'text-input', 'textarea']);
const figmaFieldPreviewCss = `
.crs-field-guide{display:grid;gap:24px;color:#2c2e34;font-family:Inter,sans-serif}
.crs-field-section{display:grid;gap:10px}
.crs-field-section__title{margin:0;font-size:14px;line-height:20px}
.crs-field-sizes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.crs-field-sample{display:grid;gap:6px;min-width:0}
.crs-field-sample__label{color:#697386;font-size:11px;line-height:16px}
.crs-field-matrix{display:grid;gap:8px}
.crs-field-matrix__head,.crs-field-matrix__row{display:grid;grid-template-columns:72px repeat(2,minmax(0,1fr));gap:10px;align-items:center}
.crs-field-matrix__head{color:#697386;font-size:11px;line-height:16px}
.crs-field-state-name{color:#697386;font-size:11px;line-height:16px}
.crs-field{position:relative;box-sizing:border-box;display:flex;width:100%;min-width:0;align-items:center;gap:4px;height:40px;padding:8px 12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;color:#2c2e34;font:400 16px/22px Inter,sans-serif;text-align:left;transition:border-color .15s ease}
.crs-field[data-size=xl]{height:56px;padding-left:16px;padding-right:12px}
.crs-field:hover,.crs-field[data-state=hover]{border-color:#dededf}
.crs-field:focus,.crs-field:focus-within,.crs-field[data-state=focus]{border-color:#2c2e34;outline:0}
.crs-field[data-state=error]{border-color:#e84444}
.crs-field[data-state=disabled]{border-color:#e9e9ea;color:#d3d3d4;cursor:not-allowed}
.crs-field input,.crs-field textarea{box-sizing:border-box;min-width:0;flex:1;margin:0;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;line-height:22px}
.crs-field input::placeholder,.crs-field textarea::placeholder{color:#909194;opacity:1}
.crs-field[data-state=disabled] input::placeholder,.crs-field[data-state=disabled] textarea::placeholder{color:#d3d3d4}
.crs-field svg{display:block;width:24px;height:24px;flex:0 0 24px;color:#909194}
.crs-field[data-state=disabled] svg{color:#d3d3d4}
.crs-field--select{appearance:none;cursor:pointer}
.crs-field--select .crs-field__text{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#909194}
.crs-field--select[data-filled=true] .crs-field__text{color:#2c2e34}
.crs-field--select[data-open=true] svg{transform:rotate(180deg)}
.crs-field--multiselect{height:40px;min-height:40px;align-content:flex-start;flex-wrap:wrap;padding:3px 4px}
.crs-field--multiselect[data-size=xl]{height:56px;min-height:56px;padding:11px 4px 11px 8px}
.crs-field--multiselect input{min-width:84px;height:32px;padding:0 8px}
.crs-field-chip{box-sizing:border-box;display:inline-flex;height:32px;align-items:center;gap:4px;padding:4px 4px 4px 8px;border-radius:8px;background:#f1f1f1;color:#2c2e34;font-size:14px;line-height:20px;white-space:nowrap}
.crs-field-chip svg{width:20px;height:20px;flex-basis:20px;color:#909194}
.crs-field--textarea{height:82px;align-items:flex-start;padding:8px 12px}
.crs-field--textarea textarea{height:64px;padding-top:2px;resize:none}
.crs-field-dropdown-demo{width:min(360px,100%)}
.crs-field-dropdown{position:relative;box-sizing:border-box;height:216px;margin-top:4px;overflow:hidden;border:1px solid #e9e9ea;border-radius:12px;background:#fff;box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -2px rgba(0,0,0,.05)}
.crs-field-dropdown__list{box-sizing:border-box;width:calc(100% - 16px);height:100%;padding:8px 0;overflow:hidden}
.crs-field-dropdown__row{box-sizing:border-box;display:flex;width:100%;height:40px;align-items:center;padding:8px 24px 8px 16px;border:0;background:transparent;color:#2c2e34;font:400 14px/20px Inter,sans-serif;text-align:left;cursor:pointer}
.crs-field-dropdown__row:hover,.crs-field-dropdown__row:focus-visible{background:#f1f1f1;outline:0}
.crs-field-dropdown__scroll{position:absolute;z-index:2;top:-1px;right:-1px;bottom:-1px;box-sizing:border-box;width:16px;padding:8px 6px}
.crs-field-dropdown__track{display:block;width:4px;height:100%;overflow:hidden;border-radius:200px;background:#e9e9ea}
.crs-field-dropdown__thumb{display:block;width:4px;height:50px;border-radius:200px;background:#909194}
@media(max-width:600px){.crs-field-matrix__head{display:none}.crs-field-matrix__row{grid-template-columns:1fr}.crs-field-state-name{margin-top:6px}.crs-field-sizes{grid-template-columns:1fr}}
`;

function fieldIcon(id, className = '') {
  return `<svg class="${className}" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#${id}"></use></svg>`;
}

function fieldControlMarkup(id, { size = 'm', state = 'default', filled = false, open = false } = {}) {
  const disabled = state === 'disabled' ? ' disabled' : '';
  const invalid = state === 'error' ? ' aria-invalid="true"' : '';
  const text = filled ? (id === 'search-input' ? 'Аналитика' : 'Текст') : '';
  const placeholder = id === 'select' ? 'Выберите значение' : id === 'multi-select' ? 'Добавить значение' : id === 'search-input' ? 'Искать на Хабр Курсах' : 'Placeholder';
  const attrs = `data-size="${size}" data-state="${state}" data-filled="${filled}" data-open="${open}"`;
  if (id === 'select') return `<button type="button" class="crs-field crs-field--select" role="combobox" aria-haspopup="listbox" aria-expanded="${open}" aria-label="Выберите значение" ${attrs}${disabled}${invalid}><span class="crs-field__text">${filled ? 'Аналитика' : placeholder}</span>${fieldIcon('arrow-small')}</button>`;
  if (id === 'multi-select') return `<label class="crs-field crs-field--multiselect" ${attrs}>${filled ? `<span class="crs-field-chip">Аналитика${fieldIcon('cross-small')}</span>` : ''}<input type="text" role="combobox" aria-haspopup="listbox" aria-expanded="${open}" aria-label="Добавить значение" placeholder="${filled ? 'Ещё' : placeholder}"${disabled}${invalid}></label>`;
  if (id === 'textarea') return `<label class="crs-field crs-field--textarea" ${attrs}><textarea aria-label="Текст" placeholder="${placeholder}"${disabled}${invalid}>${text}</textarea></label>`;
  const type = id === 'search-input' ? 'search' : 'text';
  return `<label class="crs-field crs-field--${id}" ${attrs}><input type="${type}" aria-label="${id === 'search-input' ? 'Поиск по курсам' : 'Текст'}" placeholder="${placeholder}" value="${text}"${disabled}${invalid}>${id === 'search-input' ? fieldIcon('search') : ''}</label>`;
}

function fieldDropdownMarkup(id) {
  if (!['select', 'multi-select'].includes(id)) return '';
  const options = ['Аналитика', 'Дизайн', 'Разработка', 'Маркетинг', 'Менеджмент', 'Тестирование', 'Продукт'];
  return `<section class="crs-field-section"><h2 class="crs-field-section__title">Открытый dropdown · M</h2><div class="crs-field-dropdown-demo">
    ${fieldControlMarkup(id, { state: 'focus', filled: id === 'multi-select', open: true })}
    <div class="crs-field-dropdown" role="listbox" aria-label="Направления">${`<div class="crs-field-dropdown__list">${options.map(option => `<button type="button" class="crs-field-dropdown__row" role="option">${option}</button>`).join('')}</div><span class="crs-field-dropdown__scroll" aria-hidden="true"><span class="crs-field-dropdown__track"><span class="crs-field-dropdown__thumb"></span></span></span>`}</div>
  </div></section>`;
}

function fieldFamilyMarkup(id) {
  const stateRows = [
    ['default', 'Default'],
    ['hover', 'Hover'],
    ['focus', 'Focus'],
    ['disabled', 'Disabled'],
    ['error', 'Error'],
  ].map(([state, label]) => `<div class="crs-field-matrix__row"><span class="crs-field-state-name">${label}</span>${fieldControlMarkup(id, { state })}${fieldControlMarkup(id, { state, filled: true })}</div>`).join('');
  const sizes = id === 'textarea' ? '' : `<section class="crs-field-section"><h2 class="crs-field-section__title">Размеры</h2><div class="crs-field-sizes"><span class="crs-field-sample"><span class="crs-field-sample__label">M · 40 px</span>${fieldControlMarkup(id)}</span><span class="crs-field-sample"><span class="crs-field-sample__label">XL · 56 px · SearchForm</span>${fieldControlMarkup(id, { size: 'xl' })}</span></div></section>`;
  return `<div class="crs-field-guide">${sizes}${fieldDropdownMarkup(id)}<section class="crs-field-section"><h2 class="crs-field-section__title">Состояния${id === 'textarea' ? ' · M · 82 px' : ' · M'}</h2><div class="crs-field-matrix"><div class="crs-field-matrix__head"><span></span><span>Пустое</span><span>Заполненное</span></div>${stateRows}</div></section></div>`;
}

const figmaControlIds = new Set(['checkbox', 'radio-button', 'switch']);
const figmaControlPreviewCss = `
.crs-control-guide{display:grid;gap:28px;color:#2c2e34;font-family:Inter,sans-serif}
.crs-control-section{display:grid;gap:12px}
.crs-control-section__title{margin:0;font-size:14px;line-height:20px}
.crs-control-matrix{display:grid;gap:20px}
.crs-control-matrix__head,.crs-control-matrix__row{display:grid;grid-template-columns:76px repeat(2,minmax(0,1fr));gap:20px;align-items:center}
.crs-control-matrix__head,.crs-control-state-name{color:#697386;font-size:11px;line-height:16px}
.crs-control{position:relative;display:inline-flex;width:max-content;max-width:100%;height:26px;align-items:flex-start;gap:8px;color:#2c2e34;font:400 16px/22px Inter,sans-serif;cursor:pointer}
.crs-control__input{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.crs-control__visual{position:relative;box-sizing:border-box;width:24px;height:24px;flex:0 0 24px}
.crs-control__label{padding-top:1px;white-space:nowrap}
.crs-control__surface{position:absolute;z-index:1;box-sizing:border-box}
.crs-control__asset{position:absolute;z-index:2;inset:0;display:block;width:24px;height:24px;opacity:0}
.crs-control__loader{position:absolute;z-index:3;inset:0;display:none;width:24px;height:24px;color:#a6a7a9}
.crs-control__input:focus-visible+.crs-control__visual,.crs-control[data-state=focus] .crs-control__visual{outline:2px solid #a6a7a9;outline-offset:0;border-radius:8px}
.crs-control[data-state=disabled],.crs-control[data-state=loading]{color:#909194;cursor:not-allowed}
.crs-control[data-state=loading] .crs-control__visual{opacity:0}
.crs-control[data-state=loading] .crs-control__loader{display:block}
.crs-control--checkbox .crs-control__surface{inset:2px;width:20px;height:20px;border-radius:6px;background:#dededf}
.crs-control--checkbox:hover .crs-control__surface,.crs-control--checkbox[data-state=hover] .crs-control__surface,.crs-control--checkbox[data-state=focus] .crs-control__surface{background:#d3d3d4}
.crs-control--checkbox .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#2c2e34}
.crs-control--checkbox:hover .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--checkbox[data-state=hover] .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--checkbox[data-state=focus] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:rgba(44,46,52,.8)}
.crs-control--checkbox .crs-control__input:checked+.crs-control__visual .crs-control__asset{opacity:1}
.crs-control--checkbox[data-state=disabled] .crs-control__surface{background:#e9e9ea}
.crs-control--checkbox[data-state=disabled] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#d3d3d4}
.crs-control--radio .crs-control__surface{inset:1px;width:22px;height:22px;border-radius:200px;background:#dededf}
.crs-control--radio:hover .crs-control__surface,.crs-control--radio[data-state=hover] .crs-control__surface,.crs-control--radio[data-state=focus] .crs-control__surface{background:#d3d3d4}
.crs-control--radio .crs-control__input:focus-visible+.crs-control__visual,.crs-control--radio[data-state=focus] .crs-control__visual{border-radius:200px}
.crs-control--radio .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#2c2e34}
.crs-control--radio .crs-control__input:checked+.crs-control__visual .crs-control__surface:after{position:absolute;inset:5px;border-radius:200px;background:#fff;content:""}
.crs-control--radio:hover .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--radio[data-state=hover] .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--radio[data-state=focus] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:rgba(44,46,52,.8)}
.crs-control--radio[data-state=disabled] .crs-control__surface{background:#e9e9ea}
.crs-control--radio[data-state=disabled] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#d3d3d4}
.crs-control--switch .crs-control__visual{width:40px;flex-basis:40px}
.crs-control--switch .crs-control__surface{top:1px;left:1px;width:38px;height:22px;border-radius:200px;background:#dededf}
.crs-control--switch .crs-control__asset{left:0;right:auto;opacity:1;transition:left .15s ease}
.crs-control--switch:hover .crs-control__surface,.crs-control--switch[data-state=hover] .crs-control__surface,.crs-control--switch[data-state=focus] .crs-control__surface{background:#d3d3d4}
.crs-control--switch .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#2c2e34}
.crs-control--switch .crs-control__input:checked+.crs-control__visual .crs-control__asset{left:16px}
.crs-control--switch:hover .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--switch[data-state=hover] .crs-control__input:checked+.crs-control__visual .crs-control__surface,.crs-control--switch[data-state=focus] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:rgba(44,46,52,.8)}
.crs-control--switch .crs-control__input:focus-visible+.crs-control__visual,.crs-control--switch[data-state=focus] .crs-control__visual{border-radius:200px}
.crs-control--switch[data-state=disabled] .crs-control__surface{background:#e9e9ea}
.crs-control--switch[data-state=disabled] .crs-control__input:checked+.crs-control__visual .crs-control__surface{background:#d3d3d4}
.crs-control--switch .crs-control__loader{left:8px}
.crs-control-lists{display:grid;grid-template-columns:minmax(0,180px) minmax(0,1fr);gap:24px}
.crs-control-list-sample{display:grid;align-content:start;gap:8px}
.crs-control-list-sample__label{color:#697386;font-size:11px;line-height:16px}
.crs-control-list{display:flex;align-items:flex-start}
.crs-control-list--vertical{flex-direction:column;gap:16px}
.crs-control-list--horizontal{flex-wrap:wrap;gap:24px}
@media(max-width:600px){.crs-control-matrix__head{display:none}.crs-control-matrix__row{grid-template-columns:1fr;gap:8px}.crs-control-state-name{margin-top:8px}.crs-control-lists{grid-template-columns:1fr}}
`;

function controlMarkup(id, { state = 'default', checked = false, text = 'Text', name = '' } = {}) {
  const type = id === 'radio-button' ? 'radio' : 'checkbox';
  const disabled = ['disabled', 'loading'].includes(state) ? ' disabled' : '';
  const checkedAttr = checked ? ' checked' : '';
  const role = id === 'switch' ? ' role="switch"' : '';
  const busy = state === 'loading' ? ' aria-busy="true"' : '';
  const controlName = name || `${id}-${state}`;
  const asset = id === 'checkbox'
    ? `<img class="crs-control__asset" src="ui/assets/controls/check.svg" alt="">`
    : id === 'switch'
      ? `<img class="crs-control__asset" src="ui/assets/controls/dot.svg" alt="">`
      : '';
  return `<label class="crs-control crs-control--${id === 'radio-button' ? 'radio' : id}" data-state="${state}" data-checked="${checked}"${busy}><input class="crs-control__input" type="${type}" name="${controlName}"${role}${checkedAttr}${disabled}><span class="crs-control__visual"><span class="crs-control__surface"></span>${asset}</span><svg class="crs-control__loader" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#loader"></use></svg><span class="crs-control__label">${text}</span></label>`;
}

function controlListsMarkup(id) {
  if (!['checkbox', 'radio-button'].includes(id)) return '';
  const names = ['Первый', 'Второй', 'Третий'];
  const groupName = id === 'radio-button' ? 'radio-demo' : '';
  const controls = orientation => names.map((text, index) => controlMarkup(id, { checked: id === 'radio-button' && index === 0, text, name: id === 'radio-button' ? `${groupName}-${orientation}` : `${id}-${orientation}-${index}` })).join('');
  return `<section class="crs-control-section"><h2 class="crs-control-section__title">Списки элементов</h2><div class="crs-control-lists"><div class="crs-control-list-sample"><span class="crs-control-list-sample__label">Вертикальный · gap 16 px</span><div class="crs-control-list crs-control-list--vertical">${controls('vertical')}</div></div><div class="crs-control-list-sample"><span class="crs-control-list-sample__label">Горизонтальный · gap 24 px</span><div class="crs-control-list crs-control-list--horizontal">${controls('horizontal')}</div></div></div></section>`;
}

function controlFamilyMarkup(id) {
  const rows = [
    ['default', 'Inactive'],
    ['hover', 'Hover'],
    ['focus', 'Focus'],
    ['disabled', 'Disabled'],
    ['loading', 'Loading'],
  ].map(([state, label]) => `<div class="crs-control-matrix__row"><span class="crs-control-state-name">${label}</span>${controlMarkup(id, { state })}${controlMarkup(id, { state, checked: true })}</div>`).join('');
  return `<div class="crs-control-guide"><section class="crs-control-section"><h2 class="crs-control-section__title">Состояния · off / on</h2><div class="crs-control-matrix"><div class="crs-control-matrix__head"><span></span><span>Выключено</span><span>Включено</span></div>${rows}</div></section>${controlListsMarkup(id)}</div>`;
}

const siteHeaderPreviewCss = `
.crs-header-demo{min-height:100%;background:#fff;color:#2c2e34;font-family:Inter,sans-serif}
.crs-header-controls{box-sizing:border-box;display:flex;min-height:64px;align-items:end;flex-wrap:wrap;gap:8px;padding:10px 24px;border-bottom:1px solid #e9e9ea;background:#fff}
.crs-header-control{display:grid;gap:3px;color:#697386;font-size:11px;line-height:14px}
.crs-header-control select{box-sizing:border-box;height:32px;padding:5px 28px 5px 10px;border:1px solid #dededf;border-radius:8px;background:#fff;color:#2c2e34;font:400 13px/20px Inter,sans-serif}
.crs-header-control--check{display:flex;height:32px;align-items:center;gap:6px;padding:0 4px;color:#2c2e34;font-size:13px;line-height:20px}
.crs-header-control--check input{width:16px;height:16px;margin:0}
.crs-header-use{margin-left:auto;align-self:center;color:#697386;font-size:12px;line-height:16px;text-align:right}
.crs-site-header{position:relative;box-sizing:border-box;width:100%;overflow:hidden;background:#fff}
.crs-site-header[data-family=listing][data-level=hero]{height:472px}
.crs-site-header[data-family=listing][data-level=page][data-sticky=false]{height:208px}
.crs-site-header[data-family=listing][data-level=page][data-sticky=true]{position:sticky;top:0;z-index:5;height:156px;box-shadow:0 4px 3px rgba(0,0,0,.05),0 2px 2px rgba(0,0,0,.05)}
.crs-site-header[data-family=courses][data-level=hero]{height:110px}
.crs-site-header[data-family=courses][data-level=page][data-sticky=false]{height:266px}
.crs-site-header[data-family=courses][data-level=page][data-sticky=true]{position:sticky;top:0;z-index:5;height:124px;box-shadow:0 4px 3px rgba(0,0,0,.05),0 2px 2px rgba(0,0,0,.05)}
.crs-site-header[data-family=simple]{height:64px}
.crs-site-header__blue{position:relative;box-sizing:border-box;height:calc(100% - 60px);overflow:hidden;padding:0 24px;background:linear-gradient(180deg,#346ef4 0%,#6bacfd 100%);color:#fff}
.crs-site-header[data-family=courses][data-level=hero] .crs-site-header__blue,.crs-site-header[data-family=simple] .crs-site-header__blue{height:100%}
.crs-site-header__topbar{position:relative;z-index:2;box-sizing:border-box;display:flex;width:100%;max-width:1076px;min-height:64px;align-items:center;justify-content:space-between;gap:24px;margin:0 auto}
.crs-site-header__logo-area{display:inline-flex;align-items:center;gap:12px;flex:0 0 auto}
.crs-site-header__logo{display:block;width:97px;height:32px}
.crs-site-header__divider{width:1px;height:24px;background:rgba(255,255,255,.5)}
.crs-site-header__dropdown-icon,.crs-site-header__nav svg{display:block;width:24px;height:24px;color:#fff}
.crs-site-header__nav{display:flex;align-items:start;gap:16px;flex:0 0 auto}
.crs-site-header__nav a{display:grid;justify-items:center;color:#fff;font:600 12px/16px Inter,sans-serif;text-decoration:none}
.crs-site-header__course-tools{display:flex;min-width:0;flex:1;align-items:center;gap:8px}
.crs-site-header__catalog{box-sizing:border-box;display:inline-flex;height:40px;align-items:center;gap:4px;padding:8px 16px 8px 8px;border:0;border-radius:12px;background:#2c2e34;color:#fff;font:600 14px/20px Inter,sans-serif}
.crs-site-header__catalog svg{width:24px;height:24px}
.crs-site-header__course-search{box-sizing:border-box;display:flex;height:40px;min-width:80px;flex:1;align-items:center;gap:4px;padding:8px 12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;color:#909194;font:400 14px/20px Inter,sans-serif}
.crs-site-header__course-search span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-site-header__course-search svg{width:24px;height:24px;flex:0 0 24px}
.crs-site-header__hero{position:relative;z-index:2;box-sizing:border-box;display:flex;height:calc(100% - 64px);flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px 0 56px;text-align:center}
.crs-site-header__heading{margin:0;color:#fff;font:600 44px/48px Inter,sans-serif;letter-spacing:-.5px}
.crs-site-header__seo{margin:0;color:#fff;font-size:14px;line-height:20px}
.crs-site-header__hero-controls{display:flex;align-items:center;justify-content:center;gap:8px}
.crs-site-header__action{box-sizing:border-box;display:inline-flex;height:40px;align-items:center;justify-content:center;padding:8px 16px;border:0;border-radius:12px;color:#fff;font:600 14px/20px Inter,sans-serif;white-space:nowrap}.crs-site-header__action--main{background:#2c2e34}.crs-site-header__action--secondary{background:#f1f1f1;color:#2c2e34}
.crs-site-header__listing-form{display:flex;width:100%;max-width:1076px;align-items:stretch;gap:8px}
.crs-site-header__fields{display:grid;height:56px;min-width:0;flex:1;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;overflow:hidden;border-radius:12px}
.crs-site-header__field{box-sizing:border-box;display:flex;min-width:0;align-items:center;gap:4px;padding:8px 12px 8px 16px;background:#fff;color:#909194;font:400 16px/22px Inter,sans-serif;text-align:left}
.crs-site-header__field span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.crs-site-header__field svg{width:24px;height:24px;flex:0 0 24px}
.crs-site-header__search-button{box-sizing:border-box;height:56px;padding:16px 24px;border:0;border-radius:12px;background:#2c2e34;color:#fff;font:600 16px/22px Inter,sans-serif;white-space:nowrap}
.crs-site-header__listing-page{position:relative;z-index:2;box-sizing:border-box;display:flex;height:calc(100% - 64px);align-items:center;justify-content:center;padding:8px 0 20px}
.crs-site-header[data-family=listing][data-sticky=true] .crs-site-header__topbar{display:none}
.crs-site-header[data-family=listing][data-sticky=true] .crs-site-header__listing-page{height:100%;padding:20px 0}
.crs-site-header__listing-pill{display:none;box-sizing:border-box;width:272px;align-items:center;justify-content:center;padding:16px 24px;border-radius:200px;background:#fff;text-align:center}
.crs-site-header__listing-pill strong{display:block;font-size:16px;line-height:22px}.crs-site-header__listing-pill small{display:block;margin-top:2px;color:#909194;font-size:12px;line-height:16px}
.crs-site-header__topmenu{position:relative;z-index:2;display:flex;height:46px;align-items:center;gap:16px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;white-space:nowrap;color:#fff;font-size:12px;line-height:16px}
.crs-site-header__sale{padding:4px 8px;border-radius:200px;background:#2755e9;font-size:10px;font-weight:600;line-height:14px}
.crs-site-header__course-seo{position:relative;z-index:2;box-sizing:border-box;display:grid;height:142px;align-content:center;gap:8px;max-width:1076px;margin:auto;color:#fff}
.crs-site-header__breadcrumbs,.crs-site-header__meta{display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px}
.crs-site-header__course-seo h2{margin:0;font-size:30px;line-height:34px;letter-spacing:-.5px}
.crs-site-header__filters{box-sizing:border-box;height:60px;background:#fff}
.crs-site-header__filters-inner{box-sizing:border-box;display:flex;width:100%;max-width:1124px;height:60px;align-items:center;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;margin:0 auto;padding:12px 24px}
.crs-site-header__filter{box-sizing:border-box;display:inline-flex;height:36px;flex:0 0 auto;align-items:center;gap:2px;padding:8px 10px;border:1px solid #e9e9ea;border-radius:200px;background:#fff;color:#2c2e34;font:400 14px/20px Inter,sans-serif}
.crs-site-header__filter svg{width:20px;height:20px}
.crs-site-header__listing,.crs-site-header__courses,.crs-site-header__simple,.crs-site-header__hero,.crs-site-header__listing-page,.crs-site-header__course-seo,.crs-site-header__topmenu,.crs-site-header__filters{display:none}
.crs-site-header[data-family=listing] .crs-site-header__listing,.crs-site-header[data-family=courses] .crs-site-header__courses,.crs-site-header[data-family=simple] .crs-site-header__simple{display:flex}
.crs-site-header[data-family=listing][data-level=hero] .crs-site-header__hero{display:flex}
.crs-site-header[data-family=listing][data-level=page] .crs-site-header__listing-page{display:flex}
.crs-site-header[data-family=courses][data-level=hero] .crs-site-header__topmenu{display:flex}
.crs-site-header[data-family=courses][data-level=page][data-sticky=false] .crs-site-header__course-seo{display:grid}
.crs-site-header[data-family=listing] .crs-site-header__filters,.crs-site-header[data-family=courses][data-level=page] .crs-site-header__filters{display:flex}
@media(min-width:480px) and (max-width:1023px){
  .crs-site-header[data-family=listing][data-level=hero]{height:464px}.crs-site-header[data-family=listing][data-level=page][data-sticky=false]{height:200px}.crs-site-header[data-family=listing][data-level=page][data-sticky=true]{height:156px}
  .crs-site-header[data-family=courses][data-level=hero]{height:110px}.crs-site-header[data-family=courses][data-level=page][data-sticky=false]{height:266px}.crs-site-header[data-family=courses][data-level=page][data-sticky=true]{height:124px}.crs-site-header[data-family=simple]{height:56px}
  .crs-site-header__topbar{min-height:56px}.crs-site-header__nav a span{display:none}.crs-site-header__hero{height:calc(100% - 56px)}.crs-site-header__listing-page{height:calc(100% - 56px)}
  .crs-site-header__catalog span{display:none}.crs-site-header__catalog{padding-right:8px}.crs-site-header__course-tools{gap:8px}.crs-site-header__course-seo{height:150px}
}
@media(max-width:479px){
  .crs-header-controls{padding:10px 12px}.crs-header-use{width:100%;margin-left:0;text-align:left}.crs-site-header__blue{padding:0 24px}
  .crs-site-header[data-family=listing][data-level=hero]{height:744px}.crs-site-header[data-family=listing][data-level=page][data-sticky=false]{height:216px}.crs-site-header[data-family=listing][data-level=page][data-sticky=true]{height:172px}
  .crs-site-header[data-family=courses][data-level=hero]{height:142px}.crs-site-header[data-family=courses][data-level=page][data-sticky=false]{height:306px}.crs-site-header[data-family=courses][data-level=page][data-sticky=true]{height:172px}.crs-site-header[data-family=simple]{height:56px}
  .crs-site-header__topbar{min-height:56px;gap:8px}.crs-site-header__nav a span{display:none}.crs-site-header__hero{height:calc(100% - 56px);padding:40px 0}.crs-site-header__heading{font-size:30px;line-height:34px}
  .crs-site-header__hero-controls{width:100%;flex-direction:column}.crs-site-header__hero-controls>.crs-site-header__action{width:100%}.crs-site-header__listing-form{flex-direction:column}.crs-site-header__fields{height:auto;flex:none;grid-template-columns:1fr;gap:8px;overflow:visible}.crs-site-header__field{height:56px;border-radius:12px}.crs-site-header__search-button{width:100%}
  .crs-site-header__listing-page{height:calc(100% - 56px)}.crs-site-header__listing-page .crs-site-header__listing-form{display:none}.crs-site-header__listing-pill{display:flex}
  .crs-site-header__courses.crs-site-header__topbar{align-content:start;flex-wrap:wrap}.crs-site-header__course-tools{order:3;flex-basis:100%}.crs-site-header__catalog{padding-right:8px}.crs-site-header__catalog span{display:none}
  .crs-site-header__topmenu{height:30px;padding-top:8px}.crs-site-header__course-seo{height:134px;align-content:start;padding-top:12px}.crs-site-header__course-seo h2{font-size:24px;line-height:28px}.crs-site-header__meta{flex-wrap:wrap}
}
`;

function siteHeaderIcon(id, className = '') {
  return `<svg class="${className}" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use xlink:href="ui/assets/icons/sprite.svg#${id}"></use></svg>`;
}

function siteHeaderLogoArea() {
  return `<div class="crs-site-header__logo-area"><img class="crs-site-header__logo" src="ui/assets/images/logo.svg" alt="Хабр Курсы"><span class="crs-site-header__divider"></span>${siteHeaderIcon('arrow-large', 'crs-site-header__dropdown-icon')}</div>`;
}

function siteHeaderLinks() {
  return `<nav class="crs-site-header__nav" aria-label="Разделы сервиса"><a href="#">${siteHeaderIcon('building')}<span>Школы и Вузы</span></a><a href="#">${siteHeaderIcon('star-empty')}<span>Отзывы</span></a><a href="#">${siteHeaderIcon('percents')}<span>Промокоды</span></a></nav>`;
}

function siteHeaderFilters() {
  return `<div class="crs-site-header__filters" aria-label="Фильтры"><div class="crs-site-header__filters-inner"><button class="crs-site-header__filter" type="button">${siteHeaderIcon('sort')}</button><button class="crs-site-header__filter" type="button">${siteHeaderIcon('tune')}</button><button class="crs-site-header__filter" type="button">Со скидкой</button><button class="crs-site-header__filter" type="button">Направление</button><button class="crs-site-header__filter" type="button">Школа</button></div></div>`;
}

function siteHeaderListingForm() {
  const field = text => `<button class="crs-site-header__field" type="button"><span>${text}</span>${siteHeaderIcon('arrow-large')}</button>`;
  return `<div class="crs-site-header__listing-form"><div class="crs-site-header__fields">${field('Направление')}${field('Школа')}${field('Стоимость')}</div><button class="crs-site-header__search-button" type="button">Найти курсы</button></div>`;
}

function siteHeaderMarkup() {
  return `<div class="crs-header-demo"><form class="crs-header-controls" aria-label="Варианты SiteHeader"><label class="crs-header-control">Семейство<select id="site-header-family"><option value="listing">ListingHeader</option><option value="courses">CoursesHeader</option><option value="simple">SimplePageHeader</option></select></label><label class="crs-header-control">Уровень<select id="site-header-level"><option value="hero">Hero</option><option value="page">Page</option></select></label><label class="crs-header-control crs-header-control--check"><input id="site-header-sticky" type="checkbox">Sticky</label><span class="crs-header-use" id="site-header-use">Верхнеуровневая листинговая страница · без sticky</span></form><header class="crs-site-header" id="site-header-target" data-family="listing" data-level="hero" data-sticky="false"><div class="crs-site-header__blue"><div class="crs-site-header__topbar crs-site-header__listing">${siteHeaderLogoArea()}${siteHeaderLinks()}</div><div class="crs-site-header__topbar crs-site-header__simple">${siteHeaderLogoArea()}${siteHeaderLinks()}</div><div class="crs-site-header__topbar crs-site-header__courses">${siteHeaderLogoArea()}<div class="crs-site-header__course-tools"><button class="crs-site-header__catalog" type="button">${siteHeaderIcon('catalog')}<span>Каталог</span></button><div class="crs-site-header__course-search"><span>Искать на Хабр Курсах</span>${siteHeaderIcon('search')}</div></div>${siteHeaderLinks()}</div><section class="crs-site-header__hero"><div><h1 class="crs-site-header__heading">Найдите подходящий курс</h1><p class="crs-site-header__seo">Сравнивайте программы, школы и стоимость обучения</p></div><div class="crs-site-header__hero-controls"><div class="crs-tabs-group crs-tabs-group--hero" role="tablist"><button class="crs-context-tab" data-state="selected" type="button" role="tab" aria-selected="true">Все</button><button class="crs-context-tab" data-state="default" type="button" role="tab" aria-selected="false">Онлайн</button></div><button class="crs-site-header__action crs-site-header__action--main" type="button">Подобрать курс</button><button class="crs-site-header__action crs-site-header__action--secondary" type="button">Смотреть рейтинг</button></div>${siteHeaderListingForm()}</section><section class="crs-site-header__listing-page">${siteHeaderListingForm()}<div class="crs-site-header__listing-pill"><span><strong>Все курсы</strong><small>Каталог · направления</small></span></div></section><nav class="crs-site-header__topmenu" aria-label="Популярные разделы"><span class="crs-site-header__sale">РАСПРОДАЖА</span><span>Разместить свой курс</span><span>Программирование</span><span>Нейросети и AI</span><span>Курсы для детей</span><span>Бесплатные курсы</span></nav><section class="crs-site-header__course-seo"><div class="crs-site-header__breadcrumbs">Каталог › Программирование</div><h2>Курсы программирования</h2><div class="crs-site-header__meta">Авторы · Проверено экспертами · Обновлено сегодня</div></section></div>${siteHeaderFilters()}</header></div>`;
}

const siteHeaderPreviewScript = `
const headerTarget=document.querySelector('#site-header-target');
const familyControl=document.querySelector('#site-header-family');
const levelControl=document.querySelector('#site-header-level');
const stickyControl=document.querySelector('#site-header-sticky');
const useLabel=document.querySelector('#site-header-use');
const useCases={listing:{hero:'Верхнеуровневая листинговая страница · без sticky',page:'Листинговая страница второго уровня'},courses:{hero:'Верхнеуровневая страница курсов · без sticky',page:'Страница второго уровня в курсах'},simple:{hero:'Низкоуровневая служебная страница'}};
function updateSiteHeader(){const family=familyControl.value;const simple=family==='simple';if(simple)levelControl.value='hero';levelControl.disabled=simple;stickyControl.disabled=simple||levelControl.value==='hero';if(stickyControl.disabled)stickyControl.checked=false;headerTarget.dataset.family=family;headerTarget.dataset.level=levelControl.value;headerTarget.dataset.sticky=String(stickyControl.checked);useLabel.textContent=useCases[family][levelControl.value]+(stickyControl.checked?' · sticky':'');}
familyControl.addEventListener('change',updateSiteHeader);levelControl.addEventListener('change',updateSiteHeader);stickyControl.addEventListener('change',updateSiteHeader);updateSiteHeader();
`;

const adSlotPreviewCss = `
.crs-ad-slot-demo{display:grid;gap:12px;width:100%;font-family:Inter,sans-serif}
.crs-ad-slot-demo__viewport{overflow:hidden;border-radius:24px}
.crs-ad-slot-demo__track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.crs-ad-slot-demo__track::-webkit-scrollbar{display:none}
.crs-ad-slot-demo__card{position:relative;box-sizing:border-box;display:flex;flex:0 0 min(568px,calc(100% - 40px));height:232px;padding:28px;overflow:hidden;border-radius:24px;background:linear-gradient(135deg,#346ef4 0%,#6bacfd 62%,#eff5ff 100%);color:#fff;text-decoration:none;scroll-snap-align:start}
.crs-ad-slot-demo__card--second{background:linear-gradient(135deg,#2c2e34 0%,#596170 62%,#e9e9ea 100%)}
.crs-ad-slot-demo__copy{display:grid;align-content:end;gap:8px;max-width:330px;color:inherit;text-decoration:none}
.crs-ad-slot-demo__copy strong{font-size:24px;line-height:28px}
.crs-ad-slot-demo__copy span{font-size:14px;line-height:20px;opacity:.86}
.crs-ad-slot-demo__label{position:absolute;top:20px;left:20px;padding:4px 8px;border-radius:60px;background:rgba(0,0,0,.3);font-size:8px;line-height:12px;letter-spacing:.04em}
.crs-ad-slot-demo__more{position:absolute;top:16px;right:16px;display:grid;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:#2c2e34;font:700 14px/1 Inter,sans-serif;place-items:center}
.crs-ad-slot-demo__pagination{display:flex;justify-content:center;gap:6px}
.crs-ad-slot-demo__dot{width:6px;height:6px;border-radius:50%;background:var(--color-ui-black-200)}
.crs-ad-slot-demo__dot:first-child{width:20px;border-radius:8px;background:var(--color-ui-blue-500)}
@media(max-width:767px){.crs-ad-slot-demo__card{flex-basis:100%;height:auto;aspect-ratio:272/280;padding:24px}.crs-ad-slot-demo__copy strong{font-size:22px;line-height:26px}}
`;

function adSlotMarkup() {
  const card = (title, modifier = '') => `<article class="crs-ad-slot-demo__card${modifier}"><span class="crs-ad-slot-demo__label">РЕКЛАМА</span><button class="crs-ad-slot-demo__more" type="button" aria-label="Информация о рекламе">•••</button><a class="crs-ad-slot-demo__copy" href="#"><strong>${title}</strong><span>Локальная заглушка рекламного содержимого</span></a></article>`;
  return `<section class="crs-ad-slot-demo adfox-banner" aria-label="Рекламные предложения"><div class="crs-ad-slot-demo__viewport banner-swiper"><div class="crs-ad-slot-demo__track">${card('Демонстрационный баннер')}${card('Следующий слайд', ' crs-ad-slot-demo__card--second')}</div></div><div class="crs-ad-slot-demo__pagination" aria-hidden="true"><span class="crs-ad-slot-demo__dot"></span><span class="crs-ad-slot-demo__dot"></span><span class="crs-ad-slot-demo__dot"></span></div></section>`;
}

const headerDropdownPreviewCss = `
.crs-header-dropdown-demo{display:grid;justify-items:end;min-height:276px;width:260px;font-family:Inter,sans-serif}
.crs-header-dropdown-demo__anchor{position:relative}
.crs-header-dropdown-demo__trigger{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;border:0;border-radius:12px;background:var(--color-ui-blue-500);color:#fff;font:600 14px/20px Inter,sans-serif;cursor:pointer}
.crs-header-dropdown-demo__trigger svg{width:20px;height:20px;transition:transform .15s ease}
.crs-header-dropdown-demo__trigger[aria-expanded=true] svg{transform:rotate(180deg)}
.crs-header-dropdown-demo__trigger:hover{background:var(--color-ui-blue-600)}
.crs-header-dropdown-demo__trigger:focus-visible{outline:2px solid var(--color-ui-blue-300);outline-offset:2px}
.crs-header-dropdown__panel{right:0!important;top:44px!important;display:block!important}
.crs-header-dropdown__panel[hidden]{display:none!important}
`;

function headerDropdownMarkup(sourceHtml) {
  const panel = sourceHtml
    .replace('style="--dropdown-w:178px;" class="hidden absolute', 'id="header-dropdown-panel" style="--dropdown-w:178px;" class="crs-header-dropdown__panel absolute')
    .replace(/href="https:[^"]+"/g, 'href="#"');
  return `<div class="crs-header-dropdown-demo"><div class="crs-header-dropdown-demo__anchor"><button class="crs-header-dropdown-demo__trigger" id="header-dropdown-trigger" type="button" aria-expanded="true" aria-controls="header-dropdown-panel">Все сервисы<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>${panel}</div></div>`;
}

const headerDropdownPreviewScript = `
const headerDropdownTrigger=document.querySelector('#header-dropdown-trigger');
const headerDropdownPanel=document.querySelector('#header-dropdown-panel');
headerDropdownTrigger.addEventListener('click',()=>{const open=headerDropdownTrigger.getAttribute('aria-expanded')==='true';headerDropdownTrigger.setAttribute('aria-expanded',String(!open));headerDropdownPanel.hidden=open;});
`;

const filterModalCoreCss = `
.crs-filter-modal{display:grid;grid-template-rows:72px minmax(0,1fr) 96px;height:min(620px,100dvh);overflow:hidden}
.crs-filter-modal__header{box-sizing:border-box;height:72px;align-items:flex-start;flex:none}
.crs-filter-modal__body{min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:#a6a7a9 #e9e9ea;scrollbar-width:auto}
.crs-filter-modal__body::-webkit-scrollbar{width:16px}
.crs-filter-modal__body::-webkit-scrollbar-track{margin:8px 0;background:#e9e9ea;border:6px solid #fff;border-radius:200px}
.crs-filter-modal__body::-webkit-scrollbar-thumb{background:#a6a7a9;border:6px solid #fff;border-radius:200px}
.crs-filter-modal__footer{box-sizing:border-box;height:96px;flex:none;gap:16px}
@media(max-width:479px){.crs-filter-modal{grid-template-rows:72px minmax(0,1fr) 136px;max-width:none;border:0;border-radius:0}.crs-filter-modal__footer{height:136px;flex-direction:column;align-items:stretch;gap:8px;padding:16px 24px}.crs-filter-modal__button{width:100%}.crs-filter-modal__button--main{order:-1}}
`;

const overlaysCssPath = join(root, 'ui/components/overlays.css');
writeFileSync(overlaysCssPath, `${readFileSync(overlaysCssPath, 'utf8')}\n/* v0.2 · FilterModal viewport shell */\n${filterModalCoreCss}`);

const filterModalPreviewCss = `
.crs-filter-modal-stage{display:grid;min-height:620px;background:rgba(44,46,52,.12);place-items:start center;font-family:Inter,sans-serif}
.crs-filter-modal[hidden],.crs-filter-modal-reopen[hidden]{display:none}
.crs-filter-modal-reopen{align-self:center;padding:12px 20px;border:0;border-radius:12px;background:#2c2e34;color:#fff;font:600 16px/24px Inter,sans-serif}
.crs-filter-modal__body{padding-top:0;padding-bottom:0}
.crs-filter-modal__group{flex:none}
.crs-filter-modal__recommendations{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
.crs-filter-modal__recommendations::-webkit-scrollbar{display:none}
.crs-filter-modal__recommendation{display:grid;flex:0 0 124px;gap:8px;padding:0 0 4px;border:0;background:transparent;color:#2c2e34;font:400 12px/16px Inter,sans-serif;text-align:center}
.crs-filter-modal__recommendation-image{box-sizing:border-box;width:124px;height:124px;overflow:hidden;border:1px solid #e9e9ea;border-radius:16px;background:#fff}
.crs-filter-modal__recommendation[aria-pressed=true]{color:#346ef4}
.crs-filter-modal__recommendation[aria-pressed=true] .crs-filter-modal__recommendation-image{border-color:#94bdfc;background:#eff5ff}
.crs-filter-modal__recommendation img{display:block;width:100%;height:100%;object-fit:cover}
.crs-filter-modal__options{gap:4px}
.crs-filter-modal__chip{height:36px;padding:8px 12px;border:1px solid #e9e9ea;border-radius:200px;background:#fff;color:#2c2e34;font:400 14px/20px Inter,sans-serif;white-space:nowrap}
.crs-filter-modal__chip:hover{border-color:#dededf}
.crs-filter-modal__chip:focus-visible{outline:2px solid #bcbdbf;outline-offset:2px}
.crs-filter-modal__chip[aria-pressed=true]{border-color:#94bdfc;background:#eff5ff;color:#346ef4}
.crs-filter-modal__price{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.crs-filter-modal__price-chart{position:relative;grid-column:1/-1;display:flex;align-items:end;height:64px;padding:0 10px 8px;border-bottom:1px solid #d3d3d4}
.crs-filter-modal__price-chart i{width:4px;margin-right:2px;background:#6bacfd;border-radius:2px 2px 0 0}
.crs-filter-modal__price input,.crs-filter-modal__search{box-sizing:border-box;width:100%;height:40px;padding:0 12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;color:#2c2e34;font:400 14px/20px Inter,sans-serif}
.crs-filter-modal__selectbox{overflow:hidden;border:1px solid #e9e9ea;border-radius:12px}
.crs-filter-modal__selectbox .crs-filter-modal__search{border:0;border-bottom:1px solid #e9e9ea;border-radius:0}
.crs-filter-modal__list{max-height:144px;padding:8px 0;overflow-y:auto;scrollbar-color:#a6a7a9 #e9e9ea}
.crs-filter-modal__option{display:flex;align-items:flex-start;gap:8px;min-height:40px;padding:8px 16px;box-sizing:border-box;font:400 14px/20px Inter,sans-serif}
.crs-filter-modal__option input{width:20px;height:20px;margin:0;accent-color:#346ef4}
.crs-filter-modal__school-mark{display:grid;width:20px;height:20px;border-radius:6px;background:#eff5ff;color:#346ef4;font:700 10px/1 Inter,sans-serif;place-items:center}
.crs-filter-modal__levels{display:grid;gap:4px}
.crs-filter-modal__level{display:grid;grid-template-columns:24px 1fr;gap:4px;min-height:64px;padding:11px 12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;color:#2c2e34;text-align:left}
.crs-filter-modal__level[aria-pressed=true]{border-color:#94bdfc;background:#eff5ff;color:#346ef4}
.crs-filter-modal__level img{display:block;width:24px;height:24px}
.crs-filter-modal__level span{display:grid;gap:2px;font:400 14px/20px Inter,sans-serif}
.crs-filter-modal__level small{color:#697386;font:400 12px/16px Inter,sans-serif}
@media(max-width:479px){.crs-filter-modal-stage{min-height:620px}.crs-filter-modal__recommendation{flex-basis:84px}.crs-filter-modal__recommendation-image{width:84px;height:84px}}
`;

function filterModalChips(values, selected = []) {
  return `<div class="crs-filter-modal__options">${values.map(value => `<button class="crs-filter-modal__chip" type="button" aria-pressed="${selected.includes(value)}">${value}</button>`).join('')}</div>`;
}

function filterModalList(placeholder, values, school = false) {
  return `<div class="crs-filter-modal__selectbox"><input class="crs-filter-modal__search" type="search" placeholder="${placeholder}" aria-label="${placeholder}"><div class="crs-filter-modal__list">${values.map((value, index) => `<label class="crs-filter-modal__option"><input type="checkbox">${school ? `<span class="crs-filter-modal__school-mark">${index + 1}</span>` : ''}<span>${value}</span></label>`).join('')}</div></div>`;
}

function filterModalGroup(title, content) {
  return `<section class="crs-filter-modal__group"><h2 class="crs-filter-modal__group-title">${title}</h2>${content}</section>`;
}

function filterModalMarkup() {
  const recommendations = [
    ['recommendation-career.png', 'Карьерные консультации'],
    ['recommendation-certificate.png', 'Сертификат после курса'],
    ['recommendation-free.png', 'Бесплатная часть'],
    ['recommendation-mentor.png', 'Поддержка ментора'],
  ];
  const recommendationMarkup = `<div class="crs-filter-modal__recommendations">${recommendations.map(([image, label], index) => `<button class="crs-filter-modal__recommendation" type="button" aria-pressed="${index === 2}"><span class="crs-filter-modal__recommendation-image"><img src="ui/assets/images/filter-modal/${image}" alt=""></span><span>${label}</span></button>`).join('')}</div>`;
  const bars = [12,18,24,16,30,38,28,44,34,52,40,58,46,62,54,42,32,24].map(height => `<i style="height:${height}px"></i>`).join('');
  const price = `<div class="crs-filter-modal__price"><div class="crs-filter-modal__price-chart" aria-hidden="true">${bars}</div><input aria-label="Цена от" value="0 ₽"><input aria-label="Цена до" value="999 999 ₽"></div>`;
  const levels = [
    ['filter-grade-min.svg', 'Для начинающих (Intern/Junior)', 'С нуля или только начали разбираться в теме'],
    ['filter-grade-mid.svg', 'Средний уровень (Middle)', 'Хотите углубиться или прокачать навык'],
    ['filter-grade-max.svg', 'Продвинутый (Senior/Lead)', 'Развить глубокую экспертизу в работе'],
  ].map(([icon, title, text], index) => `<button class="crs-filter-modal__level" type="button" aria-pressed="${index === 1}"><img src="ui/assets/icons/${icon}" alt=""><span>${title}<small>${text}</small></span></button>`).join('');
  return `<div class="crs-filter-modal-stage"><button class="crs-filter-modal-reopen" id="filter-modal-open" type="button" hidden>Открыть фильтры</button><div class="crs-filter-modal" id="filter-modal-target" role="dialog" aria-modal="true" aria-labelledby="filter-modal-title"><header class="crs-filter-modal__header"><h1 class="crs-filter-modal__title" id="filter-modal-title">Поиск обучения</h1><button type="button" class="crs-filter-modal__close" id="filter-modal-close" aria-label="Закрыть"><svg class="svg-icon" width="24" height="24" viewBox="0 0 24 24"><use xlink:href="ui/assets/icons/sprite.svg#menu-close"></use></svg></button></header><div class="crs-filter-modal__body" id="filter-modal-body" tabindex="0" aria-label="Параметры фильтра">${filterModalGroup('Рекомендуем вам', recommendationMarkup)}${filterModalGroup('Тип обучения', filterModalChips(['Курс', 'Вебинар', 'Симулятор'], ['Вебинар']))}${filterModalGroup('Цена', price)}${filterModalGroup('Тематика/навыки/инструменты', filterModalList('Что изучить?', ['Python разработчик', 'Аналитик данных', 'UX/UI-дизайнер', 'Менеджер проектов', 'Интернет-маркетолог']))}${filterModalGroup('Уровень обучения', `<div class="crs-filter-modal__levels">${levels}</div>`)}${filterModalGroup('Школа', filterModalList('Поиск по школам', ['Skillbox', 'Skillfactory', 'Слёрм', 'Логомашина', 'Международная школа профессий'], true))}${filterModalGroup('Длительность', filterModalChips(['До 3 мес', 'От 3 до 6 мес', 'От 6 до 12 мес', 'От 1 года']))}${filterModalGroup('Формат обучения', filterModalChips(['Индивидуально', 'В группе', 'Онлайн', 'Офлайн']))}${filterModalGroup('Местоположение', filterModalList('Поиск по городу', ['Москва', 'Санкт-Петербург', 'Пермь', 'Петропавловск-Камчатский', 'Пенза']))}${filterModalGroup('Дополнительно', filterModalChips(['Акции и скидки', 'Есть куратор', 'Есть рассрочка', 'Только бесплатные курсы', 'Только онлайн курсы'], ['Есть куратор', 'Только бесплатные курсы']))}</div><footer class="crs-filter-modal__footer"><button type="button" class="crs-filter-modal__button crs-filter-modal__button--secondary" id="filter-modal-reset">Очистить всё</button><button type="button" class="crs-filter-modal__button crs-filter-modal__button--main">Показать 30 560 курсов</button></footer></div></div>`;
}

const filterModalPreviewScript = `
const filterModal=document.querySelector('#filter-modal-target');
const filterModalOpen=document.querySelector('#filter-modal-open');
document.querySelector('#filter-modal-close').addEventListener('click',()=>{filterModal.hidden=true;filterModalOpen.hidden=false;filterModalOpen.focus();});
filterModalOpen.addEventListener('click',()=>{filterModal.hidden=false;filterModalOpen.hidden=true;document.querySelector('#filter-modal-close').focus();});
document.querySelectorAll('.crs-filter-modal__chip,.crs-filter-modal__recommendation,.crs-filter-modal__level').forEach(control=>control.addEventListener('click',()=>control.setAttribute('aria-pressed',String(control.getAttribute('aria-pressed')!=='true'))));
document.querySelector('#filter-modal-reset').addEventListener('click',()=>{document.querySelectorAll('.crs-filter-modal input[type=checkbox]').forEach(control=>control.checked=false);document.querySelectorAll('.crs-filter-modal [aria-pressed=true]').forEach(control=>control.setAttribute('aria-pressed','false'));document.querySelector('#filter-modal-body').scrollTo({top:0,behavior:'smooth'});});
`;

const modalCoreCss = `
.crs-modal{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;width:320px;height:470px;max-height:800px;overflow:hidden;border-radius:24px;background:#fff;color:#2c2e34}
.crs-modal[data-device=mobile]{height:454px;max-height:700px;border-radius:24px 24px 0 0}
.crs-modal[data-image=false]{grid-template-rows:auto minmax(0,1fr) auto;height:330px}.crs-modal[data-device=mobile][data-image=false]{height:314px}
.crs-modal__image{display:block;width:100%;height:140px;object-fit:cover}
.crs-modal__image[hidden],.crs-modal__icon[hidden],.crs-modal__button[hidden]{display:none}
.crs-modal__header{display:flex;align-items:flex-start;gap:12px;padding:24px;border-bottom:1px solid #e9e9ea;background:#fff}
.crs-modal__header[data-pin=false]{border-bottom-color:transparent}
.crs-modal__title{flex:1;min-width:0;margin:0;font:600 20px/24px Inter,sans-serif;letter-spacing:-.5px}
.crs-modal__icon{display:grid;flex:none;width:24px;height:24px;padding:0;border:0;background:transparent;color:#a6a7a9;place-items:center}
.crs-modal__icon svg{display:block;width:24px;height:24px}
.crs-modal__back svg{transform:rotate(90deg)}
.crs-modal__body{display:flex;min-height:0;flex-direction:column;gap:16px;padding:0 24px;overflow-x:hidden;overflow-y:auto;scrollbar-color:#a6a7a9 #e9e9ea;scrollbar-width:auto}
.crs-modal__body[data-scroll=false]{overflow-y:hidden}
.crs-modal__body::-webkit-scrollbar{width:16px}.crs-modal__body::-webkit-scrollbar-track{background:#e9e9ea;border:6px solid #fff;border-radius:200px}.crs-modal__body::-webkit-scrollbar-thumb{background:#a6a7a9;border:6px solid #fff;border-radius:200px}
.crs-modal__slot{display:grid;flex:none;gap:4px;font:400 14px/20px Inter,sans-serif}.crs-modal__slot strong{font:600 16px/22px Inter,sans-serif}
.crs-modal__footer{display:flex;gap:8px;padding:24px;border-top:1px solid #e9e9ea;background:#fff}
.crs-modal__footer[data-pin=false]{border-top-color:transparent}
.crs-modal[data-device=mobile] .crs-modal__footer{padding:16px 24px}
.crs-modal__button{flex:1;min-width:0;height:40px;padding:8px 16px;border:0;border-radius:12px;font:600 14px/20px Inter,sans-serif}.crs-modal__button--secondary{background:#f1f1f1;color:#2c2e34}.crs-modal__button--main{background:#2c2e34;color:#fff}
`;
writeFileSync(overlaysCssPath, `${readFileSync(overlaysCssPath, 'utf8')}\n/* v0.2 · base Modal */\n${modalCoreCss}`);

const modalPreviewCss = `
.crs-modal-playground{display:grid;gap:16px;color:#2c2e34;font-family:Inter,sans-serif}
.crs-modal-presets,.crs-modal-controls{display:flex;flex-wrap:wrap;gap:8px;padding:12px;border:1px solid #e1e5ec;border-radius:14px;background:#fff}
.crs-modal-preset{height:36px;padding:8px 12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff;color:#2c2e34;font:600 14px/20px Inter,sans-serif}.crs-modal-preset[aria-pressed=true]{border-color:#94bdfc;background:#eff5ff;color:#346ef4}
.crs-modal-control{display:flex;align-items:center;gap:6px;min-height:28px;padding:0 6px;font:400 13px/20px Inter,sans-serif}.crs-modal-control input{width:16px;height:16px;margin:0}
.crs-modal-open{margin-left:auto;height:36px;padding:8px 12px;border:0;border-radius:12px;background:#2c2e34;color:#fff;font:600 14px/20px Inter,sans-serif}
.crs-modal-stage{position:relative;display:flex;box-sizing:border-box;width:100%;height:520px;align-items:center;justify-content:center;overflow:hidden;background:rgba(0,0,0,.3)}
.crs-modal-stage[data-device=mobile]{align-items:flex-end}
.crs-modal-wrap{position:relative;z-index:2;width:320px}.crs-modal-wrap[hidden]{display:none}
.crs-modal-handle{position:absolute;z-index:3;top:-12px;left:128px;width:64px;height:4px;border-radius:2px;background:#fff}.crs-modal-handle[hidden]{display:none}
.crs-modal__icon:focus-visible,.crs-modal__button:focus-visible,.crs-modal-preset:focus-visible,.crs-modal-open:focus-visible{outline:2px solid #a6a7a9;outline-offset:2px}
`;

function modalMarkup() {
  const slots = Array.from({ length: 6 }, (_, index) => `<section class="crs-modal__slot"><strong>${index + 1}. Заголовок слота</strong><span>Содержимое модального окна размещается в независимом слоте.</span></section>`).join('');
  return `<div class="crs-modal-playground"><div class="crs-modal-presets" role="group" aria-label="Device"><button class="crs-modal-preset" type="button" data-device="desktop" aria-pressed="true">Desktop</button><button class="crs-modal-preset" type="button" data-device="tablet" aria-pressed="false">Tablet</button><button class="crs-modal-preset" type="button" data-device="mobile" aria-pressed="false">Mobile</button><button class="crs-modal-open" id="modal-open" type="button">Открыть Modal</button></div><div class="crs-modal-controls"><label class="crs-modal-control"><input type="checkbox" data-part="image" checked>Изображение</label><label class="crs-modal-control"><input type="checkbox" data-part="back" checked>Back icon</label><label class="crs-modal-control"><input type="checkbox" data-part="right" checked>Right icon</label><label class="crs-modal-control"><input type="checkbox" data-part="pin-header" checked>Pin header</label><label class="crs-modal-control"><input type="checkbox" data-part="scroll" checked>Scroll body</label><label class="crs-modal-control"><input type="checkbox" data-part="pin-footer" checked>Pin footer</label><label class="crs-modal-control"><input type="checkbox" data-part="secondary" checked>Secondary</label><label class="crs-modal-control"><input type="checkbox" data-part="main" checked>Main</label></div><div class="crs-modal-stage" id="modal-stage" data-device="desktop"><div class="crs-modal-wrap" id="modal-wrap"><span class="crs-modal-handle" id="modal-handle" hidden aria-hidden="true"></span><div class="crs-modal" id="modal-target" data-device="desktop" data-image="true" role="dialog" aria-modal="true" aria-labelledby="modal-title"><img class="crs-modal__image" src="ui/assets/images/modal/example.png" alt=""><header class="crs-modal__header" data-pin="true"><button class="crs-modal__icon crs-modal__back" type="button" aria-label="Назад"><svg viewBox="0 0 24 24"><use xlink:href="ui/assets/icons/sprite.svg#arrow-small"></use></svg></button><h2 class="crs-modal__title" id="modal-title">Заголовок Modal</h2><button class="crs-modal__icon crs-modal__right" type="button" aria-label="Дополнительные действия"><svg viewBox="0 0 24 24"><use xlink:href="ui/assets/icons/sprite.svg#more"></use></svg></button></header><div class="crs-modal__body" data-scroll="true">${slots}</div><footer class="crs-modal__footer" data-pin="true"><button class="crs-modal__button crs-modal__button--secondary" type="button">Отмена</button><button class="crs-modal__button crs-modal__button--main" id="modal-done" type="button">Готово</button></footer></div></div></div></div>`;
}

const modalPreviewScript = `
const modalStage=document.querySelector('#modal-stage');
const modalWrap=document.querySelector('#modal-wrap');
const modalTarget=document.querySelector('#modal-target');
const modalHandle=document.querySelector('#modal-handle');
const modalOpen=document.querySelector('#modal-open');
const closeModal=()=>{modalWrap.hidden=true;modalOpen.focus();};
document.querySelectorAll('.crs-modal-preset').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.crs-modal-preset').forEach(item=>item.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');modalStage.dataset.device=button.dataset.device;modalTarget.dataset.device=button.dataset.device;modalHandle.hidden=button.dataset.device!=='mobile';}));
document.querySelectorAll('.crs-modal-control input').forEach(control=>control.addEventListener('change',()=>{const part=control.dataset.part;const target=part==='image'?modalTarget.querySelector('.crs-modal__image'):part==='back'?modalTarget.querySelector('.crs-modal__back'):part==='right'?modalTarget.querySelector('.crs-modal__right'):part==='pin-header'?modalTarget.querySelector('.crs-modal__header'):part==='scroll'?modalTarget.querySelector('.crs-modal__body'):part==='pin-footer'?modalTarget.querySelector('.crs-modal__footer'):part==='secondary'?modalTarget.querySelector('.crs-modal__button--secondary'):modalTarget.querySelector('.crs-modal__button--main');if(['pin-header','pin-footer'].includes(part))target.dataset.pin=String(control.checked);else if(part==='scroll')target.dataset.scroll=String(control.checked);else target.hidden=!control.checked;if(part==='image')modalTarget.dataset.image=String(control.checked);}));
modalOpen.addEventListener('click',()=>{modalWrap.hidden=false;modalTarget.querySelector('.crs-modal__back:not([hidden]),.crs-modal__button:not([hidden])')?.focus();});
modalStage.addEventListener('click',event=>{if(event.target===modalStage)closeModal();});
document.querySelector('#modal-done').addEventListener('click',closeModal);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modalWrap.hidden)closeModal();});
`;

const mobileSheetPreviewCss = `
.crs-sheet-demo{position:relative;width:320px;height:568px;overflow:hidden;background:#fff;color:#2c2e34;font-family:Inter,sans-serif}
.crs-sheet-demo__page{height:100%;background:#f6f7f9}
.crs-sheet-demo__header{height:64px;background:#346ef4}
.crs-sheet-demo__search{height:104px;padding:16px 24px;box-sizing:border-box;background:linear-gradient(#346ef4 0 16px,#fff 16px)}
.crs-sheet-demo__search::before{content:'Поиск курсов';display:flex;align-items:center;height:56px;padding:0 16px;border-radius:12px;background:#fff;color:#909194;font:400 16px/22px Inter,sans-serif}
.crs-sheet-demo__filters{display:flex;height:60px;align-items:center;gap:4px;padding:0 24px;overflow:hidden;background:#fff;border-top:1px solid #e9e9ea}
.crs-sheet-demo__trigger{flex:none;height:36px;padding:8px 12px;border:1px solid #e9e9ea;border-radius:200px;background:#fff;color:#2c2e34;font:400 14px/20px Inter,sans-serif}
.crs-sheet-demo__content{display:grid;gap:12px;padding:24px}
.crs-sheet-demo__line{height:16px;border-radius:8px;background:#e9e9ea}
.crs-sheet-demo__line:nth-child(2){width:72%}
.crs-sort-sheet,.crs-price-sheet{position:absolute;inset:0;z-index:2;height:100%;max-width:none;padding-top:0}
.crs-sort-sheet[hidden],.crs-price-sheet[hidden]{display:none}
.crs-sort-sheet__option:hover{background:#f6f7f9}
.crs-sort-sheet__option:focus-visible,.crs-sheet-demo button:focus-visible,.crs-price-sheet input:focus-visible{outline:2px solid #a6a7a9;outline-offset:-2px}
.crs-price-sheet__panel{flex:none;height:176px}
.crs-price-sheet__footer button{height:40px;min-width:0;padding:8px 16px;border-radius:12px;border:0;font:600 14px/20px Inter,sans-serif}
.crs-price-sheet__reset{flex:1;background:#f1f1f1;color:#2c2e34}
.crs-price-sheet__done{flex:1;background:#2c2e34;color:#fff}
`;

function mobileSheetPage(triggerId, triggerText) {
  return `<div class="crs-sheet-demo__page"><div class="crs-sheet-demo__header" aria-hidden="true"></div><div class="crs-sheet-demo__search" aria-hidden="true"></div><div class="crs-sheet-demo__filters"><button class="crs-sheet-demo__trigger" id="${triggerId}" type="button">${triggerText}</button><button class="crs-sheet-demo__trigger" type="button" tabindex="-1">Школа</button><button class="crs-sheet-demo__trigger" type="button" tabindex="-1">Длительность</button></div><div class="crs-sheet-demo__content" aria-hidden="true"><span class="crs-sheet-demo__line"></span><span class="crs-sheet-demo__line"></span></div></div>`;
}

function sortSheetMarkup() {
  const options = ['По популярности', 'Сначала дорогие', 'Сначала дешевые', 'По дате начала', 'Сначала короткие', 'Сначала длинные'];
  return `<div class="crs-sheet-demo">${mobileSheetPage('sort-sheet-open', 'Сортировка')}<div class="crs-sort-sheet" id="sort-sheet-target"><div class="crs-sort-sheet__panel" role="listbox" aria-label="Сортировка"> <span class="crs-sort-sheet__handle" aria-hidden="true"></span>${options.map((option, index) => `<button type="button" class="crs-sort-sheet__option" role="option" aria-selected="${index === 0}">${option}</button>`).join('')}</div></div></div>`;
}

const sortSheetPreviewScript = `
const sortSheet=document.querySelector('#sort-sheet-target');
const sortSheetTrigger=document.querySelector('#sort-sheet-open');
const openSortSheet=()=>{sortSheet.hidden=false;sortSheet.querySelector('[aria-selected=true]')?.focus();};
const closeSortSheet=()=>{sortSheet.hidden=true;sortSheetTrigger.focus();};
sortSheetTrigger.addEventListener('click',openSortSheet);
sortSheet.addEventListener('click',event=>{if(event.target===sortSheet)closeSortSheet();});
sortSheet.querySelectorAll('[role=option]').forEach(option=>option.addEventListener('click',()=>{sortSheet.querySelectorAll('[role=option]').forEach(item=>item.setAttribute('aria-selected','false'));option.setAttribute('aria-selected','true');sortSheetTrigger.textContent=option.textContent;closeSortSheet();}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!sortSheet.hidden)closeSortSheet();});
`;

function priceSheetMarkup() {
  return `<div class="crs-sheet-demo">${mobileSheetPage('price-sheet-open', 'Цена')}<div class="crs-price-sheet" id="price-sheet-target"><div class="crs-price-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="price-sheet-title"><span class="crs-price-sheet__handle" aria-hidden="true"></span><h2 class="crs-price-sheet__title" id="price-sheet-title">Цена</h2><div class="crs-price-sheet__body"><label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" id="price-sheet-from" type="text" inputmode="numeric" placeholder="От" aria-label="Цена от"></label><label class="crs-price-sheet__field crs-price-sheet__field--grow"><input class="crs-price-sheet__input" type="text" inputmode="numeric" placeholder="До" aria-label="Цена до"></label><button class="crs-price-sheet__field crs-price-sheet__field--currency" type="button" aria-label="Валюта: рубли"><span class="crs-price-sheet__currency">₽</span><span class="crs-price-sheet__chevron"><svg class="svg-icon" width="24" height="24" viewBox="0 0 24 24"><use xlink:href="ui/assets/icons/sprite.svg#arrow-small"></use></svg></span></button></div><div class="crs-price-sheet__footer"><button class="crs-price-sheet__reset" id="price-sheet-reset" type="button">Сбросить</button><button class="crs-price-sheet__done" id="price-sheet-done" type="button">Готово</button></div></div></div></div>`;
}

const priceSheetPreviewScript = `
const priceSheet=document.querySelector('#price-sheet-target');
const priceSheetTrigger=document.querySelector('#price-sheet-open');
const openPriceSheet=()=>{priceSheet.hidden=false;document.querySelector('#price-sheet-from').focus();};
const closePriceSheet=()=>{priceSheet.hidden=true;priceSheetTrigger.focus();};
priceSheetTrigger.addEventListener('click',openPriceSheet);
priceSheet.addEventListener('click',event=>{if(event.target===priceSheet)closePriceSheet();});
document.querySelector('#price-sheet-reset').addEventListener('click',()=>{priceSheet.querySelectorAll('input').forEach(input=>input.value='');document.querySelector('#price-sheet-from').focus();});
document.querySelector('#price-sheet-done').addEventListener('click',closePriceSheet);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!priceSheet.hidden)closePriceSheet();});
`;

const sectionPreviewCss = `
.crs-section-demo{display:flex;flex-direction:column;gap:16px;width:100%}
.crs-section-demo h2{margin:0;font-size:28px;line-height:32px;font-weight:600}
.crs-section-demo__content{display:grid;gap:8px;min-height:144px;padding:24px;border:1px dashed var(--color-ui-black-300);border-radius:24px;background:var(--color-ui-black-50);align-content:center}
.crs-section-demo__content strong{font-size:16px;line-height:20px}
.crs-section-demo__content p{max-width:560px;margin:0;color:var(--color-ui-black-500);font-size:14px;line-height:20px}
@media(max-width:479px){.crs-section-demo h2{font-size:24px;line-height:28px}.crs-section-demo__content{min-height:120px;padding:20px;border-radius:20px}}
`;

function sectionMarkup() {
  return `<section class="crs-section-demo flex flex-col gap-4"><h2 class="m-0 text-h2 font-semibold">Заголовок секции</h2><div class="crs-section-demo__content"><strong>Область содержимого</strong><p>Здесь размещается самостоятельный блок страницы: карточки, форма, подборка или таблица. Конкретное содержимое документируется отдельным компонентом.</p></div></section>`;
}

const avatarSizes = [100, 68, 56, 48, 40, 36, 32, 24];
const schoolAvatarRadii = { 100: 24, 68: 16, 56: 12, 48: 12, 40: 12, 36: 12, 32: 8, 24: 6 };
const avatarPreviewCss = `
.crs-avatar-scale{display:flex;align-items:flex-end;flex-wrap:wrap;gap:20px;padding:4px;font-family:Inter,sans-serif}
.crs-avatar-sample{display:grid;justify-items:center;gap:8px;color:#697386;font-size:11px;line-height:16px}
.crs-avatar-default--user{display:block;width:var(--avatar-size);height:var(--avatar-size);object-fit:cover;overflow:hidden;border-radius:200px}
`;

function avatarScaleMarkup(type) {
  const isUser = type === 'user';
  const source = isUser ? 'ui/assets/images/avatar-default-user.svg' : 'ui/assets/images/avatar-default-company.svg';
  return `<div class="crs-avatar-scale">${avatarSizes.map(size => `<span class="crs-avatar-sample">
    <img class="crs-avatar-default crs-avatar-default--${type}${isUser ? '' : ' crs-entity-logo'}"${isUser ? ` style="--avatar-size:${size}px;"` : ` data-component="entity-logo" data-size="${size}"`} src="${source}" alt="">
    <span>${size}×${size}${isUser ? '' : ` · r${schoolAvatarRadii[size]}`}</span>
  </span>`).join('')}</div>`;
}

const searchFormPreviewCss = `
html,body{background:#fff}body{padding:0!important}
.crs-search-form-demo{box-sizing:border-box;display:flex;width:100%;height:300px;align-items:center;padding:24px;background-image:var(--color-main-gradient-second);font-family:Inter,sans-serif}
.crs-search-form{display:grid;grid-template-columns:minmax(0,1fr) max-content;gap:8px;width:100%;max-width:1076px;margin:0 auto}
.crs-search-form__fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-radius:12px}
.crs-search-form__select{height:56px;border:1px solid #e9e9ea;border-radius:0;background:#fff}
.crs-search-form__select:first-child{border-radius:12px 0 0 12px}
.crs-search-form__select:last-child{border-radius:0 12px 12px 0}
.crs-search-form__select+.crs-search-form__select{width:calc(100% + 1px);margin-left:-1px}
.crs-search-form__select:hover{background:#f8f8f8}
.crs-search-form__select:focus-visible{position:relative;z-index:1;outline:0;box-shadow:inset 0 0 0 1px #2c2e34}
.crs-search-form__submit{box-sizing:border-box;height:56px;padding:12px 24px;border:1px solid #2c2e34;border-radius:12px;background:#2c2e34;color:#fff;font:600 16px/22px Inter,sans-serif;white-space:nowrap;cursor:pointer}
.crs-search-form__submit:hover{opacity:.9}.crs-search-form__submit:focus-visible{outline:2px solid #fff;outline-offset:2px}
@media(max-width:479px){.crs-search-form{grid-template-columns:minmax(0,1fr);gap:16px}.crs-search-form__fields{grid-template-columns:minmax(0,1fr)}.crs-search-form__select:first-child{border-radius:12px 12px 0 0}.crs-search-form__select:last-child{border-radius:0 0 12px 12px}.crs-search-form__select+.crs-search-form__select{width:100%;margin-top:-1px;margin-left:0}.crs-search-form__submit{width:100%}}
`;

function searchFormSelect(label) {
  return `<button type="button" class="crs-field crs-field--select crs-search-form__select" data-size="xl" data-state="default" data-filled="false" data-open="false" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}"><span class="crs-field__text">${label}</span>${fieldIcon('arrow-small')}</button>`;
}

function searchFormMarkup() {
  return `<div class="crs-search-form-demo"><form class="crs-search-form" role="search"><div class="crs-search-form__fields">${searchFormSelect('Организация')}${searchFormSelect('Что изучить?')}${searchFormSelect('Тип')}</div><button class="crs-search-form__submit" type="submit">Найти организации</button></form></div>`;
}

function examplesFor(record, normalizedKind, presentation) {
  const examplePath = `examples/components/${record.id}/index.html`;
  if (record.id === 'search-form') return [{
    id: 'select-xl-group',
    title: 'SearchForm · группа Select XL',
    file: examplePath,
    html: searchFormMarkup(),
    previewCss: `${figmaFieldPreviewCss}\n${searchFormPreviewCss}`,
    previewScript: `document.querySelector('.crs-search-form').addEventListener('submit',event=>event.preventDefault());`,
    covers: ['default', 'desktop', 'mobile', 'select-xl', 'joined-fields', 'full-width-action'],
    preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 300 },
    authority: ['production', 'figma'],
    scope: 'mixed-evidence',
  }];
  if (record.id === 'rubrication-bar') return [{
    id: 'production-context',
    title: 'RubricationBar · контекст страницы курсов',
    file: examplePath,
    html: `<div class="crs-rubrication-demo"><div class="crs-rubrication-demo__container">${record.markup.html}</div></div>`,
    previewCss: `
html,body{background:#fff}body{padding:0!important}
.crs-rubrication-demo{box-sizing:border-box;width:100%;background-image:var(--color-main-gradient-second)}
.crs-rubrication-demo__container{box-sizing:border-box;width:100%;max-width:1124px;margin:0 auto;padding:0 24px}
`,
    covers: ['default', 'desktop', 'mobile', 'horizontal-scroll'],
    preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 40 },
    authority: ['production'],
    scope: 'public-guest',
  }];
  if (record.id === 'modal') return [{
    id: 'playground',
    title: 'Modal · варианты и поведение',
    file: examplePath,
    html: modalMarkup(),
    previewCss: modalPreviewCss,
    previewScript: modalPreviewScript,
    covers: ['default', 'open', 'closed', 'scroll', 'desktop', 'tablet', 'mobile', 'image', 'header-actions', 'pinned-header', 'pinned-footer', 'primary', 'secondary'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['figma'],
    scope: 'design-source-only',
  }];
  if (record.id === 'promo-code-modal') return [{
    id: 'content-variants',
    title: 'Modal use case · промокод и акция',
    file: examplePath,
    html: record.markup.html,
    covers: ['default', 'open', 'promo-code', 'promotion'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['figma'],
    scope: 'design-source-only',
  }];
  if (figmaControlIds.has(record.id)) return [{
    id: 'states',
    title: `${record.name} · состояния и группы`,
    file: examplePath,
    html: controlFamilyMarkup(record.id),
    previewCss: figmaControlPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'checked', 'disabled', 'loading', ...(['checkbox', 'radio-button'].includes(record.id) ? ['vertical-list', 'horizontal-list'] : [])],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: record.id === 'radio-button' ? ['figma'] : ['storybook', 'figma'],
    scope: 'design-source-only',
  }];
  if (figmaFieldIds.has(record.id)) return [{
    id: 'field-family',
    title: `${record.name} · размеры и состояния`,
    file: examplePath,
    html: fieldFamilyMarkup(record.id),
    previewCss: figmaFieldPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'disabled', 'invalid', ...(['select', 'multi-select'].includes(record.id) ? ['open'] : []), ...(record.id === 'textarea' ? [] : ['size-m', 'size-xl'])],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: record.id === 'textarea' ? ['figma'] : ['production', 'figma'],
    scope: record.id === 'textarea' ? 'design-source-only' : 'mixed-evidence',
  }];
  if (record.id === 'icon-button') return [{
    id: 'states',
    title: 'Состояния IconButton',
    file: examplePath,
    html: iconButtonStatesMarkup(),
    previewCss: iconButtonPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'disabled', 'loading'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 620 },
    authority: ['production', 'figma'],
    scope: 'mixed-evidence',
  }];
  if (record.id === 'tab') return [{
    id: 'filter-chip-variants',
    title: 'FilterChip · Menu / Switch',
    file: examplePath,
    html: filterChipFamilyMarkup(),
    previewCss: filterChipPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading', 'open', 'icon-left', 'switch-right'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['figma'],
    scope: 'design-source-only',
  }];
  if (record.id === 'segmented-control') return [{
    id: 'hero-tabs',
    title: 'HeroTabs · состояния',
    file: examplePath,
    html: contextualTabsMarkup('hero'),
    previewCss: contextualTabsPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['production', 'figma'],
    scope: 'mixed-evidence',
  }];
  if (record.id === 'button-group') return [{
    id: 'page-tabs',
    title: 'PageTabs · состояния',
    file: examplePath,
    html: contextualTabsMarkup('page'),
    previewCss: contextualTabsPreviewCss,
    covers: ['default', 'hover', 'focus-visible', 'selected', 'disabled', 'loading'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['figma'],
    scope: 'design-source-only',
  }];
  if (record.id === 'avatar' || record.id === 'entity-logo') {
    const isUser = record.id === 'avatar';
    const asset = isUser ? 'avatar-default-user.svg' : 'avatar-default-company.svg';
    return [
      {
        id: 'sizes',
        title: 'Дефолт · все размеры',
        file: `examples/components/${record.id}/sizes.html`,
        html: avatarScaleMarkup(isUser ? 'user' : 'school'),
        previewCss: avatarPreviewCss,
        covers: ['empty', 'size-scale'],
        preview: { mode: 'intrinsic' },
        presentation: { layout: 'constrained', width: 720 },
        authority: ['figma'],
      },
      {
        id: 'production-context',
        title: 'Production-контекст',
        file: examplePath,
        html: record.markup.html.replace('ui/assets/images/content-placeholder.svg', `ui/assets/images/${asset}`),
        covers: record.states?.captured || ['default'],
        preview: { mode: 'intrinsic' },
        ...(presentation ? { presentation } : {}),
        authority: ['production'],
      },
    ];
  }
  if (record.id === 'site-header') return [{
      id: 'figma-variants',
      title: 'Все варианты SiteHeader',
      file: examplePath,
      html: siteHeaderMarkup(),
      previewCss: siteHeaderPreviewCss,
      previewScript: siteHeaderPreviewScript,
      covers: ['listing-hero', 'listing-page', 'listing-page-sticky', 'courses-hero', 'courses-page', 'courses-page-sticky', 'simple-page', 'mobile', 'tablet', 'desktop'],
      preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 960 },
      authority: ['figma'],
      scope: 'design-source-only',
    }];
  if (record.id === 'header-dropdown') return [{
    id: 'states',
    title: 'Открытие и закрытие',
    file: examplePath,
    html: headerDropdownMarkup(record.markup.html),
    previewCss: headerDropdownPreviewCss,
    previewScript: headerDropdownPreviewScript,
    covers: ['default', 'hover', 'focus-visible', 'open', 'closed'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 320 },
    authority: ['production'],
    scope: 'public-guest',
  }];
  if (record.id === 'ad-slot') return [{
    id: 'carousel',
    title: 'Баннерная карусель',
    file: examplePath,
    html: adSlotMarkup(),
    previewCss: adSlotPreviewCss,
    covers: ['default'],
    preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 360 },
    authority: ['production'],
    scope: 'public-guest',
  }];
  if (record.id === 'sort-sheet' || record.id === 'price-sheet') {
    const isSort = record.id === 'sort-sheet';
    return [{
      id: 'mobile-flow',
      title: `${record.name} · мобильный сценарий`,
      file: examplePath,
      html: isSort ? sortSheetMarkup() : priceSheetMarkup(),
      previewCss: mobileSheetPreviewCss,
      previewScript: isSort ? sortSheetPreviewScript : priceSheetPreviewScript,
      covers: ['default', 'open', 'closed', ...(isSort ? ['selected'] : ['reset', 'submit'])],
      preview: { mode: 'intrinsic' },
      presentation: { layout: 'context', width: 320, height: 568 },
      authority: ['figma'],
      scope: 'design-source-only',
    }];
  }
  if (record.id === 'filter-modal') return [{
    id: 'responsive',
    title: 'Responsive и скролл содержимого',
    file: examplePath,
    html: filterModalMarkup(),
    previewCss: filterModalPreviewCss,
    previewScript: filterModalPreviewScript,
    covers: ['default', 'open', 'closed', 'body-scroll', 'mobile', 'desktop'],
    preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 620 },
    authority: ['figma'],
    scope: 'design-source-only',
  }];
  if (record.id === 'section') return [{
    id: 'anatomy',
    title: 'Анатомия Section',
    file: examplePath,
    html: sectionMarkup(),
    previewCss: sectionPreviewCss,
    covers: ['default'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['production'],
    scope: 'public-guest',
  }];
  if (record.id !== 'button') return [{
    id: 'default',
    title: 'Зафиксированный вариант',
    file: examplePath,
    html: record.markup.html,
    covers: record.states?.captured || ['default'],
    preview: normalizedKind === 'module'
      ? { mode: 'viewport', widths: [320, 480, 768, 1024], height: 640 }
      : { mode: 'intrinsic' },
    ...(presentation ? { presentation } : {}),
  }];

  return [{
    id: 'playground',
    title: 'Интерактивный Button',
    file: examplePath,
    html: buttonPlaygroundMarkup(),
    previewCss: figmaButtonPreviewCss,
    previewScript: buttonPlaygroundScript,
    covers: ['default', 'hover', 'focus-visible', 'disabled', 'loading'],
    preview: { mode: 'intrinsic' },
    presentation: { layout: 'constrained', width: 720 },
    authority: ['production', 'figma'],
    scope: 'mixed-evidence',
  }];
}

function exampleHtml(record, presentation, markupHtml = record.markup.html, previewCss = '', previewScript = '') {
  const html = markupHtml
    .replaceAll('src="ui/assets/', 'src="../../../ui/assets/')
    .replaceAll("src='ui/assets/", "src='../../../ui/assets/")
    .replaceAll('href="ui/assets/', 'href="../../../ui/assets/')
    .replaceAll('xlink:href="ui/assets/', 'xlink:href="../../../ui/assets/');
  const edgeToEdge = record.category === 'frame-modules' || record.id === 'filter-modal' ? '0' : '24px';
  const cardIds = new Set(['course-card', 'school-card', 'promo-card', 'review-card', 'article-card', 'person-card', 'step-card', 'ad-card', 'profession-card', 'vacancy-card']);
  let rootConstraint = cardIds.has(record.id) ? '.example-root{max-width:260px}' : '';
  if (presentation?.layout === 'fit-content') rootConstraint = '.example-root{display:flow-root;width:fit-content;max-width:100%}';
  if (presentation?.layout === 'constrained') rootConstraint = `.example-root{width:min(${presentation.width}px,100%)}`;
  if (presentation?.layout === 'canvas') rootConstraint = `.example-root{width:min(${presentation.width}px,100%)}`;
  if (presentation?.layout === 'context') {
    const contextOffsets = record.id === 'entity-logo'
      ? 'margin-top:20px'
      : record.id === 'icon-button'
        ? 'margin-left:16px'
        : ['sort-sheet', 'price-sheet'].includes(record.id)
          ? 'margin-left:auto;margin-right:auto'
        : '';
    rootConstraint = `.example-root{position:relative;width:${presentation.width}px;height:${presentation.height}px;${contextOffsets}}`;
  }
  const baselineReset = baselineSensitiveIds.has(record.id) ? '.example-root{line-height:0}' : '';
  const isolatedMarginReset = presentation ? '.example-root>:first-child{margin:0!important}' : '';
  const isolatedWidthReset = record.id === 'chip' ? '.example-root>:first-child{max-width:none!important}' : '';
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${displayTitleFor(record)} — Хабр Курсы</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../../../ui/courses.css">
  <style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:${edgeToEdge}}${rootConstraint}${baselineReset}${isolatedMarginReset}${isolatedWidthReset}${previewCss}</style>
</head>
<body data-preview-layout="${presentation?.layout || 'viewport'}"><div class="example-root">${html}</div>${previewScript ? `<script>${previewScript}</script>` : ''}</body>
</html>
`;
}

const foundationCss = `
.foundation-preview{display:grid;gap:20px;color:#2c2e34;font-family:Inter,sans-serif}
.foundation-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:12px}
.foundation-card{min-width:0;padding:12px;border:1px solid #e9e9ea;border-radius:12px;background:#fff}
.foundation-card strong,.foundation-card small{display:block;overflow-wrap:anywhere}
.foundation-card strong{font-size:13px;line-height:18px}.foundation-card small{margin-top:3px;color:#6b7280;font-size:11px;line-height:15px}
.foundation-swatch{height:56px;margin:-4px -4px 10px;border:1px solid rgba(0,0,0,.08);border-radius:8px;background:var(--swatch)}
.foundation-type{display:grid;gap:16px}.foundation-type__row{display:grid;grid-template-columns:100px minmax(0,1fr);gap:16px;align-items:baseline;padding-bottom:12px;border-bottom:1px solid #e9e9ea}.foundation-type__row code{color:#697386;font-size:11px}
.foundation-font-rule{display:grid;gap:4px;padding:16px;border:1px solid #94bdfc;border-radius:12px;background:#eff5ff}.foundation-font-rule strong{font-size:20px;line-height:24px}.foundation-font-rule span{color:#596170;font-size:13px;line-height:18px}
.foundation-scale{display:grid;gap:10px}.foundation-scale__row{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;align-items:center}.foundation-scale__bar{height:12px;width:min(calc(var(--value) * 4),100%);min-width:var(--value);border-radius:3px;background:#346ef4}
.foundation-radius{height:72px;border:2px solid #346ef4;border-radius:var(--radius);background:#eff5ff}
.foundation-icons{grid-template-columns:repeat(auto-fit,minmax(96px,1fr))}.foundation-icon{display:grid;place-items:center;gap:8px;min-height:92px;text-align:center}.foundation-icon svg{width:24px;height:24px;color:#2c2e34}.foundation-icon small{font-size:10px}
.foundation-breakpoints{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.foundation-range{display:inline-block;margin-bottom:10px;padding:5px 8px;border-radius:999px;background:#eff5ff;color:#2755e9;font:700 12px/16px Inter,sans-serif}
@media(max-width:480px){.foundation-type__row{grid-template-columns:1fr;gap:6px}.foundation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.foundation-breakpoints{grid-template-columns:1fr}}
`;

function foundationExampleHtml(title, markup) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Хабр Курсы</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../../../ui/courses.css">
  <style>html,body{margin:0;background:#fff}body{box-sizing:border-box;padding:24px}.example-root{width:min(720px,100%)}${foundationCss}</style>
</head>
<body data-preview-layout="constrained"><div class="example-root"><div class="foundation-preview">${markup}</div></div></body>
</html>
`;
}

const colorCards = Object.entries(tokens.color).map(([id, token]) => {
  const cssVar = token.$extensions?.guide?.cssVar || id;
  return `<div class="foundation-card"><div class="foundation-swatch" style="--swatch:${token.$value}"></div><strong>${id}</strong><small>${token.$value} · ${cssVar}</small></div>`;
}).join('');
const gradientCards = Object.entries(tokens.gradient || {}).map(([id, token]) => `<div class="foundation-card"><div class="foundation-swatch" style="--swatch:${token.$value}"></div><strong>${id}</strong><small>${token.$value}</small></div>`).join('');

const typeRows = [
  ['text-h1', '44 / 48', 'Заголовок H1'],
  ['text-h1-mobile', '30 / 34', 'Мобильный H1'],
  ['text-h2', '24 / 28', 'Заголовок H2'],
  ['text-h3', '20 / 24', 'Заголовок H3'],
  ['text-h4', '18 / 22', 'Заголовок H4'],
  ['text-base', '16 / 20', 'Основной текст'],
  ['text-sm', '14 / 20', 'Вспомогательный текст'],
].map(([className, metrics, label]) => `<div class="foundation-type__row"><code>.${className}<br>${metrics}</code><div class="${className}">${label}</div></div>`).join('');

const spacingValues = [2, 4, 6, 8, 10, 12, 16, 20, 24, 40, 48];
const spacingRows = spacingValues.map(value => `<div class="foundation-scale__row"><strong>${value} px</strong><div class="foundation-scale__bar" style="--value:${value}px"></div></div>`).join('');
const radiusValues = [['none', 0], ['md', 6], ['lg', 8], ['xl', 12], ['14px', 14], ['2xl', 16], ['3xl', 24], ['full', 9999]];
const radiusCards = radiusValues.map(([name, value]) => `<div class="foundation-card"><div class="foundation-radius" style="--radius:${value}px"></div><strong>${name}</strong><small>${value === 9999 ? '9999 px' : `${value} px`}</small></div>`).join('');
const iconNames = ['accreditation', 'arrow-large', 'arrow-small', 'building', 'comment', 'cross-large', 'more', 'percents', 'search', 'star-empty', 'star-rounded', 'catalog'];
const iconCards = iconNames.map(name => `<div class="foundation-card foundation-icon"><svg class="svg-icon" aria-hidden="true"><use xlink:href="../../../ui/assets/icons/sprite.svg#${name}"></use></svg><small>${name}</small></div>`).join('');
const breakpointCards = [
  ['small-phone', '≤ 479 px', 'Самые узкие телефоны'],
  ['phone', '≤ 767 px', 'Мобильная оболочка и одноколоночные сетки'],
  ['tablet-only', '768–1023 px', 'Только планшетный диапазон'],
  ['phablet-and-tablet', '480–1023 px', 'Общий промежуточный диапазон'],
  ['desktop', '≥ 1024 px', 'Десктопная компоновка'],
].map(([name, range, description]) => `<div class="foundation-card"><span class="foundation-range">${range}</span><strong>${name}:</strong><small>${description}</small></div>`).join('');

const foundations = [
  {
    id: 'colors', title: 'Цвета', group: 'tokens', groupTitle: 'Токены', source: 'docs/guide/tokens.md',
    purpose: 'Цветовая система Курсов: нейтральная и синяя шкалы, статусные и дополнительные оттенки, сервисные цвета и градиенты.',
    markup: `<div class="foundation-grid">${colorCards}${gradientCards}</div>`, cssRoots: ['tokens'], authority: ['production', 'figma'], confidence: 'high',
  },
  {
    id: 'typography', title: 'Типографика', group: 'tokens', groupTitle: 'Токены', source: 'docs/guide/typography.md',
    purpose: 'Inter — единственный интерфейсный шрифт Courses. Живая типографическая шкала фиксирует размеры, интерлиньяж и мобильную ступень заголовка.',
    markup: `<div class="foundation-type"><div class="foundation-font-rule"><strong>Inter — единый шрифт Courses</strong><span>Все страницы, компоненты и живые примеры · fallback только sans-serif · monospace только для code/pre/kbd/samp</span></div>${typeRows}</div>`, cssRoots: ['fonts', 'foundations'], authority: ['production', 'figma'], confidence: 'high',
  },
  {
    id: 'spacing-grid', title: 'Отступы и сетка', group: 'geometry', groupTitle: 'Геометрия', source: 'docs/guide/layout.md',
    purpose: 'Наблюдаемая шкала отступов и базовые правила контейнера и сетки страниц.',
    markup: `<div class="foundation-scale">${spacingRows}</div>`, cssRoots: ['layout', 'utilities-components'], authority: ['production'], confidence: 'high',
    note: 'Это наблюдаемые значения utility-классов, а не опубликованный набор design tokens.',
  },
  {
    id: 'radii-borders', title: 'Скругления и границы', group: 'geometry', groupTitle: 'Геометрия', source: 'docs/guide/tokens.md',
    purpose: 'Наблюдаемая шкала скруглений и толщин границ, реально используемых компонентами Курсов.',
    markup: `<div class="foundation-grid">${radiusCards}</div>`, cssRoots: ['utilities-components'], authority: ['production'], confidence: 'high',
    note: 'Радиусы и границы не входят в слой токенов v0.2; показаны значения из восстановленных utility-классов.',
  },
  {
    id: 'iconography', title: 'Иконография', group: 'media', groupTitle: 'Графика', source: 'guide/components/data-display/sprite-icon.md',
    purpose: 'Подтверждённые в снятом production-наборе монохромные символы общего SVG-спрайта.',
    markup: `<div class="foundation-grid foundation-icons">${iconCards}</div>`, cssRoots: ['svg-icon'], authority: ['production', 'figma'], confidence: 'medium',
    note: 'Показаны 13 символов, подтверждённых на десяти снятых страницах; полный Storybook-набор шире.',
  },
  {
    id: 'responsive-layout', title: 'Адаптивность и брейкпоинты', group: 'layout', groupTitle: 'Раскладка', source: 'docs/guide/layout.md',
    purpose: 'Границы адаптивных диапазонов и базовые правила контейнера, мобильной оболочки и сеток.',
    markup: `<div class="foundation-grid foundation-breakpoints">${breakpointCards}</div>`, cssRoots: ['layout'], authority: ['production'], confidence: 'high',
  },
];

for (const foundation of foundations) {
  const specPath = `machine/foundations/${foundation.id}.json`;
  const examplePath = `examples/foundations/${foundation.id}/index.html`;
  mkdirSync(dirname(join(root, examplePath)), { recursive: true });
  writeFileSync(join(root, examplePath), foundationExampleHtml(foundation.title, foundation.markup));
  const item = {
    $schema: '../../schema.json',
    id: foundation.id,
    title: foundation.title,
    kind: 'foundation',
    category: foundation.group,
    maturity: { spec: 'complete', markup: 'available' },
    knowledge: { authority: foundation.authority, confidence: foundation.confidence, scope: 'public-guest' },
    purpose: foundation.purpose,
    implementation: { markup: 'available-in-examples', cssRoots: foundation.cssRoots, styles: ['ui/courses.css'], scripts: [] },
    states: { ui: [], feature: [], domain: [] },
    rules: [],
    examples: [{ id: 'overview', title: 'Обзор', file: examplePath, covers: ['foundation'], preview: { mode: 'intrinsic' }, presentation: { layout: 'constrained', width: 720 } }],
    previewNotes: foundation.note ? [{ type: 'coverage-warning', text: foundation.note }] : [],
    accessibility: ['Визуальные образцы справочные; значения и названия продублированы текстом.'],
    evidence: [{ type: 'production', ref: foundation.source }],
    unknowns: [],
    source: { version: 'v0.2', spec: foundation.source },
  };
  writeJson(join(root, specPath), item);
  catalog.push({
    id: foundation.id,
    title: foundation.title,
    kind: 'foundation',
    category: foundation.group,
    navSection: 'foundations',
    navSectionTitle: 'Основы',
    navGroup: foundation.group,
    navGroupTitle: foundation.groupTitle,
    file: specPath,
    tags: [foundation.id, foundation.title, 'foundation', foundation.group, ...foundation.cssRoots],
  });
}

for (const record of components) {
  const normalizedKind = record.kind === 'module' ? 'module' : 'component';
  const presentation = presentationFor(record, normalizedKind);
  const hasMarkup = Boolean(record.markup?.html);
  const hasFigmaAvatarScale = ['avatar', 'entity-logo'].includes(record.id);
  const hasFigmaStateReference = record.id === 'icon-button';
  const hasFigmaFieldReference = figmaFieldIds.has(record.id);
  const hasFigmaControlReference = figmaControlIds.has(record.id);
  const hasFigmaNavigationStateReference = ['tab', 'segmented-control', 'button-group'].includes(record.id);
  const hasFigmaHeaderReference = record.id === 'site-header';
  const hasFigmaFilterModalReference = record.id === 'filter-modal';
  const hasFigmaMobileSheetReference = ['sort-sheet', 'price-sheet'].includes(record.id);
  const hasFigmaBaseModalReference = record.id === 'modal';
  const hasFigmaSearchFormReference = record.id === 'search-form';
  const specPath = `machine/components/${record.id}.json`;
  const generatedExamples = hasMarkup ? examplesFor(record, normalizedKind, presentation) : [];
  const stateValues = [
    ...(record.states?.required || []),
    ...(record.states?.captured || []),
    ...(record.states?.normative || []),
    ...(record.states?.uncaptured || []),
  ];
  stateValues.forEach(value => allStateNames.add(value));

  if (hasMarkup) {
    for (const example of generatedExamples) {
      const absoluteExample = join(root, example.file);
      mkdirSync(dirname(absoluteExample), { recursive: true });
      writeFileSync(absoluteExample, exampleHtml(record, example.presentation, example.html, example.previewCss, example.previewScript));
    }
  }

  const figmaResolvedStates = hasFigmaFieldReference
    ? new Set([...(record.id === 'multi-select' ? ['checked'] : []), ...(['select', 'multi-select'].includes(record.id) ? ['open'] : []), 'disabled', 'invalid'])
    : hasFigmaControlReference
      ? new Set(['hover', 'focus-visible', 'checked', 'disabled', 'loading'])
      : hasFigmaNavigationStateReference
        ? new Set(['hover', 'focus-visible', 'selected', 'disabled', 'loading', ...(record.id === 'tab' ? ['open'] : [])])
      : new Set();
  const unresolvedStates = (record.states?.uncaptured || []).filter(state => !figmaResolvedStates.has(state) && !(record.id === 'icon-button' && state === 'disabled'));
  const unknowns = [
    ...(record.limits || []).filter(limit => !(hasFigmaFieldReference && limit.startsWith('**Не снятые состояния.**')) && !(hasFigmaNavigationStateReference && ['**Корень введён пакетом.**', '**Тексты.**', '**Ассеты.**', '**Состояния.**'].some(prefix => limit.startsWith(prefix)))),
    ...(record.sourceConflicts || []).map(conflict => `${conflict.ref}: ${conflict.summary}`),
    ...(unresolvedStates.length ? [`Не снятые состояния: ${unresolvedStates.join(', ')}.`] : []),
  ];
  if (!hasMarkup) unknowns.push(record.markupNote || 'Разметка не зафиксирована.');

  const item = {
    $schema: '../../schema.json',
    id: record.id,
    title: displayTitleFor(record),
    kind: normalizedKind,
    category: record.category,
    maturity: {
      spec: record.status === 'complete' ? 'complete' : 'partial',
      markup: hasMarkup ? 'available' : 'missing',
    },
    knowledge: {
      authority: ['textarea', 'radio-button', 'tab', 'button-group'].includes(record.id) || hasFigmaFilterModalReference ? ['figma'] : hasFigmaControlReference ? ['storybook', 'figma'] : record.id === 'button' || hasFigmaAvatarScale || hasFigmaStateReference || hasFigmaFieldReference || hasFigmaNavigationStateReference || hasFigmaHeaderReference || hasFigmaSearchFormReference ? ['production', 'figma'] : record.sourceScope === 'production' ? ['production'] : record.sourceScope === 'figma-only' ? ['figma'] : ['storybook'],
      confidence: record.status === 'complete' ? 'high' : 'medium',
      scope: ['textarea', 'radio-button', 'tab', 'button-group'].includes(record.id) || hasFigmaFilterModalReference ? 'design-source-only' : record.id === 'button' || hasFigmaAvatarScale || hasFigmaStateReference || hasFigmaFieldReference || hasFigmaNavigationStateReference || hasFigmaHeaderReference || hasFigmaSearchFormReference ? 'mixed-evidence' : record.sourceScope === 'production' ? 'public-guest' : 'design-source-only',
    },
    purpose: purposeFor(record),
    implementation: hasMarkup ? {
      markup: 'available-in-examples',
      cssRoots: record.id === 'search-input' ? ['wrapper', 'wrapper--with-search'] : record.cssRoots || [],
      styles: ['ui/courses.css'],
      scripts: [],
    } : {
      markup: null,
      missingReason: record.markupNote || 'Разметку раскладывает невендоренная библиотека.',
      fallback: `Использовать спецификацию guide/${record.spec}; не восстанавливать DOM по внешнему виду.`,
      cssRoots: record.id === 'search-input' ? ['wrapper', 'wrapper--with-search'] : record.cssRoots || [],
      styles: ['ui/courses.css'],
      scripts: [],
    },
    states: { ui: [...new Set([...(record.states?.required || []), ...(['button', 'icon-button'].includes(record.id) || hasFigmaControlReference || hasFigmaNavigationStateReference ? ['loading'] : []), ...(hasFigmaFieldReference ? ['error'] : []), ...(hasFigmaNavigationStateReference ? ['selected', 'disabled'] : []), ...(record.id === 'tab' ? ['open'] : [])])], feature: [], domain: [] },
    rules: (record.rules || []).map(rulePath),
    examples: generatedExamples.map(({ html, previewCss, previewScript, ...example }) => example),
    ...(record.id === 'button' ? { variantMatrix: buttonVariantMatrix } : {}),
    ...(hasFigmaHeaderReference ? { variantMatrix: {
      families: {
        listing: { name: 'ListingHeader', levels: ['hero', 'page'], sticky: ['page'] },
        courses: { name: 'CoursesHeader', levels: ['hero', 'page'], sticky: ['page'] },
        simple: { name: 'SimplePageHeader', levels: ['simple'], sticky: [] },
      },
      devices: { mobile: '≤479', tablet: '480–1023', desktop: '≥1024' },
      figmaFrames: { mobile: 320, tablet: 744, desktop: 1024 },
      combinations: 21,
    } } : {}),
    ...(hasFigmaBaseModalReference ? { variantMatrix: {
      devices: ['desktop', 'tablet', 'mobile'],
      optional: ['image', 'iconBack', 'iconRight', 'buttonMain', 'buttonSecondary', 'pinHeader', 'pinFooter', 'scroll'],
      slots: 12,
    } } : {}),
    ...(record.id === 'button' ? { variants: [
      { id: 'size', use: 'M и L — шесть видимых тонов; XL — main и secondary.' },
      { id: 'tone', use: 'main, secondary, danger, danger-outline, success, success-outline; статусные тона — Figma-only.' },
      { id: 'icon', use: 'Без ведущей иконки или с ведущей иконкой.' },
      { id: 'state', use: 'default, hover, focus, disabled и loading; pressed не подтверждён.' },
    ] } : {}),
    ...(record.id === 'icon-button' ? { variants: [
      { id: 'state', use: 'default, hover, focus-visible, disabled и loading по Courses Figma.' },
      { id: 'icon', use: 'Иконка 24×24 с viewBox 0 0 24 24; доступное имя задаётся на кнопке.' },
    ] } : {}),
    ...(hasFigmaBaseModalReference ? { variants: [
      { id: 'device', use: 'desktop и tablet: centered dialog с radius 24; mobile: bottom sheet с radius 24 только сверху и handle 64×4.' },
      { id: 'media', use: 'Optional image slot высотой 140 px.' },
      { id: 'header', use: 'Title, optional back/right icons; pinHeader добавляет разделитель над scroll body.' },
      { id: 'content', use: 'От 1 до 12 независимых slots; body прокручивается отдельно.' },
      { id: 'footer', use: 'Optional secondary/main Button M; pinFooter добавляет разделитель.' },
    ] } : {}),
    ...(hasFigmaSearchFormReference ? { variants: [
      { id: 'fields', use: 'Три Select XL высотой 56 px внутри одной общей оболочки.' },
      { id: 'layout', use: 'Desktop: горизонтальная группа; mobile: вертикальная группа.' },
      { id: 'action', use: 'Button XL отделена от полей на 8 px; на mobile — на 16 px и во всю ширину.' },
    ] } : {}),
    ...(hasFigmaFieldReference ? { variants: [
      ...(record.id === 'textarea' ? [{ id: 'size', use: 'M: высота 82 px, отступы 12×8 px.' }] : [{ id: 'size', use: 'M: 40 px; XL / SearchForm: 56 px. В XL слева 16 px, справа 12 px.' }]),
      { id: 'content', use: record.id === 'multi-select' ? 'Пустое поле или выбранные значения в чипах.' : 'Пустое с placeholder или заполненное.' },
      { id: 'state', use: 'default, hover, focus-visible, disabled и invalid/error.' },
      ...(['select', 'multi-select'].includes(record.id) ? [{ id: 'dropdown', use: 'Открытая панель: gap 4 px, высота 216 px, строки 40 px и прокрутка.' }] : []),
    ] } : {}),
    ...(hasFigmaControlReference ? { variants: [
      { id: 'value', use: 'off / on; нативное состояние checked.' },
      { id: 'state', use: 'default, hover, focus-visible, disabled и loading по Courses Figma.' },
    ] } : {}),
    ...(hasFigmaNavigationStateReference ? { variants: [
      ...(record.id === 'tab' ? [{ id: 'kind', use: 'FilterChipMenu с icon-left + chevron; FilterChipSwitch со switch-right.' }] : [{ id: 'context', use: record.id === 'segmented-control' ? 'HeroTabs на цветном hero-фоне.' : 'PageTabs на светлом фоне страницы.' }]),
      { id: 'state', use: `default, hover, focus-visible, ${record.id === 'tab' ? 'pressed' : 'selected'}, disabled и loading${record.id === 'tab' ? '; для Menu также open' : ''}.` },
    ] } : {}),
    ...(hasFigmaHeaderReference ? { variants: [
      { id: 'family', use: 'ListingHeader, CoursesHeader или SimplePageHeader.' },
      { id: 'level', use: 'Hero для верхнего уровня; Page для второго уровня; Simple для низкоуровневых страниц.' },
      { id: 'sticky', use: 'Только Page: обычная или сокращённая sticky-версия.' },
      { id: 'device', use: 'Responsive, не prop: mobile ≤479, tablet 480–1023, desktop ≥1024.' },
    ] } : {}),
    ...(['filter-chip', 'tab'].includes(record.id) ? { componentFamily: { id: 'filter-chip', name: 'Filter Chip', member: record.id === 'filter-chip' ? 'FilterChip' : 'FilterChipMenu / FilterChipSwitch', legacyId: record.id === 'tab' ? 'tab' : null } } : {}),
    ...(['segmented-control', 'button-group'].includes(record.id) ? { componentFamily: { id: 'tabs', name: 'Tabs', member: record.id === 'segmented-control' ? 'HeroTabs' : 'PageTabs', legacyId: record.id } } : {}),
    ...(['modal', 'promo-code-modal'].includes(record.id) ? { componentFamily: { id: 'modal', name: 'Modal', member: record.id === 'modal' ? 'Modal' : 'PromoCodeModal', legacyId: record.id === 'promo-code-modal' ? 'promo-code-modal' : null } } : {}),
    ...(hasFigmaAvatarScale ? { variants: [
      { id: 'size', use: '24, 32, 36, 40, 48, 56, 68 и 100 px по Courses Figma.' },
      { id: 'content', use: record.id === 'avatar' ? 'Пользовательское изображение или дефолтный Courses placeholder.' : 'Логотип организации или дефолтная иллюстрация компании из Career.' },
      { id: 'shape', use: record.id === 'avatar' ? 'Круг на всех размерах, radius/full = 200 px.' : 'Радиусы по размеру: 24→6, 32→8, 36–56→12, 68→16, 100→24 px.' },
    ] } : {}),
    ...(record.id === 'button' ? { layoutRules: [
      { id: 'default', context: 'Обычное действие в контенте', behavior: 'Ширина по содержимому.', implementation: 'inline-flex без width: 100%.' },
      { id: 'course-card', context: 'CTA внутри карточки курса', behavior: 'Растягивается на ширину карточки на всех разрешениях.', implementation: 'w-full на кнопке или stretch action-slot контейнера.', evidence: '164 M/main production-вхождения с w-full.' },
      { id: 'mobile-form', context: 'Единственная кнопка формы на мобильном', behavior: 'Занимает всю ширину формы.', implementation: 'Одноколоночный grid растягивает кнопку; отдельный Button-вариант не нужен.', evidence: 'SearchForm: phone:grid-cols-[1fr].' },
      { id: 'section-action', context: 'Одиночное действие секции или блока', behavior: 'Растягивается на ширину action-slot.', implementation: 'w-full или stretch у контейнера.', evidence: '15 L/secondary production-вхождений с w-full.' },
      { id: 'semantics', context: 'Действие или переход', behavior: 'Внешний вид одинаковый.', implementation: 'button для действия, a для навигации.' },
    ] } : {}),
    ...(hasFigmaControlReference ? { layoutRules: [
      { id: 'control-label', context: 'Контрол с подписью', behavior: 'Между визуальным контролом и текстом используется gap 8 px; текст опущен на 1 px.', implementation: 'inline-flex; align-items:flex-start; gap:8px; label padding-top:1px.' },
      ...(['checkbox', 'radio-button'].includes(record.id) ? [
        { id: 'vertical-list', context: 'Вертикальная группа вариантов', behavior: 'Между соседними элементами 16 px.', implementation: 'flex-direction:column; gap:16px.', evidence: 'Courses Figma control-list node 717:191.' },
        { id: 'horizontal-list', context: 'Горизонтальная группа вариантов', behavior: 'Между соседними элементами 24 px.', implementation: 'flex-direction:row; gap:24px.', evidence: 'Courses Figma control-list node 717:191.' },
      ] : []),
    ] } : {}),
    ...(hasFigmaHeaderReference ? { layoutRules: [
      { id: 'breakpoints', context: 'SiteHeader', behavior: 'Три Figma-режима без горизонтального переполнения.', implementation: '@media max-width:479px; 480–1023px; min-width:1024px.' },
      { id: 'sticky', context: 'Page второго уровня', behavior: 'При прокрутке заменяется сокращённой шапкой с тенью.', implementation: 'position:sticky; top:0; только level=page.' },
      { id: 'mobile-overflow', context: 'Mobile', behavior: 'Фильтры и верхнее меню остаются однострочными и прокручиваются горизонтально.', implementation: 'overflow-x:auto; элементы flex:none.' },
    ] } : {}),
    ...(hasFigmaFilterModalReference ? { layoutRules: [
      { id: 'viewport-shell', context: 'FilterModal', behavior: 'Шапка и футер остаются на месте, тело занимает всё оставшееся пространство.', implementation: 'display:grid; grid-template-rows:72px minmax(0,1fr) 96px; height:min(620px,100dvh).' },
      { id: 'body-scroll', context: 'Длинный список фильтров', behavior: 'Вертикально прокручивается только тело модалки.', implementation: 'min-height:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain.' },
      { id: 'mobile', context: 'Mobile 320 px', behavior: 'Контент имеет боковые отступы 24 px, а две кнопки футера занимают всю ширину и стоят друг под другом.', implementation: '@media(max-width:479px): footer 136px; flex-direction:column; padding:16px 24px; main action first.' },
    ] } : {}),
    ...(hasFigmaMobileSheetReference ? { layoutRules: [
      { id: 'mobile-only', context: 'Быстрые фильтры', behavior: 'Bottom sheet используется только в мобильном режиме.', implementation: 'Эталонный viewport 320×568; на tablet/desktop применяется inline control, dropdown или popover.' },
      { id: 'bottom-anchor', context: 'Open', behavior: 'Полноэкранный overlay затемняет страницу, панель закреплена у нижней границы.', implementation: 'position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end.' },
      { id: 'dismiss', context: 'Interaction', behavior: 'Sheet закрывается после выбора/подтверждения, по клику на overlay и по Escape.', implementation: 'Trigger восстанавливает фокус после закрытия.' },
    ] } : {}),
    ...(hasFigmaBaseModalReference ? { layoutRules: [
      { id: 'device', context: 'Modal', behavior: 'Desktop/tablet центрируют диалог; mobile закрепляет его у нижней границы viewport.', implementation: '320px shell; full radius 24px или 24px 24px 0 0; max-height 800/700px.' },
      { id: 'scroll-body', context: 'Переполнение', behavior: 'Header и footer остаются на месте, прокручивается только body.', implementation: 'grid-template-rows:auto auto minmax(0,1fr) auto; body min-height:0; overflow-y:auto.' },
      { id: 'slots', context: 'Состав', behavior: 'Изображение, иконки header, до 12 content slots и обе кнопки footer включаются независимо.', implementation: 'Опциональные DOM slots; gap body 16px, внутренние отступы 24px.' },
      { id: 'dismiss', context: 'Interaction', behavior: 'Overlay, Escape и подтверждение закрывают Modal с возвратом фокуса.', implementation: 'role=dialog, aria-modal=true, focus return to trigger.' },
    ] } : {}),
    ...(hasFigmaSearchFormReference ? { layoutRules: [
      { id: 'joined-fields', context: 'Select XL group', behavior: 'Поля воспринимаются как один составной элемент с разделителями 1 px.', implementation: 'Child borders overlap by 1px; only the first and last controls keep the outer 12px radii.' },
      { id: 'mobile-stack', context: 'Mobile ≤479 px', behavior: 'Поля складываются вертикально без промежутков; кнопка занимает всю ширину.', implementation: 'Single-column grid; vertical separators become horizontal; action gap 16px.' },
    ] } : {}),
    previewNotes: [
      { type: 'guidance', text: `Полная спецификация: guide/${record.spec}.` },
      ...(record.id === 'button' ? [
        { type: 'coverage-warning', text: 'Статусные тона и loading доступны в интерактивном playground по Figma-референсу и не подтверждены в снятом production DOM.' },
        { type: 'assumption', text: 'Инвентаризация v0.1 упоминает 15 component set, но на доступном референсе видны 14: шесть для M, шесть для L и два для XL. Невидимое пятнадцатое семейство не восстановлено.' },
        { type: 'guidance', text: 'Растяжение по ширине управляется контейнером и описано в layoutRules; это не отдельный вариант Button.' },
      ] : []),
      ...(record.id === 'icon-button' ? [
        { type: 'guidance', text: 'Пять состояний и геометрия взяты из Courses Figma: education-lib, button / M / icon, node 653:664. Production-пример карусельной стрелки сохранён в исходной спецификации.' },
        { type: 'guidance', text: 'Кнопка 36×36, иконка 24×24; focus показывает внешний контур 2 px с зазором 2 px.' },
      ] : []),
      ...(record.id === 'tab' ? [{ type: 'guidance', text: 'Пользовательское имя: FilterChipMenu / FilterChipSwitch; `tab` оставлен только как legacy id. Полная матрица состояний и open взяты из Courses Figma node 904:1723.' }] : []),
      ...(record.id === 'segmented-control' ? [{ type: 'guidance', text: 'Пользовательское имя: HeroTabs; `segmented-control` оставлен как legacy id. Состояния взяты из Courses Figma node 4274:1422; единая подложка группы rgba(0,0,0,.12), radius 12 px — из node 4261:1716.' }] : []),
      ...(record.id === 'button-group' ? [{ type: 'guidance', text: 'Пользовательское имя: PageTabs; `button-group` оставлен как legacy id. Состояния взяты из Courses Figma node 4813:238; единая подложка группы #F1F1F1, padding 4 px, radius 16 px — из node 4813:288.' }] : []),
      ...(hasFigmaHeaderReference ? [
        { type: 'guidance', text: 'SiteHeader разделён по контексту на ListingHeader, CoursesHeader и SimplePageHeader; все 21 Figma-комбинации доступны в одном responsive-playground.' },
        { type: 'guidance', text: 'Подсказки Figma: Hero — верхний уровень без sticky; Page — второй уровень; PageSticky — сокращение при прокрутке; SimplePageHeader — низкоуровневые страницы.' },
        { type: 'guidance', text: 'Responsive-шкала компонента: mobile ≤479, tablet 480–1023, desktop ≥1024. Она намеренно устраняет конфликт Figma tablet 744 со старым utility phone ≤767.' },
      ] : []),
      ...(hasFigmaFilterModalReference ? [
        { type: 'guidance', text: 'Механика FilterModal сверена с Education Figma node 14627:233015; точная мобильная геометрия — modal-filter / mobile node 14627:228239.' },
        { type: 'guidance', text: 'Шапка 72 px и футер остаются фиксированными внутри оболочки; прокручивается только центральное тело с десятью группами фильтров. На mobile футер 136 px и primary-кнопка расположена первой.' },
      ] : []),
      ...(hasFigmaMobileSheetReference ? [
        { type: 'guidance', text: `${record.name} — mobile-only bottom sheet по сценарию быстрых фильтров Education Figma node 9094:48333. Viewer намеренно показывает один экран 320×568 без desktop/tablet-переключателей.` },
        { type: 'guidance', text: record.id === 'sort-sheet'
          ? 'При выборе варианта сортировки значение переносится в trigger, sheet закрывается и возвращает фокус. Геометрия открытой панели 320×264 взята из node 9356:50311.'
          : 'Сброс очищает оба поля без закрытия; «Готово» закрывает sheet и возвращает фокус. Геометрия открытой панели 320×176 взята из node 9356:52508.' },
      ] : []),
      ...(hasFigmaBaseModalReference ? [
        { type: 'guidance', text: 'Базовый Modal и его property matrix взяты из Courses Figma education-lib node 1144:25049. В playground параметры переключаются без размножения iframe.' },
        { type: 'guidance', text: 'PromoCodeModal — не отдельная оболочка, а доменный content-вариант Modal; существующий id сохранён для обратной совместимости.' },
      ] : []),
      ...(record.id === 'promo-code-modal' ? [{ type: 'guidance', text: 'PromoCodeModal сгруппирован с базовым Modal и показывает только два варианта наполнения: промокод и акция.' }] : []),
      ...(record.id === 'rubrication-bar' ? [{ type: 'guidance', text: 'RubricationBar показан на штатном синем градиенте страницы `/courses`; на mobile ссылки остаются в одну строку и прокручиваются внутри полосы.' }] : []),
      ...(hasFigmaSearchFormReference ? [{ type: 'guidance', text: 'SearchForm использует Select XL как единый составной контрол: между полями нет gap, видны только разделители 1 px.' }] : []),
      ...(record.id === 'ad-slot' ? [{ type: 'guidance', text: 'Production `.adfox-banner` пуст до выполнения внешнего рекламного скрипта. Viewer показывает локальную безопасную заглушку, сохраняя геометрию Carousel и AdCard.' }] : []),
      ...(record.id === 'header-dropdown' ? [{ type: 'assumption', text: 'Production snapshot содержит только `hidden`. Открытый вид получен из той же разметки удалением `hidden`; переключение aria-expanded/hidden в viewer — документирующая реконструкция.' }] : []),
      ...(record.id === 'search-input' ? [{ type: 'guidance', text: 'Живой пример использует настоящее поле из production DOM. Тёмный прямоугольник v0.1 был частью SSR-заглушки шапки, а не SearchInput.' }] : []),
      ...(hasFigmaFieldReference ? [
        { type: 'guidance', text: record.id === 'textarea'
          ? 'Оболочка и состояния взяты из Courses Figma: education-lib, textarea, node 4058:4529.'
          : 'Общая оболочка и состояния взяты из Courses Figma: education-lib, canvas 670:8259; XL 56 px — из SearchForm, node 15074:233173.' },
        ...(record.id === 'textarea' ? [] : [{ type: 'guidance', text: 'В M и XL используется один текстовый стиль 16/22 regular и SVG-иконки 24×24.' }]),
        ...(['select', 'multi-select'].includes(record.id) ? [{ type: 'guidance', text: 'Открытый dropdown сверён с Courses Figma: Select node 4850:2101, MultiSelect dropdown node 4393:6213. Панель общая для обоих компонентов; различается содержимое триггера.' }] : []),
      ] : []),
      ...(hasFigmaControlReference ? [
        { type: 'guidance', text: `Полная матрица off/on взята из Courses Figma: education-lib, ${record.id === 'radio-button' ? 'radiobutton node 693:1585' : record.id === 'checkbox' ? 'checkbox node 687:1279' : 'switch node 693:1718'}.` },
        { type: 'guidance', text: 'Подпись выровнена через padding-top: 1 px; gap между визуальным контролом и текстом — 8 px.' },
        ...(['checkbox', 'radio-button'].includes(record.id) ? [{ type: 'guidance', text: 'Группы контролов: gap 16 px по вертикали и 24 px по горизонтали, control-list node 717:191.' }] : []),
        ...(record.id === 'checkbox' ? [{ type: 'coverage-warning', text: 'Indeterminate отсутствует в указанном Figma component set и остаётся непроверенным.' }] : []),
      ] : []),
      ...(hasFigmaAvatarScale ? [
        { type: 'guidance', text: record.id === 'avatar'
          ? 'Размеры и круглая форма взяты из Courses Figma: education-lib, avatar/user, node 722:1599; форма SVG переиспользована из Career v1.2, цвета адаптированы к Courses: #F1F1F1 и #D3D3D4.'
          : 'Размеры и скругления взяты из Courses Figma: education-lib, avatar/school, node 722:1639; форма SVG переиспользована из Career v1.2, цвета адаптированы к Courses: #F1F1F1 и #D3D3D4.' },
        { type: 'guidance', text: 'Второй пример сохраняет ранее зафиксированный production-контекст и его позиционирование.' },
      ] : []),
      ...(record.sourceScope !== 'production' ? [{ type: 'coverage-warning', text: `Источник ${record.sourceScope}: компонент не подтверждён в продакшене.` }] : []),
    ],
    accessibility: hasFigmaMobileSheetReference
      ? [record.id === 'sort-sheet' ? 'Панель сортировки использует `role="listbox"`, варианты — `role="option"` и `aria-selected`.' : 'Панель цены использует `role="dialog"`, `aria-modal="true"` и доступный заголовок.', 'Escape и клик по затемнению закрывают sheet; после закрытия фокус возвращается на trigger.']
      : hasFigmaNavigationStateReference
      ? record.id === 'tab'
        ? ['Корень FilterChip — `<button>`; выбранность передаётся через `aria-pressed`, Menu сообщает `aria-expanded` и связь с listbox.', '`disabled` задаётся нативно, `loading` — через `aria-busy="true"`. Встроенные иконка и switch декоративны: доступное имя находится на общей кнопке.']
        : ['Контейнер вкладок использует `role="tablist"`, элементы — `role="tab"` и `aria-selected`.', 'Перемещение по группе реализуется стрелками; `disabled` задаётся нативно, `loading` — через `aria-busy="true"`.']
      : record.id === 'icon-button'
      ? ['Корень — `<button>` с доступным именем: фокус по Tab, действие — Enter или Space.', '`focus-visible` показывает внешний контур; `disabled` использует нативный атрибут, `loading` — `aria-busy="true"`.']
      : hasFigmaControlReference
        ? [record.id === 'radio-button' ? 'Используйте нативные `<input type="radio">` с общим `name` внутри одной группы.' : record.id === 'switch' ? 'Используйте нативный `<input type="checkbox" role="switch">`; переключение — Space.' : 'Используйте нативный `<input type="checkbox">`; переключение — Space.', '`focus-visible` показывает внешний контур; `disabled` задаётся нативно, `loading` — через `aria-busy="true"` на контейнере.']
      : hasFigmaFieldReference
        ? [record.id === 'select' ? 'Триггер — `<button role="combobox">` с `aria-expanded`; управляет связанным `listbox`.' : `Нативный \`<${record.id === 'textarea' ? 'textarea' : 'input'}>\` получает фокус по Tab и имеет доступное имя.`, '`disabled` задаётся нативно; ошибка — `aria-invalid="true"` и связанный текст ошибки.']
      : [record.a11y?.notes, record.a11y?.keyboard].filter(Boolean),
    evidence: [
      ...evidenceArray(record),
      ...(record.id === 'icon-button' ? [{ type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '653:664', layerName: 'button / M / icon' } }] : []),
      ...(record.id === 'search-input' ? [{ type: 'production', data: { selector: 'input[placeholder="Искать на Хабр Курсах"]', context: '#courses-filter-search-top-panel', page: 'courses-listing' } }] : []),
      ...(hasFigmaFieldReference && record.id !== 'textarea' ? [
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '670:8259', layerName: 'input (textfields, selects)' } },
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15074:233173', layerName: 'SearchForm fields · XL' } },
        ...(['select', 'multi-select'].includes(record.id) ? [{ type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: record.id === 'select' ? '4850:2101' : '4393:6213', layerName: record.id === 'select' ? 'Select · open' : 'MultiSelect · open dropdown' } }] : []),
      ] : []),
      ...(hasFigmaControlReference ? [
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: record.id === 'checkbox' ? '687:1279' : record.id === 'radio-button' ? '693:1585' : '693:1718', layerName: record.id } },
        ...(['checkbox', 'radio-button'].includes(record.id) ? [{ type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '717:191', layerName: 'control-list' } }] : []),
      ] : []),
      ...(hasFigmaNavigationStateReference ? [
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: record.id === 'tab' ? '904:1723' : record.id === 'segmented-control' ? '4274:1422' : '4813:238', layerName: record.id === 'tab' ? 'FilterChip variants' : record.id === 'segmented-control' ? 'HeroTabs states' : 'PageTabs states' } },
        ...(record.id === 'segmented-control' ? [{ type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '4261:1716', layerName: 'button group / onheader' } }] : []),
        ...(record.id === 'button-group' ? [{ type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '4813:288', layerName: 'button group / onpage' } }] : []),
      ] : []),
      ...(hasFigmaHeaderReference ? [
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15071:230717', layerName: 'SiteHeader variants and usage annotations' } },
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15058:236426', layerName: 'header / list pages' } },
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15065:242662', layerName: 'header / courses' } },
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15065:245602', layerName: 'header / simple pages' } },
      ] : []),
      ...(hasFigmaFilterModalReference ? [
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '14627:233015', layerName: 'FilterModal page behavior' } },
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '14627:228239', layerName: 'modal-filter / mobile' } },
      ] : []),
      ...(hasFigmaMobileSheetReference ? [
        { type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '9094:48333', layerName: 'Быстрые фильтры · responsive behavior' } },
      ] : []),
      ...(hasFigmaBaseModalReference ? [
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '1144:29417', layerName: 'Modal · desktop' } },
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '4726:1139', layerName: 'Modal · tablet' } },
        { type: 'figma', data: { fileKey: 'KG36iTkwvKDmrw8XQhk7d6', nodeId: '1144:31171', layerName: 'Modal · mobile' } },
      ] : []),
      ...(hasFigmaSearchFormReference ? [{ type: 'figma', data: { fileKey: 'oNyNRRob2y0ZSgPHOdH65X', nodeId: '15074:233173', layerName: 'SearchForm · Select XL group' } }] : []),
    ],
    unknowns,
    source: {
      version: ['icon-button', 'tab', 'segmented-control', 'button-group', 'site-header', 'filter-modal', 'sort-sheet', 'price-sheet', 'modal', 'promo-code-modal', 'search-form'].includes(record.id) || hasFigmaFieldReference || hasFigmaControlReference ? 'v0.2' : 'v0.1',
      spec: `guide/${record.spec}`,
      status: record.status,
      scope: record.sourceScope,
      step: record.step,
      anchor: record.anchor,
      originalKind: record.kind,
      markupNote: record.markupNote || null,
      markupState: record.markupState || null,
    },
    usage: hasFigmaHeaderReference ? {
      when: 'Выберите семейство по контексту страницы, затем уровень Hero/Page; sticky существует только как сокращение Page.',
      whenNot: ['Не используйте ListingHeader внутри страниц курсов.', 'Не используйте sticky-вариант для Hero или SimplePageHeader.'],
      related: ['header-dropdown', 'search-input', 'filter-chip', 'segmented-control', 'button'],
    } : hasFigmaMobileSheetReference ? {
      when: 'Только мобильный ряд быстрых фильтров: открывать поверх текущей страницы из соответствующего chip/trigger.',
      whenNot: ['Не растягивать bottom sheet на tablet и desktop.', record.id === 'sort-sheet' ? 'На широком экране используйте обычный control/menu сортировки.' : 'На широком экране используйте dropdown/popover цены рядом с trigger.'],
      related: ['filter-chip', ...(record.id === 'price-sheet' ? ['text-input', 'button'] : [])],
    } : record.usage,
    dependencies: hasFigmaHeaderReference ? [...new Set([...(record.dependsOn || []), 'filter-chip', 'segmented-control', 'button'])] : record.id === 'promo-code-modal' ? [...new Set([...(record.dependsOn || []), 'modal'])] : record.dependsOn || [],
    stateCoverage: record.id === 'icon-button' ? {
      ...record.states,
      captured: [...new Set([...(record.states?.captured || []), 'disabled', 'loading'])],
      uncaptured: (record.states?.uncaptured || []).filter(state => state !== 'disabled'),
    } : hasFigmaFieldReference ? {
      ...record.states,
      captured: [...new Set([...(record.states?.captured || []), ...figmaResolvedStates, 'error'])],
      uncaptured: unresolvedStates,
    } : hasFigmaControlReference ? {
      ...record.states,
      captured: [...new Set([...(record.states?.captured || []), ...figmaResolvedStates])],
      uncaptured: unresolvedStates,
    } : hasFigmaNavigationStateReference ? {
      ...record.states,
      captured: [...new Set([...(record.states?.captured || []), ...figmaResolvedStates])],
      uncaptured: unresolvedStates,
    } : hasFigmaMobileSheetReference ? {
      ...record.states,
      captured: [...new Set([...(record.states?.captured || []), 'closed'])],
      uncaptured: [],
    } : record.states,
    provenance: record.provenance,
    sourceConflicts: record.sourceConflicts || [],
  };
  writeJson(join(root, specPath), item);
  const navigation = navigationFor(record, normalizedKind);
  catalog.push({
    id: record.id,
    title: displayTitleFor(record),
    kind: normalizedKind,
    category: record.category,
    ...navigation,
    file: specPath,
    tags: [...new Set([
      record.id,
      record.name,
      displayTitleFor(record),
      record.kind,
      record.category,
      record.status,
      record.sourceScope,
      ...(record.states?.required || []),
      ...(record.usage?.related || []),
    ])],
  });
  migrationComponents.push({ source: record.spec, id: record.id, kind: normalizedKind, target: specPath, example: generatedExamples[0]?.file || null, status: 'migrated' });
}

for (const rule of rules) writeJson(join(root, rulePath(rule.id)), rule);

const migrationPatterns = [];
for (const record of patterns) {
  const specPath = `machine/patterns/${record.id}.json`;
  const examplePath = `examples/pages/${record.id}/index.html`;
  const sourcePage = join(source, record.standalone);
  let page = readFileSync(sourcePage, 'utf8')
    .replaceAll('../../ui/', '../../../ui/')
    .replaceAll('../pages.css', '../../../ui/page-examples.css');
  mkdirSync(dirname(join(root, examplePath)), { recursive: true });
  writeFileSync(join(root, examplePath), page);

  const modules = [...new Set(record.sequence.flatMap(block => (block.modules || []).map(item => item.id)))];
  const componentIds = [...new Set(record.sequence.flatMap(block => (block.components || []).map(item => item.id)))];
  const item = {
    $schema: '../../schema.json',
    id: record.id,
    title: record.id.replaceAll('-', ' '),
    kind: 'pattern',
    category: 'pages',
    family: record.family,
    maturity: { spec: 'complete', markup: 'available' },
    knowledge: { authority: ['production'], confidence: 'high', scope: 'public-guest' },
    purpose: `Композиция страницы семейства «${record.family}», снятая по адресу ${record.url}.`,
    areas: record.sequence.map((_, index) => `section-${index + 1}`),
    modules,
    components: componentIds,
    implementation: { markup: 'available-in-examples', cssRoots: ['app-container'], styles: ['ui/courses.css', 'ui/page-examples.css'], scripts: [] },
    states: { ui: [], feature: ['assembled'], domain: [] },
    rules: (record.rules || []).map(rulePath),
    responsive: record.responsive || [],
    examples: [{ id: 'assembled', title: 'Собранная страница', file: examplePath, covers: ['production-composition'], preview: { mode: 'viewport', widths: [320, 480, 768, 1024], height: 760 } }],
    previewNotes: [
      { type: 'guidance', text: `Спецификация страницы: guide/${record.spec}.` },
      { type: 'coverage-warning', text: 'Карусели и рекламные слоты показаны честными заглушками: библиотека Swiper не входит в пакет.' },
    ],
    accessibility: [],
    evidence: [{ type: 'production', ref: record.url }],
    unknowns: record.sequence.filter(block => block.stub).map(block => block.stub),
    source: { version: 'v0.1', spec: `guide/${record.spec}`, standalone: record.standalone, showcase: record.showcase },
    frame: record.frame,
    sequence: record.sequence,
    sequenceSource: record.sequenceSource,
  };
  writeJson(join(root, specPath), item);
  catalog.push({
    id: record.id,
    title: item.title,
    kind: 'pattern',
    category: 'pages',
    navSection: 'patterns',
    navSectionTitle: 'Страницы',
    navGroup: record.family,
    navGroupTitle: record.family,
    file: specPath,
    tags: [record.id, record.family, 'page', 'responsive', 'production', 'assembled'],
  });
  migrationPatterns.push({ source: record.spec, id: record.id, kind: 'pattern', target: specPath, example: examplePath, status: 'migrated' });
}

writeJson(join(root, 'machine/catalog.json'), catalog);
writeJson(join(root, 'machine/tokens.json'), tokens);
writeJson(join(root, 'machine/content.json'), content);
writeJson(join(root, 'machine/states.json'), {
  ui: Object.fromEntries([...allStateNames].sort().map(state => [state, `Состояние ${state}; покрытие указано в stateCoverage каждой сущности.`])),
  feature: { assembled: 'Страница собрана из зафиксированной production-разметки.' },
  domain: {},
});

const archiveFiles = filesBelow(source);
const archiveBytes = archiveFiles.reduce((sum, file) => sum + statSync(file).size, 0);
const evidenceFiles = filesBelow(join(source, 'evidence'));
const uiFiles = filesBelow(join(source, 'ui'));
const docFiles = [
  ...filesBelow(join(source, 'components')),
  ...filesBelow(join(source, 'pages')),
  ...filesBelow(join(source, 'docs/guide')),
];
const migrationMap = {
  source: 'archive/courses/v0.1',
  targetVersion: 'v0.2',
  createdAt: '2026-09-14',
  archiveInventory: { files: archiveFiles.length, bytes: archiveBytes },
  entities: {
    components: migrationComponents,
    patterns: migrationPatterns,
    rules: rules.map(rule => ({ source: 'machine/rules.json', id: rule.id, target: rulePath(rule.id), status: 'migrated' })),
  },
  copiedLayers: [
    { source: 'ui', target: 'ui', files: uiFiles.length, status: 'copied' },
    { source: 'evidence', target: 'evidence', files: evidenceFiles.length, status: 'copied' },
    { source: 'components + pages + docs/guide', target: 'guide + docs/guide', files: docFiles.length, status: 'reorganized' },
  ],
  addedAssets: [
    { source: 'career/ui/assets/illustrations/avatar-default-user.svg', target: 'ui/assets/images/avatar-default-user.svg', status: 'shape-reused-colors-adapted-to-courses' },
    { source: 'career/ui/assets/illustrations/avatar-default-company.svg', target: 'ui/assets/images/avatar-default-company.svg', status: 'shape-reused-colors-adapted-to-courses' },
    { source: 'Figma 14627:228239', target: 'ui/assets/images/filter-modal/recommendation-*.png', status: 'downloaded-exact' },
    { source: 'Figma 14627:228239', target: 'ui/assets/icons/filter-grade-*.svg', status: 'downloaded-exact' },
    { source: 'Figma 1144:25049', target: 'ui/assets/images/modal/example.png', status: 'downloaded-exact' },
  ],
  preservedDocuments: [
    { source: 'BRIEF.md', target: 'docs/reference/research-brief-v0.1.md', status: 'copied' },
    { source: 'CHANGELOG.md', target: 'docs/history/v0.1-changelog.md', status: 'copied' },
    { source: 'ROADMAP.md', target: 'docs/history/v0.1-roadmap.md', status: 'copied' },
    { source: '.pipeline/principles-evidence.md', target: 'docs/reference/principles-evidence-v0.1.md', status: 'copied' },
    { source: 'README.md + AGENTS.md', target: 'README.md + AGENTS.md', status: 'rewritten-for-v0.2' },
  ],
  archiveOnly: [
    { path: '.pipeline', reason: 'Исторический рабочий журнал и промежуточные артефакты; не входит в обычный маршрут чтения.' },
    { path: 'showcase', reason: 'Заменён адресными examples и универсальным viewer.' },
    { path: 'tools', reason: 'Старые сборщики монолитных machine/*.json несовместимы с адресной схемой v0.2.' },
    { path: 'tests', reason: 'Старые тесты относятся к прежней витрине; v0.2 проверяется validate.mjs и validate-viewer.mjs.' },
    { path: 'docs/development', reason: 'Служебная пустая папка прежнего конвейера.' },
    { path: 'package.json + package-lock.json + playwright.config.mjs', reason: 'Конфигурация прежнего пакета заменена контрактом showcase-template.' },
    { path: 'node_modules + test-results', reason: 'Локальные производные файлы сохранены только в полном архиве.' },
  ],
};
writeJson(join(root, 'machine/migration-map.json'), migrationMap);

const componentCount = catalog.filter(item => item.kind === 'component').length;
const moduleCount = catalog.filter(item => item.kind === 'module').length;
const foundationCount = catalog.filter(item => item.kind === 'foundation').length;
const exampleCount = catalog.reduce((sum, entry) => sum + readJson(join(root, entry.file)).examples.length, 0);
writeJson(join(root, 'machine/index.json'), {
  schemaVersion: 2,
  product: { id: 'courses', title: 'Хабр Курсы', guideVersion: '0.2', status: 'in-development' },
  readOrder: [
    'machine/catalog.json',
    'только выбранный file из catalog',
    'ссылки rules, implementation и evidence — только при необходимости',
  ],
  files: {
    catalog: 'machine/catalog.json',
    states: 'machine/states.json',
    tokens: 'machine/tokens.json',
    content: 'machine/content.json',
    migrationMap: 'machine/migration-map.json',
    schema: 'schema.json',
    migrationGuide: 'MIGRATION.md',
  },
  coverage: {
    boundary: 'Публичная часть Хабр Курсов, снятая гостем на десяти страницах; шесть страниц собраны в examples.',
    known: catalog.map(item => item.id),
    unknown: [
      'личный кабинет, избранное и сравнение',
      'тёмная тема',
      'раскладка карусели без Swiper',
      'не снятые состояния, перечисленные у отдельных сущностей',
    ],
    onUnknown: { action: 'disclose-gap-and-use-nearest-measured-pattern', doc: 'docs/decisions/unknowns.md' },
  },
  viewerContract: {
    intrinsic: 'простые компоненты без toolbar; iframe растёт по содержимому',
    viewport: 'модули и страницы с контролами 320/480/768/1024/Auto',
    pageBreakpoints: [320, 768, 1024],
    fluidCheckpoints: [480],
    notes: 'пояснения к превью хранятся в previewNotes и выводятся вне iframe',
  },
  checks: ['node validate.mjs', 'node tools/validate-viewer.mjs'],
  metrics: { catalogItems: catalog.length, foundations: foundationCount, components: componentCount, modules: moduleCount, patterns: patterns.length, rules: rules.length, examples: exampleCount },
});

console.log(`Built ${foundationCount} foundations; migrated ${components.length} entities, ${patterns.length} patterns, ${rules.length} rules and ${exampleCount} examples.`);
