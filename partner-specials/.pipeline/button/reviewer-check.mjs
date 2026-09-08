import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '../../node_modules/playwright/index.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
const results=[];
try {
for(const width of [320,768,1024,1400]) {
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4178');await page.evaluate(()=>document.fonts.ready);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const sample=()=>page.locator('[data-example]').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {size:b.dataset.size,state:b.dataset.example,width:r.width,height:r.height,padding:s.padding,font:s.fontSize,line:s.lineHeight,bg:s.backgroundColor,radius:s.borderRadius}}));
 const base=await sample();assert.equal(base.length,30);for(const b of base)assert.equal(b.height,{big:64,medium:48,small:36}[b.size]);
 await page.selectOption('#theme','demo');const demo=await sample();for(let i=0;i<30;i++)for(const k of ['width','height','padding','font','line'])assert.equal(base[i][k],demo[i][k]);assert.notEqual(base[0].bg,demo[0].bg);
 results.push({width,noOverflow:true,themeGeometryUnchanged:true,defaults:base.filter(b=>b.state==='default')});
}
await page.goto('http://127.0.0.1:4178');const action=page.locator('#action');for(let i=0;i<40&&!(await action.evaluate(b=>b===document.activeElement));i++)await page.keyboard.press('Tab');assert(await action.evaluate(b=>b.matches(':focus-visible')));await page.keyboard.press('Enter');assert.equal(await action.getAttribute('aria-busy'),'true');await page.keyboard.press('Space');await page.keyboard.press('Enter');assert(await action.evaluate(b=>b===document.activeElement));await page.waitForFunction(()=>document.querySelector('#result').textContent==='Готово. Запусков: 1.');await page.keyboard.press('Space');await page.waitForFunction(()=>document.querySelector('#result').textContent==='Готово. Запусков: 2.');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'long-label');
const hover=page.locator('[data-example="default"][data-size="big"]').first();await hover.hover();assert.equal(await hover.evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(25, 33, 44)');assert.equal(await page.locator('[data-example=disabled] span').first().evaluate(b=>getComputedStyle(b).opacity),'0.5');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('[aria-busy=true]').first().evaluate(b=>getComputedStyle(b,'::after').animationName),'none');
const spec=await readFile(new URL('../../components/actions/button.md',import.meta.url),'utf8');const snippet=spec.match(/```html\r?\n([\s\S]*?)```/)[1];await page.setContent('<base href="http://127.0.0.1:4178/.pipeline/button/">'+snippet);await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('link').count(),1);assert.equal((await page.locator('button').boundingBox()).height,64);await page.locator('button').evaluate(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});assert((await page.locator('button').evaluate(b=>getComputedStyle(b,'::after').backgroundImage)).includes('spinner.svg'));await page.locator('button').evaluate(b=>{b.removeAttribute('aria-busy');b.querySelector('span').textContent='';});assert.equal((await page.locator('button').boundingBox()).height,64);
assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',results,checks:['keyboard','busy guard','disabled tab skip','hover','disabled opacity','reduced motion','one-CSS copy','spinner','empty label geometry','no asset errors']},null,2));
}finally{await browser.close()}
