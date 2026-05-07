<script setup>
import { computed } from 'vue'
import {
  Boxes,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Settings,
  ShoppingCart,
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { sidebarNav } from '../config/appShellLayoutConfig'

const route = useRoute()

// 부모 레이아웃에서 전달받은 접힘 상태로 사이드바 표시 범위를 조절한다.
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

// menu 버튼 클릭 시 부모 레이아웃에 접기/펼치기 요청을 전달한다.
defineEmits(['toggle'])

const sidebarIconMap = {
  dashboard: LayoutDashboard,
  sourcing: PackageSearch,
  products: Boxes,
  orders: ShoppingCart,
  payment: CreditCard,
  revenue: CircleDollarSign,
  settings: Settings,
}

const getSidebarIcon = (iconName) => {
  // config에는 문자열만 저장하고, 실제 아이콘 컴포넌트는 여기에서 매핑한다.
  return sidebarIconMap[iconName]
}

// 사이드바 메뉴 높이와 텍스트 시작 위치는 여기에서 한 번에 조절한다.
const sidebarMenuStyle = {
  expandedNav: 'px-[15px]',
  groupGap: 'space-y-1',
  parentSpacing: 'pt-2 first:pt-0',
  parentRow: 'flex h-8 items-center gap-2 rounded-md px-2 text-[16px] no-underline transition',
  childRow: 'flex h-7 items-center rounded-md pl-9 pr-2 text-[16px] no-underline transition',
  collapsedRow:
    'flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center text-[10px] font-semibold leading-tight no-underline transition hover:bg-neutral-50',
}

const isActiveLink = (item) => route.path === item.to || route.path.startsWith(item.to + '/')

// heading에 설정된 firstChildTo와 link의 parentLabel로 메뉴 연결 상태를 계산한다.
const sidebarItems = computed(() =>
  sidebarNav.map((item) => {
    if (item.type !== 'heading') return item

    return {
      ...item,
      to: item.firstChildTo,
      isActive: sidebarNav.some(
        (navItem) =>
          navItem.type === 'link' && navItem.parentLabel === item.label && isActiveLink(navItem),
      ),
    }
  }),
)

// 접힌 사이드바에서는 대시보드와 대분류 메뉴만 남겨 빠르게 이동할 수 있게 한다.
const collapsedSidebarItems = computed(() =>
  sidebarItems.value.filter((item) => ['head_link', 'heading'].includes(item.type)),
)
</script>

<template>
  <aside
    class="sticky top-0 flex h-svh shrink-0 flex-col border-r bg-white"
    :class="collapsed ? 'w-[66px]' : 'w-[250px]'"
  >
    <!-- 접힌 상태에서도 다시 펼칠 수 있도록 menu 버튼은 항상 노출한다. -->
    <div
      class="flex h-[66px] items-center gap-3 py-4"
      :class="collapsed ? 'justify-center px-0' : 'pl-[17px] pr-6'"
    >
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-md text-neutral-700 transition hover:bg-neutral-100"
        :aria-label="collapsed ? '사이드바 펼치기' : '사이드바 접기'"
        :aria-expanded="(!collapsed).toString()"
        @click="$emit('toggle')"
      >
        <Menu :size="22" />
      </button>
      <RouterLink v-if="!collapsed" to="/" class="text-[25px] font-bold text-point no-underline">
        AutoSource
      </RouterLink>
    </div>
    <nav
      v-if="!collapsed"
      :class="['sidebar-scroll flex-1 overflow-y-auto py-2', sidebarMenuStyle.expandedNav]"
    >
      <ul :class="sidebarMenuStyle.groupGap">
        <template v-for="(item, i) in sidebarItems" :key="i">
          <!-- 사이드바 대분류 -->
          <li v-if="item.type === 'heading'" :class="sidebarMenuStyle.parentSpacing">
            <RouterLink
              v-if="item.to"
              :to="item.to"
              :class="[
                sidebarMenuStyle.parentRow,
                item.isActive
                  ? 'font-semibold text-point'
                  : 'font-bold text-neutral-600 hover:bg-neutral-50',
              ]"
            >
              <component
                :is="getSidebarIcon(item.icon)"
                v-if="getSidebarIcon(item.icon)"
                :size="20"
                aria-hidden="true"
              />
              {{ item.label }}
            </RouterLink>
            <span v-else :class="[sidebarMenuStyle.parentRow, 'font-bold text-neutral-600']">
              <component
                :is="getSidebarIcon(item.icon)"
                v-if="getSidebarIcon(item.icon)"
                :size="20"
                aria-hidden="true"
              />
              {{ item.label }}
            </span>
          </li>
          <li v-else-if="item.type === 'head_link'">
            <RouterLink
              :to="item.to"
              :class="[
                sidebarMenuStyle.parentRow,
                isActiveLink(item)
                  ? 'font-semibold text-point'
                  : 'font-bold text-neutral-600 hover:bg-neutral-50',
              ]"
            >
              <component
                :is="getSidebarIcon(item.icon)"
                v-if="getSidebarIcon(item.icon)"
                :size="20"
                aria-hidden="true"
              />
              {{ item.label }}
            </RouterLink>
          </li>
          <!-- 사이드 바 소분류 -->
          <li v-else class="py-0.5">
            <RouterLink
              :to="item.to"
              :class="[
                sidebarMenuStyle.childRow,
                isActiveLink(item)
                  ? 'font-semibold text-point'
                  : 'text-neutral-600 hover:bg-neutral-50',
              ]"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </template>
      </ul>
    </nav>
    <nav v-else class="flex-1 overflow-y-auto px-2 py-2">
      <ul class="space-y-2">
        <li v-for="(item, i) in collapsedSidebarItems" :key="i">
          <RouterLink
            v-if="item.to"
            :to="item.to"
            :class="[
              sidebarMenuStyle.collapsedRow,
              item.isActive || isActiveLink(item) ? 'text-point' : 'text-neutral-600',
            ]"
          >
            <component
              :is="getSidebarIcon(item.icon)"
              v-if="getSidebarIcon(item.icon)"
              :size="20"
              aria-hidden="true"
            />
            <span class="w-full truncate">{{ item.label }}</span>
          </RouterLink>
          <span v-else :class="[sidebarMenuStyle.collapsedRow, 'text-neutral-600']">
            <component
              :is="getSidebarIcon(item.icon)"
              v-if="getSidebarIcon(item.icon)"
              :size="20"
              aria-hidden="true"
            />
            <span class="w-full truncate">{{ item.label }}</span>
          </span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
/* 사이드바 메뉴 영역에 마우스를 올렸을 때만 스크롤바가 보이도록 처리한다. */
.sidebar-scroll {
  scrollbar-color: transparent transparent;
  scrollbar-width: thin;
}

.sidebar-scroll:hover {
  scrollbar-color: #d4d4d4 transparent;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 8px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 8px;
}

.sidebar-scroll:hover::-webkit-scrollbar-thumb {
  background-color: #d4d4d4;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
