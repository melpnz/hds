import type { Ref } from 'vue'

// A shared stack keeps nested Kit sheets from taking focus from one another.
const scopes: symbol[] = []
export function useCoursesDialogFocus(open: Ref<boolean>, panel: Ref<HTMLElement | undefined>) {
  const nuxtApp = useNuxtApp()
  const scope = Symbol('courses-dialog')
  let previous: HTMLElement | null = null
  const active = () => open.value && scopes.at(-1) === scope
  const focusable = () => [...(panel.value?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex]') ?? [])]
    .filter(element => (element.tabIndex >= 0 || element.hasAttribute('data-option-item')) && !element.matches(':disabled') && element.getAttribute('aria-disabled') !== 'true' && !element.closest('[inert]') && element.getClientRects().length > 0)
  function focusFirst() {
    const items = focusable()
    const target = items.find(element => element.getAttribute('aria-selected') === 'true') ?? items[0] ?? panel.value
    target?.focus({ preventScroll: true })
  }
  function keydown(event: KeyboardEvent) {
    if (!active() || event.defaultPrevented) return
    if (event.key === 'Escape') { event.preventDefault(); open.value = false; return }
    if (event.key !== 'Tab') return
    const items = focusable()
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (!items.length) { event.preventDefault(); panel.value?.focus(); return }
    if (index >= 0 && items[index]!.tabIndex < 0) {
      event.preventDefault()
      items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      return
    }
    if (index < 0 || (!event.shiftKey && index === items.length - 1) || (event.shiftKey && index === 0)) {
      event.preventDefault()
      items[event.shiftKey ? items.length - 1 : 0]?.focus()
    }
  }
  function focusin(event: FocusEvent) {
    if (active() && panel.value && !panel.value.contains(event.target as Node)) focusFirst()
  }
  function release() {
    const index = scopes.indexOf(scope)
    if (index < 0) return
    const wasTop = scopes.at(-1) === scope
    scopes.splice(index, 1)
    if (wasTop && previous?.isConnected) previous.focus({ preventScroll: true })
    previous = null
  }
  onMounted(() => {
    document.addEventListener('keydown', keydown)
    document.addEventListener('focusin', focusin)
    watch(open, async value => {
      if (!value) { release(); return }
      previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
      scopes.push(scope)
      await nextTick()
      // An initially open SSR sheet must not mutate focus while descendants hydrate.
      if (nuxtApp.isHydrating) {
        onNuxtReady(() => { if (active()) focusFirst() })
        return
      }
      if (active()) focusFirst()
    }, { immediate: true, flush: 'post' })
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('focusin', focusin)
    release()
  })
}
