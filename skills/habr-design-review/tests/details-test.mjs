import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import {styledTextRuns} from '../scripts/figma-lib.mjs';
import {captureDetails} from '../scripts/capture-details.mjs';
import {auditDetails} from '../scripts/detail-audit.mjs';
import {inventoryLanguage,runLanguage,languageFindings} from '../scripts/language-review.mjs';
const root=fs.mkdtempSync(path.join(fs.existsSync('D:/.agent/backups')?'D:/.agent/backups':os.tmpdir(),'dr-details-'));
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=(script,...args)=>execFileSync(process.execPath,[path.join(skill,'scripts',script),...args],{encoding:'utf8'});
const write=(file,data)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data))};
const rect=(x,y,width,height)=>({x,y,width,height});
const style={color:'#1B272C','font-size':'16px','font-weight':'400','padding-left':'0px','padding-right':'0px','border-left-width':'0px','border-right-width':'0px'};
const text='1 месяц • 900 открытий контактов',dot=text.indexOf('•');
const node={characters:text,style:{fontFamily:'Inter',fontSize:16,fontWeight:400},fills:[{color:'#1B272C'}],
  characterStyleOverrides:Array.from(text,(_,i)=>i===dot?1:0),styleOverrideTable:{1:{fills:[{color:'#78909C',boundVariables:{color:{id:'gray'}}}]}}};
const runs=styledTextRuns(node,fills=>fills[0].color);
assert.equal(runs.find(r=>r.text==='•').style.color,'#78909C');assert.equal(runs.find(r=>r.text==='•').tokens.color.var,'gray');
const f={id:'f',kind:'text',name:'price',text,box:rect(20,20,400,24),style,textRuns:runs};
const p={id:1,tag:'div',text,fullText:text,sel:'.price',box:f.box,style:{...style,color:'rgb(27, 39, 44)'}};
write(path.join(root,'figma/figma-1024.json'),{frame:{w:1024,h:900},elements:[f]});
write(path.join(root,'page/page-1024.json'),{width:1024,elements:[p]});
cli('match-figma.mjs',root);
assert(JSON.parse(fs.readFileSync(path.join(root,'findings.json'))).findings.some(f=>f.textFragment==='•'));
const tsv=path.join(root,'runs.tsv'),converted=path.join(root,'converted.json');
fs.writeFileSync(tsv,'T\ttext\t20,20,400,24\tInter\tRegular\t16\t24\t0\t#1B272C\t\t'+text+'\t@details:'+JSON.stringify({rawBox:rect(20.25,20,400,24),rawText:text,textRuns:runs}));
cli('figma-rows.mjs',tsv,converted);const convertedText=JSON.parse(fs.readFileSync(converted)).elements[0];assert.equal(convertedText.rawBox.x,20.25);assert.equal(convertedText.textRuns.find(r=>r.text==='•').style.color,'#78909C');
let audit=auditDetails({elements:[f]},{elements:[p]},{sid:'1024',w:1024});
assert(audit.findings.some(f=>f.textFragment==='•'&&f.cause.status==='unverified'&&f.css.length===0));
assert.equal(auditDetails({elements:[{...f,textRuns:styledTextRuns({...node,characterStyleOverrides:[]},fills=>fills[0].color)}]},{elements:[p]},{sid:'1024',w:1024}).findings.length,0);
assert(auditDetails({elements:[{...f,textRuns:undefined}]},{elements:[p]},{sid:'1024',w:1024}).warnings.length);
// Exact short numeric controls and distinct inner/outer geometry.
const ft=(id,text,x,y)=>({id,kind:'text',text,box:rect(x,y,50,24),style});
const pt=(id,text,x,y)=>({id,tag:'span',text,fullText:text,box:rect(x,y,50,24),style,sel:'.t'+id});
const F={elements:[{id:'select',kind:'box',name:'select',layoutSizingHorizontal:'HUG',box:rect(10,10,100,40),style},ft('vat','22%',20,18)]};
const P={elements:[{id:1,tag:'button',cls:'!w-max',text:'',fullText:'22%',sel:'.vat',box:rect(10,10,97,40),rawBox:rect(10,10,96.8125,40),style},pt(2,'22%',20,18)]};
audit=auditDetails(F,P,{sid:'1024',w:1024});assert(audit.findings.some(f=>f.observation.actual===96.8125));
P.elements[0].fullText='24%';audit=auditDetails(F,P,{sid:'1024',w:1024});assert(!audit.findings.some(f=>f.auditType==='geometry'));assert(audit.warnings.length);
const fb={id:'card',kind:'box',name:'content',box:rect(8,10,752,100),rawBox:rect(8,10,752,100),strokesIncludedInLayout:false,
  style:{...style,'padding-left':'24px','padding-right':'24px','border-left-width':'1px','border-right-width':'1px','border-top-width':'1px','border-bottom-width':'1px'}};
const pb={id:10,tag:'section',box:fb.box,rawBox:fb.rawBox,sel:'.card',style:fb.style};
audit=auditDetails({elements:[fb,ft('a','Заголовок',32,30),ft('b','Подпись',32,60)]},{elements:[pb,pt(11,'Заголовок',33,30),pt(12,'Подпись',33,60)]},{sid:'768',w:768});
assert(audit.findings.some(f=>f.auditType==='inner-geometry'&&f.observation.reference===704&&f.observation.actual===702));
pb.style={...pb.style,'border-top-width':'0.666667px'};
audit=auditDetails({elements:[fb,ft('a','Заголовок',32,30),ft('b','Подпись',32,60)]},{elements:[pb,pt(11,'Заголовок',33,30),pt(12,'Подпись',33,60)],environment:{devicePixelRatio:1.5}},{sid:'768',w:768});
assert(audit.findings.some(f=>f.auditType==='fractional-border'&&f.geometry.environment.devicePixelRatio===1.5));
// Ledger sees identical language mistakes in both sources; never auto-approves them.
write(path.join(root,'figma/figma-1024.json'),{elements:[ft('a','1 сутки',10,10),ft('b','брендированый профиль',10,50)]});
write(path.join(root,'page/page-1024.json'),{elements:[pt(1,'1 сутки',10,10),pt(2,'брендированный профиль',10,50)]});
write(path.join(root,'findings.json'),{meta:{},findings:[{id:'existing'}]});
runLanguage(root,'init');const ledgerPath=path.join(root,'language-review.json');let ledger=JSON.parse(fs.readFileSync(ledgerPath));assert.equal(ledger.items.length,4);assert.equal(runLanguage(root,'verify').pending.length,4);assert.throws(()=>runLanguage(root,'apply'),/incomplete/);
for(const i of ledger.items){i.status='checked';if(i.text==='1 сутки'){Object.assign(i,{status:'issue',category:'agreement',suggestion:'одни сутки',reason:'Согласование числительного.',issueKey:'days'});}if(i.text==='брендированый профиль')Object.assign(i,{status:'issue',category:'spelling',suggestion:'брендированный профиль',reason:'Пропущена н.'});}
write(ledgerPath,ledger);runLanguage(root,'apply');const generated=JSON.parse(fs.readFileSync(path.join(root,'findings.json')));assert(generated.findings.some(f=>f.id==='existing'));assert.equal(generated.findings.filter(f=>f.basis==='language-review').length,2);assert(languageFindings(ledger).some(f=>f.kind==='bug'&&f.alsoMockup));assert(languageFindings(ledger).some(f=>f.kind==='mockup'));
runLanguage(root,'init');assert.equal(runLanguage(root,'verify').pending.length,0);
const changed=JSON.parse(fs.readFileSync(path.join(root,'page/page-1024.json')));changed.elements.push(pt(3,'Новый текст',20,80));write(path.join(root,'page/page-1024.json'),changed);assert.equal(runLanguage(root,'verify').pending.length,1);
// Browser extraction is real: inline spans, single symbols, fractional pixels and pseudo content.
const browser=await chromium.launch();
try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<div data-dr="1" style="width:96.8125px">1 месяц <span style="color:rgb(120,144,156)">•</span> 900</div><style>.pseudo:after{content:"·";color:gray}</style><div data-dr="2" class="pseudo">Подпись</div>');
  const captured=await page.evaluate(captureDetails);assert.equal(captured.elements[1].rawBox.width,96.8125);assert(captured.elements[1].textRuns.some(r=>r.text==='•'&&r.style.color==='rgb(120, 144, 156)'));assert(captured.elements[2].generated.some(r=>r.pseudo==='::after'));
  const render=path.join(root,'report');fs.mkdirSync(render);
  const png=new PNG({width:1024,height:200});png.data.fill(255);fs.writeFileSync(path.join(render,'site.png'),PNG.sync.write(png));
  write(path.join(render,'findings.json'),{meta:{title:'Details',audience:'developer',figmaUrl:'https://www.figma.com/design/example/file',testUrl:'https://example.test',widths:[{id:'1024',w:1024,bImg:'site.png'}]},findings:languageFindings(ledger),matches:[]});
  cli('build-report.mjs',render);await page.goto(pathToFileURL(path.join(render,'report.html')).href);await page.click('[data-tab="full"]');assert.equal(await page.locator('#view-full img').count(),1);assert.equal(await page.locator('#view-full .empty').count(),1);
  await page.click('[data-tab="bugs"]');assert(await page.locator('.card').count());await page.click('[data-tab="mockup"]');assert.equal(await page.locator('#view-mockup .card').count(),2);
  const before=fs.readFileSync(path.join(render,'report.html'),'utf8');cli('selftest.mjs',path.join(render,'report.html'));assert.equal(fs.readFileSync(path.join(render,'report.html'),'utf8'),before);assert.deepEqual(errors,[]);
  const designerData=JSON.parse(fs.readFileSync(path.join(render,'findings.json')));designerData.meta.audience='designer';write(path.join(render,'findings.json'),designerData);cli('build-report.mjs',render);cli('selftest.mjs',path.join(render,'report.html'));
}finally{await browser.close()}
console.log('Detail, language, fractional geometry and b-only report checks passed. '+root);
