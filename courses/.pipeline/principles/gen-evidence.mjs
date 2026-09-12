// Таблицы «страница → значение» по 17 осям метода
// (.claude/guide/principles-axes.md, вне пакета) из axes.json.
// Выход: .pipeline/principles-evidence.md. Числа не пишутся руками — только
// отсюда; правила docs/guide/composition.md ссылаются на эти таблицы.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const d = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(d, "../..");
const A = JSON.parse(fs.readFileSync(path.join(d, "axes.json"), "utf8"));
const P = Object.keys(A);
const FAMILY = { "courses-listing": "листинг", "education-centers-listing": "листинг", "schools-for-children": "листинг", promocodes: "листинг", reviews: "листинг", rating: "таблица", "education-center": "сущность", authors: "промо-раздел", editors: "промо-раздел", author: "профиль" };
const px = (v) => (v == null ? "—" : String(v).replace("px", ""));
const rgb = (v) => ({ "rgb(255, 255, 255)": "#fff", "rgb(241, 241, 241)": "#f1f1f1", "rgba(0, 0, 0, 0)": "прозрачный" }[v] || v);
const table = (head, rows) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;
const votes = (pairs) => { const t = {}; for (const v of pairs) t[v] = (t[v] || 0) + 1; return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v} — ${n}`).join("; "); };
const sumObj = (key, w = 1440) => { const t = {}, pg = {}; for (const p of P) for (const [k, n] of Object.entries(A[p][w][key] || {})) { t[k] = (t[k] || 0) + n; pg[k] = (pg[k] || 0) + 1; } return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, n, pg[k]]); };

let md = `# Замеры по осям для принципов (R7)

Собрано \`.pipeline/principles/measure-axes.mjs\` → \`axes.json\` → этот файл
(\`gen-evidence.mjs\`). Каждая из десяти снятых страниц нарисована из
\`dom.html\` (на 375 — \`dom-375.html\`) с CSS корпуса, шрифтом Inter и снятым
атрибутом области видимости Vue, без скрипта, в окнах 1440×900, 1024×900,
768×900 и 375×812 (1024 и 768 добавлены после ревью R7 — \`principles/review-1.md\`).
Узлы записей — по селекторам переписи \`components/selector-census.json\`.

Семейства: ${[...new Set(Object.values(FAMILY))].map((f) => `${f} — ${P.filter((p) => FAMILY[p] === f).join(", ")}`).join("; ")}.
Промо-раздел \`editors\` — клон \`authors\`, листинги \`schools-for-children\`,
\`promocodes\`, \`reviews\` — варианты витрины организаций; в голосах они
считаются как страницы: так их считает инвентаризация («10/10»).

`;

// 1. Оболочка
md += `## 1. Оболочка\n\n` + table(["страница", "семейство", "шапка 1440 · 375", "липкая", "градиент шапки", "фон страницы", "контейнер · поле", "подвал", "hero 1440 · 375", "полоса рубрик"],
  P.map((p) => { const s = A[p][1440].shell, m = A[p][375].shell; return [p, FAMILY[p], `${s.headerH} · ${m.headerH}`, s.headerSticky === "sticky" ? "**да**" : "нет", s.headerGradient ? "да" : "нет", rgb(s.bodyBg), `${px(s.containerMax)} · ${px(s.containerPad)}`, `${rgb(s.footerBg)}, ${s.footerH} · ${m.footerH}`, `${s.hero ?? "—"} · ${m.hero ?? "—"}`, s.rubrication ? "**да**" : "нет"]; }));
md += `\nГолоса: шапка 64 на 1440 — ${P.filter((p) => A[p][1440].shell.headerH === 64).length}/10; на 375 — ${votes(P.map((p) => A[p][375].shell.headerH))}; липкая — ${P.filter((p) => A[p][1440].shell.headerSticky === "sticky").length}/10; контейнер 1124 + 24 — ${P.filter((p) => A[p][1440].shell.containerMax === "1124px" && A[p][1440].shell.containerPad === "24px").length}/10; подвал #f1f1f1 — ${P.filter((p) => A[p][1440].shell.footerBg === "rgb(241, 241, 241)").length}/10; hero — ${P.filter((p) => A[p][1440].shell.hero).length}/10.\n\n`;

{
  const W4 = [1440, 1024, 768, 375];
  const code = (l) => l.map((c) => "`" + c + "`").join(", ");
  md += `### По ширинам\n\nШапка и подвал (высота / колонки подвала), порядок блоков главной колонки, выход за колонку (в поле контейнера 24) и за сам контейнер. «Выход» — верхний узел, чей край за границей и которого не обрезает предок с \`overflow\`. Стрелки карусели (\`swiper-button-shadow\`) выходят за колонку половиной на всех ширинах и в таблице не повторяются.\n\n` +
    table(["страница", "шапка 1440 · 1024 · 768 · 375", "подвал 1440 · 1024 · 768 · 375", "порядок блоков", "за колонку (без стрелок)", "за контейнер"],
      P.map((p) => {
        const bl = W4.map((w) => [w, [...new Set((A[p][w].bleedColumn || []).filter((c) => !/swiper-button/.test(c)))]]).filter(([, l]) => l.length);
        return [p, W4.map((w) => A[p][w].shell.headerH).join(" · "), W4.map((w) => `${A[p][w].shell.footerH}/${A[p][w].footerCols}`).join(" · "),
          new Set(W4.map((w) => A[p][w].order)).size === 1 ? "один на 4 ширинах" : "**разный**",
          bl.map(([w, l]) => `${w}: ${code(l)}`).join("; ") || "—", W4.reduce((n, w) => n + (A[p][w].bleedContainer || []).length, 0)];
      }));
  md += `\nГолоса: порядок блоков один на четырёх ширинах — ${P.filter((p) => new Set(W4.map((w) => A[p][w].order)).size === 1).length}/10; за контейнер не выходит ни один узел — ${P.filter((p) => W4.every((w) => !(A[p][w].bleedContainer || []).length)).length}/10; подвал 4/4/3/1 колонки — ${P.filter((p) => W4.map((w) => A[p][w].footerCols).join() === "4,4,3,1").length}/10; шапка 64 на 1440, 1024 и 768 — ${P.filter((p) => [1440, 1024, 768].every((w) => A[p][w].shell.headerH === 64)).length}/10.\n\n`;
}

// 2. Сетка и 5. Ритм
md +=`## 2. Сетка\n\n` + table(["страница", "главная колонка", "сетки карточек 1440", "сетки 375"],
  P.map((p) => { const m = A[p][1440].main; return [p, m ? `${m.display}, промежуток ${px(m.rowGap)}` : "—", A[p][1440].grids.map((g) => `${g.cols} × ${g.colW}, промежуток ${px(g.colGap)} (${g.items})`).join("; ") || "—", A[p][375].grids.map((g) => `${g.cols} × ${g.colW}`).join("; ") || "—"]; }));
const grids = P.flatMap((p) => A[p][1440].grids.map((g) => `${g.cols} × ${g.colW} / ${px(g.colGap)}`));
md += `\nГолоса по сеткам карточек (сетка = голос): ${votes(grids)}.\n\nТе же сетки на остальных ширинах (колонки × ширина колонки):\n\n` +
  table(["страница", "1024", "768", "375"], P.filter((p) => A[p][1440].grids.length).map((p) => [p, ...[1024, 768, 375].map((w) => A[p][w].grids.map((g) => `${g.cols} × ${g.colW}`).join("; ") || "—")]));
for (const w of [1024, 768, 375]) md += `${w === 1024 ? "\nГолоса: " : "; "}${w} — ${votes(P.flatMap((p) => A[p][w].grids.map((g) => `${g.cols} кол.`)))}`;
md += ".\n\n";
{
  const c = P.map((p) => A[p][1440].carousel);
  const cc = c.reduce((n, x) => n + x.cards, 0), ct = c.reduce((n, x) => n + x.total, 0);
  md += `### Карусели\n\nКорни карточек внутри ленты Swiper (\`.swiper-wrapper\`). Раскладку ленты задаёт скрипт; без скрипта лента лежит в ряд за краем колонки и обрезана, поэтому ширина слайда и число видимых карточек здесь не измерены.\n\n` +
    table(["страница", "лент", "карточек в лентах · всего корней карточек"], P.map((p, i) => [p, c[i].swipers, `${c[i].cards} · ${c[i].total}`])) +
    `\nИтого ${cc} из ${ct} корней карточек на ${c.filter((x) => x.cards).length} страницах лежат в каруселях.\n\n`;
}

md += `## 5. Вертикальный ритм\n\n` + table(["страница", "промежуток колонки", "отступ колонки сверху · снизу", "фактические шаги между блоками"],
  P.map((p) => { const m = A[p][1440].main; return [p, m ? px(m.rowGap) : "—", m ? `${px(m.padTop)} · ${px(m.padBottom)}` : "—", m ? m.steps.join(", ") : "—"]; }));
md += `\nГолоса: промежуток главной колонки — ${votes(P.map((p) => px(A[p][1440].main?.rowGap)))}; отступ сверху — ${votes(P.map((p) => px(A[p][1440].main?.padTop)))}. Шаги меньше промежутка — блоки с отрицательным полем (\`-mb-6\` баннеров \`/courses\`, \`-mb-2\` сетки листингов, \`-mt-4\` слота adfox).\n\n`;

{
  md += `### Заголовок секции → содержимое\n\nКаждая видимая секция с \`h2\` (прямым или в первой обёртке); отбор по тегу, а не по селектору записи \`Section\`. «Промежуток» — \`row-gap\` родителя \`h2\`; «до блока» — от низа \`h2\` до следующего блока; «видимо» — до верха первого видимого содержимого (текст, картинка, рамка, заливка) с учётом обрезки предком. Так поле \`mt-4\` внутри карусели и промежуток \`gap-4\` глазу одинаковы.\n\n` +
    table(["страница", "h2", "промежуток", "до блока", "видимо"], P.flatMap((p) => A[p][1440].sectionHeadList.map((x) => [p, `«${x.h2}»`, px(x.gap), x.raw, x.visual])));
  const v = {};
  for (const p of P) for (const x of A[p][1440].sectionHeadList) { const k = Math.abs(x.visual - 16) <= 1 ? "16" : String(x.visual); v[k] = (v[k] || 0) + 1; }
  md += `\nГолоса («видимо», ±1): ${Object.entries(v).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} — ${n}`).join("; ")} из ${P.reduce((n, p) => n + A[p][1440].sectionHeadList.length, 0)} секций.\n\n`;
}

// 3. Поверхности, 4. Форма
md +=`## 3. Поверхности\n\nКорни карточек записей, все страницы (узлов):\n\n` + table(["карточка · рамка · фон · тень · радиус", "узлов"], sumObj("cardSurface").map(([k, n]) => [k, n]));
md += `\nТени — все видимые узлы с \`box-shadow\` (узлов, страниц):\n\n` + table(["узел", "узлов", "страниц"], sumObj("shadows").map(([k, n, g]) => [`\`${k}\``, n, g]));
md += `\nВсплывающие слои (панель сервисов с \`shadow-context-menu-dropdown\`) в снимке скрыты и в счёт не попали.\n\n`;
md += `## 4. Форма\n\n### Все видимые узлы с краем (1440)\n\nУзел с рамкой, с заливкой не белого цвета, с белой заливкой и скруглением (метка на обложке) или картинка — вне шапки и подвала. Класс формы: **пилюля или круг** — радиус не меньше половины короткой стороны (радиус 24 у метки высотой 24 глазу равен 9999); **плоскость** — от 200×60; **квадрат** — картинка или рамка с равными сторонами до 100 (логотипы и значки); остальное — **прочее**. У плоскости без своего радиуса указан радиус предка, который её обрезает.\n\n`;
{
  const G = {};
  const add = (g, k, p, ex) => { const o = ((G[g] = G[g] || {})[k] = G[g][k] || { n: 0, pg: new Set(), ex: {} }); o.n++; o.pg.add(p); o.ex[ex] = (o.ex[ex] || 0) + 1; };
  for (const p of P) for (const [k, r, w, h, c, cls] of A[p][1440].surfaceList) {
    const rv = parseFloat(r);
    const ex = "`" + cls.replace(/\.(h|w|min|max)-[^.]*|\.bg-gradient-[a-z]+/g, "").slice(0, 48) + "` " + `${w}×${h}`;
    if (rv > 0 && rv >= Math.min(w, h) / 2 - 0.5) add("пилюля или круг", `${k}, высота ${h}`, p, ex);
    else if (w >= 200 && h >= 60) add("плоскость", rv > 0 ? `${k}, свой радиус ${px(r)}` : `${k}, радиус 0, обрезает предок ${c ? px(c) : "— нет"}`, p, ex);
    else if (w === h && w <= 100 && (k === "картинка" || k === "рамка")) add("квадрат", `${w} → ${px(r)}`, p, ex);
    else add("прочее", `${k} · радиус ${px(r)} · высота ${h}`, p, ex);
  }
  for (const [g, o] of Object.entries(G)) {
    const tot = Object.values(o).reduce((a, b) => a + b.n, 0);
    md += `**${g}** — ${tot} узлов:\n\n` + table(["значение", "узлов", "страниц", "примеры"], Object.entries(o).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.pg.size, Object.entries(v.ex).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([e, n]) => `${n} × ${e}`).join("; ")])) + "\n";
  }
}
md += `### Корни записей\n\nРадиус корней записей (узлов, страниц):\n\n` + table(["запись · радиус", "узлов", "страниц"], sumObj("radius").map(([k, n, g]) => [k, n, g]));

// 6. Плотность, 7. Точка входа
md += `\n## 6. Плотность\n\nКарточки записей в первом экране (хотя бы наполовину), рекламные слайды не считаются — без скрипта лента Swiper раскладывается в ряд за экран:\n\n` + table(["страница", "1440×900", "375×812"],
  P.map((p) => { const f = (w) => { const b = A[p][w].firstScreen.byType; return Object.entries(b).filter(([k]) => k !== "ad-card").map(([k, n]) => `${k} ${n}`).join(", ") || "0"; }; return [p, f(1440), f(375)]; }));
md += `\n## 7. Точка входа\n\nСамый крупный кегль первого экрана и заголовок \`h1\`:\n\n` + table(["страница", "крупнейший текст 1440", "h1", "375"],
  P.map((p) => { const e = A[p][1440].entry, f = A[p][375].entry; return [p, `${e.biggestText.fs}px \`${e.biggestText.tag}\` «${e.biggestText.text}», y ${e.biggestText.y}`, e.h1 ? `${e.h1.fs}, y ${e.h1.y}` : "**нет**", `${f.biggestText.fs}px «${f.biggestText.text}»`]; }));

// 8. Акценты
md += `\n## 8. Акценты\n\nСчёт по всей странице на 1440 (тёмная кнопка — \`Button\` с фоном #2c2e34):\n\n` + table(["страница", "тёмных кнопок · в первом экране", "синий текст", "оранжевых бейджей", "жёлтых звёзд"],
  P.map((p) => { const a = A[p][1440].accents; return [p, `${a.darkButtons} · ${a.darkButtonsFirst}`, a.blueText, a.orange, a.yellowStars]; }));

{
  const hex = (k) => k.replace(/rgb\(44, 46, 52\)/, "#2c2e34").replace(/rgb\(241, 241, 241\)/, "#f1f1f1").replace(/rgb\(255, 255, 255\)/, "#fff").replace(/rgba\(0, 0, 0, 0\)/, "прозрачный");
  md += `\n### Синий и оранжевый по вычисленным цветам\n\nСиний — #346ef4 (\`ui-blue-500\`), оранжевый — #ff7e47 (\`ui-orange-500\`). Счёт по всем видимым узлам, включая шапку; фон и градиент отдельно от текста.\n\n` +
    table(["страница", "синий градиент и фон", "синий текст", "оранжевый фон · текст"], P.map((p) => {
      const h = A[p][1440].hues; const w = {};
      for (const x of h.blueWhere || []) { const k = x.replace(/ · [a-z0-9]+\..*$/, ""); w[k] = (w[k] || 0) + 1; }
      return [p, Object.entries(w).map(([k, n]) => `${k} ${n}`).join("; ") || "—",
        Object.entries(h.blueTextWhere || {}).map(([k, n]) => `${k.split(" · ")[0]} \`${k.split(" · ")[1].slice(0, 40)}\` ${n}`).join("; ") || "—", `${h.orangeBg} · ${h.orangeText}`];
    }));
  md += `\n«Фон · колонка» — значок проекта 24×24 в списке сервисов Хабра (цвет задан атрибутом \`style\` у каждого проекта). Оранжевый фон — ${P.reduce((n, p) => n + A[p][1440].hues.orangeBg, 0)} узлов, все с классом ${[...new Set(P.flatMap((p) => Object.keys(A[p][1440].hues.orangeWhere)))].map((c) => "`" + c + "`").join(", ")} (\`Badge\`).\n\n`;
  md += `### Где стоят тёмные кнопки\n\n` + table(["страница", "в карточке", "в форме поиска", "остальные"], P.map((p) => { const d = A[p][1440].darkWhere; return [p, d.card, d.search, d.other.join(", ") || "—"]; }));
  const t = {}; for (const p of P) for (const [k, n] of Object.entries(A[p][1440].allButtons)) t[k] = (t[k] || 0) + n;
  md += `\nВсе \`<button>\` по записи-хозяину и фону: ${Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${hex(k)} — ${n}`).join("; ")}. «прочее · #2c2e34» — выбранный \`FilterChip\` «Все»: селектор переписи описывает невыбранный. Запись \`Button\` бывает и \`<a>\` — поэтому здесь её меньше, чем в §10.\n\n`;
}

// 9. Иерархия текста
md +=`\n## 9. Иерархия текста\n\nКегль/насыщенность видимого текста вне шапки и подвала (узлов, страниц):\n\n` + table(["кегль / насыщенность", "узлов", "страниц"], sumObj("fontSizes").map(([k, n, g]) => [k, n, g]));
md += `\n` + table(["страница", "h1", "h2", "div.text-h2"], P.map((p) => { const h = A[p][1440].headings; return [p, h.h1.join(", ") || "—", h.h2.length ? `${[...new Set(h.h2)].join(", ")} ×${h.h2.length}` : "—", h.divH2]; }));

// 10. Основное действие
md += `\n## 10. Место основного действия\n\n` + table(["страница", "кнопок в hero", "кнопок в карточках", "тёмных · светлых кнопок", "секций с h2 · из них кончаются широкой кнопкой", "широкие кнопки (шире 300)"],
  P.map((p) => { const a = A[p][1440].actions, b = A[p][1440].buttonBg, e = A[p][1440].sectionEnds; return [p, a.heroForm, a.inCards, `${b["rgb(44, 46, 52)"] || 0} · ${b["rgb(241, 241, 241)"] || 0}`, `${e.total} · ${e.wideButton}`, a.fullWidthButtons.map((t) => `«${t}»`).join(", ") || "—"]; }));
{ const t = {}; for (const p of P) for (const [k, n] of Object.entries(A[p][1440].buttonBg)) t[k] = (t[k] || 0) + n; md += `\nФон кнопок \`Button\` по всем страницам: ${Object.entries(t).map(([k, n]) => `${k} — ${n}`).join(", ")}; других цветов нет.\n`; }

// 11. Группировка
md += `\n## 11. Группировка\n\n` + table(["страница", "hr", "разделителей «•»", "секций с h2"], P.map((p) => { const g = A[p][1440].grouping; return [p, g.hr, g.bullets, g.sectionsWithH2]; }));

// 12. Курсор
md += `\n## 12. Реакция на курсор\n\nhover-классы по ролям (узлов, страниц):\n\n` + table(["роль · класс", "узлов", "страниц"], sumObj("hover").map(([k, n, g]) => [`${k.split(" · ")[0]} · \`${k.split(" · ")[1]}\``, n, g]));
md += `\nКорни карточек с hover-классом: ${P.map((p) => `${p} ${A[p][1440].cardRootHover}`).join("; ")}.\n`;

// 13–14
md += `\n## 13. Обратная связь\n\n**Не снято.** Гость на десяти страницах не совершает действий: загрузки, успеха и ошибки в снимках нет. Скелетона карточки нет ни в разметке, ни в CSS (чанк \`course-card-skeleton\` его не содержит).\n\n## 14. Пустые состояния и ошибки\n\n**Не снято.** Все выдачи в снимке заполнены; 404 и отказ операции не снимались (BRIEF §4).\n`;

// 15–16
md += `\n## 15–16. Адаптив: что прячется и что меняет форму\n\nКлассы-переключатели в разметке (узлов, страниц):\n\n` + table(["класс", "узлов", "страниц"], sumObj("responsive").map(([k, n, g]) => [`\`${k}\``, n, g]));

// 17
md += `\n## 17. Тексты\n\n` + table(["страница", "дробь через точку", "через запятую", "знаков ₽", "разряды пробелом"], P.map((p) => { const t = A[p][1440].texts; return [p, t.decimals, t.decimalsComma, t.rub, t.thin]; }));
{
  const t = {}, S = {};
  for (const p of P) {
    for (const [side, o] of Object.entries(A[p][1440].numbers)) for (const [k, n] of Object.entries(o)) {
      const key = `${side === "spaced" ? "пробел" : "слитно"} · ${k}`;
      (t[key] = t[key] || { n: 0, pg: new Set() }).n += n; t[key].pg.add(p);
    }
    for (const [k, v] of Object.entries(A[p][1440].numberSamples || {})) (S[k] = S[k] || []).push(...v.map((x) => `${p}: «${x}»`));
  }
  md += `\n### Числа от тысячи\n\nКаждое число из четырёх цифр и больше в видимом тексте — с пробелом в разрядах или слитно. «Подпись» — короткий текст узла (до 40 знаков: цена, счётчик, ячейка таблицы), «фраза» — число внутри предложения (описание автора, заголовок статьи). Контекст — слово после числа; «год» — четыре цифры от 1991 до 2030.\n\n` +
    table(["разряды · где · контекст", "чисел", "страниц", "примеры"], Object.entries(t).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.pg.size, (S[k] || []).slice(0, 3).join("; ")])) + "\n";
}
{
  // Считаются вхождения и страницы, а не разные написания подписи: текст
  // промокода слипается с подписью («Открыть кодODE»), и счёт по разным
  // подписям давал «Открыть код 7» там, где это семь вариантов одной
  // подписи на одной странице (ревью R8, note 3).
  const btn = {}, btnPages = {};
  for (const p of P) for (const [text, n] of Object.entries(A[p][1440].buttonCounts || {})) { btn[text] = (btn[text] || 0) + n; btnPages[text] = (btnPages[text] || 0) + 1; }
  md += `\nПодписи кнопок — вхождений (страниц): ${Object.entries(btn).sort((a, b) => b[1] - a[1]).map(([k, n]) => `«${k}» ${n} (${btnPages[k]})`).join(", ")}.\n`;
}

fs.writeFileSync(path.join(pkg, ".pipeline/principles-evidence.md"), md, "utf8");
console.log(".pipeline/principles-evidence.md:", md.length, "символов");
