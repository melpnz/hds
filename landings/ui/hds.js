(function () {
  var root = document.documentElement;

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') root.classList.add('hds-keyboard');
  }, true);

  document.addEventListener('pointerdown', function () {
    root.classList.remove('hds-keyboard');
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target.closest('[data-hds-demo-form]');
    if (!form) return;
    event.preventDefault();
    var status = form.querySelector('[role="status"]');
    if (status) status.textContent = 'Форма заполнена. В демонстрации данные не отправляются.';
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('.hds-header__menu a');
    if (!link) return;
    var menu = link.closest('details');
    if (menu) menu.open = false;
  });

  document.querySelectorAll('[data-hds-select]').forEach(function (select) {
    var value = select.querySelector('[data-hds-select-value]');
    var input = select.querySelector('[data-hds-select-input]');
    var options = Array.prototype.slice.call(select.querySelectorAll('[role="option"]'));
    options.forEach(function (option) {
      option.addEventListener('click', function () {
        options.forEach(function (item) { item.setAttribute('aria-selected', 'false'); });
        option.setAttribute('aria-selected', 'true');
        if (value) value.textContent = option.textContent;
        if (input) input.value = option.getAttribute('data-value') || option.textContent;
        select.open = false;
        select.querySelector('summary').focus();
      });
    });
  });

  document.querySelectorAll('[data-hds-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hds-slide]'));
    var previous = carousel.querySelector('[data-hds-carousel-prev]');
    var next = carousel.querySelector('[data-hds-carousel-next]');
    var status = carousel.querySelector('[data-hds-carousel-status]');
    var index = 0;
    if (!slides.length || !previous || !next || !status) return;
    function render() {
      slides.forEach(function (slide, slideIndex) { slide.hidden = slideIndex !== index; });
      status.textContent = (index + 1) + ' / ' + slides.length;
      previous.disabled = slides.length < 2;
      next.disabled = slides.length < 2;
    }
    previous.addEventListener('click', function () { index = (index - 1 + slides.length) % slides.length; render(); });
    next.addEventListener('click', function () { index = (index + 1) % slides.length; render(); });
    render();
  });
}());
