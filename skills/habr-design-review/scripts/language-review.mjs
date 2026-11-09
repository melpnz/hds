// A review ledger, not a dictionary pretending to understand grammar.
// The reviewing agent supplies contextual linguistic judgments.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
export function inventoryLanguage(run){
  const groups=new Map();
  for(const source of ['figma','page','prod','stand']){
    const dir=path.join(run,source);if(!fs.existsSync(dir))continue;
    const prefix=source==='figma'?'figma':'page';
    for(const name of fs.readdirSync(dir).filter(n=>new RegExp(`^${prefix}-\\d+.*\\.json$`).test(n))){
      const data=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')),els=data.elements||[];
      for(const e of els){
        // Full small phrases retain numerals split into child nodes. Avoid whole sections.
        const text=norm(source==='figma'?e.text:(e.rawText||e.fullText||e.text));
        if(!/[а-яё]/i.test(text)||source!=='figma'&&text.length>500||source==='figma'&&e.kind!=='text')continue;
        if(source!=='figma'&&els.some(c=>c!==e&&c.path&&e.path&&c.path.startsWith(e.path+'>')&&norm(c.rawText||c.fullText||c.text)===text))continue;
        const id='L-'+hash(source+'|'+text),item=groups.get(id)||{id,source,text,status:'pending',contexts:[]};
        item.contexts.push({source,shot:name.slice(prefix.length+1,-5),id:e.id,selector:e.sel,box:e.box,link:e.link,frame:e.frame,path:e.path});groups.set(id,item);
      }
    }
  }
  return [...groups.values()];
}
export function validateLanguage(ledger){
  return (ledger.items||[]).filter(i=>!['checked','issue','question','not-applicable'].includes(i.status)
    ||i.status==='not-applicable'&&!i.reason||['issue','question'].includes(i.status)&&(!i.suggestion||!i.reason||!i.category));
}
export function languageFindings(ledger){
  const grouped=new Map();
  for(const i of ledger.items||[]){
    if(!['issue','question'].includes(i.status))continue;
    const key=i.issueKey||norm(i.text)+'|'+norm(i.suggestion),g=grouped.get(key)||[];g.push(i);grouped.set(key,g);
  }
  return [...grouped].map(([key,items])=>{
    const site=items.some(i=>i.source!=='figma'),f=items[0],contexts=items.flatMap(i=>i.contexts);
    const origins=[...new Set(items.map(i=>i.source))];
    return {id:'LANG-'+hash(key),kind:site?'bug':'mockup',severity:items.some(i=>i.status==='question')?'discuss':'minor',category:'text',
      title:`Текст: «${f.text}» → «${f.suggestion}»`,why:items.map(i=>`${({page:'Сайт',figma:'Макет',prod:'Прод',stand:'Стенд'})[i.source]||i.source}: ${i.reason}`).join(' '),
      fix:f.suggestion,widths:[...new Set(contexts.map(c=>parseInt(c.shot,10)))].filter(Number.isFinite),props:[],evidence:[],
      basis:'language-review',languageSources:origins,languageContexts:contexts,alsoMockup:site&&origins.includes('figma'),
      observation:{text:items.map(i=>({source:i.source,text:i.text,suggestion:i.suggestion}))},
      sourceLinks:contexts.filter(c=>c.selector).map(c=>({selector:c.selector,shot:c.shot}))};
  });
}
export function runLanguage(run,action='init'){
  const file=path.join(run,'language-review.json');
  if(action!=='init'&&!fs.existsSync(file))throw Error('Run language-review init first');
  const prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{schema:'design-review-language/1',items:[]};
  if(action==='init'){
    prev.items=[...inventoryLanguage(run).map(i=>{const old=prev.items.find(p=>p.id===i.id);return {...i,...old,contexts:i.contexts}}),...prev.items.filter(i=>i.manual===true)];
    fs.writeFileSync(file,JSON.stringify(prev,null,2));
  }
  const missing=inventoryLanguage(run).filter(i=>!prev.items.some(p=>p.id===i.id)),pending=[...validateLanguage(prev),...missing];
  if(action==='apply'){
    if(pending.length)throw Error('Language review incomplete; resolve pending items before apply');
    const out=path.join(run,'findings.json'),data=JSON.parse(fs.readFileSync(out,'utf8'));
    // Stable IDs; only replace this ledger's generated records. Decisions live separately.
    data.findings=[...data.findings.filter(f=>f.basis!=='language-review'),...languageFindings(prev)];
    data.meta.languageReview={total:prev.items.length,reviewed:prev.items.length-pending.length,complete:!pending.length};
    fs.writeFileSync(out,JSON.stringify(data,null,2));
  }
  return {total:prev.items.length+missing.length,pending:pending.map(i=>({id:i.id,text:i.text,source:i.source}))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [run,action='init']=process.argv.slice(2);if(!run||!['init','verify','apply'].includes(action))throw Error('usage: language-review.mjs <run> [init|verify|apply]');
  const result=runLanguage(run,action);console.log(JSON.stringify(result,null,2));if(action==='verify'&&result.pending.length)process.exitCode=1;
}
