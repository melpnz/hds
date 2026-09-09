## 8 · Overlays · OV

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **OV-1** | `Dialog` — единственный компонент с подтверждённой **responsive-перекомпоновкой**, не сжатием: десктоп — центрированное окно, мобильный — нижняя шторка (bottom-drawer) | `ui/components/dialog.css`, Storybook | Storybook-only | HIGH (механизм), GAP (брейкпоинт переключения не найден в CSS) |
| **OV-2** | `Popover` без варианта не добавляет ни фона, ни рамки, ни отступов — «сырой slot-контракт» | `base-popover-DIfjoqU2.css`, docs текст story | 15/16 (Popover) | HIGH |
| **OV-3** | Позиционирование Popover/Dialog — Floating UI (`placement`, 12 позиций, `autoUpdate`), не top/left вручную | `extract()` argTypes BasePopover | Storybook | HIGH |
| **OV-4** | Три вида Hint (Base/Informer/Restriction) решают разные задачи: контекстная подсказка со стрелкой / крупный информер о новой фиче с пульсирующим триггером / простой текст-ограничение | `ui/components/hint.css` | Storybook-only | HIGH |
| **OV-5** | Ни одна модалка/дропдаун не встретилась в production-разметке гостя — весь класс UI требует взаимодействия/входа | source-map: 0/16 | 0/16 | GAP как паттерн страницы, не как компонент |

---
