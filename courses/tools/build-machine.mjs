// Сборка машинной проекции пакета: machine/*.json (шаг R8-01).
//
// Проекция собирается из источников, а не пишется руками. Источники:
//   ui/tokens.css                      — переменные :root (tokens.json)
//   components/manifest.json           — реестр записей (components.json)
//   components/selector-census.json    — селектор и число вхождений записи
//   showcase/components.html           — разметка образца записи (markup)
//   showcase/pages/<id>.html           — состав страницы (patterns.json)
//   docs/guide/composition.md          — правила уровня страницы (rules.json)
//   docs/guide/decisions.md            — Decision Guides (rules.json)
//   pages/*.md                         — страницы и семейства (patterns.json)
//   .pipeline/principles/axes.json     — замеры каркаса и адаптива
//   machine/*.overrides.json           — то, чего в источниках нет:
//                                        предикаты правил, usage, тон текста
//
// Правка machine/*.json руками бессмысленна: следующая сборка её сотрёт.
// Проверяет проекцию tools/validate-machine.mjs (R8-03).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PAGES } from "../.pipeline/pages/pages-config.mjs";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(pkg, p), "utf8");
const readJson = (p) => JSON.parse(read(p));
const readIf = (p) => (fs.existsSync(path.join(pkg, p)) ? readJson(p) : {});
const outDir = path.join(pkg, "machine");
const TODAY = new Date().toISOString().slice(0, 10);
const write = (name, data) => {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + "\n", "utf8");
  return `${name}: ${Array.isArray(data) ? data.length : Object.keys(data).length}`;
};

fs.mkdirSync(outDir, { recursive: true });
const manifest = readJson("components/manifest.json");
const recs = manifest.components;
const census = readJson("components/selector-census.json").selectors;
const axes = readJson(".pipeline/principles/axes.json");
const over = {
  components: readIf("machine/components.overrides.json"),
  rules: readIf("machine/rules.overrides.json"),
  patterns: readIf("machine/patterns.overrides.json"),
  content: readIf("machine/content.overrides.json"),
};
const log = [];

// --- tokens.json ---------------------------------------------------------
// Формат DTCG: $type, $value, $description. Ссылка var(--x) переносится
// ссылкой {группа.имя}. Пометки [NO MARKUP] и [UNREFERENCED] из ui/tokens.css
// — факт о продукте (живая переменная или мёртвая), он сохраняется.
{
  const css = read("ui/tokens.css");
  // Комментарии ui/tokens.css содержат и объявления из разбора (например
  // «--header-height: 112px» в цитате сборки Storybook). Разбирать их как
  // значения нельзя, поэтому комментарии снимаются, а из них остаются два
  // следа: заголовок группы и пометка живости переменной.
  const body = css.slice(css.indexOf(":root {")).replace(/\/\*([\s\S]*?)\*\//g, (_, inner) => {
    const g = inner.match(/---\s*(.+?)\s*-{2,}/);
    if (g) return `\n/*GROUP:${g[1].trim()}*/\n`;
    const mark = inner.match(/\[(NO MARKUP|UNREFERENCED|RUNTIME)\]/);
    return mark ? `/*MARK:${mark[1]}*/` : "";
  });
  const groupOf = (name) =>
    /gradient/.test(name) ? "gradient"
      : /^--color-/.test(name) ? "color"
        : /^--font-size-/.test(name) ? "fontSize"
          : /^--line-height-/.test(name) ? "lineHeight"
            : /font-weight/.test(name) ? "fontWeight"
              : /font-family/.test(name) ? "font"
                : /shadow/.test(name) ? "shadow"
                  : "size";
  const typeOf = (g) => ({ color: "color", gradient: "gradient", fontSize: "dimension", lineHeight: "dimension", size: "dimension", shadow: "shadow", font: "fontFamily", fontWeight: "fontWeight" }[g] || "other");
  const tokens = {};
  let group = null;
  for (const line of body.split("\n")) {
    const g = line.match(/^\/\*GROUP:(.+?)\*\/$/);
    if (g) { group = g[1].trim(); continue; }
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);\s*(?:\/\*MARK:(.+?)\*\/)?/);
    if (!m) continue;
    const [, name, rawValue, mark] = m;
    const gKey = groupOf(name);
    const short = name.replace(/^--(color-|font-size-|line-height-)?/, "");
    const value = rawValue.trim().replace(/var\((--[\w-]+)\)/g, (_, v) => `{${groupOf(v)}.${v.replace(/^--(color-|font-size-|line-height-)?/, "")}}`);
    // DTCG: вес — число, тень — объект, градиент композитным типом не
    // выражается без разбора остановок, поэтому остаётся строкой CSS с
    // прямой пометкой об этом (ревью R8, M14).
    let $type = typeOf(gKey);
    let $value = value;
    if (gKey === "fontWeight" && /^\d+$/.test(value)) $value = Number(value);
    if (gKey === "shadow") {
      const m2 = /^(-?[\d.]+px)\s+(-?[\d.]+px)\s+(-?[\d.]+px)\s+(-?[\d.]+px)\s+(.+)$/.exec(value);
      if (m2) $value = { offsetX: m2[1], offsetY: m2[2], blur: m2[3], spread: m2[4], color: m2[5] };
    }
    if (gKey === "gradient") $type = "other";
    (tokens[gKey] = tokens[gKey] || {})[short] = {
      $type,
      $value,
      $extensions: {
        guide: {
          cssVar: name,
          group: group || undefined,
          source: "инлайновый <style> ответа career.habr.com, снято 8 сентября 2026: два блока :root на страницу, 48 переменных в основном и 3 в позднем",
          liveness: /NO MARKUP/.test(mark || "") ? "утилита есть, разметки нет" : /UNREFERENCED/.test(mark || "") ? "объявлена, ссылок var() нет" : /RUNTIME/.test(mark || "") ? "значение переписывает скрипт" : "живая",
          humanDoc: "docs/guide/tokens.md",
          references: [...String(value).matchAll(/\{([\w-]+)\.([\w-]+)\}/g)].map((x) => `${x[1]}.${x[2]}`),
          rawCss: gKey === "gradient" || gKey === "shadow" ? value : undefined,
        },
      },
    };
  }
  log.push(write("tokens.json", tokens));
}

// --- components.json -----------------------------------------------------
// Разметка образца берётся с витрины компонентов: тот же HTML, что человек
// видит в showcase/components.html, без пересборки руками.
const composition = read("docs/guide/composition.md");
const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
{
  await page.setContent(read("showcase/components.html").replace(/\.\.\/ui\//g, "ui/"));
  // Корень образца — узел самой записи, а не стенд витрины: у шести записей
  // первый узел стенда был обёрткой с инлайновыми стилями и несколькими
  // вариантами внутри (ревью R8, minor 1). Сначала ищем по селектору
  // переписи, и только если его нет — берём первый узел.
  const anchorSel = Object.fromEntries(recs.filter((r) => r.showcaseAnchor).map((r) => {
    const v = census[r.id];
    const full = v ? (Array.isArray(v) ? v[0] : v).selector : null;
    return [r.showcaseAnchor, full ? full.split(",").map((s) => s.trim().split(/\s*>\s*|\s+/).pop()).filter(Boolean).join(", ") : null];
  }));
  const markup = await page.evaluate((anchorSel) => {
    const out = {};
    for (const s of document.querySelectorAll("section.doc-section[id^='c-']")) {
      const sel = anchorSel[s.id];
      let n = null;
      // Образец ищется в первой сцене секции — у блока «default». Над ней
      // теперь стоит «Как работает» со ссылкой на спецификацию, и поиск по
      // всей секции находил её вместо образца Link.
      const stage = s.querySelector(".doc-stage") || s;
      if (sel) { try { n = stage.querySelector(sel); } catch { n = null; } }
      if (!n) n = stage.querySelector(".doc-variant__row > *, .doc-stage > *:not(.doc-variant)") || s.querySelector(".doc-variant__row > *, .doc-stage > *:not(.doc-variant)");
      if (n) out[s.id] = n.outerHTML.replace(/\s+/g, " ").trim();
    }
    return out;
  }, anchorSel);
  const decisionsMd = read("docs/guide/decisions.md");
  const ruleIdsFor = (name) => {
    const ids = new Set();
    for (const line of composition.split("\n")) {
      const id = line.match(/^\|\s*\*\*([A-Z]+-[0-9a-z]+)\*\*/);
      if (id && new RegExp(`\`${name}\``).test(line)) ids.add(id[1]);
    }
    // решения тоже называют записи: DG-4 про карточку, DG-5 про кнопку
    let dg = null;
    for (const line of decisionsMd.split("\n")) {
      const h = line.match(/^### (DG-\d+)/);
      if (h) dg = h[1];
      if (dg && new RegExp(`\`${name}\``).test(line)) ids.add(dg);
    }
    return [...ids];
  };
  // Разделы спецификации: то, что человек уже написал, — назначение записи,
  // когда она не подходит, клавиатура и ограничения (ревью R8, M4).
  const parseSpec = (md) => {
    // Разделы режутся по заголовкам построчно: регулярное выражение с
    // флагом m обрывало раздел на первом конце строки.
    const sections = {};
    let cur = null;
    for (const line of md.split("\n")) {
      const h = /^## (.+?)\s*$/.exec(line);
      if (h) { cur = h[1]; sections[cur] = []; continue; }
      if (cur) sections[cur].push(line);
    }
    const section = (title) => (sections[title] ? sections[title].join("\n").trim() || null : null);
    const oneLine = (t) => (t ? t.replace(/\s+/g, " ").trim() : null);
    // Пункт списка бывает многострочным: продолжение идёт с отступом.
    // Первая редакция выбрасывала продолжения, и одно ограничение
    // перевернулось по смыслу — «закрыты bulk-проходом» обрывалось на
    // «…красят» (ревью R8, M7).
    const bullets = (t) => {
      if (!t) return [];
      const out = [];
      for (const line of t.split("\n")) {
        if (/^[-*] /.test(line)) out.push(line.replace(/^[-*] /, ""));
        else if (out.length && /^\s+\S/.test(line)) out[out.length - 1] += " " + line.trim();
        else if (out.length && line.trim() === "") continue;
      }
      return out.map(oneLine);
    };
    const when = section("Когда использовать");
    const whenNot = section("Когда не использовать");
    const keyboard = section("Управление клавиатурой");
    const a11ySection = section("Доступность");
    const limits = section("Ограничения");
    const rule = when && /\*\*Правило\.\*\*\s*([\s\S]*?)(?=\n\n|$)/.exec(when);
    const a11y = {};
    if (keyboard) a11y.keyboard = oneLine(keyboard);
    if (a11ySection) a11y.notes = oneLine(a11ySection);
    // Провенансный абзац «Проза выведена из переписи корпуса…» стоит у всех
    // записей и говорит о происхождении текста, а не об ограничении записи.
    const limitList = bullets(limits).length ? bullets(limits) : limits ? [oneLine(limits)] : [];
    return {
      usage: {
        when: oneLine(rule ? rule[1] : when ? when.split("\n\n")[0] : null),
        whenNot: bullets(whenNot),
        names: [...new Set([...(whenNot || "").matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]))],
      },
      a11y: Object.keys(a11y).length ? a11y : null,
      limits: limitList.filter((l) => !/^\*\*Проза выведена из переписи корпуса/.test(l)),
      provenance: limitList.find((l) => /^\*\*Проза выведена из переписи корпуса/.test(l)) || null,
    };
  };
  // Имя записи в тексте → id реестра: поле insteadUse должно быть ссылкой,
  // а не строкой из бэктиков (ревью R8, M8).
  const idByName = Object.fromEntries(recs.map((r) => [r.canonicalName, r.id]));
  const components = recs.map((r) => {
    const sel = census[r.id];
    const spec = fs.existsSync(path.join(pkg, "components", r.specPath)) ? parseSpec(read(`components/${r.specPath}`)) : { usage: {}, a11y: null, limits: [] };
    const c = {
      id: r.id,
      name: r.canonicalName,
      category: r.category,
      kind: r.kind,
      spec: `components/${r.specPath}`,
      status: r.status,
      sourceScope: r.sourceScope,
      step: r.step,
      cssRoots: [...new Set(r.cssRoots || [])],
      dependsOn: r.dependsOn || [],
      usage: {
        when: spec.usage.when,
        whenNot: spec.usage.whenNot,
        // Записи, названные в разделе «Когда не использовать». Это не всегда
        // замена: там же упоминают соседей по конструкции («это `Carousel`
        // со стрелками `IconButton`»), поэтому поле называется «related»
        // (ревью R8, minor 3).
        related: (spec.usage.names || []).map((n) => idByName[n]).filter((x) => x && x !== r.id),
      },
      a11y: spec.a11y,
      limits: spec.limits,
      provenance: spec.provenance,
      anchor: r.showcaseAnchor ? `showcase/components.html#${r.showcaseAnchor}` : null,
      states: {
        required: r.requiredStates || [],
        captured: r.capturedStates || [],
        normative: r.normativeStates || [],
        uncaptured: r.uncapturedStates || [],
      },
      rules: ruleIdsFor(r.canonicalName),
      evidence: {
        production: sel ? { selector: (Array.isArray(sel) ? sel[0] : sel).selector, found: (Array.isArray(sel) ? sel[0] : sel).found, pages: (Array.isArray(sel) ? sel[0] : sel).pages } : null,
        figma: (r.figmaEvidence || []).map((f) => ({ fileKey: f.fileKey, fileName: f.fileName, layerName: f.layerName, nodeId: f.nodeId, componentKey: f.componentKey })),
        storybook: (r.storybookEvidence || []).length ? r.storybookEvidence : null,
      },
      sourceConflicts: r.sourceConflicts || [],
      markup: r.showcaseAnchor && markup[r.showcaseAnchor]
        ? { html: markup[r.showcaseAnchor], requires: ["ui/courses.css"] }
        : null,
      markupNote: r.showcaseAnchor && markup[r.showcaseAnchor] ? undefined : "разметки нет: запись — обёртка вокруг библиотеки (см. spec)",
    };
    return { ...c, ...(over.components[r.id] || {}) };
  });
  log.push(write("components.json", components));
}

// --- rules.json ----------------------------------------------------------
// Правила — строки таблиц composition.md; Decision Guides — разделы
// decisions.md. Предикат берётся из rules.overrides.json: снять его
// с текста нельзя, а правило без предиката допустимо только как manual.
{
  const rules = [];
  let area = null;
  for (const line of composition.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { area = h[1].trim(); continue; }
    const m = line.match(/^\|\s*\*\*([A-Z]+-[0-9a-z]+)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (!m) continue;
    const [, id, statement, coverage, exception] = m;
    rules.push({
      id,
      kind: "rule",
      area,
      statement,
      coverage,
      exception,
      predicate: (over.rules[id] && over.rules[id].predicate) || { type: "manual", check: statement },
      appliesTo: (over.rules[id] && over.rules[id].appliesTo) || ["all"],
      humanDoc: "docs/guide/composition.md",
      showcase: `showcase/pages.html#rule-${id}`,
    });
  }
  const dg = read("docs/guide/decisions.md");
  const blocks = dg.split(/\n### /).slice(1);
  for (const b of blocks) {
    const id = b.match(/^(DG-\d+)/)[1];
    const title = b.match(/^DG-\d+\s+·\s+(.+)/)[1].trim();
    const field = (name) => {
      const m = b.match(new RegExp(`\\*\\*${name}\\.?\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`));
      return m ? m[1].replace(/\s+/g, " ").trim() : null;
    };
    const ev = field("Evidence");
    rules.push({
      id,
      kind: "decision-guide",
      title,
      observed: field("OBSERVED"),
      when: field("Когда"),
      prefer: field("Предпочитай"),
      avoid: field("Избегай"),
      evidence: ev,
      confidence: ev && /Confidence:\s*(HIGH|MEDIUM|LOW)/.exec(ev) ? /Confidence:\s*(HIGH|MEDIUM|LOW)/.exec(ev)[1] : null,
      rules: ev ? [...new Set((ev.match(/`([A-Z]+-[0-9a-z]+)`/g) || []).map((x) => x.replace(/`/g, "")))] : [],
      gap: field("GAP"),
      humanDoc: "docs/guide/decisions.md",
    });
  }
  log.push(write("rules.json", rules));
}

// --- patterns.json -------------------------------------------------------
// Каркас и адаптив — из замеров axes.json; состав области — из собранной
// страницы витрины: узлы главной колонки сопоставляются селекторам переписи.
{
  const SEL = Object.fromEntries(Object.entries(census).map(([id, v]) => [id, (Array.isArray(v) ? v[0] : v).selector]));
  const MODULES = recs.filter((r) => r.kind === "module").map((r) => r.id);
  const pagesMd = fs.readdirSync(path.join(pkg, "pages")).filter((f) => f.endsWith(".md"));
  const meta = {};
  for (const f of pagesMd) {
    const s = read(`pages/${f}`);
    meta[f.replace(/\.md$/, "")] = {
      family: (s.match(/\*\*Семейство\*\*\s*\|\s*(.+?)\s*\|/) || [])[1] || null,
      url: (s.match(/\*\*Адрес\*\*\s*\|\s*\[`(.+?)`\]/) || [])[1] || null,
    };
  }
  const patterns = [];
  for (const [id, m] of Object.entries(meta)) {
    await page.setContent(read(`showcase/pages/${id}.html`).replace(/\.\.\/\.\.\/ui\//g, "ui/"));
    const sequence = await page.evaluate(({ SEL, MODULES }) => {
      // Контейнеров 1124 на странице несколько — шапка, hero, колонка,
      // подвал. Главная колонка — самый высокий блок вне шапки и подвала.
      const cands = [...document.querySelectorAll("div")].filter((d) => String(d.className).includes("max-w-[1124px]") && !d.closest("header") && !d.closest("footer"));
      const main = cands.flatMap((c) => [...c.children]).filter((e) => e.tagName === "DIV").sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
      if (!main) return [];
      // В блоке считаются только записи-модули: примитивы и компоненты
      // лежат внутри них и в состав области ничего не добавляют.
      const idOf = (node) => {
        const found = [];
        for (const [rid, sel] of Object.entries(SEL)) {
          try {
            const n = (node.matches(sel) ? 1 : 0) + node.querySelectorAll(sel).length;
            if (n) found.push({ id: rid, count: n });
          } catch { /* селектор не поддержан браузером */ }
        }
        return found.sort((a, b) => b.count - a.count);
      };
      return [...main.children].map((k) => {
        const found = idOf(k).filter((x) => SEL[x.id]);
        const modules = found.filter((x) => MODULES.includes(x.id)).slice(0, 6);
        // Профиль собран не из модулей, а из компонентов (`prose`), и
        // заголовки разделов у него — div.text-h2, а не h2 (ревью R8, M3).
        const heading = (k.querySelector("h2, h3, div.text-h2") || {}).textContent?.trim().slice(0, 40) || null;
        const stub = k.querySelector("[class*=\"doc-page-stub\"]") || (String(k.className).includes("doc-page-stub") ? k : null);
        return {
          tag: k.tagName.toLowerCase(),
          heading,
          modules,
          components: modules.length ? [] : found.filter((x) => !MODULES.includes(x.id)).slice(0, 4),
          // на витрине карусель и рекламный слот стоят заглушкой: вставлять
          // из такого блока нечего, и об этом сказано прямо
          stub: stub ? [...stub.childNodes].map((x) => (x.textContent || "").trim()).filter(Boolean).join(" · ").replace(/\s+/g, " ").slice(0, 80) : undefined,
        };
      });
    }, { SEL, MODULES });
    const a = axes[id];
    const frame = a
      ? {
        container: `${a[1440].shell.containerMax} + ${a[1440].shell.containerPad}`,
        column: 1076,
        columnGap: a[1440].main ? a[1440].main.rowGap : null,
        columnPadTop: a[1440].main ? a[1440].main.padTop : null,
        header: a[1440].shell.headerH,
        hero: a[1440].shell.hero,
        footer: a[1440].shell.footerH,
      }
      : null;
    const responsive = a
      ? [1024, 768, 375].map((w) => ({
        width: w,
        grids: a[w].grids.map((g) => `${g.cols} × ${g.colW}`),
        footerColumns: a[w].footerCols,
        header: a[w].shell.headerH,
        sameOrder: a[w].order === a[1440].order,
      }))
      : [];
    patterns.push({
      id,
      family: m.family,
      url: m.url,
      spec: `pages/${id}.md`,
      showcase: `showcase/pages.html#p-${id}`,
      standalone: `showcase/pages/${id}.html`,
      frame,
      sequence,
      sequenceSource: {
        page: `showcase/pages/${id}.html`,
        note: "состав и счётчики сняты с собранной страницы витрины; длинные списки на ней сокращены, полные числа — в pages/*.md",
        trimmed: (PAGES[id] && PAGES[id].trim ? PAGES[id].trim : []).map((t) => t.what),
        stubs: (PAGES[id] && PAGES[id].stubs ? PAGES[id].stubs : []).map((s) => s.text),
      },
      responsive,
      // правила паттерна — обратная сторона appliesTo правил: список не
      // пишется руками и не может разойтись с rules.json (ревью R8, M6)
      rules: [],
      ...(over.patterns[id] || {}),
    });
  }
  {
    const ruleList = JSON.parse(fs.readFileSync(path.join(outDir, "rules.json"), "utf8")).filter((r) => r.kind === "rule");
    for (const pt of patterns) pt.rules = ruleList.filter((r) => (r.appliesTo || []).includes("all") || (r.appliesTo || []).includes(pt.id)).map((r) => r.id);
  }
  log.push(write("patterns.json", patterns));
}
await browser.close();

// --- content.json --------------------------------------------------------
// Форматы чисел и подписи — из правил CT-* и замеров подписей кнопок.
{
  const ct = [];
  for (const line of composition.split("\n")) {
    const m = line.match(/^\|\s*\*\*(CT-[0-9a-z]+)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (m) ct.push({ id: m[1], statement: m[2], coverage: m[3], exception: m[4] });
  }
  const labels = {};
  for (const p of Object.keys(axes)) for (const [text, n] of Object.entries(axes[p][1440].buttonCounts || {})) labels[text] = (labels[text] || 0) + n;
  const content = {
    rules: ct,
    buttonLabels: Object.entries(labels).sort((a, b) => b[1] - a[1]).map(([text, count]) => ({ text, count })),
    numberFormats: over.content.numberFormats || {
      decimal: { separator: ".", example: "4.55", rule: "CT-1" },
      price: { thousands: " ", currencyAfter: true, example: "от 4 223 ₽/мес", rule: "CT-2a" },
      counter: { thousands: "", example: "1419 отзывов", rule: "CT-2b" },
    },
    ...over.content,
  };
  log.push(write("content.json", content));
}

// --- index.json ----------------------------------------------------------
{
  const complete = recs.filter((r) => r.status === "complete").length;
  // Версии у пакета нет: он собирается волнами, и честная отметка зрелости —
  // принятые шаги роадмапа, а не выдуманный номер (ревью R8, minor 6).
  const roadmap = read("ROADMAP.md");
  const accepted = /\|\s*Принято шагов\s*\|\s*(\d+) из (\d+)/.exec(roadmap);
  // граница покрытия — таблица «Чего в пакете нет» человеческого документа
  const coverageMd = read("docs/guide/coverage.md");
  const notCovered = coverageMd
    .slice(coverageMd.indexOf("## Чего в пакете нет"))
    .split("\n## ")[0]
    .split("\n")
    .filter((l) => l.startsWith("| ") && !l.startsWith("| Не покрыто") && !l.startsWith("|---"))
    .map((l) => ({ what: l.split("|")[1].trim(), why: (l.split("|")[2] || "").trim() }))
    .filter((x) => x.what);
  const index = {
    product: "courses",
    title: "Хабр Курсы",
    stage: accepted ? `принято шагов ${accepted[1]} из ${accepted[2]} (ROADMAP.md)` : null,
    kind: "product-interface",
    language: "ru",
    css: "ui/courses.css",
    files: {
      tokens: "machine/tokens.json",
      components: "machine/components.json",
      rules: "machine/rules.json",
      patterns: "machine/patterns.json",
      content: "machine/content.json",
    },
    humanDocs: ["README.md", "docs/guide/coverage.md", "docs/guide/composition.md", "docs/guide/decisions.md", "docs/guide/tokens.md", "docs/guide/typography.md", "docs/guide/layout.md", "components/INDEX.md"],
    checks: [
      "node tools/validate-components.mjs --strict",
      "node tools/validate-classes.mjs",
      "node tools/validate-showcase-claims.mjs",
      "node tools/validate-showcase-docs.mjs",
      "node tools/validate-machine.mjs",
    ],
    coverage: {
      pagesCaptured: Object.keys(axes).length,
      pagesAssembled: fs.readdirSync(path.join(pkg, "pages")).filter((f) => f.endsWith(".md")).length,
      components: { total: recs.length, complete, partial: recs.filter((r) => r.status === "partial").length, figmaOnly: recs.filter((r) => r.status === "figma-only").length },
      boundary: "публичная часть Курсов, снятая гостем на десяти страницах",
      notCovered,
      boundaryDoc: "docs/guide/coverage.md",
    },
    generatedAt: TODAY,
    generatedBy: "tools/build-machine.mjs",
  };
  log.push(write("index.json", index));
}

console.log(log.join("; "));
