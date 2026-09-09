const button = document.querySelector('#loading');

document.querySelector('#toggle').addEventListener('click', () => {
  const loading = button.getAttribute('aria-busy') !== 'true';
  button.setAttribute('aria-busy', String(loading));
  button.classList.toggle('is-loading', loading);
  button.querySelector('.base-button__inner').classList.toggle('is-hidden', loading);
  button.querySelector('.base-button__loader').hidden = !loading;
});
