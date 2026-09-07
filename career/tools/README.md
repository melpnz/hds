# Проверки Career components

## Базовая проверка

```bash
node career/tools/validate-components.mjs
```

Проверяет структуру `components/manifest.json`, уникальность имён, допустимый
словарь состояний, существование спецификаций и showcase anchors. Пробелы в
state evidence выводятся как warnings, чтобы текущий baseline можно было
улучшать постепенно.

## Строгий режим

```bash
node career/tools/validate-components.mjs --strict
```

Завершается с ненулевым кодом и при errors, и при warnings. Текущий baseline
проходит strict-режим; команда предназначена для CI вместе с `npm test`.

Warnings нельзя устранять добавлением слов в спецификацию. Они закрываются
одним из трёх способов:

1. состояние реализовано и показано живым примером;
2. существующее поведение найдено в runtime и корректно задокументировано;
3. состояние помечено `unsupported` с обоснованием и удалено из requiredStates.

## Иконки витрины

```bash
node career/tools/sync-showcase-icons.mjs          # обновить
node career/tools/sync-showcase-icons.mjs --check  # только проверить
```

`inline-showcase-icons.mjs` переносит иконку в разметку один раз, после чего
её содержимое живёт в HTML копией: правка файла в `ui/assets/` до витрины
не доходит. `sync-showcase-icons.mjs` перечитывает каждый
`<svg data-icon-src="…">` и обновляет внутренность, `viewBox` и `fill`.
Режим `--check` ничего не пишет и падает, если копии разошлись, — его место
в CI рядом с `validate-showcase-icons.mjs`.
