import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createServer} from '../../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage();await page.goto(`${base}/showcase/layout.html`);await page.waitForSelector('#layout-tokens dt');
const css=(await readFile(new URL('../../ui/layout-tokens.css',import.meta.url),'utf8'))+(await readFile(new URL('../../ui/components/layout.css',import.meta.url),'utf8'));
const names=[...new Set([...css.matchAll(/(--ps-layout-[\w-]+)\s*:/g)].map(m=>m[1]))].sort();
assert.equal(names.length,14);assert.deepEqual(await page.locator('#layout-tokens dt').allTextContents(),['margin-mobile','margin-tablet','margin-compact','margin-desktop','margin-drawn-wide','margin-drawn-tablet','columns-mobile','columns-tablet','columns-desktop','gap-mobile','gap-desktop','margin','columns','gap'].map(n=>'--ps-layout-'+n));
const displayed=(await page.locator('#layout-tokens dt').allTextContents()).sort();assert.deepEqual(displayed,names);
for(const profile of ['native','drawn']){await page.selectOption('#layout-source',profile);for(const width of [767,768,1023,1024,1279,1280,1439,1440]){await page.setViewportSize({width,height:900});const margin=width<768?20:width<1024?(profile==='drawn'?36:40):width<1280?48:width<1440?56:profile==='drawn'?100:56;await page.waitForFunction(expected=>getComputedStyle(document.querySelector('#layout-live')).paddingLeft===expected+'px',margin);assert.equal(await page.locator('#layout-live').evaluate(n=>parseFloat(getComputedStyle(n).paddingLeft)),margin);}}
const spec=await readFile(new URL('../../components/foundations/layout.md',import.meta.url),'utf8');const snippet=spec.match(/```html\r?\n([\s\S]*?)```/)[1];await page.route('**/review-layout-copy.html',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1">${snippet}</html>`}));await page.goto(`${base}/review-layout-copy.html`);assert.equal(await page.locator('.ps-layout__grid').evaluate(n=>getComputedStyle(n).display),'grid');assert.equal(await page.locator('.ps-layout__full').evaluate(n=>getComputedStyle(n).gridColumn),'1 / -1');
console.log('PASS reviewer: all 14 tokens complete; native/drawn exact boundary values; literal spec copied with single entry CSS.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
