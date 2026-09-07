import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const careerDir = path.resolve(toolDir, "..");
const componentsDir = path.join(careerDir, "components");
const manifestPath = path.join(componentsDir, "manifest.json");
const showcasePath = path.join(careerDir, "showcase", "components.html");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const showcase = fs.readFileSync(showcasePath, "utf8");
const cssText = fs
  .readdirSync(path.join(careerDir, "ui"), { recursive: true })
  .filter((entry) => entry.endsWith(".css"))
  .map((entry) => fs.readFileSync(path.join(careerDir, "ui", entry), "utf8"))
  .join("\n");
const errors = [];
const warnings = [];

const requiredFields = [
  "id",
  "canonicalName",
  "storybookNames",
  "legacyAliases",
  "category",
  "kind",
  "specPath",
  "cssRoots",
  "showcaseAnchor",
  "figmaEvidence",
  "status",
  "requiredStates",
];

const seenIds = new Set();
const seenNames = new Set();
const aliases = new Map();
const manifestSpecPaths = new Set();
const allowedStates = new Set(manifest.allowedStates ?? []);
const allowedStatuses = new Set(manifest.allowedStatuses ?? []);
const forbiddenStateNames = new Set([
  "inactive",
  "disable",
  "focus",
  "focus_select",
  "select",
  "active",
]);

function issue(target, message) {
  return `${target}: ${message}`;
}

function stateSection(markdown) {
  const match = markdown.match(/^## Состояния\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m);
  return match?.[1] ?? "";
}

function hasStateSignalOutsideClaim(markdown) {
  return /(?:hover:|focus-visible:|disabled:|:hover\b|:focus-visible\b|:disabled\b|aria-current=|aria-disabled=|aria-selected=|aria-expanded=|aria-invalid=|\.is-loading\b|\.is-selected\b|--invalid\b)/i.test(
    markdown,
  );
}

for (const component of manifest.components ?? []) {
  const target = component.id || component.canonicalName || "<unknown>";

  for (const field of requiredFields) {
    if (!(field in component)) errors.push(issue(target, `missing field ${field}`));
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id ?? "")) {
    errors.push(issue(target, "id must be kebab-case"));
  }
  if (!/^[A-Z][A-Za-z0-9]*$/.test(component.canonicalName ?? "")) {
    errors.push(issue(target, "canonicalName must be PascalCase"));
  }
  if (seenIds.has(component.id)) errors.push(issue(target, "duplicate id"));
  if (seenNames.has(component.canonicalName)) {
    errors.push(issue(target, "duplicate canonicalName"));
  }
  seenIds.add(component.id);
  seenNames.add(component.canonicalName);

  for (const alias of component.legacyAliases ?? []) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(alias)) {
      errors.push(issue(target, `legacy alias must be PascalCase: ${alias}`));
    }
    if (aliases.has(alias)) {
      errors.push(issue(target, `legacy alias is already owned by ${aliases.get(alias)}: ${alias}`));
    }
    aliases.set(alias, target);
  }

  if (!allowedStatuses.has(component.status)) {
    errors.push(issue(target, `unknown status ${component.status}`));
  }
  if (!Array.isArray(component.requiredStates)) {
    errors.push(issue(target, "requiredStates must be an array"));
  } else {
    for (const state of component.requiredStates) {
      if (!allowedStates.has(state)) {
        errors.push(issue(target, `unknown required state ${state}`));
      }
      if (forbiddenStateNames.has(state)) {
        errors.push(issue(target, `forbidden non-canonical state ${state}`));
      }
    }
  }

  if (component.status === "planned" && component.specPath !== null) {
    warnings.push(issue(target, "planned component already has specPath; review status"));
  }
  if (component.status !== "planned" && !component.specPath) {
    errors.push(issue(target, "non-planned component must have specPath"));
  }

  if (component.specPath) {
    manifestSpecPaths.add(component.specPath.replaceAll("\\", "/"));
    const specFile = path.join(componentsDir, component.specPath);
    if (!fs.existsSync(specFile)) {
      errors.push(issue(target, `spec does not exist: ${component.specPath}`));
    } else {
      const markdown = fs.readFileSync(specFile, "utf8");
      const section = stateSection(markdown);
      if (
        /состояний не объявлено/i.test(section) &&
        hasStateSignalOutsideClaim(markdown)
      ) {
        warnings.push(
          issue(
            target,
            "state section says no states, but utility/ARIA/state signals exist elsewhere",
          ),
        );
      }

      for (const state of component.requiredStates ?? []) {
        const stateAliases = {
          default: [],
          "focus-visible": ["focus-visible"],
          readOnly: ["readonly", "readOnly"],
          dragActive: ["dragActive", "drag-active"],
          invalid: ["invalid", "error"],
          selected: ["selected", "aria-selected", "is-selected"],
          current: ["current", "aria-current", "is-selected"],
          checked: ["checked", "is-checked"],
          indeterminate: ["indeterminate", "is-minus", "mixed"],
          open: ["open", "expanded"],
          closed: ["closed", "collapsed"],
          expanded: ["expanded", "aria-expanded"],
          collapsed: ["collapsed", "aria-expanded"],
          disabled: ["disabled", "disable", "is-disabled"],
          loading: ["loading", "is-loading", "isLoading"],
        };
        const probes = stateAliases[state] ?? [state];
        if (probes.length && !probes.some((probe) => markdown.includes(probe))) {
          warnings.push(issue(target, `required state not evidenced in spec: ${state}`));
        }
      }
    }
  }

  if (component.showcaseAnchor) {
    const anchor = `id="${component.showcaseAnchor}"`;
    if (!showcase.includes(anchor)) {
      errors.push(issue(target, `showcase anchor not found: ${component.showcaseAnchor}`));
    }
  }

  for (const cssRoot of component.cssRoots ?? []) {
    if (!cssText.includes(`.${cssRoot}`)) {
      errors.push(issue(target, `CSS root not found in ui/: ${cssRoot}`));
    }
  }

  for (const evidence of component.figmaEvidence ?? []) {
    if (!evidence.fileKey || !evidence.sourceName) {
      errors.push(issue(target, "Figma evidence needs fileKey and sourceName"));
    }
  }
}

for (const component of manifest.components ?? []) {
  const owner = aliases.get(component.canonicalName);
  if (owner && owner !== component.id) {
    errors.push(
      issue(component.id, `canonicalName collides with legacy alias owned by ${owner}`),
    );
  }
}

const baseSpecFolders = [
  "actions",
  "data",
  "feedback",
  "forms",
  "labels",
  "navigation",
  "overlays",
];

for (const folder of baseSpecFolders) {
  const folderPath = path.join(componentsDir, folder);
  for (const filename of fs.readdirSync(folderPath)) {
    if (!filename.endsWith(".md")) continue;
    const specPath = `${folder}/${filename}`;
    if (!manifestSpecPaths.has(specPath)) {
      errors.push(issue(specPath, "base-scope specification is absent from manifest"));
    }
  }
}

const statusCounts = Object.fromEntries(
  [...allowedStatuses].map((status) => [
    status,
    manifest.components.filter((component) => component.status === status).length,
  ]),
);

console.log(`Validated ${manifest.components.length} component records.`);
console.log(`Status counts: ${JSON.stringify(statusCounts)}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nManifest structure is valid.");
}

if (process.argv.includes("--strict") && warnings.length) process.exitCode = 1;
