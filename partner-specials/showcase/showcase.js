const theme = document.querySelector('#theme');
theme.addEventListener('change', () => { document.querySelector('#c-button').dataset.psTheme = theme.value; });
const action = document.querySelector('#action');
const result = document.querySelector('#result');
let count = 0;
action.addEventListener('click', async () => {
  // aria-disabled preserves the keyboard focus; the guard blocks repeated activation.
  if (action.getAttribute('aria-disabled') === 'true') return;
  action.setAttribute('aria-disabled', 'true');
  action.setAttribute('aria-busy', 'true');
  result.textContent = 'Загрузка…';
  await new Promise(resolve => setTimeout(resolve, 900));
  count += 1;
  action.removeAttribute('aria-disabled');
  action.removeAttribute('aria-busy');
  result.textContent = `Готово. Запусков: ${count}.`;
});
