# Контракт implementation provider · Courses

Этот документ разделяет авторские и генерируемые сведения между machine-гайдом
и активной реализацией. Текущий provider — Courses Nuxt Kit, но контракт не
зависит от Vue и может быть использован будущей frontend-библиотекой.

## Владение полями

| Сведения | Источник истины | Как обновляются |
|---|---|---|
| `guideId`, назначение, поведение, доступность, композиция страниц, ограничения | machine-запись гайда | вручную после продуктового решения |
| `provider id`, версия, export, source, visibility, public API | manifest активного provider | генерируются из provider |
| `props`, `slots`, `emits`, `models` | исходный код публичного компонента provider | извлекаются генератором, вручную в mapping не редактируются |
| реализованные состояния | реестр provider | генерируются; расхождение с guide states показывается в mapping |
| Figma и production evidence | evidence и ссылки machine-записи | обновляются вручную после сверки источника |
| preview URL | manifest provider | генерируется вместе с manifest |
| aliases старых guide-id | `machine/aliases.json` | вручную как миграционное решение |

## Порядок использования

1. Найти стабильный `guideId` в `machine/catalog.json`.
2. Открыть mapping активного provider из `machine/index.json`.
3. По `apiFile` открыть только адресную provider-запись выбранного компонента и
   взять из неё `exportName`, `api`, `source` и `previewUrl`.
4. Для поведения, доступности и композиции прочитать выбранную machine-запись.
5. Если `missingInProvider` не пуст, не придумывать поддержку: использовать
   ближайшее безопасное состояние либо оформить запрос владельцу кита.

`api` содержит четыре массива:

- `props` — имя, TypeScript-тип, обязательность и источник (`prop`/`model`);
- `slots` — имена доступных слотов;
- `emits` — события и тип их payload;
- `models` — именованные `v-model` и их типы.

API извлекается из `<script setup>` и `<template>` файлов `.vue`. Изменение
публичного компонента без перегенерации manifest делает проверку кита красной;
изменение manifest без обновления provider mapping останавливает проверку гайда.

## Токены

Provider экспортирует исходные значения в `courses-kit.tokens.json`. Их
соответствие нейтральным токенам гайда находится в адресном файле
`machine/providers/courses-nuxt-kit.tokens.json`, а читаемый список пробелов — в
`machine/reports/provider-token-mapping.md`. Совпадения генерируются по имени,
алиасу и явным решениям из `courses-nuxt-kit.tokens.overrides.json`; разные
значения никогда не усредняются автоматически.

Нейтральный контракт разделён по происхождению: `machine/tokens.json` сохраняет
снятую production-палитру, `machine/dimension-tokens.json` содержит общую шкалу
размеров, а `machine/semantic-tokens.json` — назначения, которых не было в
старом production-слое (motion, opacity, эффекты, слои и компонентные цвета).
Поэтому замена временного Nuxt Kit другим provider требует нового mapping, но
не переименования стабильных семантических id гайда.

## Локальная визуальная сверка

`npm run serve:integrated` одновременно поднимает guide viewer на порту 4173 и
каталог активного provider на порту 3000. Адрес `?provider=local` сразу выбирает
реализацию kit. Для прямого mapping витрина показывает переключатель «Пример
гайда / UI Kit» и открывает `previewUrl` из адресной записи.
Для guide-only сущности переключателя нет. Статическая витрина не зависит от
запущенного Nuxt и остаётся fallback для GitHub.

Поле `preview.strategy` фиксирует владение визуалом: `provider-primary` означает,
что все состояния гайда реализованы provider; `hybrid` сохраняет статический
пример ещё и для состояния, которого пока нет в provider. Старые id не содержат
вторую реализацию — их HTML-адреса являются минимальными redirect на
канонический пример. Полный результат хранится в
`machine/reports/provider-preview-audit.md`.

## Page-pattern

Шесть machine-записей страниц содержат `providerComposition`: общую оболочку,
области в порядке рендера и дерево прямых компонентов. Узел
`provider-component` хранит стабильный guide id и сгенерированные
`providerComponentId`/`exportName`; `native` оставляет семантический HTML на
уровне страницы, а `external-slot` явно отделяет runtime-интеграцию от UI kit.

`Avatar` и `EntityLogo` внутри карточек не перечисляются повторно как прямые
дети страницы. Статический HTML страницы остаётся evidence и GitHub fallback,
но не считается второй реализацией компонентов. Сводка:
`machine/reports/page-pattern-composition.md`.
