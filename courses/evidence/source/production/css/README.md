# Корпус CSS продакшена

Тот самый корпус, на котором стоят все утверждения шага R0-03 про объявленные
правила: «10/10 страниц», «12 внешних `.css`», «одиннадцать селекторов фокуса»,
границы брейкпоинт-префиксов. До этой правки корпус в пакет не клался, и
проверить его было нечем — находка 5 отчёта `review-1.md`.

Снято **8 сентября 2026**, `curl`, без заголовков авторизации (гость).

## Что здесь лежит

| Папка | Что | Файлов |
|---|---|---|
| `inline/` | инлайновые `<style>` серверного ответа, по файлу на страницу | 10 |
| `external/` | внешние `.css` сборки `courses-web` | 12 |

`inline/<id>.css` — все блоки `<style>` страницы в порядке появления,
склеенные разделителем `/* ---- next <style> block ---- */`. Текст блоков
не изменён. Блоков на страницу 12–21; блок утилит Tailwind продукт печатает
**дважды**, поэтому счётчик правила по объединённому корпусу даёт 20 на десять
страниц, а не 10.

## Соответствие страницам

`<id>` тот же, что у `evidence/source/production/pages/<id>/`. URL — в
`pages/<id>/meta.json`.

| id | URL |
|---|---|
| `author` | `/courses/authors/23-stepan-voevodin` |
| `authors` | `/courses/authors` |
| `courses-listing` | `/courses` |
| `editors` | `/courses/editors` |
| `education-center` | `/education_centers/35-yandeks-praktikum` |
| `education-centers-listing` | `/education_centers` |
| `promocodes` | `/education/promocodes` |
| `rating` | `/education_centers/rating` |
| `reviews` | `/education_centers/otzyvy` |
| `schools-for-children` | `/education_centers/shkoly-dlya-detej` |

Все десять — `career.habr.com`. Внешние файлы —
`https://assets.habr.com/courses-web/courses-web/<имя>`; имя содержит хеш
сборки и меняется при следующем деплое, поэтому имена сохранены как есть.

`editors.css` и `authors.css` совпадают побайтово, как и
`education-centers-listing.css` со `schools-for-children.css` — это не ошибка
копирования, а одинаковый набор чанков у этих пар страниц (см. контрольные
суммы ниже).

## Граница воспроизводимости

DOM и `computed*.json` в `pages/` сняты **7 сентября 2026**, этот корпус —
**8 сентября**. За сутки сборка не менялась: все значения шага (девять
ступеней, база документа, 14 `@font-face`, одиннадцать селекторов фокуса,
шесть брейкпоинт-префиксов) пересчитаны по сохранённому здесь корпусу и
сошлись с числами, снятыми 7 сентября. Совпадения хешей сборки между двумя
датами при этом никто не фиксировал — сравнивать было не с чем, потому что
`pages/<id>/dom.html` сериализует `body` и ссылок на `.css` не содержит.

Следующий деплой сменит хеши имён. Файлы здесь — снимок, а не зеркало: при
расхождении с живым продом верен живой прод, а этот корпус показывает, на чём
стояли утверждения R0-03.

## Контрольные суммы (SHA-256)

```
inline/
423882833f6a7bd979b126ac2deac9016dbd13495d351b6308870ca64333e571  author.css
d7386f216b5c409d2aba13dc226cc1341e667af549115209a6abd8ca6c8936d7  authors.css
f52f0a194436f55c3c0ea341598cf085e22b4b54b5de72782b89fd66471ff249  courses-listing.css
d7386f216b5c409d2aba13dc226cc1341e667af549115209a6abd8ca6c8936d7  editors.css
abbfd2cebf90591c8d0f72dc80c3d44d573bf89a98264fd17dd1b3b8d639be05  education-center.css
f3c469f5f14fd1df8a3c052f72cd23c3bfdadc05de62bd79fa27aca71546db82  education-centers-listing.css
27c361a691015863a6caefc1c5d4c4a1a4888ca3bde6b162bb24fc321e98bb6e  promocodes.css
2d577aef933afca8f037731c17d427981f30cb39b58e16cf145c9e11bc03c4d8  rating.css
1cc51e11390e2451afc69ef25653f5386f9553f90bbe4a6025c1fec69538536a  reviews.css
f3c469f5f14fd1df8a3c052f72cd23c3bfdadc05de62bd79fa27aca71546db82  schools-for-children.css

external/
8d69de726b10c6db409b83e5ed5240c09e0bcb7c02912b9cf08f0d5bcd4797cc  banner-swiper.DLNJG_cN.css
35230044a844c40b5d164e735eef0a26d8cc99b15a984a14d00b1eccb88afe56  base-avatar.DRRhEzL5.css
0adb68c060fc62fdb5671f9842a222e75a1c9b85822fbb5e3b6d90771ed40b81  base-custom-select-with-input-list.DYeSdhXo.css
a217b5ceaed33765370fb77af9ee8504167b867af95755da5881c125ebe3dcbc  base-scrollbar.BlosO-Kv.css
a40d897f0663723de141c3df3fc2ec0a3a878a1fb1162901f91021e15e9829c4  base-swiper.DkC20VJe.css
33aa571205fb7fa6b060920cca82336a787174da6fe8de1708fb5862c9cfa7d6  course-card-skeleton.DgMnfZhS.css
ac1844f8ddf7b2e81c96d80dd5014be4b5008cb12e0febc607515cb4e6bcef8e  course-filters-sticky-header.DsGippl7.css
6754b213b193d9543544bc922913046cb077c1c86ee4584a73c760fdfab573cd  entry.Dcg7kqZY.css
161a63af2f2da46b0423ced37d997c6759fe8daf1c8299bdf38d9b6241d972ca  journal-articles.BVzsV5L_.css
845924303b86ec197649a8e04e807f2d2d3630cd8db6a7d7d1b4cffc4e02bd1b  similar-courses.DqXT-MW0.css
c5b493676f74dd011d293741a68f7759d7f0d4c3478f2fe58ec6a22f50bc91c5  style-ugc.D1z1_XJG.css
8ea947d8c0bd329fec28692b629e445aae5415661b55134ca3ea496150b98b4f  use-custom-select-actions.DV3xIpa1.css
```

## Как перепроверить утверждение шага

Классы в CSS экранированы: `desktop:hidden` записан `.desktop\:hidden`,
`text-[8px]` — `.text-\[8px\]`. Искать по неэкранированной форме нельзя —
именно так шаг потерял префикс `desktop:` (находка 1 отчёта `review-1.md`).

```bash
cd evidence/source/production/css
cat inline/*.css external/*.css > /tmp/corpus.css

# объявлено ли правило
grep -o '\.desktop\\:hidden{[^}]*}' /tmp/corpus.css

# в каком медиазапросе оно живёт — разбором вложенности, не поиском подстроки
# (см. .pipeline/R0-03/capture.md §4, таблица брейкпоинт-префиксов)
```

Покрытие в разметке считается не здесь, а по `pages/<id>/dom.html` — точным
совпадением токена в атрибуте `class`, а не подстрокой.
