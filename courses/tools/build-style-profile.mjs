import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const tokenValue = (tokens, group, id) => tokens[group]?.[id]?.$value;

export function buildStyleProfile() {
  const tokens = read('machine/tokens.json');
  const semanticTokens = read('machine/semantic-tokens.json');
  const button = read('machine/components/button.json');
  return {
    schemaVersion: 1,
    dimensionTokens: { baseUnit: '0.25rem', referenceRootFontSize: '16px', source: 'machine/dimension-tokens.json', css: 'ui/dimension-tokens.css', exceptions: 'machine/reports/dimension-exceptions.json' },
    semanticTokens: { source: 'machine/semantic-tokens.json', groups: Object.keys(semanticTokens.tokens) },
    product: { id: 'courses', title: 'Хабр Курсы', guideVersion: '1.0', status: 'active' },
    scope: { confidence: 'mixed', boundary: 'Публичная гостевая часть Курсов; шесть собранных страниц и адресные спецификации.' },
    typography: {
      families: { interface: 'Inter, sans-serif' }, weights: { regular: 400, semibold: 600 },
      roles: { h1: '44px/48px', h2: '24px/28px', h3: '20px/24px', h4: '18px/22px', body: '16px/22px', small: '14px/20px', micro: '12px/16px', mobileH1: '30px/34px' }
    },
    colors: { roles: {
      action: tokenValue(tokens, 'color', 'ui-blue-500'), actionHover: tokenValue(tokens, 'color', 'ui-blue-600'),
      text: tokenValue(tokens, 'color', 'text-main'), link: tokenValue(tokens, 'color', 'links-main'),
      background: tokenValue(tokens, 'color', 'white-background'), border: tokenValue(tokens, 'color', 'ui-black-200'),
      success: tokenValue(tokens, 'color', 'ui-green-500'), danger: tokenValue(tokens, 'color', 'ui-red-500')
    } },
    shape: { radii: { xxs: '6px', xs: '8px', control: '12px', large: '24px', full: '200px' }, border: '1px' },
    layout: { container: { maxWidth: '1124px', paddingInline: '24px', contentWidth: '1076px' }, breakpoints: { smallPhone: '479px', phone: '767px', tablet: '1023px' }, previewWidths: [320, 480, 768, 1024] },
    controls: { button: button.visual },
    signaturePatterns: [
      { id: 'blue-hero', rule: 'Синий сервисный фон объединяет верхний уровень страницы и поисковую композицию.', evidence: 'machine/components/site-header.json' },
      { id: 'single-content-column', rule: 'Основной контент следует контейнеру 1124px без постоянного сайдбара.', evidence: 'docs/guide/layout.md' },
      { id: 'inter-only', rule: 'Весь интерфейс и примеры используют Inter.', evidence: 'docs/guide/typography.md' }
    ],
    sources: ['machine/dimension-tokens.json', 'machine/tokens.json', 'machine/semantic-tokens.json', 'docs/guide/typography.md', 'docs/guide/layout.md', 'machine/components/button.json'],
    unknowns: ['Пакет пригоден к использованию в пределах покрытия; непокрытые состояния и сценарии перечислены в адресных спецификациях.']
  };
}

export function writeStyleProfile() {
  const profile = buildStyleProfile();
  fs.writeFileSync(path.join(root, 'machine/style-profile.json'), `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  const visuals = {
    colors: profile.colors,
    typography: profile.typography,
    'radii-borders': profile.shape,
    'responsive-layout': profile.layout,
    'spacing-grid': { container: profile.layout.container, previewWidths: profile.layout.previewWidths },
    iconography: { format: 'SVG', source: 'ui/assets/icons', defaultViewBox: '0 0 24 24' }
  };
  for (const [id, visual] of Object.entries(visuals)) {
    const target = path.join(root, 'machine/foundations', `${id}.json`);
    const item = JSON.parse(fs.readFileSync(target, 'utf8'));
    item.visual = { ...(item.visual || {}), ...visual };
    fs.writeFileSync(target, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeStyleProfile();
