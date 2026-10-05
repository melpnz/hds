<script setup lang="ts">
const props = withDefaults(defineProps<{
  author: string
  text?: string
  rating?: number
  date?: string
  course?: string
  courseHref?: string
  courseLogo?: string
  href?: string
  avatar?: string
  advantages?: string
  disadvantages?: string
  comment?: string
  verified?: boolean
  variant?: 'compact' | 'wide' | 'full'
}>(), {
  text: '',
  rating: 5,
  date: '4 сентября',
  course: 'Профессия авитолог: специалист по рекламе и продажам на Авито',
  courseHref: '#',
  href: '#',
  avatar: '/courses/avatar-default-user.svg',
  verified: true,
  variant: 'compact'
})

const sections = computed(() => [
  { label: 'Достоинства', value: props.advantages || props.text },
  { label: 'Недостатки', value: props.disadvantages },
  { label: 'Комментарий', value: props.comment }
].filter(section => section.value))
</script>

<template>
  <article class="crs-review-card" :class="`crs-review-card--${variant}`">
    <header class="crs-review-card__header">
      <Avatar class="crs-review-card__avatar" :src="avatar" :name="author" :size="48" />
      <div class="crs-review-card__author">
        <strong>{{ author }}</strong>
        <small>
          Пользователь
          <span v-if="verified" class="crs-review-card__verified">Хабра <img src="/courses/green-partner-icon.svg" alt="Проверенный пользователь"></span>
        </small>
      </div>
      <div class="crs-review-card__rating">
        <RatingBadge :value="rating" variant="stars" />
        <time>{{ date }}</time>
      </div>
    </header>

    <div class="crs-review-card__body">
      <Link class="crs-review-card__course" :href="courseHref" tone="inherit" layout="block">
        <Chip class="crs-review-card__chip" :class="{ 'crs-review-card__chip--with-logo': courseLogo }" tone="neutral" truncate>
          <EntityLogo v-if="courseLogo" class="crs-review-card__course-logo" :src="courseLogo" :alt="`Логотип курса ${course}`" :size="20" shape="circle" />
          <span>{{ course }}</span>
        </Chip>
      </Link>

      <div class="crs-review-card__text">
        <div class="crs-review-card__sections">
          <p v-for="section in sections" :key="section.label"><strong>{{ section.label }}:</strong> {{ section.value }}</p>
        </div>
        <span v-if="variant === 'compact'" class="crs-review-card__fade" aria-hidden="true" />
        <Link v-if="variant === 'compact'" class="crs-review-card__more" :href="href">Читать полностью</Link>
      </div>
    </div>

    <Link v-if="variant !== 'full'" class="crs-review-card__link" :href="href" :aria-label="`Отзыв ${author}`" tone="inherit" layout="block" />
  </article>
</template>

<style scoped>
.crs-review-card{position:relative;box-sizing:border-box;display:flex;width:var(--crs-size-260);min-width:0;max-width:100%;min-height:calc(var(--crs-unit) * 503);flex-direction:column;overflow:hidden;border:var(--crs-border-1) solid var(--crs-black-100);border-radius:var(--crs-radius-24);background:var(--crs-white);padding:var(--crs-space-24);color:var(--crs-black-850)}
.crs-review-card__header{display:grid;grid-template-columns:var(--crs-space-48) minmax(0,1fr);align-items:start;gap:var(--crs-space-12)}
.crs-review-card__avatar{width:var(--crs-size-48);height:var(--crs-size-48)}
.crs-review-card__author{display:grid;min-width:0;gap:var(--crs-space-4)}
.crs-review-card__author strong{font:600 var(--crs-font-18)/var(--crs-leading-22) var(--crs-font-family)}
.crs-review-card__author small{color:var(--crs-black-500);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-review-card__verified{display:inline-flex;align-items:center;gap:var(--crs-space-2);white-space:nowrap}
.crs-review-card__verified img{display:block;width:calc(var(--crs-unit) * 18);height:calc(var(--crs-unit) * 18)}
.crs-review-card__rating{grid-column:1/-1;display:flex;align-items:center;gap:var(--crs-space-8);margin-top:var(--crs-space-4)}
.crs-review-card__rating>span{display:flex}
.crs-review-card__rating time{color:var(--crs-black-500);font-size:var(--crs-font-12);white-space:nowrap}
.crs-review-card__body{display:flex;min-width:0;flex:1;flex-direction:column}
.crs-review-card__course{position:relative;z-index:2;display:block;width:max-content;max-width:100%;margin-top:var(--crs-space-16);color:var(--crs-black-850);text-decoration:none}
.crs-review-card__course:hover{text-decoration:none}
.crs-review-card__chip{box-sizing:border-box;max-width:100%}
.crs-review-card .crs-review-card__chip--with-logo{gap:var(--crs-space-6);padding:calc(var(--crs-space-2) + var(--crs-border-1)) var(--crs-space-8) calc(var(--crs-space-2) + var(--crs-border-1)) calc(var(--crs-space-2) + var(--crs-border-1))}
.crs-review-card__course:hover .crs-review-card__chip{background:var(--crs-black-100)}
.crs-review-card__text{position:relative;flex:1;margin-top:var(--crs-space-16);font:400 var(--crs-font-14)/var(--crs-leading-20) var(--crs-font-family)}
.crs-review-card__sections{display:grid;gap:var(--crs-space-6)}
.crs-review-card__sections p{margin:0;overflow-wrap:anywhere}
.crs-review-card--compact{height:calc(var(--crs-unit) * 503)}
.crs-review-card--compact .crs-review-card__sections{max-height:calc(var(--crs-unit) * 258);overflow:hidden}
.crs-review-card__fade{position:absolute;right:0;bottom:var(--crs-space-20);left:0;height:var(--crs-size-100);background:linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--crs-white) 35%,transparent) 32%,color-mix(in srgb,var(--crs-white) 78%,transparent) 66%,var(--crs-white) 100%)}
.crs-review-card__more{position:absolute;z-index:3;bottom:0;left:0;width:100%;background:var(--crs-white);padding-top:var(--crs-space-8);color:var(--crs-blue-500);text-decoration:none}
.crs-review-card__link{position:absolute;z-index:1;inset:0}
.crs-review-card:hover{border-color:var(--crs-black-300)}
.crs-review-card--wide,.crs-review-card--full{width:100%;min-height:0;overflow:visible}
.crs-review-card--full .crs-review-card__rating{flex-direction:column;align-items:flex-end;gap:var(--crs-space-4)}
.crs-review-card--wide .crs-review-card__body,.crs-review-card--full .crs-review-card__body{padding-left:calc(var(--crs-space-48) + var(--crs-space-12))}
@media(min-width:768px){
  .crs-review-card--wide .crs-review-card__header,.crs-review-card--full .crs-review-card__header{grid-template-columns:var(--crs-space-48) minmax(0,1fr) calc(var(--crs-unit) * 164)}
  .crs-review-card--wide .crs-review-card__rating,.crs-review-card--full .crs-review-card__rating{grid-column:auto;justify-content:flex-end;margin-top:0}
}
@media(max-width:767px){
  .crs-review-card{width:100%}
  .crs-review-card--full .crs-review-card__rating{flex-direction:row;align-items:center;justify-content:flex-start;gap:var(--crs-space-8)}
  .crs-review-card--wide .crs-review-card__body,.crs-review-card--full .crs-review-card__body{padding-left:0}
}
</style>
