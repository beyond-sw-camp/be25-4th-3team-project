import api from './axios'

/** 모놀리식 백엔드에서 `/api/cards`(dev 프록시 기준)로 매핑된다고 가정 */
export const getCards = () => api.get('/cards')

export const getCard = (id) => api.get(`/cards/${id}`)

export const postCard = (data) => api.post('/cards', data)

export const deleteCard = (id) => api.delete(`/cards/${id}`)

export const toggleCard = (id) => api.patch(`/cards/${id}/toggle`)

export const getCardDetail = (id) => api.get(`/cards/${id}/decrypt`)
