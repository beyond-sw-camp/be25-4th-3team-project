<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 버튼의 시각적 용도: primary(기본), secondary(보조), soft(선택 상태), ghost(텍스트), danger(삭제/위험)
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'soft', 'ghost', 'danger'].includes(v),
  },
  // 버튼 크기: sm은 작은 컨트롤/페이지네이션, md는 기본, lg는 저장 버튼처럼 큰 액션에 사용한다.
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v),
  },
})

defineEmits(['click'])

const variantClass = computed(() => {
  // variant별 색상 규칙은 여기에서만 관리해서 화면마다 버튼 색상이 달라지지 않게 한다.
  switch (props.variant) {
    case 'secondary':
      return 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
    case 'soft':
      return 'border border-point bg-point/10 text-point hover:bg-point/15'
    case 'ghost':
      return 'border-0 bg-transparent px-0 py-1 text-point underline-offset-2 hover:underline'
    case 'danger':
      return 'border-0 bg-transparent px-0 py-1 text-red-600 underline-offset-2 hover:underline'
    default:
      return 'border-0 bg-point text-white hover:bg-point/90'
  }
})

const sizeClass = computed(() => {
  // ghost/danger는 링크형 버튼이므로 padding 없이 글자 크기만 조절한다.
  if (['ghost', 'danger'].includes(props.variant)) {
    return props.size === 'sm' ? 'text-xs' : 'text-sm'
  }

  switch (props.size) {
    case 'sm':
      return 'rounded px-3 py-1.5 text-xs font-medium'
    case 'lg':
      return 'rounded-lg px-4 py-3 text-sm font-semibold'
    default:
      return 'rounded-md px-4 py-2 text-sm font-medium'
  }
})

const layoutClass = computed(() => [sizeClass.value, props.block ? 'w-full' : ''].join(' '))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      layoutClass,
      variantClass,
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
