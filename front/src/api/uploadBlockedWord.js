import api from './axios'

const BLOCKED_WORD_PATH = '/policies/blocked-words'
const REPLACEMENT_WORD_PATH = '/policies/replacement-words'

function toApiError(error, fallbackMessage) {
  // 화면에서는 서버 메시지가 있으면 우선 보여주고, 없으면 기본 문구를 사용한다.
  const apiError = new Error(error?.response?.data?.message || fallbackMessage)
  apiError.status = error?.response?.status
  apiError.data = error?.response?.data
  return apiError
}

export async function getBlockedWords() {
  try {
    const response = await api.get(BLOCKED_WORD_PATH)
    return response.data
  } catch (error) {
    throw toApiError(error, '금지단어를 불러오지 못했습니다.')
  }
}

export async function createBlockedWord(blockedWord) {
  try {
    // DTO 필드명이 달라도 일부 백엔드 버전과 호환되도록 대표 필드를 함께 보낸다.
    const response = await api.post(BLOCKED_WORD_PATH, {
      blockedWord,
      word: blockedWord,
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '금지단어를 추가하지 못했습니다.')
  }
}

export async function updateBlockedWord(userBlockedWordId, blockedWord) {
  try {
    // userBlockedWordId는 로그인 사용자에게 속한 금지어 식별자이다.
    const response = await api.put(`${BLOCKED_WORD_PATH}/${userBlockedWordId}`, {
      blockedWord,
      word: blockedWord,
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '금지단어를 수정하지 못했습니다.')
  }
}

export async function deleteBlockedWord(userBlockedWordId) {
  try {
    await api.delete(`${BLOCKED_WORD_PATH}/${userBlockedWordId}`)
  } catch (error) {
    throw toApiError(error, '금지단어를 삭제하지 못했습니다.')
  }
}

export async function getReplacementWords() {
  try {
    const response = await api.get(REPLACEMENT_WORD_PATH)
    return response.data
  } catch (error) {
    throw toApiError(error, '치환단어를 불러오지 못했습니다.')
  }
}

export async function createReplacementWord(sourceWord, replacementWord) {
  try {
    // 치환어는 원본 단어와 바꿀 단어를 한 쌍으로 저장한다.
    const response = await api.post(REPLACEMENT_WORD_PATH, {
      sourceWord,
      originalWord: sourceWord,
      replacementWord,
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '치환단어를 추가하지 못했습니다.')
  }
}

export async function updateReplacementWord(userReplacementWordId, sourceWord, replacementWord) {
  try {
    const response = await api.put(`${REPLACEMENT_WORD_PATH}/${userReplacementWordId}`, {
      sourceWord,
      originalWord: sourceWord,
      replacementWord,
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '치환단어를 수정하지 못했습니다.')
  }
}

export async function deleteReplacementWord(userReplacementWordId) {
  try {
    await api.delete(`${REPLACEMENT_WORD_PATH}/${userReplacementWordId}`)
  } catch (error) {
    throw toApiError(error, '치환단어를 삭제하지 못했습니다.')
  }
}
