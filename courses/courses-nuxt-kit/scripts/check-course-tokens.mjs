import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const componentsDirectory = join(process.cwd(), 'layers', 'courses', 'app', 'components')
const files = (await readdir(componentsDirectory)).filter(file => file.endsWith('.vue'))
const violations = []
const namedScale = new Set([2, 4, 6, 8, 10, 12, 16, 20, 22, 24, 32, 36, 40, 48, 56, 60, 64, 68, 70, 72, 94, 100, 112, 136, 150, 192, 208, 232, 260, 272, 300, 320, 360, 568, 620, 800])
const checks = [
  ['literal color', /#[0-9a-f]{3,8}\b|rgba?\(/gi],
  ['literal rem dimension', /(?<![\w-])-?(?:\d*\.)?\d+rem\b/g],
  ['literal px declaration', /(?:^|[;{])\s*[-\w]+\s*:\s*[^;{}]*\b-?(?:\d*\.)?\d+px\b/gm],
  ['spacing token used as radius', /border-radius\s*:[^;{}]*var\(--crs-space-/g],
  ['spacing token used as typography', /(?:font-size|line-height)\s*:[^;{}]*var\(--crs-space-/g],
  ['size token used as typography', /(?:(?:font-size|line-height|--[\w-]*(?:font-size|line-height))\s*:\s*var\(--crs-size-|font\s*:[^;{}]*\/var\(--crs-size-)/g],
  ['spacing token used as dimension', /(?:width|height|min-width|min-height|max-width|max-height|--[\w-]*(?:width|height|size))\s*:\s*var\(--crs-space-/g],
  ['literal pill radius', /border-radius\s*:\s*(?:999px|50%)/g],
  ['literal loader duration', /animation(?:-duration)?\s*:[^;{}]*\b(?:\.8|1\.6)s\b/g],
  ['literal high z-index', /z-index\s*:\s*(?:[4-9]|[1-9]\d+)\b/g],
  ['literal font family', /\bInter\s*,\s*sans-serif\b/g]
]
// Inline styles are allowed only when their value is runtime data and cannot be represented by a static token.
// Keep every exception narrow and document why it is data rather than component geometry.
const inlineStyleAllowlist = {
  'ArticleCard.vue': [{ pattern: /backgroundImage.*url\(/, reason: 'runtime image URL' }],
  'Avatar.vue': [{ pattern: /--avatar-size.*cssSize/, reason: 'public numeric avatar size converted to rem' }],
  'CardGrid.vue': [{ pattern: /--crs-columns.*columns/, reason: 'runtime column count without a dimension' }],
  'DemandChart.vue': [{ pattern: /height.*value.*max.*100.*%/, reason: 'data-driven chart percentage' }],
  'FilterModal.vue': [{ pattern: /height.*height.*px/, reason: 'data-driven histogram bar height' }],
  'ServiceLogo.vue': [{ pattern: /--crs-service-logo-width.*cssWidth.*--crs-service-logo-height.*cssHeight/, reason: 'public numeric logo dimensions converted to rem' }]
}
const usedInlineAllowances = new Set()

function checkCss(source, label) {
  for (const [checkLabel, pattern] of checks) {
    for (const match of source.matchAll(pattern)) violations.push(`${label}: ${checkLabel} "${match[0]}"`)
  }
  for (const match of source.matchAll(/calc\(var\(--crs-unit\) \* (\d+)\)/g)) {
    if (namedScale.has(Number(match[1]))) violations.push(`${label}: named token exists for "${match[0]}"`)
  }
}

function checkInlineStyles(source, file) {
  for (const match of source.matchAll(/(?:v-bind:style|:style|\bstyle)\s*=\s*(["'])([\s\S]*?)\1/g)) {
    const value = match[2]
    const allowanceIndex = (inlineStyleAllowlist[file] ?? []).findIndex(({ pattern }) => pattern.test(value))
    if (allowanceIndex === -1) violations.push(`${file}: undocumented inline style "${value}"`)
    else usedInlineAllowances.add(`${file}:${allowanceIndex}`)
  }
}

function checkArbitraryValues(source, file) {
  for (const match of source.matchAll(/\[[^\]\r\n]+\]/g)) {
    const value = match[0]
    const prefix = source.slice(Math.max(0, match.index - 5), match.index)
    if (/(?:min|max)-$/.test(prefix)) continue
    if (/#[0-9a-f]{3,8}\b|rgba?\(|-?(?:\d*\.)?\d+(?:px|rem)\b/i.test(value)) {
      violations.push(`${file}: literal Tailwind arbitrary value "${value}"`)
    }
  }
}

for (const file of files) {
  const source = await readFile(join(componentsDirectory, file), 'utf8')
  const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n')
  checkCss(styles, file)
  checkInlineStyles(source, file)
  checkArbitraryValues(source, file)
}

const tokensSource = await readFile(join(process.cwd(), 'layers', 'courses', 'app', 'assets', 'css', 'courses.css'), 'utf8')
const baseStyles = tokensSource.replace(/:root\s*\{[\s\S]*?\n\}/, '')
checkCss(baseStyles, 'courses.css outside :root')

for (const [file, allowances] of Object.entries(inlineStyleAllowlist)) {
  allowances.forEach(({ reason }, index) => {
    if (!usedInlineAllowances.has(`${file}:${index}`)) violations.push(`${file}: stale inline-style allowance (${reason})`)
  })
}

if (violations.length) {
  console.error(`Courses token check failed:\n${violations.join('\n')}`)
  process.exit(1)
}

console.log(`Courses token check passed: ${files.length} components use shared tokens; inline styles and Tailwind arbitrary values are guarded.`)
