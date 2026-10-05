;(async () => {
  const atlas = await fetch('../machine/page-analysis/atlas.json').then(r=>r.json())
  const frame = document.querySelector('#preview')
  let page, width='full'
  const el = (tag,text) => { const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node }
  const nav=document.querySelector('#navigation')
  atlas.pages.forEach(p => { const link=el('a',p.title);link.href='#'+p.id;link.className='nav-link';link.dataset.page=p.id;nav.append(link) })
  const cache = new Map()
  let serial=0
  const show = async () => {
    const turn=++serial
    const summary=atlas.pages.find(p=>p.id===location.hash.slice(1)) || atlas.pages[0]
    if (!cache.has(summary.id)) cache.set(summary.id,fetch('../'+summary.file).then(r=>r.json()))
    page=await cache.get(summary.id)
    if(turn!==serial)return
    document.querySelector('#item-title').textContent=page.title
    nav.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current',a.dataset.page===page.id?'page':'false'))
    frame.style.width=width==='full'?'100%':width+'px'
    frame.src='../'+page.reference
    const controls=document.querySelector('#viewport-controls');controls.replaceChildren()
    atlas.previewWidths.forEach(w=>{ const button=el('button',w==='full'?'Auto':String(w));button.type='button';button.setAttribute('aria-pressed',String(width===w));button.onclick=()=>{width=w;show()};controls.append(button) })
    const description=document.querySelector('#page-description');description.replaceChildren()
    const source=el('a','Открыть живую страницу');source.href=page.url;source.target='_blank';source.rel='noopener';description.append(source)
    description.append(el('h2','Порядок сборки'))
    const list=el('ol');page.sequence.forEach(s=>list.append(el('li',s)));description.append(list)
    description.append(el('h2','Особенности страницы'));const notes=el('ul');page.notes.forEach(n=>notes.append(el('li',n)));description.append(notes)
    if(page.ownerDecisions?.length){description.append(el('h2','Принятые решения для компонентной сборки'));const decisions=el('ul');page.ownerDecisions.forEach(d=>decisions.append(el('li',d.rule)));description.append(decisions)}
    description.append(el('h2','Компоненты и пробелы provider API'))
    description.append(el('p','Компоненты: '+page.providerComponents.join(', ')))
    description.append(el('p','Требуют согласования: '+page.approvalGaps.join(', ')))
    const measurement=page.measurements.find(m=>m.width===width)
    document.querySelector('#measurement').textContent=measurement?JSON.stringify(measurement,null,2):'Auto — ширина контейнера. Адресные замеры доступны в машинной спецификации; произвольная ширина не считается отдельно измеренной на production.'
    const rules=document.querySelector('#page-rules');rules.replaceChildren(el('h2','Правила точной сборки'))
    atlas.rules.forEach(rule=>{const section=el('section');section.className='atlas-rule';section.append(el('h3',rule.id+' · '+rule.subject),el('p',rule.rule),el('p','Верно: '+rule.positive),el('p','Неверно: '+rule.negative));if(rule.exceptions)section.append(el('p','Исключения: '+rule.exceptions.join(' ')));rules.append(section)})
    document.querySelector('#reference-status').textContent=`${width==='full'?'Auto · по ширине контейнера':width+'px'} · production-reference, не UI Kit`
  }
  window.addEventListener('hashchange',show)
  window.addEventListener('message',event=>{if(event.source!==frame.contentWindow || event.origin!==location.origin)return;if(event.data?.type==='courses-reference-action')document.querySelector('#reference-status').textContent=event.data.message})
  document.querySelector('.catalog-toggle').onclick=event=>{const open=event.currentTarget.getAttribute('aria-expanded')!=='true';event.currentTarget.setAttribute('aria-expanded',String(open));document.querySelector('.sidebar').dataset.catalogOpen=String(open)}
  show()
})().catch(error=>{document.querySelector('#item-title').textContent=error.message;throw error})
