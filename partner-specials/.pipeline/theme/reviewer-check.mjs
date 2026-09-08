import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from '../../tools/serve.mjs';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
const page=await browser.newPage();await page.goto(`${base}/showcase/theme.html`);await page.waitForSelector('#theme-text-color');
const radius=page.locator('[data-token="--ps-radius-big"]');const opacity=page.locator('[data-token="--ps-disabled-label-opacity"]');
for(const [field,value,name,expected] of [[radius,'','--ps-radius-big','16px'],[radius,'-1','--ps-radius-big','16px'],[radius,'999','--ps-radius-big','16px'],[radius,'0','--ps-radius-big','0px'],[opacity,'','--ps-disabled-label-opacity','.5'],[opacity,'2','--ps-disabled-label-opacity','.5'],[opacity,'0','--ps-disabled-label-opacity','0']]){await field.fill(value);await field.dispatchEvent('input');assert.equal(await page.locator('#token-preview').evaluate((n,key)=>n.style.getPropertyValue(key),name),expected);assert(!/NaN|undefined/.test(await page.locator('#token-css').inputValue()));}
await page.selectOption('[data-token="--ps-font"]','Arial, sans-serif');await page.locator('#theme-text-color').fill('#abcdef');await page.locator('#theme-text-color').dispatchEvent('input');
assert.match(await page.locator('#token-preview .ps-type').first().evaluate(n=>getComputedStyle(n).fontFamily),/Arial/);assert.equal(await page.locator('#token-preview .ps-type').first().evaluate(n=>getComputedStyle(n).color),'rgb(171, 205, 239)');
await page.selectOption('#theme','demo');await page.waitForFunction(()=>document.querySelector('#theme-text-color').value==='#362048');assert.equal(await page.locator('[data-token="--ps-font"]').inputValue(),"'Partner Inter', Arial, sans-serif");assert((await page.locator('#token-css').inputValue()).includes('--ps-radius-big: 4px;'));
await page.locator('#theme-text-color').fill('#abcdef');await page.locator('#theme-text-color').dispatchEvent('input');await page.locator('#token-reset').click();assert.equal(await page.locator('#theme-text-color').inputValue(),'#362048');
await page.selectOption('#theme','figma');await page.waitForFunction(()=>document.querySelector('#theme-text-color').value==='#000000');assert.equal(await radius.inputValue(),'16');
console.log('PASS reviewer: empty/out-of-range numeric input preserves valid theme; zero valid; font/text color applied; source switches and reset synchronize font/color/radius/export.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
