import data from './typography-data.js';
const el = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; };
const cell = (name,id,mode) => { const box=el('div','type-showcase-cell'); box.dataset.psTypeMode=mode; box.dataset.source=id; box.append(el('span','type-showcase-label',name)); return box; };
const sample = (type,text,weight) => { const n=el('p','ps-type',text); n.dataset.type=type; if(weight)n.dataset.weight=weight; return n; };
for(const row of data.semantic) {
  const [,style,bp]=row.name.match(/Text style=(.*), Breakpoint=(.*)/);
  const box=cell(`${style} · ${bp}`,row.id,bp==='desktop'?'desktop':'mobile');
  box.dataset.semantic=''; box.append(sample(style.toLowerCase(),row.text[0].text)); box.append(el('div','type-showcase-source',`${row.text[0].size}/${row.text[0].line.value} px · ${row.id}`));
  document.querySelector('#type-semantic').append(box);
}
for(const row of data.fixed) {
  const [,style,weight]=row.name.match(/Text style=(.*), Font weight=(.*)/);
  const box=cell(`${style} · ${weight}`,row.id,'desktop'); box.dataset.fixed=''; box.append(sample(style,row.children[0].text,weight)); document.querySelector('#type-fixed').append(box);
}
for(const group of data.groups) for(const row of group.children) {
  const [,pair,bp]=row.name.match(/Text style=(.*), Breakpoint=(.*)/);
  const box=cell(`${pair} · ${bp} · gap ${row.gap}px`,row.id,bp==='desktop'?'desktop':'mobile');
  const p=el('div','ps-type-pair'); p.dataset.pair=pair.toLowerCase().replace(' + ','-'); p.dataset.pairExample=row.id;
  for(const type of pair.split(' + '))p.append(sample(type.toLowerCase(),type));
  box.append(p); document.querySelector('#type-pairs').append(box);
}
const scope=document.querySelector('#type-theme-scope');
const theme=document.querySelector('#type-theme'), font=document.querySelector('#type-font'), color=document.querySelector('#type-color');
for(const token of data.tokenCatalog) { const tr=el('tr'); tr.dataset.tokenName=token.name; tr.append(el('td','',token.name),el('td','type-showcase-value'),el('td','',token.description)); document.querySelector('#type-token-catalog').append(tr); }
function catalog() { const computed=getComputedStyle(scope); for(const row of document.querySelectorAll('[data-token-name]')) row.children[1].textContent=computed.getPropertyValue(row.dataset.tokenName).trim(); }
function apply() { scope.dataset.psTheme=theme.value; scope.style.setProperty('--ps-type-font',font.value); scope.style.setProperty('--ps-type-color',color.value); document.querySelector('#type-export').textContent=`.client-project {\n  --ps-type-font: ${font.value};\n  --ps-type-color: ${color.value};\n}`; catalog(); }
theme.addEventListener('change',()=>{color.value=theme.value==='demo'?'#362048':'#000000';apply();});
font.addEventListener('change',apply); color.addEventListener('input',apply);
document.querySelector('#type-reset').addEventListener('click',()=>{theme.value='source';font.selectedIndex=0;color.value='#000000';apply();});
document.querySelector('#type-copy').addEventListener('click',async()=>{const out=document.querySelector('#type-copy-status');try{await navigator.clipboard.writeText(document.querySelector('#type-export').textContent);out.textContent='CSS скопирован.';}catch{out.textContent='Копирование недоступно. Выделите CSS выше и скопируйте вручную.';}});
apply(); document.documentElement.dataset.typographyReady='true';
