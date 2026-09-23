export default defineNuxtConfig({
  extends: ['./layers/courses'],
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'theme-color', content: '#346ef4' },
        { name: 'color-scheme', content: 'light' }
      ]
    }
  },
  ui: {
    colorMode: false
  },
  typescript: {
    typeCheck: true
  }
})
