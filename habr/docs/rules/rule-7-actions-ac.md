## 7 · Actions · AC

| ID | Observation | Evidence | Coverage | Confidence |
|---|---|---|---|---|
| **AC-1** | Роль кнопки и цвет кнопки — **два независимых измерения**. Production называет по цвету (`christi`, `fuzzy-wuzzy-brown`), Figma — по роли (Success, Danger) | `evidence/conflicts.md` CFL-2 | 15/16 (Button) | HIGH |
| **AC-2** | **Success (зелёный) — рабочая primary-роль**, не только «успех»: подтверждена как CTA и в public (`tm-button-follow`), и в admin (кнопка «Запросить бронь», кнопка «Далее» в wizard) | `tm-button_color-christi` на 3 разных экранах, включая 2 Figma-admin | 3 независимых контекста | HIGH — межконтекстное совпадение |
| **AC-3** | Danger и Minor существуют только в форме `line` (обводка) — fill-варианты для них не подтверждены | `ui/components/button.css` | весь CSS-срез | MEDIUM (могут просто не встретиться) |
| **AC-4** | `:focus` неотличим от `:hover`/`:active` в CSS — Figma утверждает отдельную focus-стадию, но её нет в извлечённом коде | `button-Ccclp6vQ.css`, Figma `habr-lib → button` | 0 CSS-подтверждений | GAP |
| **AC-5** | Вторичное действие — слева (ghost/transparent), первичное — справа (solid/success): порядок подтверждён и в admin wizard, и в Dialog | `admin-form` скриншот, `dialog--minimal` snapshot | 2 независимых контекста | MEDIUM-HIGH |
| **AC-6** | Действие сущности (подписаться/написать) стоит **на identity-карточке**, не в отдельном блоке действий | EN-4 | 3/14 | HIGH |

---
