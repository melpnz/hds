<script setup lang="ts">type Avatar={src?:string;name:string};withDefaults(defineProps<{items:Avatar[];limit?:number}>(),{limit:3})
</script>
<template><div class="crs-avatar-stack"><Avatar v-for="item in items.slice(0,limit)" :key="item.name" :src="item.src" :name="item.name" :size="24"/><Chip v-if="items.length>limit" variant="counter">+{{items.length-limit}}</Chip></div></template>
<style scoped>.crs-avatar-stack{display:flex;align-items:center}.crs-avatar-stack>.crs-avatar,.crs-avatar-stack>.crs-chip--counter{margin-left:calc(var(--crs-size-6) * -1);border:var(--crs-border-1) solid var(--crs-white)}.crs-avatar-stack>:first-child{margin-left:0}</style>
