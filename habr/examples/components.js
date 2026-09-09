/* =========================================================================
   HABR SHOWCASE · поведение оболочки документации
   =========================================================================
   Одна задача: переключатель ширины у рамок с настоящим viewport.

   Подход взят из career/showcase/pages.js, но реализация отличается в
   принципиальной точке. В Career паттерн — обычный div, ему задают ширину
   и уменьшают трансформацией; это работает, потому что адаптив Career
   сделан на @container, а контейнерный запрос смотрит на размер элемента.

   Адаптив Хабра сделан на @media, а медиазапрос смотрит на viewport.
   Уменьшенный трансформацией div шириной 320 для CSS остался бы десктопом,
   и пример врал бы. Поэтому содержимое рамки — <iframe> со своим viewport:
   ширина задаётся АТРИБУТОМ, а масштаб применяется к самому iframe снаружи
   и на срабатывание медиазапросов не влияет.

   Поведения продуктовых компонентов здесь нет и быть не должно.
   ========================================================================= */

(function () {
  'use strict';

  var frames = [];

  Array.prototype.forEach.call(document.querySelectorAll('.doc-vp'), function (vp) {
    var frame = vp.querySelector('iframe');
    if (!frame) return;
    var bar = document.querySelector('.doc-vp-bar[data-for="' + vp.id + '"]');
    var meta = bar ? bar.querySelector('.doc-vp-bar__meta') : null;
    var f = {
      vp: vp, frame: frame, meta: meta,
      w: Number(vp.getAttribute('data-w') || 1440),
      h: Number(vp.getAttribute('data-h') || 200),
      src: frame.getAttribute('src').split('?')[0],
      feature: true
    };

    if (bar) {
      var widthBtns = bar.querySelectorAll('.doc-vp-btn[data-w]');
      Array.prototype.forEach.call(widthBtns, function (btn) {
        btn.addEventListener('click', function () {
          f.w = Number(btn.getAttribute('data-w'));
          Array.prototype.forEach.call(widthBtns, function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          layout(f);
        });
      });
      var pressed = bar.querySelector('.doc-vp-btn[data-w][aria-pressed="true"]');
      if (pressed) f.w = Number(pressed.getAttribute('data-w'));

      // отдельный тумблер — рекламный слот в шапке
      var toggle = bar.querySelector('.doc-vp-btn_toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          f.feature = !f.feature;
          toggle.setAttribute('aria-pressed', String(f.feature));
          f.frame.setAttribute('src', f.src + (f.feature ? '' : '?feature=0'));
          layout(f);
        });
        f.feature = toggle.getAttribute('aria-pressed') !== 'false';
      }
    }

    frames.push(f);
  });

  function layout(f) {
    var avail = f.vp.clientWidth;
    if (!avail) return;
    var scale = Math.min(1, avail / f.w);
    // ширина и высота — настоящие, в атрибутах; масштаб только визуальный
    f.frame.style.width = f.w + 'px';
    f.frame.style.height = f.h + 'px';
    f.frame.style.transform =
      'translateX(' + Math.max(0, (avail - f.w * scale) / 2) + 'px) scale(' + scale + ')';
    f.vp.style.height = Math.round(f.h * scale) + 'px';
    if (f.meta) {
      f.meta.textContent = f.w + 'px' +
        (scale < 1 ? ' · масштаб ' + Math.round(scale * 100) + '%' : ' · без масштаба');
    }
  }

  function layoutAll() { frames.forEach(layout); }
  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  layoutAll();
  window.addEventListener('load', layoutAll);
  window.addEventListener('resize', debounce(layoutAll, 120));
})();
