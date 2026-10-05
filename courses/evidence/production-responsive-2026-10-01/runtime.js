/* Reference-only layout adapter. Does not implement backend or UI Kit components. */
;(async () => {
  const script = document.currentScript
  const data = await fetch(new URL(script.dataset.reference, location.href)).then(r => r.json())
  const policy = document.querySelector('meta[http-equiv="Content-Security-Policy"]').outerHTML
  let mode
  let rerender
  const initializeCarousels = () => {
    for (const el of document.querySelectorAll('[data-reference-carousel]')) {
      const { params, index: initialIndex } = JSON.parse(el.dataset.referenceCarousel)
      if (!params) continue
      const track = el.querySelector('.swiper-wrapper')
      if (!track) continue
      const slides = [...track.children].filter(el => el.classList.contains('swiper-slide'))
      if (!slides.length) continue
      let index = Math.min(initialIndex || 0, slides.length - 1)
      const breakpoint = Object.keys(params.breakpoints || {}).map(Number).filter(w => w <= innerWidth).sort((a,b) => b-a)[0]
      const current = { ...params, ...(params.breakpoints?.[breakpoint] || {}) }
      const ads = current.slidesPerView === 'auto'
      const gap = Number(current.spaceBetween || 0)
      const style = getComputedStyle(el)
      const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const count = ads ? 1 : Number(current.slidesPerView)
      const width = ads ? (innerWidth < 768 ? available : 568) : (available - (count-1)*gap)/count
      const draw = () => {
        slides.forEach((slide, i) => {
          slide.style.width = width + 'px'
          slide.style.flexShrink = '0'
          slide.style.marginRight = gap + 'px'
          slide.classList.toggle('swiper-slide-active', i === index)
          slide.classList.toggle('swiper-slide-prev', i === index-1)
          slide.classList.toggle('swiper-slide-next', i === index+1)
          if (ads) slide.style.transform = i === index ? 'scale(1)' : 'scale(.87)'
        })
        track.style.transitionDuration = '0ms'
        track.style.transform = `translate3d(${(current.centeredSlides ? (available-width)/2 : 0) - index*(width+gap)}px,0,0)`
        el.dataset.referenceIndex = String(index)
      }
      const move = delta => { index = (index + delta + slides.length) % slides.length; draw() }
      let parent = el.parentElement
      let arrows = []
      for (let i=0; i<4 && parent; i++,parent=parent.parentElement) {
        const buttons = [...parent.querySelectorAll('button')].filter(b => b.className.includes('swiper-button-shadow'))
        if (buttons.length === 2) { arrows = buttons; break }
      }
      arrows.forEach((button,i) => {
        button.disabled = false
        button.setAttribute('aria-label', i ? 'Следующий слайд (reference)' : 'Предыдущий слайд (reference)')
        button.onclick = event => { event.preventDefault(); move(i ? 1 : -1) }
      })
      let start
      el.style.touchAction = 'pan-y'
      el.addEventListener('pointerdown', event => { start = event.clientX })
      el.addEventListener('pointerup', event => { if (start !== undefined && Math.abs(event.clientX-start)>40) move(event.clientX<start?1:-1); start=undefined })
      el.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault();move(event.key==='ArrowRight'?1:-1) } })
      el.tabIndex = 0
      draw()
    }
  }
  const render = async () => {
    const next = innerWidth < 768 ? 'phone' : innerWidth < 1024 ? 'tablet' : 'desktop'
    // Rebuild on fluid resize too: widths of source Swiper slides are inline pixels.
    mode = next
    const parsed = new DOMParser().parseFromString(`<head>${data[mode].head}</head><body>${data[mode].body}</body>`, 'text/html')
    document.head.innerHTML = policy + parsed.head.innerHTML
    document.body.replaceChildren(...parsed.body.childNodes)
    document.documentElement.style.setProperty('--header-height', document.querySelector('header')?.getBoundingClientRect().height + 'px')
    await document.fonts.ready
    initializeCarousels()
    // Prevent live routes and requests from this evidence-only document.
    document.body.addEventListener('submit', event => event.preventDefault())
    document.body.addEventListener('click', event => {
      const link = event.target.closest('a')
      if (link && !link.getAttribute('href')?.startsWith('#')) {
        event.preventDefault()
        parent.postMessage({ type:'courses-reference-action',message:'Это эталон геометрии. Переходы, формы и backend отключены; откройте источник для реального действия.' },location.origin)
      }
    })
    document.documentElement.dataset.referenceReady = mode
    parent.postMessage({ type:'courses-reference-ready',mode,width:innerWidth },location.origin)
  }
  window.addEventListener('resize', () => { clearTimeout(rerender);rerender=setTimeout(render,100) })
  await render()
})().catch(error => { document.body.textContent = `Reference loading error: ${error.message}`; throw error })
