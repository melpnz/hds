# Evidence и источники

## Приоритет при конфликте

1. HTML-семантика, доступность и устойчивые frontend-паттерны.
2. Runtime-поведение и публичный API production/Storybook.
3. CSS и токены текущей реализации.
4. Визуальное наблюдение из Figma.
5. Имена слоёв, properties и variants Figma.

Figma подтверждает внешний вид, состав и варианты, но не определяет API,
семантику и каноническое имя. Конфликт фиксируется как GAP. Figma не
редактируется; node key и ссылка сохраняются как evidence.

## Съёмка

Канонические ширины: **320 · 768 · 1024 · 1400**. Иная ширина допустима только
при отдельном артборде или CSS breakpoint и записывается в `capture.md`.

- inventory снимает страницы целиком один раз в
  `evidence/source/production/pages/<PageId>/`;
- build снимает кроп элемента с `--pad 8`, без `--full-page`;
- pages и principles повторно используют page evidence;
- review и fix используют сохранённые источники.

Именуй кропы `<CanonicalName>.<state?>.<width>.png`. Имя выбирается из inventory,
затем production/Storybook, затем id.

Не переснимай production или Figma, если уже есть `computed.json`, нужные PNG и
Figma evidence. Исключения: отсутствующие/битые файлы или audit; свежий audit
пишется отдельно, не поверх старого evidence. Витрину можно переснимать.

## Экономное чтение

Не открывай пачкой PNG, `computed.json` или `dom.html`. Для элемента обычно
достаточно кропов 320 и 1400 и среза свойств по selector:

```bash
node .claude/guide/query-evidence.mjs \
  --computed <path>/computed.json \
  --selector <selector-or-path-fragment> \
  --props width,height,padding,gap,font-size,line-height,color
```

Для inventory сначала извлеки структурный индекс DOM скриптом или поиском по
тегам/классам; не помещай весь HTML в prompt.

Полные результаты инструментов сохраняй в `.pipeline/**/*.log`. В контекст и
ответ родителю возвращай краткий итог, exit code и путь к логу.
