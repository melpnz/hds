# FileUpload · Загрузка файлов

| | |
|---|---|
| **Корневой класс** | `file-upload` |
| **CSS** | `ui/components.css` |
| **Showcase** | `showcase/components.html#r3-upload` |

Выбор файлов и список задач загрузки. Dropzone — альтернативный trigger того же input, не второй upload engine.

## Состояния

| State | Контракт |
|---|---|
| `default` | файл выбран/ожидает отправки |
| `loading` | item `aria-busy="true"`, видимый прогресс или статус |
| `error` | `data-state="error"`, причина и повтор |
| `success` | `data-state="success"`, подтверждение завершения |
| `disabled` | input disabled, triggers и remove/retry недоступны |

## Контракт

Используется нативный `input type="file"` с `accept` и `multiple`; accept не заменяет серверную проверку MIME, размера и содержимого. Имя, размер, прогресс и ошибка доступны текстом. Кнопки удаления/повтора имеют имя с filename. Прогресс — `progress` либо progressbar с `aria-valuenow`; неопределённая загрузка — `aria-busy`. Статусы очереди объявляются одним `aria-live="polite"` контейнером. Отмена должна отменять сетевой запрос, а не только удалять строку.
