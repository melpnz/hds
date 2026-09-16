const params = new URLSearchParams(location.search);
const specPath = params.get('spec');
const target = document.querySelector('#specimen');

if (!specPath || !specPath.startsWith('machine/components/')) {
  target.textContent = 'Некорректный путь спецификации.';
} else {
  fetch(`../${specPath}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(async item => {
      if (!item.implementation?.markup || !item.implementation.markup.includes('/')) throw new Error('Copy-safe разметка отсутствует.');
      const response = await fetch(`../${item.implementation.markup}`);
      if (!response.ok) throw new Error(`Markup HTTP ${response.status}`);
      const markup = await response.text();
      document.title = item.title;
      target.innerHTML = markup
        .replaceAll('../../ui/', '../ui/')
        .replaceAll('/career-web/images/sprites/', '../ui/assets/icons/');
    })
    .catch(error => {
      target.textContent = error.message;
    });
}

document.addEventListener('click', event => {
  if (event.target.closest('a')) event.preventDefault();
});
