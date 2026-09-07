# TestResultModals · Окна результатов тестов

| | |
|---|---|
| **Категория** | Модуль: тесты |
| **Корневой класс** | — |
| **CSS** | `ui/components/overlays.css` |
| **Живая реализация** | нет — см. «Ограничения» |
| **Snapshot Storybook** | 0 из 7 |

## Назначение

Модальные окна с результатом теста: разбор по навыкам, разбор по специализациям и список доступных скринингов.

## Анатомия

_Разметка недоступна: см. «Ограничения»._

## Состояния

_В извлечённом CSS и разметке состояний не объявлено. Не достраиваем._

## Props

_Storybook не отдаёт controls для этого компонента._

## Токены

_Компонент не обращается к переменным напрямую._

## Responsive

Компонент реагирует на: `(max-width:479px)`.

## Доступность

_В снятой разметке нет ARIA-атрибутов и role. Не достраиваем._

## CSS

```css
@media (max-width:479px) {
  .test-result-modal-item { padding:0 1.5rem }
}
```

## Ограничения

- Все семь story сломаны в самом Storybook Career (недостающие чанки сборки). Разметка не снята.
- CSS обеих секций сохранён, но он крошечный (по 86 байт): окна собраны из BaseModal плюс утилиты.
- ЧЕГО НЕ ХВАТАЕТ: разметки. Основа — BaseModal — восстановлена полностью, недостаёт только содержимого.

## Источники

- Файлы в репозитории `career-web`: `./src/components/tests/skills-test-result-modal.stories.ts`, `./src/components/tests/specs-test-result-modal.stories.ts`, `./src/components/tests/screenings-list-modal.stories.ts`
- Storybook `career-web`: `tests-modals-skillstestresultmodal--owner-view`, `tests-modals-skillstestresultmodal--guest-view`, `tests-modals-skillstestresultmodal--expired-result`, `tests-modals-specstestresultmodal--owner-view`, `tests-modals-specstestresultmodal--guest-view`, `tests-modals-screeningslistmodal--guest-view`, `tests-modals-screeningslistmodal--owner-view`
- CSS: секция `specs-test-result-modal` в `ui/components/overlays.css`
- Исходный корпус: `_sources/career/` (архивный, пакет от него не зависит)
