import api from './axios'

/**
 * 주문·배송 API — 개발 시 baseURL `/api`(axios.js) → Vite 프록시 → 모놀리식 백엔드
 * 경로는 모놀리식 컨트롤러 매핑에 맞게 조정 (필요 시 .env의 VITE_API_BASE_URL 사용)
 */
export const fetchOrders = async () => {
  const { data } = await api.get('/orders')
  return Array.isArray(data) ? data : data?.content ?? []
}

export const fetchOrderManagement = async () => {
  const { data } = await api.get('/orders/management')
  return Array.isArray(data) ? data : data?.content ?? []
}

export const fetchFailedOrders = async () => {
  const { data } = await api.get('/orders/failed')
  return Array.isArray(data) ? data : data?.content ?? []
}

export const cancelOrder = async (orderId) => {
  const { data } = await api.patch(`/orders/${orderId}/cancel`)
  return data
}

export const fetchShipmentByOrderId = async (orderId) => {
  const { data } = await api.get('/shipping/orderId', {
    params: { orderId },
  })
  return data
}

export const updateShipmentStatus = async (shipmentId, status) => {
  const { data } = await api.patch(`/shipping/${shipmentId}/status`, { status })
  return data
}
