import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {PNG} from 'pngjs';
import {chromium} from 'playwright';
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const parent=process.env.DR_TEST_ROOT||(fs.existsSync('D:/.agent/backups')?'D:/.agent/backups':os.tmpdir());
const root=fs.mkdtempSync(path.join(parent,'dr-report-ui-')),run=path.join(root,'recheck');
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value))};
const build=dir=>execFileSync(process.execPath,[path.join(skill,'scripts/build-report.mjs'),dir],{stdio:'pipe'});
function fixture(dir,meta={}){
  const widths=[1024,320].map(w=>({id:String(w),w,aImg:`figma/figma-${w}.png`,bImg:`page/page-${w}.png`}));
  for(const w of widths){const png=new PNG({width:w.w,height:200});png.data.fill(255);for(const file of [w.aImg,w.bImg]){fs.mkdirSync(path.dirname(path.join(dir,file)),{recursive:true});fs.writeFileSync(path.join(dir,file),PNG.sync.write(png))}}
  const finding=(id,kind,w,severity,category)=>({id,kind,widths:[w],severity,category,title:id,why:'Observed difference',fix:'Agreed correction',props:[],evidence:[{shot:String(w),a:[10,10,120,40],b:[10,10,120,40]}]});
  const data={meta:{title:'Перепроверка · Другая страница — дизайн-ревью',mode:'recheck',createdAt:'2026-11-02',startedAt:'2026-11-02T10:30:00+03:00',timeZone:'Europe/Moscow',testUrl:'https://stand.example.test/screen',figmaUrl:'https://www.figma.com/design/EXAMPLE/screen',widths,coverage:[{area:'Content',widths:[1024,320],status:'checked'}],method:'Compared at two widths.',...meta},findings:[finding('A','bug',1024,'minor','color'),finding('B','bug',320,'major','responsive'),finding('H','improvement',320,'discuss','responsive'),finding('M','mockup',1024,'minor','color')],matches:[]};
  write(path.join(dir,'findings.json'),data);build(dir);return data;
}
fixture(run);
const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const server=spawn(process.execPath,[path.join(skill,'scripts/serve-report.mjs'),run,'--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe']});let serverOutput='';for(const stream of [server.stdout,server.stderr])stream.on('data',s=>serverOutput+=s);
const url=`http://127.0.0.1:${port}/`;
const browser=await chromium.launch();
try{
  for(let i=0;;i++){try{const r=await fetch(url+'api/ping');if(r.ok)break}catch{}if(i>100)throw Error('Server failed: '+serverOutput);await new Promise(resolve=>setTimeout(resolve,50))}
  assert.equal((await fetch(url+'api/save',{method:'POST',body:'{}'})).status,403);
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Europe/Moscow'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.goto(url);
  assert.equal(await page.locator('#h1').textContent(),'Нейро-Степан: Другая страница (Перепроверка)');
  assert((await page.locator('.header-date').textContent()).includes('10:30'));
  assert.equal(await page.locator('#sub a').first().getAttribute('href'),'https://www.figma.com/design/EXAMPLE/screen');
  assert.equal(await page.locator('[data-tab]').first().getAttribute('data-tab'),'report');
  assert.equal(await page.locator('[data-tab="bugs"]').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#saveBtn,#jsonBtn,#reportBtn,#mkBtn,#progBar,[data-jira2],[data-tab="match"],[data-tab="scope"]').count(),0);
  assert.equal(await page.locator('.header-timestamps #autoSave').count(),1);
  const view=page.locator('#view-bugs');
  const rows=await view.locator('.dec-filters details').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().y));assert.equal(rows.length,3);assert(Math.max(...rows)-Math.min(...rows)<1);
  assert.equal(await view.locator('.fk,[data-g="w"],[data-g="cat"],[data-g="sev"]').count(),0);
  for(const group of ['sev','cat']){const menu=view.locator(`[data-facet-menu="${group}"]`);await menu.locator('summary').click();await menu.locator('[data-facet]').first().check();assert.equal(await view.locator('[data-card]').count(),1);await menu.locator('[data-facet]').nth(1).check();assert.equal(await view.locator('[data-card]').count(),2);await menu.locator('[data-facet-all]').check();await page.keyboard.press('Escape')}
  const width=view.locator('.width-filter:not(.facet-filter)');await width.locator('summary').click();await width.locator('[value="1024"]').check();assert.equal(await view.locator('[data-card]').count(),1);await width.locator('[data-width-all]').check();await page.keyboard.press('Escape');
  const styles=await page.locator('[data-card="A"] .meta-line>span').evaluateAll(els=>els.map(el=>({background:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopWidth})));
  assert(styles.every(s=>s.background==='rgba(0, 0, 0, 0)'&&s.border==='0px'));
  await page.click('[data-tab="report"]');assert.equal(await page.locator('.report-empty').count(),1);assert.equal(await page.locator('[data-report-start]').count(),1);
  assert(await page.evaluate(()=>doSave(true)));assert(fs.readdirSync(run).some(f=>/^feedback-.*\.json$/.test(f)));
  await page.click('[data-report-start]');await page.locator('[data-dec="A"] [data-v="bug"]').click();await page.locator('[data-note="A"]').fill('Persisted review comment');await page.locator('#h1').click();assert(await page.evaluate(()=>doSave(true)));
  const saved=fs.readFileSync(path.join(run,'report.html'),'utf8'),tag='<script type="application/json" id="decisions">',i=saved.indexOf(tag),embedded=JSON.parse(saved.slice(i+tag.length,saved.indexOf('</script>',i)));
  assert.equal(embedded.A.note,'Persisted review comment');assert(!saved.includes('<script>window.DR_SERVER='));
  assert.equal(JSON.parse(fs.readFileSync(path.join(run,'decisions.json'))).decisions.A.v,'bug');
  await page.evaluate(()=>localStorage.clear());await page.reload();assert.equal(await page.locator('[data-note="A"]').inputValue(),'Persisted review comment');
  await page.locator('[data-dec="B"] [data-v="mockup"]').click();await page.click('[data-tab="mockup"]');assert.equal(await page.locator('#view-mockup [data-card]').count(),2);
  await page.click('[data-tab="improve"]');await page.locator('[data-dec="H"] [data-v="take"]').click();await page.click('[data-tab="report"]');assert.deepEqual(await page.evaluate(()=>reportList().map(f=>f.id).sort()),['A','H']);
  for(let i=0;i<4;i++){await page.click('[data-tab="report"]');assert(await page.evaluate(()=>doSave(true)))}
  const feedback=JSON.parse(fs.readFileSync(path.join(run,fs.readdirSync(run).find(f=>/^feedback-.*\.json$/.test(f)))));assert.equal(feedback.findings.find(f=>f.id==='A').note,'Persisted review comment');
  await page.click('[data-tab="extra"]');assert(await page.locator('#view-scope .cov').isVisible());assert(await page.locator('[data-token-usage]').evaluate(el=>el.open));
  await page.evaluate(()=>{DATA.matches.push({area:'320 px',items:['Matched values']});tabs()});assert.equal(await page.locator('[data-tab="match"]').count(),1);
  await page.setViewportSize({width:390,height:844});await page.click('[data-tab="bugs"]');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  const compare=path.join(root,'compare');fixture(compare,{title:'Стенд и прод',mode:undefined,labels:{a:'Прод',b:'Стенд'},startedAt:undefined,pages:[{id:'one',title:'Первая',figmaUrl:'https://prod.example.test/one',testUrl:'https://stand.example.test/one'},{id:'two',title:'Вторая',figmaUrl:'https://prod.example.test/two',testUrl:'https://stand.example.test/two'}]});
  const offline=await context.newPage();offline.on('pageerror',error=>errors.push(error.message));await offline.goto(pathToFileURL(path.join(compare,'report.html')).href);
  assert.equal(await offline.locator('#h1').textContent(),'Нейро-Степан: Стенд и прод');assert(!(await offline.locator('.header-date').textContent()).includes('10:30'));assert.equal(await offline.locator('#sub a').count(),4);assert.equal(await offline.locator('[data-side="a"]').textContent(),'Прод');assert.equal(await offline.locator('[data-side="b"]').textContent(),'Стенд');assert.equal(await offline.locator('#saveBtn,#jsonBtn').count(),0);assert.deepEqual(errors,[]);
  for(const audience of ['designer','other','developer']){
    const roleDir=path.join(root,'role-'+audience),data=fixture(roleDir,{audience:'designer',...(audience==='developer'?{mode:undefined}:{})});
    data.findings.push({id:'F',kind:'fixed',recheck:'fixed',title:'Already fixed',why:'Verified correction',severity:'minor',category:'color',widths:[1024],props:[],evidence:[]});
    data.findings.push({id:'Q',kind:'qa',title:'Behavior check',why:'Check with QA',severity:'minor',category:'other',widths:[320],props:[],evidence:[]});
    data.findings.find(f=>f.id==='M').evidence[0].b=undefined;
    write(path.join(roleDir,'findings.json'),data);
    write(path.join(roleDir,'review-config.json'),{schema:'design-review-config/1',audience});build(roleDir);
    const rolePage=await context.newPage();rolePage.on('pageerror',error=>errors.push(error.message));await rolePage.goto(pathToFileURL(path.join(roleDir,'report.html')).href);
    const role=await rolePage.evaluate(async()=>{
      const initial=document.querySelector('[aria-selected="true"][data-tab]')?.dataset.tab,original=JSON.stringify(DATA.findings),metricsBefore=JSON.stringify(metrics());
      if(!DEVELOPER_REPORT){state.tab='report';tabs();await reportView()}
      const exported=await mdReport();
      return {audience:DATA.meta.audience,initial,ids:reportList().map(f=>f.id).sort(),warning:!!document.querySelector('.report-warning'),exportWarning:exported.md.includes(REPORT_WARNING)&&exported.html.includes(REPORT_WARNING),noMockupCapture:!exported.files.some(f=>f.name.includes('/M-')),rawUntouched:original===JSON.stringify(DATA.findings),metricsUntouched:metricsBefore===JSON.stringify(metrics()),verdicts:DATA.findings.filter(f=>decisions[f.id]?.v).length,feedbackAudience:feedbackPayload().run.audience};
    });
    assert.equal(role.audience,audience);assert.equal(role.feedbackAudience,audience);assert(role.rawUntouched&&role.metricsUntouched);assert.equal(role.verdicts,0);
    if(audience==='developer'){assert.equal(role.initial,'report');assert.deepEqual(role.ids,['A','B','F','H','M','Q']);assert(role.warning&&role.exportWarning&&role.noMockupCapture);assert.equal(await rolePage.locator('[data-rcard="M"] [data-rpair]').count(),0);assert.equal(await rolePage.locator('[data-rcard="Q"]').count(),1)}
    else{assert.equal(role.initial,'bugs');assert.deepEqual(role.ids,[]);assert.equal(role.warning,false);assert.equal(role.exportWarning,false)}
    await rolePage.close();
  }
  const invalid=path.join(root,'role-other');write(path.join(invalid,'review-config.json'),{audience:'invalid'});assert.throws(()=>build(invalid),/audience must be/);
  assert.deepEqual(errors,[]);
  console.log('Report UI checks passed: generic/multi-page header, role-specific report/exports without fake verdicts, filters, real HTML/feedback autosave, mockup/extra tabs and offline read mode. '+root);
}finally{await browser.close();server.kill();}
