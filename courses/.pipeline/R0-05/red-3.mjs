import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Шестой красный набор: собран против правил, заведённых на третьей итерации,
// и против находок review-3, которые эти правила должны закрывать.
//
// Прогон идёт на копии пакета в служебной папке. Сам пакет не меняется —
// это проверяется по sha256 манифеста и обоих инструментов до и после.

const source = "d:/work/guides/courses";
const work = fs.mkdtempSync(path.join(os.tmpdir(), "red-3-"));
const copy = path.join(work, "courses");

const guarded = [
  "components/manifest.json",
  "components/selector-census.json",
  "components/INDEX.md",
  "tools/validate-components.mjs",
  "tools/measure-selectors.mjs",
  "tools/validate-counts.mjs",
];
const digest = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(path.join(source, file))).digest("hex");
const { default: crypto } = await import("node:crypto");
const before = Object.fromEntries(guarded.map((file) => [file, digest(file)]));

fs.cpSync(source, copy, {
  recursive: true,
  filter: (from) => !from.includes("node_modules") && !from.includes("test-results"),
});
// METHOD.md лежит над пакетом: копия должна видеть его так же, как оригинал.
fs.cpSync(path.join(source, "../.claude"), path.join(work, ".claude"), { recursive: true });
// node_modules не копируется (гигабайты), но measure-selectors нужен настоящий
// браузер: junction на оригинал. Читается только — инструмент в node_modules
// не пишет.
fs.symlinkSync(path.join(source, "node_modules"), path.join(copy, "node_modules"), "junction");

const manifestPath = path.join(copy, "components/manifest.json");
const censusPath = path.join(copy, "components/selector-census.json");
const indexPath = path.join(copy, "components/INDEX.md");
const pristine = {
  manifest: fs.readFileSync(manifestPath, "utf8"),
  census: fs.readFileSync(censusPath, "utf8"),
  index: fs.readFileSync(indexPath, "utf8"),
};
function reset() {
  fs.writeFileSync(manifestPath, pristine.manifest);
  fs.writeFileSync(censusPath, pristine.census);
  fs.writeFileSync(indexPath, pristine.index);
  const pages = path.join(copy, "evidence/source/production/pages");
  for (const id of fs.readdirSync(pages)) {
    const renamed = path.join(pages, id, "dom-renamed.html");
    if (fs.existsSync(renamed)) fs.renameSync(renamed, path.join(pages, id, "dom.html"));
  }
  fs.rmSync(path.join(copy, "evidence/source/production/pages/zz-fake"), { recursive: true, force: true });
}

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

const editManifest = (apply) => {
  const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  apply(data, new Map(data.components.map((c) => [c.id, c])));
  fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + "\n");
};
const editCensus = (apply) => {
  const data = JSON.parse(fs.readFileSync(censusPath, "utf8"));
  apply(data);
  fs.writeFileSync(censusPath, JSON.stringify(data, null, 2) + "\n");
};

const defects = [
  // --- major 2: figma-only без свидетельства
  ["figma-only: figmaEvidence пуст", () => editManifest((_, by) => { by.get("breadcrumbs").figmaEvidence = []; })],
  ["figma-only: nodeId null при componentKey null", () => editManifest((_, by) => {
    by.get("breadcrumbs").figmaEvidence[0].nodeId = null;
  })],
  ["figmaEvidence: строка без nodeId и componentKey у production-записи", () => editManifest((_, by) => {
    by.get("chip").figmaEvidence[0].componentKey = null;
  })],
  ["figmaEvidence: не массив", () => editManifest((_, by) => { by.get("empty-state").figmaEvidence = null; })],

  // --- major 4: подпись переписи
  ["перепись: measuredBy вписан руками", () => editCensus((c) => { c.measuredBy = "вписано руками, браузер не запускался"; })],
  ["перепись: measuredBy — несуществующий инструмент", () => editCensus((c) => { c.measuredBy = "tools/nonexistent.mjs"; })],
  ["перепись: measuredBy удалён", () => editCensus((c) => { delete c.measuredBy; })],
  ["перепись: measuredAt 1999-01-01", () => editCensus((c) => { c.measuredAt = "1999-01-01"; })],
  ["перепись: measuredAt удалён", () => editCensus((c) => { delete c.measuredAt; })],
  ["перепись: measuredAt в будущем", () => editCensus((c) => { c.measuredAt = "2099-01-01"; })],
  ["перепись: environment javaScriptEnabled: true", () => editCensus((c) => {
    c.environment = "chromium (channel msedge), javaScriptEnabled: true";
  })],
  ["перепись: environment удалён", () => editCensus((c) => { delete c.environment; })],
  ["перепись: note удалён", () => editCensus((c) => { delete c.note; })],
  ["перепись: measuredBy, environment, note удалены все три", () => editCensus((c) => {
    delete c.measuredBy;
    delete c.environment;
    delete c.note;
  })],

  // --- minor 6: отпечатки с обоих краёв
  ["страница: dom.html переименован, папка осталась", () => {
    const from = path.join(copy, "evidence/source/production/pages/rating/dom.html");
    fs.renameSync(from, path.join(path.dirname(from), "dom-renamed.html"));
  }],
  ["страница: подброшена пустая папка zz-fake", () => {
    fs.mkdirSync(path.join(copy, "evidence/source/production/pages/zz-fake"), { recursive: true });
  }],

  // --- minor 7: url
  ["url: чужой домен", () => editManifest((_, by) => {
    by.get("avatar").productionEvidence[0].url = "https://example.com/anything";
  })],
  ["url: корень продукта без страницы", () => editManifest((_, by) => {
    by.get("avatar").productionEvidence[0].url = "https://career.habr.com";
  })],
  ["url: страница, которой нет в seenOn этой записи", () => editManifest((_, by) => {
    by.get("avatar").productionEvidence[0].url = "https://career.habr.com/education/promocodes";
  })],

  // --- minor 8: ключи и пустая оговорка
  ["productionEvidence: неизвестный ключ selektor при живом selector", () => editManifest((_, by) => {
    by.get("chip").productionEvidence[0].selektor = "div.whatever";
  })],
  ['productionEvidence: note равен ""', () => editManifest((_, by) => {
    by.get("badge").productionEvidence[0].note = "";
  })],

  // --- minor 9: шапка манифеста
  ["шапка: countingRule удалён", () => editManifest((m) => { delete m.countingRule; })],
  ["шапка: countingRule пуст", () => editManifest((m) => { m.countingRule = "   "; })],
  ["шапка: statusRule удалён", () => editManifest((m) => { delete m.statusRule; })],
  ["шапка: sourcePolicy удалён", () => editManifest((m) => { delete m.sourcePolicy; })],
  ["шапка: conventions пуст", () => editManifest((m) => { m.conventions = {}; })],
  ["шапка: schemaVersion 99", () => editManifest((m) => { m.schemaVersion = 99; })],
  ["шапка: allowedSourceScopes расширен четвёртым значением", () => editManifest((m) => {
    m.allowedSourceScopes.legacy = "четвёртый вид источника";
  })],
  ["шапка: из allowedSourceScopes убран figma-only", () => editManifest((m) => {
    delete m.allowedSourceScopes["figma-only"];
  })],

  // --- minor 5: словари против METHOD.md
  ["словарь: в валидаторе лишний статус против METHOD.md", () => {
    const file = path.join(copy, "tools/validate-components.mjs");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(
      file,
      text.replace(
        '  statuses: ["complete", "partial", "planned", "legacy-only", "figma-only"],',
        '  statuses: ["complete", "partial", "planned", "legacy-only", "figma-only", "storybook-only"],',
      ),
    );
  }, () => {
    const file = path.join(copy, "tools/validate-components.mjs");
    fs.copyFileSync(path.join(source, "tools/validate-components.mjs"), file);
  }],
  ["словарь: в валидаторе не хватает состояния METHOD.md", () => {
    const file = path.join(copy, "tools/validate-components.mjs");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replace('    "dragActive",\n', ""));
  }, () => {
    fs.copyFileSync(
      path.join(source, "tools/validate-components.mjs"),
      path.join(copy, "tools/validate-components.mjs"),
    );
  }],
];

// Отдельно: гейты, которым нужен не validate-components.
const otherDefects = [
  [
    "measure-selectors --check: подделка badge 87/7 → 8700/1",
    () => editManifest((_, by) => {
      by.get("badge").occurrences = 8700;
      by.get("badge").seenOn = ["rating"];
    }),
    () => run("measure-selectors.mjs", ["--check"]),
  ],
  [
    "validate-counts: 44 / 5 / 6 переписано в INDEX.md",
    () => {
      const text = fs.readFileSync(indexPath, "utf8");
      fs.writeFileSync(
        indexPath,
        text
          .replace("44 элемента сняты с продакшена, 5 есть только в Storybook, 6 —", "43 элемента сняты с продакшена, 7 есть только в Storybook, 5 —")
          .replace("| `production` | 44 |", "| `production` | 43 |")
          .replace("| `storybook-only` | 5 |", "| `storybook-only` | 7 |")
          .replace("| `figma-only` | 6 |", "| `figma-only` | 5 |"),
      );
    },
    () => run("validate-counts.mjs"),
  ],
  [
    "validate-counts: число записей в INDEX.md разошлось с манифестом",
    () => {
      const text = fs.readFileSync(indexPath, "utf8");
      fs.writeFileSync(indexPath, text.replace("Записей — 55.", "Записей — 54."));
    },
    () => run("validate-counts.mjs"),
  ],
];

let caught = 0;
let missed = 0;
console.log("| # | Дефект | Гейт | Код | Поймано |");
console.log("|---|---|---|---|---|");
let index = 0;
for (const [name, apply, restore] of defects) {
  index += 1;
  reset();
  apply();
  const result = run("validate-components.mjs", ["--strict"]);
  restore?.();
  const ok = result.code === 1;
  ok ? (caught += 1) : (missed += 1);
  console.log(`| ${index} | ${name} | validate-components --strict | ${result.code} | ${ok ? "да" : "**НЕТ**"} |`);
  if (!ok) console.log(`\n<!-- пропущено: ${result.out.split("\n").slice(-6).join(" / ")} -->\n`);
}
for (const [name, apply, gate] of otherDefects) {
  index += 1;
  reset();
  apply();
  const result = gate();
  const ok = result.code === 1;
  ok ? (caught += 1) : (missed += 1);
  console.log(`| ${index} | ${name} | ${name.split(":")[0]} | ${result.code} | ${ok ? "да" : "**НЕТ**"} |`);
  if (!ok) console.log(`\n<!-- пропущено: ${result.out.split("\n").slice(-8).join(" / ")} -->\n`);
}

reset();
console.log(`\nПоймано ${caught} из ${caught + missed}.`);

const after = Object.fromEntries(guarded.map((file) => [file, digest(file)]));
const changed = guarded.filter((file) => before[file] !== after[file]);
console.log(changed.length ? `ПАКЕТ ИЗМЕНЁН: ${changed.join(", ")}` : "Пакет не изменён: sha256 всех шести файлов совпали.");
fs.rmSync(work, { recursive: true, force: true });
