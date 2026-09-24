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
      // Разметка лежит либо отдельным файлом (implementation.markup — путь),
      // либо inline в markup.html самой спецификации.
      const markupPath = item.implementation?.markup;
      let markup = item.markup?.html;
      if (markupPath?.includes('/')) {
        const response = await fetch(`../${markupPath}`);
        if (!response.ok) throw new Error(`Markup HTTP ${response.status}`);
        markup = await response.text();
      }
      if (!markup) throw new Error('Copy-safe разметка отсутствует.');
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
