# Browser verification — 7 September 2026

Снимки сгенерированы из `showcase/components.html` на Edge в headless-режиме.
Они фиксируют открытые Calendar и FilterModal, а также R3/R4-примеры на ширинах
375, 768, 1024 и 1440 px.
`vacancy-card-320.png` и `vacancy-card-1100.png` фиксируют R5 VacancyCard в
мобильной и широкой композиции листинга.

Проверка запускается командой:

```bash
npm test
```

`tests/core.spec.mjs` проверяет keyboard/focus lifecycle, Escape и dismiss,
roving tabindex календаря, выбор времени и даты, очередь FileUpload, общий draft
FilterPanel/FilterModal, inert background и отсутствие горизонтального overflow.
Тест также блокирует HTTP-ошибки локальных ассетов и проверяет SVG mask иконки
закрытия модального окна.

Эти снимки проверяют reference implementation локального UI kit. Они не являются
доказательством поведения production Career или закрытых авторизованных сценариев.
