import fs from "node:fs";

// minor 11: разделитель join() записан в tools/validate-components.mjs сырым
// управляющим символом NUL вместо escape-последовательности "\0". Node файл
// читает, node --check проходит, git строит текстовый diff — но `file` зовёт
// его data, а grep и ripgrep без -a молча пропускают. Самый большой инструмент
// пакета выпадает из текстового поиска по tools/. Поведение не меняется.

const target = "d:/work/guides/courses/tools/validate-components.mjs";
const NUL = String.fromCharCode(0);
const source = fs.readFileSync(target, "utf8");
const before = source.split(NUL).length - 1;
fs.writeFileSync(target, source.split(NUL).join("\\0"));
const after = fs.readFileSync(target, "utf8").split(NUL).length - 1;
console.log(`Сырых NUL было ${before}, стало ${after}.`);
