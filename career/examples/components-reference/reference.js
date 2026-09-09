/* =========================================================================
   Career UI Reference — поведение оболочки документации.

   Оболочка документации и локальные примеры PageHeader/FilterModal.
   Поведение нового ядра — в core-interactions.js. Это reference implementation
   контрактов UI kit, а не восстановленный runtime production Career.

   Скрипт делает четыре вещи:
     1. выставляет DOM-only indeterminate для статического примера Checkbox;
     2. подсвечивает текущий раздел в навигации;
     3. фильтрует образцы поиском;
     4. переключает показ спецификаций и исследовательской метаданных.
   ========================================================================= */

(function () {
  'use strict';

  var body = document.body;

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-demo-indeterminate]'),
    function (input) { input.indeterminate = true; }
  );

  var previews = [];
  function layoutPreview(preview) {
    var shell = preview.node.querySelector('.career-shell');
    if (!shell) return;
    var available = preview.node.clientWidth;
    var scale = Math.min(1, available / preview.width);
    preview.node.style.setProperty('--preview-width', preview.width + 'px');
    preview.node.style.setProperty('--preview-scale', scale);
    preview.node.style.setProperty('--preview-offset', Math.max(0, (available - preview.width * scale) / 2) + 'px');
    preview.node.style.setProperty('--preview-height', Math.ceil(shell.scrollHeight * scale) + 'px');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.responsive-preview'), function (node) {
    var preview = { node: node, width: 1100 };
    previews.push(preview);
    Array.prototype.forEach.call(document.querySelectorAll('[data-preview-width="' + node.id + '"]'), function (button) {
      button.addEventListener('click', function () {
        preview.width = Number(button.getAttribute('data-width'));
        Array.prototype.forEach.call(button.parentElement.querySelectorAll('[data-preview-width]'), function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        layoutPreview(preview);
      });
    });
  });
  function layoutPreviews() { previews.forEach(layoutPreview); }
  layoutPreviews();
  window.addEventListener('load', layoutPreviews);
  window.addEventListener('resize', layoutPreviews);

  /* PageHeader: доступное раскрытие мобильного меню в живом примере. */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-page-header-toggle]'),
    function (trigger) {
      var menu = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!menu) return;

      function setOpen(open) {
        trigger.setAttribute('aria-expanded', String(open));
        trigger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        menu.setAttribute('data-state', open ? 'open' : 'closed');
      }

      trigger.addEventListener('click', function () {
        setOpen(trigger.getAttribute('aria-expanded') !== 'true');
      });
      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false);
      });
      trigger.closest('.page-header').addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
          setOpen(false);
          trigger.focus();
        }
      });
    }
  );

  /* FilterModal: focus lifecycle и keyboard trap для живого R4-примера. */
  var desktopFilters = document.getElementById('r4-filter-form-desktop');
  var modalFilters = document.getElementById('r4-filter-form-modal');
  if (desktopFilters && modalFilters) {
    // Один источник разметки и одна модель. Модальное окно хранит черновик до submit.
    modalFilters.replaceChildren(desktopFilters.querySelector('.filter-panel__body').cloneNode(true));
    [desktopFilters, modalFilters].forEach(function (form) {
      var level = form.elements.namedItem('level');
      if (level) level.setAttribute('aria-label', 'Квалификация');
    });
  }
  function copyFilters(source, target) {
    if (!source || !target) return;
    Array.prototype.forEach.call(source.elements, function (field) {
      if (!field.name) return;
      var peer = target.elements.namedItem(field.name);
      if (!peer) return;
      if (field.type === 'checkbox' || field.type === 'radio') peer.checked = field.checked;
      else peer.value = field.value;
    });
  }
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-filter-modal-open]'),
    function (trigger) {
      var modal = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!modal) return;
      var dialog = modal.querySelector('[role="dialog"]');
      var form = modal.querySelector('form');
      var inertElements = [];
      var previousOverflow;

      function setBackgroundInert() {
        var branch = modal;
        while (branch.parentElement) {
          Array.prototype.forEach.call(branch.parentElement.children, function (sibling) {
            if (sibling !== branch && !sibling.inert && !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) {
              sibling.inert = true; inertElements.push(sibling);
            }
          });
          branch = branch.parentElement;
          if (branch === document.body) break;
        }
      }

      function focusable() {
        return Array.prototype.slice.call(
          dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')
        ).filter(function (element) { return !element.hidden && !element.closest('[hidden], [inert]') && element.getClientRects().length; });
      }

      function openModal() {
        if (!modal.hidden) return;
        copyFilters(desktopFilters, form);
        modal.hidden = false;
        modal.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
        setBackgroundInert();
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        var targets = focusable();
        if (targets.length) targets[0].focus();
      }

      function closeModal() {
        modal.setAttribute('data-state', 'closed');
        modal.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        inertElements.forEach(function (element) { element.inert = false; });
        inertElements = [];
        document.body.style.overflow = previousOverflow;
        trigger.focus();
      }

      trigger.addEventListener('click', openModal);
      Array.prototype.forEach.call(
        modal.querySelectorAll('[data-filter-modal-close]'),
        function (button) { button.addEventListener('click', closeModal); }
      );
      modal.addEventListener('mousedown', function (event) {
        if (event.target === modal) closeModal();
      });
      modal.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeModal();
          return;
        }
        if (event.key !== 'Tab') return;
        var targets = focusable();
        if (!targets.length) return;
        var first = targets[0];
        var last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      if (form) form.addEventListener('submit', function (event) {
        event.preventDefault();
        copyFilters(form, desktopFilters);
        closeModal();
      });
    }
  );

  Array.prototype.forEach.call(
    document.querySelectorAll('.filter-panel:not([aria-busy="true"])'),
    function (form) {
      if (form.closest('[data-filter-modal]')) return;
      form.addEventListener('submit', function (event) { event.preventDefault(); });
    }
  );

  /* ---------------------------------------------------------------------
     1. Подсветка активного пункта навигации
     --------------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var linkByHash = {};
  navLinks.forEach(function (a) {
    var h = a.getAttribute('href');
    if (h && h.charAt(0) === '#') linkByHash[h.slice(1)] = a;
  });

  var targets = Array.prototype.slice.call(
    document.querySelectorAll('section.section[id], .subsection[id]')
  ).filter(function (el) { return linkByHash[el.id]; });

  function setActive(id) {
    navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    var link = linkByHash[id];
    if (link) link.classList.add('is-active');
  }

  if ('IntersectionObserver' in window && targets.length) {
    var visible = Object.create(null);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.boundingClientRect.top;
        else delete visible[e.target.id];
      });
      var ids = Object.keys(visible);
      if (!ids.length) return;
      // ближайший к верху кадра
      ids.sort(function (a, b) { return visible[a] - visible[b]; });
      setActive(ids[0]);
    }, { rootMargin: '-8% 0px -70% 0px', threshold: 0 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     2. Поиск по образцам
     --------------------------------------------------------------------- */
  var input = document.getElementById('q');
  var nofound = document.getElementById('nofound');
  var hint = document.getElementById('count-hint');

  var specimens = Array.prototype.slice.call(document.querySelectorAll('.specimen'));
  var subsections = Array.prototype.slice.call(document.querySelectorAll('.subsection'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.section'));

  // индекс: имя раздела + заголовок образца + data-name
  specimens.forEach(function (sp) {
    var parts = [];
    var sub = sp.closest('.subsection');
    if (sub && sub.querySelector('h3')) parts.push(sub.querySelector('h3').textContent);
    var sec = sp.closest('section.section');
    if (sec && sec.querySelector('h2')) parts.push(sec.querySelector('h2').textContent);
    if (sp.querySelector('.specimen__head')) parts.push(sp.querySelector('.specimen__head').textContent);
    if (sp.getAttribute('data-name')) parts.push(sp.getAttribute('data-name'));
    sp.__idx = parts.join(' ').toLowerCase();
  });

  function updateHint(n) {
    if (!hint) return;
    hint.textContent = n === specimens.length
      ? specimens.length + ' образцов'
      : n + ' из ' + specimens.length + ' образцов';
  }

  function filter(q) {
    q = (q || '').trim().toLowerCase();
    var shown = 0;

    specimens.forEach(function (sp) {
      var match = !q || sp.__idx.indexOf(q) !== -1;
      sp.classList.toggle('is-filtered-out', !match);
      if (match) shown++;
    });

    // блоки без видимых образцов скрываются целиком
    subsections.forEach(function (sub) {
      var has = sub.querySelector('.specimen:not(.is-filtered-out)');
      sub.classList.toggle('is-filtered-out', !!q && !has);
    });
    sections.forEach(function (sec) {
      if (sec.id === 's-about') { sec.classList.toggle('is-filtered-out', !!q); return; }
      var has = sec.querySelector('.specimen:not(.is-filtered-out)');
      sec.classList.toggle('is-filtered-out', !!q && !has);
    });

    if (nofound) nofound.classList.toggle('is-visible', !!q && shown === 0);
    updateHint(shown);
  }

  if (input) {
    input.addEventListener('input', function () { filter(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; filter(''); }
    });
  }
  updateHint(specimens.length);

  /* ---------------------------------------------------------------------
     3. Переключатели
     --------------------------------------------------------------------- */
  var specsBtn = document.getElementById('toggle-specs');
  if (specsBtn) {
    specsBtn.addEventListener('click', function () {
      var hidden = body.classList.toggle('is-specs-hidden');
      specsBtn.setAttribute('aria-pressed', String(!hidden));
      specsBtn.textContent = hidden ? 'Спецификации: скрыты' : 'Спецификации: показаны';
    });
  }

  // Показ исследовательской метаданных (источник и статус).
  // По умолчанию скрыта: витрина показывает решения, а не их происхождение.
  // В DOM данные есть всегда — data-src и data-status на заголовке блока.
  var srcBtn = document.getElementById('toggle-src');
  if (srcBtn) {
    srcBtn.addEventListener('click', function () {
      var shown = body.classList.toggle('is-src-shown');
      srcBtn.setAttribute('aria-pressed', String(shown));
      srcBtn.textContent = shown ? 'Источники: показаны' : 'Источники: скрыты';
    });
  }
})();
