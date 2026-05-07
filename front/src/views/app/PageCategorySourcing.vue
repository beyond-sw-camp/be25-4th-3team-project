<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import {
  executeCategorySourcingSearch,
  resetCategorySourcingResults,
  useCategorySourcingSession,
} from '../../composables/useCategorySourcingSession.js'
import { getUploadMarketSettings } from '../../api/uploadMarketPolicy'

const filters = [
  { title: '브랜드 유형', hint: '브랜드 유형을 선택하세요.' },
  {
    title: '시장 규모',
    hint: '슬라이더를 드래그해 0억 ~ 1000억 범위에서 선택하세요.',
  },
  { title: '검색 제한', hint: '시즌당 가져올 상품 수 (1~3, 서버는 최대 10)' },
]
const months = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
]

const selectedMonths = ref([])
const itemCount = ref(1)
const filterChoices = ref(['brand', '1'])
const marketSizeEok = ref(0)

const info = ref('')
const { loading, searchElapsed, error, rows, lastMeta, SLOW_THRESHOLD } =
  useCategorySourcingSession()
const router = useRouter()

const registrationMarketCode = 'COUPANG'
const loadingMarketPolicy = ref(false)
const marketPolicy = ref(null)
const marketPolicyLoaded = ref(false)

const hasDefaultMarginRate = computed(() => {
  const marginRate = Number(marketPolicy.value?.targetMarginRate)
  return Number.isFinite(marginRate) && marginRate > 0
})

const sourceBlockedMessage = computed(() => {
  if (loadingMarketPolicy.value) return '등록 마켓 정책을 확인하는 중입니다.'
  if (!marketPolicyLoaded.value || !hasDefaultMarginRate.value) {
    return '등록 마켓의 기본 마진율 설정이 안되어 있습니다.'
  }
  return ''
})

const canSourceProducts = computed(() => sourceBlockedMessage.value === '')

onMounted(loadRegistrationMarketPolicy)

const resultSummary = computed(() => {
  const m = lastMeta.value
  if (!m.at && rows.value.length === 0) return '검색하기를 눌러 소싱을 실행하세요.'
  const elapsed = m.elapsed != null ? ` · 소요 ${m.elapsed}초` : ''
  return `${m.at} · 결과 ${m.count}건${elapsed}`
})

function isMonthSelected(m) {
  return selectedMonths.value.includes(m)
}

function toggleMonth(m) {
  const i = selectedMonths.value.indexOf(m)
  if (i >= 0) selectedMonths.value = selectedMonths.value.filter((x) => x !== m)
  else selectedMonths.value = [...selectedMonths.value, m]
}

function setFilterRadio(cardIndex, value) {
  const next = [...filterChoices.value]
  if (cardIndex === 0) {
    next[0] = value
    filterChoices.value = next
  } else if (cardIndex === 2) {
    next[1] = value
    filterChoices.value = next
    const n = Number(value)
    if (!Number.isNaN(n)) itemCount.value = Math.min(10, Math.max(1, n))
  }
}

function resetFilters() {
  selectedMonths.value = []
  itemCount.value = 1
  filterChoices.value = ['brand', '1']
  marketSizeEok.value = 0
  resetCategorySourcingResults()
  info.value = ''
}

function stubLoadCategory() {
  info.value = '저장된 카테고리를 불러오는 API는 추후 연동 예정입니다.'
}

async function loadRegistrationMarketPolicy() {
  loadingMarketPolicy.value = true
  try {
    marketPolicy.value = await getUploadMarketSettings(registrationMarketCode)
    marketPolicyLoaded.value = true
  } catch (e) {
    marketPolicy.value = null
    marketPolicyLoaded.value = false
    if (e?.status && e.status !== 404) {
      error.value = e instanceof Error ? e.message : '등록 마켓 정책을 확인하지 못했습니다.'
    }
  } finally {
    loadingMarketPolicy.value = false
  }
}

function saveTableState() {
  error.value = ''
  info.value = '표 상태 저장 API는 추후 연동 예정입니다.'
}

function goToUploadMarketPolicy() {
  router.push({ name: 'app-upload-markets' })
}

async function runSearch() {
  info.value = ''
  if (!canSourceProducts.value) {
    error.value = sourceBlockedMessage.value
    return
  }

  if (selectedMonths.value.length === 0) {
    error.value = '계절성으로 쓸 달을 하나 이상 선택하세요.'
    return
  }

  const body = {
    seasons: [...selectedMonths.value],
    /** 화면에서만 쓰는 추가 금지어. 정책 `GET /policies/blocked-words`는 소싱 실행 시 자동 합침 */
    banned_words: [],
    item_count: itemCount.value,
  }
  await executeCategorySourcingSearch(body)
}
</script>

<template>
  <div>
    <!-- ═══ 검색 필터 ═══ -->
    <section>
      <BaseSectionTitle>검색 필터</BaseSectionTitle>
      <div class="mt-3 h-px bg-neutral-200" />
      <div class="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="(f, i) in filters"
          :key="i"
          class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <p class="font-medium text-neutral-900">{{ f.title }}</p>
          <p class="mt-2 text-sm text-neutral-500">{{ f.hint }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <!-- 브랜드 유형 -->
            <template v-if="i === 0">
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="f-brand"
                  class="text-point"
                  value="brand"
                  :checked="filterChoices[0] === 'brand'"
                  @change="setFilterRadio(0, 'brand')"
                />
                브랜드
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="f-brand"
                  class="text-point"
                  value="non-brand"
                  :checked="filterChoices[0] === 'non-brand'"
                  @change="setFilterRadio(0, 'non-brand')"
                />
                미 브랜드
              </label>
            </template>
            <!-- 시장 규모 슬라이더 -->
            <template v-else-if="i === 1">
              <div class="w-full space-y-3 pt-1">
                <input
                  v-model.number="marketSizeEok"
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  class="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-point"
                />
                <div class="flex items-center justify-between gap-2 text-xs text-neutral-500">
                  <span>0억</span>
                  <span class="text-base font-semibold tabular-nums text-point"
                    >{{ marketSizeEok }}억</span
                  >
                  <span>1000억</span>
                </div>
              </div>
            </template>
            <!-- 검색 제한 -->
            <template v-else-if="i === 2">
              <label
                v-for="opt in ['1', '2', '3']"
                :key="opt"
                class="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  :name="`f-${i}`"
                  class="text-point"
                  :value="opt"
                  :checked="filterChoices[1] === opt"
                  @change="setFilterRadio(i, opt)"
                />
                {{ opt }}개
              </label>
            </template>
          </div>
        </div>
      </div>

      <!-- 월 선택 -->
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button
          v-for="m in months"
          :key="m"
          type="button"
          class="inline-flex items-center gap-2 rounded border px-3 py-1 text-sm transition-colors"
          :class="
            isMonthSelected(m)
              ? 'border-point bg-point/10 text-point'
              : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
          "
          @click="toggleMonth(m)"
        >
          <span
            class="size-2 rounded-full"
            :class="isMonthSelected(m) ? 'bg-point' : 'bg-point/30'"
          />
          {{ m }}
        </button>
      </div>

      <!-- 액션 버튼 -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          :disabled="loading || !canSourceProducts"
          class="rounded border border-point bg-point px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
          @click="runSearch"
        >
          {{ loading ? '검색 중…' : '검색하기' }}
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
          @click="resetFilters"
        >
          필터 초기화
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
          @click="stubLoadCategory"
        >
          카테고리 불러오기
        </button>
      </div>

      <div
        v-if="sourceBlockedMessage"
        class="mt-3 flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
      >
        <span>{{ sourceBlockedMessage }}</span>
        <button
          type="button"
          class="rounded border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
          @click="goToUploadMarketPolicy"
        >
          정책 설정으로 이동
        </button>
      </div>

      <!-- ── 소싱 로딩 바 (페이지 이탈 후에도 세션 유지) ── -->
      <div v-if="loading" class="mt-4 space-y-2">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div class="loading-bar h-full rounded-full bg-point" />
        </div>
        <p class="text-sm text-neutral-600">
          소싱 진행 중… <span class="font-medium tabular-nums">{{ searchElapsed }}초</span> 경과
        </p>
        <p class="text-xs text-neutral-500">
          다른 메뉴로 나가도 요청은 브라우저에서 계속 진행됩니다. 다시 이 페이지로 오면 로딩·경과
          시간·완료 후 결과가 이어집니다.
        </p>
        <p v-if="searchElapsed >= SLOW_THRESHOLD" class="text-sm text-amber-600">
          상품의 옵션이 많은 경우 소싱하는 데 2~10분 정도 걸릴 수도 있습니다.
        </p>
      </div>

      <p v-if="error" class="mt-3 whitespace-pre-line text-sm text-red-600">{{ error }}</p>
      <p v-if="info" class="mt-3 whitespace-pre-line text-sm text-neutral-600">{{ info }}</p>
    </section>

    <!-- ═══ 검색 결과 ═══ -->
    <section class="mt-10">
      <BaseSectionTitle>검색 결과</BaseSectionTitle>
      <div class="mt-3 h-px bg-neutral-200" />
      <p class="mt-4 text-sm text-neutral-600">{{ resultSummary }}</p>
      <div class="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table class="min-w-[900px] w-full text-left text-sm">
          <thead class="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
            <tr>
              <th class="px-3 py-3 font-medium">키워드</th>
              <th class="px-3 py-3 font-medium">유형</th>
              <th class="px-3 py-3 font-medium">브랜드</th>
              <th class="px-3 py-3 font-medium">트렌드</th>
              <th class="px-3 py-3 font-medium">최근 30일 검색량</th>
              <th class="px-3 py-3 font-medium">작년 총 검색량</th>
              <th class="px-3 py-3 font-medium">경쟁 강도</th>
              <th class="px-3 py-3 font-medium">추천 지수</th>
              <th class="px-3 py-3 font-medium">계절성</th>
              <th class="px-3 py-3 font-medium">1년 평균 트렌드</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && rows.length === 0">
              <td colspan="10" class="px-3 py-8 text-center text-neutral-500">
                결과가 없습니다. 달을 선택한 뒤 검색하기를 실행하세요.
              </td>
            </tr>
            <tr v-for="(row, idx) in rows" :key="idx" class="border-b border-neutral-100">
              <td class="px-3 py-3 font-medium">{{ row.keyword }}</td>
              <td class="px-3 py-3 text-neutral-600">{{ row.type }}</td>
              <td class="px-3 py-3 text-neutral-600">{{ row.brand }}</td>
              <td class="px-3 py-3 text-point">{{ row.trend }}</td>
              <td class="px-3 py-3">{{ row.vol30 }}</td>
              <td class="px-3 py-3">{{ row.volYtd }}</td>
              <td class="px-3 py-3">{{ row.competition }}</td>
              <td class="px-3 py-3 font-semibold text-point">{{ row.score }}</td>
              <td class="px-3 py-3">{{ row.seasonality }}</td>
              <td class="px-3 py-3 text-neutral-500">{{ row.trendY }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 하단 버튼 -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          :disabled="loading"
          class="rounded border border-neutral-300 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
          @click="saveTableState"
        >
          표 상태 저장
        </button>
        <button type="button" class="rounded border border-neutral-300 px-3 py-1.5 text-xs">
          표 상태 초기화
        </button>
        <button type="button" class="rounded border border-neutral-300 px-3 py-1.5 text-xs">
          현재 결과 액셀 저장
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.loading-bar {
  width: 40%;
  animation: slide 1.4s ease-in-out infinite;
}
@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>
