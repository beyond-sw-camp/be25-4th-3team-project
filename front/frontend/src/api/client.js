import api from './axios'

// 기존 브랜치에서 ../api/client를 import해도 같은 axios 인스턴스를 사용하게 합니다.
export const apiClient = api
export { api }
export default api
