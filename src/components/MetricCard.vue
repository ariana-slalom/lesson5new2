<script setup lang="ts">
defineProps<{
  label: string
  value: string
  detail: string
  icon: string
  tone: 'blue' | 'green' | 'amber' | 'red'
}>()
</script>

<template>
  <article class="metric-card" :class="`metric-card--${tone}`">
    <div class="metric-card__topline">
      <span class="metric-card__label">{{ label }}</span>
      <v-icon :icon="icon" size="20" aria-hidden="true" />
    </div>
    <p class="metric-card__value">{{ value }}</p>
    <p class="metric-card__detail">{{ detail }}</p>
  </article>
</template>
