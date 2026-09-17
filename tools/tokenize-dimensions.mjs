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
const referenceRootPx = 16;
const allowedOffGrid = new Set([1, 2, 6]);
const isApprovedRelativeTokenPixels = (pixels) => Number.isInteger(pixels / baseUnit) || allowedOffGrid.has(pixels);
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
  const prop = property.toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, "");
  if (prop.startsWith("--")) {
    if (/(?:border|outline|ring).*width/.test(prop)) return "border-width";
    if (/radius|round/.test(prop)) return "radius";
    if (/font.*size|text.*size/.test(prop)) return "font-size";
    if (/line.*height/.test(prop)) return "line-height";
    if (/effect|shadow|blur|spread/.test(prop)) return "effect";
    if (/letter.*spacing|offset|translate/.test(prop)) return "optical";
    if (/space|spacing|padding|margin|gap|gutter/.test(prop)) return "space";
    return "size";
  }
  if (/^(margin|padding)(-|$)|^(gap|row-gap|column-gap|text-indent)$|^scroll-(margin|padding)/.test(prop)) return "space";
  if (prop === "border-radius" || prop.endsWith("-radius")) return "radius";
  if (prop === "font-size") return "font-size";
  if (prop === "line-height") return "line-height";
  if (/^(box-shadow|text-shadow|filter|backdrop-filter)$/.test(prop)) return "effect";
  if (/^(outline-offset|letter-spacing|transform|background-position)$/.test(prop)) return "optical";
  if (/^(width|height|min-width|max-width|min-height|max-height|top|right|bottom|left|inset|flex-basis)$/.test(prop)) return "size";
  if (/^(border|border-(top|right|bottom|left)|outline)$/.test(prop) || /(?:border|outline).*width/.test(prop)) return "border-width";
  return null;
}

function approvedRelativeCategory(property, category) {
  const prop = property.toLowerCase();
  if (category === "font-size") return "font-size";
  if (category === "space" || category === "radius") return category;
  if (category === "optical") return "optical";
  if (/^(top|right|bottom|left)$/.test(prop) || prop === "--tw-translate-x") return "space";
  if (category === "size" && /^(width|height|min-width|max-width|min-height|max-height|flex-basis)$/.test(prop)) return "size";
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

function decimal(value) {
  return String(Number(value.toFixed(6)));
}

function scalableValue(referencePixels) {
  return `${decimal(referencePixels / referenceRootPx)}rem`;
}

function tokenReferencePixels(token) {
  const explicit = token?.$extensions?.referencePixels;
  if (Number.isFinite(explicit)) return explicit;
  const value = String(token?.$value ?? "");
  if (value.endsWith("px")) return parseFloat(value);
  if (value.endsWith("rem")) return parseFloat(value) * referenceRootPx;
  return null;
}

function normalizeTokenUnits(tokens) {
  for (const [category, group] of Object.entries(tokens)) {
    for (const token of Object.values(group)) {
      if (category === "line-height-ratio") continue;
      const referencePixels = tokenReferencePixels(token);
      if (!Number.isFinite(referencePixels)) continue;
      token.$type = "dimension";
      token.$value = category === "border-width" ? `${referencePixels}px` : scalableValue(referencePixels);
      token.$extensions = {
        ...(token.$extensions ?? {}),
        referencePixels,
        unitPolicy: category === "border-width" ? "fixed-px" : "scalable-rem",
      };
    }
  }
}

function addFullRadiusToken(tokens) {
  tokens.radius ??= {};
  tokens.radius.full = {
    $type: "dimension",
    $value: "999rem",
    cssVariable: `--${product}-radius-full`,
    $extensions: {
      unitPolicy: "semantic-full",
    },
  };
  return tokens.radius.full.cssVariable;
}

function addToken(tokens, category, numeric, negative) {
  const cssVar = tokenName(category, numeric, negative);
  tokens[category] ??= {};
  const key = `${negative ? "negative-" : ""}${String(numeric).replace(".", "_")}`;
  const referencePixels = (negative ? -1 : 1) * numeric;
  tokens[category][key] = {
    $type: "dimension",
    $value: category === "border-width" ? `${referencePixels}px` : scalableValue(referencePixels),
    cssVariable: cssVar,
    $extensions: {
      referencePixels,
      unitPolicy: category === "border-width" ? "fixed-px" : "scalable-rem",
    },
  };
  return cssVar;
}

function addLineHeightRatioToken(tokens, lineHeightPixels, fontSizePixels) {
  const line = decimal(lineHeightPixels).replace(".", "_");
  const font = decimal(fontSizePixels).replace(".", "_");
  const key = `${line}-on-${font}`;
  const cssVariable = `--${product}-line-height-${key}`;
  tokens["line-height-ratio"] ??= {};
  tokens["line-height-ratio"][key] = {
    $type: "number",
    $value: Number(decimal(lineHeightPixels / fontSizePixels)),
    cssVariable,
    $extensions: {
      lineHeightReferencePixels: lineHeightPixels,
      fontSizeReferencePixels: fontSizePixels,
      unitPolicy: "unitless",
    },
  };
  return cssVariable;
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

  const resolveDimension = (value, seen = new Set()) => {
    const input = value.trim();
    let match = input.match(/^var\((--[^)]+)\)$/);
    if (match) {
      for (const group of Object.values(tokens)) {
        const token = Object.values(group).find((candidate) => candidate.cssVariable === match[1]);
        if (token?.$extensions?.unitPolicy === "unitless") return token.$extensions.lineHeightReferencePixels;
        if (token) return tokenReferencePixels(token);
      }
      if (!seen.has(match[1])) {
        const aliases = customPropertyValues.get(match[1]);
        if (aliases?.size === 1) {
          seen.add(match[1]);
          return resolveDimension([...aliases][0], seen);
        }
      }
      return null;
    }
    match = input.match(/^(-?\d*\.?\d+)px$/);
    if (match) return Number(match[1]);
    match = input.match(/^(-?\d*\.?\d+)rem$/);
    if (match) return Number(match[1]) * referenceRootPx;
    return null;
  };

  const findToken = (cssVariable) => {
    for (const [category, group] of Object.entries(tokens)) {
      const token = Object.values(group).find((candidate) => candidate.cssVariable === cssVariable);
      if (token) return { category, token };
    }
    return null;
  };

  masked = masked.replace(/([^{}]+)\{([^{}]*)\}/g, (block, selector, body) => {
    let nextBody = body;
    const fontDeclarations = [...nextBody.matchAll(/(?:^|;)\s*font-size\s*:\s*([^;!}]+)/g)];
    if (!fontDeclarations.length) return nextBody === body ? block : `${selector}{${nextBody}}`;
    const fontSizePixels = resolveDimension(fontDeclarations.at(-1)[1]);
    if (!Number.isFinite(fontSizePixels) || fontSizePixels <= 0) return nextBody === body ? block : `${selector}{${nextBody}}`;
    nextBody = nextBody.replace(/(^|;)(\s*line-height\s*:\s*)([^;!}]+)/g, (declaration, boundary, prefix, rawValue) => {
      const lineHeightPixels = resolveDimension(rawValue);
      if (!Number.isFinite(lineHeightPixels) || lineHeightPixels <= 0) return declaration;
      const cssVariable = addLineHeightRatioToken(tokens, lineHeightPixels, fontSizePixels);
      return `${boundary}${prefix}var(${cssVariable})`;
    });
    return `${selector}{${nextBody}}`;
  });

  masked = masked.replace(new RegExp(`var\\(--${product}-radius-(?:[1-9]\\d{2,}|\\d{4,})\\)`, "g"), `var(--${product}-radius-full)`);

  const declaration = /(^|[;{}])([ \t\r\n]*)(--[-\w]+|[-\w]+)\s*:\s*([^;{}]+)(?=;|})/gm;
  masked = masked.replace(declaration, (whole, boundary, whitespace, property, value, offset) => {
    const category = categoryFor(property);
    const valueOffset = offset + whole.indexOf(value);
    let preparedValue = value;
    const exactVariable = preparedValue.trim().match(/^var\((--[^)]+)\)$/);
    if (category === "border-width" && exactVariable) {
      const existingToken = findToken(exactVariable[1]);
      const referencePixels = existingToken && tokenReferencePixels(existingToken.token);
      if (Number.isFinite(referencePixels) && existingToken.category !== "border-width") {
        preparedValue = preparedValue.replace(exactVariable[0], `var(${addToken(tokens, "border-width", Math.abs(referencePixels), referencePixels < 0)})`);
      }
    }
    if (property.startsWith("--") && category === "line-height" && exactVariable) {
      const existingToken = findToken(exactVariable[1]);
      const lineHeightPixels = existingToken?.token?.$extensions?.lineHeightReferencePixels;
      if (existingToken?.category === "line-height-ratio" && Number.isFinite(lineHeightPixels)) {
        preparedValue = preparedValue.replace(exactVariable[0], `var(${addToken(tokens, "line-height", lineHeightPixels, false)})`);
      }
    }
    if (property.toLowerCase() === "font") {
      preparedValue = preparedValue.replace(/(?<![-\w.])(\d*\.?\d+)px\s*\/\s*(\d*\.?\d+)px\b/g, (_, fontSize, lineHeight) => {
        const fontSizePixels = Number(fontSize);
        const lineHeightPixels = Number(lineHeight);
        const fontSizeVariable = addToken(tokens, "font-size", fontSizePixels, false);
        const lineHeightVariable = addLineHeightRatioToken(tokens, lineHeightPixels, fontSizePixels);
        if (!Number.isInteger(fontSizePixels / baseUnit) && !allowedOffGrid.has(fontSizePixels)) {
          addException(exceptions, "tokenized-off-grid-value", `${fontSize}px`, file, valueOffset, property, source);
        }
        return `var(${fontSizeVariable})/var(${lineHeightVariable})`;
      });
      preparedValue = preparedValue.replace(/(?<![-\w.])(\d*\.?\d+)px\b/g, (_, fontSize) => {
        return `var(${addToken(tokens, "font-size", Number(fontSize), false)})`;
      });
    }
    if (category === "line-height") {
      const absoluteVariable = preparedValue.trim().match(new RegExp(`^var\\(--${product}-line-height-(?!.*-on-)[^)]+\\)$`));
      if (absoluteVariable) {
        addException(exceptions, "line-height-needs-font-context", value.trim(), file, valueOffset, property, source);
      }
    }
    if (category === "font-size") {
      preparedValue = preparedValue.replace(/(?<![-\w.])(\d*\.?\d+)%(?![\w.])/g, (literal, rawNumber) => {
        const referencePixels = Number(rawNumber) * referenceRootPx / 100;
        if (!Number.isFinite(referencePixels) || referencePixels <= 0) return literal;
        return `var(${addToken(tokens, "font-size", referencePixels, false)})`;
      });
    }

    const relativePattern = /(?<![-\w.])(-?\d*\.?\d+)(rem|em)\b/g;
    preparedValue = preparedValue.replace(relativePattern, (literal, rawNumber, unit, localOffset) => {
      const number = Number(rawNumber);
      const referencePixels = number * referenceRootPx;
      const tokenCategory = approvedRelativeCategory(property, category);
      if (
        number !== 0 &&
        Number.isFinite(referencePixels) &&
        (unit === "em" || tokenCategory === "font-size" || isApprovedRelativeTokenPixels(Math.abs(referencePixels))) &&
        tokenCategory
      ) {
        return `var(${addToken(tokens, tokenCategory, Math.abs(referencePixels), referencePixels < 0)})`;
      }
      addException(exceptions, "relative-unit-needs-semantic-decision", literal, file, valueOffset + localOffset, property, source);
      return literal;
    });

    const pixelPattern = /(?<![-\w.])(-?\d*\.?\d+)px\b/g;
    const nextValue = preparedValue.replace(pixelPattern, (literal, rawNumber, localOffset) => {
      const number = Number(rawNumber);
      const absolute = Math.abs(number);
      if (absolute === 0) return literal;
      const normalized = normalizedValue(category, property, absolute);
      if (category === "radius" && normalized >= 100) {
        return `var(${addFullRadiusToken(tokens)})`;
      }
      if (!category) {
        addException(exceptions, "composite-or-unsupported-property", literal, file, valueOffset + localOffset, property, source);
        return literal;
      }
      const isOnGrid = Number.isInteger(normalized / baseUnit) || allowedOffGrid.has(normalized);
      if (!isOnGrid && category !== "effect" && category !== "optical") {
        addException(exceptions, "tokenized-off-grid-value", literal, file, valueOffset + localOffset, property, source);
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
      const av = Math.abs(tokenReferencePixels(a[1]) ?? parseFloat(a[1].$value));
      const bv = Math.abs(tokenReferencePixels(b[1]) ?? parseFloat(b[1].$value));
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
    `Базовая сетка: **${report.baseUnit}**; утверждённые дополнительные ступени соответствуют **1px, 2px, 6px** при root 16px. Некратные значения токенизированы без округления и остаются в отчёте для дизайнерского разбора.`,
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
normalizeTokenUnits(tokens);
addFullRadiusToken(tokens);
if (product === "landings") addLineHeightRatioToken(tokens, 20, 16);
if (product === "habr") addLineHeightRatioToken(tokens, 40, 16);
if (product === "courses") addToken(tokens, "effect", 3, false);
for (const value of allowedOffGrid) {
  addToken(tokens, "size", value, false);
  addToken(tokens, "space", value, false);
}
addToken(tokens, "border-width", 1, false);
const exceptions = new Map();
const files = walk(uiRoot).filter((file) => file.endsWith(".css") && !excludedFiles.has(slash(path.relative(uiRoot, file))));
const customPropertyValues = new Map();
for (const file of files) {
  const source = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of source.matchAll(/(--[-\w]+)\s*:\s*([^;{}!]+)/g)) {
    const values = customPropertyValues.get(match[1]) ?? new Set();
    values.add(match[2].trim());
    customPropertyValues.set(match[1], values);
  }
}
let changedFiles = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const transformed = transformCss(file, source, tokens, exceptions);
  if (transformed !== source) {
    changedFiles += 1;
    if (write) fs.writeFileSync(file, transformed);
  }
}

if (tokens["line-height-ratio"]) {
  const currentCss = files.map(file => fs.readFileSync(file, "utf8")).join("\n");
  for (const [key, token] of Object.entries(tokens["line-height-ratio"])) {
    if (!currentCss.includes(`var(${token.cssVariable})`)) delete tokens["line-height-ratio"][key];
  }
}

for (const [category, group] of Object.entries(tokens)) {
  if (["effect", "optical", "line-height-ratio"].includes(category)) continue;
  for (const token of Object.values(group)) {
    const referencePixels = tokenReferencePixels(token);
    if (!Number.isFinite(referencePixels) || referencePixels === 0) continue;
    const absolute = Math.abs(referencePixels);
    if (Number.isInteger(absolute / baseUnit) || allowedOffGrid.has(absolute)) continue;
    const needle = `var(${token.cssVariable})`;
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      let index = source.indexOf(needle);
      while (index !== -1) {
        addException(exceptions, "tokenized-off-grid-value", `${referencePixels}px`, file, index, `token:${category}`, source);
        index = source.indexOf(needle, index + needle.length);
      }
    }
  }
}

const sortedTokens = sortTokenGroups(tokens);
const tokenCount = Object.values(sortedTokens).reduce((sum, group) => sum + Object.keys(group).length, 0);
const reportEntries = [...exceptions.values()].sort((a, b) => a.reason.localeCompare(b.reason) || a.value.localeCompare(b.value, undefined, { numeric: true }));
const report = {
  schemaVersion: 2,
  product,
  baseUnit: "0.25rem",
  referenceRootFontSize: "16px",
  scope: "ui/**/*.css excluding token definitions and theme source files",
  policy: {
    migrated: "Scalable dimensions use rem with a 16px reference root; borders remain fixed px; line-height uses unitless ratios when font context is explicit.",
    preserved: "Existing computed values, selectors, class names and DOM contracts.",
    exceptions: "Relative units, tokenized off-grid references and unsupported composite properties require explicit semantic review.",
  },
  summary: {
    tokenCount,
    exceptionKinds: reportEntries.length,
    exceptionOccurrences: reportEntries.reduce((sum, entry) => sum + entry.total, 0),
  },
  exceptions: reportEntries,
};
const tokenDocument = {
  schemaVersion: 2,
  product,
  namespace: product,
  baseUnit: "0.25rem",
  referenceRootFontSize: "16px",
  allowedOffGrid: ["1px", "2px", "6px"],
  naming: `--${product}-<category>-<reference-px-value>`,
  unitPolicy: {
    scalable: ["space", "size", "radius", "font-size", "line-height", "effect", "optical"],
    unitless: ["line-height-ratio"],
    fixed: ["border-width"],
  },
  normalizationDecisions: normalizationDecisions[product],
  categories: ["space", "size", "radius", "font-size", "line-height", "line-height-ratio", "effect", "optical", "border-width"],
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
