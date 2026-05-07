<script setup>
import { computed, ref, watch } from 'vue'
import BaseCheckTable from '../common/BaseCheckTable.vue'
import BasePagination from '../common/BasePagination.vue'
import BaseSectionTitle from '../common/BaseSectionTitle.vue'

const text = {
  defaultTitle: '\uC8FC\uBB38 \uBAA9\uB85D',
  defaultSummary: '\uC804\uCCB4 \uC8FC\uBB38 \uAC74\uC218',
  orderColumn: '\uC8FC\uBB38\uBC88\uD638 / \uB9C8\uCF13',
  statusColumn: '\uC8FC\uBB38 \uC0C1\uD0DC',
  deliveryStatusColumn: '\uBC30\uC1A1 \uC0C1\uD0DC',
  buyerColumn: '\uACE0\uAC1D / \uC5F0\uB77D\uCC98',
  productColumn: '\uC8FC\uBB38 \uC0C1\uD488 / \uAC00\uACA9',
  marginColumn: '\uACB0\uC81C \uAE08\uC561 / \uB9C8\uC9C4',
  managementColumn: '\uAD00\uB9AC',
  totalSuffix: '\uAC74',
  selectedSuffix: '\uAC1C \uC120\uD0DD',
  searchPlaceholder:
    '\uC8FC\uBB38\uBC88\uD638 / \uACE0\uAC1D\uBA85 / \uC0C1\uD488\uBA85 \uAC80\uC0C9',
  loading: '\uC8FC\uBB38 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.',
  empty: '\uD45C\uC2DC\uD560 \uC8FC\uBB38\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  selectAll: '\uC8FC\uBB38 \uC804\uCCB4 \uC120\uD0DD',
  rowSelectSuffix: '\uC8FC\uBB38 \uC120\uD0DD',
  save: '\uC800\uC7A5',
  cancel: '\uCDE8\uC18C',
  edit: '\uC218\uC815',
}

const props = defineProps({
  title: { type: String, default: '\uC8FC\uBB38 \uBAA9\uB85D' },
  summaryLabel: { type: String, default: '\uC804\uCCB4 \uC8FC\uBB38 \uAC74\uC218' },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  manageable: { type: Boolean, default: false },
})

const emit = defineEmits(['shipment-status-change'])

const search = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedKeys = ref([])
const editingRowId = ref(null)
const draftShipmentStatus = ref('')
const shipmentOverrides = ref({})

const shipmentOptions = [
  { value: 'READY', label: '\uBC30\uC1A1 \uC900\uBE44 \uC911' },
  { value: 'SHIPPING', label: '\uBC30\uC1A1 \uC911' },
  { value: 'DELIVERED', label: '\uBC30\uC1A1 \uC644\uB8CC' },
]

const columns = [
  { key: 'order', label: text.orderColumn, cellClass: 'whitespace-nowrap w-[180px]' },
  { key: 'status', label: text.statusColumn, cellClass: 'whitespace-nowrap w-[180px]' },
  {
    key: 'deliveryStatus',
    label: text.deliveryStatusColumn,
    cellClass: 'whitespace-nowrap w-[180px]',
  },
  { key: 'buyer', label: text.buyerColumn, cellClass: 'whitespace-nowrap w-[240px]' },
  { key: 'product', label: text.productColumn, cellClass: 'w-[420px]' },
  { key: 'margin', label: text.marginColumn, cellClass: 'whitespace-nowrap w-[180px]' },
  {
    key: 'management',
    label: text.managementColumn,
    cellClass: 'whitespace-nowrap w-[180px] text-center',
    headerClass: 'text-center',
  },
]

const currency = (value) => new Intl.NumberFormat('ko-KR').format(value || 0)

function formatPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }

  return value || '-'
}

function canEditShipment(row) {
  return row.orderStatusCode === 'PAID'
}

const normalizedRows = computed(() => {
  return props.rows.map((row) => {
    const override = shipmentOverrides.value[row.orderId]

    return {
      id: row.orderId,
      market: row.overseasMall || '-',
      orderStatus: row.statusLabel || row.status || '-',
      orderStatusCode: row.status || '',
      deliveryStatus: override?.label || row.shipmentStatusLabel || '-',
      deliveryStatusCode: override?.code || row.shipmentStatus || '',
      shipmentId: row.shipmentId ?? null,
      buyerName: row.customerName || '-',
      buyerPhone: formatPhoneNumber(row.customerPhone),
      productName: row.productName || '-',
      productPrice: `\u20A9${currency(row.paymentAmount)}`,
      margin: `\u20A9${currency(row.paymentAmount)} / \u20A9${currency(row.margin)}`,
      orderId: row.orderId,
    }
  })
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) return normalizedRows.value

  return normalizedRows.value.filter((row) => {
    return [
      row.orderId,
      row.buyerName,
      row.buyerPhone,
      row.productName,
      row.market,
      row.orderStatus,
      row.deliveryStatus,
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const totalCount = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})
const selectedCount = computed(() => selectedKeys.value.length)

function startEditing(row) {
  if (!canEditShipment(row)) return
  editingRowId.value = row.id
  draftShipmentStatus.value = row.deliveryStatusCode
}

function cancelEditing() {
  editingRowId.value = null
  draftShipmentStatus.value = ''
}

function saveShipmentStatus(row) {
  const nextCode = draftShipmentStatus.value
  const nextLabel = shipmentOptions.find((option) => option.value === nextCode)?.label || nextCode

  shipmentOverrides.value = {
    ...shipmentOverrides.value,
    [row.id]: {
      code: nextCode,
      label: nextLabel,
    },
  }

  emit('shipment-status-change', {
    orderId: row.id,
    shipmentId: row.shipmentId,
    shipmentStatus: nextCode,
    shipmentStatusLabel: nextLabel,
  })

  cancelEditing()
}

watch(search, () => {
  currentPage.value = 1
  selectedKeys.value = []
})

watch(
  () => props.rows,
  () => {
    currentPage.value = 1
    selectedKeys.value = []
    editingRowId.value = null
    draftShipmentStatus.value = ''
    shipmentOverrides.value = {}
  },
  { deep: true },
)
</script>

<template>
  <section class="mt-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <BaseSectionTitle>{{ title }}</BaseSectionTitle>
        <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span>{{ summaryLabel }} {{ totalCount }}{{ text.totalSuffix }}</span>
          <span>{{ selectedCount }}{{ text.selectedSuffix }}</span>
        </div>
      </div>

      <input
        v-model="search"
        type="search"
        :placeholder="text.searchPlaceholder"
        class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:max-w-xs"
      />
    </div>

    <div
      v-if="loading"
      class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500"
    >
      {{ text.loading }}
    </div>

    <div
      v-else-if="error"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-500"
    >
      {{ error }}
    </div>

    <div
      v-else-if="pagedRows.length === 0"
      class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500"
    >
      {{ text.empty }}
    </div>

    <div v-else class="mt-4">
      <BaseCheckTable
        v-model:selected-keys="selectedKeys"
        :columns="columns"
        :rows="pagedRows"
        row-key="id"
        :select-all-label="text.selectAll"
        :row-select-label="(row) => `${row.id} ${text.rowSelectSuffix}`"
      >
        <template #cell-order="{ row }">
          <div class="flex items-center justify-center whitespace-nowrap text-neutral-800">
            <span class="font-mono">{{ row.id }}</span>
            <span class="mx-1 text-neutral-400">/</span>
            <span class="text-neutral-500">{{ row.market }}</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <div class="flex min-h-9 items-center justify-center">
            <span class="rounded bg-neutral-100 px-2 py-1 text-xs">{{ row.orderStatus }}</span>
          </div>
        </template>

        <template #cell-deliveryStatus="{ row }">
          <div class="flex min-h-9 items-center justify-center">
            <select
              v-if="editingRowId === row.id"
              v-model="draftShipmentStatus"
              class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
            >
              <option
                v-for="option in shipmentOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-else class="rounded bg-neutral-100 px-2 py-1 text-xs">
              {{ row.deliveryStatus }}
            </span>
          </div>
        </template>

        <template #cell-buyer="{ row }">
          <div class="flex items-center justify-center whitespace-nowrap text-neutral-700">
            <span class="font-medium text-neutral-900">{{ row.buyerName }}</span>
            <span class="mx-1 text-neutral-400">/</span>
            <span>{{ row.buyerPhone }}</span>
          </div>
        </template>

        <template #cell-product="{ row }">
          <div class="mx-auto min-w-0 max-w-[280px] text-center">
            <p class="block w-full truncate text-neutral-900" :title="row.productName">
              {{ row.productName }}
            </p>
            <p class="mt-1 text-sm text-neutral-500">{{ row.productPrice }}</p>
          </div>
        </template>

        <template #cell-management="{ row }">
          <div class="flex min-h-9 items-center justify-center gap-2">
            <template v-if="editingRowId === row.id">
              <button
                type="button"
                class="rounded-md bg-point px-3 py-1 text-xs font-medium text-white"
                @click="saveShipmentStatus(row)"
              >
                {{ text.save }}
              </button>
              <button
                type="button"
                class="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-600"
                @click="cancelEditing"
              >
                {{ text.cancel }}
              </button>
            </template>
            <button
              v-else
              type="button"
              class="rounded-md border px-3 py-1 text-xs transition"
              :class="
                canEditShipment(row)
                  ? 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  : 'cursor-not-allowed border-neutral-200 text-neutral-300'
              "
              :disabled="!canEditShipment(row)"
              @click="startEditing(row)"
            >
              {{ text.edit }}
            </button>
          </div>
        </template>
      </BaseCheckTable>
    </div>

    <BasePagination
      v-if="!loading && !error && totalPages > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
    />
  </section>
</template>
