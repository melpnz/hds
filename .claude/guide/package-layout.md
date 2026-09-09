# Структура пакета

```text
<product>/
  README.md             карта, статус, coverage и known limits
  BRIEF.md              продукт, источники, границы и готовность
  ROADMAP.md            волны, зависимости, пакеты работ и статусы
  CHANGELOG.md          Unreleased и релизы
  RULES.md              свод правил после достаточного корпуса
  ui/
    <product>.css       единая точка входа
    tokens.css
    foundations.css
    components/*.css
    assets/
  components/
    INDEX.md
    STATES.md
    manifest.json
    <category>/<id>.md
  showcase/
    components.html
    pages.html           для интерфейса
    blocks.html          для лендинга
  pages/                 статьи о семействах экранов
  blocks/                статьи о блоках лендингов
  PATTERNS.md            рецепты лендингов, если применимо
  docs/guide/
    composition.md
    decisions.md
    assets.md             как выбирать и размещать иллюстрации
  evidence/
    source/production/
    source/figma/
    curated/
    verification/
    coverage.md
  machine/
    index.json
    tokens.json
    components.json
    rules.json
    patterns.json
    content.json
    assets.json
    *.overrides.json
  AGENTS.md              контракт модели-потребителя
  tools/
  .pipeline/             журнал процесса, не пользовательская документация
```

Человек и генератор читают разные проекции одной истины. `ui/` копируется на
пустую страницу и не зависит от showcase. Evidence отделён от выводов. Имена и
категории отражают смысл интерфейса, а не дерево Figma или Storybook.

`.pipeline/` версионируется для трассировки:

```text
.pipeline/
  inventory.json
  audit-<date>.md
  principles-evidence.md
  <batch-or-element-id>/
    capture.md
    review-N.md
    fix-N.md
    accept.md
    validate.log
```

Read-only пакет не изменяется: audit пишется в `.audits/<package>-<date>.md` в
корне репозитория.
