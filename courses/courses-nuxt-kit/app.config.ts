export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    modal: {
      slots: {
        overlay: 'bg-black/30',
        content: 'bg-white rounded-[24px] shadow-2xl ring-0'
      }
    }
  }
})
