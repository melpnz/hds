import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Аудит-3: «то ли находит селектор» — переделанный метод.
//
// Метод второй итерации был одной пробой: сгруппировать найденное по сигнатуре
// (тег + отсортированные классы) и пометить запись, если крупнейшая группа
// меньше 60% улова. Review-3 показал у него три слепых пятна, и все три —
// не настройка порога, а свойство пробы:
//
//   1. проба меряет ОДНОРОДНОСТЬ улова, а не совпадение улова с элементом.
//      Если чужая сигнатура — крупнейшая, пометки не будет: article-card
//      попался только потому, что CourseCard дал 40 против 32 статей. Будь
//      50 против 30, вышло бы 62,5% и зелёно;
//   2. однородность 100% не значит ничего: project-icon был однороден,
//      когда находил половину своих узлов. Проба слепа к НЕНАЙДЕННОМУ;
//   3. селектор, находящий 100% чужого, пометки не получит никогда.
//
// Здесь пять независимых проб, и ни одна из них не выносит вердикта — каждая
// печатает список для разбора глазами. Порог остался только в пробе 1 и только
// как сортировка, а не как «чисто / не чисто».
//
//   1. СИГНАТУРЫ  — группировка по тегу и классам (прежняя проба);
//   2. СОДЕРЖИМОЕ — группировка по форме текста узла: одна и та же сигнатура
//      с двумя разными формами содержимого — это ровно случай chip
//      («Git» против «+9»), который проба 1 пропустила;
//   3. НЕДОБОР    — селектор сужен относительно собственной сигнатуры:
//      ослабленные варианты (снять предка, снять по одному классу) ищут узлы
//      ТОЙ ЖЕ сигнатуры, что уже в улове. Больше — значит половина элемента
//      осталась за селектором (случай project-icon). Сигнатуры собираются
//      по всем десяти страницам сразу, а не по текущей: первая редакция
//      пробы считала их постранично и на странице с нулевым уловом искать
//      было не по чему — ровно то слепое пятно, которое проба и закрывает
//      (на select это давало 29 вместо 31);
//   4. ПЕРЕСЕЧЕНИЯ — множества узлов разных записей; один узел, посчитанный
//      двумя записями, не ловится сверкой строк селекторов;
//   5. ШИРИНА     — те же числа по dom-375.html и dom-768.html: запись, чьё
//      число зависит от ширины снимка, обязана это объяснять.
//
// Чего метод не покрывает и покрыть не может — сказано в отчёте прямо:
// он весь внутри DOM и отвечает на вопрос «однороден и полон ли улов»,
// а не «тот ли это элемент, который назван записью». Последнее проверяется
// только сверкой с макетом или скриншотом, поимённо, на шаге элемента.
//
//   node .pipeline/R0-05/audit-3.mjs [--dom dom.html]

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, "../..");
const pagesDir = path.join(packageDir, "evidence/source/production/pages");
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "components/manifest.json"), "utf8"));

const domArg = process.argv.indexOf("--dom");
const domName = domArg > -1 ? process.argv[domArg + 1] : "dom.html";
const pages = fs.readdirSync(pagesDir).filter((id) => fs.existsSync(path.join(pagesDir, id, domName)));

const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ javaScriptEnabled: false });
const page = await context.newPage();

const records = manifest.components.filter((component) => component.sourceScope === "production");

// Ослабленные варианты селектора: снять предка (часть до последнего пробела
// или >), снять по одному классу, снять каждый :not(). Вариант, находящий узлы
// той же сигнатуры сверх улова, означает селектор уже собственного элемента.
function relaxations(selector) {
  const out = new Set();
  const withoutNot = selector.replace(/:not\([^)]*\)/g, "");
  if (withoutNot !== selector && withoutNot.trim()) out.add(withoutNot);
  const parts = selector.split(/\s*(?:>|\s)\s*/).filter(Boolean);
  if (parts.length > 1) out.add(parts.at(-1));
  const last = parts.at(-1) ?? selector;
  const classes = [...last.matchAll(/\.((?:[\w\-\\]|\\.)+)/g)].map((match) => match[0]);
  for (const className of classes) {
    const variant = last.replace(className, "");
    if (variant.trim() && variant !== last) out.add(variant.trim());
  }
  out.delete(selector);
  return [...out];
}

// Форма содержимого: не текст, а его вид. «+9» и «Git» — разные формы,
// «Git» и «Python» — одна.
function shapeOf(text) {
  const value = (text ?? "").trim();
  if (!value) return "<пусто>";
  if (/^\+\d+$/.test(value)) return "счётчик +N";
  if (/^\d+$/.test(value)) return "число";
  if (/^\d+[.,]\d+$/.test(value)) return "дробное число";
  if (/^\d{1,2}\s+\p{L}+\s+\d{4}$/u.test(value)) return "дата";
  if (value.length > 80) return "текст длинный";
  return "текст";
}

const report = {};
for (const record of records) {
  report[record.id] = { occurrences: record.occurrences, selectors: [], nodes: [], signatures: {}, shapes: {}, pages: {} };
}

// Проход 1: улов, сигнатуры, формы содержимого.
for (const id of pages) {
  await page.goto("file:///" + path.join(pagesDir, id, domName).replaceAll("\\", "/"));
  for (const record of records) {
    for (const evidence of record.productionEvidence) {
      const data = await page.evaluate((selector) => {
        const index = new Map([...document.querySelectorAll("*")].map((node, position) => [node, position]));
        try {
          return {
            found: [...document.querySelectorAll(selector)].map((node) => ({
              position: index.get(node),
              signature: node.tagName.toLowerCase() + "." + [...node.classList].sort().join("."),
              text: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
            })),
          };
        } catch (error) {
          return { error: `${error.name}: ${error.message}` };
        }
      }, evidence.selector);
      const entry = report[record.id];
      if (data.error) {
        entry.error = data.error;
        continue;
      }
      if (!entry.selectors.includes(evidence.selector)) entry.selectors.push(evidence.selector);
      for (const node of data.found) {
        entry.nodes.push(`${id}#${node.position}`);
        entry.signatures[node.signature] ??= { count: 0, samples: [] };
        entry.signatures[node.signature].count += 1;
        if (entry.signatures[node.signature].samples.length < 4) {
          entry.signatures[node.signature].samples.push(node.text);
        }
        const shape = shapeOf(node.text);
        entry.shapes[shape] ??= { count: 0, samples: [] };
        entry.shapes[shape].count += 1;
        if (entry.shapes[shape].samples.length < 4) entry.shapes[shape].samples.push(node.text);
      }
      if (data.found.length) entry.pages[id] = (entry.pages[id] ?? 0) + data.found.length;
    }
  }
}

// Проход 2: недобор. Сигнатуры улова уже известны по всем страницам сразу,
// поэтому ослабление ищет и там, где сам селектор не нашёл ничего.
for (const id of pages) {
  await page.goto("file:///" + path.join(pagesDir, id, domName).replaceAll("\\", "/"));
  for (const record of records) {
    const entry = report[record.id];
    if (entry.error) continue;
    const signatures = Object.keys(entry.signatures);
    if (!signatures.length) continue;
    for (const evidence of record.productionEvidence) {
      const counts = await page.evaluate(
        ({ variants, signatures: known }) => {
          const set = new Set(known);
          const out = {};
          for (const variant of variants) {
            try {
              out[variant] = [...document.querySelectorAll(variant)].filter((node) =>
                set.has(node.tagName.toLowerCase() + "." + [...node.classList].sort().join(".")),
              ).length;
            } catch {
              out[variant] = null;
            }
          }
          return out;
        },
        { variants: relaxations(evidence.selector), signatures },
      );
      for (const [variant, count] of Object.entries(counts)) {
        entry.relaxed ??= {};
        entry.relaxed[variant] = (entry.relaxed[variant] ?? 0) + (count ?? 0);
      }
    }
  }
}
await browser.close();

fs.writeFileSync(path.join(here, `audit-3-${domName.replace(/\W/g, "-")}.json`), JSON.stringify(report, null, 2) + "\n");

// --- Проба 1 и 2: сигнатуры и формы содержимого
console.log(`# Аудит по ${domName}: ${records.length} записей × ${pages.length} страниц\n`);
console.log("## Пробы 1–2: сигнатуры и формы содержимого\n");
console.log("| Запись | Узлов | Сигнатур | Крупнейшая | Форм содержимого | Разбивка по формам |");
console.log("|---|---|---|---|---|---|");
for (const record of records) {
  const entry = report[record.id];
  const total = entry.nodes.length;
  const signatures = Object.entries(entry.signatures).sort((a, b) => b[1].count - a[1].count);
  const shapes = Object.entries(entry.shapes).sort((a, b) => b[1].count - a[1].count);
  const largest = signatures[0] ? Math.round((signatures[0][1].count / total) * 1000) / 10 : 0;
  const breakdown = shapes.map(([shape, value]) => `${shape} ${value.count}`).join(" · ");
  console.log(
    `| ${record.id} | ${total} | ${signatures.length} | ${largest}% | ${shapes.length} | ${breakdown} |`,
  );
}

// --- Проба 3: недобор
console.log("\n## Проба 3: селектор уже собственной сигнатуры (недобор)\n");
let underreach = 0;
for (const record of records) {
  const entry = report[record.id];
  const total = entry.nodes.length;
  for (const [variant, count] of Object.entries(entry.relaxed ?? {})) {
    if (count > total) {
      underreach += 1;
      console.log(`- ${record.id}: ${total} → ${count} узлов той же сигнатуры при ослаблении до \`${variant}\``);
    }
  }
}
if (!underreach) console.log("- ни одной записи: ослабление селектора не находит узлов той же сигнатуры сверх улова");

// --- Проба 4: пересечения множеств узлов
console.log("\n## Проба 4: пересечения множеств узлов\n");
const sets = new Map(records.map((record) => [record.id, new Set(report[record.id].nodes)]));
let overlaps = 0;
for (let i = 0; i < records.length; i += 1) {
  for (let j = i + 1; j < records.length; j += 1) {
    const a = sets.get(records[i].id);
    const b = sets.get(records[j].id);
    const shared = [...a].filter((node) => b.has(node)).length;
    if (shared) {
      overlaps += 1;
      console.log(`- ${records[i].id} ∩ ${records[j].id} = ${shared} (из ${a.size} и ${b.size})`);
    }
  }
}
if (!overlaps) console.log("- пересечений нет");

// --- Проба 2 подробно: записи с более чем одной формой содержимого
console.log("\n## Записи с несколькими формами содержимого — образцы\n");
for (const record of records) {
  const entry = report[record.id];
  const shapes = Object.entries(entry.shapes).sort((a, b) => b[1].count - a[1].count);
  if (shapes.length < 2) continue;
  console.log(`### ${record.id} (${entry.nodes.length})`);
  for (const [shape, value] of shapes) {
    console.log(`- ${shape} — ${value.count}: ${value.samples.map((text) => `«${text}»`).join(", ")}`);
  }
  console.log("");
}
