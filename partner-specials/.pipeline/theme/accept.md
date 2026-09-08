# R1-03 — приёмка клиентской темы

2026-09-08. **ПРИНЯТО**. Независимое review-1 без blocker/major/minor. Самостоятельно прочитаны изменения TOKENS/CLIENT-MATERIALS, capture, review, просмотрены сохранённые Theme320/1400; источник Figma не переснимался.

```text
npm run test:theme -- --no-screenshots
PASS: unified theme Button/Typography/Layout × 4 widths; font/color/radius, isolation, fixed geometry, reset and portable CSS.
npm run validate
PASS: 3 component; registry, CSS, local dependencies and state examples agree.
npm run test:tokens -- --no-screenshots
PASS: 39 tokens; theme catalog, live edits, isolated CSS export, spinner color and responsive layout.
```

Копируемый экспорт и необязательный example CSS проверены на отдельной странице с одним CSS-входом. Редактор изолирован от исходного примера; Button dimensions/padding, Typography кегли/line-height, Layout поля/колонки/gap сохраняются. Шрифт действительно заменяется, ширина текста и число строк не объявлены неизменными. Четыре ширины без overflow. Существующий реестр согласован; новых компонентов и геометрических токенов нет. Все три каталога доступны, экспорт не подменяет размеры темой.

Геометрия опирается на принятые Figma источники; имена CSS и runtime новые. Клиентские материалы отсутствуют и перечислены как обязательный вход будущего проекта. Машинный слой, production-рецепты и правила композиции N/A. Версия Inter и конфликт Layout сохранены. Принимается R1-03 и ограниченная основа R1; полные семейства partial, List/Point ожидают R2-12.
