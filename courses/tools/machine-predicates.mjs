// Измеряющая часть гейта machine/: один исполнитель предикатов, который
// работает в браузере на собранной странице витрины (шаг R8-03).
//
// Правило метода: предикат не отбирает узлы по тому классу, из которого
// проверяемое значение следует по построению. Утилита `.gap-4` печатает
// `gap:16px`, поэтому «взять section.gap-4 и убедиться, что row-gap 16» —
// проверка утилиты, а не правила. Узлы отбираются по тегу, роли или
// геометрии, мерится то, что утверждает правило (ревью R8, блокер B1).
//
// Функция сериализуется в страницу через page.evaluate, поэтому она
// самодостаточна: никаких внешних ссылок, только аргументы.
export function runPredicate({ p, CARDS, SEARCH }) {
  const vis = (e) => e.checkVisibility && e.checkVisibility({ visibilityProperty: true }) && e.getBoundingClientRect().width > 0;
  const cs = (e) => getComputedStyle(e);
  const q = (sel) => { try { return [...document.querySelectorAll(sel)].filter(vis); } catch (e) { return { error: String(e.message || e) }; } };
  const eq = (actual, expected) => (Array.isArray(expected) ? expected.includes(actual) : actual === expected);
  const px = (v) => parseFloat(v) || 0;
  const W = innerWidth;

  // главная колонка — самый высокий блок контейнера содержимого, найденный
  // по геометрии, а не по классу раскладки
  const columnOf = () => {
    const cands = [...document.querySelectorAll("div")].filter((d) => String(d.className).includes("max-w-[1124px]") && !d.closest("header") && !d.closest("footer"));
    return cands.flatMap((c) => [...c.children]).filter((e) => e.tagName === "DIV" && vis(e)).sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0] || null;
  };
  const containerOf = () => {
    const col = columnOf();
    return col ? col.parentElement : null;
  };
  const hasHero = () => !!document.querySelector("div.w-full.bg-main-gradient-second h1");
  // верх узла с учётом обрезки предками: обложка со scale-* видна не целиком
  const clippedTop = (x, stop) => {
    let t = x.getBoundingClientRect().top;
    for (let a = x.parentElement; a && a !== stop; a = a.parentElement) if (cs(a).overflowY !== "visible") t = Math.max(t, a.getBoundingClientRect().top);
    return t;
  };
  const isCard = (n) => CARDS.some((sel) => { try { return n.matches(sel); } catch { return false; } });
  // Обвязка витрины — не разметка продукта: заглушки каруселей и рамки
  // кадров несут классы с приставкой doc- (METHOD §6.2) и в замеры правил
  // не входят.
  const isChrome = (e) => !!(e.closest && e.closest("[class*='doc-']"));
  const edgeNodes = () => {
    const out = [];
    for (const e of document.querySelectorAll("body *")) {
      if (!vis(e) || e.closest("header") || e.closest("footer") || isChrome(e)) continue;
      const s = cs(e);
      const r = e.getBoundingClientRect();
      const bordered = px(s.borderTopWidth) > 0 && s.borderTopStyle !== "none";
      const filled = (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "rgb(255, 255, 255)") || /gradient/.test(s.backgroundImage);
      const whitePill = s.backgroundColor === "rgb(255, 255, 255)" && px(s.borderTopLeftRadius) > 0;
      if (!bordered && !filled && !whitePill && e.tagName !== "IMG") continue;
      out.push({ e, s, r, bordered, filled });
    }
    return out;
  };

  switch (p.type) {
    // --- оболочка --------------------------------------------------------
    case "containerBounds": {
      const col = columnOf();
      if (!col) return { bad: "главная колонка не найдена" };
      const container = col.parentElement;
      const box = container.getBoundingClientRect();
      const st = cs(container);
      const inner = { left: box.left + px(st.paddingLeft), right: box.right - px(st.paddingRight) };
      if (Math.round(box.width) > p.maxWidth + 1) return { bad: `контейнер ${Math.round(box.width)} шире ${p.maxWidth}` };
      if (W === 1440 && Math.abs(Math.round(inner.right - inner.left) - p.columnAt1440) > 1) return { bad: `колонка ${Math.round(inner.right - inner.left)} вместо ${p.columnAt1440}` };
      const cut = (e) => { for (let a = e.parentElement; a && a !== container; a = a.parentElement) { const as = cs(a); if (as.overflowX !== "visible" && as.overflowX !== "" && a.getBoundingClientRect().left >= box.left - 1 && a.getBoundingClientRect().right <= box.right + 1) return true; } return false; };
      const out = [...col.querySelectorAll("*")].filter((e) => {
        if (!vis(e) || cut(e)) return false;
        const r = e.getBoundingClientRect();
        return r.left < box.left - 1 || r.right > box.right + 1;
      });
      return out.length ? { bad: `за контейнер вышли ${out.length} узлов, первый — ${out[0].tagName}.${String(out[0].className).slice(0, 40)}` } : { ok: true, n: 1 };
    }
    case "heroHeading": {
      const hero = document.querySelector("div.w-full.bg-main-gradient-second");
      if (!hero) return { bad: "hero на странице нет" };
      const h1 = hero.querySelector("h1");
      if (!h1 || !vis(h1)) return { bad: "в hero нет видимого h1" };
      const want = p.expect[String(W)];
      const s = cs(h1);
      if (Math.round(px(s.fontSize)) !== want.fontSize) return { bad: `кегль h1 ${s.fontSize}, ожидался ${want.fontSize}` };
      if (Math.round(px(s.lineHeight)) !== want.lineHeight) return { bad: `интерлиньяж h1 ${s.lineHeight}, ожидался ${want.lineHeight}` };
      if (want.fontWeight && Math.round(px(s.fontWeight)) !== want.fontWeight) return { bad: `насыщенность h1 ${s.fontWeight}, ожидалась ${want.fontWeight}` };
      if (W === 1440 && s.textAlign !== "center") return { bad: `выравнивание h1 ${s.textAlign}` };
      const outside = [...document.querySelectorAll("h1")].filter((h) => vis(h) && !hero.contains(h) && Math.round(px(cs(h).fontSize)) === p.expect["1440"].fontSize);
      return outside.length ? { bad: `вне hero есть h1 того же кегля: ${outside.length}` } : { ok: true, n: 1 };
    }
    // --- сетка и ритм ----------------------------------------------------
    case "singleColumn": {
      const col = columnOf();
      if (!col) return { bad: "главная колонка не найдена" };
      const container = col.parentElement;
      const st = cs(container);
      const innerW = container.getBoundingClientRect().width - px(st.paddingLeft) - px(st.paddingRight);
      const colW = col.getBoundingClientRect().width;
      if (Math.abs(colW - innerW) > 2) return { bad: `колонка ${Math.round(colW)} уже контейнера ${Math.round(innerW)} — рядом что-то стоит` };
      const asides = [...document.querySelectorAll("aside")].filter(vis);
      if (asides.length) return { bad: `на странице ${asides.length} <aside>` };
      const colBox = col.getBoundingClientRect();
      const neighbours = [...container.children].filter((e) => e !== col && vis(e) && e.getBoundingClientRect().height > colBox.height / 3);
      return neighbours.length ? { bad: `рядом с колонкой стоит блок высотой ${Math.round(neighbours[0].getBoundingClientRect().height)}` } : { ok: true, n: 1 };
    }
    case "cardGrid": {
      // сетки отбираются по содержимому: прямые дети — корни карточек
      const grids = [...document.querySelectorAll("div")].filter((g) => {
        if (!vis(g) || cs(g).display !== "grid") return false;
        const kids = [...g.children].filter(vis);
        return kids.length >= 2 && kids.filter((k) => isCard(k) || [...k.children].some(isCard)).length >= 2;
      });
      if (!grids.length) return { skip: "сеток карточек на странице нет" };
      const bad = [];
      const wantCols = p.columnsByViewport ? p.columnsByViewport[String(W)] : p.columns;
      for (const g of grids) {
        const s = cs(g);
        const cols = s.gridTemplateColumns.split(" ").filter(Boolean);
        if (wantCols != null && cols.length !== wantCols) { bad.push(`${cols.length} колонок вместо ${wantCols}`); continue; }
        if (p.columnWidth) { const w = px(cols[0]); if (w < p.columnWidth[0] || w > p.columnWidth[1]) bad.push(`колонка ${Math.round(w)} вне ${p.columnWidth.join("…")}`); }
        if (p.columnGap != null && Math.round(px(s.columnGap)) !== p.columnGap) bad.push(`промежуток ${s.columnGap} вместо ${p.columnGap}`);
      }
      const allowed = p.allowExceptions || 0;
      return bad.length > allowed ? { bad: `${bad.length} сеток из ${grids.length}: ${bad.slice(0, 2).join("; ")}` } : { ok: true, n: grids.length };
    }
    case "columnRhythm": {
      const col = columnOf();
      if (!col) return { bad: "главная колонка не найдена" };
      const kids = [...col.children].filter(vis).map((e) => e.getBoundingClientRect()).sort((a, b) => a.top - b.top);
      if (kids.length < 2) return { skip: "в колонке меньше двух блоков" };
      const steps = kids.slice(1).map((b, i) => Math.round(b.top - (kids[i].top + kids[i].height)));
      const gap = Math.round(px(cs(col).rowGap));
      if (gap !== p.gap) return { bad: `промежуток колонки ${gap} вместо ${p.gap}` };
      // фактические шаги не больше промежутка: больше — значит между блоками
      // лежит что-то невидимое, и промежуток не описывает ритм
      const tooBig = steps.filter((s) => s > p.gap + 1);
      return tooBig.length ? { bad: `шаги больше промежутка: ${tooBig.slice(0, 3).join(", ")}` } : { ok: true, n: steps.length };
    }
    case "columnPadTop": {
      const col = columnOf();
      if (!col) return { bad: "главная колонка не найдена" };
      const want = hasHero() ? p.withHero : p.withoutHero;
      const actual = Math.round(px(cs(col).paddingTop));
      return actual === want ? { ok: true, n: 1 } : { bad: `отступ сверху ${actual} вместо ${want} (hero ${hasHero() ? "есть" : "нет"})` };
    }
    case "headingGap": {
      const rows = [];
      for (const sec of [...document.querySelectorAll("section")].filter(vis)) {
        const h = sec.querySelector(":scope > h2") || sec.querySelector(":scope > div > h2");
        if (!h || !vis(h)) continue;
        const sib = [...h.parentElement.children].filter(vis);
        const next = sib[sib.indexOf(h) + 1];
        if (!next) continue;
        let top = Infinity;
        for (const x of [next, ...next.querySelectorAll("*")]) {
          if (!vis(x)) continue;
          const xs = cs(x);
          const own = [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          const mark = own || x.tagName === "IMG" || x.tagName === "svg" || px(xs.borderTopWidth) > 0 || xs.backgroundColor !== "rgba(0, 0, 0, 0)";
          if (mark) top = Math.min(top, clippedTop(x, next.parentElement));
        }
        if (top === Infinity) continue;
        rows.push({ text: h.textContent.trim().slice(0, 32), gap: Math.round(top - h.getBoundingClientRect().bottom) });
      }
      if (!rows.length) return { skip: "секций с h2 нет" };
      // Исключение называется заголовком секции, а не числом: числовой допуск
      // «одно исключение» прощает любую испорченную секцию (мутация A).
      const excused = (t) => (p.allowHeadings || []).some((h) => t.startsWith(h));
      const bad = rows.filter((r) => Math.abs(r.gap - p.gap) > (p.tolerance || 0) && !excused(r.text));
      return bad.length
        ? { bad: `${bad.length} секций из ${rows.length} не держат ${p.gap}: ${bad.slice(0, 3).map((b) => `«${b.text}» ${b.gap}`).join("; ")}` }
        : { ok: true, n: rows.length };
    }
    // --- поверхности и форма ---------------------------------------------
    case "planeSurface": {
      const planes = edgeNodes().filter(({ r }) => r.width >= p.minWidth && r.height >= p.minHeight);
      if (!planes.length) return { skip: "плоскостей нет" };
      const shadow = planes.filter(({ s, e }) => s.boxShadow !== "none" && !String(e.className).includes("swiper-button-shadow"));
      if (shadow.length) return { bad: `плоскость с тенью: ${shadow.length}` };
      const bordered = planes.filter((x) => x.bordered);
      const wrongBorder = bordered.filter(({ s }) => Math.round(px(s.borderTopWidth)) !== 1 || (p.borderColor && s.borderTopColor !== p.borderColor));
      if (wrongBorder.length) return { bad: `${wrongBorder.length} плоскостей с рамкой не 1px ${p.borderColor || ""}: ${wrongBorder.slice(0, 2).map((x) => `${x.s.borderTopWidth} ${x.s.borderTopColor}`).join(", ")}` };
      const wrongRadius = bordered.filter(({ s }) => Math.round(px(s.borderTopLeftRadius)) !== p.radius);
      if (wrongRadius.length) return { bad: `${wrongRadius.length} плоскостей с рамкой скруглены не на ${p.radius}: ${wrongRadius.slice(0, 2).map((x) => x.s.borderTopLeftRadius).join(", ")}` };
      const tinted = bordered.filter(({ s }) => s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "rgb(255, 255, 255)");
      return tinted.length ? { bad: `${tinted.length} плоскостей с рамкой залиты цветом` } : { ok: true, n: planes.length };
    }
    case "shadowScope": {
      const bad = [];
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || isChrome(e)) continue;
        const s = cs(e);
        if (s.boxShadow === "none") continue;
        if (String(e.className).includes(p.allowedClass)) continue;
        bad.push(e.tagName + "." + String(e.className).slice(0, 30));
      }
      return bad.length ? { bad: `тень вне стрелок карусели: ${[...new Set(bad)].slice(0, 3).join(", ")}` } : { ok: true, n: 1 };
    }
    case "radiusByForm": {
      const nodes = edgeNodes();
      const skip = (e) => { try { return p.exceptSelector ? e.closest(p.exceptSelector) || e.matches(p.exceptSelector) : false; } catch { return false; } };
      if (p.form === "control") {
        const controls = nodes.filter(({ e, r }) => ["BUTTON", "A", "INPUT"].includes(e.tagName) && r.height >= p.heightRange[0] && r.height <= p.heightRange[1] && !skip(e));
        if (!controls.length) return { skip: "управляющих элементов нужной высоты нет" };
        // Пилюля больше не прощается: правило говорит «скругляется на 12»,
        // и кнопка-пилюля — ровно то нарушение (ревью R8, M9).
        const bad = controls.filter((x) => Math.round(px(x.s.borderTopLeftRadius)) !== p.radius);
        return bad.length ? { bad: `${bad.length} кнопок и полей из ${controls.length} скруглены не на ${p.radius}: ${bad.slice(0, 2).map((x) => `${x.e.tagName} ${x.s.borderTopLeftRadius} h${Math.round(x.r.height)}`).join(", ")}` } : { ok: true, n: controls.length };
      }
      if (p.form === "pill") {
        const small = nodes.filter(({ e, r }) => r.height <= p.maxHeight && r.height >= 8 && !(r.width === r.height && r.width <= 100) && !skip(e));
        if (!small.length) return { skip: "мелких элементов нет" };
        const bad = small.filter(({ s, r }) => px(s.borderTopLeftRadius) < Math.min(r.width, r.height) / 2 - 0.5);
        return bad.length ? { bad: `${bad.length} элементов из ${small.length} ниже 36 не пилюли: ${bad.slice(0, 3).map((x) => `${x.e.tagName}.${String(x.e.className).slice(0, 24)} r${x.s.borderTopLeftRadius} h${Math.round(x.r.height)}`).join("; ")}` } : { ok: true, n: small.length };
      }
      if (p.form === "square") {
        const squares = nodes.filter(({ e, r }) => Math.abs(r.width - r.height) < 1 && r.width <= p.maxSide && r.width >= 16 && (e.tagName === "IMG" || px(cs(e).borderTopWidth) > 0) && !skip(e));
        if (!squares.length) return { skip: "квадратных узлов нет" };
        // Предок, который обрезает угол своим скруглением: только он
        // оправдывает нулевой радиус у квадрата (ревью R8, M9).
        // Оправдание работает только для узла, который сам стоит в углу
        // обрезающего предка: логотип в середине карточки этим не прикрыт
        // (вторая итерация ревью R8).
        const clipRadius = (e) => {
          const r = e.getBoundingClientRect();
          for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
            const as = cs(a);
            if (as.overflow === "visible" || px(as.borderTopLeftRadius) === 0) continue;
            const ar = a.getBoundingClientRect();
            // предок обнимает узел со всех сторон: его скругление и есть
            // видимая форма (логотип в плашке 28×28), — либо узел стоит в
            // его углу (обложка карточки)
            const hugs = Math.abs(r.left - ar.left) <= 4 && Math.abs(r.right - ar.right) <= 4 && Math.abs(r.top - ar.top) <= 4 && Math.abs(r.bottom - ar.bottom) <= 4;
            const atCorner = (Math.abs(r.left - ar.left) < 2 || Math.abs(r.right - ar.right) < 2) && (Math.abs(r.top - ar.top) < 2 || Math.abs(r.bottom - ar.bottom) < 2);
            if (hugs || atCorner) return px(as.borderTopLeftRadius);
          }
          return 0;
        };
        const bad = squares.filter(({ e, s, r }) => {
          const rad = px(s.borderTopLeftRadius);
          if (rad >= r.width / 2 - 0.5) return false; // круг — фото человека
          // Нулевой радиус законен, только если предок режет угол не грубее,
          // чем требует само правило: обёртка с радиусом 1 больше не алиби
          // (третья итерация ревью R8, M17).
          if (rad === 0) return clipRadius(e) < r.width * p.ratio[0];
          const ratio = rad / r.width;
          return ratio < p.ratio[0] || ratio > p.ratio[1];
        });
        return bad.length ? { bad: `${bad.length} квадратов из ${squares.length} скруглены не на четверть: ${bad.slice(0, 3).map((x) => `${Math.round(x.r.width)} → ${x.s.borderTopLeftRadius}`).join(", ")}` } : { ok: true, n: squares.length };
      }
      return { skip: `форма ${p.form} не описана` };
    }
    case "colorScope": {
      const bgBad = [];
      const textBad = [];
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || isChrome(e)) continue;
        const s = cs(e);
        const r = e.getBoundingClientRect();
        if (s.backgroundColor === p.color && r.height > p.maxHeight) bgBad.push(`${e.tagName}.${String(e.className).slice(0, 24)} h${Math.round(r.height)}`);
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (own && s.color === p.color && !p.textAllowed) textBad.push(e.textContent.trim().slice(0, 20));
      }
      if (bgBad.length) return { bad: `цвет на узле выше ${p.maxHeight}: ${bgBad.slice(0, 2).join(", ")}` };
      return textBad.length ? { bad: `цветной текст: ${textBad.slice(0, 2).join(", ")}` } : { ok: true, n: 1 };
    }
    // --- адаптив ---------------------------------------------------------
    case "columns": {
      const nodes = q(p.selector);
      if (nodes.error) return { bad: `селектор не разобран: ${nodes.error}` };
      if (!nodes.length) return { skip: "узлов нет" };
      const want = typeof p.columns === "object" ? p.columns[String(W)] : p.columns;
      if (want == null) return { skip: "ширина не задана" };
      for (const n of nodes) {
        const cols = cs(n).gridTemplateColumns.split(" ").filter(Boolean).length;
        if (cols !== want) return { bad: `колонок ${cols}, ожидалось ${want}` };
      }
      return { ok: true, n: nodes.length };
    }
    case "order": {
      const col = columnOf();
      if (!col) return { skip: "колонка не найдена" };
      // Порядок берётся видимый, а не по дереву: правило запрещает
      // перестановку при сужении, а её делает `order` в CSS, которого
      // обход DOM не видит (ревью R8, B2).
      const kids = [...col.children]
        .filter(vis)
        .map((k) => ({ id: k.tagName + "." + String(k.className).split(" ").slice(0, 2).join(".") + "·" + (k.textContent || "").replace(/s+/g, " ").trim().slice(0, 24), r: k.getBoundingClientRect() }))
        .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left);
      return { ok: true, value: kids.map((k) => k.id).join(" | ") };
    }
    case "searchFormPhone": {
      // Форма одна, а рядов полей внутри два: ряд для широкого экрана и
      // дубль в одну колонку. На телефоне видимый ряд обязан быть
      // одноколоночным, а широкий — спрятанным.
      const forms = [...document.querySelectorAll(SEARCH)].filter(vis);
      if (!forms.length) return { skip: "формы поиска на странице нет" };
      let hiddenRows = 0;
      for (const f of forms) {
        const grids = [...f.querySelectorAll("div")].filter((d) => cs(d).display === "grid" || cs(d).display === "none");
        for (const g of grids) {
          const s = cs(g);
          if (s.display === "none") { hiddenRows++; continue; }
          if (!vis(g)) continue;
          const cols = s.gridTemplateColumns.split(" ").filter(Boolean).length;
          if (cols > 1) return { bad: `на телефоне видим ряд полей в ${cols} колонки` };
        }
      }
      if (!hiddenRows) return { bad: "спрятанного ряда полей на телефоне нет" };
      const oneColumn = forms.some((f) => [...f.querySelectorAll("div")].some((g) => vis(g) && cs(g).display === "grid" && cs(g).gridTemplateColumns.split(" ").filter(Boolean).length === 1));
      return oneColumn ? { ok: true, n: hiddenRows } : { bad: "видимого дубля полей в одну колонку нет" };
    }
    // --- тексты ----------------------------------------------------------
    case "text": {
      const hit = document.body.innerText.match(new RegExp(p.forbid, "g"));
      return hit ? { bad: `запрещённая форма: ${[...new Set(hit)].slice(0, 3).join(", ")}` } : { ok: true, n: 1 };
    }
    case "numberFormat": {
      const t = document.body.innerText;
      const bad = [];
      if (p.kind === "price") {
        // число перед знаком рубля: от тысячи оно обязано быть с пробелом
        for (const m of t.matchAll(/([\d  .,]{4,})\s?₽/g)) {
          const digits = m[1].replace(/[^\d]/g, "");
          if (digits.length >= 4 && !/[  ]/.test(m[1].trim())) bad.push(m[0].trim().slice(0, 20));
        }
      } else {
        const words = (p.words || []).join("|");
        for (const m of t.matchAll(new RegExp(`([\\d   ]{4,})\\s(${words})`, "g"))) {
          if (/[  ]/.test(m[1].trim())) bad.push(m[0].trim().slice(0, 24));
        }
        for (const m of t.matchAll(/\+([\d   ]{4,})/g)) {
          if (/[  ]/.test(m[1].trim())) bad.push("+" + m[1].trim().slice(0, 20));
        }
      }
      return bad.length ? { bad: `${bad.length} чисел не в формате: ${[...new Set(bad)].slice(0, 3).join(", ")}` } : { ok: true, n: 1 };
    }
    case "buttonLabels": {
      const BTN = "button.inline-flex.rounded-xl.font-semibold, a.inline-flex.rounded-xl.font-semibold";
      const all = q(BTN);
      if (all.error) return { bad: `селектор кнопок не разобран: ${all.error}` };
      const inCard = (b) => { for (let a = b.parentElement; a; a = a.parentElement) if (isCard(a)) return true; return false; };
      const list = all.filter((b) => (p.scope === "card" ? inCard(b) : !inCard(b)));
      if (!list.length) return { skip: `кнопок в области ${p.scope} нет` };
      const labels = [...new Set(list.map((b) => b.textContent.replace(/\s+/g, " ").trim()).filter(Boolean))];
      const bad = labels.filter((l) => {
        if ((p.allowed || []).includes(l)) return false;
        // \b в JS не видит кириллицу, поэтому окончание проверяется концом слова
        if (p.infinitive) return !/(ть|ти|чь)$/i.test(l.split(" ")[0]);
        return true;
      });
      return bad.length ? { bad: `подписи вне правила: ${bad.slice(0, 3).join(", ")}` } : { ok: true, n: labels.length };
    }
    // --- общие -----------------------------------------------------------
    case "style": {
      const nodes = q(p.selector);
      if (nodes.error) return { bad: `селектор не разобран: ${nodes.error}` };
      if (!nodes.length) return { skip: "узлов нет" };
      const expect = { ...(p.expect || {}), ...((p.expectByViewport || {})[String(W)] || {}) };
      const check = (n) => {
        const s = cs(n);
        for (const [prop, val] of Object.entries(expect)) {
          const actual = s.getPropertyValue(prop).trim();
          if (!eq(actual, val)) return `${prop}: ${actual}, ожидалось ${Array.isArray(val) ? val.join(" или ") : val}`;
        }
        for (const [prop, part] of Object.entries(p.expectMatch || {})) {
          const actual = s.getPropertyValue(prop).trim();
          if (!actual.includes(part)) return `${prop}: ${actual.slice(0, 40)}, ожидалось со словом ${part}`;
        }
        return null;
      };
      if (p.match === "any") return nodes.some((n) => !check(n)) ? { ok: true, n: nodes.length } : { bad: check(nodes[0]) };
      for (const n of nodes) { const why = check(n); if (why) return { bad: `${why} (узлов ${nodes.length})` }; }
      return { ok: true, n: nodes.length };
    }
    case "absent": {
      const nodes = q(p.selector);
      if (nodes.error) return { bad: `селектор не разобран: ${nodes.error}` };
      return nodes.length ? { bad: `найдено ${nodes.length} узлов` } : { ok: true, n: 0 };
    }
    case "textScale": {
      // Ведущая ступень текста колонки: правило говорит «основной текст —
      // 14/400», и это проверяется большинством, а не наличием h2.
      const count = {};
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || e.closest("header") || e.closest("footer") || isChrome(e)) continue;
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        const s = cs(e);
        const key = `${s.fontSize}/${s.fontWeight}`;
        count[key] = (count[key] || 0) + 1;
      }
      const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
      if (!sorted.length) return { skip: "текста нет" };
      // Ведущая ступень корпуса — 14/400 на восьми страницах из десяти, на
      // двух других она вторая. Проверяется поэтому вхождение в две самые
      // частые ступени, а не первое место: так предикат повторяет замер.
      const topN = sorted.slice(0, p.bodyInTop || 1).map((x) => x[0]);
      if (!topN.includes(p.body)) return { bad: `ступени текста ${sorted.slice(0, 3).map((x) => x.join(" ")).join(", ")}; ${p.body} не в первых ${p.bodyInTop || 1}` };
      const heads = q(p.headingSelector);
      if (heads.error) return { bad: `селектор заголовков не разобран: ${heads.error}` };
      if (!heads.length) return { skip: "заголовков секций нет" };
      for (const h of heads) {
        const s = cs(h);
        const key = `${s.fontSize}/${s.lineHeight}/${s.fontWeight}`;
        if (key !== p.heading) return { bad: `заголовок секции ${key}, ожидался ${p.heading}` };
      }
      return { ok: true, n: heads.length };
    }
    case "fontScale": {
      const bad = [];
      for (const e of document.querySelectorAll("body *")) {
        if (!vis(e) || e.closest("header") || e.closest("footer") || isChrome(e)) continue;
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        const size = cs(e).fontSize;
        if (px(size) > p.min && !p.allowed.includes(size)) bad.push(`${size} «${e.textContent.trim().slice(0, 20)}»`);
      }
      return bad.length ? { bad: `кегль вне шкалы: ${[...new Set(bad)].slice(0, 3).join("; ")}` } : { ok: true, n: 1 };
    }
    default:
      return { skip: `тип ${p.type} не исполняется` };
  }
}
