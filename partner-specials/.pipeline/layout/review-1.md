# Ревью Layout — итерация 1

Дата: 2026-09-08. Независимый ревьюер: r0_review (не автор Layout).

Вердикт: **принять**.

Проверено: guide-review/METHOD/checklist, capture.md, спецификация, source layout-details.json, layout-drawn-sample.json, layout-variables.json, layout-capture.md, сохранённые source/verification PNG, CSS и токены, showcase HTML/JS, запись реестра через strict validator. Figma/production повторно не снимались. Изменений реализации и коммитов ревьюер не делал.

Находок blocker/major/minor нет.

## Что проверено и претензий нет

- A.1–5, E.19: семь source-профилей имеют значения native из layoutGrid и явно отдельные drawn. Расхождения 56/100 на 1440/1920 и 40/36 на 768 не скрыты; default native — решение реализации, не приписанное автору намерение. Сохранённый Figma PNG 1440 визуально показывает 100px поля drawn.
- Геометрия: 1920/1440/1280 — 12 колонок, 8px gutter; 1024/768 — 8 колонок, 8px; 390/320 — 4 колонки, 4px. Поля проверены для обеих моделей. Чередование 84/85px на 390 не обещается CSS-контрактом равных долей. Высоты цветных иллюстраций не превращены в min-height страницы.
- B.6–10: отдельная страница открыта с буквальным HTML из спецификации и единственным ui/partner-specials.css. Grid и full span работают. Ранее существующий тест дополнительно сравнивает семь размеров × два профиля. Нет клиентских цветов/декоративной подсветки в product Layout CSS; оболочка витрины отделена.
- C.11–14: default соответствует неинтерактивному контейнеру. Нет выдуманного interactive API или ARIA; select управления витриной реально переключают профили.
- D.15–17: 320/768/1024/1400 без горизонтального overflow, длинный текст переносится, тема не меняет геометрию. Явные profiles и автоматические режимы проверены. Независимо проверены значения по обе стороны 768/1024/1280/1440 для native и drawn, включая 767/1023/1279/1439.
- E.18–20: назначение и ограничения конкретны; числовые media thresholds названы новым runtime. Source 400px Typography к Layout не относится. Максимальный контейнер, span-композиции блоков и production DOM не заявлены.
- Каталог: все 14 определяемых --ps-layout-* найдены и представлены: 11 базовых и три вычисляемые роли. Текущие значения сравниваются с computed у живого контейнера после resize/смены профиля.
- Существующие Layout.320.png и Layout.1400.png открыты; видны живые колонки, значения токенов и семь эталонных полос. Уменьшение широких reference полос и отсутствие растяжения узких — поясняющий масштаб витрины, не API Layout.

## Команды и результаты

`node partner-specials/tools/test-layout.mjs --no-screenshots`:

```text
PASS: Layout 7 widths × 2 profiles; single CSS, explicit profiles, boundaries, themes, token catalog and 4 responsive widths.
```

`node partner-specials/.pipeline/layout/reviewer-check.mjs`:

```text
PASS reviewer: all 14 tokens complete; native/drawn exact boundary values; literal spec copied with single entry CSS.
```

`node partner-specials/tools/validate-components.mjs --strict`:

```text
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
```

Все команды завершились с кодом 0. Новых скриншотов не создавалось.

## Граница приёмки

Ревью принимает явный Layout-контракт R1-02 с двумя сохранёнными профилями и перечисленными GAP-L1–L4. Оно не разрешает конфликт авторского замысла, не подтверждает production runtime или готовую клиентскую тему. Manifest partial по этим ограничениям честен. Полный machine-слой и рецепты — последующие шаги.
