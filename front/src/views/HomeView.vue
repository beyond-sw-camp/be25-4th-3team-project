<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()

const username = ref('')
const nickname = ref('')
const email = ref('')
const error = ref('')
const isLoggedIn = ref(false)

onMounted(async () => {
  error.value = ''

  try {
    const response = await api.get('/users/me')
    username.value = response.data.username
    nickname.value = response.data.nickname
    email.value = response.data.email
    isLoggedIn.value = true
  } catch (err) {
    isLoggedIn.value = false

    if (err.response) {
      if (err.response.status === 401) {
        error.value = ''
      } else {
        error.value = `상태 확인 실패 / status: ${err.response.status}`
      }
    } else {
      error.value = '서버 연결 실패'
    }
  }
})

const goToLogin = () => {
  router.push('/login')
}

const goToSignup = () => {
  router.push('/signup')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSourcing = () => {
  router.push('/app/sourcing/category')
}

const handleLogout = async () => {
  try {
    await api.post('/users/logout')
    alert('로그아웃되었습니다.')
    isLoggedIn.value = false
    username.value = ''
    nickname.value = ''
    email.value = ''
    router.push('/')
  } catch (err) {
    if (err.response) {
      alert(`로그아웃 실패 / status: ${err.response.status}`)
    } else {
      alert('서버 연결 실패')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 헤더 -->
    <header class="flex h-[72px] items-center justify-between px-6 min-[641px]:px-[40px] min-[981px]:px-[60px]">
      <!-- 로고 -->
      <div class="flex h-[40px] items-center gap-2">
        <div class="h-[40px] w-[40px] rounded-[8px] bg-[#ff5a00] flex items-center justify-center">
          <span class="text-white font-bold text-[20px]">A</span>
        </div>
        <span class="text-[20px] font-bold text-[#111827]">AutoSource</span>
      </div>

      <!-- 메뉴 -->
      <nav class="hidden h-[40px] items-center gap-8 min-[768px]:flex">
        <button class="flex h-[40px] items-center bg-transparent text-[15px] font-bold text-[#4b5563] hover:text-[#111827] transition-colors">사용 가이드</button>
        <button class="flex h-[40px] items-center bg-transparent text-[15px] font-bold text-[#4b5563] hover:text-[#111827] transition-colors">서비스 소개</button>
        <button class="flex h-[40px] items-center bg-transparent text-[15px] font-bold text-[#4b5563] hover:text-[#111827] transition-colors">가격 안내</button>
        <button class="flex h-[40px] items-center bg-transparent text-[15px] font-bold text-[#4b5563] hover:text-[#111827] transition-colors">고객센터</button>
      </nav>

      <!-- 로그인 버튼 -->
      <div class="flex h-[40px] items-center gap-3">
        <template v-if="!isLoggedIn">
          <button class="hidden h-[40px] items-center rounded-md bg-[#ff7b39] px-5 text-[14px] font-bold text-white hover:bg-[#ee864b] transition-colors min-[768px]:flex" @click="goToLogin">
            로그인
          </button>
          <button class="flex h-[40px] items-center rounded-md bg-[#ff7b39] px-4 text-[14px] font-bold text-white hover:bg-[#ee864b] transition-colors min-[768px]:hidden" @click="goToLogin">
            로그인
          </button>
        </template>
        <template v-else>
          <button class="flex h-[40px] items-center rounded-md bg-[#ff7b39] px-5 text-[14px] font-bold text-white hover:bg-[#ee864b] transition-colors" @click="goToProfile">
            마이페이지
          </button>
          <button class="flex h-[40px] items-center rounded-md border border-[#d1d5db] bg-white px-5 text-[14px] font-bold text-[#374151] hover:bg-[#f9fafb] transition-colors" @click="handleLogout">
            로그아웃
          </button>
        </template>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="relative flex min-h-[calc(100vh-72px)] flex-col items-center justify-center overflow-hidden bg-[#f8f8f8] px-6 pb-20 pt-10 min-[641px]:px-[40px] min-[981px]:px-[60px]">
      <!-- 배경 장식 요소들 -->
      <div class="pointer-events-none absolute left-[-60px] top-[20px] h-[240px] w-[240px] rotate-[32deg] rounded-[32px] border-4 border-[#ffbf9e] opacity-[0.35]"></div>
      <div class="pointer-events-none absolute bottom-[40px] right-[-100px] h-[280px] w-[320px] rotate-[24deg] skew-x-[-8deg] skew-y-[-8deg] rounded-[32px] border-4 border-[#ffbf9e] opacity-[0.35]"></div>
      <div class="pointer-events-none absolute left-[10%] bottom-[20%] h-[120px] w-[120px] rotate-[-15deg] rounded-[20px] border-4 border-[#ffbf9e] opacity-[0.25]"></div>
      <div class="pointer-events-none absolute right-[15%] top-[15%] h-[80px] w-[80px] rotate-[45deg] rounded-[12px] border-4 border-[#ffbf9e] opacity-[0.3]"></div>

      <div class="relative z-[2] w-full max-w-[800px] text-center">
        <!-- AutoSource 로고 -->
        <div class="mb-10 mt-8 min-[641px]:mt-12">
          <h1 class="m-0 text-[48px] font-semibold leading-none tracking-[-1px] text-[#ff5a00] min-[641px]:text-[68px] min-[981px]:text-[88px]">
            AutoSource
          </h1>
          <p class="mt-3 text-[16px] font-medium text-[#ff7b39] min-[641px]:text-[18px]">Sourcing Automation System</p>
        </div>

        <!-- 타이틀 -->
        <h2 class="m-0 text-[22px] font-bold leading-[1.4] tracking-[-0.5px] text-[#111827] min-[641px]:text-[28px] min-[981px]:text-[32px]">
          자동 소싱으로 시작하는<br />가장 쉬운 구매 대행
        </h2>

        <!-- 서브타이틀 -->
        <p class="mb-10 mt-5 text-[16px] font-medium text-[#6b7280] min-[641px]:text-[18px]">
          AutoSource로 1분만에 시작해보세요
        </p>

        <!-- 버튼 -->
        <div class="flex justify-center">
          <button class="h-[52px] w-full max-w-[320px] rounded-lg bg-[#ff7b39] px-8 text-[15px] font-bold text-white transition-colors hover:bg-[#ee864b] min-[641px]:w-auto" @click="isLoggedIn ? goToSourcing() : goToSignup()">
            {{ isLoggedIn ? '소싱 시작하기' : '회원가입하고 시작하기' }}
          </button>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="error" class="mx-auto mt-10 max-w-[504px] rounded-lg border border-[#ffcccc] bg-[#fff0f0] px-4 py-3 text-[14px] font-semibold text-[#d93025]">
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>
