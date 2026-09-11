// Замеры по осям principles-axes.md на всех десяти снятых страницах (R7).
//
// Каждая страница рисуется так же, как в layout.mjs и diff-page.mjs: снятый
// dom.html (на 375 — dom-375.html) с CSS корпуса, шрифт Inter из
// ui/assets/fonts, атрибут области видимости Vue снят, скрипт выключен.
// Ширины: 1440×900, 1024×900, 768×900, 375×812 — первый экран считается
// по окнам 1440 и 375.
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
  // 1024 и 768 добавлены после ревью R7: на них держатся SH-4, R-2, R-3,
  // R-4 и L-1, а первая редакция снимала только 1440 и 375.
  for (const [W, H] of [[1440, 900], [1024, 900], [768, 900], [375, 812]]) {
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
    result[pageId][W] = await page.evaluate(({ SEL, CARDS, H, W }) => {
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

      // --- добавлено по ревью R7 ---------------------------------------
      // Отступ заголовка секции: каждая видимая секция с h2 (прямым или в
      // первой обёртке), расстояние от низа h2 до верха следующего видимого
      // блока. Отбор — по тегу, а не по селектору записи Section, который
      // сам содержит gap-4 (ревью: отбор совпадал с условием правила).
      out.sectionHead = {};
      out.sectionHeadList = [];
      for (const s of q("section")) {
        const h = s.querySelector(":scope > h2") || s.querySelector(":scope > div > h2");
        if (!h || !vis(h)) continue;
        const sib = [...h.parentElement.children].filter(vis);
        const next = sib[sib.indexOf(h) + 1];
        if (!next) continue;
        const raw = Math.round(next.getBoundingClientRect().top - h.getBoundingClientRect().bottom);
        inc(out.sectionHead, String(raw));
        // Видимое начало содержимого: самый верхний потомок следующего блока,
        // у которого есть текст, картинка, рамка или заливка. Отступ бывает
        // промежутком секции (gap-4), а бывает полем внутри содержимого (mt-4) —
        // глазу это одно и то же.
        let top = Infinity;
        for (const x of [next, ...next.querySelectorAll("*")]) {
          if (!vis(x)) continue;
          const sx = cs(x);
          const own = [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          const mark = own || x.tagName === "IMG" || x.tagName === "svg" || parseFloat(sx.borderTopWidth) > 0 || (sx.backgroundColor !== "rgba(0, 0, 0, 0)");
          // верх, обрезанный предками с overflow (обложка со scale-* не в счёт)
          let t = x.getBoundingClientRect().top;
          for (let p = x.parentElement; p && p !== next.parentElement; p = p.parentElement) if (cs(p).overflowY !== "visible") t = Math.max(t, p.getBoundingClientRect().top);
          if (mark) top = Math.min(top, t);
        }
        const visual = top < Infinity ? Math.round(top - h.getBoundingClientRect().bottom) : null;
        if (visual != null) { out.sectionHeadVisual = out.sectionHeadVisual || {}; inc(out.sectionHeadVisual, String(visual)); }
        out.sectionHeadList.push({ h2: h.textContent.trim().slice(0, 32), gap: cs(h.parentElement).rowGap, raw, visual, next: [...next.classList].slice(0, 4).join(".") });
      }
      out.sectionHeadVisual = out.sectionHeadVisual || {};
      // Радиусы всех видимых плоскостей: узел с рамкой или непрозрачным
      // фоном, отличным от белого. Разбито по размеру — «крупная плоскость»
      // получает число (ширина от 200 и высота от 60).
      out.surfaceRadius = { large: {}, small: {} };
      // Список узлов — чтобы у каждого значения был адрес (только 1440).
      // Предок со скруглением и overflow:hidden обрезает углы потомка: такой
      // узел помечен «обрезан», его собственный радиус 0 глазу не виден.
      out.surfaceList = [];
      // радиус ближайшего предка, который скругляет и обрезает (0 — такого нет)
      const clipped = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const ps = cs(p); if (ps.overflow !== "visible" && parseFloat(ps.borderTopLeftRadius) > 0) return ps.borderTopLeftRadius; } return 0; };
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || e.closest("header") || e.closest("footer")) continue;
        const s = cs(e); const r = e.getBoundingClientRect();
        const bordered = parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none";
        const filled = s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "rgb(255, 255, 255)" || /gradient/.test(s.backgroundImage);
        // белая заливка со скруглением видна на картинке или цветном фоне (MetaPill на обложке)
        const white = s.backgroundColor === "rgb(255, 255, 255)" && parseFloat(s.borderTopLeftRadius) > 0;
        if (!bordered && !filled && !white && e.tagName !== "IMG") continue;
        const kind = bordered ? "рамка" : e.tagName === "IMG" ? "картинка" : white ? "белая заливка" : "заливка";
        const large = r.width >= 200 && r.height >= 60;
        inc(large ? out.surfaceRadius.large : out.surfaceRadius.small, `${kind} · ${s.borderTopLeftRadius}`);
        if (W === 1440) out.surfaceList.push([kind, s.borderTopLeftRadius, Math.round(r.width), Math.round(r.height), clipped(e), e.tagName.toLowerCase() + "." + [...e.classList].slice(0, 5).join(".")]);
      }
      // Числа от тысячи: с пробелом в разрядах и без него, с соседним словом.
      out.numbers = { spaced: {}, plain: {} };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode; const el = n.parentElement;
        if (!el || !vis(el) || el.closest("script,style")) continue;
        const t = n.textContent;
        for (const m of t.matchAll(/(?<![\d.,])(\d{1,3}(?:[   ]\d{3})+|\d{4,})(?![\d.,])/g)) {
          const spaced = /\s/.test(m[1]);
          const after = t.slice(m.index + m[0].length, m.index + m[0].length + 12).trim().split(/\s/)[0] || "";
          const before = t.slice(Math.max(0, m.index - 3), m.index);
          const ctx = /₽/.test(after) ? "₽" : /^(отзыв|выпускник|курс)/.test(after) ? after.replace(/[^а-яё]/gi, "").slice(0, 9) : /\+/.test(before) ? "+N" : /^\d{4}$/.test(m[1]) && +m[1] > 1990 && +m[1] < 2031 ? "год" : "прочее";
          // фраза — число внутри предложения (текст автора или редакции),
          // подпись — короткий текст узла (интерфейс: цена, счётчик, ячейка)
          const kind = t.trim().length > 40 ? "фраза" : "подпись";
          inc(spaced ? out.numbers.spaced : out.numbers.plain, `${kind} · ${ctx}`);
          const k = `${spaced ? "пробел" : "слитно"} · ${kind} · ${ctx}`;
          out.numberSamples = out.numberSamples || {};
          const sample = t.slice(Math.max(0, m.index - 12), m.index + m[0].length + 14).replace(/\s+/g, " ").trim();
          if ((out.numberSamples[k] = out.numberSamples[k] || []).length < 4 && !out.numberSamples[k].includes(sample)) out.numberSamples[k].push(sample);
        }
      }
      // Синий #346ef4 и оранжевый #ff7e47: где стоят как фон, градиент, текст.
      out.hues = { blueBg: 0, blueGradient: 0, blueText: 0, orangeBg: 0, orangeText: 0, orangeWhere: {} };
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e)) continue;
        const s = cs(e);
        const where = () => (e.closest("header") ? "шапка" : e.closest("div.w-full.bg-main-gradient-second") ? "hero" : "колонка") + " · " + e.tagName.toLowerCase() + "." + [...e.classList].slice(0, 3).join(".");
        if (s.backgroundColor === "rgb(52, 110, 244)") { out.hues.blueBg++; (out.hues.blueWhere = out.hues.blueWhere || []).push("фон · " + where()); }
        if (/rgb\(52, 110, 244\)/.test(s.backgroundImage)) { out.hues.blueGradient++; (out.hues.blueWhere = out.hues.blueWhere || []).push("градиент · " + where()); }
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (own && s.color === "rgb(52, 110, 244)") { out.hues.blueText++; out.hues.blueTextWhere = out.hues.blueTextWhere || {}; inc(out.hues.blueTextWhere, (e.closest("a") ? "ссылка" : "не ссылка") + " · " + e.tagName.toLowerCase() + "." + [...e.classList].slice(0, 3).join(".")); }
        if (s.backgroundColor === "rgb(255, 126, 71)") { out.hues.orangeBg++; inc(out.hues.orangeWhere, [...e.classList].slice(0, 3).join(".")); }
        if (own && s.color === "rgb(255, 126, 71)") out.hues.orangeText++;
      }
      // Все <button>, не только запись Button: фон по записи-хозяину.
      out.allButtons = {};
      for (const b of q("button")) {
        const owner = ["filter-chip", "icon-button", "button"].find((c) => { try { return b.matches(SEL[c]); } catch { return false; } }) || "прочее";
        inc(out.allButtons, `${owner} · ${cs(b).backgroundColor}`);
      }
      // Где стоят тёмные Button: в карточке, в форме поиска, остальные — с подписью.
      out.darkWhere = { card: 0, search: 0, other: [] };
      for (const b of q(SEL.button)) {
        if (cs(b).backgroundColor !== "rgb(44, 46, 52)") continue;
        if (allCards.some((c) => c.contains(b))) out.darkWhere.card++;
        else if (b.closest("form") || (SEL["search-form"] && (() => { try { return b.closest(SEL["search-form"]); } catch { return null; } })())) out.darkWhere.search++;
        else out.darkWhere.other.push((b.closest("header") ? "шапка" : b.closest("div.w-full.bg-main-gradient-second") ? "hero" : "колонка") + " «" + b.textContent.replace(/\s+/g, " ").trim().slice(0, 30) + "»");
      }
      // Карусели: корни карточек внутри ленты Swiper — раскладку ленты задаёт скрипт.
      out.carousel = { swipers: q(".swiper-wrapper").length, cards: allCards.filter((c) => c.closest(".swiper-wrapper")).length, total: allCards.length };
      // Выход за контейнер: узел шире контейнера содержимого и не обрезан
      // скруглённым предком (обложки карточек с scale-* обрезаны).
      if (container) {
        const cw = container.getBoundingClientRect(), mw = main ? main.getBoundingClientRect() : cw;
        const bleedOut = (e, lim) => { const r = e.getBoundingClientRect(); return r.left < lim.left - 1 || r.right > lim.right + 1; };
        // обрезан: есть предок с overflow, который сам в пределах границы
        const cut = (e, lim) => { for (let p = e.parentElement; p && p !== container; p = p.parentElement) if (cs(p).overflowX !== "visible" && !bleedOut(p, lim)) return true; return false; };
        const top = (lim) => [...(main || container).querySelectorAll("*")].filter((e) => vis(e) && bleedOut(e, lim) && !cut(e, lim) && !(e.parentElement && bleedOut(e.parentElement, lim))).map((e) => e.tagName.toLowerCase() + "." + [...e.classList].slice(0, 5).join("."));
        const cin = cs(container); const inner = { left: cw.left + parseFloat(cin.paddingLeft), right: cw.right - parseFloat(cin.paddingRight) };
        out.bleedColumn = top(inner);
        out.bleedContainer = top({ left: cw.left, right: cw.right });
      }
      // Порядок блоков главной колонки — подпись для сравнения ширин.
      out.order = main ? [...main.children].map((k) => k.tagName.toLowerCase() + "." + [...k.classList].slice(0, 2).join(".")).join(" | ") : null;
      // Подвал: число колонок.
      const fg = document.querySelector("footer div.grid");
      out.footerCols = fg ? cs(fg).gridTemplateColumns.split(" ").length : null;
      // Блоки, выходящие за колонку (в край экрана).
      out.bleed = main ? [...main.querySelectorAll("*")].filter((e) => vis(e) && e.getBoundingClientRect().width > main.getBoundingClientRect().width + 1).map((e) => [...e.classList].slice(0, 4).join(".")).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8) : [];

      // 11. Группировка
      out.grouping = { hr: q("hr").length, bullets: [...document.querySelectorAll(".inline-separator")].filter(vis).length, sectionsWithH2: q("section").filter((s) => s.querySelector(":scope > h2, :scope > div > h2")).length };

      // 12. Реакция на курсор — hover-классы по ролям
      out.hover = {};
      const role = (e) => { if (CARDS.some((c) => { try { return e.matches(SEL[c]); } catch { return false; } })) return "карточка"; try { if (e.matches(SEL.button)) return "кнопка"; } catch {} if (e.tagName === "A") return "ссылка"; return "прочее"; };
      for (const e of document.querySelectorAll("[class*='hover:']")) { if (!vis(e)) continue; for (const c of e.classList) if (/(^|:)hover:/.test(c)) inc(out.hover, `${role(e)} · ${c}`); }
      out.cardRootHover = allCards.filter((e) => [...e.classList].some((c) => c.includes("hover:"))).length + " из " + allCards.length;

      // 15–16. адаптив: какие классы прячут и меняют форму — по разметке
      out.responsive = {};
      for (const e of document.querySelectorAll("[class*='phone:'], [class*='tablet'], [class*='desktop:'], [class*='small-phone:']")) for (const c of e.classList) if (/^(phone|tablet|tablet-only|desktop|small-phone|phablet-and-tablet):(hidden|flex-col|grid-cols|block|!block|grid|flex|order|basis)/.test(c)) inc(out.responsive, c.replace(/\[.*\]/, "[…]"));

      // 17. Тексты — подписи кнопок, числа, даты
      out.buttonCounts = {};
      for (const b of q(SEL.button)) { const t = b.textContent.replace(/\s+/g, " ").trim().replace(/^Открыть код.*/, "Открыть код"); if (t) inc(out.buttonCounts, t); }
      out.texts = { buttons: [...new Set(q(SEL.button).map((b) => b.textContent.replace(/\s+/g, " ").trim()).filter(Boolean))].slice(0, 30),
        decimals: (document.body.innerText.match(/\b\d\.\d{1,2}\b/g) || []).length, decimalsComma: (document.body.innerText.match(/\b\d,\d{1,2}\b/g) || []).length,
        rub: (document.body.innerText.match(/₽/g) || []).length, thin: (document.body.innerText.match(/\d[   ]\d{3}/g) || []).length };
      return out;
    }, { SEL, CARDS, H, W });
    await ctx.close();
  }
  process.stdout.write(pageId + " ");
}
await browser.close();
fs.writeFileSync(path.join(d, "axes.json"), JSON.stringify(result, null, 1) + "\n", "utf8");
console.log(`\naxes.json: ${pages.length} страниц × 4 ширины`);
