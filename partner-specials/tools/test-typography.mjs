import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, unlink, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=async path=>JSON.parse(await readFile(`${root}/${path}`,'utf8'));
const source=await json('evidence/source/figma/typography-details.json');
const fixed=(await json('evidence/source/figma/typography-fixed-lists.json'))[0].children;
const groups=(await json('evidence/source/figma/typography-groups.json')).filter(g=>['2049:285','2058:321','2077:427'].includes(g.id));
const pairSources=(await Promise.all(groups.map(g=>json(`evidence/source/figma/typography-pairs-${g.id.replace(':','-')}.json`)))).flat();
const tokenCss=await readFile(`${root}/ui/typography-tokens.css`,'utf8');
const tokenNames=[...new Set([...tokenCss.matchAll(/(--ps-type-[\w-]+)\s*:/g)].map(m=>m[1]))].sort();
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const out=`${root}/evidence/verification/typography`;await mkdir(out,{recursive:true});
const work=`${root}/.pipeline/typography`;await mkdir(work,{recursive:true});
const report={source:'Saved Figma properties; HTML runtime is new implementation',widths:[],checks:[],tokens:tokenNames.length,result:'FAIL'};
let browser;
const shot=async(page,path)=>{if(process.argv.includes('--no-screenshots'))return;try{await access(path);if(!process.argv.includes('--force-screenshots'))return;}catch{}await page.screenshot({path});};
try {
  try{browser=await chromium.launch({headless:true});}catch(error){if(!error.message.includes("Executable doesn't exist"))throw error;browser=await chromium.launch({headless:true,channel:'chrome'});report.browser='Installed Chrome fallback';}
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const width of [320,768,1024,1400]) {
    await page.setViewportSize({width,height:1000});await page.goto(`${base}/showcase/typography.html`);await page.waitForSelector('html[data-typography-ready]');await page.evaluate(()=>document.fonts.ready);
    const observed=await page.locator('[data-semantic]').evaluateAll(nodes=>nodes.map(n=>{const t=n.querySelector('.ps-type'),s=getComputedStyle(t);return{id:n.dataset.source,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:Number(s.fontWeight),letter:s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing)};}));
    assert.equal(observed.length,28);
    for(const item of observed){const expected=source.variants.find(v=>v.id===item.id).text[0];assert.equal(item.size,expected.size,`${width}/${item.id} size`);assert.equal(item.line,expected.line.value,`${width}/${item.id} line`);assert.equal(item.weight,expected.weight);assert.equal(item.letter,0);}
    const fixedObserved=await page.locator('[data-fixed]').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n.querySelector('.ps-type'));return{id:n.dataset.source,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:Number(s.fontWeight)};}));assert.equal(fixedObserved.length,10);
    for(const item of fixedObserved){const expected=fixed.find(v=>v.id===item.id).children[0];assert.equal(item.size,expected.size);assert.equal(item.line,expected.line.value);assert.equal(item.weight,expected.weight);}
    const pairs=await page.locator('[data-pair-example]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.pairExample,gap:parseFloat(getComputedStyle(n).gap),text:[...n.children].map(t=>{const s=getComputedStyle(t);return{size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:Number(s.fontWeight)};})})));assert.equal(pairs.length,64);
    for(const item of pairs){const expected=groups.flatMap(g=>g.children).find(v=>v.id===item.id);assert.equal(item.gap,expected.gap,`${width}/${item.id} gap`);const text=pairSources.find(v=>v.id===item.id).text;for(let i=0;i<2;i++){assert.equal(item.text[i].size,text[i].size,`${width}/${item.id}/${i} size`);assert.equal(item.text[i].line,text[i].line.value,`${width}/${item.id}/${i} line`);assert.equal(item.text[i].weight,text[i].weight);}}
    const auto=await page.locator('.type-showcase-live [data-type="h3"]').evaluate(n=>parseFloat(getComputedStyle(n).fontSize));assert.equal(auto,width<1024?32:48);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} overflow`);
    const actualTokens=await page.locator('#type-token-catalog [data-token-name]').evaluateAll(rows=>rows.map(r=>r.dataset.tokenName).sort());assert.deepEqual(actualTokens,tokenNames);
    assert(await page.evaluate(()=>[...document.querySelectorAll('#type-token-catalog [data-token-name]')].every(r=>r.children[1].textContent===getComputedStyle(document.querySelector('#type-theme-scope')).getPropertyValue(r.dataset.tokenName).trim())));
    await page.selectOption('#type-theme','demo');await page.selectOption('#type-font','Georgia, serif');
    const changed=await page.locator('.type-showcase-live [data-type="h3"]').evaluate(n=>{const s=getComputedStyle(n);return{font:s.fontFamily,color:s.color,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight)};});assert.match(changed.font,/Georgia/);assert.equal(changed.color,'rgb(54, 32, 72)');assert.equal(changed.size,auto);assert.equal(changed.line,width<1024?36:52);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} font replacement overflow`);
    assert(await page.evaluate(()=>[...document.querySelectorAll('#type-theme-scope .ps-type')].every(n=>n.scrollWidth<=n.clientWidth+1))),`${width} clipped typography`;
    await page.click('#type-reset');assert.equal(await page.locator('#type-font').inputValue(),"'Partner Inter', Arial, sans-serif");
    if(width===320||width===1400)await shot(page.locator('#c-typography'),`${out}/Typography.${width}.png`);
    report.widths.push({width,semantic:28,fixed:10,pairs:64,overflow:false,fontReplacement:'PASS'});
  }
  // Compare actual source sample geometry at the source's 400px width; not a product width constraint.
  await page.setViewportSize({width:1400,height:1000});await page.addStyleTag({content:'.type-showcase-cell { box-sizing:content-box; width:400px; padding:0; } .type-showcase-grid { display:block; }'});
  for(const item of source.variants){const r=await page.locator(`[data-semantic][data-source="${item.id}"] .ps-type`).boundingBox();assert.equal(r.width,400);assert.equal(r.height,item.text[0].height);}
  for(const group of groups)for(const item of group.children){const r=await page.locator(`[data-pair-example="${item.id}"]`).boundingBox();assert.equal(r.width,400);assert.equal(r.height,item.height,`${item.id} source pair height`);}
  report.checks.push('source sample width400: semantic heights and64 pair heights match');
  const spec=await readFile(`${root}/components/foundations/typography.md`,'utf8');const snippet=spec.match(/```html\r?\n([\s\S]*?)```/)[1];
  await writeFile(`${work}/copy-check.html`,`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Copy check</title>${snippet}</html>`);
  await page.goto(`${base}/.pipeline/typography/copy-check.html`);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('[data-type="h3"]').evaluate(n=>getComputedStyle(n).fontSize),'48px');
  assert.equal(await page.locator('.ps-type-pair').evaluate(n=>getComputedStyle(n).gap),'24px');
  await page.setViewportSize({width:320,height:1000});assert.equal(await page.locator('[data-type="h3"]').evaluate(n=>getComputedStyle(n).fontSize),'32px');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-type="p1"]').evaluate(n=>n.textContent='ОченьДлинноеНазваниеПартнёрскогоПроекта'.repeat(12));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-type="p1"]').evaluate(n=>n.textContent='');assert.equal(await page.locator('[data-type="p1"]').evaluate(n=>n.getBoundingClientRect().height),0);
  report.checks.push('single entry CSS copyability; long unbroken text; empty paragraph; auto threshold');
  assert.deepEqual(errors,[]);report.result='PASS';console.log('PASS: Typography 28 semantic + 10 fixed + 64 pairs × 4 widths; 78 tokens, font/theme changes, source geometry and single-CSS copyability.');
} finally {await writeFile(`${out}/test-report.json`,JSON.stringify(report,null,2));await browser?.close();await new Promise(resolve=>server.close(resolve));await unlink(`${work}/copy-check.html`).catch(()=>{});}
