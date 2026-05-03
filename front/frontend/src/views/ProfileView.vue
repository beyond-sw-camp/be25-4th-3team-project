<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()

const username = ref('')
const nickname = ref('')
const name = ref('')
const email = ref('')
const error = ref('')

onMounted(async () => {
  error.value = ''

  try {
    const response = await api.get('/users/me')
    console.log('ProfileView 내 정보 조회 응답:', response.data)

    // 백엔드 확정 스펙에 맞게 필드 매핑
    username.value = response.data.loginId || ''
    nickname.value = response.data.nickname || ''
    name.value = response.data.name || ''
    email.value = response.data.email || ''
  } catch (err) {
    console.error('ProfileView 내 정보 조회 에러:', err)
    if (err.response) {
      console.error('에러 응답 데이터:', err.response.data)
      console.error('에러 상태:', err.response.status)

      // 401 인증 실패 시 로그인 페이지로 이동
      if (err.response.status === 401) {
        error.value = '로그인이 필요합니다.'
        router.push('/login')
        return
      }

      error.value = err.response.data?.error || `정보 조회 실패 (status: ${err.response.status})`
    } else if (err.request) {
      error.value = '서버 응답 없음 - 네트워크/CORS/인증 문제 가능성'
    } else {
      error.value = `요청 실패: ${err.message}`
    }
  }
})

const goToHome = () => {
  router.push('/')
}

const goBackToPreviousPage = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/app')
}

const goToProfileInfo = () => {
  router.push('/profile/info')
}

const goToProfileEdit = () => {
  router.push('/profile/edit')
}

const goToProfileDelete = () => {
  router.push('/profile/delete')
}

const handleLogout = async () => {
  try {
    await api.post('/users/logout')
    alert('로그아웃되었습니다.')
    router.push('/login')
  } catch (err) {
    alert('로그아웃 실패')
  }
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
            </span><br /><span class="text-[34px] md:text-[44px] lg:text-[50px]">마이페이지</span>
          </h1>
          <p class="mt-4 text-[18px] font-medium text-white/80 md:text-[20px]">
            내 정보를 확인하고<br />계정 설정을 관리하세요
          </p>
        </div>

        <div class="relative z-[2]">
          <p class="text-[16px] font-medium leading-[1.6] text-white/90 md:text-[18px]">
            AutoSource
          </p>
        </div>
      </section>

      <!-- 오른쪽: 마이페이지 메뉴 -->
      <section class="flex flex-col justify-center overflow-y-auto bg-white px-6 py-8 md:px-12 lg:px-20">
        <div class="w-full max-w-[600px] mx-auto">
          <button
            type="button"
            class="mb-6 inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[14px] font-bold text-[#374151] transition-all duration-200 hover:border-[#ff7b39] hover:text-[#ff7b39]"
            @click="goBackToPreviousPage"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            이전페이지로 이동
          </button>

          <h2 class="mb-4 text-[28px] font-bold text-[#111827] md:text-[32px]">
            마이페이지
          </h2>

          <div class="mb-6 h-[1.5px] w-full bg-[#d1d5db]"></div>

          <p class="mb-6 text-[16px] text-[#6b7280]"><span class="font-bold text-[#111827]">{{ name || nickname || username }}</span>님, 무엇을 하시겠어요?</p>

          <div v-if="error" class="mb-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">
            {{ error }}
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button class="flex flex-col items-center justify-start gap-4 rounded-xl border border-[#e5e7eb] bg-white px-6 pt-7 pb-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff7b39]" @click="goToProfileInfo">
              <span class="text-[28px] font-bold text-[#ff7b39]">01</span>
              <span class="text-[17px] font-bold text-[#111827]">내 정보 조회</span>
            </button>

            <button class="flex flex-col items-center justify-start gap-4 rounded-xl border border-[#e5e7eb] bg-white px-6 pt-7 pb-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff7b39]" @click="goToProfileEdit">
              <span class="text-[28px] font-bold text-[#ff7b39]">02</span>
              <span class="text-[17px] font-bold text-[#111827]">정보 수정</span>
            </button>

            <button class="flex flex-col items-center justify-start gap-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-6 pt-7 pb-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff7b39]" @click="handleLogout">
              <span class="text-[28px] font-bold text-[#ff7b39]">03</span>
              <span class="text-[17px] font-bold text-[#111827]">로그아웃</span>
            </button>

            <button class="flex flex-col items-center justify-start gap-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-6 pt-7 pb-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#dc2626]" @click="goToProfileDelete">
              <span class="text-[28px] font-bold text-[#dc2626]">04</span>
              <span class="text-[17px] font-bold text-[#b91c1c]">회원 탈퇴</span>
            </button>
          </div>

        </div>
      </section>
    </div>
  </div>
</template>
