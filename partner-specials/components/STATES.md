# Состояния пилота

| Состояние | Визуальный источник | Runtime пилота |
|---|---|---|
| default | Figma State=default | Нативная кнопка |
| hover | Figma State=hover | CSS `:hover`, только доступная кнопка |
| focus-visible | Figma State=focus | CSS `:focus-visible`; дополнительная внешняя обводка — новая реализация |
| disabled | Figma State=disable | Нативный `disabled`; не активируется, пропускается при Tab |
| loading | Figma State=loading | `aria-busy=true` и блокировка действия; локальный spinner; размер подписи сохраняется |

Это проектный контракт HTML/CSS, а не runtime, снятый с production. Источник: [выписка 30 узлов](../evidence/source/figma/button-details.json). Маппинг имён Figma не переносит её API в HTML.

Пример динамической загрузки сохраняет фокус через `aria-disabled=true` и обработчик с проверкой блокировки. Один ARIA-атрибут не запрещает действие. Статические примеры используют `disabled aria-busy=true`. Окончание загрузки сообщает отдельный `role=status`.
