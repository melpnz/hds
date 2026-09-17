import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PRODUCTS = new Set(["habr", "career", "courses", "landings"]);
const product = process.argv[2];
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

if (!PRODUCTS.has(product)) {
  console.error("Usage: node tools/tokenize-dimensions.mjs <habr|career|courses|landings> [--write]");
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = path.join(repoRoot, product);
const uiRoot = path.join(productRoot, "ui");
const tokenJsonPath = path.join(productRoot, "machine", "dimension-tokens.json");
const reportPath = path.join(productRoot, "machine", "reports", "dimension-exceptions.json");
const reportMarkdownPath = path.join(productRoot, "machine", "reports", "dimension-exceptions.md");
const tokenCssPath = path.join(uiRoot, "dimension-tokens.css");
const baseUnit = 4;
const allowedOffGrid = new Set([1, 2, 6]);
const normalizationDecisions = {
  habr: [{ category: "radius", from: "3px", to: "4px", scope: "all radius declarations" }],
  career: [],
  courses: [],
  landings: [
    { property: "--hds-space-1", from: "10px", to: "8px" },
    { property: "--hds-page-gutter", from: "30px", to: "32px" },
    { from: "42px", to: "40px", scope: "all dimension and font-size declarations" },
    { from: "26px", to: "24px", scope: "all dimension declarations" },
  ],
};

const excludedFiles = new Set([
  "dimension-tokens.css",
  "tokens.css",
  "tokens-figma.css",
  "themes/dark-v2.css",
  "themes/light-v2.css",
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function slash(value) {
  return value.split(path.sep).join("/");
}

function relativeToProduct(file) {
  return slash(path.relative(productRoot, file));
}

function categoryFor(property) {
  const prop = property.toLowerCase();
  if (prop.startsWith("--")) {
    if (/radius|round/.test(prop)) return "radius";
    if (/font.*size|text.*size/.test(prop)) return "font-size";
    if (/line.*height/.test(prop)) return "line-height";
    if (/space|spacing|padding|margin|gap|gutter/.test(prop)) return "space";
    return "size";
  }
  if (/^(margin|padding)(-|$)|^(gap|row-gap|column-gap)$|^scroll-(margin|padding)/.test(prop)) return "space";
  if (prop === "border-radius" || prop.endsWith("-radius")) return "radius";
  if (prop === "font-size") return "font-size";
  if (prop === "line-height") return "line-height";
  if (/^(width|height|min-width|max-width|min-height|max-height|top|right|bottom|left|inset|flex-basis)$/.test(prop)) return "size";
  if (/^(border|border-(top|right|bottom|left)|outline)$/.test(prop) || /(?:border|outline).*width/.test(prop)) return "border-width";
  return null;
}

function normalizedValue(category, property, value) {
  const decision = normalizationDecisions[product].find(item =>
    (!item.category || item.category === category) &&
    (!item.property || item.property === property) &&
    parseFloat(item.from) === value
  );
  return decision ? parseFloat(decision.to) : value;
}

function lineAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function tokenName(category, numeric, negative = false) {
  const normalized = String(numeric).replace(".", "_");
  return `--${product}-${category}-${negative ? "negative-" : ""}${normalized}`;
}

function addToken(tokens, category, numeric, negative) {
  const cssVar = tokenName(category, numeric, negative);
  tokens[category] ??= {};
  const key = `${negative ? "negative-" : ""}${String(numeric).replace(".", "_")}`;
  tokens[category][key] = {
    $type: "dimension",
    $value: `${negative ? "-" : ""}${numeric}px`,
    cssVariable: cssVar,
  };
  return cssVar;
}

function addException(exceptions, reason, value, file, index, property, text) {
  const key = `${reason}|${value}`;
  const entry = exceptions.get(key) ?? { value, reason, occurrences: [] };
  if (entry.occurrences.length < 50) {
    entry.occurrences.push({ file: relativeToProduct(file), line: lineAt(text, index), property });
  }
  entry.total = (entry.total ?? 0) + 1;
  exceptions.set(key, entry);
}

function transformCss(file, source, tokens, exceptions) {
  const comments = [];
  let masked = source.replace(/\/\*[\s\S]*?\*\//g, (value) => {
    comments.push(value);
    return `___CSS_COMMENT_${comments.length - 1}___`;
  });

  const declaration = /(^|[;{}])([ \t\r\n]*)(--[-\w]+|[-\w]+)\s*:\s*([^;{}]+)(?=;|})/gm;
  masked = masked.replace(declaration, (whole, boundary, whitespace, property, value, offset) => {
    const category = categoryFor(property);
    const valueOffset = offset + whole.indexOf(value);
    const relativePattern = /(?<![-\w.])(-?\d*\.?\d+)(rem|em)\b/g;
    for (const match of value.matchAll(relativePattern)) {
      addException(exceptions, "relative-unit-needs-semantic-decision", `${match[1]}${match[2]}`, file, valueOffset + match.index, property, source);
    }

    const pixelPattern = /(?<![-\w.])(-?\d*\.?\d+)px\b/g;
    const nextValue = value.replace(pixelPattern, (literal, rawNumber, localOffset) => {
      const number = Number(rawNumber);
      const absolute = Math.abs(number);
      if (absolute === 0) return literal;
      const normalized = normalizedValue(category, property, absolute);
      const isSupported = Number.isInteger(normalized / baseUnit) || allowedOffGrid.has(normalized);
      if (!isSupported) {
        addException(exceptions, "not-on-4px-grid", literal, file, valueOffset + localOffset, property, source);
        return literal;
      }
      if (!category) {
        addException(exceptions, "composite-or-unsupported-property", literal, file, valueOffset + localOffset, property, source);
        return literal;
      }
      const cssVariable = addToken(tokens, category, normalized, number < 0);
      return `var(${cssVariable})`;
    });
    if (nextValue === value) return whole;
    return `${whole.slice(0, whole.indexOf(value))}${nextValue}`;
  });

  return masked.replace(/___CSS_COMMENT_(\d+)___/g, (_, index) => comments[Number(index)]);
}

function sortTokenGroups(tokens) {
  const result = {};
  for (const category of Object.keys(tokens).sort()) {
    result[category] = Object.fromEntries(Object.entries(tokens[category]).sort((a, b) => {
      const av = Math.abs(parseFloat(a[1].$value));
      const bv = Math.abs(parseFloat(b[1].$value));
      return av - bv || a[0].localeCompare(b[0]);
    }));
  }
  return result;
}

function renderCss(tokens) {
  const lines = [
    "/* Generated by tools/tokenize-dimensions.mjs. Do not edit by hand. */",
    ":root {",
  ];
  for (const group of Object.values(tokens)) {
    for (const token of Object.values(group)) lines.push(`  ${token.cssVariable}: ${token.$value};`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

function renderReportMarkdown(report) {
  const lines = [
    `# ${product} · исключения размерных токенов`,
    "",
    `Базовая сетка: **${report.baseUnit}**; разрешённые исключения: **1px, 2px, 6px**. Оставшиеся значения не изменялись и требуют отдельного дизайнерского решения.`,
    "",
    `Всего употреблений: **${report.summary.exceptionOccurrences}**; уникальных сочетаний причины и значения: **${report.summary.exceptionKinds}**.`,
    "",
  ];
  for (const entry of report.exceptions) {
    lines.push(`## \`${entry.value}\` · ${entry.reason}`, "", `Всего: ${entry.total}.`, "");
    for (const occurrence of entry.occurrences) lines.push(`- \`${occurrence.file}:${occurrence.line}\` — \`${occurrence.property}\``);
    if (entry.total > entry.occurrences.length) lines.push(`- …и ещё ${entry.total - entry.occurrences.length}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function ensureImport(source, entryFile) {
  const quote = product === "habr" ? "'" : '"';
  const statement = `@import url(${quote}dimension-tokens.css${quote});`;
  if (source.includes(statement)) return source;
  const imports = [...source.matchAll(/^@import[^;]+;$/gm)];
  if (!imports.length) throw new Error(`No @import statements found in ${entryFile}`);
  const preferred = imports.find((match) => /(?:tokens|reset|normalize)\.css/.test(match[0])) ?? imports[0];
  const end = preferred.index + preferred[0].length;
  return `${source.slice(0, end)}\n${statement}${source.slice(end)}`;
}

const existing = fs.existsSync(tokenJsonPath) ? JSON.parse(fs.readFileSync(tokenJsonPath, "utf8")) : null;
const tokens = structuredClone(existing?.tokens ?? {});
for (const value of allowedOffGrid) {
  addToken(tokens, "size", value, false);
  addToken(tokens, "space", value, false);
}
addToken(tokens, "border-width", 1, false);
const exceptions = new Map();
const files = walk(uiRoot).filter((file) => file.endsWith(".css") && !excludedFiles.has(slash(path.relative(uiRoot, file))));
let changedFiles = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const transformed = transformCss(file, source, tokens, exceptions);
  if (transformed !== source) {
    changedFiles += 1;
    if (write) fs.writeFileSync(file, transformed);
  }
}

const sortedTokens = sortTokenGroups(tokens);
const tokenCount = Object.values(sortedTokens).reduce((sum, group) => sum + Object.keys(group).length, 0);
const reportEntries = [...exceptions.values()].sort((a, b) => a.reason.localeCompare(b.reason) || a.value.localeCompare(b.value, undefined, { numeric: true }));
const report = {
  schemaVersion: 1,
  product,
  baseUnit: "4px",
  scope: "ui/**/*.css excluding token definitions and theme source files",
  policy: {
    migrated: "Absolute px dimensions divisible by 4, plus approved 1px, 2px and 6px exceptions, in supported declaration properties.",
    preserved: "Existing computed values, selectors, class names and DOM contracts.",
    exceptions: "Relative units, non-grid values and composite properties require explicit semantic review.",
  },
  summary: {
    tokenCount,
    exceptionKinds: reportEntries.length,
    exceptionOccurrences: reportEntries.reduce((sum, entry) => sum + entry.total, 0),
  },
  exceptions: reportEntries,
};
const tokenDocument = {
  schemaVersion: 1,
  product,
  namespace: product,
  baseUnit: "4px",
  allowedOffGrid: ["1px", "2px", "6px"],
  naming: `--${product}-<category>-<resolved-px-value>`,
  normalizationDecisions: normalizationDecisions[product],
  categories: ["space", "size", "radius", "font-size", "line-height", "border-width"],
  tokens: sortedTokens,
};

const tokenJson = `${JSON.stringify(tokenDocument, null, 2)}\n`;
const reportJson = `${JSON.stringify(report, null, 2)}\n`;
const reportMarkdown = renderReportMarkdown(report);
const tokenCss = renderCss(sortedTokens);
const entryFile = path.join(uiRoot, product === "landings" ? "hds.css" : `${product}.css`);
const entrySource = fs.readFileSync(entryFile, "utf8");
const entryWithImport = ensureImport(entrySource, entryFile);

if (write) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(tokenJsonPath, tokenJson);
  fs.writeFileSync(reportPath, reportJson);
  fs.writeFileSync(reportMarkdownPath, reportMarkdown);
  fs.writeFileSync(tokenCssPath, tokenCss);
  fs.writeFileSync(entryFile, entryWithImport);
}

if (check) {
  const failures = [];
  if (changedFiles) failures.push(`${changedFiles} CSS files still contain migratable raw dimensions`);
  for (const [file, expected] of [[tokenJsonPath, tokenJson], [reportPath, reportJson], [reportMarkdownPath, reportMarkdown], [tokenCssPath, tokenCss]]) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== expected) failures.push(`${relativeToProduct(file)} is stale`);
  }
  if (entrySource !== entryWithImport) failures.push(`${relativeToProduct(entryFile)} does not import dimension-tokens.css`);
  if (failures.length) {
    for (const failure of failures) console.error(`ERROR: ${failure}`);
    process.exitCode = 1;
  }
}

console.log(`${product}: ${tokenCount} tokens; ${changedFiles} CSS files ${write ? "updated" : "need update"}; ${report.summary.exceptionOccurrences} exceptions`);
