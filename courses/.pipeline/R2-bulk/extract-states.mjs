// Извлечение разметки состояний, которые отличаются от default самой разметкой,
// а не только классом-модификатором. Селекторы взяты дословно из цитат
// components/STATE-CAPTURE.md §3 — там для каждой пары «запись × состояние»
// уже названо, чем именно она снята.
//
// Состояния, снятые классом (`hover:*`, `focus-visible:*`, `disabled:*`),
// сюда не идут: их показывает живой элемент, который уже стоит на витрине.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const pagesDir = path.join(pkg, "evidence/source/production/pages");
const pages = fs.readdirSync(pagesDir).filter((p) => fs.existsSync(path.join(pagesDir, p, "dom.html")));

// id · состояние · селектор · чем обоснован (цитата STATE-CAPTURE §3)
const TARGETS = [
  {
    id: "filter-chip", state: "selected",
    selector: "button.h-9.rounded-full.border.bg-ui-black-850.text-ui-white",
    why: "прямая выписка STATE-CAPTURE §3: selected — bg-ui-black-850 text-ui-white border-ui-black-850, 5 узлов на 5 страницах",
  },
  {
    id: "segmented-control", state: "current",
    selector: "a[aria-current='page'].router-link-active",
    why: "STATE-CAPTURE §3: aria-current=\"page\" + router-link-active router-link-exact-active … bg-ui-black-850 против default без bg-*, 4/4 вхождения",
  },
  {
    id: "avatar", state: "empty",
    selector: "img[src*='user_avatar_2.svg']",
    why: "STATE-CAPTURE §3: fallback user_avatar_2.svg ×23 (плюс career/assets/defaults/avatars/user-*.png ×15), 6/10 страниц",
  },
  {
    // Button снят в витрине как <a> (селектор переписи покрывает обе формы),
    // а атрибут disabled работает только на настоящем элементе формы. Поэтому
    // для этого состояния берётся <button> — он в корпусе есть.
    id: "button", state: "disabled",
    selector: "button.inline-flex.rounded-xl.font-semibold",
    addAttr: "disabled",
    why: "STATE-CAPTURE §3: disabled:pointer-events-none disabled:border-ui-black-150 disabled:bg-ui-black-150 disabled:text-ui-white, 191/191. Атрибут disabled на образце проставлен витриной — сам по себе он и включает эти правила",
  },
  {
    // У IconButton атрибут стоит в самом продукте, дописывать нечего.
    id: "icon-button", state: "disabled",
    // Отключённая стрелка карусели не несёт ни swiper-button-shadow, ни
    // rounded-full — то есть селектор переписи IconButton (32 узла) её
    // не покрывает. Это факт разметки, а не подгонка: адресуется атрибутом.
    selector: "button[disabled][rel='prev']",
    why: "STATE-CAPTURE §3: буквальный атрибут disabled=\"\" ×4 (стрелка rel=\"prev\" карусели) + !text-ui-black-200 !hover:text-ui-black-200",
  },
  {
    id: "entity-logo", state: "empty",
    selector: "img[src*='avatars/logo.svg'], img[src*='empty-edu-center_2.svg']",
    why: "STATE-CAPTURE §3: fallback avatars/logo.svg ×10 + empty-edu-center_2.svg ×4",
  },
];

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const out = {};
for (const t of TARGETS) {
  let hit = null;
  for (const pg of pages) {
    await page.goto("file:///" + path.join(pagesDir, pg, "dom.html").replaceAll("\\", "/"));
    const data = await page.evaluate(([sel]) => {
      const nodes = document.querySelectorAll(sel);
      if (!nodes.length) return null;
      const n = nodes[0];
      const classes = new Set();
      const walk = (x) => { if (x.classList) for (const c of x.classList) classes.add(c); for (const ch of x.children) walk(ch); };
      walk(n);
      return { html: n.outerHTML, count: nodes.length, classes: [...classes] };
    }, [t.selector]);
    if (data) { hit = { ...data, page: pg }; break; }
  }
  if (!hit) { console.log(`${t.id}/${t.state}: НЕ НАЙДЕН по ${t.selector}`); continue; }
  // Сколько всего по корпусу — чтобы подпись несла измеренное число, а не «есть».
  let total = 0, seen = 0;
  for (const pg of pages) {
    await page.goto("file:///" + path.join(pagesDir, pg, "dom.html").replaceAll("\\", "/"));
    const n = await page.evaluate(([sel]) => document.querySelectorAll(sel).length, [t.selector]);
    total += n; if (n) seen++;
  }
  // Ищется именно АТРИБУТ, а не подстрока: у Button в классах стоит
  // `disabled:pointer-events-none`, и проверка на слово `disabled` нашла бы
  // его там и решила, что атрибут уже есть. Атрибут — после пробела и перед
  // `=`, пробелом или концом тега.
  if (t.addAttr) {
    const head = hit.html.slice(0, hit.html.indexOf(">") + 1);
    const hasAttr = new RegExp("\\s" + t.addAttr + "(?=[=\\s>])").test(head);
    if (!hasAttr) {
      hit.html = hit.html.replace(/^(<[a-z]+)/, `$1 ${t.addAttr}`);
      hit.attrAdded = true;
    }
  }
  out[`${t.id}/${t.state}`] = { ...t, ...hit, total, seen };
  console.log(`${t.id}/${t.state}`.padEnd(28) + `${total} узлов на ${seen}/10 страниц, пример со страницы ${hit.page}, ${hit.classes.length} классов`);
}
await browser.close();
fs.writeFileSync(path.join(d, "states-markup.json"), JSON.stringify(out, null, 1), "utf8");
