<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'

import BaseButton from '../../components/common/BaseButton.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import BaseSelect from '../../components/common/BaseSelect.vue'
import BaseStatCard from '../../components/common/BaseStatCard.vue'
import {
  getCoupangProducts,
  getProductRegistrationStatusCounts,
  publishCoupangProduct,
  searchCanceledProductRegistrations,
  searchCoupangProducts,
  searchReadyProductRegistrations,
  updateProductRegistrationStatus,
} from '../../api/productRegistration'


const sourceOptions = ['AMAZON', 'ALIEXPRESS', 'TAOBAO']
const marginOptions = [
  { label: '전체', value: '' },
  { label: '10% 이상', value: '10' },
  { label: '20% 이상', value: '20' },
  { label: '30% 이상', value: '30' },
]
const statusOptions = [
  { label: '등록 대기', value: 'READY' },
  { label: '등록 완료', value: 'REGISTERED' },
  { label: '등록 실패', value: 'FAILED' },
  { label: '등록 취소', value: 'CANCELED' },
]
const statusLabelMap = {
  READY: '등록 대기',
  PENDING: '등록 대기',
  WAITING: '등록 대기',
  REGISTERED: '등록 완료',
  COMPLETED: '등록 완료',
  SUCCESS: '등록 완료',
  SELLING: '판매중',
  ON_SALE: '판매중',
  FAILED: '등록 실패',
  FAIL: '등록 실패',
  ERROR: '등록 실패',
  CANCELED: '등록 취소',
  CANCELLED: '등록 취소',
  STOPPED: '판매 중지',
  SUSPENDED: '판매 중지',
}
const statusClassMap = {
  READY: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-amber-50 text-amber-700',
  WAITING: 'bg-amber-50 text-amber-700',
  REGISTERED: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  SELLING: 'bg-blue-50 text-blue-700',
  ON_SALE: 'bg-blue-50 text-blue-700',
  FAILED: 'bg-red-50 text-red-700',
  FAIL: 'bg-red-50 text-red-700',
  ERROR: 'bg-red-50 text-red-700',
  CANCELED: 'bg-neutral-100 text-neutral-600',
  CANCELLED: 'bg-neutral-100 text-neutral-600',
  STOPPED: 'bg-neutral-100 text-neutral-600',
  SUSPENDED: 'bg-neutral-100 text-neutral-600',
}

const readyProducts = ref([])      // 등록 대기 상품 목록
const coupangProducts = ref([])    // 쿠팡 등록 상품 목록
const canceledProducts = ref([])   // 등록 취소 상품 목록
const statusCounts = ref({})
const loadingReady = ref(false)
const loadingCoupang = ref(false)
const loadingCanceled = ref(false) // 취소 목록 로딩 상태
const publishingId = ref(null)
const cancellingId = ref(null)
const confirmTarget = ref(null)
const movingToReadyId = ref(null)
const editingId = ref(null)
const selectedStatus = ref('READY')
const errorMessage = ref('')
const savedMessage = ref('')

const readyFilters = reactive({
  from: '',
  to: '',
  source: '',
  minMarginRate: '',
  maxMarginRate: '',
  keyword: '',
})
const coupangFilters = reactive({
  from: '',
  to: '',
  source: '',
  minMarginRate: '',
  maxMarginRate: '',
  keyword: '',
})
// 등록 취소 상품 목록 필터 상태
const canceledFilters = reactive({
  from: '',
  to: '',
  source: '',
  minMarginRate: '',
  maxMarginRate: '',
  keyword: '',
})

const stats = computed(() => [
  {
    label: '등록 대기',
    value: getStatusCount('ready', 'waiting', 'pending', 'readyCount', 'waitingCount', 'pendingCount'),
    tone: 'warning',
  },
  {
    label: '등록 완료',
    value: getStatusCount('registered', 'completed', 'success', 'registeredCount', 'completedCount', 'successCount'),
    tone: 'primary',
  },
  {
    label: '등록 실패',
    value: getStatusCount('failed', 'failure', 'failedCount', 'failureCount'),
    tone: 'danger',
  },
  {
    label: '등록 취소',
    value: canceledRows.value.length,
  },
])
// 등록 대기 상품을 테이블 row 형태로 변환
const readyRows = computed(() => readyProducts.value.map((product) => mapProductRow(product)).filter(hasProductContent))
// 쿠팡 등록 상품을 테이블 row 형태로 변환 (기본 상태 SELLING)
const coupangRows = computed(() =>
  coupangProducts.value
    .map((product) => mapProductRow(product, { defaultStatus: 'SELLING' }))
    .filter(hasProductContent),
)
// 등록 취소 상품을 테이블 row 형태로 변환 (기본 상태 CANCELED)
const canceledRows = computed(() =>
  canceledProducts.value
    .map((product) => mapProductRow(product, { defaultStatus: 'CANCELED' }))
    .filter(hasProductContent),
)

function cleanParams(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== ''),
  )
}

function hasSearchParams(params) {
  return Object.keys(params).length > 0
}

function getStatusCount(...keys) {
  const entries = Object.entries(statusCounts.value ?? {})
  for (const key of keys) {
    if (statusCounts.value?.[key] != null) return Number(statusCounts.value[key])
    const matched = entries.find(([entryKey]) => entryKey.toLowerCase() === key.toLowerCase())
    if (matched) return Number(matched[1])
  }
  return 0
}

function pickFirst(...values) {
  return values.find((value) => value !== null && value !== undefined && String(value).trim() !== '')
}

function pickNested(object, ...paths) {
  for (const path of paths) {
    const value = path.split('.').reduce((current, key) => current?.[key], object)
    if (value !== null && value !== undefined && String(value).trim() !== '') return value
  }
  return undefined
}

function normalizeStatus(status, fallback = 'READY') {
  return String(status ?? fallback).toUpperCase()
}

// 날짜/시각을 KST(UTC+9, Asia/Seoul) 기준 'YYYY-MM-DD HH:MM' 형식으로 변환
function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16)
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-'
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? String(value) : numberValue.toLocaleString('ko-KR')
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '-'
  const text = String(value)
  return text.endsWith('%') ? text : `${text}%`
}

function truncateText(value, maxLength = 34) {
  const text = String(value ?? '-')
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

// 소싱처 URL이나 이름을 테이블 표시용 마켓명으로 정리한다.
function normalizeSourceMarket(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '-'
  const text = String(value)
  const lowerText = text.toLowerCase()
  if (lowerText.includes('amazon')) return 'AMAZON'
  if (lowerText.includes('aliexpress')) return 'ALIEXPRESS'
  if (lowerText.includes('taobao')) return 'TAOBAO'
  return text
}

// 마진율이 직접 내려오지 않으면 마진 금액과 판매가로 계산한다.
function resolveMarginRate(product) {
  const explicitMarginRate = pickFirst(
    product.marginRate,
    product.margin_rate,
    product.marginRatePercent,
    product.profitMarginRate,
    product.targetMarginRate,
    product.marginKrwRate,
    pickNested(product, 'sourcingProduct.marginRate', 'sourceProduct.marginRate', 'registration.marginRate'),
  )
  if (explicitMarginRate !== undefined) return explicitMarginRate

  const marginKrw = Number(product.marginKrw ?? product.marginAmount ?? product.profitKrw)
  const salePrice = Number(product.salePrice ?? product.sellingPrice ?? product.price)
  if (Number.isFinite(marginKrw) && Number.isFinite(salePrice) && salePrice > 0) {
    return Number(((marginKrw / salePrice) * 100).toFixed(2))
  }

  return undefined
}

function parseDateCandidate(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : { value, time: date.getTime() }
}

function pickLatestDate(...values) {
  return values
    .map(parseDateCandidate)
    .filter(Boolean)
    .sort((a, b) => b.time - a.time)[0]?.value
}


// 최근 처리 일시는 수정/등록/수집 계열 날짜 중 가장 최신 값을 사용한다.
function resolveRecentProcessedAt(product) {
  return pickLatestDate(
    product.canceledAt,
    product.canceled_at,
    product.cancelledAt,
    product.cancelled_at,
    product.cancelAt,
    product.cancel_at,
    product.cancellationDate,
    product.cancellation_date,
    product.cancelDate,
    product.cancel_date,
    product.updatedAt,
    product.updated_at,
    product.updateAt,
    product.update_at,
    product.updatedDate,
    product.updated_date,
    product.modifiedAt,
    product.modified_at,
    product.modifiedDate,
    product.lastModifiedAt,
    product.last_modified_at,
    product.lastModifiedDate,
    product.statusUpdatedAt,
    product.status_updated_at,
    product.statusChangedAt,
    product.status_changed_at,
    product.registrationStatusUpdatedAt,
    product.registration_status_updated_at,
    product.registrationStatusChangedAt,
    product.registeredAt,
    product.registered_at,
    product.registrationDate,
    product.registration_date,
    product.publishedAt,
    product.published_at,
    product.uploadedAt,
    product.uploaded_at,
    product.sourcingRegisteredAt,
    product.sourcing_registered_at,
    product.sourcingRegistrationDate,
    product.sourcing_registration_date,
    product.sourcingCreatedAt,
    product.sourcing_created_at,
    product.sourcedAt,
    product.sourced_at,
    product.crawledAt,
    product.crawled_at,
    product.crawledDate,
    product.crawled_date,
    product.collectedAt,
    product.collected_at,
    product.registeredDate,
    product.registered_date,
    product.regDate,
    product.reg_date,
    product.createdDate,
    product.created_date,
    product.createAt,
    product.create_at,
    product.createDate,
    product.create_date,
    product.insertedAt,
    product.inserted_at,
    product.insertDate,
    product.insert_date,
    product.requestedAt,
    product.requested_at,
    pickNested(product, 'registration.updatedAt', 'registration.updated_at'),
    pickNested(product, 'registration.createdAt', 'registration.created_at', 'registration.createdDate'),
    pickNested(product, 'productRegistration.updatedAt', 'productRegistration.updated_at'),
    pickNested(product, 'productRegistration.createdAt', 'productRegistration.created_at', 'productRegistration.createdDate'),
    pickNested(product, 'sourcingProduct.createdAt', 'sourcingProduct.created_at', 'sourcingProduct.createdDate'),
    pickNested(product, 'sourcingProduct.collectedAt', 'sourcingProduct.sourcedAt'),
    pickNested(product, 'sourceProduct.createdAt', 'sourceProduct.created_at', 'sourceProduct.createdDate'),
    pickNested(product, 'sourceProduct.collectedAt', 'sourceProduct.sourcedAt'),
    product.createdAt,
    product.created_at,
    product.createdDate,
    product.created_date,
  )
}


function getRegistrationId(product) {
  return (
    product.registrationId ??
    product.productRegistrationId ??
    product.dummyProductRegistrationId ??
    pickNested(
      product,
      'registration.id',
      'registration.registrationId',
      'productRegistration.id',
      'productRegistration.registrationId',
      'dummyProductRegistration.id',
      'dummyProductRegistration.registrationId',
    ) ??
    product.id
  )
}

// 등록 대기/쿠팡 등록 응답 DTO를 같은 테이블 row 구조로 맞춘다.
function mapProductRow(product, options = {}) {
  const rawStatus = normalizeStatus(
    product.status ?? product.registrationStatus ?? product.productStatus ?? product.saleStatus,
    options.defaultStatus,
  )
  const rowId = pickFirst(
    product.dummyCoupangProductId,
    product.registrationId,
    product.coupangProductId,
    product.productRegistrationId,
    product.id,
  )

  return {
    raw: product,
    rowId,
    registrationId: getRegistrationId(product),
    overseasId:
      pickFirst(
        product.sourcingProductId,
        product.sourceProductId,
        product.sourcing_product_id,
        product.source_product_id,
        product.Sourcing_Product_ID,
        product.Source_Product_ID,
        product.asin,
        product.overseasProductId,
        product.marketProductId,
        product.vendorItemId,
        product.productId,
        pickNested(product, 'sourcingProduct.id', 'sourcingProduct.sourcingProductId'),
        pickNested(product, 'sourcingProduct.sourceProductId', 'sourceProduct.id', 'sourceProduct.sourceProductId'),
      ) ?? '-',
    name:
      pickFirst(
        product.productName,
        product.processedProductName,
        product.originalProductName,
        product.coupangProductName,
        product.name,
        product.title,
        pickNested(product, 'sourcingProduct.productName', 'sourcingProduct.name', 'registration.productName'),
      ) ?? '-',
    sourceMarket: normalizeSourceMarket(
      pickFirst(
        product.source,
        product.sourceMarket,
        product.sourcingMarket,
        product.originMarket,
        product.marketSource,
        product.sourceName,
        product.sourceSite,
        product.sourceUrl,
        pickNested(product, 'sourcingProduct.source', 'sourcingProduct.sourceMarket', 'registration.sourceMarket'),
        pickNested(product, 'sourceProduct.source', 'sourceProduct.sourceMarket', 'sourceProduct.sourceUrl'),
      ),
    ),
    collectedAt: formatDateTime(
      product.collectedAt ??
        product.sourcedAt ??
        product.sourcingCreatedAt ??
        pickNested(product, 'sourcingProduct.createdAt', 'registration.collectedAt') ??
        product.createdAt,
    ),
    registeredAt: formatDateTime(
      product.registeredAt ??
        product.registrationDate ??
        product.publishedAt ??
        product.uploadedAt ??
        product.createdAt ??
        product.updatedAt,
    ),
    processedAt: formatDateTime(resolveRecentProcessedAt(product)),
    salePrice: formatNumber(product.salePrice ?? product.sellingPrice ?? product.price),
    marginRate: formatPercent(resolveMarginRate(product)),
    statusValue: rawStatus,
    statusLabel: statusLabelMap[rawStatus] ?? product.status ?? '-',
    statusClass: statusClassMap[rawStatus] ?? 'bg-neutral-100 text-neutral-600',
  }
}

function hasProductContent(product) {
  return [product.name, product.overseasId].some(
    (value) => value !== null && value !== undefined && String(value).trim() !== '' && String(value).trim() !== '-',
  )
}

function resetReadyFilters() {
  Object.assign(readyFilters, {
    from: '',
    to: '',
    source: '',
    minMarginRate: '',
    maxMarginRate: '',
    keyword: '',
  })
  loadReadyProducts()
}

function resetCoupangFilters() {
  Object.assign(coupangFilters, {
    from: '',
    to: '',
    source: '',
    minMarginRate: '',
    maxMarginRate: '',
    keyword: '',
  })
  loadCoupangProducts()
}

// 건수 카드 데이터를 갱신한다. 실패해도 기존 카운트를 유지한다
async function loadStatusCounts() {
  try {
    const counts = await getProductRegistrationStatusCounts()
    if (counts && typeof counts === 'object') {
      statusCounts.value = counts
    }
  } catch {
    // 건수 조회 실패 시 기존 값 유지
  }
}

async function loadReadyProducts() {
  loadingReady.value = true
  errorMessage.value = ''
  try {
    const rows = await searchReadyProductRegistrations(cleanParams(readyFilters))
    readyProducts.value = Array.isArray(rows) ? rows : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '등록 대기 상품을 불러오지 못했습니다.'
  } finally {
    loadingReady.value = false
  }
}

// 등록 취소 상품 목록을 서버에서 가져온다
// 백엔드 엔드포인트가 아직 없을 경우 에러를 노출하지 않고 빈 목록으로 처리한다
async function loadCanceledProducts() {
  loadingCanceled.value = true
  try {
    const rows = await searchCanceledProductRegistrations(cleanParams(canceledFilters))
    canceledProducts.value = Array.isArray(rows) ? rows : []
  } catch {
    canceledProducts.value = []
  } finally {
    loadingCanceled.value = false
  }
}

// 취소 상품 필터 초기화 후 재조회
function resetCanceledFilters() {
  Object.assign(canceledFilters, {
    from: '',
    to: '',
    source: '',
    minMarginRate: '',
    maxMarginRate: '',
    keyword: '',
  })
  loadCanceledProducts()
}

async function loadCoupangProducts() {
  loadingCoupang.value = true
  errorMessage.value = ''
  try {
    const params = cleanParams(coupangFilters)
    const rows = hasSearchParams(params) ? await searchCoupangProducts(params) : await getCoupangProducts()
    coupangProducts.value = Array.isArray(rows) ? rows : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '쿠팡 등록 상품을 불러오지 못했습니다.'
  } finally {
    loadingCoupang.value = false
  }
}

// 페이지 전체 데이터를 병렬로 새로고침
async function refreshPageData() {
  await Promise.all([loadStatusCounts(), loadReadyProducts(), loadCoupangProducts(), loadCanceledProducts()])
}

async function publishToCoupang(product) {
  if (!product.registrationId) {
    errorMessage.value = '쿠팡으로 발행할 등록 상품 ID가 없습니다.'
    return
  }

  publishingId.value = product.registrationId
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    await publishCoupangProduct(product.registrationId)
    savedMessage.value = '쿠팡 더미 마켓으로 발행했습니다.'
    await refreshPageData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '쿠팡 발행에 실패했습니다.'
  } finally {
    publishingId.value = null
  }
}

function requestCancelRegistration(product) {
  confirmTarget.value = product
}

function dismissCancelConfirm() {
  confirmTarget.value = null
}

async function cancelRegistration() {
  const product = confirmTarget.value
  if (!product?.registrationId) {
    errorMessage.value = '등록 취소할 상품 ID가 없습니다.'
    return
  }

  confirmTarget.value = null
  cancellingId.value = product.registrationId
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    const now = new Date().toISOString()
    await updateProductRegistrationStatus(product.registrationId, 'CANCELED')

    // 대기 목록에서 해당 상품 제거 (서버 재조회 없이 — 기존 날짜 데이터 보존)
    readyProducts.value = readyProducts.value.filter(
      (item) => String(getRegistrationId(item)) !== String(product.registrationId),
    )

    // 취소 일시를 현재 시각으로 주입해 취소 목록 맨 앞에 추가
    canceledProducts.value = [
      { ...(product.raw ?? {}), updatedAt: now, registrationStatus: 'CANCELED' },
      ...canceledProducts.value,
    ]

    // 건수 카드만 서버와 동기화
    await loadStatusCounts()
    savedMessage.value = '등록을 취소했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '등록을 취소하지 못했습니다.'
  } finally {
    cancellingId.value = null
  }
}

async function moveCoupangProductToReady(product) {
  if (!product.registrationId) {
    errorMessage.value = '판매 대기로 변경할 등록 상품 ID가 없습니다.'
    return
  }

  movingToReadyId.value = product.registrationId
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    const updatedRegistration = await updateProductRegistrationStatus(
      product.registrationId,
      'READY',
      '쿠팡 등록 상품 수정으로 판매 대기 전환',
    )
    coupangProducts.value = coupangProducts.value.filter(
      (item) => getRegistrationId(item) !== product.registrationId,
    )
    const now = new Date().toISOString()
    if (updatedRegistration && typeof updatedRegistration === 'object') {
      readyProducts.value = [
        { ...updatedRegistration, updatedAt: updatedRegistration.updatedAt ?? now },
        ...readyProducts.value.filter((item) => getRegistrationId(item) !== product.registrationId),
      ]
    } else {
      await loadReadyProducts()
    }
    await loadStatusCounts()
    savedMessage.value = '판매 대기 상태로 변경했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '판매 대기 상태로 변경하지 못했습니다.'
  } finally {
    movingToReadyId.value = null
  }
}

onMounted(refreshPageData)
</script>

<template>
  <div>
    <div
      v-if="errorMessage || savedMessage"
      class="mb-5 rounded-lg border px-4 py-3 text-sm"
      :class="
        errorMessage
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      "
    >
      {{ errorMessage || savedMessage }}
    </div>

    <section>
      <BaseSectionTitle>수집 / 등록 건수</BaseSectionTitle>
      <div class="mt-3 h-px bg-neutral-200" />
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BaseStatCard
          v-for="stat in stats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :tone="stat.tone"
        />
      </div>
    </section>

    <section class="mt-10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <BaseSectionTitle>등록 대기 상품 조회</BaseSectionTitle>
        <p class="text-sm text-neutral-500">총 {{ readyRows.length }}개 상품</p>
      </div>

      <div class="mt-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="text-sm text-neutral-600">
            시작일
            <input
              v-model="readyFilters.from"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            종료일
            <input
              v-model="readyFilters.to"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            소싱처
            <BaseSelect v-model="readyFilters.source" class="mt-2 w-full">
              <option value="">전체 소싱처</option>
              <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600">
            마진율
            <BaseSelect v-model="readyFilters.minMarginRate" class="mt-2 w-full">
              <option v-for="option in marginOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600 md:col-span-2">
            상품명 / 해외 ID
            <input
              v-model.trim="readyFilters.keyword"
              type="search"
              placeholder="상품명 또는 해외 마켓 ID"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              @keyup.enter="loadReadyProducts"
            />
          </label>
          <div class="flex items-end justify-end gap-2 md:col-span-2">
            <BaseButton variant="secondary" size="sm" @click="resetReadyFilters">필터 초기화</BaseButton>
            <BaseButton size="sm" :disabled="loadingReady" @click="loadReadyProducts">검색</BaseButton>
          </div>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table class="w-full min-w-[1120px] table-fixed text-left text-sm">
          <thead class="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
            <tr>
              <th class="w-[260px] px-3 py-3 text-center font-medium">상품명</th>
              <th class="px-3 py-3 text-center font-medium">해외 마켓 ID</th>
              <th class="px-3 py-3 text-center font-medium">소싱처</th>
              <th class="w-28 px-3 py-3 text-center font-medium">예상 판매가</th>
              <th class="px-3 py-3 text-center font-medium">마진율</th>
              <th class="w-36 px-3 py-3 text-center font-medium">상태</th>
              <th class="w-36 px-3 py-3 text-center font-medium">관리</th>
              <th class="w-36 px-3 py-3 text-center font-medium">최근 처리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingReady">
              <td colspan="8" class="px-3 py-10 text-center text-neutral-500">
                등록 대기 상품을 불러오는 중입니다.
              </td>
            </tr>
            <tr v-else-if="readyRows.length === 0">
              <td colspan="8" class="px-3 py-10 text-center text-neutral-500">
                등록 대기 상품이 없습니다.
              </td>
            </tr>
            <tr
              v-for="product in readyRows"
              v-else
              :key="product.registrationId ?? product.rowId"
              class="border-b border-neutral-100 last:border-0"
            >
              <td class="px-3 py-4 align-middle">
                <p class="truncate font-semibold text-neutral-900" :title="product.name">
                  {{ truncateText(product.name) }}
                </p>
              </td>
              <td class="px-3 py-4 text-center align-middle font-mono text-xs text-neutral-700">
                {{ product.overseasId }}
              </td>
              <td class="px-3 py-4 text-center align-middle">{{ product.sourceMarket }}</td>
              <td class="px-3 py-4 text-center align-middle font-semibold">
                {{ product.salePrice === '-' ? '-' : `${product.salePrice}원` }}
              </td>
              <td class="px-3 py-4 text-center align-middle font-semibold text-point">
                {{ product.marginRate }}
              </td>
              <td class="px-3 py-4 text-center align-middle">
                <BaseSelect
                  v-if="editingId === product.registrationId"
                  v-model="selectedStatus"
                  size="sm"
                  class="w-32"
                >
                  <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </BaseSelect>
                <span v-else :class="['rounded px-2 py-1 text-xs font-medium', product.statusClass]">
                  {{ product.statusLabel }}
                </span>
              </td>
              <td class="px-3 py-4 align-middle">
                <!-- 판매 등록 / 등록 취소 버튼을 세로로 배치 -->
                <div class="flex w-full flex-col items-center gap-2">
                  <BaseButton
                    class="w-24"
                    size="sm"
                    :disabled="publishingId === product.registrationId"
                    @click="publishToCoupang(product)"
                  >
                    {{ publishingId === product.registrationId ? '등록 중' : '판매 등록' }}
                  </BaseButton>
                  <BaseButton
                    class="w-24"
                    variant="secondary"
                    size="sm"
                    :disabled="cancellingId === product.registrationId"
                    @click="requestCancelRegistration(product)"
                  >
                    {{ cancellingId === product.registrationId ? '취소 중' : '등록 취소' }}
                  </BaseButton>
                </div>
              </td>
              <td class="px-3 py-4 text-center align-middle text-xs text-neutral-500">
                {{ product.processedAt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <BaseSectionTitle>마켓 등록 상품 조회</BaseSectionTitle>
        <p class="text-sm text-neutral-500">총 {{ coupangRows.length }}개 상품</p>
      </div>

      <div class="mt-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="text-sm text-neutral-600">
            시작일
            <input
              v-model="coupangFilters.from"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            종료일
            <input
              v-model="coupangFilters.to"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            소싱처
            <BaseSelect v-model="coupangFilters.source" class="mt-2 w-full">
              <option value="">전체 소싱처</option>
              <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600">
            마진율
            <BaseSelect v-model="coupangFilters.minMarginRate" class="mt-2 w-full">
              <option v-for="option in marginOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600 md:col-span-2">
            상품명 / 해외 ID
            <input
              v-model.trim="coupangFilters.keyword"
              type="search"
              placeholder="상품명 또는 해외 마켓 ID"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              @keyup.enter="loadCoupangProducts"
            />
          </label>
          <div class="flex items-end justify-end gap-2 md:col-span-2">
            <BaseButton variant="secondary" size="sm" @click="resetCoupangFilters">필터 초기화</BaseButton>
            <BaseButton size="sm" :disabled="loadingCoupang" @click="loadCoupangProducts">검색</BaseButton>
          </div>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table class="w-full min-w-[1120px] table-fixed text-left text-sm">
          <thead class="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
            <tr>
              <th class="w-[260px] px-3 py-3 text-center font-medium">상품명</th>
              <th class="px-3 py-3 text-center font-medium">해외 마켓 ID</th>
              <th class="px-3 py-3 text-center font-medium">소싱처</th>
              <th class="w-28 px-3 py-3 text-center font-medium">판매가</th>
              <th class="px-3 py-3 text-center font-medium">마진율</th>
              <th class="w-36 px-3 py-3 text-center font-medium">상태</th>
              <th class="w-28 px-3 py-3 text-center font-medium">관리</th>
              <th class="w-36 px-3 py-3 text-center font-medium">등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingCoupang">
              <td colspan="8" class="px-3 py-10 text-center text-neutral-500">
                쿠팡 등록 상품을 불러오는 중입니다.
              </td>
            </tr>
            <tr v-else-if="coupangRows.length === 0">
              <td colspan="8" class="px-3 py-10 text-center text-neutral-500">
                마켓 등록 상품이 없습니다.
              </td>
            </tr>
            <tr
              v-for="product in coupangRows"
              v-else
              :key="product.rowId"
              class="border-b border-neutral-100 last:border-0"
            >
              <td class="px-3 py-4 align-middle">
                <p class="truncate font-semibold text-neutral-900" :title="product.name">
                  {{ truncateText(product.name) }}
                </p>
              </td>
              <td class="px-3 py-4 text-center align-middle font-mono text-xs text-neutral-700">
                {{ product.overseasId }}
              </td>
              <td class="px-3 py-4 text-center align-middle">{{ product.sourceMarket }}</td>
              <td class="px-3 py-4 text-center align-middle font-semibold">
                {{ product.salePrice === '-' ? '-' : `${product.salePrice}원` }}
              </td>
              <td class="px-3 py-4 text-center align-middle font-semibold text-point">
                {{ product.marginRate }}
              </td>
              <td class="px-3 py-4 text-center align-middle">
                <span :class="['rounded px-2 py-1 text-xs font-medium', product.statusClass]">
                  {{ product.statusLabel }}
                </span>
              </td>
              <td class="px-3 py-4 align-middle">
                <div class="flex w-full justify-center">
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    :disabled="movingToReadyId === product.registrationId"
                    @click="moveCoupangProductToReady(product)"
                  >
                    {{ movingToReadyId === product.registrationId ? '변경 중' : '수정' }}
                  </BaseButton>
                </div>
              </td>
              <td class="px-3 py-4 text-center align-middle text-xs text-neutral-500">
                {{ product.registeredAt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <!-- 등록 취소 상품 목록 (휴지통) -->
    <section class="mt-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <BaseSectionTitle>등록 취소 상품 목록</BaseSectionTitle>
        <p class="text-sm text-neutral-500">총 {{ canceledRows.length }}개 상품</p>
      </div>

      <!-- 취소 상품 필터 패널 -->
      <div class="mt-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="text-sm text-neutral-600">
            시작일
            <input
              v-model="canceledFilters.from"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            종료일
            <input
              v-model="canceledFilters.to"
              type="date"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
            />
          </label>
          <label class="text-sm text-neutral-600">
            소싱처
            <BaseSelect v-model="canceledFilters.source" class="mt-2 w-full">
              <option value="">전체 소싱처</option>
              <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600">
            최소 마진율
            <BaseSelect v-model="canceledFilters.minMarginRate" class="mt-2 w-full">
              <option v-for="option in marginOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </option>
            </BaseSelect>
          </label>
          <label class="text-sm text-neutral-600 md:col-span-2">
            상품명 / 해외 ID
            <input
              v-model.trim="canceledFilters.keyword"
              type="search"
              placeholder="상품명 또는 해외 마켓 ID"
              class="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              @keyup.enter="loadCanceledProducts"
            />
          </label>
          <div class="flex items-end justify-end gap-2 md:col-span-2">
            <BaseButton variant="secondary" size="sm" @click="resetCanceledFilters">필터 초기화</BaseButton>
            <BaseButton size="sm" :disabled="loadingCanceled" @click="loadCanceledProducts">검색</BaseButton>
          </div>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table class="w-full min-w-[900px] table-fixed text-left text-sm">
          <thead class="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
            <tr>
              <th class="w-[260px] px-3 py-3 text-center font-medium">상품명</th>
              <th class="px-3 py-3 text-center font-medium">해외 마켓 ID</th>
              <th class="px-3 py-3 text-center font-medium">소싱처</th>
              <th class="w-28 px-3 py-3 text-center font-medium">판매가</th>
              <th class="px-3 py-3 text-center font-medium">마진율</th>
              <th class="w-40 px-3 py-3 text-center font-medium">취소 일시</th>
            </tr>
          </thead>
          <tbody>
            <!-- 로딩 중 표시 -->
            <tr v-if="loadingCanceled">
              <td colspan="6" class="px-3 py-10 text-center text-neutral-500">
                등록 취소 상품을 불러오는 중입니다.
              </td>
            </tr>
            <!-- 취소 상품 없을 때 -->
            <tr v-else-if="canceledRows.length === 0">
              <td colspan="6" class="px-3 py-10 text-center text-neutral-400">
                등록 취소된 상품이 없습니다.
              </td>
            </tr>
            <!-- 취소 상품 행 목록 -->
            <tr
              v-for="product in canceledRows"
              v-else
              :key="product.registrationId ?? product.rowId"
              class="border-b border-neutral-100 last:border-0"
            >
              <td class="px-3 py-4 align-middle">
                <p class="truncate font-semibold text-neutral-500" :title="product.name">
                  {{ truncateText(product.name) }}
                </p>
              </td>
              <td class="px-3 py-4 text-center align-middle font-mono text-xs text-neutral-500">
                {{ product.overseasId }}
              </td>
              <td class="px-3 py-4 text-center align-middle text-neutral-500">{{ product.sourceMarket }}</td>
              <td class="px-3 py-4 text-center align-middle text-neutral-500">
                {{ product.salePrice === '-' ? '-' : `${product.salePrice}원` }}
              </td>
              <td class="px-3 py-4 text-center align-middle text-neutral-500">{{ product.marginRate }}</td>
              <!-- 취소 처리 일시 -->
              <td class="px-3 py-4 text-center align-middle text-xs text-neutral-400">
                {{ product.processedAt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 등록 취소 확인 모달 -->
    <Teleport to="body">
      <div
        v-if="confirmTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="dismissCancelConfirm"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <div class="flex items-start gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
              <Trash2 :size="18" class="text-red-500" />
            </div>
            <div>
              <p class="font-semibold text-neutral-900">등록 취소</p>
              <p class="mt-1 text-sm text-neutral-500">
                <span class="font-medium text-neutral-700">{{ confirmTarget.name }}</span> 상품의 등록을 취소할까요?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <BaseButton variant="secondary" size="sm" @click="dismissCancelConfirm">돌아가기</BaseButton>
            <button
              class="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
              @click="cancelRegistration"
            >
              취소 확정
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
