# R1-03 — контракт клиентского оформления

8 сентября 2026 года. До реализации проверены ROADMAP R1-01 и R1-02: done, приняты 16eeed7 и de2fb75. План подготовлен раньше без изменения реализации. Прочитаны guide-build/METHOD/spec-template, TOKENS.md, CLIENT-MATERIALS.md и исходный редактор токенов. Исследование 08-partner-specials.md, §2/11/19/20, использовано для разделения основы и оформления; исторический runtime не перенесён.

## Реализация

- showcase/theme.html импортирует уже принятый tokens.js через theme.js. Повторной реализации редактора и каталога Button нет. В ту же область примера добавлены Typography и Layout. Старые файлы Button/Type/Layout и tokens.js не менялись.
- Дополнительный цвет Typography и alias --ps-type-font: var(--ps-font) связывают общий шрифт. Экспорт содержит 14 деклараций оформления; геометрии Layout, кеглей и промежутков в нём нет. Оба слоя локальны к data-ps-theme=client. Исходный пример изолирован.
- 39 исходных ролей Button остаются текущим каталогом; на реальные 78 Typography и 14 Layout есть ссылки. Текущие font/color/layout values показаны рядом с примером.
- TOKENS.md теперь покрывает три примитива, перенос CSS и границы. CLIENT-MATERIALS.md связывает входные данные с настройками и не обещает готовую клиентскую тему. ui/client-theme.example.css — необязательная демонстрация, не импортируется автоматически.

## Проверки

```text
PASS: unified theme Button/Typography/Layout × 4 widths; font/color/radius, isolation, fixed geometry, reset and portable CSS.
PASS: 39 tokens; theme catalog, live edits, isolated CSS export, spinner color and responsive layout.
PASS: Typography 28 semantic + 10 fixed + 64 pairs × 4 widths; 78 tokens, font/theme changes, source geometry and single-CSS copyability.
PASS: Layout 7 widths × 2 profiles; single CSS, explicit profiles, boundaries, themes, token catalog and 4 responsive widths.
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
```

Theme test проверяет 320/768/1024/1400, цвет/радиус/Georgia, неизменность фиксированных параметров Button/Type/Layout и исходного оформления, reset и switch source, экспорт на отдельной странице с одним product CSS, подключение example stylesheet, ошибки сети/JS и overflow. Ширина текста и его число строк не объявлены неизменными.

При усилении проверки исходного цвета курсор из предыдущей ширины оказался над исходной кнопкой: hover отличался от default. Тест теперь переносит указатель в (0,0) перед baseline. CSS не менялся, повторный прогон PASS.

Evidence: [evidence/verification/theme](../../evidence/verification/theme/). Кропы раздела Theme.320.png и Theme.1400.png открыты через view_image; поля, все кнопки, текст, экспорт и каталог без обрезки. После самопроверки уточнена подпись каталога (старое имя переключателя Button заменено общим описанием) и кропы актуализированы; source Figma не переснимался.

## Границы

Пакет в разработке; не полный UI-kit. Версия Inter, конфликт Layout native/drawn и новая природа браузерных порогов сохранены в спецификациях. Клиентская палитра, web-шрифт, логотипы и механика не получены. Самый готовый результат шага — переносимый контракт и демонстрация, а не утверждённый брендбук, сайт или игра. Independent review/accept не выполнены, commit/done не выставлены.
