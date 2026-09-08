# Ревью Typography — итерация 1

Вердикт: **принять**.

Независимый reviewer, 8 сентября 2026 года. Реализацию не менял; commit, accept и done не выполнялись.

Проверены guide-review/METHOD/checklist, capture.md, спецификация, CSS и токены, JS/HTML/CSS витрины, тест, manifest, сохранённые findings и Figma evidence. Живой браузер открыт через Playwright и локальный createServer. Снимки Figma/production повторно не запрашивались.

Находок blocker, major или minor в переданном окончательном build нет.

## Что проверено и претензий нет

- Все 28 semantic, 10 fixed и 64 пары проверены в браузере на 320/768/1024/1400 по исходным JSON: font-size, line-height, weight, letter-spacing и конкретный gap. Проверены исходные высоты 28 semantic и 64 пар при ширине образца 400 px. Разные gap H1+p2 и H2+p2 не сведены к одному значению.
- Сохранённый typography-overview.png открыт через view_image. h1/h2 одинакового размера подтверждены источником и сохранены. Новые Typography.320.png и Typography.1400.png из evidence/verification/typography просмотрены: живой текст виден целиком, переносы и поля без обрезки. Полный набор вариантов проверен численно, не объявлен визуально идентичным неизвестной версии Inter.
- 78 токенов каталога совпадают с именами CSS и computed-значениями контейнера. Georgia и демонстрационный цвет меняют оформление при сохранении кеглей/line-height, ширины не переполняются. Сброс возвращает исходные настройки.
- Независимая дополнительная проверка экспортировала Arial и цвет #123456 из редактора на отдельную страницу с единственным ui/partner-specials.css. Computed fontFamily/color совпали; auto на 1023 px дал 32/36, на 1024 — 48/52 для h3. Экспорт переносим без JS и CSS витрины.
- Тест буквально переносит первый HTML-блок спецификации на пустую страницу с единым CSS. Длинное неразрывное слово и пустой абзац проверены. Режимы desktop/mobile/auto и запрет вложения разных режимов описаны.
- Product CSS отделён от оболочки; шрифт локальный. Семантические HTML-теги выбирает потребитель. Production API, числовой auto-порог, сброс margin и перенос слов помечены новой реализацией.
- Scope partial корректен: Point и List отложены до оригинальных иконок R2-01, P0-F01 о неизвестной версии Inter сохранён. Production extraction не требуется в этом задании на Figma-базу; соответствие production не заявлено.

## Проверки — дословно

`npm run test:typography -- --no-screenshots` после окончательной передачи builder:

```text
PASS: Typography 28 semantic + 10 fixed + 64 pairs × 4 widths; 78 tokens, font/theme changes, source geometry and single-CSS copyability.
```

`node tools/validate-components.mjs --strict`:

```text
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
```

## Замечания к промежуточному build

При первом чтении builder ещё завершал передачу. Обнаружены испорченные заголовки справочника и неверный охват QA-снимка 320 (только controls). Автор восстановил русский текст, сменил цель снимка на живой Typography и сохранил корректные кропы в evidence/verification/typography. Исправления перечитаны и просмотрены; открытых замечаний не осталось. Это исправление собственного evidence, а не повторная съёмка источника.
