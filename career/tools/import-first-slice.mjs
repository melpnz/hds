import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const oldRoot = resolve(root, '..', 'archive', 'career', 'v1');
const legacyPrefix = 'archive:career/v1/';
const read = path => JSON.parse(readFileSync(resolve(oldRoot, path), 'utf8'));
const write = (path, value) => {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

const sourceTokens = read('machine/tokens.json');
const sourceComponents = read('machine/components.json');
const sourceButton = sourceComponents.find(item => item.id === 'button');

const colorGroups = [
  { id: 'neutral', title: 'Нейтральная шкала', match: key => /^(ui-(white|black|gray|checkbox|asphalt|chevron)|header-gray)/.test(key) },
  { id: 'action-link', title: 'Действия и ссылки', match: key => /^(ui-primary|ui-blue)/.test(key) },
  { id: 'status', title: 'Статусные цвета', match: key => /^ui-(red|green|orange|yellow|turquoise)/.test(key) },
  { id: 'semantic', title: 'Семантические алиасы', match: key => /^(icon|font|text|links)/.test(key) },
  { id: 'data-visualization', title: 'Графики и иллюстрации', match: key => /^(illustration|illustrations|graph|pale-canary)/.test(key) },
  { id: 'component-promo', title: 'Компоненты и промо', match: () => true }
];

const assigned = new Set();
for (const group of colorGroups) {
  group.tokens = Object.fromEntries(Object.entries(sourceTokens.color).filter(([key]) => {
    if (assigned.has(key) || !group.match(key)) return false;
    assigned.add(key);
    return true;
  }));
  write(`machine/foundations/colors/${group.id}.json`, {
    id: `colors-${group.id}`,
    title: group.title,
    kind: 'token-group',
    source: `${legacyPrefix}machine/tokens.json#/color`,
    tokens: group.tokens
  });
}

if (assigned.size !== Object.keys(sourceTokens.color).length) {
  throw new Error(`Color migration lost tokens: ${assigned.size}/${Object.keys(sourceTokens.color).length}`);
}

const commonKnowledge = {
  authority: ['production-css', 'normative'],
  confidence: 'high',
  scope: 'public-guest'
};

write('machine/foundations/colors.json', {
  id: 'colors',
  title: 'Цвета',
  kind: 'foundation',
  category: 'foundations',
  maturity: { spec: 'complete', markup: 'available' },
  knowledge: commonKnowledge,
  purpose: 'Холодная сине-серая палитра Career. Фиолетовый обозначает действие, синий — переход.',
  implementation: { markup: 'available-in-examples', cssRoots: [':root'], styles: ['ui/tokens.css'], scripts: [] },
  groups: colorGroups.map(group => ({ id: group.id, title: group.title, file: `machine/foundations/colors/${group.id}.json`, tokens: Object.keys(group.tokens).length })),
  roles: [
    { role: 'action', token: '--color-ui-primary', value: '#8164f7' },
    { role: 'link', token: '--color-ui-blue-accent', value: '#0464d2' },
    { role: 'content-text', token: '--color-ui-gray-1', value: '#1b272c' },
    { role: 'supporting-text', token: '--color-ui-gray-2', value: '#55798b' },
    { role: 'metadata', token: '--color-ui-gray-3', value: '#7996a5' }
  ],
  states: { ui: [], feature: [], domain: [] },
  rules: ['machine/rules/color-roles.json'],
  examples: [{ id: 'palette', title: 'Палитра', file: 'examples/foundations/colors.html', covers: ['113 color tokens', 'roles', 'derived colors'], preview: { mode: 'intrinsic' } }],
  accessibility: ['gray-1 passes AA on white', 'gray-2 passes AA on white', 'gray-3 is only for large text or secondary metadata'],
  evidence: [{ type: 'production-css', ref: `${legacyPrefix}ui/tokens.css` }, { type: 'analysis', ref: `${legacyPrefix}evidence/tokens.md` }],
  unknowns: ['Runtime branded profile colors have names but no fixed values and are not part of these 113 tokens.']
});

write('machine/foundations/typography.json', {
  id: 'typography',
  title: 'Типографика',
  kind: 'foundation',
  category: 'foundations',
  maturity: { spec: 'complete', markup: 'available' },
  knowledge: commonKnowledge,
  purpose: 'Единая неизменяемая на мобильном шкала Inter для плотного продуктового интерфейса.',
  implementation: { markup: 'available-in-examples', cssRoots: ['text-display-*', 'text-body-*'], styles: ['ui/fonts.css', 'ui/foundations.css'], scripts: [] },
  family: sourceTokens.font.base,
  weights: [{ value: 400, role: 'regular' }, { value: 600, role: 'semibold' }],
  availableWeightRange: [100, 900],
  typeScale: [
    { id: 'text-display-xl', size: 28, lineHeight: 32 },
    { id: 'text-display-l', size: 24, lineHeight: 28 },
    { id: 'text-display-m', size: 20, lineHeight: 24 },
    { id: 'text-display-s', size: 18, lineHeight: 24 },
    { id: 'text-body-l', size: 16, lineHeight: 24 },
    { id: 'text-body-m', size: 14, lineHeight: 20 },
    { id: 'text-body-s', size: 12, lineHeight: 16 },
    { id: 'text-body-xs', size: 11, lineHeight: 16 }
  ],
  responsive: [{ maxWidth: 767, change: 'Шкала не уменьшается; display-xl остаётся 28/32.' }],
  states: { ui: [], feature: [], domain: [] },
  rules: ['machine/rules/color-roles.json'],
  examples: [{ id: 'scale', title: 'Шкала', file: 'examples/foundations/typography.html', covers: ['8 named styles', '400', '600', 'Cyrillic'], preview: { mode: 'intrinsic' } }],
  accessibility: ['Body copy uses 16/24 by default.', 'The 11/16 style is reserved for compact secondary data.'],
  evidence: [{ type: 'production-css', ref: `${legacyPrefix}ui/foundations.css` }, { type: 'guide', ref: `${legacyPrefix}docs/guide/design.md` }],
  unknowns: ['Legacy unnamed font sizes exist but are not promoted to the canonical scale.']
});

write('machine/components/button.json', {
  id: 'button',
  title: 'Button · BaseButton',
  kind: 'component',
  category: 'actions',
  maturity: { spec: 'complete', markup: 'available' },
  knowledge: { authority: ['storybook', 'production-css', 'normative'], confidence: 'high', scope: 'public-and-shared' },
  purpose: 'Основное действие Career. При href или to рендерится ссылка, иначе button.',
  anatomy: ['base-button', 'base-button__inner', 'base-button__before?', 'base-button__content', 'base-button__after?', 'base-button__loader?'],
  implementation: { markup: sourceButton.markup.html, cssRoots: sourceButton.cssRoots, styles: ['ui/tokens.css', 'ui/foundations.css', 'ui/components/buttons.css', 'ui/state-contract.css'], scripts: ['examples/button/toggle-loading.js'], component: sourceButton.code },
  variants: [
    ['main', 'основное действие'], ['main-border', 'контурное основное действие'], ['passive', 'нейтральное действие'],
    ['danger', 'опасное действие'], ['danger-border', 'контурное опасное действие'], ['success', 'успешное действие'],
    ['success-border', 'контурное успешное действие'], ['ghost', 'малозаметное действие'], ['menu', 'действие в меню'],
    ['avatar', 'служебный прозрачный вариант'], ['branded', 'действие в профиле компании'],
    ['branded-outline', 'контурное брендированное действие'], ['branded-secondary-outline', 'вторичное брендированное действие']
  ].map(([id, use]) => ({ id, class: `appearance-${id}`, use })),
  sizes: [
    { id: 'sm', class: 'size-sm', height: 28, padding: '4px 8px', radius: 8, typography: '12/16' },
    { id: 'm', class: 'size-m', height: 32, padding: '4px 8px', radius: 8, typography: '14/20' },
    { id: 'l', class: 'size-l', height: 40, padding: '8px 12px', radius: 12, typography: '14/20' },
    { id: 'xl', class: 'size-xl', height: 48, padding: '12px 16px', radius: 12, typography: '16/24' }
  ],
  states: { ui: sourceButton.states, feature: [], domain: [] },
  rules: ['machine/rules/button-semantics.json'],
  examples: [
    { id: 'variants', title: 'Варианты', file: 'examples/button/variants.html', covers: ['13 appearances'], preview: { mode: 'intrinsic' } },
    { id: 'sizes', title: 'Размеры', file: 'examples/button/sizes.html', covers: ['sm', 'm', 'l', 'xl'], preview: { mode: 'intrinsic' } },
    { id: 'states', title: 'Состояния', file: 'examples/button/states.html', covers: sourceButton.states, preview: { mode: 'intrinsic' } }
  ],
  accessibility: ['Use native button for actions and a without href plus aria-disabled for a disabled link.', 'Loading sets aria-busy=true and preserves width.', 'focus-visible outline is required.'],
  evidence: sourceButton.evidence.concat([{ type: 'production-css', ref: `${legacyPrefix}ui/components/buttons.css` }, { type: 'spec', ref: `${legacyPrefix}components/actions/button.md` }]),
  unknowns: ['appearance-avatar and appearance-ghost exist in CSS but are absent from Storybook argTypes.', 'Branded variants require runtime company colors; preview values are explicitly illustrative.']
});

write('machine/catalog.json', [
  { id: 'colors', title: 'Цвета', kind: 'foundation', category: 'foundations', file: 'machine/foundations/colors.json', tags: ['palette', 'tokens', 'gray', 'primary', 'link', 'status'] },
  { id: 'typography', title: 'Типографика', kind: 'foundation', category: 'foundations', file: 'machine/foundations/typography.json', tags: ['font', 'Inter', 'display', 'body', 'text'] },
  { id: 'button', title: 'Button · BaseButton', kind: 'component', category: 'actions', file: 'machine/components/button.json', tags: ['action', 'form', 'loading', 'disabled', 'danger', 'success', 'branded'] }
]);

console.log(`Imported ${assigned.size} colors, 8 type styles and ${sourceButton.name}`);
