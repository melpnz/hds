import { createResolver } from 'nuxt/kit'
import coursesAppConfig from './app.config'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  css: ['@fontsource-variable/inter', resolve('./app/assets/css/courses.css')],
  components: {
    dirs: [
      {
        path: resolve('./app/components'),
        pathPrefix: false,
        extendComponent(component) {
          if (component.pascalName === 'Link') return { ...component, priority: 11 }
        }
      }
    ]
  },
  appConfig: coursesAppConfig
})
