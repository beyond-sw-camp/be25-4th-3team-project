<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'
import { sidebarNav } from '../config/appShellLayoutConfig'

const route = useRoute()
const router = useRouter()
const user = ref(null)

const currentPageTitle = computed(() => {
  const activeItem = sidebarNav.find(
    (item) =>
      ['head_link', 'link'].includes(item.type) &&
      (route.path === item.to || route.path.startsWith(item.to + '/')),
  )

  if (!activeItem) return ''

  return activeItem.parentLabel
    ? `${activeItem.parentLabel} > ${activeItem.label}`
    : activeItem.label
})

const displayName = computed(() => {
  const data = user.value
  return data?.nickname || data?.name || data?.loginId || 'User'
})

onMounted(async () => {
  try {
    const response = await api.get('/users/me')
    user.value = response.data
  } catch (error) {
    console.error('Failed to fetch current user info:', error)
  }
})

function goToProfile() {
  router.push('/profile')
}
</script>

<template>
  <header
    class="flex h-[66px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6 lg:px-10"
  >
    <h1 class="m-0 text-xl font-bold leading-none text-neutral-900">{{ currentPageTitle }}</h1>
    <button
      type="button"
      class="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
      @click="goToProfile"
    >
      <span class="size-2 rounded-full bg-emerald-500" />
      {{ displayName }}
    </button>
  </header>
</template>
