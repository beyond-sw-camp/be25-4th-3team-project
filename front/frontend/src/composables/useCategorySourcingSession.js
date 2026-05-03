import { ref } from 'vue'

import {
  mapAutoSourcingToRows,
  postSourcingAuto,
  resolveBannedWordsForSourcing,
} from '../api/sourcingApi.js'

/** 페이지를 벗어나도 유지되는 카테고리 소싱 세션 (로딩·경과·결과) */
export const sourcingLoading = ref(false)
export const sourcingSearchElapsed = ref(0)
export const sourcingError = ref('')
export const sourcingRows = ref([])
export const sourcingLastMeta = ref({ at: '', count: 0, elapsed: null })

export const SLOW_SEARCH_THRESHOLD_SEC = 15

let searchStartedAtMs = null
let elapsedTimerId = null

function formatNow() {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} 기준`
}

function tickElapsed() {
  if (searchStartedAtMs != null) {
    sourcingSearchElapsed.value = Math.floor((Date.now() - searchStartedAtMs) / 1000)
  }
}

function startElapsedTicker() {
  if (elapsedTimerId != null) {
    clearInterval(elapsedTimerId)
    elapsedTimerId = null
  }
  tickElapsed()
  elapsedTimerId = setInterval(tickElapsed, 1000)
}

function stopElapsedTicker() {
  if (elapsedTimerId != null) {
    clearInterval(elapsedTimerId)
    elapsedTimerId = null
  }
}

/**
 * 소싱 API 호출. 컴포넌트가 언마운트돼도 이 모듈 상태는 유지되며 fetch는 끝까지 진행됩니다.
 * @param {{ seasons: string[], banned_words?: string[], item_count?: number }} body
 */
export async function executeCategorySourcingSearch(body) {
  sourcingError.value = ''
  sourcingLoading.value = true
  searchStartedAtMs = Date.now()
  startElapsedTicker()

  try {
    const banned_words = await resolveBannedWordsForSourcing(body.banned_words ?? [])
    const payload = { ...body, banned_words }
    const { ok, status, data } = await postSourcingAuto(payload)

    if (!ok) {
      sourcingError.value =
        data && typeof data === 'object' && data.message != null
          ? String(data.message)
          : `요청 실패 (${status})`
      sourcingRows.value = []
      sourcingLastMeta.value = { at: formatNow(), count: 0, elapsed: null }
      return
    }
    if (data && data.status === 'error') {
      sourcingError.value = data.message != null ? String(data.message) : '소싱 서버 오류'
      sourcingRows.value = []
      sourcingLastMeta.value = { at: formatNow(), count: 0, elapsed: null }
      return
    }

    const mapped = mapAutoSourcingToRows(
      data?.keywords,
      data?.results,
      payload.seasons,
      payload.item_count,
    )
    sourcingRows.value = mapped
    sourcingLastMeta.value = {
      at: formatNow(),
      count: mapped.length,
      elapsed: data?.elapsed != null ? data.elapsed : null,
    }
  } catch (e) {
    sourcingError.value = e instanceof Error ? e.message : '네트워크 오류'
    sourcingRows.value = []
  } finally {
    stopElapsedTicker()
    searchStartedAtMs = null
    sourcingSearchElapsed.value = 0
    sourcingLoading.value = false
  }
}

/** 필터 초기화 시 결과 영역만 비울 때 */
export function resetCategorySourcingResults() {
  sourcingRows.value = []
  sourcingError.value = ''
  sourcingLastMeta.value = { at: '', count: 0, elapsed: null }
}

/**
 * 컴포넌트에서 그대로 쓸 수 있는 ref 묶음.
 * (언마운트해도 위 모듈 ref는 동일 인스턴스를 가리킵니다.)
 */
export function useCategorySourcingSession() {
  return {
    loading: sourcingLoading,
    searchElapsed: sourcingSearchElapsed,
    error: sourcingError,
    rows: sourcingRows,
    lastMeta: sourcingLastMeta,
    SLOW_THRESHOLD: SLOW_SEARCH_THRESHOLD_SEC,
  }
}
