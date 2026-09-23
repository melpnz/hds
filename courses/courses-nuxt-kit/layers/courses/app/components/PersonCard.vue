<script setup lang="ts">
withDefaults(defineProps<{ name:string; role?:string; description?:string; avatar?:string; href?:string; socialHref?:string }>(), {
  role: 'Эксперт', href: '#', socialHref: '#'
})
</script>

<template>
  <article class="crs-person-card">
    <div class="crs-person-card__identity">
      <div class="crs-person-card__avatar"><Avatar :src="avatar || '/courses/avatar-default-user.svg'" :name="name" size="person" /><span class="crs-person-card__company"><UIcon name="i-tabler-building" /></span></div>
      <div><h3>{{ name }}</h3><p>{{ role }}</p><SocialIcon class="crs-person-card__social" :href="socialHref" name="linkedin" label="LinkedIn" /></div>
    </div>
    <div v-if="description" class="crs-person-card__bio">{{ description }}</div>
    <span class="crs-person-card__fade" aria-hidden="true" />
    <Link class="crs-person-card__link" :href="href" :aria-label="name" tone="inherit" layout="block" />
  </article>
</template>

<style scoped>
.crs-person-card{position:relative;box-sizing:border-box;display:flex;width:var(--crs-size-260);max-height:calc(var(--crs-unit) * 365);flex-direction:column;gap:var(--crs-space-16);overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}
.crs-person-card__identity{display:flex;flex-direction:column;gap:var(--crs-space-12)}
.crs-person-card__avatar{position:relative;width:var(--crs-size-68);height:var(--crs-size-68)}
.crs-person-card__company{position:absolute;right:calc(var(--crs-space-2) * -1);bottom:calc(var(--crs-space-2) * -1);display:grid;width:calc(var(--crs-unit) * 28);height:calc(var(--crs-unit) * 28);box-sizing:border-box;place-items:center;border:var(--crs-border-2) solid var(--crs-white);border-radius:var(--crs-radius-8);background:var(--crs-black-50);color:var(--crs-black-400)}
.crs-person-card__company svg{width:var(--crs-size-16);height:var(--crs-size-16)}
.crs-person-card h3{margin:0;font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}.crs-person-card p{margin:var(--crs-space-4) 0 0;color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-person-card__social{position:relative;z-index:2;margin-top:var(--crs-space-8)}.crs-person-card__bio{min-height:0;overflow:hidden;font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-person-card__fade{position:absolute;right:0;bottom:var(--crs-space-24);left:0;height:var(--crs-size-56);background:linear-gradient(180deg,transparent,var(--crs-white));pointer-events:none}.crs-person-card__link{position:absolute;inset:0}.crs-person-card:hover{border-color:var(--crs-black-300)}.crs-person-card:focus-within{box-shadow:var(--crs-focus)}
.crs-person-card h3{letter-spacing:-.02em;white-space:nowrap}@media(max-width:479px){.crs-person-card{width:100%}}
</style>
<style scoped>@media(max-width:767px){.crs-person-card{width:100%}}</style>
