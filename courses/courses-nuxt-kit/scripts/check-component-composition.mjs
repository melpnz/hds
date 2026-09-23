import { readFile, readdir } from 'node:fs/promises'

const componentsRoot = new URL('../layers/courses/app/components/', import.meta.url)
const componentFiles = (await readdir(componentsRoot)).filter(file => file.endsWith('.vue')).sort()
const componentNames = new Set(componentFiles.map(file => file.replace(/\.vue$/, '')))

// These contracts express deliberate architectural decisions. Automatic checks below cover every component,
// while this list ensures that important compositions cannot silently be replaced with local markup.
const requiredComposition = {
  'AdCard.vue': ['IconButton'],
  'ArticleCard.vue': ['Link'],
  'AuthorsBlock.vue': ['Avatar', 'Prose', 'Button', 'Link', 'SocialIcon'],
  'CatalogMenu.vue': ['IconButton', 'SearchInput', 'ButtonGroup', 'Link', 'TileFilter'],
  'CourseCard.vue': ['RatingBadge', 'Chip', 'Button', 'EntityLogo'],
  'EntityHeader.vue': ['EntityLogo', 'RatingBadge', 'Link'],
  'FeedbackForm.vue': ['ButtonGroup', 'Button', 'TextInput'],
  'FilterModal.vue': ['IconButton', 'FilterChip', 'TextInput', 'Checkbox', 'TileFilter', 'Button'],
  'HeaderDropdown.vue': ['Button', 'IconButton', 'Link', 'ServiceLogo'],
  'LearningStep.vue': ['Chip'],
  'LinkGrid.vue': ['Link'],
  'MobileMenu.vue': ['IconButton', 'Link', 'ServiceLogo'],
  'MultiSelect.vue': ['Chip', 'OptionList'],
  'OptionList.vue': ['OptionItem'],
  'OptionItem.vue': ['Checkbox', 'Avatar', 'EntityLogo', 'Chip'],
  'Pagination.vue': ['IconButton', 'PaginationItem'],
  'PersonCard.vue': ['Avatar', 'SocialIcon'],
  'PersonHeader.vue': ['Avatar', 'SocialIcon'],
  'PriceSheet.vue': ['TextInput', 'Select', 'Button'],
  'RatingTable.vue': ['EntityLogo', 'Link'],
  'ReviewCard.vue': ['Avatar', 'RatingBadge', 'Link'],
  'SchoolCard.vue': ['EntityLogo', 'RatingBadge', 'AvatarStack', 'Chip', 'Button'],
  'Select.vue': ['OptionList'],
  'SiteFooter.vue': ['SocialIcon', 'Link', 'ServiceLogo'],
  'SiteHeader.vue': ['HeaderDropdown', 'SearchInput', 'Select', 'IconButton', 'FilterChip', 'ButtonGroup', 'Button', 'Link', 'ServiceLogo', 'Chip'],
  'SortSheet.vue': ['OptionList'],
  'StepCard.vue': ['LearningStep'],
  'TextInput.vue': ['IconButton'],
  'FilterChip.vue': ['OptionList']
}

const failures = []
const dependencyGraph = new Map()
const nativeElementOwners = {
  button: {
    'ButtonGroup.vue': 'segmented controls own their repeated button semantics',
    'FilterChip.vue': 'filter-chip primitive owns its toggle and dropdown trigger semantics',
    'IconButton.vue': 'icon-only button primitive',
    'PaginationItem.vue': 'page-number primitive owns its button semantics',
    'Select.vue': 'select trigger owns combobox button semantics'
  },
  input: {
    'Checkbox.vue': 'checkbox primitive',
    'RadioButton.vue': 'radio primitive',
    'SearchInput.vue': 'search-field primitive',
    'Switch.vue': 'switch primitive',
    'TextInput.vue': 'text-field primitive'
  },
  textarea: { 'Textarea.vue': 'textarea primitive' },
  select: {},
  a: { 'SocialIcon.vue': 'social-link primitive owns its anchor semantics' },
  svg: {}
}
const usedNativeAllowances = new Set()
// Composition is a hard boundary: no parent component may reach into a child with :deep(),
// and interactive elements are always styled through their component or semantic class.

function templateSource(source) {
  return source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
}

function styleSources(source) {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1])
}

function normalizeSelector(selector) {
  return selector.trim().replace(/\s+/g, ' ')
}

function checkStyleBoundaries(source, file) {
  for (const style of styleSources(source)) {
    for (const match of style.matchAll(/([^{}]+)\{/g)) {
      const selectorGroup = match[1].trim()
      if (!selectorGroup || selectorGroup.startsWith('@')) continue
      for (const rawSelector of selectorGroup.split(',')) {
        const selector = normalizeSelector(rawSelector)
        if (!selector) continue

        if (selector.includes(':deep(')) {
          failures.push(`${file}: forbidden :deep() selector "${selector}"`)
          continue
        }

        const interactiveTags = [...selector.matchAll(/(?:^|[\s>+~])(button|input|select|textarea|a)(?=$|[\s>+~.#:[(])/gi)]
          .map(tagMatch => tagMatch[1].toLowerCase())
        const ownsEveryTag = interactiveTags.length > 0 && interactiveTags.every(tag => file in nativeElementOwners[tag])
        if (interactiveTags.length > 0 && !ownsEveryTag) {
          failures.push(`${file}: forbidden internal interactive tag selector "${selector}"`)
        }
      }
    }
  }
}

function isKnownExternalComponent(name) {
  return ['Teleport', 'Transition', 'TransitionGroup', 'KeepAlive', 'Suspense', 'ClientOnly'].includes(name)
    || /^U[A-Z]/.test(name)
    || /^Nuxt[A-Z]/.test(name)
}

for (const file of componentFiles) {
  const source = await readFile(new URL(file, componentsRoot), 'utf8')
  const template = templateSource(source)
  const dependencies = new Set()

  for (const match of template.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    const name = match[1]
    if (componentNames.has(name)) dependencies.add(name)
    else if (!isKnownExternalComponent(name)) failures.push(`${file}: unknown component <${name}>`)
  }
  dependencyGraph.set(file.replace(/\.vue$/, ''), dependencies)
  checkStyleBoundaries(source, file)

  for (const [tag, owners] of Object.entries(nativeElementOwners)) {
    if (!new RegExp(`<${tag}(?:\\s|/?>)`).test(template)) continue
    if (!(file in owners)) failures.push(`${file}: raw <${tag}> duplicates a library primitive`)
    else usedNativeAllowances.add(`${tag}:${file}`)
  }
}

for (const [file, requiredComponents] of Object.entries(requiredComposition)) {
  if (!componentFiles.includes(file)) {
    failures.push(`${file}: composition contract references a missing component file`)
    continue
  }
  const source = await readFile(new URL(file, componentsRoot), 'utf8')
  for (const component of requiredComponents) {
    if (!componentNames.has(component)) failures.push(`${file}: composition contract references unknown <${component}>`)
    if (!new RegExp(`<${component}(?:\\s|/?>)`).test(source)) failures.push(`${file}: missing <${component}>`)
  }
}

for (const [tag, owners] of Object.entries(nativeElementOwners)) {
  for (const [file, reason] of Object.entries(owners)) {
    if (!componentFiles.includes(file)) failures.push(`${file}: stale <${tag}> allowance (${reason})`)
    else if (!usedNativeAllowances.has(`${tag}:${file}`)) failures.push(`${file}: unused <${tag}> allowance (${reason})`)
  }
}

function visit(component, path = [], visited = new Set()) {
  if (path.includes(component)) {
    failures.push(`component dependency cycle: ${[...path.slice(path.indexOf(component)), component].join(' -> ')}`)
    return
  }
  if (visited.has(component)) return
  const nextPath = [...path, component]
  for (const dependency of dependencyGraph.get(component) ?? []) visit(dependency, nextPath, visited)
  visited.add(component)
}

const cycleVisited = new Set()
for (const component of dependencyGraph.keys()) visit(component, [], cycleVisited)

if (failures.length) {
  console.error(`Component composition check failed:\n${failures.map(failure => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

const dependencyCount = [...dependencyGraph.values()].reduce((total, dependencies) => total + dependencies.size, 0)
console.log(`Component composition check passed: ${componentFiles.length} components, ${dependencyCount} internal dependencies, ${Object.keys(requiredComposition).length} required contracts, 0 :deep() and 0 internal interactive tag-selector exceptions.`)
