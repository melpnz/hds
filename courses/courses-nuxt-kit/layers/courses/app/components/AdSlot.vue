<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'РЕКЛАМА' })
</script>
<template><Carousel variant="ad-slot"><slot><AdCard title="Скидки до 60% на обучение в онлайн-школах" image="/courses/carousel/ad-promo.png" mobile-image="/courses/carousel/ad-promo-mobile.png" :label="label"/><AdCard title="Курсы дешевле, чем у школ" image="/courses/carousel/ad-previous.png" mobile-image="/courses/carousel/ad-previous-mobile.png" :label="label"/><AdCard title="Обучение работе с искусственным интеллектом" image="/courses/carousel/ad-ai.png" mobile-image="/courses/carousel/ad-ai.png" :label="label"/></slot></Carousel></template>
