import api from './axios'

function toApiError(error, fallbackMessage) {
  const apiError = new Error(error?.response?.data?.message || fallbackMessage)
  apiError.status = error?.response?.status
  apiError.data = error?.response?.data
  return apiError
}

export async function getMarginSummary() {
  try {
    const response = await api.get('/revenue/margin/summary')
    return response.data
  } catch (error) {
    throw toApiError(error, '마진 요약 정보를 불러오지 못했습니다.')
  }
}

export async function getRevenueProducts() {
  try {
    const response = await api.get('/revenue/products')
    return response.data
  } catch (error) {
    throw toApiError(error, '상품별 수익 정보를 불러오지 못했습니다.')
  }
}

export async function getMonthlyRevenue() {
  try {
    const response = await api.get('/orders/revenue/monthly')
    return response.data
  } catch (error) {
    throw toApiError(error, '월별 수익 정보를 불러오지 못했습니다.')
  }
}
