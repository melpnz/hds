// Сборка страницы витрины из снятой разметки продукта (шаг R6).
//
// Страница продукта — уже композиция записей реестра: карточки, сетка,
// секции, шапка и подвал на ней — те самые узлы, которые измерены
// переписью селекторов. Поэтому страница витрины собирается не вёрсткой
// заново, а из снятого dom.html: сохраняется порядок областей, обёртки
// раскладки и классы, меняется только то, что без сети и скрипта не
// работает или раздувает пример:
//
//   - адреса картинок — на локальные заглушки ui/assets/, спрайты — на
//     локальные копии; адреса ссылок — на «#», target снимается;
//   - карусели Swiper — на заглушку `doc-page-stub` их размера: библиотечный
//     слой в ui/ не поднимается (решение R0-02), без него лента разваливается
//     в столбец, и живой пример был бы неправдой (см. carousel.md);
//   - длинные списки сокращаются (сколько оставлено — в PAGES[id].trim и в
//     подписи на витрине); числа каркаса в статье страницы — по полной
//     странице, а не по сокращённой;
//   - узлы, которые в живом продукте скрыты scoped-правилом Vue, а в снимке
//     видны (атрибуты data-v-* съёмка срезает), убираются — PAGES[id].hydrated;
//   - скрипты, стили, комментарии, data-v-* и data-* убираются.
//
// Разового CSS нет: классы, которых нет ни в одной записи, поднимаются из
// корпуса прод-CSS тем же gen-utilities.mjs (ключ page-<id> в
// .pipeline/R2-bulk/extra-classes.json), заглушки — классами doc- в
// showcase/pages.css.
//
// Запуск: node .pipeline/pages/gen-page.mjs <id>
// Выход: showcase/pages/<id>.html и список классов страницы в
//        .pipeline/pages/<id>.classes.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PAGES } from "./pages-config.mjs";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");


const id = process.argv[2] || "courses-listing";
const cfg = PAGES[id];
if (!cfg) throw new Error(`нет страницы ${id}; есть: ${Object.keys(PAGES).join(", ")}`);
const html = fs.readFileSync(path.join(pkg, "evidence/source/production/pages", cfg.source, "dom.html"), "utf8");

const browser = await chromium.launch({ executablePath: process.env.CHROME_SHELL || undefined });
const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
await page.route(/^https?:/, (r) => r.abort());
await page.setContent(html, { waitUntil: "domcontentloaded" });
const res = await page.evaluate((cfg) => {
  const report = { trimmed: [], stubs: [], images: 0, links: 0 };
  const app = document.querySelector(".app-container");
  app.querySelectorAll("script, noscript, style, link, iframe, template").forEach((n) => n.remove());
  const tw = document.createTreeWalker(app, NodeFilter.SHOW_COMMENT);
  const comments = []; while (tw.nextNode()) comments.push(tw.currentNode);
  comments.forEach((c) => c.remove());

  for (const h of cfg.hydrated || []) {
    const n = app.querySelectorAll(h.sel);
    if (!n.length) throw new Error("hydrated: нет " + h.sel);
    n.forEach((x) => x.remove());
    report.hydrated = (report.hydrated || 0) + n.length;
  }
  for (const t of cfg.trim) {
    const box = app.querySelector(t.sel);
    if (!box) throw new Error("trim: нет " + t.sel);
    const kids = [...box.children];
    kids.forEach((k, i) => { if (i >= t.keep && i < kids.length - t.tail) k.remove(); });
    report.trimmed.push({ sel: t.sel, before: kids.length, after: box.children.length, what: t.what });
  }
  for (const s of [...cfg.stubs].sort((a, b) => (b.index || 0) - (a.index || 0))) {
    // Заглушки ставятся с конца: иначе после первой замены индекс второго
    // совпадения того же селектора сдвинется.
    const el = app.querySelectorAll(s.sel)[s.index || 0];
    if (!el) throw new Error("stub: нет " + s.sel + " #" + (s.index || 0));
    const stub = document.createElement("div");
    stub.className = `doc-page-stub doc-page-stub--${s.mod}`;
    stub.setAttribute("role", "img");
    stub.setAttribute("aria-label", `${s.name}: ${s.text}`);
    stub.innerHTML = `<span class="doc-page-stub__name">${s.name}</span><span class="doc-page-stub__text">${s.text}. Лента Swiper держится на библиотечном слое, которого в ui/ нет, — живой пример был бы неправдой. Разметка — components/collections/carousel.md</span>`;
    el.replaceWith(stub);
    report.stubs.push(s.sel);
  }

  const local = (ref) => {
    if (/sprite\.svg/.test(ref)) return ref.replace(/^.*sprite\.svg(?:\?[^#]*)?/, "../../ui/assets/icons/sprite.svg");
    if (/social-v3\.1\.svg/.test(ref)) return ref.replace(/^.*social-v3\.1\.svg(?:\?[^#]*)?/, "../../ui/assets/icons/social-v3.1.svg");
    if (/external-profile\.svg/.test(ref)) return ref.replace(/^.*external-profile\.svg(?:\?[^#]*)?/, "../../ui/assets/icons/external-profile.svg");
    if (/user_avatar_2\.svg/.test(ref)) return "../../ui/assets/images/user_avatar_2.svg";
    if (/avatars\/logo\.svg/.test(ref)) return "../../ui/assets/images/logo.svg";
    // Ассеты продукта, которые лежат в пакете (тот же список, что у
    // gen-specs.mjs, DIRECT). Первая редакция отдавала значок «Партнёр Хабра»
    // в заглушку 160×160, и в рейтинге она раздувала строки таблицы.
    if (/icons\/green-partner-icon\.svg/.test(ref)) return "../../ui/assets/icons/green-partner-icon.svg";
    if (/courses\/code_2\.svg/.test(ref)) return "../../ui/assets/images/code_2.svg";
    return "../../ui/assets/images/content-placeholder.svg";
  };
  for (const el of app.querySelectorAll("*")) {
    for (const a of [...el.getAttributeNames()]) {
      if (/^data-/.test(a) || /^on/.test(a) || a === "srcset" || a === "sizes" || a === "loading" || a === "action") el.removeAttribute(a);
    }
    if (el.tagName === "IMG") { el.setAttribute("src", local(el.getAttribute("src") || "")); report.images++; }
    // Символ из спрайта, которого нет в пакете (experts.svg на /courses/authors),
    // остаётся пустым: картинка-заглушка внутри <use> выглядела бы сломанным
    // значком, а пустой символ честно показывает «знак не снят» (ROADMAP X-102).
    if (el.tagName === "use") for (const a of ["xlink:href", "href"]) if (el.getAttribute(a)) { const v = local(el.getAttribute(a)); el.setAttribute(a, /content-placeholder/.test(v) ? "#" : v); }
    if (el.tagName === "A" && el.hasAttribute("href")) { el.setAttribute("href", "#"); el.removeAttribute("target"); report.links++; }
    const st = el.getAttribute("style");
    if (st && /url\(/.test(st)) el.setAttribute("style", st.replace(/url\((['"]?)[^)'"]*\1\)/g, "url(../../ui/assets/images/content-placeholder.svg)"));
  }
  const classes = [...new Set([...app.querySelectorAll("*"), app].flatMap((n) => [...n.classList]))].sort();
  return { html: app.outerHTML, classes, report };
}, cfg);
await browser.close();

const out = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${cfg.title} — страница витрины Хабр Курсов</title>
<link rel="icon" href="data:,">
<!--
  Собрано .pipeline/pages/gen-page.mjs ${id} из evidence/source/production/pages/${cfg.source}/dom.html.
  Руками не править: правка уходит в генератор или в записи реестра.

  ../../ui/courses.css   продуктовый слой — единственный источник вида страницы.
  ../pages.css           только заглушки каруселей (doc-page-stub), в ui/ не протекает.
-->
<link rel="stylesheet" href="../../ui/courses.css">
<link rel="stylesheet" href="../pages.css">
</head>
<body>
${res.html}
</body>
</html>
`;
fs.mkdirSync(path.join(pkg, "showcase/pages"), { recursive: true });
fs.writeFileSync(path.join(pkg, "showcase/pages", `${id}.html`), out, "utf8");
fs.writeFileSync(path.join(d, `${id}.classes.json`), JSON.stringify({ page: id, report: res.report, classes: res.classes }, null, 1) + "\n", "utf8");
console.log(`showcase/pages/${id}.html: ${Math.round(out.length / 1024)} КБ, классов ${res.classes.length}, картинок ${res.report.images}, ссылок ${res.report.links}`);
for (const t of res.report.trimmed) console.log(`  сокращено ${t.sel}: ${t.before} → ${t.after} (${t.what})`);
