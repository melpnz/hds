/* =========================================================================
   Career Page Reference — поведение оболочки документации.

   Две задачи:
     1. переключатель ширины рамки с масштабированием;
     2. подсветка текущего паттерна в навигации.

   Поведения самих компонентов Career здесь нет: оно источниками не
   исследовано и не воспроизводится.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Рамки вьюпорта
     ---------------------------------------------------------------------
     Паттерн верстается в реальных пикселях заданной ширины, а затем
     масштабируется трансформацией, чтобы поместиться в колонку
     документации. Адаптив внутри рамки работает на @container, поэтому
     реагирует именно на ширину рамки, а не окна.
     --------------------------------------------------------------------- */

  var frames = [];

  Array.prototype.forEach.call(document.querySelectorAll('.viewport'), function (vp) {
    var inner = vp.firstElementChild;
    if (!inner) return;
    var bar = document.querySelector('.vp-bar[data-for="' + vp.id + '"]');
    var meta = bar ? bar.querySelector('.vp-bar__meta') : null;
    var frame = { vp: vp, inner: inner, meta: meta, w: 1440 };

    if (bar) {
      Array.prototype.forEach.call(bar.querySelectorAll('.vp-btn'), function (btn) {
        btn.addEventListener('click', function () {
          frame.w = Number(btn.getAttribute('data-w'));
          Array.prototype.forEach.call(bar.querySelectorAll('.vp-btn'), function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          layout(frame);
        });
      });
      var pressed = bar.querySelector('.vp-btn[aria-pressed="true"]');
      if (pressed) frame.w = Number(pressed.getAttribute('data-w'));
    }

    frames.push(frame);
  });

  function layout(f) {
    var avail = f.vp.clientWidth;
    if (!avail) return;
    var scale = Math.min(1, avail / f.w);
    f.inner.style.setProperty('--vw', f.w + 'px');
    f.inner.style.setProperty('--s', scale);
    // рамка уже вписалась — центрируем её в колонке документации
    f.inner.style.setProperty('--tx', Math.max(0, (avail - f.w * scale) / 2) + 'px');
    // высота рамки = реальная высота содержимого × масштаб
    var h = f.inner.scrollHeight;
    f.vp.style.height = Math.round(h * scale) + 'px';
    if (f.meta) {
      f.meta.textContent = f.w + 'px' + (scale < 1 ? ' · масштаб ' + Math.round(scale * 100) + '%' : '');
    }
  }

  function layoutAll() { frames.forEach(layout); }

  layoutAll();
  // содержимое может подрасти после загрузки шрифта Inter
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll);
  window.addEventListener('load', layoutAll);
  window.addEventListener('resize', debounce(layoutAll, 120));

  // высота внутреннего содержимого меняется при перестроении раскладки
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(debounce(layoutAll, 60));
    frames.forEach(function (f) { ro.observe(f.inner); });
  }

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------------------------------------------------------------------
     2. Подсветка активного паттерна
     --------------------------------------------------------------------- */
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav__link'), function (a) {
    var h = a.getAttribute('href');
    if (h && h.charAt(0) === '#') links[h.slice(1)] = a;
  });

  var targets = Array.prototype.filter.call(
    document.querySelectorAll('section[id]'), function (s) { return links[s.id]; });

  if ('IntersectionObserver' in window && targets.length) {
    var visible = Object.create(null);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.boundingClientRect.top;
        else delete visible[e.target.id];
      });
      var ids = Object.keys(visible);
      if (!ids.length) return;
      ids.sort(function (a, b) { return visible[a] - visible[b]; });
      Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
      links[ids[0]].classList.add('is-active');
    }, { rootMargin: '-5% 0px -75% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
