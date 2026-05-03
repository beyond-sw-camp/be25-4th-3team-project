<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import BaseSelect from '../../components/common/BaseSelect.vue'
import { getUploadMarketSettings, updateUploadMarketSettings } from '../../api/uploadMarketPolicy'

const marketOptions = [
  { label: '쿠팡', value: 'COUPANG' },
  { label: '네이버 스마트 스토어', value: 'NAVER_SMART_STORE' },
  { label: '11번가', value: 'ELEVEN_STREET' },
  { label: '지마켓', value: 'GMARKET' },
  { label: '옥션', value: 'AUCTION' },
]

const roundingUnitOptions = [10000, 1000, 100, 50, 10]

const roundingUnitByAmount = {
  10000: 'TEN_THOUSAND_WON',
  1000: 'THOUSAND_WON',
  100: 'HUNDRED_WON',
  50: 'FIFTY_WON',
  10: 'TEN_WON',
}

const roundingAmountByUnit = Object.fromEntries(
  Object.entries(roundingUnitByAmount).map(([amount, unit]) => [unit, Number(amount)]),
)

const form = reactive({
  market: 'COUPANG',
  targetMarginRate: 30,
  minimumMargin: 8000,
  marketFeeRate: 10,
  cardFeeRate: 3.3,
  exchangeRate: 1350,
  roundingUnit: 100,
  amazonPriceAdjust: true,
  competeAdjust: true,
  minimumMarginProtection: true,
  exchangeRateAutoUpdate: true,
  stopSellingOnLoss: true,
  shippingType: 'PAID',
  defaultShippingFee: 5000,
  remoteAreaFee: 8000,
  returnShippingFee: 10000,
  autoPublish: true,
})

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')
const infoMessage = ref('')

const isFreeShipping = computed(() => form.shippingType === 'FREE')

function applySettings(settings) {
  if (!settings || typeof settings !== 'object') return
  Object.assign(form, {
    market: settings.marketCode ?? form.market,
    targetMarginRate: Number(settings.targetMarginRate ?? form.targetMarginRate),
    minimumMargin: Number(settings.minMarginAmount ?? form.minimumMargin),
    marketFeeRate: Number(settings.marketFeeRate ?? form.marketFeeRate),
    cardFeeRate: Number(settings.cardFeeRate ?? form.cardFeeRate),
    exchangeRate: Number(settings.exchangeRate ?? form.exchangeRate),
    roundingUnit: roundingAmountByUnit[settings.roundingUnit] ?? form.roundingUnit,
    amazonPriceAdjust: settings.amazonAutoPricingEnabled ?? form.amazonPriceAdjust,
    competeAdjust: settings.competitorAutoPricingEnabled ?? form.competeAdjust,
    minimumMarginProtection: settings.minMarginProtectEnabled ?? form.minimumMarginProtection,
    exchangeRateAutoUpdate: settings.priceAutoUpdateEnabled ?? form.exchangeRateAutoUpdate,
    stopSellingOnLoss: settings.stopLossEnabled ?? form.stopSellingOnLoss,
    shippingType: settings.shippingFeeType === 'FREE_SHIPPING' ? 'FREE' : 'PAID',
    defaultShippingFee: Number(settings.baseShippingFee ?? form.defaultShippingFee),
    remoteAreaFee: Number(settings.remoteAreaExtraShippingFee ?? form.remoteAreaFee),
    returnShippingFee: Number(settings.returnShippingFee ?? form.returnShippingFee),
    autoPublish: settings.autoPublishEnabled ?? form.autoPublish,
  })
}

function toPolicySettingRequest() {
  return {
    targetMarginRate: form.targetMarginRate,
    minMarginAmount: form.minimumMargin,
    marketFeeRate: form.marketFeeRate,
    cardFeeRate: form.cardFeeRate,
    exchangeRate: form.exchangeRate,
    roundingUnit: roundingUnitByAmount[form.roundingUnit],
    amazonAutoPricingEnabled: form.amazonPriceAdjust,
    competitorAutoPricingEnabled: form.competeAdjust,
    minMarginProtectEnabled: form.minimumMarginProtection,
    priceAutoUpdateEnabled: form.exchangeRateAutoUpdate,
    stopLossEnabled: form.stopSellingOnLoss,
    autoPublishEnabled: form.autoPublish,
    shippingFeeType: form.shippingType === 'FREE' ? 'FREE_SHIPPING' : 'PAID_SHIPPING',
    baseShippingFee: isFreeShipping.value ? 0 : form.defaultShippingFee,
    remoteAreaExtraShippingFee: form.remoteAreaFee,
    returnShippingFee: form.returnShippingFee,
  }
}

async function loadSettings() {
  loading.value = true
  errorMessage.value = ''
  infoMessage.value = ''

  try {
    applySettings(await getUploadMarketSettings(form.market))
  } catch (error) {
    if (error?.status === 404) {
      infoMessage.value = '아직 저장된 설정이 없습니다. 기본값을 확인한 뒤 저장해 주세요.'
      return
    }

    errorMessage.value = error instanceof Error ? error.message : '설정 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''
  infoMessage.value = ''

  try {
    applySettings(await updateUploadMarketSettings(form.market, toPolicySettingRequest()))
    savedMessage.value = '설정 정보를 저장했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '설정 정보를 저장하지 못했습니다.'
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)

watch(
  () => form.market,
  () => {
    savedMessage.value = ''
    loadSettings()
  },
)
</script>

<template>
  <form @submit.prevent="saveSettings">
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <BaseSectionTitle class="mb-4">상품 업로드 마켓</BaseSectionTitle>
        <div class="flex items-center gap-3">
          <label for="market-select" class="shrink-0 text-sm text-neutral-600">국내 마켓</label>
          <BaseSelect id="market-select" v-model="form.market" class="w-full" :disabled="loading">
            <option v-for="market in marketOptions" :key="market.value" :value="market.value">
              {{ market.label }}
            </option>
          </BaseSelect>
        </div>

        <div
          class="mt-6 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 items-center"
        >
          <span class="px-2">ⓘ</span>
          <p>
            이 설정은 앞으로 등록할 상품의 가격에 반영됩니다.
            <br />
            이미 업로드된 제품에는 적용되지 않습니다.
          </p>
        </div>

        <BaseSectionTitle class="mt-6">기본 판매 가격 설정</BaseSectionTitle>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm">
            <span class="text-neutral-600">목표 마진율 (%)</span>
            <input
              v-model.number="form.targetMarginRate"
              type="number"
              :disabled="loading"
              class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="block text-sm">
            <span class="text-neutral-600">최소 마진 (원)</span>
            <input
              v-model.number="form.minimumMargin"
              type="number"
              step="100"
              :disabled="loading"
              class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="block text-sm">
            <span class="text-neutral-600">마켓 수수료 (%)</span>
            <input
              v-model.number="form.marketFeeRate"
              type="number"
              :disabled="loading"
              class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="block text-sm">
            <span class="text-neutral-600">카드 수수료 (%)</span>
            <input
              v-model.number="form.cardFeeRate"
              type="number"
              step="0.1"
              :disabled="loading"
              class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="block text-sm">
            <span class="text-neutral-600">환율</span>
            <input
              v-model.number="form.exchangeRate"
              type="number"
              step="50"
              :disabled="loading"
              class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label for="roundingUnit" class="block text-sm text-neutral-600">
            단위 올림
            <BaseSelect
              id="roundingUnit"
              v-model="form.roundingUnit"
              class="mt-1 w-full"
              :disabled="loading"
            >
              <option v-for="unit in roundingUnitOptions" :key="unit" :value="unit">
                {{ unit }}원
              </option>
            </BaseSelect>
          </label>
        </div>

        <div class="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p class="flex items-center gap-2 text-sm font-medium text-neutral-800">
            <span class="text-point">✓</span>
            가격 계산 기준
          </p>
          <p class="mt-2 text-sm text-neutral-600">
            Amazon 상품 가격을 기준으로 환율과 수수료를 적용하여 판매 가격을 자동 계산
          </p>
        </div>

        <BaseSectionTitle class="mt-6">AI 기반 자동 최적화</BaseSectionTitle>
        <div class="space-y-4 border-t border-neutral-100 pt-6">
          <label class="flex items-start gap-3 text-sm">
            <input
              v-model="form.amazonPriceAdjust"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium text-neutral-900">Amazon 가격 기준 자동 조정</span>
              <span class="mt-1 block text-neutral-600"
                >Amazon 가격 변동에 따라 판매 가격을 자동으로 조정합니다.</span
              >
            </span>
          </label>
          <label class="flex items-start gap-3 text-sm">
            <input
              v-model="form.competeAdjust"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium text-neutral-900">경쟁 상품 가격 자동 조정</span>
              <span class="mt-1 block text-neutral-600"
                >경쟁 상품 최저가보다 100원 낮게 자동 설정</span
              >
            </span>
          </label>
        </div>
      </section>

      <section class="space-y-6">
        <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <BaseSectionTitle>자동 보호 설정</BaseSectionTitle>
          <label class="mt-4 flex items-start gap-3 text-sm">
            <input
              v-model="form.minimumMarginProtection"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium">최소 마진 보호</span>
              <span class="mt-1 block text-neutral-600">
                설정한 최소 마진 이하로 이익이 내려가지 않도록 자동으로 가격을 조정합니다.
              </span>
            </span>
          </label>
          <label class="mt-4 flex items-start gap-3 text-sm">
            <input
              v-model="form.exchangeRateAutoUpdate"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium">환율 변동 시 가격 자동 업데이트</span>
              <span class="mt-1 block text-neutral-600"
                >환율 변동이 발생하면 판매 가격을 자동으로 업데이트합니다.</span
              >
            </span>
          </label>
          <label class="mt-4 flex items-start gap-3 text-sm">
            <input
              v-model="form.stopSellingOnLoss"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium">손실 발생 시 판매 중지</span>
              <span class="mt-1 block text-neutral-600">
                가격 변동으로 손실이 발생할 경우 해당 상품을 자동으로 판매 중지합니다.
              </span>
            </span>
          </label>
        </div>

        <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <BaseSectionTitle>배송비 설정</BaseSectionTitle>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="text-sm">
              <span class="text-neutral-600">배송비 종류</span>
              <BaseSelect v-model="form.shippingType" class="mt-1 w-full" :disabled="loading">
                <option value="PAID">유료 배송</option>
                <option value="FREE">무료 배송</option>
              </BaseSelect>
            </label>
            <label class="text-sm">
              <span class="text-neutral-600">기본 배송비</span>
              <input
                v-model.number="form.defaultShippingFee"
                type="number"
                step="1000"
                class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-400"
                :disabled="loading || isFreeShipping"
              />
            </label>
            <label class="text-sm">
              <span class="text-neutral-600">제주 도서산간 추가비용</span>
              <input
                v-model.number="form.remoteAreaFee"
                type="number"
                step="1000"
                :disabled="loading"
                class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="text-sm">
              <span class="text-neutral-600">반품비 (편도)</span>
              <input
                v-model.number="form.returnShippingFee"
                type="number"
                step="1000"
                :disabled="loading"
                class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div
            class="mt-4 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900"
          >
            <span></span>
            <p>
              ⓘ 국내 마켓 업로드 시, 마켓 배송비 정책에 맞지 않으면 상품 배송비가 자동으로 변경되어
              업로드될 수 있습니다.
              <br />
              ⓘ 해외 상품(구매대행)은 무료배송이라도 반품비/ 교환비를 반드시 입력해야 합니다.
              <br />
              ⓘ 국내 마켓 정책에 따라 해외 상품 반품비(편도)는 최소 5,000원 이상 권장됩니다.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <BaseSectionTitle>상품 소싱 등록 설정</BaseSectionTitle>
          <label class="mt-4 flex items-start gap-3 text-sm">
            <input
              v-model="form.autoPublish"
              type="checkbox"
              :disabled="loading"
              class="mt-1 rounded border-neutral-300 text-point"
            />
            <span>
              <span class="font-medium text-neutral-900">국내 마켓 자동 등록</span>
              <span class="mt-1 block text-neutral-600"
                >소싱 상품을 가공 한 이후 등록 대기 상태를 거치지 않고 마켓에 자동으로
                등록하니다.</span
              >
            </span>
          </label>
        </div>

        <p
          v-if="errorMessage"
          class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>
        <p
          v-if="infoMessage"
          class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {{ infoMessage }}
        </p>
        <p
          v-if="savedMessage"
          class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {{ savedMessage }}
        </p>
        <BaseButton type="submit" size="lg" block :disabled="loading || saving">
          {{ saving ? '저장 중...' : '설정 정보 저장하기' }}
        </BaseButton>
      </section>
    </div>
  </form>
</template>
