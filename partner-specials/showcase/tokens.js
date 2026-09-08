// Labels and groups only: values always come from the loaded ui/tokens.css cascade.
const sizes = ['big', 'medium', 'small'];
const geometry = [
  ['weight', 'Насыщенность шрифта'], ['letter-spacing', 'Межбуквенный интервал'],
  ...[['height', 'Высота'], ['py', 'Вертикальный отступ'], ['px', 'Горизонтальный отступ'],
    ['font', 'Кегль'], ['line', 'Высота строки'], ['gap', 'Промежуток между содержимым'],
    ['spinner', 'Размер индикатора']].flatMap(([name, label]) => sizes.map(size => [`${name}-${size}`, `${label} · ${size}`])),
  ['stroke', 'Толщина обводки / внутренней рамки medium и small'], ['stroke-big', 'Толщина внутренней рамки big'],
];
const palette = [
  ['main', 'Основная заливка'], ['secondary', 'Вторичная заливка'],
  ['on-button', 'Цвет подписи'], ['hover', 'Наведение · medium и small'],
  ['hover-big', 'Наведение · big'], ['focus', 'Фон при фокусе'], ['disabled', 'Неактивная заливка'],
];
const themeTokens = [...palette, ...sizes.map(size => [`radius-${size}`, `Скругление · ${size}`]),
  ['font', 'Семейство шрифта'], ['disabled-label-opacity', 'Непрозрачность неактивной подписи']];
const runtime = [['focus-offset', 'Отступ внешнего фокуса'], ['spinner-duration', 'Период вращения индикатора']];
const groups = [
  ['Оформление клиента', 'Цвета, скругления и шрифт можно переопределить для проекта.', themeTokens],
  ['База UI-kit', 'Размеры и типографический ритм пилота. Сохраняйте при смене оформления.', geometry],
  ['Поведение в браузере', 'Новая реализация: эти значения не извлечены из Figma.', runtime],
];
const fullName = name => `--ps-${name}`;
const source = document.querySelector('#c-button');
const section = document.createElement('section');
section.id = 'tokens';
section.className = 'showcase-section';
section.innerHTML = `
  <p class="showcase-kicker">Токены пилота Button</p>
  <h2>Примерьте оформление клиента</h2>
  <p>Токен — именованная настройка. Меняете её один раз — все кнопки внутри темы получают новое оформление. Размеры и отступы остаются из UI-kit.</p>
  <p class="showcase-label">Имена <code>--ps-*</code> введены в пилоте, это не экспорт переменных Figma. Полная библиотека ещё в разработке.</p>
  <div class="showcase-token-workbench">
    <form id="token-editor" class="showcase-token-editor" aria-label="Оформление клиентской темы"></form>
    <div class="showcase-token-result">
      <h3>Ваше оформление</h3>
      <p class="showcase-label">Изменения применяются только к этим примерам. Начальная палитра — из переключателя вверху страницы.</p>
      <div id="token-preview" data-ps-theme="client" class="showcase-token-preview"></div>
      <p class="showcase-label"><code>--ps-on-button</code> меняет цвет подписи и индикатора загрузки. Для клиентского выпуска проверьте контраст всех состояний. После смены шрифта перепроверьте ширину текста.</p>
    </div>
  </div>
  <div class="showcase-token-export">
    <h3>CSS вашей темы</h3>
    <p>Подключите после <code>ui/partner-specials.css</code> и добавьте <code>data-ps-theme="client"</code> контейнеру спецпроекта. Название <code>client</code> можно заменить своим. Здесь только оформление, база размеров наследуется из библиотеки.</p>
    <label class="showcase-label" for="token-css">Готовый CSS для переноса</label>
    <textarea id="token-css" readonly spellcheck="false" rows="16"></textarea>
    <div class="showcase-controls"><button type="button" id="token-copy" class="showcase-tool-button">Скопировать CSS</button><span id="token-copy-status" role="status"></span></div>
  </div>
  <h3>Каталог токенов</h3>
  <p>Текущие значения читаются из CSS основной матрицы кнопок. Переключите «Оформление кнопок» вверху, чтобы сравнить исходную и демонстрационную темы. Настройки редактора выше в этот каталог не входят.</p>
  <div id="token-catalog"></div>
  <p><a href="../TOKENS.md">Как устроены токены и подключение темы</a> · <a href="../CLIENT-MATERIALS.md">Что запросить у клиента</a></p>`;
source.after(section);
const jump = document.createElement('a');
jump.href = '#tokens';
jump.textContent = 'Токены и настройка темы ↓';
document.querySelector('.showcase-controls').append(jump);

const preview = document.querySelector('#token-preview');
for (const size of sizes) {
  const row = document.createElement('div');
  row.className = 'showcase-token-example';
  row.innerHTML = `<span class="showcase-label">${size}</span><div class="showcase-actions"><button type="button" class="ps-button ps-button--${size}"><span class="ps-button__label">Участвовать</span></button><button type="button" class="ps-button ps-button--${size} ps-button--secondary"><span class="ps-button__label">Подробнее</span></button></div>`;
  preview.append(row);
}
const states = document.createElement('div');
states.className = 'showcase-token-example';
states.innerHTML = `<span class="showcase-label">medium · disabled / loading</span><div class="showcase-actions"><button type="button" class="ps-button" disabled><span class="ps-button__label">Недоступно</span></button><button type="button" class="ps-button" disabled aria-busy="true"><span class="ps-button__label">Загрузка</span></button></div>`;
preview.append(states);

const editor = document.querySelector('#token-editor');
const fields = new Map();
for (const [name, label] of themeTokens) {
  const wrapper = document.createElement('label');
  wrapper.className = 'showcase-token-field';
  wrapper.append(document.createTextNode(label));
  const input = document.createElement(name === 'font' ? 'select' : 'input');
  input.dataset.token = fullName(name);
  if (name === 'font') {
    for (const [value, text] of [["'Partner Inter', Arial, sans-serif", 'Inter из пилота'], ['Arial, sans-serif', 'Arial · системный пример'], ['Georgia, serif', 'Georgia · системный пример']]) {
      input.add(new Option(text, value));
    }
  } else if (palette.some(([key]) => key === name)) input.type = 'color';
  else {
    input.type = 'number'; input.min = '0';
    input.max = name === 'disabled-label-opacity' ? '1' : '64';
    input.step = name === 'disabled-label-opacity' ? '0.05' : '1';
  }
  wrapper.append(input);
  const hint = document.createElement('code');
  hint.textContent = fullName(name) + (name.startsWith('radius') ? ' · px' : '');
  wrapper.append(hint);
  fields.set(name, input); editor.append(wrapper);
}
const reset = document.createElement('button');
reset.id = 'token-reset'; reset.type = 'button'; reset.className = 'showcase-tool-button';
reset.textContent = 'Сбросить к выбранной теме'; editor.append(reset);
editor.addEventListener('submit', event => event.preventDefault());

const valueCells = new Map();
for (const [title, description, tokens] of groups) {
  const details = document.createElement('details');
  details.className = 'showcase-token-group';
  details.open = tokens === themeTokens;
  const summary = document.createElement('summary'); summary.textContent = `${title} · ${tokens.length}`;
  const text = document.createElement('p'); text.textContent = description;
  details.append(summary, text);
  const list = document.createElement('dl'); list.className = 'showcase-token-list';
  for (const [name, label] of tokens) {
    const item = document.createElement('div'); item.dataset.tokenName = fullName(name);
    const term = document.createElement('dt'); term.textContent = label;
    const code = document.createElement('code'); code.textContent = fullName(name); term.append(code);
    const definition = document.createElement('dd');
    const value = document.createElement('code'); value.dataset.tokenValue = '';
    let swatch;
    if (palette.some(([key]) => key === name)) {
      swatch = document.createElement('span'); swatch.className = 'showcase-token-swatch'; swatch.setAttribute('aria-hidden', 'true'); definition.append(swatch);
    }
    definition.append(value); item.append(term, definition); list.append(item);
    valueCells.set(name, { value, swatch });
  }
  details.append(list); document.querySelector('#token-catalog').append(details);
}

const cssOutput = document.querySelector('#token-css');
const status = document.querySelector('#token-copy-status');
function updateOutput() {
  cssOutput.value = `[data-ps-theme='client'] {\n${themeTokens.map(([name]) => `  ${fullName(name)}: ${preview.style.getPropertyValue(fullName(name))};`).join('\n')}\n}`;
  status.textContent = '';
}
function refresh() {
  const computed = getComputedStyle(source);
  for (const [name, { value, swatch }] of valueCells) {
    const current = computed.getPropertyValue(fullName(name)).trim();
    value.textContent = current;
    if (swatch) swatch.style.backgroundColor = current;
  }
  for (const [name, input] of fields) {
    const value = computed.getPropertyValue(fullName(name)).trim();
    preview.style.setProperty(fullName(name), value);
    if (input.type === 'color') {
      // Current palette uses CSS hex, including short #fff. Expand for native color inputs.
      input.value = /^#[\da-f]{3}$/i.test(value) ? '#' + [...value.slice(1)].map(char => char + char).join('') : value;
    } else if (input.type === 'number') input.value = parseFloat(value);
    else {
      if (![...input.options].some(option => option.value === value)) input.add(new Option(value, value));
      input.value = value;
    }
  }
  updateOutput();
}
editor.addEventListener('input', event => {
  const input = event.target;
  if (!input.dataset.token || !input.checkValidity() || !input.value) return;
  preview.style.setProperty(input.dataset.token, input.value + (input.dataset.token.startsWith('--ps-radius-') ? 'px' : ''));
  updateOutput();
});
reset.addEventListener('click', refresh);
new MutationObserver(refresh).observe(source, { attributes: true, attributeFilter: ['data-ps-theme'] });
document.querySelector('#token-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(cssOutput.value); status.textContent = 'CSS скопирован.'; }
  catch { cssOutput.focus(); cssOutput.select(); status.textContent = 'Выделено: скопируйте Ctrl+C или ⌘C.'; }
});
refresh();
