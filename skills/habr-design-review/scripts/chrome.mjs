// Chrome для ревью закрытых зон (админки, личные кабинеты, SSO/2FA).
// Запускает настоящий Chrome с ОТДЕЛЬНЫМ профилем и портом отладки. Пользователь сам входит в нужный сервис
// в этом окне — сессия хранится в профиле между ревью. capture.mjs --cdp http://127.0.0.1:9222 снимает страницы
// в этом браузере (в новых вкладках), видя то же, что видит пользователь.
//
// node chrome.mjs [url] [--port 9222] [--profile <папка профиля>]
//
// Безопасность: профиль лежит в домашней папке (~/.design-review-chrome), не в проекте и не в git.
// Основной профиль Chrome не используется (Chrome 136+ и не разрешает отладку основного профиля).
// Пока окно открыто с портом отладки, любая программа на этом компьютере может им управлять — закрывайте после ревью.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const url = argv.find(a => /^https?:/.test(a)) || 'about:blank';
const port = Number(opt('port', 9222));
const profile = opt('profile', path.join(os.homedir(), '.design-review-chrome'));

// Chrome может слушать только IPv6 (::1) — пробуем оба адреса.
const probe = async () => { for (const h of ["127.0.0.1", "[::1]"]) { const v = await fetch(`http://${h}:${port}/json/version`).then(r => r.json()).catch(() => null); if (v) return { ...v, host: h }; } return null; };
const running = await probe();
if (running) {
  console.log(`Chrome для ревью уже запущен (${running.Browser}) на порту ${port}.`);
  console.log(`Съёмка: node capture.mjs --url <url> --out <папка> --cdp http://${running.host}:${port}`);
  process.exit(0);
}

const candidates = process.platform === 'win32' ? [
  path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
] : process.platform === 'darwin' ? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
] : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const exe = candidates.find(p => p && fs.existsSync(p));
if (!exe) { console.error('Не найден Chrome/Edge. Укажите путь вручную или установите Chrome.'); process.exit(1); }

fs.mkdirSync(profile, { recursive: true });
const child = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', url], { detached: true, stdio: 'ignore' });
child.unref();

for (let i = 0; i < 80; i++) {
  await new Promise(r => setTimeout(r, 250));
  const v = await probe();
  if (v) {
    console.log(`Запущен ${v.Browser} с профилем ${profile}`);
    console.log('1) Войдите в нужный сервис в открывшемся окне (один раз — сессия сохранится в профиле).');
    console.log(`2) Съёмка: node capture.mjs --url <url> --out <папка> --cdp http://${v.host}:${port}`);
    console.log('3) После ревью закройте это окно Chrome.');
    process.exit(0);
  }
}
console.error(`Chrome запущен, но порт ${port} не ответил. Возможно, уже открыт обычный Chrome с этим профилем — закройте его и повторите.`);
process.exit(1);
