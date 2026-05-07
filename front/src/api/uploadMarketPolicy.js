import api from './axios'

const POLICY_SETTING_PATH = '/policies/settings'

function toApiError(error, fallbackMessage) {
  const apiError = new Error(error?.response?.data?.message || fallbackMessage)
  apiError.status = error?.response?.status
  apiError.data = error?.response?.data
  return apiError
}

export async function getUploadMarketSettings(marketCode) {
  try {
    const response = await api.get(POLICY_SETTING_PATH, {
      params: { marketCode },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '설정 정보를 불러오지 못했습니다.')
  }
}

async function createUploadMarketSettings(marketCode, settings) {
  const response = await api.post(POLICY_SETTING_PATH, settings, {
    params: { marketCode },
  })
  return response.data
}

export async function updateUploadMarketSettings(marketCode, settings) {
  try {
    const response = await api.put(POLICY_SETTING_PATH, settings, {
      params: { marketCode },
    })
    return response.data
  } catch (error) {
    if ([404, 405].includes(error?.response?.status)) {
      try {
        return await createUploadMarketSettings(marketCode, settings)
      } catch (createError) {
        throw toApiError(createError, '설정 정보를 저장하지 못했습니다.')
      }
    }

    throw toApiError(error, '설정 정보를 저장하지 못했습니다.')
  }
}
