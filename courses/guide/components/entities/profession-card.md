# ProfessionCard

| | |
|---|---|
| **Категория** | entities (`entities`) |
| **Корневой класс** | `crs-profession-card` — введён пакетом |
| **CSS** | `ui/components/entities.css` |
| **Живая реализация** | [`viewer/index.html#profession-card`](../../../viewer/index.html#profession-card) |
| **Источник** | Figma `02_Education-NEW`, узел `14089:190237` «Карточка специальности» |
| **Статус** | `complete` · нормативный Figma-контракт v0.2 |

## Когда использовать

Используйте для профессии в карточной выдаче. На 320 и 480 карточка занимает всю ширину контейнера, обложка сохраняет пропорции; вариант принят как нормативный по Figma.

## Разметка

Написана по узлу макета, а не снята. Вставляется на пустую страницу с одним
`ui/courses.css` и выглядит так же, как на витрине (инвариант METHOD §6.1).

```html
<div class="crs-profession-card">
  <img class="crs-profession-card__cover" src="../ui/assets/images/content-placeholder.svg" alt="">
  <div class="crs-profession-card__body">
    <div class="crs-profession-card__head">
      <p class="crs-profession-card__title">3D-художник</p>
      <div class="crs-profession-card__tags">
        <span class="crs-specialization-tag crs-specialization-tag--hard">Конкуренция</span>
        <span class="crs-specialization-tag crs-specialization-tag--medium">Умеренный вход</span>
      </div>
    </div>
    <div class="crs-profession-card__salary">
      <p class="crs-profession-card__salary-label">Может заработать в месяц</p>
      <p class="crs-profession-card__salary-value">40 000 – 107 598 ₽</p>
    </div>
  </div>
</div>
```

## Внешний вид

| что | значение |
|---|---|
| карточка | 235 × 342, рамка `#e9e9ea`, радиус 24 |
| обложка | 148, тело наезжает на неё на 20 |
| тело | белое, скругление 24 сверху, падинг 24, промежуток 16 |
| название | 16 / 22, 600; теги `SpecializationTag` через 4 |
| зарплата | подпись 14 / 20 `#909194`, вилка стилем `Header/H4` — 18 / 22, 600, −0.5 |

Все значения — переменные слоя `ui/tokens-figma.css`, снятого с того же файла
макета. Это единственное место пакета, где вёрстка ссылается на слой макета:
у записи нет продуктового источника, и ссылаться больше не на что. Прод-записи
ссылаются на `--color-ui-*` из `ui/tokens.css`.

## Решение v0.2

Используйте для профессии в карточной выдаче. На 320 и 480 карточка занимает всю ширину контейнера, обложка сохраняет пропорции; вариант принят как нормативный по Figma.

Корень с префиксом `crs-` остаётся именем пакета, а отсутствие production-разметки явно сохраняется в provenance. Это не мешает использовать принятый Figma-контракт как нормативный.

## Источники

**Figma.** `02_Education-NEW` (`oNyNRRob2y0ZSgPHOdH65X`), узел `14089:190237`
«Карточка специальности», прочитан `get_design_context` 11 сентября 2026.

**Production.** Разметки нет — это и есть содержание записи.

---

_Собрано bulk-проходом `.pipeline/R2-bulk/gen-figma-only.mjs` по узлу макета._
