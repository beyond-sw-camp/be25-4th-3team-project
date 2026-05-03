<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  selectedKeys: {
    type: Array,
    default: () => [],
  },
  selectAllLabel: {
    type: String,
    default: '전체 선택',
  },
  rowSelectLabel: {
    type: Function,
    default: () => '행 선택',
  },
  emptyText: {
    type: String,
    default: '표시할 데이터가 없습니다.',
  },
  maxVisibleRows: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:selectedKeys'])
const tableContainerRef = ref(null)

function getRowKey(row, index) {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }

  return row?.[props.rowKey] ?? index
}

const rowKeys = computed(() => props.rows.map((row, index) => getRowKey(row, index)))

const allSelected = computed({
  get() {
    return (
      rowKeys.value.length > 0 && rowKeys.value.every((key) => props.selectedKeys.includes(key))
    )
  },
  set(checked) {
    emit('update:selectedKeys', checked ? [...rowKeys.value] : [])
  },
})

function isSelected(key) {
  return props.selectedKeys.includes(key)
}

function toggleRow(key, checked) {
  if (checked) {
    emit('update:selectedKeys', [...new Set([...props.selectedKeys, key])])
    return
  }

  emit(
    'update:selectedKeys',
    props.selectedKeys.filter((selectedKey) => selectedKey !== key),
  )
}

function toggleRowByClick(event, key) {
  // 버튼, 입력칸처럼 별도 동작이 있는 요소는 행 클릭 선택에서 제외한다.
  if (event.target.closest('button, input, textarea, select, a, label')) return

  toggleRow(key, !isSelected(key))
}

// 지정한 행 수만큼 테이블 높이를 고정해 행 추가 시 레이아웃 흔들림을 줄인다.
const tableHeightStyle = computed(() => {
  if (!props.maxVisibleRows) return {}

  const headerHeight = 41
  const rowHeight = 45

  return {
    height: `${headerHeight + props.maxVisibleRows * rowHeight}px`,
  }
})

// 빈 상태 문구를 실제 행 영역의 중앙에 배치한다.
const emptyCellStyle = computed(() => {
  if (!props.maxVisibleRows) return {}

  const rowHeight = 45

  return {
    height: `${props.maxVisibleRows * rowHeight}px`,
  }
})

const tableScrollClass = computed(() =>
  props.maxVisibleRows && props.rows.length >= props.maxVisibleRows
    ? 'overflow-y-auto'
    : 'overflow-y-hidden',
)

function scrollToBottom() {
  // 행 추가 후 새 행이 바로 보이도록 테이블 내부 스크롤을 아래로 이동한다.
  if (!tableContainerRef.value) return

  tableContainerRef.value.scrollTop = tableContainerRef.value.scrollHeight
}

defineExpose({ scrollToBottom })
</script>

<template>
  <div
    ref="tableContainerRef"
    class="overflow-x-auto rounded-lg border border-neutral-200 bg-white"
    :class="tableScrollClass"
    :style="tableHeightStyle"
  >
    <table class="w-full min-w-[1400px] text-sm">
      <thead class="sticky top-0 z-10 border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-600">
        <tr>
          <th class="w-12 px-4 py-3 align-middle text-center font-medium">
            <input
              v-model="allSelected"
              type="checkbox"
              class="rounded border-neutral-300"
              :aria-label="selectAllLabel"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 align-middle text-center font-medium"
            :class="column.headerClass"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td
            :colspan="columns.length + 1"
            class="px-4 text-center align-middle text-neutral-500"
            :style="emptyCellStyle"
          >
            {{ emptyText }}
          </td>
        </tr>
        <tr
          v-for="(row, index) in rows"
          v-else
          :key="getRowKey(row, index)"
          class="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
          @click="toggleRowByClick($event, getRowKey(row, index))"
        >
          <td class="px-4 py-4 align-middle text-center">
            <input
              type="checkbox"
              class="rounded border-neutral-300"
              :checked="isSelected(getRowKey(row, index))"
              :aria-label="rowSelectLabel(row, index)"
              @change="toggleRow(getRowKey(row, index), $event.target.checked)"
            />
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-4 align-middle text-center"
            :class="column.cellClass"
          >
            <slot :name="`cell-${column.key}`" :row="row" :index="index" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
