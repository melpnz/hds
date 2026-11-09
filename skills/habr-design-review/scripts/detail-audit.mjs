// Additional evidence-based pass. Does not assign designer verdicts or guess CSS causes.
const box = e => e.rawBox || e.box;
const inside = (a,b) => a && b && b.x >= a.x-1 && b.y >= a.y-1 && b.x+b.width <= a.x+a.width+1 && b.y+b.height <= a.y+a.height+1;
const norm = s => String(s || '').replace(/\s+/g,' ').trim();
const n = v => parseFloat(v) || 0;
const median = a => a.length ? a.sort((a,b)=>a-b)[Math.floor(a.length/2)] : 0;
const arr = b => [b.x,b.y,b.width,b.height];
const round = n => +n.toFixed(4);
const color = s => {
  if (/^#[\da-f]{6,8}$/i.test(s || '')) return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).concat(s.length===9?parseInt(s.slice(7),16)/255:1);
  const m = /^rgba?\(([^)]+)\)/.exec(s || '');
  if (!m) return null;
  const a=m[1].split(/[,\s/]+/).filter(Boolean).map(Number);return [...a.slice(0,3),a[3]??1];
};
function chars(el) {
  const text = el.rawText ?? el.text ?? '', out=[];
  for(let i=0;i<text.length;i++){
    const run=el.textRuns?.find(r=>i>=r.start&&i<r.end);
    const ch=text[i];if(/\s/.test(ch))continue;
    out.push({ch,index:i,style:run?.style || el.style || {},run});
  }
  return out;
}
export function auditDetails(F,P,{sid,w,state='default',fragment=false,anchors=[]}={}) {
  const findings=[],warnings=[], fTexts=F.elements.filter(e=>e.kind==='text'&&norm(e.text)), pEls=P.elements || [];
  const pairs=[],used=new Set();
  const dx=median(anchors.map(q=>box(q.p).x-box(q.f).x)),dy=median(anchors.map(q=>box(q.p).y-box(q.f).y));
  // Never invent an alignment for an unanchored fragment.
  if(fragment&&anchors.length<3)return {findings,warnings:[{shot:sid,reason:'detail audit: unanchored fragment'}]};
  for(const f of fTexts){
    const text=norm(f.text), fb=box(f);
    const candidates0=pEls.filter(p=>!used.has(p.id)&&norm(p.rawText??p.text)===text)
      .map(p=>({p,cost:Math.abs(box(p).x-fb.x-dx)+.25*Math.abs(box(p).y-fb.y-dy)})).sort((a,b)=>a.cost-b.cost);
    const candidates=[...new Map(candidates0.map(c=>[JSON.stringify(box(c.p)),c])).values()].sort((a,b)=>a.cost-b.cost);
    if(!candidates.length || candidates[0].cost>160 || candidates[1]&&Math.abs(candidates[1].cost-candidates[0].cost)<2)continue;
    const p=candidates[0].p; pairs.push({f,p}); used.add(p.id);
  }
  const emit=(type,f,p,property,a,b,note,extra={})=>{
    const fb=box(f),pb=box(p),label=f.text||f.name||'контейнер';
    findings.push({id:`DETAIL-${sid}-${findings.length+1}`,kind:'bug',auto:true,severity:'minor',category:type==='text-run'?(property==='color'?'color':'typography'):'size',
      title:`${property}: ${b} вместо ${a} · ${label.slice(0,65)}`,
      why:note, observation:{property,reference:a,actual:b},cause:{status:'unverified',note:'Причина требует проверки по DOM/CSS и кадру.'},
      fix:'Проверить на увеличенном кадре и подтвердить причину перед назначением CSS-исправления.',css:[],
      requiresVisualCheck:true,auditType:type,widths:[w],state,props:[{name:property,a:String(a),b:String(b)}],
      evidence:[{shot:sid,w,a:arr(fb),b:arr(pb),figmaNode:{id:f.id,name:f.name||f.text,link:f.link,frame:f.frame},dev:{b:{sel:p.sel,selN:p.selN,tag:p.tag}}}],...extra});
  };
  for(const {f,p} of pairs){
    if(!f.textRuns){if(/[•·]/.test(f.text))warnings.push({shot:sid,figmaNode:f.id,reason:'Нет диапазонов стиля: цвет разделителя проверить по PNG.'});continue;}
    const a=chars(f),b=chars(p);
    if(a.map(c=>c.ch).join('')!==b.map(c=>c.ch).join(''))continue;
    // Whole-layer uniform colors are already covered by the main matcher.
    const mixed=new Set(a.map(c=>JSON.stringify(c.style))).size>1 || new Set(b.map(c=>JSON.stringify(c.style))).size>1;
    if(!mixed && f.text.length>1)continue;
    const changes=new Map();
    for(let i=0;i<a.length;i++){
      const x=a[i],y=b[i];
      for(const prop of ['color','font-weight','font-size','font-family','letter-spacing','text-decoration']){
        const av=x.style[prop]??(prop==='text-decoration'?x.style['text-decoration-line']:undefined),bv=y.style[prop]??(prop==='text-decoration'?y.style['text-decoration-line']:undefined);
        if(av==null||bv==null)continue;
        let different=false;
        if(prop==='color'){const ca=color(av),cb=color(bv);if(cb)cb[3]*=Number(y.style.opacity??1);different=ca&&cb&&ca.reduce((s,v,k)=>s+Math.abs(v-cb[k])*(k===3?255:1),0)>12;}
        else if(prop==='text-decoration'){const deco=s=>String(s).toLowerCase().replace('strikethrough','line-through');different=deco(av)!==deco(bv);}
        else if(prop==='font-family')different=String(av).split(',')[0].replace(/["']/g,'').trim().toLowerCase()!==String(bv).split(',')[0].replace(/["']/g,'').trim().toLowerCase();
        else different=Math.abs(n(av)-n(bv))>=(prop==='font-weight'?100:prop==='letter-spacing'?.1:.5);
        if(different){const key=JSON.stringify([prop,av,bv]);const change=changes.get(key)||{prop,av,bv,text:''};change.text+=x.ch;changes.set(key,change);}
      }
    }
    for(const c of changes.values())emit('text-run',f,p,c.prop,c.av,c.bv,`В строке «${f.text}» отличается оформление фрагмента «${c.text}». Сравнение диапазонов текста, включая одиночные символы.`,{textFragment:c.text});
  }
  const done=new Set();
  for(const f of F.elements.filter(e=>e.kind==='box')){
    const fb=box(f), members=pairs.filter(q=>inside(fb,box(q.f)));
    const control=/select|button|textfield|кнопк/i.test(f.comp||f.name||'')&&fb.height<=80&&fb.width<=400;
    if(members.length<(control?1:2))continue;
    const ps=pEls.filter(p=>{
      const pb=box(p);return p.style&&members.every(q=>inside(pb,box(q.p)))&&Math.abs(pb.width-fb.width)<Math.max(20,fb.width*.12)&&Math.abs(pb.height-fb.height)<Math.max(8,fb.height*.2)
        &&(control?['button','select','input'].includes(p.tag)||p.role==='combobox':pb.height>40);
    }).sort((a,b)=>Math.abs(box(a).width-fb.width)+Math.abs(box(a).height-fb.height)-Math.abs(box(b).width-fb.width)-Math.abs(box(b).height-fb.height));
    if(!ps.length)continue;const p=ps[0],pb=box(p),key=`${f.id}|${p.id}`;if(done.has(key))continue;done.add(key);
    const fw=fb.width,pw=pb.width;
    // Hug widths are comparable only with identical complete labels, not shared substrings.
    const sameLabel=norm(p.fullText||p.rawText||p.text)===norm(fTexts.filter(t=>inside(fb,box(t))).map(t=>t.text).join(' '));
    const hug=f.layoutSizingHorizontal==='HUG'||/!w-max|w-max|w-fit/.test(p.cls||'');
    if(Math.abs(pw-fw)>.75 && (!hug||sameLabel))emit('geometry',f,p,'Внешняя ширина',round(fw),round(pw),'Измерены внешние границы сопоставленных контейнеров. Размеры не определяют механизм fill/hug или CSS-причину.');
    if(hug&&!sameLabel)warnings.push({shot:sid,figmaNode:f.id,selector:p.sel,reason:'Разные полные подписи hug-контрола: ширину проверить при одинаковом содержимом.'});
    const fi=fw-n(f.style?.['padding-left'])-n(f.style?.['padding-right'])-(f.strokesIncludedInLayout?n(f.style?.['border-left-width'])+n(f.style?.['border-right-width']):0);
    const pi=pw-n(p.style['padding-left'])-n(p.style['padding-right'])-n(p.style['border-left-width'])-n(p.style['border-right-width']);
    if(!control&&Math.abs(pw-fw)<.75&&Math.abs(pi-fi)>.75&&f.strokesIncludedInLayout!==undefined)
      emit('inner-geometry',f,p,'Внутренняя ширина',round(fi),round(pi),'Внешняя ширина совпадает; различается доступная область после padding и обводки. Дочерние сдвиги объединить с этой причиной после проверки.',{geometry:{reference:fb,actual:pb,environment:P.environment||null,site:p.geometry||null}});
    const ds=['top','right','bottom','left'].map(s=>[s,n(f.style?.[`border-${s}-width`]),n(p.style[`border-${s}-width`])]).filter(([,a,b])=>a>0&&b>0&&Math.abs(a-b)>.1&&Math.abs(a-b)<1);
    if(ds.length)emit('fractional-border',f,p,'Дробная толщина рамки',ds.map(([s,a])=>`${s}:${a}`).join(', '),ds.map(([s,,b])=>`${s}:${b}`).join(', '),'Пограничное отличие рамки: проверить масштаб, DPR, transform и видимые пиксели. Не округлять до 1 px и не назначать причину без подтверждения.',{geometry:{environment:P.environment||null,site:p.geometry||null}});
  }
  for(const p of pEls)if(p.generated?.length)warnings.push({shot:sid,selector:p.sel,generated:p.generated,reason:'Видимый generated content: проверить разделители/иконки по контексту и увеличенному кадру.'});
  return {findings,warnings};
}
