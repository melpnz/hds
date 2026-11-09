// Снимает страницу на заданных ширинах и в заданных состояниях:
// полный скриншот (или экран) + видимые элементы с вычисленными стилями, координатами и DOM-путём.
//
// node capture.mjs --url <url> --out <dir> [--widths 1024,744,320] [--scenario states.json]
//                  [--auth auth.json] [--prefix page] [--pause мс] [--block-analytics] [--keep-fixed-bottom] [--verbose]
//                  [--max-height px]  — снимать только верх страницы (длинные ленты); элементы ниже отбрасываются
//                  [--freeze]         — fixed/sticky → absolute/relative перед снимком (редко нужно)
//                  [--profile file | --no-profile] [--states default,filter]
//                  [--height px | --heights 1024:812,768:1000,320:568 | --vh-from <run>/figma] — высота экрана (по умолч. 900)
//                  [--cookie "name=value; name2=value2"] — cookie для всех состояний (A/B-группа и т. п.)
//                  [--auth-marker "<селектор>"] — есть только у вошедшего (аватар): иначе «⚠ вход не выполнен»
//                  [--measure measure.json] — перепроверка: [{sel, props}] замерить и невидимые контейнеры (→ "measured")
// У состояния: "cookies": {"abc_test_group": "b"} — варианты A/B одним запуском; "fullPage": false — только экран
// (плашки у нижнего края: вместе с --keep-fixed-bottom и высотой экрана как в макете).
// Шаг waitFor: { "waitFor": ".sticky", "timeout": 60000 } — для медленных страниц.
// Профиль сайта profiles/<домен>.json подхватывается автоматически (настройки и сценарий для этого сайта).
// Длинные страницы (> 12 000 px) снимаются кусками и склеиваются — иначе Chromium теряет блоки.
// Каждое состояние на каждой ширине — отдельная загрузка страницы (состояния не влияют друг на друга).
// Ширины × состояния × 2 окружения быстро набирают десятки загрузок; для чувствительных сайтов — --pause 3000.
//
// Файлы: <prefix>-<w>.png/.json для состояния default, <prefix>-<w>-<state>.png/.json для остальных.
// Сценарий (все поля необязательны):
// {
//   "css": "дополнительный CSS для всех состояний",
//   "hide": [".cookie-banner"],                  // скрыть перед съёмкой (место остаётся)
//   "remove": [".header-banner-wrapper"],        // убрать из потока (место не остаётся)
//   "states": [
//     { "name": "default" },
//     { "name": "search", "steps": [
//         { "fill": ["input[placeholder='Искать по профессиям']", "дизайн"] },
//         { "click": "text=Найти профессии" }, { "wait": 1500 } ] },
//     { "name": "scroll", "fullPage": false, "steps": [ { "scroll": 800 } ] }
//   ]
// }
// Шаги: click (+ trial: true — пробный, без действия), select [sel, value] (нативный <select>), fill [sel, value], type [sel, text] (посимвольно — для автодополнения), press [sel, key], hover,
//       scroll (px), wait (мс), waitFor (селектор), goto (url), css (строка).
//       Модификаторы шага: widths [744, 320] — только на этих ширинах; optional: true — не прерывать при ошибке.
// Селекторы — Playwright: css, "text=…", "button:has-text('…')"; берётся первый ВИДИМЫЙ элемент.
// Если шаг упал, состояние помечается «НЕ ДОСТИГНУТО» (stepErrors в json) — такие снимки не сравнивать.
import { chromium } from 'playwright';
import { captureDetails } from './capture-details.mjs';
import fs from 'node:fs/promises';
import { statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
// Старый позиционный вызов: capture.mjs <url> <outDir> [widths]
const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
const url = args.url || pos[0], outDir = args.out || pos[1];
if (!url || !outDir) { console.error('usage: capture.mjs --url <url> --out <dir> [--widths 1024,744,320] [--scenario file] [--auth auth.json] [--prefix page]'); process.exit(1); }
// Профиль сайта: profiles/<домен>.json в папке скилла (или --profile <файл>). Даёт значения флагов по умолчанию
// ({"args": {"block-analytics": true, "max-height": 4500}}) и сценарий состояний ({"scenario": {...}}).
// Флаги из командной строки важнее профиля; --no-profile — не применять.
const skillDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let profile = null;
if (!args['no-profile']) {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  // поддомены стенда (epic-career-13702.career.habratest.net) — профиль родительского домена (career.habratest.net)
  const parts = host.split('.'), cands = parts.map((_, i) => parts.slice(i).join('.')).filter(h => h.includes('.'));
  const found = cands.map(h => path.join(skillDir, 'profiles', h + '.json')).find(f => { try { return statSync(f).isFile(); } catch { return false; } });
  const pf = typeof args.profile === 'string' ? args.profile : found || path.join(skillDir, 'profiles', host + '.json');
  try { profile = JSON.parse(await fs.readFile(pf, 'utf8')); console.log(`профиль: ${path.basename(pf)}${profile.notes ? ' — ' + profile.notes : ''}`); }
  catch (e) { if (typeof args.profile === 'string') throw new Error(`Не прочитан профиль ${pf}: ${e.message}`); }
  for (const [k, v] of Object.entries(profile?.args || {})) if (!(k in args)) args[k] = v;
}
const widths = String(args.widths || (args.url ? '1024,744,320' : pos[2] || '1024,744,320')).split(',').map(Number);
const prefix = args.prefix || 'page';
// --measure <json>: [{ sel, props: [...] }] — что замерить для перепроверки (пишет recheck.mjs plan)
const MEASURE = args.measure ? JSON.parse(readFileSync(args.measure, 'utf8')) : null;
const scenario = args.scenario ? JSON.parse(await fs.readFile(args.scenario, 'utf8')) : (profile?.scenario || {});
// remove/hide/css из профиля сайта действуют и со своим сценарием (глобальный баннер стенда, виджеты)
if (args.scenario && profile?.scenario) for (const k of ['remove', 'hide']) if (profile.scenario[k]?.length) scenario[k] = [...new Set([...(profile.scenario[k]), ...(scenario[k] || [])])];
if (args.scenario && profile?.scenario?.css) scenario.css = profile.scenario.css + (scenario.css || '');
// --states default,filter — снять только эти состояния из сценария/профиля
if (args.states && scenario.states) scenario.states = scenario.states.filter(s => String(args.states).split(',').includes(s.name));
const states = scenario.states?.length ? scenario.states : [{ name: 'default' }];
await fs.mkdir(outDir, { recursive: true });

const KEEP = ['color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'border-top-width', 'border-top-color', 'border-top-style', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-radius', 'box-shadow', 'opacity',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'gap',
  'width', 'height', 'max-width', 'box-sizing', 'transform', 'zoom', 'outline-width', 'outline-color', 'flex-direction', 'grid-template-columns', 'display', 'text-transform', 'text-decoration-line', 'text-overflow', '-webkit-line-clamp', 'object-fit', 'object-position'];

// На адаптивных страницах часто есть скрытые дубли (мобильная и десктопная версии) — берём только видимый элемент.
const vis = (page, sel) => page.locator(sel + ' >> visible=true').first();
// Клик, который не застревает, если элемент перекрыт обёрткой (частый случай у кастомных полей и комбобоксов).
async function click(loc) {
  try { await loc.click({ timeout: 5000 }); } catch { await loc.click({ timeout: 5000, force: true }); }
}
async function runStep(page, s) {
  // trial: true — пробный клик (проверить, что элемент есть и кликабелен) без действия: перед разовыми действиями
  if (s.click && s.trial) await vis(page, s.click).click({ trial: true, timeout: 10000 });
  else if (s.click) await click(vis(page, s.click));
  else if (s.select) await vis(page, s.select[0]).selectOption(String(s.select[1]), { timeout: 10000 }); // нативный <select>
  else if (s.fill) await vis(page, s.fill[0]).fill(s.fill[1], { timeout: 10000 });
  else if (s.type) { await click(vis(page, s.type[0])); await page.keyboard.type(s.type[1], { delay: 40 }); }
  else if (s.press) await vis(page, s.press[0]).press(s.press[1], { timeout: 10000 });
  else if (s.hover) await vis(page, s.hover).hover({ timeout: 10000 });
  else if (s.scroll !== undefined) await page.evaluate(y => window.scrollTo(0, y), s.scroll);
  else if (s.wait) await page.waitForTimeout(s.wait);
  // страница может грузиться 30–45 с (плашка появляется с задержкой) — у шага свой timeout, по умолчанию 15 с
  else if (s.waitFor) await page.locator(s.waitFor).first().waitFor({ timeout: s.timeout || 15000 });
  else if (s.goto) await page.goto(s.goto, { waitUntil: 'load', timeout: 60000 });
  else if (s.css) await page.addStyleTag({ content: s.css });
}

// Отладка: DR_SKIP=scrollpass,style,finish,hidefixed — пропустить шаги съёмки, чтобы найти, какой из них ломает страницу.
const SKIP = new Set(String(process.env.DR_SKIP || '').split(',').filter(Boolean));
// --cdp http://127.0.0.1:9222 — снимать в уже запущенном Chrome пользователя (chrome.mjs): закрытые зоны, SSO, 2FA.
// Работаем в его основном контексте (там сессия), открываем свои вкладки и закрываем только их.
// без адреса: Chrome может слушать только IPv6 (::1) — берём тот, что отвечает
const cdp = typeof args.cdp === 'string' ? args.cdp : args.cdp ? (await (async () => { for (const u of ['http://127.0.0.1:9222', 'http://[::1]:9222']) if (await fetch(u + '/json/version').then(r => r.ok).catch(() => false)) return u; return 'http://127.0.0.1:9222'; })()) : null;
// Высота экрана: --height N, --heights 1024:812,768:1000 или --vh-from <папка figma> (frames.json: высота фреймов
// размером с экран — мобильные/планшетные экраны, плашки внизу); иначе 900. Важно для fixed/sticky у нижнего края.
const heights = {};
for (const pr of String(args.heights || '').split(',').filter(Boolean)) { const [w, h] = pr.split(':').map(Number); if (w && h) heights[w] = h; }
if (args['vh-from']) { try { const fr = JSON.parse(await fs.readFile(path.join(args['vh-from'], 'frames.json'), 'utf8')); for (const f of fr.frames || []) if (f.h && f.h <= 1400 && !heights[f.w] && (!f.state || f.state === 'default')) heights[f.w] = f.h; } catch (e) { console.error('--vh-from: не прочитан frames.json — ' + e.message); } }
const vh = w => heights[w] || Number(args.height) || 900;
// Cookie: --cookie "name=value; name2=value2" — для всех состояний (A/B-группа); у состояния сценария — "cookies": {name: value}
const parseCookies = s => String(s || '').split(';').map(x => x.trim()).filter(Boolean).map(x => { const i = x.indexOf('='); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }).filter(([k]) => k);
const baseCookies = parseCookies(typeof args.cookie === 'string' ? args.cookie : '');
const browser = cdp ? await chromium.connectOverCDP(cdp).catch(e => { throw new Error(`Нет Chrome для ревью на ${cdp}: запустите node chrome.mjs (${e.message.split('\n')[0]})`); }) : await chromium.launch();
if (cdp) console.log(`снимаю в Chrome пользователя (${cdp})`);
for (const state of states) {
  for (const width of widths) {
    if (state.widths && !state.widths.includes(width)) continue;
    const context = cdp ? browser.contexts()[0] : await browser.newContext({
      viewport: { width, height: vh(width) }, deviceScaleFactor: 1, locale: 'ru-RU',
      ...(args.auth ? { storageState: args.auth } : {}),
    });
    // cookie запуска + cookie состояния (варианты A/B одним запуском: состояние = группа)
    const cks = [...baseCookies, ...Object.entries(state.cookies || {})];
    if (cks.length) { const origin = new URL(url).origin; await context.addCookies(cks.map(([name, value]) => ({ name, value: String(value), url: origin }))); }
    const page = await context.newPage();
    // Ширина окна пользователя не должна влиять на вёрстку: задаём нужную ширину штатно (отдельная CDP-эмуляция
    // конфликтует с Playwright — снимок нужной ширины, а вёрстка от окна). Масштаб экрана 125/150% гасим scale:'css'.
    if (cdp) await page.setViewportSize({ width, height: vh(width) });
    page.setDefaultTimeout(30000); // ни один шаг или скриншот не должен висеть бесконечно
    // «Тишина в сети»: ленивые блоки (сайдбары, ленты) догружаются после прокрутки. Ждём, пока запросы стихнут,
    // но не дольше лимита — реклама и аналитика могут слать запросы бесконечно.
    let inflight = 0, lastNet = Date.now();
    page.on('request', () => { inflight++; lastNet = Date.now(); });
    const done = () => { inflight = Math.max(0, inflight - 1); lastNet = Date.now(); };
    page.on('requestfinished', done); page.on('requestfailed', done);
    const waitQuiet = async (quiet = 1500, cap = 10000) => {
      const t0 = Date.now();
      while (Date.now() - t0 < cap) { if (Date.now() - lastNet >= quiet) return true; await page.waitForTimeout(250); }
      return false;
    };
    const log = m => args.verbose && console.log(`  [${state.name} ${width}] ${m}`);
    // Блокировать сторонние скрипты — только по явному флагу: на некоторых сайтах без них не рисуются целые блоки
    // (на habr.com пропадает сайдбар). Страница должна грузиться так же, как у пользователя.
    if (args['block-analytics']) await page.route(/(google-analytics|googletagmanager|mc\.yandex|yandex\.ru\/(metrika|ads)|top-fwz1|doubleclick|facebook\.net|vk\.com\/rtrg|hotjar|sentry)/, r => r.abort());
    // Повторяем загрузку при сетевых сбоях: живые сайты иногда отвечают с задержкой или временно ограничивают частые запросы.
    for (let attempt = 1; ; attempt++) {
      // Ждём DOM, а полную загрузку — не дольше 15 с: один зависший рекламный ресурс не должен срывать съёмку.
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForLoadState('load', { timeout: 15000 }).catch(() => log('load не наступил за 15 с — снимаем как есть')); break; }
      catch (e) {
        if (attempt >= 3) throw new Error(`Страница не открылась за 3 попытки (${e.message.split('\n')[0]}). Если сайт ограничивает частые запросы — подождите и запустите с --pause 5000.`);
        console.error(`  повтор загрузки ${attempt}/3: ${e.message.split('\n')[0]}`); await new Promise(r => setTimeout(r, 15000 * attempt));
      }
    }
    await page.waitForTimeout(2000);
    // Проверка входа: селектор, который есть только у вошедшего (аватар, меню профиля) — --auth-marker или authMarker профиля.
    // Без входа снимать закрытую зону бессмысленно: страница будет «для гостя».
    const authMarker = typeof args['auth-marker'] === 'string' ? args['auth-marker'] : profile?.authMarker;
    if (authMarker && (args.cdp || args.auth || args['auth-marker'])) {
      const n = await page.locator(authMarker).count().catch(() => 0);
      if (!n) console.error(`⚠ [${state.name} ${width}] похоже, вход не выполнен: на странице нет «${authMarker}». Войдите в открытом окне браузера и повторите съёмку.`);
    }
    // Прокручиваем, чтобы догрузились ленивые картинки, и возвращаемся наверх.
    // Эталон для самопроверки — первое впечатление пользователя: кадр экрана сразу после загрузки,
    // до прокрутки и любых наших правок (прокрутка сама может переключить липкую шапку).
    await waitQuiet(1000, 6000);
    const refShot = (state.steps || []).length ? null : await page.screenshot({ scale: 'css' });
    const passH = Number(args['max-height'] || 0);
    if (!SKIP.has('scrollpass')) await page.evaluate(async lim => {
      const end = lim ? Math.min(lim + 900, document.body.scrollHeight) : document.body.scrollHeight;
      for (let y = 0; y < end; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
      window.scrollTo(0, 0);
    }, passH);
    if (!(await waitQuiet())) log('сеть не затихла за 10 с — снимаем как есть');
    await page.waitForTimeout(600);
    // Анимации не выключаем жёстко (animation:none оставляет элементы в начальном кадре — «двоящиеся» шапки),
    // а проматываем их в конец и обнуляем длительность новых. --kill-animations — старое поведение.
    if (!SKIP.has('style')) await page.addStyleTag({ content: (args['kill-animations'] ? '*,*::before,*::after{animation:none!important;transition:none!important}' : '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important}') + '*{caret-color:transparent!important}' + (scenario.css || '') });
    if (!SKIP.has('finish')) await page.evaluate(() => { try { for (const a of document.getAnimations()) { try { a.finish(); } catch {} } } catch {} });
    if (scenario.hide?.length) await page.addStyleTag({ content: scenario.hide.join(',') + '{visibility:hidden!important}' });
    // remove — убрать из потока (реклама, промо-баннеры, cookie-плашки, которых нет в макете): место не остаётся.
    if (scenario.remove?.length) await page.addStyleTag({ content: scenario.remove.join(',') + '{display:none!important}' });
    const stepErrors = [];
    for (const s of state.steps || []) {
      if (s.widths && !s.widths.includes(width)) continue;
      log('шаг ' + JSON.stringify(s));
      try { await runStep(page, s); } catch (e) {
        const msg = `шаг ${JSON.stringify(s)}: ${e.message.split('\n')[0]}`;
        // необязательный шаг (optional: true) — пропустить молча: «раскрыть 10 блоков», а их 7 — состояние всё равно достигнуто
        if (s.optional) { log('пропущен необязательный шаг: ' + msg); continue; }
        stepErrors.push(msg); console.error(`[${state.name} ${width}] ОШИБКА ${msg}`);
        break; // состояние не достигнуто — дальше шаги бессмысленны
      }
    }
    await page.waitForTimeout(state.settle ?? 500);
    const fullPage = state.fullPage !== false;
    // --freeze: «приземлить» fixed/sticky (fixed → absolute, sticky → relative) — только если они всё же рисуются
    // не на месте. По умолчанию не нужно: настоящая причина «пустых сайдбаров» — предел высоты снимка (см. ниже).
    // Плашки, закреплённые внизу экрана (реклама, чаты, cookie), на полноразмерном снимке висят посреди страницы
    // и закрывают контент. В макетах их не рисуют — прячем. --keep-fixed-bottom оставляет.
    let hiddenFixed = 0;
    if (fullPage && !args['keep-fixed-bottom'] && !SKIP.has('hidefixed')) {
      hiddenFixed = await page.evaluate(() => {
        let n = 0;
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el); if (cs.position !== 'fixed') continue;
          const r = el.getBoundingClientRect();
          if (r.height > 0 && r.top > innerHeight * 0.45) { (el.style.setProperty('visibility', 'hidden', 'important'), el.style.setProperty('opacity', '0', 'important')); n++; }
        }
        return n;
      });
      if (hiddenFixed) log(`скрыто закреплённых внизу плашек: ${hiddenFixed}`);
    }
    let frozen = 0;
    if (fullPage && args.freeze) {
      frozen = await page.evaluate(() => {
        window.scrollTo(0, 0); let n = 0;
        for (const el of document.querySelectorAll('body *')) {
          const p = getComputedStyle(el).position;
          if (p === 'fixed') { const r = el.getBoundingClientRect(); el.style.setProperty('position', 'absolute', 'important'); el.style.setProperty('top', r.top + 'px', 'important'); el.style.setProperty('left', r.left + 'px', 'important'); el.style.setProperty('width', r.width + 'px', 'important'); n++; }
          else if (p === 'sticky') { el.style.setProperty('position', 'relative', 'important'); el.style.setProperty('top', 'auto', 'important'); n++; }
        }
        return n;
      });
      if (frozen) { log(`приземлено fixed/sticky: ${frozen}`); await page.waitForTimeout(300); }
    }

    const data = await page.evaluate(({ KEEP, fullPage, MEASURE }) => {
      const out = [];
      const domPath = el => {
        const parts = [];
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          let i = 1; for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === n.tagName) i++;
          parts.unshift(n.tagName.toLowerCase() + (i > 1 ? `:${i}` : ''));
        }
        return parts.join('>');
      };
      // Селектор для разработчика: короткий и по возможности уникальный — id, data-testid/qa, осмысленные классы,
      // поднимаемся по предкам, пока querySelectorAll не вернёт ровно один элемент. Хэш-классы (css-1x2y3z) пропускаем.
      // Хэш-классы: css-1x2y3z, sc-abc, _a1b2c, CSS-модули name_VOVn / name__3xYz9, чистые хэши.
      // BEM-классы (block__element, block_modifier) — нормальные: хэш-суффикс отличаем по цифре или заглавной букве.
      const hashed = c => /^(css|sc|jsx|emotion|styled)-[a-z0-9]+$|^_[a-zA-Z0-9]{4,}$|[_-]{1,2}(?=[A-Za-z0-9]*[0-9A-Z])[A-Za-z0-9]{4,8}$|^(?=[a-z]*[0-9])[a-z0-9]{6,}$/.test(c);
      const TEST_ATTRS = ['data-testid', 'data-test', 'data-qa', 'data-cy', 'data-test-id'];
      const part = n => {
        if (n.id && !/\d{3,}|:/.test(n.id)) return '#' + CSS.escape(n.id);
        let s = n.tagName.toLowerCase();
        const attr = TEST_ATTRS.find(a => n.hasAttribute(a));
        if (attr) return s + `[${attr}="${CSS.escape(n.getAttribute(attr))}"]`;
        const cls = [...n.classList].filter(c => !hashed(c) && !/[:[\]/]/.test(c)).slice(0, 2);
        return s + cls.map(c => '.' + CSS.escape(c)).join('');
      };
      const nth = n => { let i = 1; for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === n.tagName) i++; return `:nth-of-type(${i})`; };
      const count = s => { try { return document.querySelectorAll(s).length; } catch { return 0; } };
      // Селектор, по которому человек найдёт место в вёрстке:
      //  1) у элемента свой класс/id/data-атрибут и он уникален — его и берём;
      //  2) иначе «ближайший осмысленный предок + элемент» (.theme-doc-markdown p), поднимаясь по таким предкам;
      //  3) иначе точный путь с позициями от ближайшего осмысленного предка (.card > div:nth-of-type(2) > p).
      // Голые теги без привязки (p, a:nth-of-type(3)) не возвращаем — они ничего не говорят разработчику.
      const meaningful = n => part(n) !== n.tagName.toLowerCase();
      const anchorOf = el => { for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) if (meaningful(n)) return n; return null; };
      const selOf = el => {
        const leaf = part(el), anchorEl = anchorOf(el), anchor = anchorEl ? part(anchorEl) : undefined;
        if (meaningful(el) && count(leaf) === 1) return { sel: leaf, selN: 1, anchor };
        const chain = [];
        for (let a = anchorEl, k = 0; a && k < 4; a = anchorOf(a), k++) {
          chain.unshift(part(a));
          for (const lf of [leaf, leaf + nth(el)]) { const s = [...chain, lf].join(' '); if (count(s) === 1) return { sel: s, selN: 1, anchor }; }
          if (chain[0].startsWith('#')) break;
        }
        // У элемента свой класс, но он повторяется (шаблон: «все 20 таких») — для разработчика это и есть ответ.
        if (meaningful(el)) {
          const withAnchor = anchor ? `${anchor} ${leaf}` : leaf, nA = count(withAnchor), nL = count(leaf);
          return nA && nA < nL ? { sel: withAnchor, selN: nA, anchor } : { sel: leaf, selN: nL, anchor };
        }
        const steps = [];
        for (let n = el; n && n !== document.documentElement && steps.length < 7; n = n.parentElement) {
          if (n !== el && meaningful(n)) { steps.unshift(part(n)); break; }
          steps.unshift(part(n) + nth(n));
        }
        const s = steps.join(' > ');
        return { sel: s, selN: count(s), anchor };
      };
      // Элемент целиком вне видимой области ближайших предков с overflow ≠ visible — его не видно, хотя он «visible».
      const clipCache = new Map();
      const clippedAway = (el, r) => {
        let x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
        for (let p = el.parentElement, d = 0; p && p !== document.body && d < 12; p = p.parentElement, d++) {
          let c = clipCache.get(p);
          if (c === undefined) { const s = getComputedStyle(p); c = (s.overflowX !== 'visible' || s.overflowY !== 'visible') ? p.getBoundingClientRect() : null; clipCache.set(p, c); }
          if (!c) continue;
          x1 = Math.max(x1, c.left); y1 = Math.max(y1, c.top); x2 = Math.min(x2, c.right); y2 = Math.min(y2, c.bottom);
          if (x2 - x1 < 1 || y2 - y1 < 1) return true;
        }
        return false;
      };
      const offY = fullPage ? scrollY : 0, offX = fullPage ? scrollX : 0;
      let i = 0;
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (!fullPage && (r.bottom < 0 || r.top > innerHeight)) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
        if (clippedAway(el, r)) continue; // спрятан за overflow:hidden родителя (свёрнутые панели, карусели)
        const textNodes = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
        const ownText = textNodes.map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
        const tag = el.tagName.toLowerCase();
        const visual = ownText || ['img', 'svg', 'input', 'button', 'a', 'select', 'textarea'].includes(tag)
          || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none';
        if (!visual) continue;
        const style = {}; for (const k of KEEP) style[k] = cs.getPropertyValue(k);
        // Отпечаток всего текста внутри: при сравнении окружений отличает «другие данные» от «другой вёрстки».
        const allText = (el.innerText || '').replace(/\s+/g, ' ').trim();
        const hash = s => { let x = 0; for (let k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) | 0; return x; };
        const h = hash(allText);
        // Отпечаток ближайшего «контейнера-карточки» (предок с заметным текстом): иконки и бейджи без уникального текста
        // сопоставляются только внутри той же карточки — иначе в лентах они путаются с соседними.
        let ctx; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const t = (p.innerText || '').replace(/\s+/g, ' ').trim(); if (t.length >= 30) { ctx = hash(t.slice(0, 2000)); break; }
        }
        // Рамка самого текста (строк), а не элемента: у кнопок и вкладок элемент выше строки — а в Figma рамка = строка.
        let tbox;
        if (textNodes.length) {
          const rg = document.createRange(); let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
          for (const tn of textNodes) { rg.selectNodeContents(tn); for (const q of rg.getClientRects()) { if (!q.width) continue; x1 = Math.min(x1, q.left); y1 = Math.min(y1, q.top); x2 = Math.max(x2, q.right); y2 = Math.max(y2, q.bottom); } }
          if (x2 > x1) tbox = { x: Math.round(x1 + offX), y: Math.round(y1 + offY), width: Math.round(x2 - x1), height: Math.round(y2 - y1) };
        }
        el.setAttribute('data-dr', String(i)); // для поиска токенов через DevTools-протокол (порядок = порядок документа)
        out.push({
          id: i++, tag, path: domPath(el), ...selOf(el), tbox, cls: String(el.className?.baseVal ?? el.className ?? '').slice(0, 300),
          text: ownText.slice(0, 200), fullText: allText.slice(0, 300), textHash: h, ctx, imgs: el.querySelectorAll('img').length,
          placeholder: el.getAttribute('placeholder') || undefined, alt: el.getAttribute('alt') || undefined,
          href: el.getAttribute('href') || undefined, aria: el.getAttribute('aria-label') || undefined,
          src: tag === 'img' ? (el.currentSrc || el.src || '').split('?')[0] : undefined,
           image: tag === 'img' ? { naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight, complete: el.complete, objectFit: cs.objectFit, objectPosition: cs.objectPosition } : undefined,
          box: { x: Math.round(r.x + offX), y: Math.round(r.y + offY), width: Math.round(r.width), height: Math.round(r.height) },
          style,
        });
      }
      // --measure: замер для перепроверки — элементы по селекторам из находок, даже «невидимые» контейнеры
      // (панель без фона, обёртка модалки), с нужными свойствами (flex-wrap, gap, justify-content…). Отдельно от elements.
      const measured = [];
      for (const m of MEASURE || []) {
        let list = []; try { list = [...document.querySelectorAll(m.sel)]; } catch { continue; }
        list.forEach((el, k) => {
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (r.width < 1 && r.height < 1) return;
          const style = {}; for (const p of new Set([...KEEP, ...(m.props || [])])) style[p] = cs.getPropertyValue(p);
          measured.push({ sel: m.sel, nth: k, of: list.length, tag: el.tagName.toLowerCase(), cls: String(el.className?.baseVal ?? el.className ?? '').slice(0, 300), rawBox:{x:r.x+offX,y:r.y+offY,width:r.width,height:r.height},
            text: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim().slice(0, 200),
            fullText: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300), visible: cs.display !== 'none' && cs.visibility !== 'hidden',
            box: { x: Math.round(r.x + offX), y: Math.round(r.y + offY), width: Math.round(r.width), height: Math.round(r.height) }, style });
        });
      }
      return { elements: out, measured, pageHeight: document.documentElement.scrollHeight, scrollY, viewportHeight: innerHeight, finalUrl: location.href };
    }, { KEEP, fullPage, MEASURE });

    const details = await page.evaluate(captureDetails, { fullPage });
    for (const el of data.elements) Object.assign(el, details.elements[el.id] || {});
    data.environment = details.environment;
    const base = `${prefix}-${width}${state.name === 'default' ? '' : '-' + state.name}`;
    // Токены сайта: какой CSS-переменной задан цвет/фон/рамка элемента (как в DevTools → Styles).
    // Вычисленный стиль даёт только итоговое значение, поэтому спрашиваем совпавшие правила через CDP.
    if (!args['no-tokens']) {
      try {
        const s = await page.context().newCDPSession(page);
        await s.send('DOM.enable'); await s.send('CSS.enable');
        const { root } = await s.send('DOM.getDocument', { depth: 0 });
        const { nodeIds } = await s.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-dr]' });
        const ALIASES = { color: ['color'], 'background-color': ['background-color', 'background'], 'border-top-color': ['border-top-color', 'border-color', 'border-top', 'border'] };
        const fromRules = (m, names) => {
          const lists = [m.inlineStyle?.cssProperties || [], ...(m.matchedCSSRules || []).filter(r => r.rule.origin !== 'user-agent').reverse().map(r => r.rule.style.cssProperties)];
          for (const props of lists) for (const p of [...props].reverse()) if (names.includes(p.name) && p.value && p.parsedOk !== false && !p.disabled) {
            const v = /var\(\s*(--[\w-]+)/.exec(p.value); return v ? { var: v[1] } : { raw: p.value.slice(0, 60) };
          }
          return null;
        };
        let n = 0;
        for (let k = 0; k < nodeIds.length && k < data.elements.length; k++) {
          const e = data.elements[k], st = e.style;
          const wants = { color: !!e.text, 'background-color': st['background-color'] !== 'rgba(0, 0, 0, 0)', 'border-top-color': parseFloat(st['border-top-width']) > 0 };
          if (!Object.values(wants).some(Boolean)) continue;
          const m = await s.send('CSS.getMatchedStylesForNode', { nodeId: nodeIds[k] });
          const vars = {};
          for (const [prop, need] of Object.entries(wants)) {
            if (!need) continue;
            let t = fromRules(m, ALIASES[prop]);
            // inherit/currentColor — значение приходит от предка: идём вверх по цепочке, пока не найдём настоящее
            const passThrough = x => x && x.raw && /^(inherit|unset|currentcolor|revert)$/i.test(x.raw.trim());
            if ((!t || passThrough(t)) && prop === 'color') for (const inh of m.inherited || []) { const u = fromRules(inh, ['color']); if (u && !passThrough(u)) { t = { ...u, inherited: true }; break; } }
            if (t) vars[prop] = t;
          }
          if (Object.keys(vars).length) { e.vars = vars; n++; }
        }
        // CSS-переменные страницы: вычисленный стиль <html> через CDP (обычный getComputedStyle их не перечисляет)
        const html = await s.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'html' });
        const cs = await s.send('CSS.getComputedStyleForNode', { nodeId: html.nodeId });
        data.cssVars = Object.fromEntries(cs.computedStyle.filter(p => p.name.startsWith('--')).slice(0, 4000).map(p => [p.name, p.value.trim().slice(0, 120)]));
        log(`токены сайта: у ${n} элементов, CSS-переменных на странице ${Object.keys(data.cssVars).length}`);
        await s.detach();
      } catch (err) { console.warn(`  токены сайта не сняты: ${err.message.split('\n')[0]}`); }
    }
    log('скриншот');
    const shotPath = path.join(outDir, base + '.png');
    const maxH = Number(args['max-height'] || 0);
    const H = fullPage ? Math.min(data.pageHeight, maxH || Infinity) : 0;
    if (maxH && fullPage) data.elements = data.elements.filter(e => e.box.y < maxH);
    // Полноразмерный снимок Chromium (fullPage) растягивает окно на всю высоту страницы — на части сайтов это ломает
    // отрисовку: липкие шапки «двоятся», сайдбары пропадают (habr.com), а выше ~16 тыс. px теряются блоки.
    // Поэтому по умолчанию снимаем как человек: прокручиваем экран за экраном и склеиваем кадры.
    // Липкие элементы перед этим ставим на место в потоке (иначе повторятся на каждом кадре),
    // закреплённые (fixed) оставляем только на первом кадре. --native-fullpage — снимок средствами Chromium.
    if (fullPage && !args['native-fullpage']) {
      const vh = data.viewportHeight || 900, full = new PNG({ width, height: H });
      // Липкие элементы не трогаем (перевод в relative ломает часть сайтов — пропадают сайдбары): запоминаем, где каждый
      // стоит при открытии, а на следующих кадрах «прилипшие» (уехавшие вслед за прокруткой) сдвигаем обратно на место.
      await page.evaluate(() => {
        scrollTo(0, 0); window.__drSticky = [];
        for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).position === 'sticky') window.__drSticky.push([el, el.getBoundingClientRect().top]);
      });
      let tiles = 0;
      for (let y = 0; y < H; y += vh) {
        await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(350);
        if (y > 0 && tiles === 1) await page.evaluate(() => { for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).position === 'fixed') (el.style.setProperty('visibility', 'hidden', 'important'), el.style.setProperty('opacity', '0', 'important')); });
        // виджеты чатов и плашки появляются с задержкой — перед каждым кадром ещё раз прячем закреплённое внизу
        if (!args['keep-fixed-bottom']) await page.evaluate(() => { for (const el of document.querySelectorAll('body *')) { if (getComputedStyle(el).position !== 'fixed') continue; const r = el.getBoundingClientRect(); if (r.height > 0 && r.top > innerHeight * 0.45) (el.style.setProperty('visibility', 'hidden', 'important'), el.style.setProperty('opacity', '0', 'important')); } });
        // Прилипший элемент возвращаем на его место сдвигом (а не прячем): высокий липкий сайдбар (career.habr.com)
        // иначе пропадает со всех нижних кадров. Родители идут раньше детей — вложенные меряются уже после сдвига родителя.
        await page.evaluate(() => {
          for (const s of window.__drSticky || []) {
            const [el, top0] = s; if (s[2] === undefined) s[2] = el.style.transform;
            el.style.transform = s[2];
            const off = el.getBoundingClientRect().top + scrollY - top0; // насколько уехал вслед за прокруткой
            if (scrollY > 0 && off > 1) el.style.transform = `translateY(${-off}px) ${s[2] || ''}`;
          }
        });
        const sy = await page.evaluate(() => scrollY);
        const img = PNG.sync.read(await page.screenshot({ timeout: 60000, scale: 'css' }));
        const from = y - sy, h = Math.min(vh - from, H - y);
        if (h > 0) PNG.bitblt(img, full, 0, from, width, h, 0, y);
        tiles++;
      }
      await page.evaluate(() => { for (const [el, , t] of window.__drSticky || []) el.style.transform = t || ''; scrollTo(0, 0); });
      await fs.writeFile(shotPath, PNG.sync.write(full));
      log(`склеено из ${tiles} экранов`);
    } else if (fullPage && (H > 12000 || maxH)) {
      const TILE = 6000, full = new PNG({ width, height: H });
      for (let y = 0; y < H; y += TILE) {
        const h = Math.min(TILE, H - y);
        const buf = await page.screenshot({ fullPage: true, clip: { x: 0, y, width, height: h }, timeout: 60000, scale: 'css' });
        PNG.bitblt(PNG.sync.read(buf), full, 0, 0, width, h, 0, y);
      }
      await fs.writeFile(shotPath, PNG.sync.write(full));
      log(`склеено из ${Math.ceil(H / TILE)} частей`);
    } else {
      await page.screenshot({ path: shotPath, fullPage, timeout: 60000, scale: 'css' });
    }
    if (maxH && fullPage) data.pageHeight = H;
    // Самопроверка: верх итогового снимка должен совпадать с тем, что пользователь видит на экране.
    // Сильное расхождение = артефакт съёмки (липкие шапки, пропавшие сайдбары), а не баг сайта.
    data.selfCheck = null;
    if (refShot && fullPage) {
      const ref = PNG.sync.read(refShot), fin = PNG.sync.read(await fs.readFile(shotPath));
      const w = Math.min(ref.width, fin.width), h = Math.min(ref.height, fin.height, Math.round((data.viewportHeight || 900) * 0.8));
      const crop = img => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
      const { default: pixelmatch } = await import('pixelmatch');
      const diffPng = new PNG({ width: w, height: h });
      const bad = pixelmatch(crop(ref).data, crop(fin).data, diffPng.data, w, h, { threshold: 0.15 });
      const pct = +(bad / (w * h) * 100).toFixed(1);
      // Порог 2,5%: правильная склейка даёт ~0%, «двоящаяся» шапка Хабра — 4,4%. Ротация рекламы может дать ложную
      // тревогу — это дешевле, чем ложный баг в отчёте: достаточно посмотреть на _check-*.png.
      data.selfCheck = { diffPct: pct, ok: pct <= 2.5 };
      if (pct > 2.5) {
        await fs.writeFile(path.join(outDir, `_check-${base}-screen.png`), refShot);
        await fs.writeFile(path.join(outDir, `_check-${base}-diff.png`), PNG.sync.write(diffPng));
        console.warn(`  ⚠ ${state.name} ${width}px: верх снимка отличается от экрана пользователя на ${pct}% — проверьте _check-${base}-*.png (артефакт съёмки?)`);
      } else log(`самопроверка: отличие от экрана ${pct}%`);
    }
    // Недогруженные места (скелетоны, лоадеры) — не баги вёрстки: помечаем, чтобы агент их не путал с расхождениями.
    data.loaders = data.elements.filter(e => /(^|[\s_-])(skeleton|loader|loading|loads|spinner|shimmer|placeholder)([\s_-]|$)/i.test(e.cls))
      .map(e => ({ sel: e.sel, box: e.box })).slice(0, 20);
    if (data.loaders.length) console.warn(`  ⚠ ${state.name} ${width}px: на снимке остались заглушки загрузки (${data.loaders.length}) — эти места не сравнивать`);
    await fs.writeFile(path.join(outDir, base + '.json'), JSON.stringify({ url, state: state.name, width, fullPage, frozen, hiddenFixed, capturedAt: new Date().toISOString(), stepErrors, ...data }, null, 1));
    console.log(`${stepErrors.length ? '⚠ НЕ ДОСТИГНУТО ' : ''}${state.name} · ${width}px: ${data.elements.length} элементов, высота ${fullPage ? data.pageHeight : data.viewportHeight}${data.finalUrl !== url ? ' · ' + data.finalUrl : ''}`);
    if (cdp) await page.close(); else await context.close(); // в Chrome пользователя закрываем только свою вкладку
    if (args.pause) await new Promise(r => setTimeout(r, Number(args.pause))); // бережём сайт от частых запросов
  }
}
await browser.close();
