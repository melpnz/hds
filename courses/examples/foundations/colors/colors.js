const usedColors = [
  ['ui-blue-50', '#eff5ff'], ['ui-blue-300', '#94bdfc'], ['ui-blue-400', '#6bacfd'],
  ['ui-blue-500', '#346ef4'], ['ui-blue-600', '#2755e9'], ['ui-black-50', '#f1f1f1'],
  ['ui-black-100', '#e9e9ea'], ['ui-black-150', '#dededf'], ['ui-black-200', '#d3d3d4'],
  ['ui-black-300', '#bcbdbf'], ['ui-black-400', '#a6a7a9'], ['ui-black-500', '#909194'],
  ['ui-black-850', '#2c2e34'], ['ui-black-transparent-50', 'rgba(0,0,0,.05)'],
  ['ui-black-transparent-120', 'rgba(0,0,0,.12)'],
  ['ui-white', '#fff'], ['ui-white-transparent-50', 'hsla(0,0%,100%,.5)'],
  ['ui-yellow-500', '#ff960c'], ['ui-green-500', '#34b24f'], ['ui-orange-500', '#ff7e47'],
  ['ui-violet-500', '#9863f1'],
  ['white-background', 'var(--color-ui-white)', '{color.ui-white}'],
  ['text-main', 'var(--color-ui-black-850)', '{color.ui-black-850}'],
  ['links-main', 'var(--color-ui-blue-500)', '{color.ui-blue-500}'],
  ['main-gradient-first', 'linear-gradient(180deg,var(--color-ui-blue-500),var(--color-ui-blue-500))'],
  ['main-gradient-second', 'linear-gradient(180deg,var(--color-ui-blue-500),var(--color-ui-blue-400))']
];

const unusedColors = [
  ['chip-press', '#b8d5ff'],
  ['chip-inactive', '#ebf3ff'],
  ['ui-black-transparent-300', 'rgba(0,0,0,.3)'],
  ['ui-yellow-400', '#ffb51b'],
  ['ui-red-400', '#f37676'],
  ['ui-green-50', '#e7f6ea'],
  ['ui-green-400', '#5bcd72'],
  ['ui-orange-50', '#fcf2ed'],
  ['ui-violet-50', '#f2eafe'],
  ['habr', '#629fbc'],
  ['career', '#6274bc'],
  ['qna', '#434b60']
];

const figmaOnlyColors = [
  ['ui-yellow-50', '#fff2e2', '#fff2e2', '--fig-yellow-50-solid'],
  ['ui-red-50', '#fce9e9', '#fce9e9', '--fig-red-50-solid'],
  ['ui-red-500', '#e84444', '#e84444', '--fig-elements-informators-tost-fill-red']
];

const renderColors = (target, colors) => {
  const fragment = document.createDocumentFragment();
  colors.forEach(([name, swatch, label = swatch, alias]) => {
    const card = document.createElement('article');
    card.className = 'foundation-card';
    const preview = document.createElement('div');
    preview.className = 'foundation-swatch';
    preview.style.setProperty('--swatch', swatch);
    const title = document.createElement('strong');
    title.textContent = name;
    const meta = document.createElement('small');
    meta.textContent = `${label} · --color-${name}`;
    card.append(preview, title, meta);
    if (alias) {
      const source = document.createElement('small');
      source.textContent = `Figma: ${alias}`;
      card.append(source);
    }
    fragment.append(card);
  });
  document.querySelector(target).append(fragment);
};

renderColors('#used-colors', usedColors);
renderColors('#unused-colors', unusedColors);
renderColors('#figma-only-colors', figmaOnlyColors);
