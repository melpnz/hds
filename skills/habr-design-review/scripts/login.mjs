// Вход на закрытый стенд: открывает обычное окно браузера, вы логинитесь руками,
// закрываете окно — cookies и localStorage сохраняются в файл для capture.mjs --auth.
// node login.mjs <url> <auth.json>
// Файл содержит сессию — не коммитить и не пересылать.
import { chromium } from 'playwright';

const [url, out = 'auth.json'] = process.argv.slice(2);
if (!url) { console.error('usage: login.mjs <url> [auth.json]'); process.exit(1); }
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ru-RU' });
const page = await context.newPage();
await page.goto(url);
console.log('Войдите в открывшемся окне и закройте его — сессия сохранится в', out);
await page.waitForEvent('close', { timeout: 0 });
await context.storageState({ path: out });
await browser.close();
console.log('Сохранено:', out);
