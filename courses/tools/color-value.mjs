// Приведение значения цвета к одной записи для сверки по значению.
//
// Слой макета пишет цвет восьмизначным hex (#0000004d), продукт — как
// придётся: #fff, rgba(0,0,0,.3), #FF7E47. Сверка строкой считала #fff и
// #ffffff разными цветами и не узнавала rgba(0,0,0,.3) в #0000004d: из 80
// цветов макета «без двойника» числились 25, а на деле — один (R2-bulk,
// 11 сентября 2026). Поэтому сравнивается приведённое значение:
// #rrggbb для непрозрачного и #rrggbbaa для полупрозрачного, строчными.
// Не цвет — null.

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export function normColor(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    if (h.length === 8 && h.endsWith("ff")) h = h.slice(0, 6);
    return "#" + h;
  }
  m = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (m) {
    const [, r, g, b, aRaw] = m;
    let a = aRaw === undefined ? 1 : aRaw.endsWith("%") ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
    const rgb = "#" + hex2(+r) + hex2(+g) + hex2(+b);
    return a >= 1 ? rgb : rgb + hex2(a * 255);
  }
  return null;
}
