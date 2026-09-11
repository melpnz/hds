// Замеры по осям principles-axes.md на всех десяти снятых страницах (R7).
//
// Каждая страница рисуется так же, как в layout.mjs и diff-page.mjs: снятый
// dom.html (на 375 — dom-375.html) с CSS корпуса, шрифт Inter из
// ui/assets/fonts, атрибут области видимости Vue снят, скрипт выключен.
// Ширины: 1440×900 и 375×812 — первый экран считается по этим окнам.
//
// Узлы записей — по селекторам переписи components/selector-census.json.
// Выход: .pipeline/principles/axes.json. Сводка голосов — principles-evidence.md
// (пишется по этому файлу).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const cssDir = path.join(pkg, "evidence/source/production/css");
const unscope = (s) => s.replace(/\[data-v-[0-9a-f]+\]/g, "");
const ext = unscope(fs.readdirSync(path.join(cssDir, "external")).sort().map((f) => fs.readFileSync(path.join(cssDir, "external", f), "utf8")).join("\n"));
const census = JSON.parse(fs.readFileSync(path.join(pkg, "components/selector-census.json"), "utf8")).selectors;
const SEL = Object.fromEntries(Object.entries(census).map(([id, v]) => [id, (Array.isArray(v) ? v[0] : v).selector]));
const CARDS = ["course-card", "school-card", "person-card", "review-card", "article-card", "promo-card", "step-card", "ad-card", "numbered-course-item"];
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html"))).sort();

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const result = {};
for (const pageId of pages) {
  result[pageId] = {};
  const css = unscope(fs.readFileSync(path.join(cssDir, "inline", `${pageId}.css`), "utf8"));
  for (const [W, H] of [[1440, 900], [375, 812]]) {
    const domFile = fs.existsSync(path.join(pagesDir, pageId, `dom-${W}.html`)) ? `dom-${W}.html` : "dom.html";
    const body = fs.readFileSync(path.join(pagesDir, pageId, domFile), "utf8");
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: W, height: H } });
    const page = await ctx.newPage();
    await page.route(/^https?:/, (r) => {
      const m = /\/fonts\/inter\/([\w.-]+\.woff2)/.exec(r.request().url());
      const f = m && path.join(pkg, "ui/assets/fonts", m[1]);
      return f && fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: "font/woff2" }) : r.abort();
    });
    await page.setContent(`<!doctype html><html><head><style>${css}\n${ext}</style></head>${body.startsWith("<body") ? body : "<body>" + body + "</body>"}</html>`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    result[pageId][W] = await page.evaluate(({ SEL, CARDS, H }) => {
      const vis = (e) => e.checkVisibility({ visibilityProperty: true }) && e.getBoundingClientRect().width > 0;
      const q = (s) => { try { return [...document.querySelectorAll(s)].filter(vis); } catch { return []; } };
      const box = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
      const cs = (e) => getComputedStyle(e);
      const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
      const out = {};

      // 1. Оболочка
      const header = document.querySelector("header");
      const hc = header && cs(header);
      const container = document.querySelector("div.mx-auto.max-w-\\[1124px\\]");
      const footer = document.querySelector("footer");
      out.shell = {
        headerH: header ? box(header).h : null, headerSticky: hc ? hc.position : null, headerGradient: hc ? /gradient/.test(hc.backgroundImage) : null,
        bodyBg: cs(document.body).backgroundColor,
        containerMax: container ? cs(container).maxWidth : null, containerPad: container ? cs(container).paddingLeft : null,
        footerBg: footer ? cs(footer).backgroundColor : null, footerH: footer ? box(footer).h : null,
        hero: (() => { const h = document.querySelector("div.w-full.bg-main-gradient-second:has(h1)"); return h ? box(h).h : null; })(),
        rubrication: !!document.querySelector(".rubrication-header"),
      };

      // 2. Сетка и 5. ритм: главная колонка — самый крупный grid/flex-столбец
      // внутри контейнера содержимого (не шапки).
      const mains = [...document.querySelectorAll("div.mx-auto.max-w-\\[1124px\\] > div")].filter((e) => !e.closest("header") && !e.closest("footer") && vis(e));
      const main = mains.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
      const mc = main && cs(main);
      out.main = main ? { cls: [...main.classList].join(" "), display: mc.display, rowGap: mc.rowGap, padTop: mc.paddingTop, padBottom: mc.paddingBottom, children: main.children.length } : null;
      // шаги между соседними видимыми блоками главной колонки
      if (main) {
        const kids = [...main.children].filter(vis).map(box).sort((a, b) => a.y - b.y);
        out.main.steps = kids.slice(1).map((b, i) => Math.round(b.y - (kids[i].y + kids[i].h)));
      }
      out.grids = [];
      for (const g of q("div.grid")) {
        const kids = [...g.children].filter(vis);
        const cardKids = kids.filter((k) => CARDS.some((c) => { try { return k.matches(SEL[c]) || k.querySelector(":scope > " + SEL[c]) ; } catch { return false; } }));
        if (cardKids.length < 2) continue;
        const gc = cs(g);
        out.grids.push({ cls: [...g.classList].slice(0, 6).join("."), cols: gc.gridTemplateColumns.split(" ").length, colW: +parseFloat(gc.gridTemplateColumns.split(" ")[0]).toFixed(0), colGap: gc.columnGap, rowGap: gc.rowGap, items: kids.length });
      }

      // карточки записей
      const cards = {};
      for (const c of CARDS) cards[c] = q(SEL[c]);
      const allCards = Object.values(cards).flat();

      // 3. Поверхности и 4. форма — у корней карточек и у кнопок, полей, чипов
      out.cardSurface = {};
      for (const [c, list] of Object.entries(cards)) {
        for (const e of list) {
          const s = cs(e);
          const key = `${c} · border ${s.borderTopWidth} · bg ${s.backgroundColor} · shadow ${s.boxShadow === "none" ? "нет" : "есть"} · radius ${s.borderTopLeftRadius}`;
          inc(out.cardSurface, key);
        }
      }
      out.radius = {};
      const RADIUS_TARGETS = { button: SEL.button, "filter-chip": SEL["filter-chip"], chip: SEL.chip, "text-input": SEL["text-input"], section: SEL.section, "entity-header": SEL["entity-header"], "person-header": SEL["person-header"], "rating-table": SEL["rating-table"], pagination: SEL.pagination, "icon-button": SEL["icon-button"], badge: SEL.badge, "meta-pill": SEL["meta-pill"], avatar: SEL.avatar, "entity-logo": SEL["entity-logo"] };
      for (const [c, s] of Object.entries({ ...RADIUS_TARGETS, ...Object.fromEntries(CARDS.map((c) => [c, SEL[c]])) })) for (const e of q(s)) inc(out.radius, `${c} · ${cs(e).borderTopLeftRadius}`);
      // тени: все видимые узлы с box-shadow
      out.shadows = {};
      for (const e of document.querySelectorAll("body *")) { const s = cs(e).boxShadow; if (s && s !== "none" && vis(e)) inc(out.shadows, `${e.tagName.toLowerCase()}.${[...e.classList].filter((x) => /shadow/.test(x)).join(".") || [...e.classList].slice(0, 2).join(".")}`); }

      // 6. Плотность — карточки в первом экране (хотя бы наполовину)
      const inFirst = (e) => { const r = e.getBoundingClientRect(); const top = r.y + scrollY; return top < H && top + r.height / 2 <= H + r.height / 2 && top + r.height * 0.5 < H; };
      out.firstScreen = { cards: allCards.filter(inFirst).length, byType: Object.fromEntries(Object.entries(cards).map(([c, l]) => [c, l.filter(inFirst).length]).filter(([, n]) => n)) };

      // 7. Точка входа — самый крупный кегль и самая крупная заливка первого экрана
      let big = null;
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e)) continue;
        const r = e.getBoundingClientRect(); if (r.y + scrollY > H) continue;
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        const fs = parseFloat(cs(e).fontSize);
        if (!big || fs > big.fs) big = { fs, tag: e.tagName.toLowerCase(), text: e.textContent.trim().slice(0, 40), y: Math.round(r.y) };
      }
      out.entry = { biggestText: big, h1: (() => { const h = document.querySelector("h1"); if (!h) return null; const r = h.getBoundingClientRect(); return { fs: cs(h).fontSize, y: Math.round(r.y + scrollY), visible: vis(h), text: h.textContent.trim().slice(0, 40) }; })() };

      // 8. Акценты — по всей странице и в первом экране
      const acc = { darkButtons: 0, darkButtonsFirst: 0, blueText: 0, orange: 0, yellowStars: 0 };
      for (const e of q(SEL.button)) { const bg = cs(e).backgroundColor; if (bg === "rgb(44, 46, 52)") { acc.darkButtons++; if (inFirst(e)) acc.darkButtonsFirst++; } }
      for (const e of document.querySelectorAll("a, span, div")) { if (!vis(e)) continue; const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (own && cs(e).color === "rgb(52, 110, 244)") acc.blueText++; }
      acc.orange = q(SEL.badge).length;
      acc.yellowStars = q("svg.text-ui-yellow-500").length;
      out.accents = acc;

      // 9. Иерархия текста — кегли видимого текста
      out.fontSizes = {};
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || e.closest("header") || e.closest("footer")) continue;
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (own) inc(out.fontSizes, `${cs(e).fontSize}/${cs(e).fontWeight}`);
      }
      out.headings = { h1: q("h1").map((h) => cs(h).fontSize + "/" + cs(h).lineHeight), h2: q("h2").map((h) => cs(h).fontSize + "/" + cs(h).lineHeight + "/" + cs(h).fontWeight), divH2: q("div.text-h2").length };

      // 10. Основное действие — где стоят тёмные кнопки и кнопки конца секции
      out.actions = { heroForm: q("div.bg-main-gradient-second " + SEL.button).length, inCards: allCards.reduce((n, c) => n + [...c.querySelectorAll("*")].filter((x) => { try { return x.matches(SEL.button) && vis(x); } catch { return false; } }).length, 0),
        sectionEnd: q("section > a.w-full, section > button.w-full, section > a[class*='w-full'], div.w-full > button.w-full").length,
        fullWidthButtons: q(SEL.button).filter((b) => cs(b).width !== "auto" && b.getBoundingClientRect().width > 300).map((b) => b.textContent.trim().slice(0, 30)) };

      // фон кнопок: тёмная, светлая или иная
      out.buttonBg = {};
      for (const b of q(SEL.button)) inc(out.buttonBg, cs(b).backgroundColor);
      // секции с h2: чем заканчиваются — широкой кнопкой или нет
      out.sectionEnds = { total: 0, wideButton: 0 };
      for (const s of q("section")) {
        if (!s.querySelector(":scope > h2, :scope > div > h2")) continue;
        out.sectionEnds.total++;
        const last = [...s.children].filter(vis).pop();
        if (last && (() => { try { return last.matches(SEL.button) || last.querySelector(SEL.button); } catch { return false; } })() && last.getBoundingClientRect().width > 300 && last.getBoundingClientRect().height <= 64) out.sectionEnds.wideButton++;
      }

      // 11. Группировка
      out.grouping = { hr: q("hr").length, bullets: [...document.querySelectorAll(".inline-separator")].filter(vis).length, sectionsWithH2: q("section:has(> h2), section:has(h2)").length };

      // 12. Реакция на курсор — hover-классы по ролям
      out.hover = {};
      const role = (e) => { if (CARDS.some((c) => { try { return e.matches(SEL[c]); } catch { return false; } })) return "карточка"; try { if (e.matches(SEL.button)) return "кнопка"; } catch {} if (e.tagName === "A") return "ссылка"; return "прочее"; };
      for (const e of document.querySelectorAll("[class*='hover:']")) { if (!vis(e)) continue; for (const c of e.classList) if (/(^|:)hover:/.test(c)) inc(out.hover, `${role(e)} · ${c}`); }
      out.cardRootHover = allCards.filter((e) => [...e.classList].some((c) => c.includes("hover:"))).length + " из " + allCards.length;

      // 15–16. адаптив: какие классы прячут и меняют форму — по разметке
      out.responsive = {};
      for (const e of document.querySelectorAll("[class*='phone:'], [class*='tablet'], [class*='desktop:'], [class*='small-phone:']")) for (const c of e.classList) if (/^(phone|tablet|tablet-only|desktop|small-phone|phablet-and-tablet):(hidden|flex-col|grid-cols|block|!block|grid|flex|order|basis)/.test(c)) inc(out.responsive, c.replace(/\[.*\]/, "[…]"));

      // 17. Тексты — подписи кнопок, числа, даты
      out.texts = { buttons: [...new Set(q(SEL.button).map((b) => b.textContent.replace(/\s+/g, " ").trim()).filter(Boolean))].slice(0, 30),
        decimals: (document.body.innerText.match(/\b\d\.\d{1,2}\b/g) || []).length, decimalsComma: (document.body.innerText.match(/\b\d,\d{1,2}\b/g) || []).length,
        rub: (document.body.innerText.match(/₽/g) || []).length, thin: (document.body.innerText.match(/\d[   ]\d{3}/g) || []).length };
      return out;
    }, { SEL, CARDS, H });
    await ctx.close();
  }
  process.stdout.write(pageId + " ");
}
await browser.close();
fs.writeFileSync(path.join(d, "axes.json"), JSON.stringify(result, null, 1) + "\n", "utf8");
console.log(`\naxes.json: ${pages.length} страниц × 2 ширины`);
