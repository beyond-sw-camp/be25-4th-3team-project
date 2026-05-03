<script setup>
import { onMounted, ref } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { getMarginSummary, getRevenueProducts } from '../../api/revenueApi'

ChartJS.register(ArcElement, Tooltip, Legend)

// ── 차트 설정 ─────────────────────────────────────────────
const CHART_COLORS = {
  원가: '#ff7a33',
  플랫폼수수료: '#ffae85',
  배송비: '#ffd7c2',
  마진: '#ff5c04',
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 12,
        font: { size: 12 },
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label(ctx) {
          const value = ctx.parsed
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = ((value / total) * 100).toFixed(1)
          return ` ${ctx.label}: ₩${value.toLocaleString('ko-KR')} (${pct}%)`
        },
      },
    },
  },
}

function toChartData(data) {
  return {
    labels: ['상품 원가', '플랫폼 수수료', '배송비', '실제 마진'],
    datasets: [
      {
        data: [
          data?.productCost ?? 0,
          data?.platformFee ?? 0,
          data?.shippingFee ?? 0,
          data?.margin ?? 0,
        ],
        backgroundColor: [
          CHART_COLORS.원가,
          CHART_COLORS.플랫폼수수료,
          CHART_COLORS.배송비,
          CHART_COLORS.마진,
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  }
}

// ── 상태 ──────────────────────────────────────────────────
const loading = ref(false)
const errorMessage = ref('')

const expectedData = ref(null)
const actualData = ref(null)
const tableRows = ref([])

// ── API 호출 ──────────────────────────────────────────────
async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [summary, products] = await Promise.all([getMarginSummary(), getRevenueProducts()])
    expectedData.value = summary?.expected ?? null
    actualData.value = summary?.actual ?? null
    tableRows.value = Array.isArray(products) ? products : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// 계산 함수
function calcExpectedOrderCount(row) {
  return (row?.reviewCount ?? 0) / 10
}

function calcExpectedSales(row) {
  return calcExpectedOrderCount(row) * (row.salePrice ?? 0)
}

function calcActualSales(row) {
  return (row.orderCount ?? 0) * (row.salePrice ?? 0)
}

function calcActualProfit(row) {
  return (row.orderCount ?? 0) * (row.marginPerUnit ?? 0)
}

function calcExpectedMargin() {
  if (!selectedRow.value) return expectedData.value?.margin ?? null
  return (selectedRow.value.marginPerUnit ?? 0) * calcExpectedOrderCount(selectedRow.value)
}

function calcProfitRateDiff(row) {
  const expected = calcExpectedSales(row)
  const actual = calcActualSales(row)
  if (expected === 0) return '-'
  const diff = ((actual - expected) / expected) * 100
  return diff.toFixed(1)
}

// 원화 포맷으로 변경 함수
function formatKrw(value) {
  if (value == null) return '-'
  return `₩${Number(value).toLocaleString('ko-KR')}`
}

function formatRate(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(1)}%`
}

// ── 팝업 ──────────────────────────────────────────────────
const selectedRow = ref(null)

function openDetail(row) {
  selectedRow.value = row
}

function closeDetail() {
  selectedRow.value = null
}
</script>

<template>
  <div>
    <!-- 에러 메시지 -->
    <p
      v-if="errorMessage"
      class="mb-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ errorMessage }}
    </p>

    <!-- ═══ 도넛 차트 카드 ═══ -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 예상 마진 카드 -->
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">예상 마진</p>
        <div class="mt-1 flex items-baseline gap-2">
          <p class="text-3xl font-bold text-neutral-900">{{ formatKrw(calcExpectedMargin()) }}</p>
          <p class="text-sm text-neutral-400">
            예상 수익률 {{ formatRate(expectedData?.marginRate) }}
          </p>
        </div>
        <div class="relative mt-6 h-64">
          <div
            v-if="loading"
            class="flex h-full items-center justify-center text-sm text-neutral-400"
          >
            불러오는 중…
          </div>
          <template v-else-if="expectedData">
            <Doughnut :data="toChartData(expectedData)" :options="chartOptions" />
            <div
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10"
            >
              <p class="text-xs text-neutral-400">총 예상 마진</p>
              <p class="text-base font-bold text-neutral-800">
                {{ formatKrw(expectedData?.margin) }}
              </p>
            </div>
          </template>
          <div v-else class="flex h-full items-center justify-center text-sm text-neutral-400">
            데이터 없음
          </div>
        </div>
      </div>

      <!-- 실제 마진 카드 -->
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p class="text-sm font-medium text-neutral-500">실제 마진</p>
        <div class="mt-1 flex items-baseline gap-2">
          <p class="text-3xl font-bold text-neutral-900">{{ formatKrw(actualData?.margin) }}</p>
          <p class="text-sm text-neutral-400">
            실제 수익률 {{ formatRate(actualData?.marginRate) }}
          </p>
        </div>
        <div class="relative mt-6 h-64">
          <div
            v-if="loading"
            class="flex h-full items-center justify-center text-sm text-neutral-400"
          >
            불러오는 중…
          </div>
          <template v-else-if="actualData">
            <Doughnut :data="toChartData(actualData)" :options="chartOptions" />
            <div
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10"
            >
              <p class="text-xs text-neutral-400">총 실제 마진</p>
              <p class="text-base font-bold text-neutral-800">
                {{ formatKrw(actualData?.margin) }}
              </p>
            </div>
          </template>
          <div v-else class="flex h-full items-center justify-center text-sm text-neutral-400">
            데이터 없음
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 테이블 ═══ -->
    <div class="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table class="w-full min-w-[960px] text-center text-sm">
        <thead class="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-600">
          <tr>
            <th class="px-4 py-3 font-medium">상품명</th>
            <th class="px-4 py-3 font-medium">상품 주문 수</th>
            <th class="px-4 py-3 font-medium">예상 매출</th>
            <th class="px-4 py-3 font-medium">실제 매출</th>
            <th class="px-4 py-3 font-medium">실제 수익</th>
            <th class="px-4 py-3 font-medium">수익률 차이</th>
            <th class="px-4 py-3 font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="px-4 py-10 text-center text-neutral-400">불러오는 중…</td>
          </tr>
          <tr v-else-if="tableRows.length === 0">
            <td colspan="7" class="px-4 py-10 text-center text-neutral-400">데이터가 없습니다.</td>
          </tr>
          <tr
            v-for="(row, i) in tableRows"
            v-else
            :key="row.coupangProductId ?? i"
            class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
          >
            <td class="px-4 py-4 text-neutral-600">
              {{ row.productName.split(/[,-,:]/)[0] }}
            </td>
            <td class="px-4 py-4 font-medium">{{ row.orderCount ?? 0 }}건</td>
            <td class="px-4 py-4">{{ formatKrw(calcExpectedSales(row)) }}</td>
            <td class="px-4 py-4">{{ formatKrw(calcActualSales(row)) }}</td>
            <td class="px-4 py-4 font-semibold">{{ formatKrw(calcActualProfit(row)) }}</td>
            <td
              class="px-4 py-4 font-medium"
              :class="Number(calcProfitRateDiff(row)) >= 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              <template v-if="calcProfitRateDiff(row) !== '-'">
                {{ Number(calcProfitRateDiff(row)) >= 0 ? '+' : '' }}{{ calcProfitRateDiff(row) }}%
              </template>
              <template v-else>-</template>
            </td>
            <td class="px-4 py-4">
              <button
                type="button"
                class="rounded-md border whitespace-nowrap border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                @click="openDetail(row)"
              >
                상세보기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ 상세보기 팝업 ═══ -->
    <Teleport to="body">
      <div
        v-if="selectedRow"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="closeDetail"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div class="flex items-center justify-between">
            <p class="font-semibold text-neutral-900">판매 상품 상세</p>
            <button
              type="button"
              class="text-neutral-400 hover:text-neutral-600"
              @click="closeDetail"
            >
              ✕
            </button>
          </div>
          <p class="mt-1 text-sm text-neutral-500">{{ selectedRow.productName ?? '-' }}</p>

          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">상품 등록 일시</span>
              <span class="font-medium">{{ selectedRow.registeredAt ?? '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">판매가</span>
              <span class="font-medium">{{ formatKrw(selectedRow.salePrice) }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">단위 마진</span>
              <span class="font-medium">{{ formatKrw(selectedRow.marginPerUnit) }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">마진율</span>
              <span class="font-medium">{{ formatRate(selectedRow.marginRate) }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">소싱 리뷰 수</span>
              <span class="font-medium">
                {{ Math.floor(selectedRow.reviewCount / 10 ?? 0).toLocaleString('ko-KR') }}개
              </span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">실제 주문 수</span>
              <span class="font-medium">{{ selectedRow.orderCount ?? 0 }}건</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">예상 매출</span>
              <span class="font-medium">{{ formatKrw(calcExpectedSales(selectedRow)) }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">실제 매출</span>
              <span class="font-medium">{{ formatKrw(calcActualSales(selectedRow)) }}</span>
            </div>
            <div class="flex justify-between border-b border-neutral-100 pb-2">
              <span class="text-neutral-500">실제 수익</span>
              <span class="font-semibold text-emerald-600">{{
                formatKrw(calcActualProfit(selectedRow))
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">수익률 차이</span>
              <span
                class="font-semibold"
                :class="
                  Number(calcProfitRateDiff(selectedRow)) >= 0 ? 'text-emerald-600' : 'text-red-500'
                "
              >
                <template v-if="calcProfitRateDiff(selectedRow) !== '-'">
                  {{ Number(calcProfitRateDiff(selectedRow)) >= 0 ? '+' : ''
                  }}{{ calcProfitRateDiff(selectedRow) }}%
                </template>
                <template v-else>-</template>
              </span>
            </div>
          </div>

          <button
            type="button"
            class="mt-6 w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            @click="closeDetail"
          >
            닫기
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
