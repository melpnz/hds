import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Проверка меры, предлагаемой приёмке (review-3, major 3): согласованная
// подделка чисел ловится парой «measure-selectors без флага, затем
// validate-components --strict». Прогон на копии; пакет не меняется.

const source = "d:/work/guides/courses";
const work = fs.mkdtempSync(path.join(os.tmpdir(), "red-3-pair-"));
const copy = path.join(work, "courses");
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(source, file))).digest("hex");
const guarded = ["components/manifest.json", "components/selector-census.json"];
const before = Object.fromEntries(guarded.map((f) => [f, digest(f)]));

fs.cpSync(source, copy, {
  recursive: true,
  filter: (from) => !from.includes("node_modules") && !from.includes("test-results"),
});
fs.cpSync(path.join(source, "../.claude"), path.join(work, ".claude"), { recursive: true });
fs.symlinkSync(path.join(source, "node_modules"), path.join(copy, "node_modules"), "junction");

// Подделка согласованная: и манифест, и перепись переписаны в одну сторону.
const manifestPath = path.join(copy, "components/manifest.json");
const censusPath = path.join(copy, "components/selector-census.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
// Только occurrences, страницы не тронуты: подделка, которую безбраузерным
// правилам зацепить нечем — url остаётся привязан к странице из seenOn.
const badge = manifest.components.find((c) => c.id === "badge");
badge.occurrences = 8700;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
const census = JSON.parse(fs.readFileSync(censusPath, "utf8"));
census.selectors.badge = census.selectors.badge.map((row) => ({ ...row, found: 8700 }));
fs.writeFileSync(censusPath, JSON.stringify(census, null, 2) + "\n");

function run(tool, args = []) {
  try {
    const out = execFileSync(process.execPath, [path.join(copy, "tools", tool), ...args], {
      cwd: copy,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? -1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

console.log("Согласованная подделка: manifest badge occurrences 87 → 8700, перепись переписана в ту же сторону, seenOn не тронут.\n");

const only = run("validate-components.mjs", ["--strict"]);
console.log(`1. validate-components --strict в одиночку: код ${only.code}` + (only.code ? " (поймал)" : " (НЕ поймал — согласованность подделки)"));

const measured = run("measure-selectors.mjs");
console.log(`2. measure-selectors без флага: код ${measured.code}`);
console.log(
  measured.out
    .split("\n")
    .filter((line) => line.includes("badge") || line.includes("расходятся"))
    .map((line) => "   " + line.trim())
    .join("\n"),
);

const after = run("validate-components.mjs", ["--strict"]);
console.log(`3. validate-components --strict после перемера: код ${after.code}`);
console.log(
  after.out
    .split("\n")
    .filter((line) => line.includes("badge"))
    .map((line) => "   " + line.trim())
    .join("\n"),
);

const still = Object.fromEntries(guarded.map((f) => [f, digest(f)]));
console.log(
  "\n" +
    (guarded.every((f) => before[f] === still[f])
      ? "Пакет не изменён: sha256 манифеста и переписи совпали."
      : "ПАКЕТ ИЗМЕНЁН"),
);
fs.rmSync(work, { recursive: true, force: true });
