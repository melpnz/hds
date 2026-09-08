# Дополнение Button и SocialButton — источник для R2

Read-only capture 2026-09-08: файл `m2O8xRs2aEU8NfUpyNiAks`, страница `2009:264`. Реализации нет. Текстовые размеры и состояния пилота не переснимались; прочитаны новые icon-only варианты, optional slots и определения component properties. Существующий button-overview.png уже показывает обе части коллекции и открыт повторно с диска. Новый social-overview.png снят единожды и открыт.

## Button

`button-extra-inventory.json`: подтверждены 60 вариантов = 30 with text (принятый пилот) + 30 with icon. Набор 2026:322 имеет Type main/secondary, Size big/medium/small, State default/hover/focus/disable/loading и Format with text/with icon. focus и disable — исходные имена, в HTML нужны канонические focus-visible и disabled.

`button-extra-icon-details.json`: точные свойства 30 новых icon-only вариантов. `button-extra-context.txt`: get_design_context medium/default `2026:363`, только справочная реализация.

| Размер | Корень | Радиус | Glyph размер | Glyph x/y | Padding свойства Figma |
|---|---|---|---|---|---|
| big | 64×64 | 12 | 24×24 | 20/20 | 20 |
| medium | 44×44 | 8 | 20×20 | 12/12 | 10 |
| small | 36×36 | 8 | 16×16 | 10/10 | 10 |

Medium icon-only имеет высоту44, в отличие от текстовой48. Center alignment даёт фактический отступ12 при padding10; для точной реализации важны bounds child, а не буквальная сумма padding. Размеры всех пяти состояний icon-only стабильны. Focus обводка INSIDE 4px big и2px medium/small; отсутствие stroke paints означает отсутствие видимой обводки, даже если strokeWeight=1.

Default glyph Copy: big main component `2099:18530` (24), medium/small `2099:18243` (20); small instance уменьшен до16, это не Type Copy/Size16. Loading: `2099:18455` (24) или `2099:18168` (20), small также уменьшен до16. Оригиналы уже лежат `icon-assets/<id-with-hyphen>.svg`, их нужно переиспользовать. Пример optional icon — Archive `2099:18303` (20), также уже экспортирован.

## Optional slots

Четыре BOOLEAN свойства коллекции: Icon right#2113:0, Icon left#2113:37, Counter left#2137:0, Counter right#2137:61; все по умолчанию false. `button-extra-slots.json` содержит только нетекстовых детей каждого из30 text variants, references к boolean, IDs основных компонентов и размеры. Сам принятый текст и параметры его шрифта заново не снимались.

Иконковые слоты в обычных text variants имеют20×20 во всех трёх размерах. Counter big —36×36 (`2136:470`, parent2128:61); medium иsmall —24×24 (`2137:509`, тот же parent). Текущий gap big12, medium/small10. В loading Counter-детей нет, остаются две скрытые optional Icons и видимый Loader. Структура source small имеет порядок Counter left, Icon left, text, Icon right, Counter right; big/medium — Icon left, Counter left, text, Icon right, Counter right.

**Граница:** слоты скрыты в source-default. Их x/y сохраняют положения, иногда выходящие за текущий корень; это не доказанный layout включённой комбинации. Сценарии включения/сочетаний не активировались, потому что Figma read-only. Результирующая ширина и поведение всех комбинаций будут явной новой реализацией на основе сохранённых размеров/gap. Для полноценного Counter slot нужна принятая зависимость R2-04 Counter; не заменять её самодельной плашкой.

## SocialButton

`social-inventory.json`, `social-details.json`, `social-context.txt`: коллекция2213:416 содержит12 вариантов =3 размера×4 состояния default/hover/focus/disable. Loading в ней не подтверждён; никаких сетевых share endpoints или браузерного поведения из этого источника вывести нельзя.

Корни64/44/36 квадратные, radius9999. Glyph Dzen40/32/24 и фактические x/y12/6/6. Figma padding20/10/10 не совпадает с видимыми отступами при oversized glyph; геометрию брать из bounds. Default #2563eb, hover/focus #1f2937, disabled #9ca3af, disabled opacity логотипа0.5; корень opacity1. Focus синяя INSIDE обводка4/2/2.

Во всех12 случаях дочерний логотип ссылается на main `2137:1046`, parent `2137:1045`, name filled=no, в круге=no, on-hover=true. Это Dzen из другой коллекции, а не generic icon. В exports1148 обычных Icons такого ID нет; оригинальные assets из get_design_context загружены без изменения в `social-dzen-big.svg` (40), `social-dzen-medium.svg` (32), `social-dzen-small.svg` (24). Отдельные disabled assets не нужны для базы: можно воспроизвести зафиксированную opacity0.5 на оригинале. Перерисовка логотипа не разрешена.

## Проверка и пробелы

JSON разобраны, число icon variants30 и social12 проверено. Новых PNG Button не создавалось; сохранённый общий обзор включает icon-only. Social обзор975×592 показывает Dzen, три размера и четыре состояния. SVG social загружены как оригинальные байты MCP, не написаны вручную. Реализация, production comparison, интерактивные события и Counter dependency этим чтением не приняты.
