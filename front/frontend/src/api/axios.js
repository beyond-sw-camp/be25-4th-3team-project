import axios from 'axios'

const DEFAULT_API_BASE_URL = 'http://localhost:8080'
const DEFAULT_DEV_API_BASE_URL = '/api'

const defaultApiBaseUrl = import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_API_BASE_URL
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, '')

// JWT 쿠키 기반 인증을 위해 withCredentials 강제 true
const withCredentials = true

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 디버깅용
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 디버깅용
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.status, error.response.data)

      // 401 인증 실패 특별 로깅
      if (error.response.status === 401) {
        console.error('[API Error] 401 Unauthorized - 로그인이 필요합니다.')
      }

      // HTML 응답 감지 (JSON API가 아닌 경우)
      if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        console.error('[API Error] HTML 응답 감지 - /api/users/me 경로를 사용하고 있는지 확인하세요.')
      }
    } else {
      console.error('[API Error]', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
