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
  },
  nitro: {
    prerender: {
      routes: [
        '/ui/accessibility-fixtures',
        '/ui/accessibility-visual-fixtures',
        '/ui/pages/courses-listing',
        '/ui/pages/course-category',
        '/ui/pages/education-centers-listing',
        '/ui/pages/rating',
        '/ui/pages/education-center',
        '/ui/pages/reviews',
        '/ui/pages/review-detail',
        '/ui/pages/promocodes',
        '/ui/pages/promocode-detail',
        '/ui/pages/authors',
        '/ui/pages/editors',
        '/ui/pages/author'
      ]
    }
  }
})
