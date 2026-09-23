<script setup lang="ts">
type Row = { position:number; name:string; rating:number; courses?:number; reviews?:number; partner?:boolean; href?:string }
defineProps<{ rows:Row[] }>()
</script>

<template>
  <div class="crs-rating-table"><div class="crs-rating-table__scroll">
    <div class="crs-rating-table__head"><strong>Онлайн-школы</strong><strong>Рейтинг</strong><strong>Курсы</strong><strong>Отзывы</strong></div>
    <Link v-for="row in rows" :key="row.name" class="crs-rating-table__row" :href="row.href || '#'" tone="inherit" layout="grid">
      <div><span>{{ row.position }}</span><span class="crs-rating-table__logo"><EntityLogo :label="row.name" size="s" /><img v-if="row.partner" class="partner" src="/courses/green-partner-icon.svg" alt="Партнёр"></span><span>{{ row.name }}</span></div>
      <span class="crs-rating-table__rating"><UIcon name="i-tabler-star-filled" />{{ row.rating.toFixed(2) }}</span><span>{{ row.courses || 0 }}</span><span>{{ row.reviews || 0 }}</span>
    </Link>
  </div></div>
</template>

<style scoped>
.crs-rating-table{box-sizing:border-box;width:100%;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white)}.crs-rating-table__scroll{min-width:calc(var(--crs-unit) * 496);overflow-x:auto}.crs-rating-table__head,.crs-rating-table__row{display:grid;grid-template-columns:minmax(calc(var(--crs-unit) * 256),1fr) calc(var(--crs-unit) * 120) calc(var(--crs-unit) * 120) calc(var(--crs-unit) * 120);align-items:center;gap:var(--crs-space-12)}.crs-rating-table__head{background:var(--crs-black-50);padding:calc(var(--crs-unit) * 18) var(--crs-space-24);font:600 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-rating-table__row{min-height:var(--crs-size-64);padding:0 var(--crs-space-24);color:var(--crs-black-850);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}.crs-rating-table__row:hover{background:var(--crs-black-50);text-decoration:none}.crs-rating-table__row>div{display:grid;grid-template-columns:calc(var(--crs-unit) * 28) var(--crs-size-32) minmax(0,1fr);align-items:center;gap:var(--crs-space-12)}.crs-rating-table__row>div>span:first-child{color:var(--crs-black-500)}.crs-rating-table__logo{position:relative;display:grid;width:var(--crs-size-32);height:var(--crs-size-32);place-items:center;border-radius:var(--crs-radius-8);background:var(--crs-black-50);color:var(--crs-black-200)}.crs-rating-table__logo>svg{width:var(--crs-size-24);height:var(--crs-size-24)}.crs-rating-table__logo .partner{position:absolute;right:calc(var(--crs-space-6) * -1);bottom:calc(var(--crs-space-6) * -1);width:var(--crs-size-16);height:var(--crs-size-16);color:var(--crs-green-500)}.crs-rating-table__rating{display:flex;align-items:center;gap:var(--crs-space-6)}.crs-rating-table__rating svg{width:var(--crs-size-20);height:var(--crs-size-20);color:var(--crs-yellow-500)}@media(max-width:479px){.crs-rating-table{margin:0 calc(var(--crs-unit) * -24);width:calc(100% + var(--crs-space-48));border-right:0;border-left:0;border-radius:0}.crs-rating-table__head,.crs-rating-table__row{grid-template-columns:minmax(var(--crs-size-232),1fr) var(--crs-size-112) var(--crs-size-68) var(--crs-size-68)}}
.crs-rating-table__rating,.crs-rating-table__rating .iconify{color:var(--crs-yellow-500)}
.crs-rating-table__logo{overflow:visible}.crs-rating-table__logo>img:first-child{width:var(--crs-size-32);height:var(--crs-size-32);border-radius:var(--crs-radius-8)}.crs-rating-table__logo .partner{position:absolute;right:calc(var(--crs-space-6) * -1);bottom:calc(var(--crs-space-6) * -1);width:calc(var(--crs-unit) * 18);height:calc(var(--crs-unit) * 18)}
</style>
