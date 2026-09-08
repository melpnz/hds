const widths = [1920, 1440, 1280, 1024, 768, 390, 320];
const names = ['margin-mobile', 'margin-tablet', 'margin-compact', 'margin-desktop', 'margin-drawn-wide', 'margin-drawn-tablet', 'columns-mobile', 'columns-tablet', 'columns-desktop', 'gap-mobile', 'gap-desktop', 'margin', 'columns', 'gap'];
const live = document.querySelector('#layout-live');
const source = document.querySelector('#layout-source');
const theme = document.querySelector('#layout-theme');
const refs = [];
for (const width of widths) {
  const section = document.createElement('section');
  section.innerHTML = `<h3>${width} px</h3><p class="showcase-layout-numbers"></p><div class="showcase-layout-strip"><div class="ps-layout showcase-layout-reference" data-ps-layout="${width}"><div class="ps-layout__grid"></div></div></div>`;
  document.querySelector('#layout-profiles').append(section);
  const layout = section.querySelector('.ps-layout'); layout.style.width = `${width}px`;
  refs.push({ layout, width, section });
}
const cells = new Map();
for (const name of names) {
  const row = document.createElement('div'); row.innerHTML = `<dt><code>--ps-layout-${name}</code></dt><dd></dd>`;
  document.querySelector('#layout-tokens').append(row); cells.set(name, row.querySelector('dd'));
}
function draw(layout) {
  layout.dataset.psLayoutSource = source.value;
  const css = getComputedStyle(layout);
  const columns = Number(css.getPropertyValue('--ps-layout-columns'));
  const grid = layout.querySelector('.ps-layout__grid');
  if (grid.children.length !== columns) grid.replaceChildren(...Array.from({ length: columns }, () => {
    const column = document.createElement('div'); column.className = 'showcase-layout-column'; column.setAttribute('aria-hidden', 'true'); return column;
  }));
  return `${columns} колонок · поля ${css.getPropertyValue('--ps-layout-margin').trim()} · промежуток ${css.getPropertyValue('--ps-layout-gap').trim()}`;
}
function refresh() {
  document.querySelector('#c-layout').dataset.psTheme = theme.value;
  document.querySelector('#layout-measure').textContent = draw(live);
  const css = getComputedStyle(live);
  for (const [name, cell] of cells) cell.textContent = css.getPropertyValue(`--ps-layout-${name}`).trim();
  for (const { layout, width, section } of refs) {
    section.querySelector('p').textContent = draw(layout);
    const scale = Math.min(1, section.querySelector('.showcase-layout-strip').clientWidth / width);
    layout.style.transform = `scaleX(${scale})`;
  }
}
source.addEventListener('change', refresh); theme.addEventListener('change', refresh);
new ResizeObserver(refresh).observe(document.querySelector('#c-layout')); refresh();
