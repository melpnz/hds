#!/usr/bin/env node
// Механическая проверка набора: node assets/icons/check.mjs
//
// Что проверяется по каждому SVG:
//   1. файл разбирается строгим токенайзером (сбалансированные теги,
//      все атрибуты в двойных кавычках, единственный корень <svg>);
//   2. корневой viewBox = "0 0 48 48", на корне нет width/height;
//   3. нигде в файле нет rx/ry — скругление не вшито;
//   4. нигде нет clipPath / clip-path — обтравки не осталось;
//   5. первым идёт фоновый <rect width="48" height="48"> с заливкой;
//   6. у каждого <path> есть fill — свой или унаследованный от <g>;
//   7. файл автономен: без <image>, <script>, <style> и внешних ссылок.
// Плюс сверка с manifest.json: пути существуют, цвет фона совпадает
// с заливкой в файле, состав файлов и записей манифеста совпадает.
//
// Зависимостей нет. Выход: 0 — всё сошлось, 1 — есть падения.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const fails = [];
const fail = (file, msg) => fails.push(`${file}: ${msg}`);

function tokenize(svg) {
  const tokens = [];
  const re = /<\/?([A-Za-z][\w:-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>/g;
  let m;
  let last = 0;
  while ((m = re.exec(svg))) {
    const between = svg.slice(last, m.index);
    if (between.trim()) throw new Error(`текст между тегами: ${JSON.stringify(between.trim().slice(0, 40))}`);
    last = m.index + m[0].length;
    const attrs = {};
    const are = /([\w:.-]+)="([^"]*)"/g;
    let a;
    while ((a = are.exec(m[2]))) attrs[a[1]] = a[2];
    tokens.push({ name: m[1], attrs, closing: m[0].startsWith('</'), self: m[3] === '/' });
  }
  if (svg.slice(last).trim()) throw new Error('текст после последнего тега');
  if (!tokens.length) throw new Error('тегов не найдено');
  return tokens;
}

const files = [];
for (const group of fs.readdirSync(DIR, { withFileTypes: true })) {
  if (!group.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(DIR, group.name))) {
    if (f.endsWith('.svg')) files.push(`${group.name}/${f}`);
  }
}
files.sort();

for (const rel of files) {
  const svg = fs.readFileSync(path.join(DIR, rel), 'utf8');

  let tokens;
  try {
    tokens = tokenize(svg);
  } catch (e) {
    fail(rel, `не разбирается — ${e.message}`);
    continue;
  }

  // 1. баланс тегов и единственный корень
  const stack = [];
  let rootsClosed = 0;
  for (const t of tokens) {
    if (t.closing) {
      const open = stack.pop();
      if (!open) { fail(rel, `лишний </${t.name}>`); break; }
      if (open !== t.name) { fail(rel, `</${t.name}> закрывает <${open}>`); break; }
      if (!stack.length) rootsClosed++;
    } else if (!t.self) {
      stack.push(t.name);
    } else if (!stack.length) {
      rootsClosed++;
    }
  }
  if (stack.length) fail(rel, `не закрыты теги: ${stack.join(', ')}`);
  if (rootsClosed !== 1) fail(rel, `корневых элементов: ${rootsClosed}, ожидался 1`);

  const root = tokens[0];
  if (root.name !== 'svg' || root.closing) fail(rel, 'корень не <svg>');

  // 2. холст
  if (root.attrs.viewBox !== '0 0 48 48') fail(rel, `viewBox="${root.attrs.viewBox}", ожидался "0 0 48 48"`);
  if ('width' in root.attrs || 'height' in root.attrs) fail(rel, 'на корне есть width/height — размер должен задаваться при подключении');

  // 3-4. скругление и обтравка
  for (const t of tokens) {
    if ('rx' in t.attrs || 'ry' in t.attrs) fail(rel, `<${t.name}> со вшитым скруглением (rx/ry)`);
    if ('clip-path' in t.attrs) fail(rel, `<${t.name}> с clip-path`);
    if (t.name === 'clipPath') fail(rel, 'в файле остался <clipPath>');
  }

  // 5. фон
  const drawn = tokens.filter((t) => !t.closing && !['svg', 'defs', 'radialGradient', 'linearGradient', 'stop'].includes(t.name));
  const insideDefs = new Set();
  let defsDepth = 0;
  for (const t of tokens) {
    if (t.name === 'defs') { defsDepth += t.closing ? -1 : 1; continue; }
    if (defsDepth > 0) insideDefs.add(t);
  }
  const first = drawn.filter((t) => !insideDefs.has(t))[0];
  if (!first) fail(rel, 'нет ни одного рисуемого элемента');
  else if (first.name !== 'rect') fail(rel, `первым рисуется <${first.name}>, а не фоновый <rect>`);
  else if (first.attrs.width !== '48' || first.attrs.height !== '48') fail(rel, `фон ${first.attrs.width}×${first.attrs.height}, а не 48×48`);
  else if (first.attrs.x || first.attrs.y) fail(rel, 'фон смещён от начала холста');
  else if (!first.attrs.fill) fail(rel, 'у фона нет заливки');

  // 6. заливка знака
  const gFill = [];
  for (const t of tokens) {
    if (t.name === 'g') {
      if (t.closing) gFill.pop();
      else if (!t.self) gFill.push(t.attrs.fill);
      continue;
    }
    if (t.name === 'path' && !t.closing && !t.attrs.fill && !gFill.some(Boolean)) {
      fail(rel, '<path> без fill и без унаследованного fill');
    }
  }

  // 7. автономность
  for (const t of tokens) {
    if (['image', 'script', 'style', 'use', 'foreignObject'].includes(t.name)) fail(rel, `запрещённый элемент <${t.name}>`);
    for (const [k, v] of Object.entries(t.attrs)) {
      if ((k === 'href' || k === 'xlink:href' || k === 'src') && !v.startsWith('#')) fail(rel, `внешняя ссылка в ${k}="${v}"`);
    }
  }
  if (/<!\[CDATA|@import|url\((?!#)/.test(svg)) fail(rel, 'внешний ресурс или CSS-импорт в теле файла');
}

// сверка с манифестом
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'manifest.json'), 'utf8'));
const listed = [];
for (const [gid, group] of Object.entries(manifest.groups)) {
  for (const [id, icon] of Object.entries(group.icons)) {
    listed.push(icon.path);
    const abs = path.join(DIR, icon.path);
    if (!fs.existsSync(abs)) { fail('manifest.json', `${gid}/${id}: файла ${icon.path} нет`); continue; }
    if (!icon.path.startsWith(gid + '/')) fail('manifest.json', `${gid}/${id}: путь ${icon.path} не в своей папке`);
    if (icon.viewBox !== manifest.viewBox) fail('manifest.json', `${gid}/${id}: viewBox расходится с общим`);
    const svg = fs.readFileSync(abs, 'utf8');
    const bg = svg.match(/<rect width="48" height="48" fill="([^"]+)"\/>/);
    if (!bg) fail('manifest.json', `${gid}/${id}: в файле не найден фоновый rect`);
    else if (icon.background === 'gradient') {
      if (!bg[1].startsWith('url(#')) fail('manifest.json', `${gid}/${id}: заявлен градиент, в файле ${bg[1]}`);
    } else if (bg[1] !== icon.background) {
      fail('manifest.json', `${gid}/${id}: background ${icon.background}, в файле ${bg[1]}`);
    }
  }
}
const missing = files.filter((f) => !listed.includes(f));
if (missing.length) fail('manifest.json', `не описаны файлы: ${missing.join(', ')}`);

console.log(`Проверено файлов: ${files.length}; записей в манифесте: ${listed.length}.`);
if (fails.length) {
  console.error(`\nПадений: ${fails.length}`);
  for (const f of fails) console.error('  ' + f);
  process.exit(1);
}
console.log('Все проверки пройдены.');
