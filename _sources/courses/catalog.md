# COURSES Storybook — catalog

Иерархия сохранена как в Storybook. Не переработана.

`https://develop.career.habratest.net/courses-web/storybook-static/` · Storybook 8.4.7 · 45 записей (27 stories, 18 docs) · 18 компонентов

Обозначения: `N props` — число controls; `rendered` — есть локальный snapshot DOM; `captured` — есть локальная docs-страница; `src` — сохранён исходник story.

---

## Common
  - **BaseButton**
    - `Docs` — `common-basebutton--docs`  · docs
    - `Обычная кнопка` — `common-basebutton--primary-button`  · rendered 426B
    - `Кнопка с иконкой внутри` — `common-basebutton--icon-button`  · rendered 426B
## common
  - **BaseFilterModalNew**
    props (11):
      - `title` :text  [props]
      - `buttonTitle` :text  [props]
      - `hasCloseButton` :boolean  [props]
      - `isLoading` :boolean  [props]
      - `disabled` :boolean  [props]
      - `resetFilter` :object  [events]
      - `applyFilter` :object  [events]
      - `close` :object  [events]
      - `open` :object  [events]
      - `default` :object  [slots]
      - `toggle` :object  [expose]
    - `Docs` — `common-basefiltermodalnew--docs`  · docs · captured 9808B
    - `Новая модалка фильтров` — `common-basefiltermodalnew--default`  · rendered 608B · src
  - **BaseFilterModal**
    props (11):
      - `title` :text  (default 'Фильтры')  [props]
      - `activeCount` :number  (default 0)  [props]
      - `hasCloseButton` :boolean  [props]
      - `disabled` :boolean  [props]
      - `hasButtons` :boolean  (default true)  [props]
      - `resetFilter` :object  [events]
      - `applyFilter` :object  [events]
      - `close` :object  [events]
      - `open` :object  [events]
      - `default` :object  [slots]
      - `toggle` :object  [expose]
    - `Docs` — `common-basefiltermodal--docs`  · docs · captured 9605B
    - `Базовая модалка фильтров` — `common-basefiltermodal--default`  · rendered 597B · src
  - **BaseFilterWithImage**
    props (3):
      - `title` :text  [props]
      - `active` :boolean  [props]
      - `image` :object  [props]
    - `Docs` — `common-basefilterwithimage--docs`  · docs · captured 13418B
    - `Фильтр с картинкой` — `common-basefilterwithimage--default`  · rendered 593B · src
    - `Активное состояние` — `common-basefilterwithimage--active`  · rendered 592B · src
  - **BaseFilter**
    props (4):
      - `active` :boolean  [props]
      - `filled` :boolean  [props]
      - `appearance` :radio = default | edu  [props]
      - `default` :object  [slots]
    - `Docs` — `common-basefilter--docs`  · docs · captured 11130B
    - `Обычный фильтр` — `common-basefilter--base-filter-story`  · rendered 321B · src
    - `Фильтр с иконкой` — `common-basefilter--icon-base-filter-story`  · rendered 545B · src
  - **BaseSection**
    props (3):
      - `title` :text  [props]
      - `subtitle` :object  [slots]
      - `default` :object  [slots]
    - `Docs` — `common-basesection--docs`  · docs · captured 5420B
    - `Base Section Story` — `common-basesection--base-section-story`  · rendered 212B · src
  - **Colors**
    - `Docs` — `common-colors--docs`  · docs · captured 9728B
    - `Colors` — `common-colors--colors`  · rendered 7444B · src
  - **Typography**
    - `Docs` — `common-typography--docs`  · docs · captured 2970B
    - `Typography` — `common-typography--typography`  · rendered 654B · src
  - **BaseCheckbox**
    props (8):
      - `modelValue` :object  [props]
      - `disabled` :boolean  [props]
      - `name` :text  [props]
      - `value` :object  [props]
      - `trueValue` :object  [props]
      - `falseValue` :object  [props]
      - `update:modelValue` :object  [events]
      - `default` :object  [slots]
    - `Docs` — `common-basecheckbox--docs`  · docs · captured 7958B
    - `Base Checkbox Story` — `common-basecheckbox--base-checkbox-story`  · rendered 437B · src
  - **BaseSwitch**
    props (8):
      - `modelValue` :boolean  [props]
      - `name` :text  [props]
      - `appearance` :radio = default | edu  (default 'default')  [props]
      - `trueValue` :object  (default true)  [props]
      - `falseValue` :object  (default false)  [props]
      - `update:modelValue` :object  [events]
      - `before` :object  [slots]
      - `default` :object  [slots]
    - `Docs` — `common-baseswitch--docs`  · docs · captured 9972B
    - `Base Switch Story` — `common-baseswitch--base-switch-story`  · rendered 1787B · src
## forms
  - **BaseCustomSelect**
    props (21):
      - `options` :object  [props]
      - `placeholder` :text  [props]  — Текст плейсхолдера, используемый если опция еще не была выбрана
      - `disabled` :boolean  [props]  — Выключен ли контрол
      - `modelValue` :object  [props]
      - `placement` :object  [props]
      - `isFixedWidth` :boolean  [props]
      - `isLoading` :boolean  [props]
      - `listboxWidth` :text  [props]
      - `isDropdownList` :boolean  [props]
      - `isFullHeightList` :boolean  [props]
      - `popperClass` :text  [props]
      - `update:modelValue` :object  [events]
      - `close` :object  [events]
      - `openDropdown` :object  [events]
      - `hideDropdown` :object  [events]
      - `content` :object  [slots]
      - `option` :object  [slots]
      - `after-options` :object  [slots]
      - `hide` :object  [expose]
      - `show` :object  [expose]
      - `dropdownRef` :object  [expose]
    - `Docs` — `forms-basecustomselect--docs`  · docs · captured 21306B
    - `Стандартное использование с BaseCustomSelectOption` — `forms-basecustomselect--base-story`  · rendered 1251B · src
    - `Опции могут иметь поле subtitle` — `forms-basecustomselect--base-story-subtitles`  · rendered 915B · src
    - `Опции могут иметь поле image` — `forms-basecustomselect--base-story-images`  · rendered 915B · src
  - **MultiSelect**
    props (19):
      - `modelValue` :object  [props]
      - `defaultLabel` :text  (default '')  [props]
      - `searchPlaceholder` :text  [props]
      - `action` :object  [props]
      - `noResultsMessage` :text  [props]
      - `withBaseFilter` :boolean  (default false)  [props]
      - `label` :text  [props]
      - `termMinLength` :number  (default 0)  [props]
      - `cacheKey` :text  [props]
      - `preCachedOptions` :object  [props]
      - `textInputId` :text  [props]
      - `showInsertMessage` :boolean  (default true)  [props]
      - `hasAppliedOptions` :boolean  (default false)  [props]
      - `placement` :object  (default 'bottom')  [props]
      - `update:modelValue` :object  [events]
      - `insertToSearch` :object  [events]
      - `content` :object  [slots]
      - `footer-button` :object  [slots]
      - `close` :object  [expose]
    - `Docs` — `forms-multiselect--docs`  · docs · captured 12405B
    - `Обычное использование MultiSelect` — `forms-multiselect--base-story`  · rendered 1061B · src
## header
  - **HeaderDropdown**
    props (6):
      - `sectionKey` :radio = services | courses
      - `width` :number  [props]
      - `section` :object  [props]
      - `name` :object  [slots]
      - `title` :object  [slots]
      - `toggle` :object  [expose]
    - `Docs` — `header-headerdropdown--docs`  · docs · captured 8246B
    - `Header Dropdown Story` — `header-headerdropdown--header-dropdown-story`  · rendered 1189B · src
  - **HeaderSection**
    props (2):
      - `sectionKey` :radio = services | courses
      - `section` :object  [props]
    - `Docs` — `header-headersection--docs`  · docs · captured 4915B
    - `Header Section Story` — `header-headersection--header-section-story`  · rendered 256B · src
## Icons
  - **CatalogIcon**
    - `Docs` — `icons-catalogicon--docs`  · docs
    - `Catalog Icon Story` — `icons-catalogicon--default`  · rendered 426B
    - `Все возможные варианты` — `icons-catalogicon--all-variants`  · rendered 426B
  - **ProjectIcon**
    props (1):
      - `icon` :select = habr | qna | career | courses  [props]
    - `Docs` — `icons-projecticon--docs`  · docs · captured 11531B
    - `Project Icon Story` — `icons-projecticon--default`  · rendered 536B · src
    - `Все возможные варианты` — `icons-projecticon--all-variants`  · rendered 2341B · src
  - **SocialIcon**
    props (2):
      - `icon` :select = facebook | twitter | instagram | youtube | vk | dzen | github | telegram | telegram-bot  [props]
      - `size` :number  [props]
    - `Docs` — `icons-socialicon--docs`  · docs · captured 11538B
    - `Social Icon Story` — `icons-socialicon--default`  · rendered 210B · src
    - `Все возможные варианты` — `icons-socialicon--all-variants`  · rendered 2418B · src
  - **SpriteIcon**
    props (2):
      - `icon` :select = accreditation | accreditation-expert | arrow-large | arrow-small | building | catalog | comment | cross-large | cross-small | datepicker | filter | loader | more | menu | menu-close | percents | plus | search | sort | star-empty | star-rounded | star-rounded-small  [props]
      - `size` :number  [props]
    - `Docs` — `icons-spriteicon--docs`  · docs · captured 16098B
    - `Sprite Icon Story` — `icons-spriteicon--default`  · rendered 217B · src
    - `Все возможные варианты` — `icons-spriteicon--all-variants`  · rendered 6350B · src
