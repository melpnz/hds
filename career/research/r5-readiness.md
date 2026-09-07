# R5 — готовность entity-модулей

Дата проверки: **7 сентября 2026**. Цель — выбрать первую entity-карточку без
достраивания закрытых или неподтверждённых продуктовых сценариев.

## Решение

Первой задачей R5 была **VacancyCard**. Она нормализована как
каноническую карточку листинга: состав, адаптив, неполные данные и доступные
действия имеют evidence в локальном пакете и на публичной странице.

`QuickApply` не входит в эту задачу: публичное действие «Откликнуться» видно,
но форма и её состояния требуют авторизации и не исследованы.

## Evidence на 7 сентября 2026

| Кандидат | Что подтверждено | Что мешает закрыть |
|---|---|---|
| VacancyCard | Локальная спецификация, 12/12 Storybook snapshots, CSS, витрина, responsive правило до 1023 px; публичный листинг показывает компанию, название, зарплату/её отсутствие, grade, remote/location, skills и действие «Откликнуться». | Нужны отдельные решения для action «Откликнуться» и saved/applied — это бизнес-сценарии. |
| ResumeCard | Публичный листинг показывает имя, дату, специализацию + grade, зарплатное ожидание/статус и skills. | 0/3 Storybook snapshots; нет снятой DOM-разметки, controls и устойчивого CSS root. Нельзя честно заявить API, адаптив или интерактивные состояния. |
| CompanyCard | Есть public listing и evidence в пакете. | Нет отдельной канонической спецификации/manifest entry; нужно сначала отделить её от CompanyRatingCard. |
| TestCard | Есть частичное evidence. | 7/59 snapshots; сценарии owner/guest/payment требуют отдельной business-state модели. |

## Граница первой задачи

`VacancyCard` должна принимать данные, а не исполнять продуктовые действия:

```text
company, title, publishedAt, salary?, grade?, workFormat?, locations[], skills[],
rating?, accreditation?, saved?
```

`saved` — допустимое presentation state только для кнопки избранного. `applied`,
`hidden`, `promoted`, результат отклика, loading/error/success отклика и авторизация
остаются за пределами карточки до R6 или отдельного domain-contract.

## Следующее изменение

1. ~~Разделить старую Storybook-карточку и карточку листинга в одной спецификации.~~
2. ~~Внести `VacancyCard` в manifest как entity-модуль с data variants, а не с
   выдуманными UI states.~~
3. ~~Добавить живой листинговый пример и browser tests для desktop/mobile и
   отсутствующих salary, rating, skills, company logo.~~
4. Зафиксировать отдельный `QuickApply` backlog с зависимостью от evidence
   авторизованного сценария.

## Источники

- Локальная [спецификация VacancyCard](../components/cards/vacancy-card.md),
  [страница-композиция](../showcase/pages.html) и
  [`list-vacancies` production evidence](../evidence/source/production/list-vacancies.json).
- Локальная [спецификация ResumeCard](../components/cards/resume-card.md) и
  [`list-resumes` production evidence](../evidence/source/production/list-resumes.json).
- Публичные страницы: <https://career.habr.com/vacancies>,
  <https://career.habr.com/resumes>, <https://career.habr.com/companies>.
