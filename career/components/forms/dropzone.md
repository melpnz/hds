# Dropzone · Область перетаскивания файлов

| | |
|---|---|
| **Корневой класс** | `dropzone` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-upload` |

Дополнительный способ передать файлы в FileUpload. Всегда сохраняет доступный выбор через native file input.

## Состояния

`default`, `hover`, `focus-visible`, `dragActive` (`data-drag-active="true"`), `disabled` (`aria-disabled="true"` + disabled input), `invalid` (`aria-invalid="true"` и текст ошибки).

Корень — `label` для input или button, который вызывает input. Enter/Space открывают chooser. Drag handlers отменяют browser navigation только для файлов; dragActive сбрасывается на drop/dragleave/blur. Вложенные элементы не должны мигать состоянием из-за счётчика dragenter/leaves. Текст перечисляет допустимые типы и лимит, цвет не единственный сигнал. Paste может поддерживаться как тот же входной канал.
