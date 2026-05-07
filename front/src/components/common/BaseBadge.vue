<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 상태 라벨의 의미에 따라 색상을 고른다. 업무 용어는 화면에서 slot으로 전달한다.
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'primary', 'success', 'warning', 'danger'].includes(v),
  },
})

const variantClass = computed(() => {
  // 배지 색상 규칙은 공통 컴포넌트 안에서만 관리한다.
  switch (props.variant) {
    case 'primary':
      return 'bg-point/10 text-point'
    case 'success':
      return 'bg-emerald-50 text-emerald-700'
    case 'warning':
      return 'bg-amber-50 text-amber-700'
    case 'danger':
      return 'bg-red-50 text-red-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
})
</script>

<template>
  <span :class="['inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', variantClass]">
    <slot />
  </span>
</template>
