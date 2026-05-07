<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
})

const emit = defineEmits(['update:currentPage'])

const pages = computed(() => Array.from({ length: props.totalPages }, (_, index) => index + 1))

const goToPage = (page) => {
  // 페이지 범위를 벗어난 이동은 막는다.
  if (page < 1 || page > props.totalPages || page === props.currentPage) return

  emit('update:currentPage', page)
}
</script>

<template>
  <nav class="mt-4 flex justify-center gap-1" aria-label="페이지 이동">
    <BaseButton
      variant="secondary"
      size="sm"
      :disabled="currentPage === 1"
      aria-label="이전 페이지"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </BaseButton>
    <BaseButton
      v-for="page in pages"
      :key="page"
      :variant="page === currentPage ? 'soft' : 'secondary'"
      size="sm"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="goToPage(page)"
    >
      {{ page }}
    </BaseButton>
    <BaseButton
      variant="secondary"
      size="sm"
      :disabled="currentPage === totalPages"
      aria-label="다음 페이지"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </BaseButton>
  </nav>
</template>
