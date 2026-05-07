<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchFailedOrders } from '../../api/orders'

const loading = ref(false)
const error = ref('')
const rows = ref([])

const currency = (value) => new Intl.NumberFormat('ko-KR').format(value || 0)
const failureReason = (row) => row.paymentFailureReason ?? row.paymentFailureCode ?? '-'
const cardLabel = (row) =>
  row.cardType && row.cardLast4 ? `${row.cardType} **** ${row.cardLast4}` : '-'
const amountLabel = (value) => `₩${currency(value ?? 0)}`
const activeLabel = (value) => {
  if (value === true) return '활성'
  if (value === false) return '비활성'
  return '-'
}

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await fetchFailedOrders()
    rows.value = data
  } catch (e) {
    error.value = e?.response?.data?.message || '실패 주문 데이터를 불러오지 못했습니다.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

const summary = computed(() => {
  const total = rows.value.length
  const failed = rows.value.filter((row) => row.status === 'FAILED').length
  const uniqueUsers = new Set(rows.value.map((row) => row.userId)).size
  const totalAmount = rows.value.reduce((sum, row) => sum + (row.totalAmount || 0), 0)

  return [
    { label: '실패 주문 전체', value: total},
    { label: '실패 상태 주문', value: failed },
    { label: '실패 사용자 수', value: uniqueUsers},
    { label: '실패 주문 금액 합계', value: `₩${currency(totalAmount)}`},
  ]
})
</script>

<template>
  <div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="s in summary"
        :key="s.label"
        class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <p class="text-sm font-medium text-neutral-700">{{ s.label }}</p>
        <p class="mt-2 text-3xl font-bold text-neutral-900">{{ s.value }}</p>
        <p class="mt-1 text-xs text-neutral-500">{{ s.sub }}</p>
      </div>
    </div>

    <div class="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table class="min-w-[1300px] w-full text-left text-sm">
        <thead class="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-600">
          <tr>
            <th class="px-4 py-3 font-medium">주문번호</th>
            <th class="px-4 py-3 font-medium">사용자 ID</th>
            <th class="px-4 py-3 font-medium">고객명</th>
            <th class="px-4 py-3 font-medium">연락처</th>
            <th class="px-4 py-3 font-medium">주문 금액</th>
            <th class="px-4 py-3 font-medium">결제 실패 사유</th>
            <th class="px-4 py-3 font-medium">카드 정보</th>
            <th class="px-4 py-3 font-medium">카드 상태</th>
            <th class="px-4 py-3 font-medium">카드 한도</th>
            <th class="px-4 py-3 font-medium">카드 잔액</th>
            <th class="px-4 py-3 font-medium">설정 한도</th>
            <th class="px-4 py-3 font-medium">주문 상태</th>
            <th class="px-4 py-3 font-medium">자동 주문 상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="13" class="px-4 py-10 text-center text-neutral-500">
              실패 주문 데이터를 불러오는 중입니다.
            </td>
          </tr>

          <tr v-else-if="error">
            <td colspan="13" class="px-4 py-10 text-center text-red-500">
              {{ error }}
            </td>
          </tr>

          <tr v-else-if="rows.length === 0">
            <td colspan="13" class="px-4 py-10 text-center text-neutral-500">
              실패 주문이 없습니다.
            </td>
          </tr>

          <tr v-for="row in rows" :key="row.id" class="border-b border-neutral-100">
            <td class="px-4 py-4">#{{ row.id }}</td>
            <td class="px-4 py-4">{{ row.userId }}</td>
            <td class="px-4 py-4">{{ row.customerName }}</td>
            <td class="px-4 py-4">{{ row.customerPhone }}</td>
            <td class="px-4 py-4">₩{{ currency(row.totalAmount) }}</td>
            <td class="px-4 py-4">{{ failureReason(row) }}</td>
            <td class="px-4 py-4">{{ cardLabel(row) }}</td>
            <td class="px-4 py-4">{{ activeLabel(row.cardActive) }}</td>
            <td class="px-4 py-4">{{ amountLabel(row.cardLimit) }}</td>
            <td class="px-4 py-4">{{ amountLabel(row.cardBalance) }}</td>
            <td class="px-4 py-4">{{ amountLabel(row.configuredLimit ?? row.cardLimit) }}</td>
            <td class="px-4 py-4">{{ row.status }}</td>
            <td class="px-4 py-4">{{ row.autoOrderStatus }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
