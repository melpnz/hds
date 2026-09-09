const navigation = document.querySelector('#navigation');
const searchInput = document.querySelector('#guide-search');
const searchMeta = document.querySelector('#search-meta');
const title = document.querySelector('#item-title');
const badges = document.querySelector('#item-badges');
const exampleTabs = document.querySelector('#example-tabs');
const viewportControls = document.querySelector('#viewport-controls');
const viewportMeta = document.querySelector('#viewport-meta');
const preview = document.querySelector('#preview');
const previewMissing = document.querySelector('#preview-missing');
const previewCard = document.querySelector('.preview-card');
const previewToolbar = document.querySelector('.preview-toolbar');
const previewStage = document.querySelector('.preview-stage');
const guide = document.querySelector('#guide');
const rawJson = document.querySelector('#raw-json');
const specSource = document.querySelector('#spec-source');

let catalog = [];
let searchDocuments = new Map();
let currentItem;
let currentExample;
let previewResizeObserver;

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const label = value => escapeHtml(String(value ?? '').replaceAll('-', ' '));
const pills = values => values?.length
  ? `<div class="pills">${values.map(value => `<code>${label(value)}</code>`).join('')}</div>`
  : '<span class="empty-value">не зафиксировано</span>';
const list = (values, render = escapeHtml) => values?.length
  ? `<ul>${values.map(value => `<li>${render(value)}</li>`).join('')}</ul>`
  : '<p class="empty-value">Не зафиксировано.</p>';

function normalizeRelativePath(path) {
  const parts = [];
  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

function resolveDocumentHref(href, sourcePath) {
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return href;
  const [path, anchor = ''] = href.split('#');
  const source = String(sourcePath || '').replace(/^archive:career\/v1\//, '');
  const base = source.includes('/') ? source.slice(0, source.lastIndexOf('/') + 1) : '';
  const resolved = normalizeRelativePath(`${base}${path}`);
  const documentEntry = catalog.find(entry => entry.sourcePath === `archive:career/v1/${resolved}`);
  if (documentEntry) return `#${documentEntry.id}`;
  if (resolved === 'showcase/pages.html' && anchor.startsWith('p-')) return `#${anchor.slice(2)}`;
  const anchoredEntry = anchor && catalog.find(entry => entry.tags?.includes(anchor));
  if (anchoredEntry) return `#${anchoredEntry.id}`;
  if (resolved.startsWith('evidence/') || resolved.startsWith('ui/')) return `../${resolved}${anchor ? `#${anchor}` : ''}`;
  return href;
}

function renderInlineMarkdown(value, sourcePath) {
  const tokens = [];
  const stash = html => { const key = `\u0000${tokens.length}\u0000`; tokens.push(html); return key; };
  let text = String(value || '')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, href) => stash(`<img loading="lazy" src="${escapeHtml(resolveDocumentHref(href, sourcePath))}" alt="${escapeHtml(alt)}">`))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, caption, href) => stash(`<a href="${escapeHtml(resolveDocumentHref(href, sourcePath))}">${escapeHtml(caption)}</a>`))
    .replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));
  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
  return text;
}

function renderMarkdown(markdown, sourcePath) {
  const lines = String(markdown || '').split(/\r?\n/);
  const html = [];
  let index = 0;
  const isSpecial = line => /^(#{1,6})\s+/.test(line) || /^```/.test(line) || /^\s*([-*+] |\d+\. )/.test(line) || /^>\s?/.test(line);
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const fence = line.match(/^```([^\s]*)/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++]);
      index += 1;
      html.push(`<pre class="md-code"><code data-language="${escapeHtml(fence[1])}">${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) { const level = Math.min(6, heading[1].length + 1); html.push(`<h${level}>${renderInlineMarkdown(heading[2], sourcePath)}</h${level}>`); index += 1; continue; }
    if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[index + 1])) {
      const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
      const head = cells(line); index += 2; const rows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(cells(lines[index++]));
      html.push(`<div class="md-table-wrap"><table><thead><tr>${head.map(cell => `<th>${renderInlineMarkdown(cell, sourcePath)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell, sourcePath)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.+)/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]); const items = [];
      while (index < lines.length) { const match = lines[index].match(/^\s*([-*+]|\d+\.)\s+(.+)/); if (!match || /\d+\./.test(match[1]) !== ordered) break; items.push(match[2]); index += 1; }
      const tag = ordered ? 'ol' : 'ul'; html.push(`<${tag}>${items.map(item => `<li>${renderInlineMarkdown(item, sourcePath)}</li>`).join('')}</${tag}>`); continue;
    }
    if (/^>\s?/.test(line)) { const quote = []; while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, '')); html.push(`<blockquote>${renderInlineMarkdown(quote.join(' '), sourcePath)}</blockquote>`); continue; }
    const paragraph = [line.trim()]; index += 1;
    while (index < lines.length && lines[index].trim() && !isSpecial(lines[index]) && !(lines[index].includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[index + 1]))) paragraph.push(lines[index++].trim());
    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '), sourcePath)}</p>`);
  }
  return html.join('');
}

function searchableText(entry) {
  return [entry.id, entry.title, entry.kind, entry.category, ...(entry.tags || []), searchDocuments.get(entry.id) || '']
    .join(' ')
    .toLocaleLowerCase('ru');
}

function renderNavigation(query = '') {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const matches = normalizedQuery
    ? catalog.filter(entry => searchableText(entry).includes(normalizedQuery))
    : catalog;
  const activeId = currentItem?.id || location.hash.slice(1) || catalog[0]?.id;
  const sections = new Map();
  for (const entry of matches) {
    if (!sections.has(entry.navSection)) {
      sections.set(entry.navSection, { id: entry.navSection, title: entry.navSectionTitle, entries: [], groups: new Map() });
    }
    const section = sections.get(entry.navSection);
    section.entries.push(entry);
    if (entry.navGroup) {
      if (!section.groups.has(entry.navGroup)) section.groups.set(entry.navGroup, { id: entry.navGroup, title: entry.navGroupTitle, entries: [] });
      section.groups.get(entry.navGroup).entries.push(entry);
    }
  }
  const renderLinks = entries => entries.map(entry => `
    <a class="nav-link" href="#${escapeHtml(entry.id)}" data-item="${escapeHtml(entry.id)}">
      <span>${escapeHtml(entry.title)}</span>
    </a>`).join('');
  navigation.innerHTML = matches.length ? [...sections.values()].map(section => {
    const sectionActive = section.entries.some(entry => entry.id === activeId);
    const sectionBody = section.groups.size
      ? [...section.groups.values()].map(group => {
          const groupActive = group.entries.some(entry => entry.id === activeId);
          return `<details class="nav-subgroup" data-nav-group="${escapeHtml(group.id)}" ${normalizedQuery || groupActive ? 'open' : ''}>
            <summary><span>${escapeHtml(group.title)}</span><small>${group.entries.length}</small></summary>
            <div class="nav-links">${renderLinks(group.entries)}</div>
          </details>`;
        }).join('')
      : `<div class="nav-links">${renderLinks(section.entries)}</div>`;
    return `<section class="nav-section" data-nav-section="${escapeHtml(section.id)}">
      <details ${normalizedQuery || sectionActive ? 'open' : ''}>
        <summary class="nav-section__title"><span>${escapeHtml(section.title)}</span><small>${section.entries.length}</small></summary>
        <div class="nav-section__body">${sectionBody}</div>
      </details>
    </section>`;
  }).join('') : `
    <div class="search-empty">
      <strong>Ничего не найдено</strong>
      <span>Попробуйте название, категорию или состояние.</span>
      <button type="button" id="clear-search">Сбросить поиск</button>
    </div>`;
  searchMeta.textContent = normalizedQuery ? `${matches.length} из ${catalog.length}` : '';
  document.querySelector('#clear-search')?.addEventListener('click', clearSearch);
  navigation.querySelector(`[data-item="${CSS.escape(activeId)}"]`)?.setAttribute('aria-current', 'page');
}

function clearSearch() {
  searchInput.value = '';
  renderNavigation();
  searchInput.focus();
}

function renderBadges(item) {
  const values = [
    ['spec', item.maturity.spec],
    ['markup', item.maturity.markup],
    ['confidence', item.knowledge.confidence]
  ];
  badges.innerHTML = values.map(([key, value]) =>
    `<span class="status" data-status="${escapeHtml(value)}">${key}: ${label(value)}</span>`
  ).join('');
}

function setViewport(width) {
  const isAuto = width === 'full';
  preview.style.width = isAuto ? '100%' : `${width}px`;
  viewportMeta.textContent = isAuto ? 'по ширине контейнера' : `${width} px`;
  viewportControls.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.width === String(width)));
  });
}

function renderViewportControls(example) {
  const widths = [...new Set(example.preview.widths)];
  viewportControls.innerHTML = [
    ...widths.map(width => `<button type="button" data-width="${width}">${width}</button>`),
    '<button type="button" data-width="full" aria-pressed="true">Auto</button>'
  ].join('');
  viewportControls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => setViewport(button.dataset.width));
  });
  setViewport('full');
}

function disconnectPreviewObserver() {
  previewResizeObserver?.disconnect();
  previewResizeObserver = undefined;
}

function fitPreviewHeight() {
  if (currentExample?.preview?.mode !== 'intrinsic') return;
  const documentElement = preview.contentDocument?.documentElement;
  const body = preview.contentDocument?.body;
  if (!documentElement || !body) return;
  preview.style.height = '1px';
  const height = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight);
  preview.style.height = `${Math.max(1, Math.ceil(height))}px`;
}

function watchIntrinsicPreview() {
  disconnectPreviewObserver();
  fitPreviewHeight();
  const body = preview.contentDocument?.body;
  if (!body || !preview.contentWindow?.ResizeObserver) return;
  previewResizeObserver = new preview.contentWindow.ResizeObserver(() => requestAnimationFrame(fitPreviewHeight));
  previewResizeObserver.observe(body);
  preview.contentDocument.fonts?.ready.then(fitPreviewHeight);
  preview.contentDocument.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', fitPreviewHeight, { once: true });
  });
}

preview.addEventListener('load', () => {
  if (currentExample?.preview?.mode === 'intrinsic') watchIntrinsicPreview();
});

function selectExample(exampleId) {
  disconnectPreviewObserver();
  currentExample = currentItem.examples.find(example => example.id === exampleId) || currentItem.examples[0];
  exampleTabs.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.example === currentExample.id));
  });
  const mode = currentExample.preview?.mode || 'viewport';
  const isIntrinsic = mode === 'intrinsic';
  previewCard.dataset.previewMode = mode;
  previewToolbar.hidden = isIntrinsic;
  viewportControls.hidden = isIntrinsic;
  viewportMeta.hidden = isIntrinsic;
  previewStage.classList.toggle('preview-stage--intrinsic', isIntrinsic);
  preview.scrolling = isIntrinsic ? 'no' : 'auto';
  preview.style.width = '100%';
  preview.style.height = isIntrinsic ? '1px' : `${currentExample.preview.height}px`;
  if (isIntrinsic) viewportControls.innerHTML = '';
  else renderViewportControls(currentExample);
  preview.title = `${currentItem.title}: ${currentExample.title}`;
  const query = currentExample.query ? `?${currentExample.query}` : '';
  const anchor = currentExample.anchor || '';
  preview.src = `../${currentExample.file}${query}${anchor}`;
}

function renderExamples(item) {
  if (item.previewMode === 'none') {
    previewCard.hidden = true;
    return;
  }
  previewCard.hidden = false;
  if (!item.examples.length) {
    exampleTabs.hidden = true;
    viewportControls.hidden = true;
    viewportMeta.hidden = true;
    preview.hidden = true;
    previewMissing.hidden = false;
    previewMissing.innerHTML = `
      <strong>Пример недоступен</strong>
      <p>${escapeHtml(item.implementation.missingReason || 'Причина не зафиксирована.')}</p>
      <p><b>Fallback:</b> ${escapeHtml(item.implementation.fallback || 'Не задан.')}</p>`;
    return;
  }

  exampleTabs.hidden = item.examples.length < 2;
  preview.hidden = false;
  previewMissing.hidden = true;
  exampleTabs.innerHTML = item.examples.map(example => `
    <button type="button" role="tab" data-example="${escapeHtml(example.id)}">
      ${escapeHtml(example.title)}
    </button>`).join('');
  exampleTabs.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => selectExample(button.dataset.example));
  });
  selectExample(item.examples[0].id);
}

function renderGuide(item) {
  const stateGroups = item.stateGroups || (Array.isArray(item.states)
    ? { ui: item.states, feature: [], domain: [] }
    : item.states) || { ui: [], feature: [], domain: [] };
  const composition = item.kind === 'pattern' ? `
    <section class="spec-section">
      <h2>Композиция</h2>
      <dl>
        <dt>Семейство</dt><dd>${escapeHtml(item.family)}</dd>
        <dt>Области</dt><dd>${pills(item.areas)}</dd>
        <dt>Модули</dt><dd>${pills(item.modules)}</dd>
        <dt>Компоненты</dt><dd>${pills(item.components)}</dd>
      </dl>
    </section>` : '';
  const variants = item.variants?.length ? `
    <section class="spec-section">
      <h2>Варианты</h2>
      ${list(item.variants, variant => `<code>${escapeHtml(variant.id)}</code> — ${escapeHtml(variant.use)}`)}
    </section>` : '';
  const responsive = item.responsive?.length ? `
    <section class="spec-section">
      <h2>Адаптив</h2>
      ${list(item.responsive, rule => `до <code>${escapeHtml(rule.maxWidth)} px</code>: ${escapeHtml(rule.change)}`)}
    </section>` : '';
  const colorGroups = item.groups?.length ? `
    <section class="spec-section">
      <h2>Группы токенов</h2>
      <div class="token-groups">
        ${item.groups.map(group => `<a href="../${escapeHtml(group.file)}"><strong>${escapeHtml(group.title)}</strong><span>${group.tokens} токенов</span></a>`).join('')}
      </div>
    </section>` : '';
  const roles = item.roles?.length ? `
    <section class="spec-section">
      <h2>Ключевые роли</h2>
      <div class="data-table">
        ${item.roles.map(role => `<div><code>${escapeHtml(role.token)}</code><span>${label(role.role)}</span><b>${escapeHtml(role.value)}</b></div>`).join('')}
      </div>
    </section>` : '';
  const typeScale = item.typeScale?.length ? `
    <section class="spec-section">
      <h2>Шкала текста</h2>
      <div class="data-table">
        ${item.typeScale.map(style => `<div><code>${escapeHtml(style.id)}</code><span>${style.size}px</span><b>${style.lineHeight}px</b></div>`).join('')}
      </div>
    </section>` : '';
  const sizes = item.sizes?.length ? `
    <section class="spec-section">
      <h2>Размеры</h2>
      <div class="data-table">
        ${item.sizes.map(size => `<div><code>${escapeHtml(size.class)}</code><span>${size.height}px · ${escapeHtml(size.typography)}</span><b>r${size.radius}</b></div>`).join('')}
      </div>
    </section>` : '';
  const anatomy = item.anatomy?.length ? `
    <section class="spec-section">
      <h2>Анатомия</h2>
      ${pills(item.anatomy)}
    </section>` : '';
  const grid = item.grid ? `
    <section class="spec-section">
      <h2>Сетка</h2>
      <div class="json-card"><pre>${escapeHtml(JSON.stringify(item.grid, null, 2))}</pre></div>
    </section>` : '';
  const patternNote = item.note ? `
    <section class="spec-section">
      <h2>Примечание</h2>
      <p>${escapeHtml(item.note)}</p>
    </section>` : '';
  const values = item.values ? `
    <section class="spec-section">
      <h2>Значения</h2>
      <div class="json-card"><pre>${escapeHtml(JSON.stringify(item.values, null, 2))}</pre></div>
    </section>` : '';
  const foundationGeometry = item.container || item.breakpoints || item.nonBreakpoints ? `
    <section class="spec-section">
      <h2>Геометрия</h2>
      <div class="json-card"><pre>${escapeHtml(JSON.stringify({ container: item.container, breakpoints: item.breakpoints, nonBreakpoints: item.nonBreakpoints }, null, 2))}</pre></div>
    </section>` : '';
  const implementation = item.code || item.storybookNames?.length || item.legacyAliases?.length ? `
    <section class="spec-section">
      <h2>Реализация и имена</h2>
      <div class="json-card"><pre>${escapeHtml(JSON.stringify({ code: item.code, storybookNames: item.storybookNames, legacyAliases: item.legacyAliases }, null, 2))}</pre></div>
    </section>` : '';
  const decision = item.kind === 'decision-guide' ? `
    <section class="spec-section">
      <h2>Решение</h2>
      <dl>
        <dt>Наблюдение</dt><dd>${escapeHtml(item.observed)}</dd>
        <dt>Когда</dt><dd>${escapeHtml(item.when)}</dd>
        <dt>Предпочитать</dt><dd>${escapeHtml(item.prefer)}</dd>
        <dt>Избегать</dt><dd>${escapeHtml(item.avoid)}</dd>
      </dl>
    </section>` : '';
  const predicate = item.kind === 'rule' ? `
    <section class="spec-section">
      <h2>Проверка</h2>
      <div class="json-card"><pre>${escapeHtml(JSON.stringify(item.predicate, null, 2))}</pre></div>
    </section>` : '';
  const contentRules = item.content?.observed ? `
    <section class="spec-section">
      <h2>Наблюдаемые правила текста</h2>
      ${list(item.content.observed, rule => `<code>${escapeHtml(rule.id)}</code> — ${escapeHtml(rule.rule)}`)}
    </section>` : '';
  const sections = item.guideSections || item.sections;
  const documentation = item.markdown ? `
    <section class="spec-section full-document">
      <h2>Полный исходный документ</h2>
      <div class="markdown-body">${renderMarkdown(item.markdown, item.sourcePath)}</div>
    </section>` : sections?.length ? `
    <section class="spec-section">
      <h2>Документация</h2>
      <div class="doc-sections">
        ${sections.map(section => `<details><summary>${escapeHtml(section.title)}</summary><pre>${escapeHtml(section.markdown)}</pre></details>`).join('')}
      </div>
    </section>` : '';
  const sourceData = item.sourceDataFile ? `
    <section class="spec-section">
      <h2>Исходные данные</h2>
      <details class="source-data" data-source-file="${escapeHtml(item.sourceDataFile)}">
        <summary>Показать полный JSON</summary>
        <pre>Данные загрузятся при открытии.</pre>
      </details>
    </section>` : '';
  const evidenceItems = Array.isArray(item.evidence)
    ? item.evidence
    : item.evidence ? [{ type: 'evidence', ref: JSON.stringify(item.evidence) }] : [];
  const ruleRefs = item.ruleFiles || item.rules || [];

  guide.innerHTML = `
    <p class="lead">${escapeHtml(item.purpose)}</p>
    <dl class="facts">
      <div><dt>Авторитетность</dt><dd>${item.knowledge.authority.map(label).join(', ')}</dd></div>
      <div><dt>Область</dt><dd>${label(item.knowledge.scope)}</dd></div>
      <div><dt>CSS roots</dt><dd>${pills(item.implementation.cssRoots)}</dd></div>
    </dl>
    ${colorGroups}
    ${roles}
    ${typeScale}
    ${composition}
    ${grid}
    ${patternNote}
    ${values}
    ${foundationGeometry}
    ${anatomy}
    ${variants}
    ${sizes}
    ${implementation}
    ${decision}
    ${predicate}
    ${contentRules}
    <section class="spec-section">
      <h2>Состояния</h2>
      <div class="spec-grid">
        <div><h3>UI</h3>${pills(stateGroups.ui)}</div>
        <div><h3>Feature</h3>${pills(stateGroups.feature)}</div>
        <div><h3>Domain</h3>${pills(stateGroups.domain)}</div>
      </div>
    </section>
    ${responsive}
    <section class="spec-section">
      <h2>Доступность</h2>
      ${list(item.accessibility)}
    </section>
    <section class="spec-section">
      <h2>Правила</h2>
      ${list(ruleRefs, rule => rule.includes('/') ? `<a href="../${escapeHtml(rule)}">${escapeHtml(rule)}</a>` : `<code>${escapeHtml(rule)}</code>`)}
    </section>
    <section class="spec-section">
      <h2>Основания</h2>
      ${list(evidenceItems, evidence => `<code>${label(evidence.type)}</code> — ${escapeHtml(typeof evidence.ref === 'string' ? evidence.ref : JSON.stringify(evidence.ref))}${evidence.observations ? ` (${evidence.observations} наблюдения)` : ''}`)}
    </section>
    ${documentation}
    ${sourceData}
    <section class="spec-section spec-section--unknown">
      <h2>Неизвестно / не покрыто</h2>
      ${list(item.unknowns)}
    </section>`;

  guide.querySelectorAll('.source-data').forEach(details => {
    details.addEventListener('toggle', async () => {
      if (!details.open || details.dataset.loaded) return;
      const target = details.querySelector('pre');
      try {
        const response = await fetch(`../${details.dataset.sourceFile}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        target.textContent = await response.text();
        details.dataset.loaded = 'true';
      } catch (error) {
        target.textContent = `Не удалось загрузить данные: ${error.message}`;
      }
    });
  });
}

async function renderItem() {
  const id = location.hash.slice(1) || catalog[0].id;
  const entry = catalog.find(candidate => candidate.id === id) || catalog[0];
  currentItem = await fetch(`../${entry.file}`).then(response => response.json());
  document.querySelectorAll('[data-item]').forEach(link => {
    if (link.dataset.item === entry.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const activeLink = navigation.querySelector(`[data-item="${CSS.escape(entry.id)}"]`);
  activeLink?.closest('.nav-subgroup')?.setAttribute('open', '');
  activeLink?.closest('.nav-section > details')?.setAttribute('open', '');
  title.textContent = currentItem.title;
  renderBadges(currentItem);
  renderExamples(currentItem);
  renderGuide(currentItem);
  rawJson.textContent = JSON.stringify(currentItem, null, 2);
  specSource.href = `../${entry.file}`;
  specSource.textContent = entry.file;
}

async function loadCatalog() {
  const catalogIndex = await fetch('../machine/catalog.json').then(response => response.json());
  const sections = await Promise.all(catalogIndex.sections.map(async section => {
    if (section.file) {
      const entries = await fetch(`../${section.file}`).then(response => response.json());
      return entries.map(entry => ({ ...entry, navSection: section.id, navSectionTitle: section.title }));
    }
    const groups = await Promise.all((section.groups || []).map(async group => {
      const entries = await fetch(`../${group.file}`).then(response => response.json());
      return entries.map(entry => ({
        ...entry,
        navSection: section.id,
        navSectionTitle: section.title,
        navGroup: group.id,
        navGroupTitle: group.title
      }));
    }));
    return groups.flat();
  }));
  return sections.flat();
}

Promise.all([
  fetch('../machine/index.json').then(response => response.json()),
  loadCatalog(),
  fetch('search-index.json').then(response => response.json())
]).then(([index, entries, searchIndex]) => {
  catalog = entries;
  searchDocuments = new Map(searchIndex.map(document => [document.id, document.text.toLocaleLowerCase('ru')]));
  document.querySelector('#product-title').textContent = index.product.title;
  document.querySelector('#guide-version').textContent = `Guide ${index.product.guideVersion}`;
  renderNavigation();
  return renderItem();
}).catch(error => {
  title.textContent = 'Не удалось загрузить витрину';
  guide.textContent = error.message;
});

window.addEventListener('hashchange', () => renderItem().catch(console.error));

searchInput.addEventListener('input', () => renderNavigation(searchInput.value));
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Escape' && searchInput.value) clearSearch();
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});
