<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import { getMonthlyRevenue } from '../../api/revenueApi'

const rows = ref([])
const loading = ref(false)
const errorMessage = ref('')
const chartCanvas = ref(null)
let chartInstance = null

const totalOrderCount = computed(() => rows.value.reduce((sum, row) => sum + (row.orderCount ?? 0), 0))
const totalSales = computed(() => rows.value.reduce((sum, row) => sum + (row.sales ?? 0), 0))
const totalMargin = computed(() => rows.value.reduce((sum, row) => sum + (row.margin ?? 0), 0))
const averageProfitRate = computed(() => {
  if (totalSales.value === 0) return 0
  return (totalMargin.value / totalSales.value) * 100
})

function normalizeRows(data) {
  if (!Array.isArray(data)) return []

  return data.map((row) => ({
    year: Number(row.year) || 0,
    month: Number(row.month) || 0,
    orderCount: Number(row.orderCount) || 0,
    sales: Number(row.sales) || 0,
    margin: Number(row.margin) || 0,
    profitRate: Number(row.profitRate) || 0,
  }))
}

async function fetchData() {
  loading.value = true
  errorMessage.value = ''

  try {
    rows.value = normalizeRows(await getMonthlyRevenue())
    await nextTick()
    renderChart()
  } catch (error) {
    if (error?.status === 401) {
      errorMessage.value = '로그인 사용자 정보를 확인할 수 없습니다.'
    } else {
      errorMessage.value = error instanceof Error ? error.message : '월별 수익 정보를 불러오지 못했습니다.'
    }
    rows.value = []
    renderChart()
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!chartCanvas.value) return

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: rows.value.map((row) => `${row.year}.${String(row.month).padStart(2, '0')}`),
      datasets: [
        {
          label: '매출',
          data: rows.value.map((row) => row.sales),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 22,
        },
        {
          label: '마진',
          data: rows.value.map((row) => row.margin),
          backgroundColor: '#16a34a',
          borderRadius: 6,
          barThickness: 22,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatKrw(context.parsed.y)}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return formatCompactKrw(value)
            },
          },
        },
      },
    },
  })
}

function formatKrw(value) {
  return `₩${Number(value ?? 0).toLocaleString('ko-KR')}`
}

function formatCompactKrw(value) {
  const number = Number(value ?? 0)
  if (Math.abs(number) >= 10000) return `${Math.round(number / 10000).toLocaleString('ko-KR')}만`
  return number.toLocaleString('ko-KR')
}

function formatRate(value) {
  return `${Number(value ?? 0).toFixed(1)}%`
}

function formatMonth(row) {
  return `${row.year}년 ${row.month}월`
}

onMounted(fetchData)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div>
    <p
      v-if="errorMessage"
      class="mb-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ errorMessage }}
    </p>

    <div class="grid gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">총 주문 수</p>
        <p class="mt-2 text-2xl font-bold text-neutral-900">{{ totalOrderCount.toLocaleString('ko-KR') }}건</p>
      </div>
      <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">총 매출</p>
        <p class="mt-2 text-2xl font-bold text-neutral-900">{{ formatKrw(totalSales) }}</p>
      </div>
      <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">총 마진</p>
        <p class="mt-2 text-2xl font-bold text-neutral-900">{{ formatKrw(totalMargin) }}</p>
      </div>
      <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">평균 수익률</p>
        <p class="mt-2 text-2xl font-bold text-neutral-900">{{ formatRate(averageProfitRate) }}</p>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-base font-semibold text-neutral-900">월별 매출 및 마진</p>
          <p class="mt-1 text-sm text-neutral-500">주문 발생 월 기준으로 집계합니다.</p>
        </div>
        <button
          type="button"
          class="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="fetchData"
        >
          새로고침
        </button>
      </div>

      <div class="relative h-72">
        <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-neutral-500">
          불러오는 중
        </div>
        <canvas ref="chartCanvas"></canvas>
        <div
          v-if="!loading && rows.length === 0"
          class="absolute inset-0 flex items-center justify-center text-sm text-neutral-400"
        >
          월별 수익 데이터가 없습니다.
        </div>
      </div>
    </div>

    <div class="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table class="w-full min-w-[900px] text-left text-sm">
        <thead class="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-600">
          <tr>
            <th class="px-4 py-3 font-medium">연도</th>
            <th class="px-4 py-3 font-medium">월</th>
            <th class="px-4 py-3 font-medium">주문 수량</th>
            <th class="px-4 py-3 font-medium">매출</th>
            <th class="px-4 py-3 font-medium">마진</th>
            <th class="px-4 py-3 font-medium">수익률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-10 text-center text-neutral-400">불러오는 중</td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-neutral-400">데이터가 없습니다.</td>
          </tr>
          <tr
            v-for="row in rows"
            v-else
            :key="`${row.year}-${row.month}`"
            class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
          >
            <td class="px-4 py-4 text-neutral-600">{{ row.year }}</td>
            <td class="px-4 py-4 font-medium text-neutral-900">{{ formatMonth(row) }}</td>
            <td class="px-4 py-4">{{ row.orderCount.toLocaleString('ko-KR') }}건</td>
            <td class="px-4 py-4">{{ formatKrw(row.sales) }}</td>
            <td class="px-4 py-4 font-semibold text-neutral-900">{{ formatKrw(row.margin) }}</td>
            <td class="px-4 py-4 font-medium text-emerald-600">{{ formatRate(row.profitRate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
