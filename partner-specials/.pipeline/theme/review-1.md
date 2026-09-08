# Ревью клиентской темы — итерация 1

Дата: 2026-09-08. Независимый ревьюер: r0_review; не автор theme-контракта.

Вердикт: **принять**.

Объём: R1-03, общая тема принятой текстовой Button, текстового объёма Typography и Layout. Прочитаны guide-review/METHOD/checklist, capture.md, theme HTML/JS/CSS, повторно используемый tokens.js, TOKENS.md, CLIENT-MATERIALS.md, необязательный client-theme.example.css, браузерный тест. Source/runtime разделены согласно прямому заданию пользователя; повторной съёмки Figma/production не было.

Находок blocker/major/minor нет.

## Что проверено и претензий нет

- Общий редактор импортирует принятый tokens.js; его управление и Button-каталог не переписаны второй реализацией. Тема добавляет обычный цвет текста, связывает Typography font с Button font и показывает обе подсистемы внутри Layout.
- A.5/E.19: тема и исторические conventions исследования не выданы за production CSS. Размеры и исходные значения опираются на уже принятые компоненты. Клиентские материалы перечислены как входные данные проекта; отсутствующий брендбук не заменяется выдуманным согласованным оформлением. Необязательный CSS-пример не импортируется основным CSS автоматически.
- B.6–10: фактически экспортированный CSS из редактора открыт на отдельной странице с одним ui/partner-specials.css. Цвет Button, цвет/шрифт Typography и поля Layout совпадают. Экспорт не содержит layout margins, кеглей, высот кнопки или pair gap. Пример client-theme.example.css также реально подключён и проверен тестом.
- Изоляция: изменение редактора не меняет геометрию, цвета, шрифт, ширину или радиус исходного образца. Источник и редактор намеренно синхронизируются только при переключении выбранной исходной темы или сбросе.
- Геометрия: на 320/768/1024/1400 сохраняются высоты/padding Button, кегли/line-height/weight Typography, поля/число колонок/gap Layout. Смена шрифта действительно работает и не обещает неизменное число строк или ширину текста. Переполнение не обнаружено.
- Каталоги: 39 исходных Button-токенов сохранены; подпись объясняет, что это исходная тема, а не настройки редактора. Рядом с редактируемым примером показаны computed font/color/кегль/line-height и параметры сетки. Каталоги всех78 Typography и14 Layout доступны по прямым ссылкам; новых геометрических токенов в R1-03 нет.
- Независимо проверено: пустой radius/opacity и значения вне min/max сохраняют последнее допустимое значение в preview/export; 0 применяется корректно. Нет NaN/undefined в CSS. Arial и новый цвет текста применяются; переключение source/demo и reset согласованно обновляют font/color/radius/export.
- Существующие именованные кропы Theme.320.png и Theme.1400.png открыты: настройки, живой текст, кнопки, CSS и каталог видимы, обрезки содержимого не обнаружено. Сохранённый снимок не является source-эталоном геометрии.

## Выполненные проверки

`node partner-specials/tools/test-theme.mjs --no-screenshots`:

```text
PASS: unified theme Button/Typography/Layout × 4 widths; font/color/radius, isolation, fixed geometry, reset and portable CSS.
```

`node partner-specials/.pipeline/theme/reviewer-check.mjs`:

```text
PASS reviewer: empty/out-of-range numeric input preserves valid theme; zero valid; font/text color applied; source switches and reset synchronize font/color/radius/export.
```

`node partner-specials/tools/validate-components.mjs --strict`:

```text
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
```

Все команды завершились с кодом0. Дополнительный reviewer-check.mjs сохраняет воспроизводимую проверку полей/сброса; implementation reviewer не редактировал и коммиты не создавал.

## Граница вывода

Принят контракт настройки текущего объёма R1, а не полный UI-kit, утверждённый брендбук или готовый клиентский лендинг. Шрифтовые файлы, логотипы, графика и механика остаются отдельными материалами клиента. Точная версия Inter, авторский конфликт Layout и отложенные Typography List/Point сохраняют ранее заявленные ограничения и не скрыты экспортом темы.
