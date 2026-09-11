// Каталоги вариантов трёх иконочных записей на витрину.
// Источник имён — story `all-variants` локального снимка Storybook
// (_sources/courses/rendered/icons-*--all-variants.html): сетка «иконка +
// подпись-имя». Источник подтверждения — снятый прод-DOM: сколько раз символ
// встречается на десяти страницах. Имена берутся разбором снимка, не руками.
//
// Разделение источников на витрине буквальное: П — символ найден в прод-разметке,
// S — имя есть только в Storybook и в самом файле спрайта, в разметке десяти
// снятых страниц не встречается ни разу.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const sb = path.resolve(pkg, "../_sources/courses/rendered");
const showcasePath = path.join(pkg, "showcase/components.html");

const readStory = (name) => fs.readFileSync(path.join(sb, `${name}.html`), "utf8");
const namesOf = (html) => [...html.matchAll(/<div class="mt-2">([^<]+)<\/div>/g)].map((m) => m[1].trim());

// ---------- подтверждение продом ----------
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html")));
function countInProd(re) {
  const total = new Map();
  const seen = new Map();
  for (const p of pages) {
    const html = fs.readFileSync(path.join(pagesDir, p, "dom.html"), "utf8");
    for (const m of html.matchAll(re)) {
      const k = m[1];
      total.set(k, (total.get(k) || 0) + 1);
      if (!seen.has(k)) seen.set(k, new Set());
      seen.get(k).add(p);
    }
  }
  return { total, seen };
}
const sprite = countInProd(/sprite\.svg(?:\?[^"#]*)?#([A-Za-z0-9_-]+)/g);
const social = countInProd(/social-v3\.1\.svg(?:\?[^"#]*)?#([A-Za-z0-9_-]+)/g);

// ---------- варианты ----------
const spriteNames = namesOf(readStory("icons-spriteicon--all-variants"));
const socialNames = namesOf(readStory("icons-socialicon--all-variants"));

const projectHtml = readStory("icons-projecticon--all-variants");
const projectNames = namesOf(projectHtml);
const projectColors = [...projectHtml.matchAll(/background-color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)]
  .map((m) => "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase());
const projectPath = /<path d="([^"]+)"/.exec(projectHtml)[1];

// Цвета фонов ProjectIcon в проде — те же четыре, по 20 узлов каждый.
const projectProd = new Map();
for (const p of pages) {
  const html = fs.readFileSync(path.join(pagesDir, p, "dom.html"), "utf8");
  for (const m of html.matchAll(/<span class="align-center inline-flex h-6 w-6 rounded-md"[^>]*background-color:\s*(#[0-9A-Fa-f]{6})/g)) {
    const k = m[1].toUpperCase();
    projectProd.set(k, (projectProd.get(k) || 0) + 1);
  }
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const badge = (kind) => kind === "production"
  ? '<span class="doc-src doc-src--production" title="production" aria-label="production">П</span>'
  : '<span class="doc-src doc-src--storybook" title="storybook-only" aria-label="storybook-only">S</span>';

function variant(label, markup, kind) {
  return `          <div class="doc-variant">
            <span class="doc-variant__label">${badge(kind)} ${esc(label)}</span>
            <div class="doc-variant__row">
              ${markup}
            </div>
          </div>`;
}

function specimen({ title, selector, srcNote, variants, note }) {
  return `
      <div class="doc-specimen">
        <div class="doc-specimen__head">
          <h5>${esc(title)}</h5>
          <code>${esc(selector)}</code>
          <span class="doc-specimen__spacer"></span>
          <span class="doc-src-group">
            <span class="doc-src doc-src--production" title="production" aria-label="production">П</span>
            <span class="doc-src doc-src--storybook" title="storybook-only" aria-label="storybook-only">S</span>
          </span>
          <span class="doc-tag doc-tag--partial">partial</span>
        </div>
        <p class="doc-note">${srcNote}</p>
        <div class="doc-stage doc-stage--grid">
${variants.join("\n")}
        </div>
        <p class="doc-note">${note}</p>
      </div>
`;
}

// ---------- SpriteIcon ----------
const spriteVariants = spriteNames.map((n) => {
  const used = sprite.total.get(n) || 0;
  const label = used
    ? `${n} — ${used} узл${used === 1 ? "ёл" : used < 5 ? "а" : "ов"} на ${sprite.seen.get(n).size}/10 страниц`
    : `${n} — в разметке десяти снятых страниц не встречается`;
  const markup = `<svg class="svg-icon fill-ui-black-500 text-ui-black-500" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="../ui/assets/icons/sprite.svg#${n}"></use></svg>`;
  return variant(label, markup, used ? "production" : "storybook");
});
const spriteProdCount = spriteNames.filter((n) => sprite.total.get(n)).length;

const spriteBlock = specimen({
  title: "all-variants — 22 символа спрайта",
  selector: "svg.svg-icon > use[xlink:href$='sprite.svg#<символ>']",
  srcNote: `<strong>Откуда полный список.</strong> Имена символов даёт story
          <code>Icons/SpriteIcon → Все возможные варианты</code> локального снимка
          Storybook (<code>_sources/courses/</code>, сборка 2 сентября 2026,
          спрайт версии <code>1.28.0</code>). Набор совпадает с локальным
          <code>ui/assets/icons/sprite.svg</code> (версия <code>1.29.0</code>)
          символ в символ — между версиями состав не менялся. R2-01 подтвердил
          прод-разметкой ${spriteProdCount} символов из 22 и оставил остальные
          ${22 - spriteProdCount} безымянными; здесь они названы источником.`,
  variants: spriteVariants,
  note: `<strong>Что означают значки.</strong> П — символ найден в разметке
          снятых страниц, число рядом измерено по десяти <code>dom.html</code>.
          S — имя известно из Storybook и символ лежит в спрайте, но в разметке
          десяти страниц он не встречается ни разу: гость таких мест не видит
          (<code>datepicker</code>, <code>filter</code>, <code>loader</code>,
          <code>menu</code>, <code>menu-close</code>, <code>plus</code>,
          <code>sort</code>, <code>cross-small</code>,
          <code>accreditation-expert</code>). Цвет здесь задан утилитами
          <code>fill-ui-black-500 text-ui-black-500</code> — так их красит сам
          Storybook; в продукте цвет у каждого места свой.`,
});

// ---------- SocialIcon ----------
// Единственный символ спрайта, нарисованный только белым, — instagram.
// На белой витрине он невидим, и это не дефект вёрстки: в продукте глиф
// лежит на градиентной подложке `a.instagram-gradient` (класс продукта,
// поднят в ui/utilities-components.css). Остальные восемь символов несут
// собственные цвета. Проверено разбором самого спрайта: у instagram
// множество fill = {#fff}, у прочих в нём есть небелые значения.
const WHITE_ONLY = new Set(["instagram"]);

const socialVariants = socialNames.map((n) => {
  const used = social.total.get(n) || 0;
  const label = used
    ? `${n} — ${used} узл${used === 1 ? "ёл" : used < 5 ? "а" : "ов"} в подвале, ${social.seen.get(n).size}/10 страниц`
    : `${n} — в подвале десяти снятых страниц не стоит`;
  const icon = `<svg class="svg-icon social-icon-${n}" width="24" height="24" style="width: 24px; height: 24px;"><use xlink:href="../ui/assets/icons/social-v3.1.svg#${n}"></use></svg>`;
  const markup = WHITE_ONLY.has(n)
    ? `<span class="instagram-gradient block rounded-full">${icon}</span>`
    : icon;
  return variant(label + (WHITE_ONLY.has(n) ? " — на подложке instagram-gradient, как в проде" : ""), markup, used ? "production" : "storybook");
});
const socialProdCount = socialNames.filter((n) => social.total.get(n)).length;

const socialBlock = specimen({
  title: `all-variants — ${socialNames.length} сетей`,
  selector: "svg.svg-icon.social-icon-<сеть>",
  srcNote: `<strong>Откуда полный список.</strong> Story
          <code>Icons/SocialIcon → Все возможные варианты</code> называет
          ${socialNames.length} сетей, и ровно столько символов лежит в локальном
          <code>ui/assets/icons/social-v3.1.svg</code>. Подвал десяти снятых
          страниц использует ${socialProdCount} из них — остальные
          ${socialNames.length - socialProdCount} существуют как ассет и как вариант
          компонента, но в снятой разметке не стоят.`,
  variants: socialVariants,
  note: `<strong>Класс сети ничего не красит.</strong> Разметка Storybook несёт
          на каждом значке класс <code>social-icon-&lt;сеть&gt;</code>, и правила
          у него нет нигде: ни в 22 файлах прод-корпуса, ни в 13 файлах CSS самого
          снимка Storybook (проверено <code>postcss</code>). Класс несёт имя сети
          и больше ничего — тот же класс находок, что девять «мёртвых» классов
          bulk-прохода; занесён в <code>tools/known-missing-classes.json</code>.
          Цвет значка приходит из самого спрайта, а не из CSS. В прод-разметке
          подвала этого класса нет вовсе — там значок обёрнут ссылкой
          <code>a.block.rounded-full</code> (пример «default» выше).</p>
        <p class="doc-note"><strong>Instagram — единственное исключение.</strong>
          Его глиф в спрайте нарисован только белым, и на белом фоне он невидим.
          Это не дефект витрины: в продукте значок лежит на градиентной подложке
          <code>a.instagram-gradient</code> — настоящий класс продукта, поднятый
          в <code>ui/utilities-components.css</code>. Здесь он воспроизведён так же.
          У остальных восьми символов в спрайте есть собственные небелые цвета
          (проверено разбором самого файла), и подложка им не нужна.`,
});

// ---------- ProjectIcon ----------
const projectVariants = projectNames.map((n, i) => {
  const color = projectColors[i];
  const used = projectProd.get(color) || 0;
  const label = `${n} — ${color}${used ? `, ${used} узлов в проде` : ", в проде не найден"}`;
  const markup = `<span class="align-center inline-flex h-6 w-6 rounded-md" style="background-color:${color};"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="${projectPath}" fill="#fff"></path></svg></span>`;
  return variant(label, markup, used ? "production" : "storybook");
});

const projectBlock = specimen({
  title: `all-variants — ${projectNames.length} проекта`,
  selector: "span.align-center.inline-flex.h-6.w-6.rounded-md",
  srcNote: `<strong>Имена — из Storybook, состав — из прода.</strong> Story
          <code>Icons/ProjectIcon → Все возможные варианты</code> называет четыре
          проекта. Прод подтверждает состав числом: на десяти <code>dom.html</code>
          ${[...projectProd.values()].reduce((a, b) => a + b, 0)} узлов и ровно
          четыре разных фона, по ${[...new Set(projectProd.values())].join("/")}
          узлов на каждый. Имён прод не несёт — их даёт только Storybook.`,
  variants: projectVariants,
  note: `<strong>Варианты различаются только фоном.</strong> Путь глифа у всех
          четырёх один и тот же, и это не артефакт снимка: на 80 узлах прода
          встречается ровно одно значение <code>d</code>. То есть вариант — это
          цвет подложки под общей меткой, а не свой рисунок. Цвет
          <code>#346EF4</code> (courses) совпадает с переменной макета
          <code>--fig-blue-500-solid</code> в <code>ui/tokens-figma.css</code> —
          третий источник на то же значение. Класс <code>align-center</code> на
          корне стоит и здесь, в разметке Storybook: значит он в исходнике
          компонента, а не опечатка сборки — правила у него нет ни в одном
          источнике.`,
});

// ---------- вставка ----------
let html = fs.readFileSync(showcasePath, "utf8");
let added = 0;
for (const [id, block] of [["sprite-icon", spriteBlock], ["social-icon", socialBlock], ["project-icon", projectBlock]]) {
  const marker = `id="c-${id}"`;
  const start = html.indexOf(marker);
  if (start < 0) { console.warn(`секция c-${id} не найдена`); continue; }
  if (html.slice(start, html.indexOf("</section>", start)).includes("all-variants")) {
    console.log(`c-${id}: каталог уже стоит, пропуск`);
    continue;
  }
  // Каталог ставится последним блоком секции — перед её закрывающим тегом.
  const end = html.indexOf("\n    </section>", start);
  html = html.slice(0, end) + "\n" + block + html.slice(end);
  added++;
}
fs.writeFileSync(showcasePath, html, "utf8");
console.log(`Каталогов вставлено: ${added} (SpriteIcon ${spriteNames.length}, SocialIcon ${socialNames.length}, ProjectIcon ${projectNames.length} вариантов)`);
