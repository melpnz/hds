/* Local reference behavior, not recovered production code. No network writes. */
(() => {
  'use strict';
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const enabled = element => !element.disabled && element.getAttribute('aria-disabled') !== 'true';

  function overlay(trigger, surface, onOpen) {
    const expanded = open => {
      surface.hidden = !open;
      surface.dataset.state = open ? 'open' : 'closed';
      trigger.setAttribute('aria-expanded', String(open));
    };
    function close(restore = true) {
      expanded(false);
      if (restore) trigger.focus();
    }
    function position() {
      if (surface.hidden) return;
      surface.style.position = 'fixed';
      surface.style.margin = '0';
      surface.style.bottom = 'auto';
      surface.style.right = 'auto';
      const rect = trigger.getBoundingClientRect();
      const width = surface.offsetWidth;
      const height = surface.offsetHeight;
      surface.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
      const below = rect.bottom + 8;
      const above = rect.top - height - 8;
      const fitsBelow = below + height <= innerHeight - 12;
      surface.dataset.placement = (fitsBelow ? 'bottom' : 'top') + '-start';
      surface.style.top = Math.max(12, fitsBelow ? below : above) + 'px';
    }
    function open() {
      if (!enabled(trigger)) return;
      expanded(true);
      position();
      onOpen?.();
    }
    trigger.addEventListener('click', () => surface.hidden ? open() : close());
    const escape = event => {
      if (event.key === 'Escape' && !surface.hidden) { event.preventDefault(); close(); }
    };
    surface.addEventListener('keydown', escape);
    trigger.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', event => {
      if (!surface.hidden && !surface.contains(event.target) && !trigger.contains(event.target)) close(false);
    });
    document.addEventListener('focusin', event => {
      if (!surface.hidden && !surface.contains(event.target) && !trigger.contains(event.target)) close(false);
    });
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    expanded(false);
    return { open, close };
  }

  function optionList(root, trigger, surface, choose) {
    const items = () => all('[role^="menuitem"], [role="option"]', root).filter(enabled);
    function focus(item) {
      all('[role^="menuitem"], [role="option"]', root).forEach(entry => { entry.tabIndex = entry === item ? 0 : -1; });
      item?.focus();
    }
    const control = overlay(trigger, surface, () => focus(items().find(item => item.getAttribute('aria-selected') === 'true') || items()[0]));
    trigger.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); control.open();
        if (event.key === 'ArrowUp') focus(items().at(-1));
      }
    });
    let prefix = '', timer;
    root.addEventListener('keydown', event => {
      const entries = items(), index = entries.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = entries[(index + 1) % entries.length];
      if (event.key === 'ArrowUp') next = entries[(index - 1 + entries.length) % entries.length];
      if (event.key === 'Home') next = entries[0];
      if (event.key === 'End') next = entries.at(-1);
      if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        clearTimeout(timer); prefix += event.key.toLocaleLowerCase('ru');
        timer = setTimeout(() => { prefix = ''; }, 700);
        next = entries.find(item => item.textContent.trim().toLocaleLowerCase('ru').startsWith(prefix));
      }
      if (next) { event.preventDefault(); focus(next); }
    });
    root.addEventListener('click', event => {
      const item = event.target.closest('[role^="menuitem"], [role="option"]');
      if (!item || !enabled(item)) return;
      choose(item);
      control.close();
    });
    return control;
  }

  const menu = document.getElementById('vacancy-actions');
  optionList(menu, document.querySelector('[aria-controls="vacancy-actions"]'), menu.closest('.popover__surface'), item => {
    if (item.getAttribute('role') === 'menuitemcheckbox') item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
  });
  const info = document.getElementById('profile-popover');
  info.tabIndex = -1;
  overlay(document.querySelector('[aria-controls="profile-popover"]'), info, () => info.focus());

  const tooltip = document.getElementById('salary-tooltip');
  const tooltipTrigger = document.querySelector('[aria-describedby="salary-tooltip"]');
  const tooltipRoot = tooltip.parentElement;
  let tooltipDismissed = false;
  function showTooltip(open) {
    tooltip.hidden = !open; tooltip.dataset.state = open ? 'open' : 'closed';
  }
  tooltipRoot.addEventListener('pointerenter', () => { tooltipDismissed = false; showTooltip(true); });
  tooltipRoot.addEventListener('pointerleave', () => { if (document.activeElement !== tooltipTrigger || tooltipDismissed) showTooltip(false); });
  tooltipTrigger.addEventListener('focus', () => { tooltipDismissed = false; showTooltip(true); });
  tooltipTrigger.addEventListener('blur', () => showTooltip(false));
  tooltipTrigger.addEventListener('keydown', event => {
    if (event.key === 'Escape') { tooltipDismissed = true; showTooltip(false); }
  });
  tooltipTrigger.addEventListener('click', () => { tooltipDismissed = !tooltip.hidden; showTooltip(!tooltipDismissed); });
  document.addEventListener('pointerdown', event => { if (!tooltipRoot.contains(event.target)) showTooltip(false); });
  showTooltip(false);

  const dateRoot = document.querySelector('#r3-calendar .date-picker');
  const dateInput = dateRoot.querySelector('input');
  const dateTrigger = dateRoot.querySelector('button[aria-haspopup]');
  const dateSurface = document.getElementById('demo-calendar');
  const grid = dateRoot.querySelector('.calendar__grid');
  const title = dateRoot.querySelector('.calendar__title');
  let selected = new Date(2026, 8, 12), shown = new Date(2026, 8, 1);
  const minDate = new Date(2026, 8, 7), maxDate = new Date(2027, 8, 7);
  const key = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  dateInput.readOnly = true;
  dateInput.removeAttribute('aria-expanded'); dateInput.removeAttribute('aria-controls');
  dateInput.setAttribute('aria-describedby', 'demo-date-hint');
  const hint = document.createElement('p'); hint.id = 'demo-date-hint'; hint.className = 'note';
  hint.textContent = 'Выберите дату с 7 сентября 2026 по 7 сентября 2027.';
  dateRoot.append(hint);
  function render(focused = selected, moveFocus = false) {
    const month = shown.toLocaleDateString('ru', { month: 'long', year: 'numeric' });
    title.textContent = month; grid.setAttribute('aria-label', month);
    grid.replaceChildren();
    const headings = document.createElement('div'); headings.setAttribute('role', 'row');
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
      const cell = document.createElement('span'); cell.className = 'calendar__weekday'; cell.setAttribute('role', 'columnheader'); cell.textContent = day; headings.append(cell);
    });
    grid.append(headings);
    const first = new Date(shown.getFullYear(), shown.getMonth(), 1);
    first.setDate(first.getDate() - (first.getDay() + 6) % 7);
    for (let week = 0; week < 6; week++) {
      const row = document.createElement('div'); row.setAttribute('role', 'row');
      for (let day = 0; day < 7; day++) {
        const date = new Date(first); date.setDate(first.getDate() + week * 7 + day);
        const cell = document.createElement('div'); cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-selected', String(key(date) === key(selected)));
        const button = document.createElement('button'); button.type = 'button'; button.className = 'calendar__day';
        button.textContent = date.getDate(); button.dataset.date = key(date);
        button.setAttribute('aria-label', date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' }));
        button.dataset.outsideMonth = String(date.getMonth() !== shown.getMonth());
        button.dataset.selected = String(key(date) === key(selected));
        if (key(date) === key(new Date())) button.setAttribute('aria-current', 'date');
        button.disabled = date < minDate || date > maxDate;
        button.tabIndex = key(date) === key(focused) && !button.disabled ? 0 : -1;
        button.addEventListener('click', () => {
          selected = date; dateInput.value = date.toLocaleDateString('ru');
          dateInput.dispatchEvent(new Event('change', { bubbles: true })); dateControl.close(); render();
        });
        cell.append(button); row.append(cell);
      }
      grid.append(row);
    }
    const target = grid.querySelector('[tabindex="0"]') || grid.querySelector('button:not(:disabled)');
    if (target) { target.tabIndex = 0; if (moveFocus) target.focus(); }
  }
  const dateControl = overlay(dateTrigger, dateSurface, () => { shown = new Date(selected.getFullYear(), selected.getMonth(), 1); render(selected, true); });
  function move(date) {
    date = new Date(Math.max(minDate, Math.min(maxDate, date)));
    shown = new Date(date.getFullYear(), date.getMonth(), 1); render(date, true);
  }
  grid.addEventListener('keydown', event => {
    const button = event.target.closest('[data-date]'); if (!button) return;
    const date = new Date(button.dataset.date + 'T12:00:00');
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (delta) date.setDate(date.getDate() + delta);
    else if (event.key === 'Home') date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    else if (event.key === 'End') date.setDate(date.getDate() + 6 - (date.getDay() + 6) % 7);
    else if (['PageUp', 'PageDown'].includes(event.key)) {
      const day = date.getDate(); date.setDate(1); date.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    } else return;
    event.preventDefault(); move(date);
  });
  all('.calendar__header button', dateRoot).forEach((button, index) => button.addEventListener('click', () => move(new Date(shown.getFullYear(), shown.getMonth() + (index ? 1 : -1), 7))));
  render();

  const times = document.getElementById('demo-time-list');
  const timeTrigger = document.querySelector('[aria-controls="demo-time-list"]');
  timeTrigger.setAttribute('aria-label', 'Время встречи: 14:30');
  all('[role="option"]', times).forEach(option => { if (!option.hasAttribute('aria-selected')) option.setAttribute('aria-selected', 'false'); });
  optionList(times, timeTrigger, times.closest('.popover__surface'), item => {
    all('[role="option"]', times).forEach(option => option.setAttribute('aria-selected', String(option === item)));
    timeTrigger.textContent = item.textContent; timeTrigger.setAttribute('aria-label', 'Время встречи: ' + item.textContent);
  });

  all('#r3-accordion .accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open)); panel.hidden = !open;
    });
  });

  const dropzone = document.querySelector('#r3-upload .dropzone');
  const fileInput = dropzone.querySelector('input');
  const queue = document.querySelector('#r3-upload .file-upload');
  fileInput.accept = '.pdf,.docx'; fileInput.setAttribute('aria-label', 'Выбрать PDF или DOCX до 10 МБ');
  dropzone.dataset.dragActive = 'false';
  const note = document.createElement('p'); note.className = 'note';
  note.textContent = 'Демонстрация очереди: файлы остаются на устройстве. Результат обработки можно переключить.';
  dropzone.parentElement.insertBefore(note, dropzone);
  const outcomeLabel = document.createElement('label'); outcomeLabel.textContent = 'Результат демонстрации ';
  const outcome = document.createElement('select'); outcome.id = 'upload-outcome';
  [['success', 'Успех'], ['error', 'Ошибка с повтором']].forEach(([value, label]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label; outcome.append(option);
  });
  outcomeLabel.append(outcome); dropzone.parentElement.insertBefore(outcomeLabel, dropzone);
  queue.replaceChildren();
  function receive(files) {
    if (fileInput.disabled || dropzone.getAttribute('aria-disabled') === 'true') return;
    for (const file of files) {
      const valid = /\.(pdf|docx)$/i.test(file.name) && file.size <= 10 * 1024 * 1024;
      const row = document.createElement('div'); row.className = 'file-upload__item';
      const name = document.createElement('span'); name.className = 'file-upload__name'; name.textContent = file.name;
      const status = document.createElement('span'); status.className = 'file-upload__status';
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'link-styled-button'; retry.textContent = 'Повторить'; retry.setAttribute('aria-label', 'Повторить ' + file.name);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'link-styled-button'; remove.textContent = 'Удалить'; remove.setAttribute('aria-label', 'Удалить ' + file.name);
      let timer;
      function run() {
        clearTimeout(timer); row.dataset.state = 'loading'; row.setAttribute('aria-busy', 'true'); retry.hidden = true;
        status.textContent = 'Демонстрация обработки…';
        const result = outcome.value;
        timer = setTimeout(() => {
          row.removeAttribute('aria-busy'); row.dataset.state = result;
          status.textContent = result === 'success' ? 'Готово (демо)' : 'Ошибка обработки (демо)'; retry.hidden = result !== 'error';
        }, 350);
      }
      retry.addEventListener('click', run);
      remove.addEventListener('click', () => { clearTimeout(timer); row.remove(); fileInput.focus(); });
      row.append(name, status, retry, remove); queue.append(row);
      if (valid) run();
      else { row.dataset.state = 'error'; status.textContent = 'Нужен PDF или DOCX до 10 МБ'; retry.hidden = true; }
    }
    fileInput.value = '';
  }
  fileInput.addEventListener('change', () => receive([...fileInput.files]));
  let dragDepth = 0;
  dropzone.addEventListener('dragenter', event => { event.preventDefault(); if (!fileInput.disabled) { dragDepth++; dropzone.dataset.dragActive = 'true'; } });
  dropzone.addEventListener('dragover', event => event.preventDefault());
  dropzone.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dropzone.dataset.dragActive = 'false'; });
  dropzone.addEventListener('drop', event => { event.preventDefault(); dragDepth = 0; dropzone.dataset.dragActive = 'false'; receive([...event.dataTransfer.files]); });

  // VacancyCard owns only the presentational saved state. Applying is a product flow.
  all('[data-vacancy-save]').forEach(button => button.addEventListener('click', () => {
    const saved = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', saved ? 'Убрать вакансию из избранного' : 'Добавить вакансию в избранное');
  }));
})();
