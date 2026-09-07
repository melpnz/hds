# IconButton

| | |
|---|---|
| **Категория** | Действия |
| **Корневой класс** | `.tm-icon-button` (условное имя, FIGMA-RECONSTRUCTED) |
| **CSS** | `ui/components/icon-button.css` |
| **Production** | не найден отдельным переиспользуемым классом |
| **Figma** | habr-lib → `button` → icon-button |
| **Добавлен** | Correction pass после Visual UI Kit Completeness Review |

## Статус: FIGMA-RECONSTRUCTED

Ни имя, ни стиль не подтверждены production как отдельный переиспользуемый
компонент. Ближайшая реальная параллель — `.close-informer-hint`
(`ui/components/hint.css`) — тоже безрамочная кнопка-иконка, но это
конкретное закрытие информера, не общий класс. `get_variable_defs`
подтвердил, что цвета Figma-варианта — реальные Habr-токены
(`--icon-secondary`, `--accent-primary`, `--other-disabled-elements`),
не выдуманы.

## Анатомия

```html
<button class="tm-icon-button" type="button" title="Закрыть">
  <svg class="tm-svg-img" height="20" width="20"><use xlink:href="…#close"></use></svg>
</button>
```

## Варианты (ровно те, что показывает Figma — новых не придумано)

| Класс | Источник |
|---|---|
| (по умолчанию) | `border=no` — без рамки, 32×32 |
| `.tm-icon-button_bordered` | `border=yes` — рамка `--icon-secondary` |
| `.tm-icon-button_near-field` | `near textfield=yes` — крупнее, 40×40. **Не проверено**, действительно ли используется внутри `Field`/`Input` в production |

## Состояния

default / hover / focus (тот же цвет, что hover) / disabled — Figma не
показывает `loading` иначе, чем изменением цвета рамки на тот же серый,
что disabled — не различены отдельным визуальным эффектом здесь.

## Ограничения

Не путать с `.bookmarks-button`/`.close-informer-hint` —
все три реальные, но каждый со своей специфической геометрией/паддингом;
`.tm-icon-button` — обобщённая реконструкция, не замена ни одному из них.

## Исправлено в Figma Parity Audit

**Неверно сопоставленный токен.** Figma `elements/button/icon/icon` =
`#929ca5` — это `--icon-primary` ТОЧНО, а не `--icon-secondary`
(тот `#bcced7`, заметно голубее). Ошибка была и в коде, и в комментарии
к файлу. Рамка варианта `_bordered`: Figma `elements/button/icon/border`
= `#929ca566` — тот же цвет с альфой **40%**, у нас стояла непрозрачная.
Оба исправлены.

Ошибку нельзя было поймать сверкой «CSS против CSS»: оба токена
существуют и валидны, компонент рендерился. Ловится только сверкой
hex-значения Figma с разрешённым значением токена.

## Источники

Figma: `habr-lib`, canvas `button` (662:2177), фрейм `icon-button`
(848:10440).
