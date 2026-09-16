import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function declarations(source) {
  return Object.fromEntries(
    [...source.matchAll(/(--hds-[a-z0-9-]+)\s*:\s*([^;]+);/gi)]
      .map(([, name, value]) => [name, value.trim()])
  );
}

function firstRootBlock(source) {
  const match = source.match(/:root\s*{([\s\S]*?)}/);
  return match ? declarations(match[1]) : {};
}

function responsiveOverrides(source) {
  return [...source.matchAll(/@media\s*\(([^)]+)\)\s*{\s*:root\s*{([\s\S]*?)}\s*/g)]
    .map(([, query, body]) => ({ query: query.trim(), values: declarations(body) }));
}

export function buildTokens() {
  const foundationsPath = path.join(root, "ui", "foundations.css");
  const themePath = path.join(root, "ui", "themes", "company.css");
  const foundations = fs.readFileSync(foundationsPath, "utf8");
  const theme = fs.readFileSync(themePath, "utf8");

  return {
    version: "0.2.0",
    status: "generated",
    source: ["ui/foundations.css", "ui/themes/company.css"],
    base: firstRootBlock(foundations),
    themes: { company: firstRootBlock(theme) },
    responsive: responsiveOverrides(foundations)
  };
}

export function writeTokens() {
  const target = path.join(root, "machine", "tokens.json");
  fs.writeFileSync(target, `${JSON.stringify(buildTokens(), null, 2)}\n`, "utf8");
  return target;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeTokens();
  console.log("Built machine/tokens.json from CSS sources.");
}
