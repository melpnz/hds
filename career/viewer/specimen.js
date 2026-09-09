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
    .then(item => {
      if (!item.markup?.html) throw new Error('Copy-safe разметка отсутствует.');
      document.title = item.title;
      target.innerHTML = item.markup.html
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
