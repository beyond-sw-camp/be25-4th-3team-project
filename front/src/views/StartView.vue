<script setup>
import { RouterLink } from 'vue-router'

const imgPackage = 'https://www.figma.com/api/mcp/asset/5d132d2f-57ad-4b86-a29b-b785ebf6b48e'
const imgSend = 'https://www.figma.com/api/mcp/asset/41d128b1-2af3-42da-82e6-c7dc79cf87dc'
</script>

<template>
  <div class="relative min-h-svh w-full overflow-hidden bg-white font-sans text-neutral-900">
    <!-- 장식: 패키지 (좌상단) -->
    <div
      class="pointer-events-none absolute -left-[8.5rem] -top-[7.5rem] h-[36.8rem] w-[39.2rem] overflow-hidden max-md:opacity-40"
      aria-hidden="true"
    >
      <div class="absolute inset-[8.34%_12.5%_8%_12.5%]">
        <div class="absolute inset-[-0.81%_-0.85%]">
          <img :src="imgPackage" alt="" class="block size-full max-w-none" />
        </div>
      </div>
    </div>

    <!-- 장식: 센드 아이콘 (우하단, 피그마와 동일 반전) -->
    <div
      class="pointer-events-none absolute bottom-[-4rem] right-[-2rem] flex h-[30rem] w-[29.9rem] items-center justify-center max-lg:opacity-50 md:right-[2%]"
      aria-hidden="true"
    >
      <div class="flex-none -scale-y-100 rotate-180">
        <div class="relative h-[30rem] w-[29.9rem] overflow-hidden">
          <div class="absolute inset-[8.33%]">
            <div class="absolute inset-[-0.5%]">
              <img :src="imgSend" alt="" class="block size-full max-w-none" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상단 네비 -->
    <header
      class="absolute right-4 top-6 z-10 flex flex-wrap items-center justify-end gap-6 px-2 sm:right-8 sm:top-9 sm:gap-8 md:gap-12 lg:right-14 lg:gap-16"
    >
      <a
        href="#"
        class="text-xl font-bold text-[#010101] no-underline hover:opacity-80 sm:text-2xl lg:text-[30px]"
      >
        사용 가이드
      </a>
      <a
        href="#"
        class="text-xl font-bold text-[#010101] no-underline hover:opacity-80 sm:text-2xl lg:text-[30px]"
      >
        서비스 소개
      </a>
      <RouterLink
        to="/login"
        class="inline-flex h-[52px] min-w-[163px] items-center justify-center rounded-[10px] border border-[#d9d9d9] bg-white px-6 text-xl font-bold text-[#797979] no-underline transition hover:bg-neutral-50 sm:text-2xl lg:text-[30px]"
      >
        로그인
      </RouterLink>
    </header>

    <!-- 히어로 + 기능 문구 -->
    <main
      class="relative z-[1] flex min-h-svh flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:pb-32 sm:pt-32"
    >
      <h1 class="font-bold leading-none text-point sm:text-7xl md:text-8xl lg:text-[100px]">
        AutoSource
      </h1>
      <p class="mt-3 text-lg font-medium text-sub sm:text-xl md:mt-4 md:text-[20px]">
        Sourcing Automation System
      </p>
      <ul
        class="mt-10 flex max-w-6xl flex-col items-center gap-6 font-bold text-[#010101] sm:mt-14 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-4 md:gap-x-16 lg:mt-16 lg:gap-x-20 lg:text-[30px]"
      >
        <li>자동 상품 소싱</li>
        <li>국내 마켓 자동 업로드</li>
        <li>최고 마진 자동 선택</li>
      </ul>
    </main>
  </div>
</template>
