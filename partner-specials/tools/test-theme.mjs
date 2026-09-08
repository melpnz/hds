import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
const server=createServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const out=new URL('../evidence/verification/theme/',import.meta.url); await mkdir(out,{recursive:true});
let browser; const results=[];
try {
  try { browser=await chromium.launch({headless:true}); } catch(e) { if(!e.message.includes("Executable doesn't exist"))throw e; browser=await chromium.launch({channel:'chrome',headless:true}); }
  const page=await browser.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message)); page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const styles=async selector=>page.locator(selector).evaluateAll(items=>items.map(el=>{
    const s=getComputedStyle(el); return {height:s.height,padding:s.padding,fontSize:s.fontSize,lineHeight:s.lineHeight,gap:s.gap,columns:s.gridTemplateColumns};
  }));
  const edit=async(name,value)=>{const input=page.locator(`[data-token="${name}"]`);await input.fill(value);await input.dispatchEvent('input');};
  for(const width of [320,768,1024,1400]) {
    await page.setViewportSize({width,height:1000}); await page.goto(`${base}/showcase/theme.html`); await page.locator('#theme-text-color').waitFor();await page.evaluate(()=>document.fonts.ready);
    await page.mouse.move(0,0);
    const original=await styles('#c-button .ps-button, #c-button .ps-type, #c-button .ps-layout');
    const sourceAppearance=await page.locator('#c-button .ps-button, #c-button .ps-type').evaluateAll(items=>items.map(el=>{const s=getComputedStyle(el);return [s.color,s.backgroundColor,s.fontFamily,s.width,s.borderRadius];}));
    const buttons=await styles('#token-preview .ps-button');
    const grid=await page.locator('#token-preview .ps-layout').evaluate(el=>{const s=getComputedStyle(el);return {padding:s.padding,width:s.width,columns:s.getPropertyValue('--ps-layout-columns'),gap:s.getPropertyValue('--ps-layout-gap')};});
    const type=await page.locator('#token-preview .ps-type').evaluateAll(items=>items.map(el=>{const s=getComputedStyle(el);return {size:s.fontSize,line:s.lineHeight,weight:s.fontWeight};}));
    await edit('--ps-main','#112233');await edit('--ps-type-color','#123456');await edit('--ps-radius-big','0');
    assert.deepEqual(await styles('#token-preview .ps-button'),buttons,'color/radius changed fixed geometry');
    await page.locator('[data-token="--ps-font"]').selectOption('Georgia, serif'); await page.evaluate(()=>document.fonts.ready);
    assert.deepEqual(await styles('#token-preview .ps-button'),buttons,'font changed button fixed geometry');
    assert.deepEqual(await page.locator('#token-preview .ps-type').evaluateAll(items=>items.map(el=>{const s=getComputedStyle(el);return {size:s.fontSize,line:s.lineHeight,weight:s.fontWeight};})),type);
    assert.deepEqual(await page.locator('#token-preview .ps-layout').evaluate(el=>{const s=getComputedStyle(el);return {padding:s.padding,width:s.width,columns:s.getPropertyValue('--ps-layout-columns'),gap:s.getPropertyValue('--ps-layout-gap')};}),grid);
    assert.deepEqual(await styles('#c-button .ps-button, #c-button .ps-type, #c-button .ps-layout'),original,'editor altered original sample');
    assert.deepEqual(await page.locator('#c-button .ps-button, #c-button .ps-type').evaluateAll(items=>items.map(el=>{const s=getComputedStyle(el);return [s.color,s.backgroundColor,s.fontFamily,s.width,s.borderRadius];})),sourceAppearance,'editor changed original appearance');
    assert.match(await page.locator('#token-preview .ps-type').first().evaluate(el=>getComputedStyle(el).fontFamily),/Georgia/);
    assert.equal(await page.locator('#token-preview .ps-type').first().evaluate(el=>getComputedStyle(el).color),'rgb(18, 52, 86)');
    assert.equal(await page.locator('#token-preview .ps-button--big').first().evaluate(el=>getComputedStyle(el).borderRadius),'0px');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} overflow`);
    const css=await page.locator('#token-css').inputValue();assert(css.includes('--ps-type-font: var(--ps-font);'));assert(css.includes('--ps-type-color: #123456;'));
    assert(!/--ps-(?:layout-|height-|px-|py-|type-h\d|type-gap)/.test(css),'geometry leaked to theme export');
    const isolated=await browser.newPage();
    await isolated.route('**/theme-proof.html',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${base}/ui/partner-specials.css"><style>${css}</style></head><body><section data-ps-theme="client"><div class="ps-layout" data-ps-type-mode="auto"><div class="ps-layout__grid"><p class="ps-type ps-layout__full" data-type="p1">Текст клиента</p></div></div><button class="ps-button ps-button--big"><span class="ps-button__label">Начать</span></button></section></body></html>`}));
    await isolated.setViewportSize({width,height:1000});await isolated.goto(`${base}/theme-proof.html`);await isolated.evaluate(()=>document.fonts.ready);
    assert.match(await isolated.locator('p').evaluate(el=>getComputedStyle(el).fontFamily),/Georgia/);assert.equal(await isolated.locator('p').evaluate(el=>getComputedStyle(el).color),'rgb(18, 52, 86)');
    assert.equal(await isolated.locator('button').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(17, 34, 51)');assert.equal(await isolated.locator('button').evaluate(el=>getComputedStyle(el).height),'64px');
    assert.equal(await isolated.locator('.ps-layout').evaluate(el=>getComputedStyle(el).paddingLeft),grid.padding.split(' ')[1]||grid.padding);await isolated.close();
    await page.locator('#token-reset').click();assert.equal(await page.locator('#theme-text-color').inputValue(),'#000000');assert.equal(await page.locator('[data-token="--ps-font"]').inputValue(),"'Partner Inter', Arial, sans-serif");
    await page.selectOption('#theme','demo');await page.waitForFunction(()=>document.querySelector('#theme-text-color').value==='#362048');assert((await page.locator('#token-css').inputValue()).includes('--ps-main: #7135b4;'));
    await page.selectOption('#theme','figma');await page.waitForFunction(()=>document.querySelector('#theme-text-color').value==='#000000');
    assert.equal(await page.locator('#token-catalog [data-token-name]').count(),39);
    if([320,1400].includes(width)&&!process.argv.includes('--no-screenshots')) {const path=new URL(`Theme.${width}.png`,out);let exists=false;try{await access(path);exists=true;}catch{}if(!exists||process.argv.includes('--force-screenshots'))await page.locator('#tokens').screenshot({path:fileURLToPath(path),animations:'disabled'});}
    results.push({width,result:'PASS'});
  }
  const example=await readFile(new URL('../ui/client-theme.example.css',import.meta.url),'utf8');assert(example.includes('--ps-type-font: var(--ps-font)'));assert(!example.includes('--ps-layout-'));
  await page.route('**/example-theme.html',r=>r.fulfill({contentType:'text/html',body:`<link rel="stylesheet" href="${base}/ui/partner-specials.css"><link rel="stylesheet" href="${base}/ui/client-theme.example.css"><section data-ps-theme="client"><p class="ps-type" data-type="p1">Пример</p><button class="ps-button">Действие</button></section>`}));
  await page.goto(`${base}/example-theme.html`);
  assert.equal(await page.locator('button').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(113, 53, 180)');
  assert.equal(await page.locator('p').evaluate(el=>getComputedStyle(el).color),'rgb(54, 32, 72)');
  assert.deepEqual(errors,[]);await writeFile(new URL('report.json',out),JSON.stringify({result:'PASS',widths:results,checks:['shared editor reuse','font/color/radius','fixed geometry and original isolation','CSS export with one library entry','reset and source selection','39 Button catalog preserved','no overflow or JS errors']},null,2));
  console.log('PASS: unified theme Button/Typography/Layout × 4 widths; font/color/radius, isolation, fixed geometry, reset and portable CSS.');
} finally {await browser?.close();await new Promise(r=>server.close(r));}
