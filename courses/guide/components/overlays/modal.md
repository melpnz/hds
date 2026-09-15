# Modal

## Статус

Спецификация v0.2 по Courses Figma; production-вхождения базовой оболочки в снятом публичном корпусе не подтверждены.

## Назначение

Базовая модальная оболочка для содержимого, требующего отдельного контекста, подтверждения или отмены. Доменный контент передаётся через слоты; например, [PromoCodeModal](promo-code-modal.md) — частный сценарий этого компонента.

## Анатомия и варианты

- optional image высотой 140 px;
- header: back icon, title и optional right action;
- body: до 12 content slots, gap 16 px, собственный вертикальный scroll;
- footer: optional secondary/main Button M;
- device: desktop, tablet и mobile;
- pinHeader / pinFooter управляют разделителями закреплённых областей.

Desktop и tablet используют оболочку шириной 320 px с полным radius 24 px и max-height 800 px. Mobile занимает ширину viewport, закрепляется снизу, получает radius 24 px только сверху, белый handle 64×4 px и max-height 700 px.

## Поведение

Header и footer остаются на месте, прокручивается только body. Overlay закрывает диалог по клику; Escape выполняет то же действие и возвращает фокус в trigger.

## Доступность

Используйте `role="dialog"`, `aria-modal="true"` и `aria-labelledby`. При открытии переносите фокус внутрь диалога; при закрытии возвращайте его в элемент, открывший Modal.

## Источник

Courses Figma `education-lib`, Modal component set node `1144:25049`; device variants: desktop `1144:29417`, tablet `4726:1139`, mobile `1144:31171`.
