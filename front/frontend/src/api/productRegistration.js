import api from './axios'

const REGISTRATION_PATH = '/products/registrations'
const COUPANG_PRODUCTS_PATH = '/products/coupang'
const PROCESSING_PATH = '/products/processing'
const NAME_PROCESSING_PATH = '/products/processing/name'

function toApiError(error, fallbackMessage) {
  // 서버가 내려준 메시지가 있으면 그대로 표시하고, 없으면 화면 기본 문구를 사용한다.
  const apiError = new Error(error?.response?.data?.message || fallbackMessage)
  apiError.status = error?.response?.status
  apiError.data = error?.response?.data
  return apiError
}

export async function getProductRegistrations(marketCode) {
  try {
    const response = await api.get(REGISTRATION_PATH, {
      params: { marketCode },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 상품 목록을 불러오지 못했습니다.')
  }
}

export async function searchReadyProductRegistrations(params = {}) {
  try {
    const response = await api.get(`${REGISTRATION_PATH}/ready/search`, { params })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 대기 상품 목록을 불러오지 못했습니다.')
  }
}

// 등록 취소(CANCELED) 상태 상품 목록 조회
export async function searchCanceledProductRegistrations(params = {}) {
  try {
    const response = await api.get(`${REGISTRATION_PATH}/canceled/search`, { params })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 취소 상품 목록을 불러오지 못했습니다.')
  }
}

export async function searchRegisteredProductRegistrations(params = {}) {
  try {
    const response = await api.get(`${REGISTRATION_PATH}/registered/search`, { params })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 완료 상품 목록을 불러오지 못했습니다.')
  }
}

export async function getProductRegistrationStatusCounts(params = {}) {
  try {
    const response = await api.get(`${REGISTRATION_PATH}/status-counts`, { params })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 상품 건수를 불러오지 못했습니다.')
  }
}

export async function updateProductRegistrationStatus(registrationId, status, reason) {
  try {
    const response = await api.patch(`${REGISTRATION_PATH}/${registrationId}/status`, null, {
      params: { status, reason },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 상품 상태를 변경하지 못했습니다.')
  }
}

export async function getProductRegistration(registrationId) {
  try {
    const response = await api.get(`${REGISTRATION_PATH}/${registrationId}`)
    return response.data
  } catch (error) {
    throw toApiError(error, '등록 상품 상세 정보를 불러오지 못했습니다.')
  }
}

export async function publishCoupangProduct(registrationId) {
  try {
    const response = await api.post(`${REGISTRATION_PATH}/${registrationId}/publish/coupang`, null, {
      params: {
        manual: true,
        ignoreAutoPublish: true,
      },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '쿠팡 상품 발행에 실패했습니다.')
  }
}

export async function publishCoupangProducts(registrationIds) {
  try {
    const response = await api.post(`${REGISTRATION_PATH}/publish/coupang`, { registrationIds }, {
      params: {
        manual: true,
        ignoreAutoPublish: true,
      },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '선택한 상품을 쿠팡으로 발행하지 못했습니다.')
  }
}

export async function getCoupangProducts() {
  try {
    const response = await api.get(COUPANG_PRODUCTS_PATH)
    return response.data
  } catch (error) {
    throw toApiError(error, '쿠팡 상품 목록을 불러오지 못했습니다.')
  }
}

export async function searchCoupangProducts(params = {}) {
  try {
    const response = await api.get(`${COUPANG_PRODUCTS_PATH}/search`, { params })
    return response.data
  } catch (error) {
    throw toApiError(error, '쿠팡 상품 검색에 실패했습니다.')
  }
}

export async function getCoupangProduct(dummyCoupangProductId) {
  try {
    const response = await api.get(`${COUPANG_PRODUCTS_PATH}/${dummyCoupangProductId}`)
    return response.data
  } catch (error) {
    throw toApiError(error, '쿠팡 상품 상세 정보를 불러오지 못했습니다.')
  }
}

export async function deleteProductRegistration(registrationId) {
  try {
    await api.delete(`${REGISTRATION_PATH}/${registrationId}`)
  } catch (error) {
    throw toApiError(error, '등록 상품을 삭제하지 못했습니다.')
  }
}

export async function deleteProductRegistrations(registrationIds) {
  try {
    await api.delete(REGISTRATION_PATH, {
      data: { registrationIds },
    })
  } catch (error) {
    throw toApiError(error, '등록 상품을 삭제하지 못했습니다.')
  }
}

export async function processProductName(marketCode, productName) {
  try {
    const response = await api.post(
      NAME_PROCESSING_PATH,
      { productName },
      {
        params: { marketCode },
      },
    )
    return response.data
  } catch (error) {
    throw toApiError(error, '상품명을 가공하지 못했습니다.')
  }
}

export async function processProduct(marketCode, product) {
  try {
    // ProductProcessingRequest DTO 필드에 맞춘 실제 payload는 백엔드 DTO 확정 시 여기에서 조정한다.
    const response = await api.post(PROCESSING_PATH, product, {
      params: { marketCode },
    })
    return response.data
  } catch (error) {
    throw toApiError(error, '상품을 등록 처리하지 못했습니다.')
  }
}
