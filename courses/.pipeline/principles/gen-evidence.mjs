// Таблицы «страница → значение» по 17 осям principles-axes.md из axes.json.
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
атрибутом области видимости Vue, без скрипта, в окнах 1440×900 и 375×812.
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

// 2. Сетка и 5. Ритм
md += `## 2. Сетка\n\n` + table(["страница", "главная колонка", "сетки карточек 1440", "сетки 375"],
  P.map((p) => { const m = A[p][1440].main; return [p, m ? `${m.display}, промежуток ${px(m.rowGap)}` : "—", A[p][1440].grids.map((g) => `${g.cols} × ${g.colW}, промежуток ${px(g.colGap)} (${g.items})`).join("; ") || "—", A[p][375].grids.map((g) => `${g.cols} × ${g.colW}`).join("; ") || "—"]; }));
const grids = P.flatMap((p) => A[p][1440].grids.map((g) => `${g.cols} × ${g.colW} / ${px(g.colGap)}`));
md += `\nГолоса по сеткам карточек (сетка = голос): ${votes(grids)}. На 375 все сетки — одна колонка.\n\n`;

md += `## 5. Вертикальный ритм\n\n` + table(["страница", "промежуток колонки", "отступ колонки сверху · снизу", "фактические шаги между блоками"],
  P.map((p) => { const m = A[p][1440].main; return [p, m ? px(m.rowGap) : "—", m ? `${px(m.padTop)} · ${px(m.padBottom)}` : "—", m ? m.steps.join(", ") : "—"]; }));
md += `\nГолоса: промежуток главной колонки — ${votes(P.map((p) => px(A[p][1440].main?.rowGap)))}; отступ сверху — ${votes(P.map((p) => px(A[p][1440].main?.padTop)))}. Шаги меньше промежутка — блоки с отрицательным полем (\`-mb-6\` баннеров \`/courses\`, \`-mb-2\` сетки листингов, \`-mt-4\` слота adfox).\n\n`;

// 3. Поверхности, 4. Форма
md += `## 3. Поверхности\n\nКорни карточек записей, все страницы (узлов):\n\n` + table(["карточка · рамка · фон · тень · радиус", "узлов"], sumObj("cardSurface").map(([k, n]) => [k, n]));
md += `\nТени — все видимые узлы с \`box-shadow\` (узлов, страниц):\n\n` + table(["узел", "узлов", "страниц"], sumObj("shadows").map(([k, n, g]) => [`\`${k}\``, n, g]));
md += `\nВсплывающие слои (панель сервисов с \`shadow-context-menu-dropdown\`) в снимке скрыты и в счёт не попали.\n\n`;
md += `## 4. Форма\n\nРадиус корней записей (узлов, страниц):\n\n` + table(["запись · радиус", "узлов", "страниц"], sumObj("radius").map(([k, n, g]) => [k, n, g]));

// 6. Плотность, 7. Точка входа
md += `\n## 6. Плотность\n\nКарточки записей в первом экране (хотя бы наполовину), рекламные слайды не считаются — без скрипта лента Swiper раскладывается в ряд за экран:\n\n` + table(["страница", "1440×900", "375×812"],
  P.map((p) => { const f = (w) => { const b = A[p][w].firstScreen.byType; return Object.entries(b).filter(([k]) => k !== "ad-card").map(([k, n]) => `${k} ${n}`).join(", ") || "0"; }; return [p, f(1440), f(375)]; }));
md += `\n## 7. Точка входа\n\nСамый крупный кегль первого экрана и заголовок \`h1\`:\n\n` + table(["страница", "крупнейший текст 1440", "h1", "375"],
  P.map((p) => { const e = A[p][1440].entry, f = A[p][375].entry; return [p, `${e.biggestText.fs}px \`${e.biggestText.tag}\` «${e.biggestText.text}», y ${e.biggestText.y}`, e.h1 ? `${e.h1.fs}, y ${e.h1.y}` : "**нет**", `${f.biggestText.fs}px «${f.biggestText.text}»`]; }));

// 8. Акценты
md += `\n## 8. Акценты\n\nСчёт по всей странице на 1440 (тёмная кнопка — \`Button\` с фоном #2c2e34):\n\n` + table(["страница", "тёмных кнопок · в первом экране", "синий текст", "оранжевых бейджей", "жёлтых звёзд"],
  P.map((p) => { const a = A[p][1440].accents; return [p, `${a.darkButtons} · ${a.darkButtonsFirst}`, a.blueText, a.orange, a.yellowStars]; }));

// 9. Иерархия текста
md += `\n## 9. Иерархия текста\n\nКегль/насыщенность видимого текста вне шапки и подвала (узлов, страниц):\n\n` + table(["кегль / насыщенность", "узлов", "страниц"], sumObj("fontSizes").map(([k, n, g]) => [k, n, g]));
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
const btn = {}; for (const p of P) for (const b of A[p][1440].texts.buttons) btn[b.replace(/Открыть код.*/, "Открыть код")] = (btn[b.replace(/Открыть код.*/, "Открыть код")] || 0) + 1;
md += `\nПодписи кнопок (страниц): ${Object.entries(btn).sort((a, b) => b[1] - a[1]).map(([k, n]) => `«${k}» ${n}`).join(", ")}.\n`;

fs.writeFileSync(path.join(pkg, ".pipeline/principles-evidence.md"), md, "utf8");
console.log(".pipeline/principles-evidence.md:", md.length, "символов");
