<script setup lang="ts">
const contact = ref<'telegram' | 'phone'>('telegram')
const value = ref('')
const email = ref('')
const sent = ref(false)
function submit() { sent.value = true }
</script>

<template>
  <section class="crs-feedback-form" :data-state="sent ? 'success' : 'form'">
    <template v-if="!sent">
      <div class="crs-feedback-form__intro">
        <h3>Не нашли, что хотели?</h3>
        <p>Укажите свои контакты — мы с вами свяжемся, ответим на все вопросы и поможем подобрать обучение, чтобы вы были уверены в своем решении.</p>
      </div>
      <form class="crs-feedback-form__form" @submit.prevent="submit">
        <ButtonGroup v-model="contact" class="crs-feedback-form__methods" label="Способ связи" :items="[{ label: 'Телеграм', value: 'telegram' }, { label: 'Телефон', value: 'phone' }]" />
        <div class="crs-feedback-form__fields">
          <TextInput v-model="value" :type="contact === 'phone' ? 'tel' : 'text'" :placeholder="contact === 'phone' ? '+7 999 000-00-00' : 'Username'" :leading-icon="contact === 'phone' ? 'i-tabler-phone' : 'i-tabler-brand-telegram'" />
          <TextInput v-model="email" type="email" placeholder="Почта" aria-label="Почта" leading-icon="i-tabler-mail" />
        </div>
        <div class="crs-feedback-form__submit"><Button block type="submit">Отправить</Button><p>Нажимая на кнопку, вы соглашаетесь с <Link class="crs-feedback-form__legal-link" href="#">Условиями использования</Link> и <Link class="crs-feedback-form__legal-link" href="#">Политикой конфиденциальности</Link>.</p></div>
      </form>
    </template>
    <div v-else class="crs-feedback-form__success" role="status" aria-live="polite">
      <div><h3>Спасибо,<br>что доверились нам!</h3><p>Скоро с вами свяжется эксперт по рынку образования. Ожидайте звонка или сообщения в мессенджер.</p><Button variant="secondary" @click="sent = false">Отправить ещё</Button></div>
      <div class="crs-feedback-form__success-art" aria-hidden="true"><UIcon name="i-tabler-message-circle-check" /></div>
    </div>
  </section>
</template>

<style scoped>
.crs-feedback-form{position:relative;box-sizing:border-box;display:grid;width:100%;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--crs-space-16);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);padding:var(--crs-space-24);color:var(--crs-black-850)}.crs-feedback-form__intro{display:flex;flex-direction:column;gap:var(--crs-space-24)}.crs-feedback-form h3{margin:0;font:600 var(--crs-font-24)/var(--crs-leading-28) var(--crs-font-family);letter-spacing:var(--crs-letter-tight)}.crs-feedback-form p{margin:0;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-feedback-form__form{display:flex;grid-column:2/span 2;flex-direction:column;gap:var(--crs-space-24)}.crs-feedback-form__fields{display:flex;flex-direction:column;gap:var(--crs-space-12)}.crs-feedback-form__submit{display:flex;flex-direction:column;gap:var(--crs-space-8)}.crs-feedback-form__submit p{color:var(--crs-black-500);font-size:var(--crs-font-12);line-height:var(--crs-leading-16)}.crs-feedback-form__legal-link{color:var(--crs-blue-500)}.crs-feedback-form__success{display:grid;grid-column:1/-1;grid-template-columns:repeat(3,minmax(0,1fr))}.crs-feedback-form__success>div:first-child{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;gap:var(--crs-space-24)}.crs-feedback-form__success-art{display:grid;min-height:var(--crs-size-192);grid-column:2/span 2;place-items:center;margin:calc(var(--crs-space-12) * -1) calc(var(--crs-space-24) * -1) calc(var(--crs-space-24) * -1);background:linear-gradient(135deg,var(--crs-blue-50),var(--crs-success-art-end));color:var(--crs-blue-500)}.crs-feedback-form__success-art svg{width:var(--crs-size-112);height:var(--crs-size-112)}@media(max-width:767px){.crs-feedback-form{grid-template-columns:1fr}.crs-feedback-form__form{grid-column:auto}.crs-feedback-form__success{grid-template-columns:1fr}.crs-feedback-form__success-art{grid-column:auto;margin:var(--crs-space-16) calc(var(--crs-space-48) * -1) calc(var(--crs-space-24) * -1)}}
.crs-feedback-form__intro,.crs-feedback-form__form,.crs-feedback-form__fields,.crs-feedback-form__submit{min-width:0;width:100%}.crs-feedback-form h3,.crs-feedback-form p{overflow-wrap:anywhere}
</style>
