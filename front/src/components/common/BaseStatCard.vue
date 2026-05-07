<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  tone: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'muted', 'warning', 'danger'].includes(v),
  },
})

const valueClass = computed(() => {
  // 통계 값의 의미에 따라 색상을 통일한다.
  switch (props.tone) {
    case 'primary':
      return 'text-point'
    case 'muted':
      return 'text-neutral-400'
    case 'warning':
      return 'text-amber-600'
    case 'danger':
      return 'text-red-600'
    default:
      return 'text-neutral-900'
  }
})
</script>

<template>
  <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
    <p class="text-sm text-neutral-500">{{ label }}</p>
    <p :class="['mt-2 text-2xl font-bold', valueClass]">{{ value }}</p>
  </div>
</template>
