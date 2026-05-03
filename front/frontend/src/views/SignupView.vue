<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const email = ref('')
const nickname = ref('')
const phoneNumber = ref('')

const errorMessage = ref('')
const successMessage = ref('')
const usernameCheckMessage = ref('')
const usernameCheckStatus = ref('') // 'available', 'duplicate', ''

const oauthBaseUrl = (api.defaults.baseURL || '').replace(/\/$/, '')

const handleSignup = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!username.value.trim()) {
    errorMessage.value = '아이디를 입력해주세요.'
    return
  }

  if (!password.value.trim()) {
    errorMessage.value = '비밀번호를 입력해주세요.'
    return
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  if (!passwordRegex.test(password.value)) {
    errorMessage.value = '비밀번호는 영문/숫자/특수문자 조합 8자 이상이어야 합니다.'
    return
  }

  if (!confirmPassword.value.trim()) {
    errorMessage.value = '비밀번호 확인을 입력해주세요.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  if (!name.value.trim()) {
    errorMessage.value = '이름을 입력해주세요.'
    return
  }

  if (!email.value.trim()) {
    errorMessage.value = '이메일을 입력해주세요.'
    return
  }

  if (!nickname.value.trim()) {
    errorMessage.value = '닉네임을 입력해주세요.'
    return
  }

  if (!phoneNumber.value.trim()) {
    errorMessage.value = '전화번호를 입력해주세요.'
    return
  }

  const phoneRegex = /^010\d{8}$/
  if (!phoneRegex.test(phoneNumber.value)) {
    errorMessage.value = '전화번호는 010으로 시작하는 11자리 숫자만 가능합니다. 예: 01012345678'
    return
  }

  try {
    await api.post('/users/signup', {
      username: username.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      name: name.value,
      email: email.value,
      nickname: nickname.value,
      phoneNumber: phoneNumber.value,
    })

    successMessage.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.'

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (err) {
    if (err.response) {
      errorMessage.value = `회원가입 실패 / status: ${err.response.status}`
    } else {
      errorMessage.value = '서버 연결 실패'
    }
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

const handleGoogleSignup = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`
}

const handleKakaoSignup = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/kakao`
}

const handleNaverSignup = () => {
  window.location.href = `${oauthBaseUrl}/oauth2/authorization/naver`
}

const checkUsernameDuplicate = async () => {
  usernameCheckMessage.value = ''
  usernameCheckStatus.value = ''

  if (!username.value.trim()) {
    usernameCheckMessage.value = '아이디를 입력해주세요.'
    usernameCheckStatus.value = 'error'
    return
  }

  try {
    const response = await api.get(`/users/check-username?username=${encodeURIComponent(username.value)}`)
    if (response.data.available) {
      usernameCheckMessage.value = '사용 가능한 아이디입니다.'
      usernameCheckStatus.value = 'available'
    } else {
      usernameCheckMessage.value = '이미 사용 중인 아이디입니다.'
      usernameCheckStatus.value = 'duplicate'
    }
  } catch (err) {
    usernameCheckMessage.value = '중복 확인 중 오류가 발생했습니다.'
    usernameCheckStatus.value = 'error'
  }
}
</script>

<template>
  <div class="flex min-h-screen w-screen bg-white">
    <div class="grid min-h-screen w-full grid-cols-1 md:grid-cols-[9fr_11fr]">
      <!-- 왼쪽: 주황색 배너 -->
      <section class="relative flex flex-col justify-between min-h-[100vh] overflow-hidden bg-[#ff7b39] px-12 py-8 md:px-20 md:py-10">
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
            </span><br /><span class="text-[34px] md:text-[44px] lg:text-[50px]">시작하기</span>
          </h1>
          <p class="mt-4 text-[18px] font-medium text-white/80 md:text-[20px]">
            가입하고 나의 마켓을 관리해 보세요
          </p>
        </div>

        <div class="relative z-[2]">
          <p class="text-[16px] font-medium leading-[1.6] text-white/90 md:text-[18px]">
            AutoSource
          </p>
        </div>
      </section>

      <!-- 오른쪽: 회원가입 폼 -->
      <section class="flex flex-col min-h-[100vh] overflow-y-auto bg-white px-6 py-8 md:px-12 lg:px-20">
        <div class="w-full max-w-[600px] mx-auto">
          <h2 class="mb-4 text-[28px] font-bold text-[#111827] md:text-[32px]">
            회원정보 등록
          </h2>

          <div class="mb-6 h-[1.5px] w-full bg-[#d1d5db]"></div>

          <!-- 아이디 -->
          <div class="mb-6 flex items-start gap-3">
            <label class="w-[120px] flex-shrink-0 pt-3 text-[17px] font-bold text-[#111827]">아이디</label>
            <div class="flex w-[calc(100%-120px)] flex-col gap-2">
              <div class="flex gap-2">
                <input
                  v-model="username"
                  type="text"
                  class="h-[50px] flex-1 rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
                  placeholder="영문/숫자 가능"
                />
                <button
                  class="h-[50px] flex-shrink-0 rounded-md border border-[#ff7b39] bg-white px-4 text-[13px] font-bold text-[#ff7b39] transition-all duration-200 hover:bg-[#ff7b39] hover:text-white md:h-[56px] md:px-5 md:text-[14px]"
                  @click="checkUsernameDuplicate"
                >
                  중복 확인
                </button>
              </div>
              <p
                v-if="usernameCheckMessage"
                class="text-[13px] font-medium"
                :class="{
                  'text-[#16a34a]': usernameCheckStatus === 'available',
                  'text-[#dc2626]': usernameCheckStatus === 'duplicate' || usernameCheckStatus === 'error'
                }"
              >
                {{ usernameCheckMessage }}
              </p>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="mb-6 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">비밀번호</label>
            <input
              v-model="password"
              type="password"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="영문/숫자/특수문자 조합 8자 이상"
            />
          </div>

          <!-- 비밀번호 확인 -->
          <div class="mb-6 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">비밀번호 확인</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="비밀번호 확인"
            />
          </div>

          <!-- 성명 -->
          <div class="mb-6 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">성명(대표자)</label>
            <input
              v-model="name"
              type="text"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="성명 입력"
            />
          </div>

          <!-- 닉네임 -->
          <div class="mb-6 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">닉네임</label>
            <input
              v-model="nickname"
              type="text"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <!-- 휴대폰 번호 -->
          <div class="mb-6 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">휴대폰 번호</label>
            <input
              v-model="phoneNumber"
              type="text"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="휴대전화번호(ex.01012345678)"
            />
          </div>

          <!-- 이메일 -->
          <div class="mb-8 flex items-center gap-3">
            <label class="w-[120px] flex-shrink-0 text-[17px] font-bold text-[#111827]">이메일</label>
            <input
              v-model="email"
              type="email"
              class="h-[50px] w-[calc(100%-120px)] rounded-md border border-[#e5e7eb] bg-white px-4 text-[14px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[14px] placeholder:text-[#9ca3af] focus:border-[#ff7b39] md:h-[56px] md:text-[15px]"
              placeholder="이메일 주소"
            />
          </div>

          <!-- 버튼 영역 -->
          <div class="flex items-center gap-4">
            <button
              class="h-[50px] flex-1 rounded-md bg-[#9ca3af] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#6b7280] md:h-[56px] md:text-[15px]"
              @click="goToLogin"
            >
              취소
            </button>
            <button
              class="h-[50px] flex-1 rounded-md bg-[#ff7b39] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#ee864b] md:h-[56px] md:text-[15px]"
              @click="handleSignup"
            >
              등록
            </button>
          </div>

          <!-- 메시지 -->
          <p v-if="errorMessage" class="mt-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="mt-6 rounded-lg border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-[13px] font-medium text-[#16a34a]">
            {{ successMessage }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
