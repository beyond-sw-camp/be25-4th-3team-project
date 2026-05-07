<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, default: undefined },
  name: { type: String, default: undefined },
  modelValue: { type: [String, Number], default: undefined },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v),
  },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const sizeClass = computed(() => {
  // 오른쪽 화살표와 텍스트가 같은 기준의 내부 여백을 갖도록 padding을 고정한다.
  return props.size === 'sm' ? 'py-1 pl-2 pr-8 text-sm' : 'py-2 pl-3 pr-9 text-sm'
})

const valueAttrs = computed(() => {
  // v-model을 쓰지 않는 select는 첫 번째 option이 기본값으로 보이도록 value 바인딩을 생략한다.
  return props.modelValue === undefined ? {} : { value: props.modelValue }
})

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
  emit('change', event)
}
</script>

<template>
  <span class="relative inline-block min-w-[120px]">
    <select
      v-bind="valueAttrs"
      :id="id"
      :name="name"
      :disabled="disabled"
      :class="[
        'w-full appearance-none rounded-md border border-neutral-300 bg-white text-neutral-800 transition-colors disabled:bg-neutral-100 disabled:text-neutral-400',
        sizeClass,
      ]"
      @change="handleChange"
    >
      <slot />
    </select>
    <span
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500"
      aria-hidden="true"
    >
      ▼
    </span>
  </span>
</template>
