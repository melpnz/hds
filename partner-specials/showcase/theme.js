// Reuse the accepted Button workbench. No second implementation of its controls/catalog.
import './tokens.js';
const preview = document.querySelector('#token-preview');
const editor = document.querySelector('#token-editor');
const source = document.querySelector('#c-button');
const output = document.querySelector('#token-css');
const publicTheme = ['main', 'secondary', 'on-button', 'hover', 'hover-big', 'focus', 'disabled', 'radius-big', 'radius-medium', 'radius-small', 'font', 'disabled-label-opacity'];
document.querySelector('#tokens .showcase-kicker').textContent = 'Общая тема · Button + Typography + Layout';
document.querySelector('#tokens > h2').textContent = 'Настройте оформление проекта';
document.querySelector('#tokens > h2 + p').textContent = 'Цвета, углы и шрифт применяются к одному контейнеру. Кнопки и текст читают общую тему; поля и колонки сохраняются. Смена шрифта может изменить ширину кнопки и переносы текста.';
document.querySelector('#tokens > .showcase-label').textContent = 'Имена CSS-переменных введены в пакете; это не полный экспорт Figma. Геометрия и оформление описаны в TOKENS.md.';
const layout = document.createElement('div'); layout.className = 'ps-layout showcase-theme-layout'; layout.dataset.psTypeMode = 'auto';
layout.innerHTML = '<div class="ps-layout__grid"><div class="ps-layout__full"><div class="ps-type-pair" data-pair="h5-p1"><h3 class="ps-type" data-type="h5">Общая история</h3><p class="ps-type" data-type="p1">Тематический проект клиента и Хабра.</p></div></div></div>';
preview.prepend(layout);
const field = document.createElement('label'); field.className = 'showcase-token-field';
field.innerHTML = 'Цвет основного текста<input id="theme-text-color" type="color" data-token="--ps-type-color"><code>--ps-type-color</code>';
editor.insertBefore(field, document.querySelector('#token-reset'));
const textColor = field.querySelector('input');
const readout = document.createElement('p'); readout.className = 'showcase-theme-values'; readout.id = 'theme-values';
document.querySelector('.showcase-token-result').append(readout);
const links = document.createElement('p'); links.className = 'showcase-theme-links';
links.innerHTML = '<a href="./typography.html#typography-tokens">78 токенов Typography</a><a href="./layout.html#layout-tokens">14 токенов Layout</a><a href="../CLIENT-MATERIALS.md">Материалы клиента</a><a href="../ui/client-theme.example.css">Пример CSS темы</a>';
document.querySelector('#tokens').append(links);
const catalogTitle = document.querySelector('#token-catalog').previousElementSibling.previousElementSibling;
catalogTitle.textContent = '39 токенов Button · исходная тема';
catalogTitle.nextElementSibling.textContent = 'Значения читаются из CSS исходного примера. Верхний переключатель выбирает исходную или демонстрационную тему. Настройки редактора в этот каталог не входят; текущие шрифт, цвет текста и параметры сетки показаны рядом с вашим примером.';
function update() {
  preview.style.setProperty('--ps-type-font', 'var(--ps-font)');
  preview.style.setProperty('--ps-type-color', textColor.value);
  const declarations = publicTheme.map(name => `  --ps-${name}: ${preview.style.getPropertyValue(`--ps-${name}`).trim()};`);
  output.value = `[data-ps-theme='client'] {\n${declarations.join('\n')}\n  --ps-type-font: var(--ps-font);\n  --ps-type-color: ${textColor.value};\n}`;
  const type = getComputedStyle(layout.querySelector('[data-type="h5"]'));
  const grid = getComputedStyle(layout);
  readout.textContent = `Текст: ${type.fontFamily}, ${type.fontSize}/${type.lineHeight}, ${type.color}. Сетка: ${grid.getPropertyValue('--ps-layout-columns').trim()} колонок, поля ${grid.getPropertyValue('--ps-layout-margin').trim()}, промежуток ${grid.getPropertyValue('--ps-layout-gap').trim()}.`;
}
function resetText() {
  textColor.value = getComputedStyle(source).getPropertyValue('--ps-type-color').trim();
  update();
}
editor.addEventListener('input', update);
document.querySelector('#token-reset').addEventListener('click', resetText);
new MutationObserver(resetText).observe(source, { attributes: true, attributeFilter: ['data-ps-theme'] });
document.querySelector('#theme').addEventListener('change', event => { source.dataset.psTheme = event.target.value; });
new ResizeObserver(update).observe(preview);
resetText();
