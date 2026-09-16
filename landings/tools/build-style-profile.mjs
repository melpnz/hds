import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build-tokens.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function buildStyleProfile() {
  const tokens = buildTokens();
  const base = tokens.base;
  const colors = tokens.themes.company;
  return {
    schemaVersion: 1,
    product: { id: "landings", title: "Лендинги HDS", guideVersion: "0.1", packageVersion: "0.2.0", status: "in-development" },
    scope: { confidence: "snapshot", boundary: "Российские Webflow-страницы company.habr.com; новый пакет активно разрабатывается." },
    typography: {
      families: { text: base["--hds-font-text"], heading: base["--hds-font-heading"] },
      weights: { medium: base["--hds-weight-medium"], semibold: base["--hds-weight-semibold"] },
      roles: Object.fromEntries(Object.entries(base).filter(([name]) => name.startsWith("--hds-text-")))
    },
    colors: { theme: "company", roles: colors },
    shape: { radii: { control: base["--hds-radius-control"], field: base["--hds-radius-field"], card: base["--hds-radius-card"] } },
    layout: {
      container: base["--hds-container"], gutter: base["--hds-page-gutter"], sectionSpace: base["--hds-section-space"],
      spacing: Object.fromEntries(Object.entries(base).filter(([name]) => name.startsWith("--hds-space-"))),
      responsive: tokens.responsive
    },
    motion: { duration: base["--hds-duration"], easing: base["--hds-ease"] },
    signaturePatterns: [
      { id: "dark-company-theme", rule: "Тёмная подложка с ярко-голубыми действиями и ссылками.", evidence: "ui/themes/company.css" },
      { id: "large-display-type", rule: "Крупная Inter-типографика уменьшается на 991px и 767px.", evidence: "ui/foundations.css" },
      { id: "rounded-controls", rule: "Действия капсульные, поля и карточки имеют отдельные радиусы.", evidence: "machine/tokens.json" }
    ],
    sources: ["machine/tokens.json", "ui/foundations.css", "ui/themes/company.css"],
    unknowns: ["Пакет в разработке: точность отдельных блоков ограничена source-driven реконструкцией."]
  };
}

export function writeStyleProfile() {
  const target = path.join(root, "machine", "style-profile.json");
  fs.writeFileSync(target, `${JSON.stringify(buildStyleProfile(), null, 2)}\n`, "utf8");
  return target;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeStyleProfile();
