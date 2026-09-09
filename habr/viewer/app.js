const navigation = document.querySelector('#navigation');
const searchInput = document.querySelector('#guide-search');
const searchMeta = document.querySelector('#search-meta');
const title = document.querySelector('#item-title');
const badges = document.querySelector('#item-badges');
const exampleTabs = document.querySelector('#example-tabs');
const exampleStack = document.querySelector('#example-stack');
const viewportControls = document.querySelector('#viewport-controls');
const viewportMeta = document.querySelector('#viewport-meta');
const preview = document.querySelector('#preview');
const previewMissing = document.querySelector('#preview-missing');
const previewCard = document.querySelector('.preview-card');
const previewToolbar = document.querySelector('.preview-toolbar');
const previewStage = document.querySelector('.preview-stage');
const previewNotes = document.querySelector('#preview-notes');
const guide = document.querySelector('#guide');
const rawJson = document.querySelector('#raw-json');
const specSource = document.querySelector('#spec-source');

let catalog = [];
let searchDocuments = new Map();
let currentItem;
let currentExample;
let previewResizeObservers = [];
const viewportWidths = [320, 480, 768, 1024];

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
  const compatibilitySnapshot = sourcePath === 'docs/source/v1-overview.md';
  const base = compatibilitySnapshot ? '' : (sourcePath.includes('/') ? sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1) : '');
  const resolved = normalizeRelativePath(`${base}${path}`);
  const documentEntry = catalog.find(entry => entry.markdown === resolved);
  if (documentEntry) return `#${documentEntry.id}`;
  return `../${resolved}${anchor ? `#${anchor}` : ''}`;
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
  const special = line => /^(#{1,6})\s+/.test(line) || /^```/.test(line) || /^\s*([-*+] |\d+\. )/.test(line) || /^>\s?/.test(line);
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim() || line.trim() === '---') { index += 1; continue; }
    const fence = line.match(/^```([^\s]*)/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++]);
      index += 1;
      html.push(`<pre class="md-code"><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      html.push(`<h${level}>${renderInlineMarkdown(heading[2], sourcePath)}</h${level}>`);
      index += 1;
      continue;
    }
    if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[index + 1])) {
      const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
      const head = cells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(cells(lines[index++]));
      html.push(`<div class="md-table-wrap"><table><thead><tr>${head.map(cell => `<th>${renderInlineMarkdown(cell, sourcePath)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell, sourcePath)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.+)/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]);
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*([-*+]|\d+\.)\s+(.+)/);
        if (!match || /\d+\./.test(match[1]) !== ordered) break;
        items.push(match[2]);
        index += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map(item => `<li>${renderInlineMarkdown(item, sourcePath)}</li>`).join('')}</${tag}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderInlineMarkdown(quote.join(' '), sourcePath)}</blockquote>`);
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !special(lines[index]) && !(lines[index].includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[index + 1]))) paragraph.push(lines[index++].trim());
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
  const sections = new Map();
  for (const entry of matches) {
    const sectionId = entry.navSection || entry.kind;
    const sectionTitle = entry.navSectionTitle || (entry.kind === 'pattern' ? 'Паттерны' : 'Компоненты');
    if (!sections.has(sectionId)) sections.set(sectionId, { title: sectionTitle, entries: [], groups: new Map() });
    const section = sections.get(sectionId);
    section.entries.push(entry);
    const groupId = entry.navGroup || entry.category;
    const groupTitle = entry.navGroupTitle || entry.category;
    if (!section.groups.has(groupId)) section.groups.set(groupId, { title: groupTitle, entries: [] });
    section.groups.get(groupId).entries.push(entry);
  }
  const activeId = currentItem?.id || location.hash.slice(1) || catalog[0]?.id;
  const renderLinks = entries => entries.map(entry => `
    <a class="nav-link" href="#${escapeHtml(entry.id)}" data-item="${escapeHtml(entry.id)}">
      <span>${escapeHtml(entry.title)}</span>
    </a>`).join('');
  navigation.innerHTML = matches.length ? [...sections.entries()].map(([sectionId, section]) => `
    <section class="nav-section">
      <details ${normalizedQuery || section.entries.some(entry => entry.id === activeId) ? 'open' : ''}>
        <summary class="nav-section__title"><span>${escapeHtml(section.title)}</span><small>${section.entries.length}</small></summary>
        <div class="nav-section__body">
          ${[...section.groups.entries()].map(([groupId, group]) => `
            <details class="nav-subgroup" ${normalizedQuery || group.entries.some(entry => entry.id === activeId) ? 'open' : ''}>
              <summary><span>${escapeHtml(group.title)}</span><small>${group.entries.length}</small></summary>
              <div class="nav-links">${renderLinks(group.entries)}</div>
            </details>`).join('')}
        </div>
      </details>
    </section>`).join('') : `
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

function renderViewportControls() {
  viewportControls.innerHTML = [
    ...viewportWidths.map(width => `<button type="button" data-width="${width}">${width}</button>`),
    '<button type="button" data-width="full" aria-pressed="true">Auto</button>'
  ].join('');
  viewportControls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => setViewport(button.dataset.width));
  });
  setViewport('full');
}

function disconnectPreviewObserver() {
  previewResizeObservers.forEach(observer => observer.disconnect());
  previewResizeObservers = [];
}

function fitPreviewHeight(frame = preview) {
  const documentElement = frame.contentDocument?.documentElement;
  const body = frame.contentDocument?.body;
  if (!documentElement || !body) return;
  frame.style.height = '1px';
  const height = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight);
  frame.style.height = `${Math.max(1, Math.ceil(height))}px`;
}

function watchIntrinsicPreview(frame = preview) {
  fitPreviewHeight(frame);
  const body = frame.contentDocument?.body;
  if (!body || !frame.contentWindow?.ResizeObserver) return;
  const fit = () => fitPreviewHeight(frame);
  const observer = new frame.contentWindow.ResizeObserver(() => requestAnimationFrame(fit));
  observer.observe(body);
  previewResizeObservers.push(observer);
  frame.contentDocument.fonts?.ready.then(fit);
  frame.contentDocument.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', fit, { once: true });
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
  const isIntrinsic = currentExample.preview.mode === 'intrinsic';
  previewCard.dataset.previewMode = currentExample.preview.mode;
  previewToolbar.hidden = isIntrinsic;
  viewportControls.hidden = isIntrinsic;
  viewportMeta.hidden = isIntrinsic;
  previewStage.classList.toggle('preview-stage--intrinsic', isIntrinsic);
  preview.scrolling = isIntrinsic ? 'no' : 'auto';
  preview.style.width = '100%';
  preview.style.height = isIntrinsic ? '1px' : `${currentExample.preview.height}px`;
  if (isIntrinsic) viewportControls.innerHTML = '';
  else renderViewportControls();
  preview.src = `../${currentExample.file}`;
  preview.title = `${currentItem.title}: ${currentExample.title}`;
}

function renderIntrinsicExampleStack(item) {
  disconnectPreviewObserver();
  currentExample = undefined;
  previewToolbar.hidden = true;
  exampleTabs.hidden = true;
  previewStage.hidden = true;
  exampleStack.hidden = false;
  exampleStack.innerHTML = item.examples.map(example => `
    <section class="stacked-example" data-stacked-example="${escapeHtml(example.id)}">
      <h2>${escapeHtml(example.title)}</h2>
      <div class="preview-stage preview-stage--intrinsic">
        <iframe class="preview-frame" scrolling="no" title="${escapeHtml(`${item.title}: ${example.title}`)}"></iframe>
      </div>
    </section>`).join('');
  item.examples.forEach(example => {
    const frame = exampleStack.querySelector(`[data-stacked-example="${CSS.escape(example.id)}"] iframe`);
    frame.addEventListener('load', () => watchIntrinsicPreview(frame));
    frame.src = `../${example.file}`;
  });
}

function renderExamples(item) {
  disconnectPreviewObserver();
  exampleStack.hidden = true;
  exampleStack.innerHTML = '';
  previewStage.hidden = false;
  if (item.previewMode === 'none') {
    previewCard.hidden = true;
    return;
  }
  previewCard.hidden = false;
  if (!item.examples.length) {
    previewToolbar.hidden = true;
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

  const stackIntrinsicExamples = item.examples.length > 1 && item.examples.every(example => example.preview.mode === 'intrinsic');
  if (stackIntrinsicExamples) {
    preview.hidden = true;
    previewMissing.hidden = true;
    renderIntrinsicExampleStack(item);
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

function renderPreviewNotes(item) {
  const notes = item.previewNotes || [];
  previewNotes.hidden = notes.length === 0;
  previewNotes.innerHTML = notes.length ? `
    <h2 id="preview-notes-title">Примечания к превью</h2>
    <ul>${notes.map(note => `
      <li data-note-type="${escapeHtml(note.type)}">
        <span>${note.type === 'assumption' ? 'Допущение' : note.type === 'coverage-warning' ? 'Ограничение покрытия' : 'Пояснение'}</span>
        <p>${escapeHtml(note.text)}</p>
      </li>`).join('')}</ul>` : '';
}

async function renderGuide(item) {
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

  let markdown = '';
  if (item.markdown) {
    const response = await fetch(`../${item.markdown}`);
    if (!response.ok) throw new Error(`Не удалось загрузить ${item.markdown}`);
    markdown = `<section class="markdown-body">${renderMarkdown(await response.text(), item.markdown)}</section>`;
  }
  if (item.kind === 'document') {
    guide.innerHTML = `<p class="lead">${escapeHtml(item.purpose)}</p>${markdown}`;
    return;
  }
  guide.innerHTML = `
    <p class="lead">${escapeHtml(item.purpose)}</p>
    <dl class="facts">
      <div><dt>Авторитетность</dt><dd>${item.knowledge.authority.map(label).join(', ')}</dd></div>
      <div><dt>Область</dt><dd>${label(item.knowledge.scope)}</dd></div>
      <div><dt>CSS roots</dt><dd>${pills(item.implementation.cssRoots)}</dd></div>
    </dl>
    ${composition}
    ${variants}
    <section class="spec-section">
      <h2>Состояния</h2>
      <div class="spec-grid">
        <div><h3>UI</h3>${pills(item.states.ui)}</div>
        <div><h3>Feature</h3>${pills(item.states.feature)}</div>
        <div><h3>Domain</h3>${pills(item.states.domain)}</div>
      </div>
    </section>
    ${responsive}
    <section class="spec-section">
      <h2>Доступность</h2>
      ${list(item.accessibility)}
    </section>
    <section class="spec-section">
      <h2>Правила</h2>
      ${list(item.rules, rule => `<a href="../${escapeHtml(rule)}">${escapeHtml(rule)}</a>`)}
    </section>
    <section class="spec-section">
      <h2>Основания</h2>
      ${list(item.evidence, evidence => `<code>${label(evidence.type)}</code> — ${escapeHtml(evidence.ref)}${evidence.observations ? ` (${evidence.observations} наблюдения)` : ''}`)}
    </section>
    <section class="spec-section spec-section--unknown">
      <h2>Неизвестно / не покрыто</h2>
      ${list(item.unknowns)}
    </section>
    ${markdown}`;
}

async function renderItem() {
  const id = location.hash.slice(1) || catalog[0].id;
  const entry = catalog.find(candidate => candidate.id === id) || catalog[0];
  currentItem = await fetch(`../${entry.file}`).then(response => response.json());
  document.querySelectorAll('[data-item]').forEach(link => {
    if (link.dataset.item === entry.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  title.textContent = currentItem.title;
  renderBadges(currentItem);
  renderExamples(currentItem);
  renderPreviewNotes(currentItem);
  await renderGuide(currentItem);
  rawJson.textContent = JSON.stringify(currentItem, null, 2);
  specSource.href = `../${entry.file}`;
  specSource.textContent = entry.file;
}

Promise.all([
  fetch('../machine/index.json').then(response => response.json()),
  fetch('../machine/catalog.json').then(response => response.json()),
  fetch('search-index.json').then(response => response.ok ? response.json() : [])
]).then(([index, entries, searchIndex]) => {
  catalog = entries;
  searchDocuments = new Map(searchIndex.map(entry => [entry.id, entry.text]));
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
