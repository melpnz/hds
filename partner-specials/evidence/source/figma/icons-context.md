# Релевантный design context Icon / Point

Источник: get_design_context, 2026-09-08, fileKey `m2O8xRs2aEU8NfUpyNiAks`. React/Tailwind вывод используется как свидетельство структуры и exports, не как реализация пакета.

## Activity32 — 2099:18801

Tool вернул `IconsProps`: size `32`, type `Activity`. Корневой контейнер `relative size-[32px]`, изображение `absolute block inset-0 max-w-none size-full`. Исходный assetURL:

`https://www.figma.com/api/mcp/asset/1457c679-6a04-4088-beeb-1a77baaec2c2.svg`

Локальное долговременное evidence: `icon-assets/2099-18801.svg`, полученный отдельно через SVG_STRING export полного компонента.

## Point done_circle24 — 2081:1049

Tool вернул DoneCircle, корень `relative size-full`, дочерний `2081:1050` с `aspect-[20/20]`, left/right8.33%, top1/2. Внутренний элемент имеет поворот-180 и scale-x-100; преобразования уже включены в export всего frame, повторять их поверх локального SVG нельзя.

Исходный внутренний assetURL:

`https://www.figma.com/api/mcp/asset/6804401b-662e-4fb9-a4bd-c3959e19fd5f.svg`

Для использования сохраняется полный frame export `icon-assets/point-2081-1049.svg`,24×24; локальный SVG включает положение и преобразование внутреннего рисунка. URL инструмента временный, не runtime-зависимость будущего компонента.
