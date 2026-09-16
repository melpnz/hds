import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = relative => JSON.parse(readFileSync(resolve(root, relative), 'utf8'));

export function buildStyleProfile() {
  const colors = read('machine/foundations/colors.json');
  const typography = read('machine/foundations/typography.json');
  const layout = read('machine/foundations/layout-responsive.json');
  const spacing = read('machine/foundations/spacing.json');
  const radii = read('machine/foundations/radii.json');
  const shadow = read('machine/tokens/shadow.json').tokens;
  return {
    schemaVersion: 1,
    dimensionTokens: { baseUnit: '4px', source: 'machine/dimension-tokens.json', css: 'ui/dimension-tokens.css', exceptions: 'machine/reports/dimension-exceptions.json' },
    product: { id: 'career', title: 'Хабр Карьера', guideVersion: '1.2', status: 'active-with-coverage-limits' },
    scope: { confidence: 'high', boundary: 'Опубликованный публичный гостевой срез Career v1.2; авторизованные сценарии не покрыты.' },
    typography: { families: { interface: typography.family.$value }, weights: typography.weights, roles: typography.typeScale, responsive: typography.responsive },
    colors: { roles: Object.fromEntries(colors.roles.map(({ role, token, value }) => [role, { token, value }])) },
    shape: { radii: radii.values, shadows: { dropdown: shadow.dropdown.$value }, borders: { default: shadow['border-color'].$value, hover: shadow['border-color-hover'].$value } },
    layout: { container: layout.container, breakpoints: layout.breakpoints, fluidRanges: layout.fluidRanges, spacing: spacing.values, density: spacing.guidance },
    signaturePatterns: [
      { id: 'violet-actions-blue-links', rule: 'Фиолетовый обозначает действие, синий — переход.', evidence: 'machine/foundations/colors.json' },
      { id: 'dense-four-pixel-rhythm', rule: 'Плотный продуктовый интерфейс использует основной шаг 4px.', evidence: 'machine/foundations/spacing.json' },
      { id: 'cards-stay-flat', rule: 'Карточки сохраняют геометрию; интерактивность не выражается подъёмом всей поверхности.', evidence: 'machine/patterns/listing.json' }
    ],
    sources: ['machine/dimension-tokens.json', 'machine/foundations/colors.json', 'machine/foundations/typography.json', 'machine/foundations/layout-responsive.json', 'machine/foundations/spacing.json', 'machine/foundations/radii.json'],
    unknowns: ['Личный кабинет, живые формы, модальные потоки и авторизованные состояния не входят в подтверждённый срез.']
  };
}

export function writeStyleProfile() {
  writeFileSync(resolve(root, 'machine/style-profile.json'), `${JSON.stringify(buildStyleProfile(), null, 2)}\n`, 'utf8');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeStyleProfile();
