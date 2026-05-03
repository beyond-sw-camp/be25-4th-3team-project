<script setup>
import { ref } from 'vue'

import AppShellFooter from './AppShellFooter.vue'
import AppShellHeader from './AppShellHeader.vue'
import AppShellSidebar from './AppShellSidebar.vue'

// 사이드바 접힘 여부는 페이지 영역 확장과 함께 움직여야 하므로 레이아웃에서 관리한다.
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="flex min-h-svh bg-[#fafafa] font-sans text-neutral-900">
    <AppShellSidebar :collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppShellHeader />
      <main class="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-4">
        <RouterView />
      </main>
      <AppShellFooter />
    </div>
  </div>
</template>
