---
name: guide-accept
description: Проверить автоматические и смысловые гейты batch, принять его и создать изолированный коммит.
context: fork
agent: guide-acceptor
---

# Приёмка шага или batch

Вход текущего запуска: `$ARGUMENTS`.

Прочитай [`package-invariants.md`](../../guide/package-invariants.md). Ты только
проверяешь и фиксируешь результат: не улучшаешь реализацию.

## 1. Автоматические гейты

Запусти один раз для всех элементов batch:

```bash
node .claude/guide/validate-step.mjs \
  --product <product> \
  --id <id-1,id-2,...> \
  --kind <component|page|principle|machine> \
  --pipeline <product>/.pipeline/<batch-or-step> \
  --json-out <product>/.pipeline/<batch-or-step>/accept-auto.json \
  --md-out <product>/.pipeline/<batch-or-step>/accept-auto.md
```

Для component скрипт проверяет manifest, status/states, spec, CSS roots,
showcase anchor, evidence и review. Для page/principle он сверяет human doc,
showcase и machine id; для machine — набор файлов и `AGENTS.md`. Затем запускает
применимый validator. Полный вывод
валидатора остаётся в `validate.log`; в контекст возвращается одна итоговая
строка. Успешные автоматические проверки вручную не повторяй.

При `FAIL` напиши `accept.md` со списком упавших гейтов, верни шаг в
`in-progress` и закончи без правок и коммита.

## 2. Смысловые гейты

После `PASS` проверь только применимые пункты:

- браузерные тесты пакета, если они заведены;
- копируемость примера на пустую страницу с одним `ui/<product>.css`;
- exit criteria затронутой волны;
- `validate-machine.mjs`, если machine layer уже существует или изменялся;
- для принципов: coverage ≥2, частотный победитель, исключения и живой
  `data-rule`-пример;
- для страниц: композиция только из принятых компонентов и измеримый каркас из
  production evidence;
- человекочитаемая статья и соответствующая запись машинной проекции имеют один
  id; до волны machine допустим зарезервированный id, но не противоречащая запись.

Сохраняй полные логи команд рядом с `accept-auto.json`; в `accept.md` помещай
exit code, итог и ссылки на логи.

## 3. Вердикт

Если любой применимый гейт упал: **НЕ ПРИНЯТО**, статус `in-progress`, без
коммита.

Если все гейты прошли: **ПРИНЯТО**. Тогда:

1. обнови строки всех элементов batch в `ROADMAP.md` на `done` и кратко заполни
   результат;
2. добавь одну смысловую запись batch в `CHANGELOG.md` → `Unreleased`;
3. запиши `accept.md` с автоматическими и смысловыми гейтами;
4. создай один атомарный коммит batch по `VERSIONING.md`.

Не используй `git add -A`: рабочее дерево может содержать чужие изменения.
Добавь только файлы, перечисленные в capture/fix/accept текущего batch, после
проверки `git status --short`.

На границе волны отдельно проверь её exit criteria и запиши
`.pipeline/wave-<id>.md`. Релиз и тег только предложи пользователю.
