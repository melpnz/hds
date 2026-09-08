# Counter R2-04 — план по источнику

Подготовлено до приёмки R1-03; реализации ещё нет. Зависимости R1-01 и R1-03: начать build только после отметки done R1-03 и закрытия волны R1 координатором/приёмщиком.

Прочитаны counter-details.json, counter-context.txt и r2-preparation.md. Сохранённый counter-overview.png открыт. Источник `2128:61`: 12 вариантов (counter/progress bedge × big/medium/small × default/disable).

План нового HTML-контракта: статический span с доступным текстовым контекстом; output допустим для вычисленного результата. `data-state="disabled"` меняет только визуальное оформление неинтерактивного счётчика; не использовать disabled-атрибут на span и не делать его кнопкой. Для отношения двух значений показать оба числа и разделитель; это не автоматический meter/progress runtime. Обновляет текст приложение. Пример внутри Button готовится как слот, семантика действия остаётся у Button.

Source root: counter36/24/16 и progress81/66/36; height36/24/16. Font Inter Bold16/20,12/16,8/12. Радиус9999. Default bg#16181d/fg#fff, disable bg#6b7280/fg#9ca3af. Все значения будут отдельными --ps-counter-* ролями; font-family читает общий --ps-font, палитра локально заменяется клиентом. Каталог покажет все новые токены с actual computed.

Root width станет minimum для исходного00, длинное значение расширяет плашку/переносится в ограниченном контейнере, никогда не скрывается многоточием. Это новая устойчивость, а не наблюдаемое поведение Figma. Source small8px честно помечается ограничением читаемости, не рекомендацией для значимого standalone-текста.

Особенности сравнения: big progress source padding12, child x11 (сумма измеренных child widths/gaps57+padding24=81, но source text bounds59 включают rounding); medium counter default child width20, disabled18 при одномfont12/16 и root24. Сохранять корневую геометрию/кегль/line-height/padding; не заявлять совпадение glyph bounds неизвестной версии Inter. Фактические расхождения glyph widths/x записать тестом, без искусственного font scaling.

Проверки:12вариантов×320/768/1024/1400, точные rootminimum/height/padding/color/radius/font/line/gap, clientfont/color иизоляция, длинные количества/отношения, нулевое/пустое значение, перенос со singleentryCSS и исходные/демо PNG320/1400. Никаких новых запросов Figma или правок пилота.
