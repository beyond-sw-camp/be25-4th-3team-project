<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '../api/axios'

const router = useRouter()

const username = ref('')
const password = ref('')
const rememberId = ref(false)

const usernameError = ref('')
const passwordError = ref('')
const generalError = ref('')
const successMessage = ref('')

const oauthBaseUrl = (api.defaults.baseURL || '').replace(/\/$/, '')
const loginUrl = (() => {
  const raw = (import.meta.env.VITE_AUTH_BASE_URL || '').trim().replace(/\/$/, '')
  if (!raw) return '/users/login'
  if (raw.endsWith('/users/login')) return raw
  return `${raw}/users/login`
})()

const handleLogin = async () => {
  usernameError.value = ''
  passwordError.value = ''
  generalError.value = ''
  successMessage.value = ''

  if (!username.value.trim()) {
    usernameError.value = '아이디를 입력하세요.'
    return
  }

  if (!password.value.trim()) {
    passwordError.value = '비밀번호를 입력하세요.'
    return
  }

  try {
    const params = new URLSearchParams()
    params.append('username', username.value)
    params.append('password', password.value)

    const response = await axios.post(loginUrl, params, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const meResponse = await api.get('/users/me')

    // console.log('로그인 응답:', response)
    // console.log('/users/me 응답 status:', meResponse.status)
    successMessage.value = '로그인 성공'
    router.push('/')
  } catch (err) {
    // console.error('로그인 실패:', err)

    if (err.response) {
      if (err.response.status === 401) {
        generalError.value = '아이디나 비밀번호가 틀렸습니다.'
      } else {
        generalError.value = `로그인 실패 / status: ${err.response.status}`
      }
    } else {
      generalError.value = '서버 연결 실패'
    }
  }
}

const goToSignup = () => {
  router.push('/signup')
}

const goToFindId = () => {
  router.push('/find-id')
}

const goToFindPassword = () => {
  router.push('/find-password')
}

const goToHome = () => {
  router.push('/')
}

const handleGoogleLogin = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`
}

const handleKakaoLogin = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/kakao`
}

const handleNaverLogin = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/naver`
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-white">
    <div class="grid h-full w-full grid-cols-1 md:grid-cols-[9fr_11fr]">
      <!-- 왼쪽: 주황색 배너 -->
      <section class="relative flex flex-col justify-between overflow-hidden bg-[#ff7b39] px-12 py-8 md:px-20 md:py-10">
        <!-- 장식 요소들 -->
        <div class="pointer-events-none absolute right-20 top-10 z-[1] h-32 w-48 rotate-[-25deg] rounded-2xl border-4 border-white/20"></div>
        <div class="pointer-events-none absolute bottom-32 right-[-20px] z-[1] h-48 w-48 rotate-[20deg] rounded-2xl border-4 border-white/20"></div>
        <div class="pointer-events-none absolute left-[-40px] top-1/3 z-[1] h-24 w-24 rotate-[45deg] rounded-xl border-4 border-white/15"></div>
        <div class="pointer-events-none absolute right-1/4 bottom-20 z-[1] h-16 w-16 rotate-[-15deg] rounded-lg bg-white/10"></div>
        <div class="pointer-events-none absolute right-10 top-1/2 z-[1] h-6 w-6 rounded-full bg-white/20"></div>
        <div class="pointer-events-none absolute left-1/4 top-20 z-[1] h-40 w-[1px] rotate-[30deg] bg-white/20"></div>
        <div class="pointer-events-none absolute right-1/3 top-32 z-[1] h-20 w-20 rotate-[-30deg] rounded-2xl border-3 border-white/15"></div>
        <div class="pointer-events-none absolute right-32 top-1/4 z-[1] h-10 w-10 rounded-full border-3 border-white/20"></div>
        <div class="pointer-events-none absolute left-1/3 bottom-16 z-[1] h-[1px] w-24 rotate-[45deg] bg-white/10"></div>
        <div class="pointer-events-none absolute right-8 top-16 z-[1] h-28 w-28 rotate-[15deg] rounded-xl bg-white/5"></div>

        <!-- 구매대행 자동화 관련 아이콘 장식들 -->
        <!-- 상자/패키지 -->
        <svg class="pointer-events-none absolute right-1/4 top-1/3 z-[1] h-16 w-16 rotate-[-10deg] text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="6" width="18" height="14" rx="2"/>
          <path d="M3 10h18M12 6v14M8 6l4-3 4 3"/>
        </svg>

        <!-- 장바구니 -->
        <svg class="pointer-events-none absolute left-1/3 bottom-1/4 z-[1] h-14 w-14 rotate-[15deg] text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="20" r="1"/>
          <circle cx="20" cy="20" r="1"/>
          <path d="M1 4h4l3 13h10l3-9H6"/>
        </svg>

        <!-- 배송 트럭 -->
        <svg class="pointer-events-none absolute right-12 bottom-32 z-[1] h-12 w-12 rotate-[-5deg] text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>

        <!-- 체크리스트/작업 완료 -->
        <svg class="pointer-events-none absolute left-16 top-1/3 z-[1] h-12 w-12 rotate-[20deg] text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>

        <!-- 화살표/자동화 플로우 -->
        <svg class="pointer-events-none absolute right-1/3 bottom-12 z-[1] h-10 w-10 rotate-[45deg] text-white/20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l-1.5 1.5L16 9H4v2h12l-5.5 5.5L12 18l8-8-8-8z"/>
        </svg>

        <!-- 지구/글로벌 소싱 -->
        <svg class="pointer-events-none absolute left-8 bottom-8 z-[1] h-10 w-10 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>

        <!-- 설정/자동화 기어 -->
        <svg class="pointer-events-none absolute right-8 bottom-8 z-[1] h-8 w-8 text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>

        <div class="relative z-[2]">
          <h1 class="m-0 text-[40px] font-bold leading-[1.2] tracking-[-1px] text-white md:text-[52px] lg:text-[60px]">
            <span class="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80" @click="goToHome">
              <svg class="h-8 w-8 translate-y-1.5 md:h-10 md:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              AutoSource
            </span><br /><span class="text-[34px] md:text-[44px] lg:text-[50px]">로그인</span>
          </h1>
          <p class="mt-4 text-[18px] font-medium text-white/80 md:text-[20px]">
            지금 로그인하고<br />나의 마켓을 관리해 보세요
          </p>
        </div>

        <div class="relative z-[2]">
          <p class="text-[16px] font-medium leading-[1.6] text-white/90 md:text-[18px]">
            AutoSource
          </p>
        </div>
      </section>

      <!-- 오른쪽: 로그인 폼 -->
      <section class="flex flex-col justify-center overflow-y-auto bg-white px-6 py-8 md:px-12 lg:px-20">
        <div class="w-full max-w-[600px] mx-auto">
          <h2 class="mb-4 mt-8 text-[28px] font-bold text-[#111827] md:text-[32px]">
            로그인
          </h2>

          <div class="mb-6 h-[1.5px] w-full bg-[#d1d5db]"></div>

          <!-- 아이디 -->
          <div class="mb-2 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">아이디</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="아이디를 입력하세요"
            />
          </div>
          <!-- 아이디 에러 메시지 -->
          <p v-if="usernameError" class="mb-4 ml-[132px] text-[13px] font-medium text-[#dc2626]">
            {{ usernameError }}
          </p>

          <!-- 비밀번호 -->
          <div class="mb-2 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">비밀번호</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="비밀번호를 입력하세요"
              @keyup.enter="handleLogin"
            />
          </div>
          <!-- 비밀번호 에러 메시지 -->
          <p v-if="passwordError" class="mb-4 ml-[132px] text-[13px] font-medium text-[#dc2626]">
            {{ passwordError }}
          </p>

          <!-- 아이디 저장 체크박스 -->
          <div class="mb-6 flex items-center gap-2 pl-[132px]">
            <input v-model="rememberId" type="checkbox" class="h-[16px] w-[16px] accent-[#ff7b39]" />
            <span class="text-[14px] font-medium text-[#374151]">아이디 저장</span>
          </div>

          <!-- 버튼 영역 -->
          <div class="flex items-center gap-4 mb-6">
            <button
              class="h-[50px] flex-1 rounded-md bg-[#9ca3af] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#6b7280] md:h-[56px] md:text-[15px]"
              @click="goToSignup"
            >
              회원가입
            </button>
            <button
              class="h-[50px] flex-1 rounded-md bg-[#ff7b39] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#ee864b] md:h-[56px] md:text-[15px]"
              @click="handleLogin"
            >
              로그인
            </button>
          </div>

          <!-- 링크 영역 -->
          <div class="flex items-center justify-center gap-4 mb-8">
            <button class="text-[14px] font-bold text-[#6b7280] transition-colors hover:text-[#ff7b39]" @click="goToFindId">
              아이디 찾기
            </button>
            <span class="text-[14px] text-[#d1d5db]">|</span>
            <button class="text-[14px] font-bold text-[#6b7280] transition-colors hover:text-[#ff7b39]" @click="goToFindPassword">
              비밀번호 찾기
            </button>
          </div>

          <!-- 구분선 -->
          <div class="mb-6 h-[1.5px] w-full bg-[#d1d5db]"></div>

          <!-- 소셜 로그인 -->
          <div>
            <p class="mb-4 text-center text-[15px] font-bold text-[#374151]">소셜 로그인</p>

            <!-- Google -->
            <button class="mb-3 flex h-[48px] w-full items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white text-[14px] font-bold text-[#374151] transition-all duration-200 hover:bg-[#f9fafb] md:h-[52px] md:text-[15px]" @click="handleGoogleLogin">
              <svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            <!-- Kakao -->
            <button class="mb-3 flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#fee500] text-[14px] font-bold text-[#191919] transition-all duration-200 hover:brightness-[0.98] md:h-[52px] md:text-[15px]" @click="handleKakaoLogin">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="#191919" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C6.48 3 2 6.48 2 10.67c0 2.68 1.76 5.03 4.38 6.35-.19.71-.69 2.58-.79 2.97-.12.46.17.45.36.33.15-.1 2.39-1.63 3.35-2.29.77.21 1.58.33 2.4.33 5.52 0 10-3.48 10-7.67S17.52 3 12 3z"/>
              </svg>
              Kakao로 로그인
            </button>

            <!-- Naver -->
            <button class="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#03c75a] text-[14px] font-bold text-white transition-all duration-200 hover:brightness-[1.05] md:h-[52px] md:text-[15px]" @click="handleNaverLogin">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
              Naver로 로그인
            </button>
          </div>

          <!-- 일반 에러 메시지 (서버 오류 등) -->
          <p v-if="generalError" class="mt-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">
            {{ generalError }}
          </p>

          <p v-if="successMessage" class="mt-6 rounded-lg border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-[13px] font-medium text-[#16a34a]">
            {{ successMessage }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
