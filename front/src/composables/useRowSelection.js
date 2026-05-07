import { computed, ref } from 'vue'

export function useRowSelection(rows, getKey = (_, index) => index) {
  const selectedKeys = ref([])

  const rowKeys = computed(() => rows.value.map((row, index) => getKey(row, index)))

  const allSelected = computed({
    get() {
      return (
        rowKeys.value.length > 0 && rowKeys.value.every((key) => selectedKeys.value.includes(key))
      )
    },
    set(checked) {
      // 헤더 체크박스를 선택하면 현재 행 전체를 선택하고, 해제하면 전체 선택을 비운다.
      selectedKeys.value = checked ? [...rowKeys.value] : []
    },
  })

  const isSelected = (key) => selectedKeys.value.includes(key)

  const toggleRow = (key, checked) => {
    if (checked) {
      selectedKeys.value = [...new Set([...selectedKeys.value, key])]
      return
    }

    selectedKeys.value = selectedKeys.value.filter((selectedKey) => selectedKey !== key)
  }

  return {
    selectedKeys,
    allSelected,
    isSelected,
    toggleRow,
  }
}
