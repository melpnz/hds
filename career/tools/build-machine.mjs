/**
 * Собирает машиночитаемый слой пакета в machine/*.json.
 *
 * Слой собирается ИЗ ИСТОЧНИКОВ, а не пишется руками рядом с текстом: правка
 * machine/*.json бессмысленна, следующая сборка её сотрёт. Руками пишется
 * только то, чего скрипт снять не может, — machine/*.overrides.json.
 *
 * Запуск: node tools/build-machine.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

// Файлы пакета хранятся с CRLF, а разбор ниже рассчитан на LF.
const EOL = new RegExp(String.fromCharCode(13) + String.fromCharCode(10), "g");
const read = f => fs.readFileSync(f, 'utf8').replace(EOL, String.fromCharCode(10));
const readJson = f => (fs.existsSync(f) ? JSON.parse(read(f)) : {});
const out = {};

/* ---------------------------------------------------------------- tokens */

function buildTokens() {
  const css = read('ui/tokens.css');
  const groups = {};
  for (const line of css.split('\n')) {
    const m = line.match(/^\s*--([\w-]+):\s*([^;]+);(?:\s*\/\*\s*\[(\w+)\]\s*\*\/)?/);
    if (!m) continue;
    const [, name, rawValue, status] = m;
    const value = rawValue.trim();

    // Первый сегмент имени — группа DTCG: color-ui-primary -> color / ui-primary
    const dash = name.indexOf('-');
    const group = dash === -1 ? 'other' : name.slice(0, dash);
    const key = dash === -1 ? name : name.slice(dash + 1);

    // Ссылка на другой токен записывается фигурными скобками, как в DTCG.
    const ref = value.match(/^var\(--([\w-]+)\)$/);
    const refDash = ref ? ref[1].indexOf('-') : -1;

    const token = {
      $type: /^#|^rgb|^hsl|color-mix|gradient/.test(value) ? 'color'
        : /^-?[\d.]+(px|rem|em|%)$/.test(value) ? 'dimension'
        : 'other',
      $value: ref ? `{${ref[1].slice(0, refDash)}.${ref[1].slice(refDash + 1)}}` : value,
      $extensions: { guide: { cssVar: `--${name}`, source: ':root career-web' } },
    };
    if (status) token.$extensions.guide.status = status;

    (groups[group] ||= {})[key] = token;
  }
  return groups;
}

/* ------------------------------------------------------------ components */

function specMarkup(specPath) {
  if (!fs.existsSync(specPath)) return null;
  const spec = read(specPath);
  // Границу секции ищем явно: лениво до «\n## » с флагом m ломается о `\n$`,
  // который в многострочном режиме совпадает с концом любой строки.
  const start = spec.indexOf('\n## Разметка');
  if (start === -1) return null;
  const rest = spec.slice(start + 1);
  const next = rest.indexOf('\n## ', 1);
  const section = next === -1 ? rest : rest.slice(0, next);
  const code = section.match(/```html\n([\s\S]*?)```/);
  return code ? code[1].trim() : null;
}

function buildComponents() {
  const manifest = JSON.parse(read('components/manifest.json'));
  const overrides = readJson('machine/components.overrides.json');

  return manifest.components.map(c => {
    const spec = path.join('components', c.specPath);
    const markup = specMarkup(spec);
    const extra = overrides[c.id] || {};

    const entry = {
      id: c.id,
      name: c.canonicalName,
      category: c.category,
      kind: c.kind,
      spec,
      status: c.status,
      states: c.requiredStates,
      cssRoots: c.cssRoots,
      anchor: c.showcaseAnchor ? `showcase/components.html#${c.showcaseAnchor}` : null,
      markup: markup ? { html: markup, requires: ['ui/career.css'] } : null,
      evidence: (c.figmaEvidence || []).map(f => ({ type: 'figma', fileKey: f.fileKey, nodeId: f.nodeId, sourceName: f.sourceName })),
    };
    // Мост в код продукта. Имя Vue-компонента выводится из Storybook, а вот
    // import-путь и props из репозитория career-web в пакет не попадали —
    // объявлять их значило бы гадать. См. ROADMAP.md, пункт про мост в код.
    if (c.storybookNames?.length) {
      entry.storybookNames = c.storybookNames;
      entry.code = { component: c.storybookNames[0], importPath: null, props: null,
        note: 'import-путь и props требуют доступа к репозиторию career-web' };
    }
    if (c.legacyAliases?.length) entry.legacyAliases = c.legacyAliases;
    return { ...entry, ...extra };
  });
}

/* ----------------------------------------------------------------- rules */

function buildRules() {
  const rules = [];
  const overrides = readJson('machine/rules.overrides.json');

  // §1–§12: таблицы вида | **SH-1** | формулировка | наблюдений |
  const composition = read('docs/guide/composition.md');
  let scope = null;
  for (const line of composition.split('\n')) {
    const head = line.match(/^## \d+ · (.+?)(?: · ([A-Z]+))?$/);
    if (head) { scope = head[1].trim(); continue; }
    const row = line.match(/^\|\s*\*\*([A-Z]{1,2}-\d+)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (!row) continue;
    rules.push({
      id: row[1],
      kind: 'rule',
      scope,
      statement: row[2].trim(),
      predicate: overrides[row[1]]?.predicate || { type: 'manual', check: row[2].replace(/\*\*|`/g, '').trim() },
      evidence: { observations: row[3].trim() },
      humanDoc: `docs/guide/composition.md#${row[1].toLowerCase()}`,
    });
  }

  // §13: Decision Guides
  const decisions = read('docs/guide/decisions.md');
  const blocks = decisions.split(/^### (DG-\d+) · /m).slice(1);
  for (let i = 0; i < blocks.length; i += 2) {
    const id = blocks[i];
    const body = blocks[i + 1];
    const field = label => {
      const m = body.match(new RegExp(`\\*\\*${label}\\.?\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|\\n---)`));
      return m ? m[1].trim().replace(/\s+/g, ' ') : null;
    };
    const title = body.split('\n')[0].trim();
    rules.push({
      id,
      kind: 'decision-guide',
      name: title || null,
      observed: field('OBSERVED'),
      when: field('Когда'),
      prefer: field('Предпочитай'),
      avoid: field('Избегай'),
      gap: field('GAP'),
      confidence: (body.match(/Confidence:\s*(\w+)/) || [])[1] || null,
      humanDoc: `docs/guide/decisions.md#${id.toLowerCase()}`,
    });
  }

  return rules;
}

/* -------------------------------------------------------------- patterns */

function buildPatterns(components) {
  const pages = read('showcase/pages.html');
  const overrides = readJson('machine/patterns.overrides.json');
  const roots = new Map();
  for (const c of components) for (const r of c.cssRoots || []) roots.set(r, c.id);

  const patterns = [];
  const sections = [...pages.matchAll(/<section class="pattern" id="p-([a-z-]+)">/g)];
  for (let i = 0; i < sections.length; i += 1) {
    const id = sections[i][1];
    const from = sections[i].index;
    const to = i + 1 < sections.length ? sections[i + 1].index : pages.length;
    const body = pages.slice(from, to);

    const name = (body.match(/<h2>([^<]+)<\/h2>/) || [])[1] || null;
    const summary = (body.match(/<\/h2>\s*<p>([\s\S]*?)<\/p>/) || [])[1];
    const rules = [...new Set([...body.matchAll(/<li title="[^"]*">([A-Z]{1,2}-\d+)<\/li>/g)].map(m => m[1]))];

    const extra = overrides[id] || {};
    patterns.push({
      id,
      name,
      summary: summary ? summary.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null,
      grid: extra.grid !== undefined ? extra.grid : null,
      note: extra.note || null,
      areas: null,
      responsive: extra.responsive || [],
      rules,
      example: { showcase: `showcase/pages.html#p-${id}` },
    });
  }
  return patterns;
}

/* --------------------------------------------------------------- content */

function buildContent() {
  const o = readJson('machine/content.overrides.json');
  if (!o.observed) return null;
  return {
    source: 'docs/guide/decisions.md#14',
    caveat: 'наблюдения, а не свод: в пакете около 20 настоящих продуктовых строк',
    observed: o.observed,
    unknown: o.unknown || [],
    onUnknown: o.onUnknown || null,
  };
}

/* ----------------------------------------------------------------- index */

function buildIndex(components, rules, tokens, patterns) {
  const specs = fs.readdirSync('components', { withFileTypes: true })
    .filter(e => e.isDirectory())
    .flatMap(e => fs.readdirSync(path.join('components', e.name))).length;

  return {
    product: 'career',
    kind: 'product-interface',
    language: 'ru',
    css: 'ui/career.css',
    shell: { wrapper: '.career-shell', note: 'нужен только для layout.css: он написан на @container, а не на @media' },
    files: {
      tokens: 'machine/tokens.json',
      components: 'machine/components.json',
      rules: 'machine/rules.json',
      patterns: 'machine/patterns.json',
      content: 'machine/content.json',
    },
    humanDocs: ['README.md', 'docs/development/quick-start.md', 'docs/guide/composition.md', 'docs/guide/decisions.md'],
    checks: [
      'node tools/validate-machine.mjs',
      'node tools/validate-components.mjs --strict',
      'node tools/validate-classes.mjs <файл.html>',
      'node tools/validate-counts.mjs',
    ],
    coverage: {
      componentsComplete: components.filter(c => c.status === 'complete').length,
      componentsTotal: components.length,
      specs,
      rules: rules.filter(r => r.kind === 'rule').length,
      decisionGuides: rules.filter(r => r.kind === 'decision-guide').length,
      patterns: patterns.length,
      tokens: Object.values(tokens).reduce((n, g) => n + Object.keys(g).length, 0),
      boundary: 'публичная часть продукта, снятая гостем. Не покрыты: личный кабинет, формы ввода, модальные потоки, загрузка, ошибки форм, сценарии успеха',
      onUncovered: 'взять ближайший подтверждённый паттерн, назвать допущение вслух и спросить — не достраивать молча',
    },
    notGenerated: {
      areas: 'последовательность областей внутри паттерна не извлечена: композиции в showcase/pages.html собраны не из каркасных модулей R4, а из ad-hoc классов — извлекать не из чего. См. ROADMAP.md',
    },
    generatedAt: new Date().toISOString().slice(0, 10),
    generatedBy: 'tools/build-machine.mjs',
  };
}

/* ------------------------------------------------------------------ сборка */

fs.mkdirSync('machine', { recursive: true });

const tokens = buildTokens();
const components = buildComponents();
const rules = buildRules();
const patterns = buildPatterns(components);
const content = buildContent();
const index = buildIndex(components, rules, tokens, patterns);

out['machine/tokens.json'] = tokens;
out['machine/components.json'] = components;
out['machine/rules.json'] = rules;
out['machine/patterns.json'] = patterns;
if (content) out['machine/content.json'] = content;
out['machine/index.json'] = index;

for (const [file, data] of Object.entries(out)) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

console.log('Собрано:');
console.log(`  tokens.json      ${index.coverage.tokens} токенов`);
console.log(`  components.json  ${components.length} записей, ${components.filter(c => c.markup).length} с разметкой`);
console.log(`  rules.json       ${index.coverage.rules} правил + ${index.coverage.decisionGuides} decision guides`);
console.log(`  patterns.json    ${patterns.length} паттернов страниц`);
if (content) console.log(`  content.json     ${content.observed.length} наблюдений, ${content.unknown.length} пробелов`);
console.log('  index.json');
