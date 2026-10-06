import { chromium } from 'playwright'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=async file=>JSON.parse(await readFile(resolve(root,file),'utf8'))
const atlas=await read('machine/page-analysis/atlas.json')
assert.deepEqual(atlas.previewWidths,[320,480,768,1024,'full'],'preview contract matches guide and kit; audit widths are independent')
assert.equal(atlas.ownerDecisions.find(d=>d.id==='grid-tablet')?.status,'implemented-published')
assert.equal(atlas.ownerDecisions.find(d=>d.id==='carousel-loop')?.status,'implemented-published')
assert(atlas.pages.every(p=>!p.approvalGaps.includes('carousel-loop')),'implemented ordinary carousel leaves the approval queue')
assert.equal(atlas.ownerDecisions.find(d=>d.id==='banner-carousel')?.status,'implemented-published')
assert(atlas.pages.every(p=>!p.approvalGaps.includes('banner-carousel')),'implemented advertising carousel leaves the approval queue')
assert.equal(atlas.ownerDecisions.find(d=>d.id==='person-header-phone')?.status,'implemented-published')
assert(atlas.pages.every(p=>!p.approvalGaps.includes('person-header-phone')),'implemented PersonHeader phone layout leaves the approval queue')
assert.equal(atlas.ownerDecisions.find(d=>d.id==='school-course-grid')?.approvedGap,12)
assert.equal(atlas.ownerDecisions.find(d=>d.id==='school-course-grid')?.observedProductionGap,16)
assert(atlas.pages.every(p=>!p.approvalGaps.includes('grid-tablet')&&!p.approvalGaps.includes('school-course-grid')),'accepted grid decisions leave the approval queue')
const base=process.argv.find(arg=>arg.startsWith('http')) || 'http://127.0.0.1:4181'
const compatibility=await read('machine/compatibility.json')
const providerBase=compatibility.providers.find(p=>p.id==='courses-nuxt-kit').localCatalogBaseUrl
const chosen=process.argv.includes('--page')?process.argv[process.argv.indexOf('--page')+1].split(','):null
const errors=[],results=[],viewerResults=[]
const near=(actual,expected,label)=>{if(Math.abs(actual-expected)>1)throw new Error(`${label}: ${actual} vs ${expected}`)}
// Executable positive/forbidden cases for every composition rule, not prose-only examples.
const fixtures=[
  ['PA-01', n=>n.x===24 && n.width===345,{x:24,width:345},{x:16,width:361}],
  ['PA-02', n=>(n.viewport<768?'phone':n.viewport<1024?'tablet':'desktop')===n.mode,{viewport:744,mode:'phone'},{viewport:744,mode:'tablet'}],
  ['PA-03', n=>n.columns===3 && n.gap===12,{columns:3,gap:12},{columns:2,gap:12}],
  ['PA-04', n=>n.family==='profile'?n.gap===40:n.gap===48,{family:'profile',gap:40},{family:'profile',gap:48}],
  ['PA-05', n=>n.family==='school'&&n.width<768?n.pt===0:n.pt===24,{family:'school',width:393,pt:0},{family:'school',width:393,pt:40}],
  ['PA-06', n=>n.family==='search'&&n.width<768?n.height===108:n.height===64,{family:'search',width:393,height:108},{family:'search',width:393,height:64}],
  ['PA-07', n=>n.family==='category'?n.font===30:n.font===44,{family:'category',font:30},{family:'category',font:44}],
  ['PA-08', n=>n.width<768?n.summary && !n.form:n.form,{width:393,summary:true,form:false},{width:393,summary:false,form:true}],
  ['PA-09', n=>n.headingEnd+16===n.contentStart,{headingEnd:484,contentStart:500},{headingEnd:484,contentStart:516}],
  ['PA-10', n=>n.loop && n.step===1 && n.gap===12,{loop:true,step:1,gap:12},{loop:false,step:1,gap:16}],
  ['PA-11', n=>n.bodyWidth===n.viewport && n.tableInnerWidth>=516,{viewport:393,bodyWidth:393,tableInnerWidth:516},{viewport:393,bodyWidth:516,tableInnerWidth:516}],
  ['PA-12', n=>n.variant==='full' && !n.fade && n.sections===3,{variant:'full',fade:false,sections:3},{variant:'compact',fade:true,sections:1}],
  ['PA-13', n=>n.avatar===100 && n.direction==='column' && !n.border,{avatar:100,direction:'column',border:false},{avatar:70,direction:'row',border:false}],
  ['PA-14', n=>n.width===768?n.columns===3:n.columns===1,{width:768,columns:3},{width:768,columns:2}],
  ['PA-15', n=>!n.kitModified && !n.referenceAsProvider,{kitModified:false,referenceAsProvider:false},{kitModified:false,referenceAsProvider:true}],
]
assert.equal(fixtures.length,atlas.rules.length)
for(const[id,predicate,positive,negative]of fixtures){assert(atlas.rules.some(r=>r.id===id));assert(predicate(positive),id+' positive');assert(!predicate(negative),id+' forbidden')}
const manifest=await read('evidence/production-responsive-2026-10-01/assets/manifest.json')
for(const asset of manifest.assets){const bytes=await readFile(resolve(root,'evidence/production-responsive-2026-10-01/assets',asset.name));assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.name)}

const browser=await chromium.launch({headless:true})
const context=await browser.newContext({locale:'ru-RU',reducedMotion:'reduce'})
await context.route('**/*',route=>[new URL(base).origin,new URL(providerBase).origin].includes(new URL(route.request().url()).origin)?route.continue():route.abort())
await mkdir(resolve(root,'../.audits/courses-atlas-validation'),{recursive:true})
try{
 for(const summary of atlas.pages.filter(p=>!chosen || chosen.includes(p.id))){
  const contract=await read(summary.file)
  assert.equal(contract.measurements.length,7)
  for(const expected of contract.measurements){
   const page=await context.newPage();const pageErrors=[];const outside=[]
   page.on('pageerror',error=>pageErrors.push(error.message))
   page.on('request',r=>{if(!r.url().startsWith('data:')&&new URL(r.url()).origin!==new URL(base).origin)outside.push(r.url())})
   try{
    await page.setViewportSize({width:expected.width,height:900})
    await page.goto(base+'/'+contract.reference,{waitUntil:'networkidle'})
    await page.waitForFunction(()=>document.documentElement.dataset.referenceReady)
    await page.evaluate(()=>document.fonts.ready)
    assert.deepEqual(pageErrors,[],contract.id+' browser errors')
    assert.deepEqual(outside,[],contract.id+' external requests')
    const actual=await page.evaluate(expected=>{
      const visible=el=>!!el && el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0
      const measure=el=>{if(!el)return null;const r=el.getBoundingClientRect(),c=getComputedStyle(el);return{r:{x:r.x,y:r.y,width:r.width,height:r.height},css:{gap:c.rowGap,paddingTop:c.paddingTop,paddingBottom:c.paddingBottom,columns:c.gridTemplateColumns,fontSize:c.fontSize,lineHeight:c.lineHeight,fontWeight:c.fontWeight,position:c.position,fontFamily:c.fontFamily}}}
      return{body:document.documentElement.scrollWidth,header:measure(document.querySelector('header')),
       stack:measure(expected.stack?document.querySelector(expected.stack.selector):null),
       grids:expected.grids.map(g=>({expected:g,actual:measure(document.querySelector(g.selector))})),
       headings:expected.headings.map(g=>({expected:g,actual:measure(document.querySelector(g.selector))})),
       images:[...document.images].filter(i=>visible(i) && i.getAttribute('src') && (!i.complete||!i.naturalWidth)).map(i=>i.src),
       scriptCount:document.scripts.length,inlineEvents:[...document.querySelectorAll('*')].some(e=>[...e.attributes].some(a=>/^on/i.test(a.name))),
       carouselCount:document.querySelectorAll('[data-reference-carousel]').length}
    },expected)
    near(actual.body,expected.width,'body overflow')
    near(actual.header.r.height,expected.header.rect.height,'header height')
    assert.equal(actual.header.css.position,expected.header.css.position,'header position')
    assert(actual.header.css.fontFamily.includes('Inter'),'Inter font')
    assert.equal(actual.scriptCount,0,'source scripts removed')
    assert.equal(actual.inlineEvents,false,'inline event handlers removed')
    for(const image of actual.images) assert(image.endsWith('.missing'),`unexpected broken image ${image}`)
    if(expected.stack){assert(actual.stack,'missing page stack');near(actual.stack.r.x,expected.stack.rect.x,'stack x');near(actual.stack.r.width,expected.stack.rect.width,'stack width');assert.equal(actual.stack.css.gap,expected.stack.css.rowGap,'stack gap');assert.equal(actual.stack.css.paddingTop,expected.stack.css.paddingTop,'stack top');assert.equal(actual.stack.css.paddingBottom,expected.stack.css.paddingBottom,'stack bottom')}
    for(const {expected:g,actual:a}of actual.grids){assert(a,'missing grid '+g.selector);near(a.r.width,g.rect.width,'grid width');assert.equal(a.css.gap,g.css.rowGap,'grid row gap');const cols=a.css.columns.split(' '),source=g.css.gridTemplateColumns.split(' ');assert.equal(cols.length,source.length,'grid columns');cols.forEach((col,i)=>near(parseFloat(col),parseFloat(source[i]),'grid column width'))}
    for(const {expected:g,actual:a}of actual.headings){assert(a,'missing heading');assert.equal(a.css.fontSize,g.css.fontSize,'heading font');assert.equal(a.css.lineHeight,g.css.lineHeight,'heading lineheight');assert.equal(a.css.fontWeight,g.css.fontWeight,'heading weight')}
    assert.equal(actual.carouselCount,expected.carousels.length,'carousel count')
    if(expected.carousels.length){const carousel=page.locator('[data-reference-carousel]').first();const old=await carousel.getAttribute('data-reference-index');await carousel.press('ArrowRight');assert.notEqual(await carousel.getAttribute('data-reference-index'),old,'carousel next');const size=await carousel.locator('.swiper-slide').count();for(let i=1;i<size;i++)await carousel.press('ArrowRight');assert.equal(await carousel.getAttribute('data-reference-index'),old,'carousel wraps');await page.evaluate(()=>scrollTo(0,0))}
    await page.evaluate(()=>scrollTo(0,800))
    const headerY=await page.locator('header').first().evaluate(el=>el.getBoundingClientRect().y)
    if(expected.header.css.position==='sticky')near(headerY,0,'sticky header');else assert(headerY<0,'static header scrolls out')
    const sourceScroll=expected.scrollStates.find(state=>state.state==='scroll-800')
    if(sourceScroll){
      const actualScroll=await page.evaluate(()=>[...document.querySelectorAll('header,[class*="sticky"]')].slice(0,12).map(el=>({classes:el.getAttribute('class'),y:el.getBoundingClientRect().y,height:el.getBoundingClientRect().height,position:getComputedStyle(el).position})))
      for(const layer of sourceScroll.header){const actual=actualScroll.find(n=>n.classes===layer.classes);assert(actual,'scroll layer missing');near(actual.height,layer.height,'scroll layer height');if(layer.position==='sticky')near(actual.y,layer.y,'sticky layer y')}
    }
    if(contract.id==='promocode-detail' && expected.width>=768)assert.equal(await page.locator('input').first().inputValue(),'Яндекс Практикум','selected school preserved')
    await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)})
    if([1440,768,393].includes(expected.width)){
      await page.screenshot({path:resolve(root,`../.audits/courses-atlas-validation/${contract.id}-${expected.width}.png`),animations:'disabled'})
      // Visually inspect lower modules too, rather than declaring a page checked from its hero.
      await page.evaluate(()=>scrollTo(0,Math.max(0,document.documentElement.scrollHeight-1200)))
      await page.screenshot({path:resolve(root,`../.audits/courses-atlas-validation/${contract.id}-${expected.width}-bottom.png`),animations:'disabled'})
    }
    results.push({page:contract.id,width:expected.width,status:'passed'})
    console.log(`PASS ${contract.id} ${expected.width}`)
   }catch(error){errors.push(`${contract.id}/${expected.width}: ${error.message}`);results.push({page:contract.id,width:expected.width,status:'failed',error:error.message});console.log('FAIL '+errors.at(-1))}
   finally{await page.close()}
  }
  for(const boundary of contract.boundaryMeasurements || []){
   const page=await context.newPage()
   try{
    await page.setViewportSize({width:boundary.width,height:900});await page.goto(base+'/'+contract.reference,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.dataset.referenceReady)
    const measured=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.querySelector('header').getBoundingClientRect().height,grids:[...document.querySelectorAll('[class*="grid-cols-4"]')].filter(el=>el.getBoundingClientRect().height>0).map(el=>({classes:el.className,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,gap:getComputedStyle(el).gap}))}))
    near(measured.width,boundary.width,'boundary body');near(measured.height,boundary.header.height,'boundary header')
    for(const grid of boundary.grids){const actual=measured.grids.find(g=>g.classes===grid.classes);assert(actual,'boundary grid missing');assert.equal(actual.columns,grid.columns.split(' ').length,'boundary columns');assert.equal(actual.gap,grid.gap,'boundary gap')}
    results.push({page:contract.id,width:boundary.width,status:'passed',boundary:true});console.log(`PASS boundary ${contract.id} ${boundary.width}`)
   }catch(error){errors.push(`${contract.id}/${boundary.width} boundary: ${error.message}`);results.push({page:contract.id,width:boundary.width,status:'failed',boundary:true,error:error.message})}finally{await page.close()}
  }
 }
 const viewer=await context.newPage()
 await viewer.goto(base+'/viewer/pages.html')
 await viewer.locator('#navigation a').first().waitFor()
 assert.equal(await viewer.locator('#navigation a').count(),12)
 assert.deepEqual(await viewer.locator('#viewport-controls button').allTextContents(),['320','480','768','1024','Auto'])
 await viewer.locator('#viewport-controls button').filter({hasText:/^480$/}).click()
 await viewer.waitForFunction(()=>document.querySelector('#preview').style.width==='480px')
 await viewer.locator('#navigation a[href="#author"]').click()
 await viewer.waitForFunction(()=>document.querySelector('#item-title').textContent.includes('Николай'))
 await viewer.setViewportSize({width:393,height:900})
 await viewer.locator('.catalog-toggle').click()
 assert.equal(await viewer.locator('#navigation').isVisible(),true,'mobile catalog opens')
 await viewer.locator('.catalog-toggle').click()
 assert.equal(await viewer.locator('#navigation').isVisible(),false,'mobile catalog closes')
 await viewer.setViewportSize({width:1440,height:900})
 const viewerErrors=[]
 viewer.on('pageerror',error=>viewerErrors.push(error.message))
 await viewer.goto(base+'/viewer/#production-courses-listing')
 await viewer.locator('[data-item="production-courses-listing"]').waitFor()
 assert.equal(await viewer.locator('[data-item^="production-"]').count(),12,'12 pages in main guide')
 for(const summary of atlas.pages){
   await viewer.evaluate(id=>{location.hash='production-'+id},summary.id)
   await viewer.waitForFunction(id=>document.querySelector('#raw-json').textContent.includes('"id": "production-'+id+'"'),summary.id)
   assert.deepEqual(await viewer.locator('#viewport-controls button').allTextContents(),['320','480','768','1024','Auto'])
   assert.equal((await viewer.locator('#example-tabs [data-example]').first().textContent()).trim(),'Сборка из UI Kit','live page is the primary preview')
   assert.equal(await viewer.locator('[data-item="production-'+summary.id+'"]').getAttribute('aria-current'),'page')
   for(const width of atlas.previewWidths){
     await viewer.locator('#viewport-controls [data-width="'+width+'"]').click()
     const expected=width==='full'?'100%':width+'px'
     await viewer.waitForFunction(w=>document.querySelector('#preview').style.width===w,expected)
     const frame=viewer.locator('#preview').contentFrame()
     await frame.locator('[data-production-page="'+summary.id+'"]').waitFor()
     await frame.locator('html').evaluate(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,200))})
     const geometry=await frame.locator('html').evaluate(el=>({width:innerWidth,overflow:el.scrollWidth-innerWidth}))
     if(width!=='full')near(geometry.width,width,'main guide iframe width')
     else {
       const available=await viewer.locator('.preview-stage').evaluate(el=>el.clientWidth-parseFloat(getComputedStyle(el).paddingLeft)-parseFloat(getComputedStyle(el).paddingRight))
       near(geometry.width,available,'Auto follows container')
     }
     assert.equal(geometry.overflow,0,'no document overflow')
     viewerResults.push({page:summary.id,width,status:'passed',provider:'courses-nuxt-kit',actualWidth:geometry.width})
   }
 }
 await viewer.locator('#viewport-controls [data-width="full"]').click()
 await viewer.setViewportSize({width:1024,height:900})
 await viewer.locator('#preview').contentFrame().locator('html').evaluate(async()=>new Promise(r=>setTimeout(r,200)))
 const fluidWidth=await viewer.locator('#preview').contentFrame().locator('html').evaluate(()=>innerWidth)
 assert(fluidWidth<1024,'Auto changes with guide window')
 await viewer.locator('#guide-search').fill('production-promocode-detail')
 assert.equal(await viewer.locator('[data-item]').count(),1,'new section participates in search')
 await viewer.locator('#guide-search').fill('')
 await viewer.evaluate(()=>{location.hash='colors'})
 await viewer.waitForFunction(()=>document.querySelector('#raw-json').textContent.includes('"id": "colors"'))
 assert.equal(await viewer.locator('#preview').getAttribute('class'),'preview-frame','component mode restored')
 assert.deepEqual(viewerErrors,[],'main guide runtime errors')
 await viewer.close()
}finally{await browser.close()}
const report={generatedBy:'tools/validate-page-atlas.mjs',checkedAt:new Date().toISOString(),scope:'production-reference geometry and main guide preview integration; not provider equivalence',fixtureCases:fixtures.length*2,assetChecks:manifest.assets.length,results,viewerResults,errors}
await writeFile(resolve(root,'machine/reports/page-atlas-validation.json'),JSON.stringify(report,null,2)+'\n')
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`PASS: ${results.length} page/width scenarios, ${viewerResults.length} main-guide preview scenarios, ${fixtures.length*2} rule fixtures, ${manifest.assets.length} asset hashes`)
