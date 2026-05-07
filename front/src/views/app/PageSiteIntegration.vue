<script setup>
import { ref } from 'vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import BaseSelect from '../../components/common/BaseSelect.vue'
import amazonLogo from '../../assets/images/amazonLogo.png'

const sites = [{ site: 'AMAZON', login: 'admin123', method: 'ID/PW 입력', status: '연동중' }]

const isActive = ref(true)
</script>

<template>
  <div>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="min-h-[175px] rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <BaseSectionTitle>소싱 사이트 연동 상태</BaseSectionTitle>
        <div class="mt-3 grid min-h-[96px] w-full grid-cols-[1fr_auto_1fr] items-center">
          <div class="flex items-center justify-center">
            <img :src="amazonLogo" alt="Amazon" class="max-h-[88px] w-[150px] object-contain" />
          </div>
          <div class="h-16 w-px bg-neutral-200" />
          <div class="flex items-center justify-center">
            <span
              class="inline-flex min-w-[72px] items-center justify-center rounded-lg bg-[#34724C] px-4 py-1.5 text-sm font- text-white"
            >
              연동 중
            </span>
          </div>
        </div>
      </div>


      <div class="min-h-[175px] rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <BaseSectionTitle>수집 현황 요약</BaseSectionTitle>
        <div
          class="mt-3 grid min-h-[96px] w-full grid-cols-[1fr_auto_1fr] items-center"
        >
          <div class="flex flex-col justify-center">
            <p class="text-sm text-neutral-500">전체 수집 완료 건수</p>
            <div class="mt-2 flex items-baseline gap-2">
              <p class="text-2xl font-bold text-neutral-900">2,340</p>
              <p class="text-sm font-semibold text-neutral-900">건</p>
            </div>
          </div>
          <div class="h-16 w-px bg-neutral-200" />
          <div class="flex flex-col justify-center pl-4">
            <p class="text-sm text-neutral-500">실시간 수집 진행 건수</p>
            <div class="mt-2 flex items-baseline gap-2">
              <p class="text-2xl font-bold text-point">15</p>
              <p class="text-sm font-semibold text-neutral-900">건</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <BaseSectionTitle>아마존 연동 정보 조회</BaseSectionTitle>
        <div class="mt-4 flex flex-wrap gap-2">
          <BaseSelect>
            <option>등록된 사이트</option>
            <option>AMAZON</option>
          </BaseSelect>
          <input
            type="search"
            placeholder="로그인 식별자(ID) 검색"
            class="min-w-[200px] flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div class="mt-4 overflow-hidden rounded-lg border border-neutral-200">
          <table class="w-full table-fixed text-left text-base">
            <thead class="border-b border-neutral-100 bg-neutral-50 text-sm text-neutral-600">
              <tr>
                <th class="px-4 py-3 font-medium align-middle">사이트</th>
                <th class="px-4 py-3 font-medium align-middle">로그인식별자(ID)</th>
                <th class="px-4 py-3 font-medium align-middle">로그인 방식</th>
                <th class="px-4 py-3 font-medium align-middle">연동 상태</th>
                <th class="w-20 px-4 py-3 font-medium align-middle">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, i) in sites"
                :key="i"
                class="border-b border-neutral-100 last:border-0"
              >
                <td class="px-4 py-4 font-semibold align-middle text-neutral-900">{{ s.site }}</td>
                <td class="px-4 py-4 font-semibold align-middle text-neutral-900">{{ s.login }}</td>
                <td class="px-4 py-4 font-semibold align-middle text-neutral-900">
                  {{ s.method }}
                </td>
                <td class="px-4 py-4 align-middle">
                  <span class="inline-flex items-center gap-1">
                    <span class="size-2 rounded-full bg-emerald-500" />
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-4 align-middle">
                  <BaseButton variant="ghost">수정</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <BaseSectionTitle>아마존 연동 정보 등록 / 수정</BaseSectionTitle>
        <p class="mt-2 text-xs text-neutral-500">최근 동기화 : 2026-03-15 18:49:57</p>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-sm text-neutral-600">소싱 사이트 :</label>
            <BaseSelect class="mt-1 ml-1 w-[250px]">
              <option>AMAZON</option>
            </BaseSelect>
          </div>
          <div>
            <label class="text-sm text-neutral-600">로그인 방식 :</label>
            <BaseSelect class="mt-1 ml-1 w-[250px]">
              <option>ID / PASSWORD 입력</option>
            </BaseSelect>
          </div>
          <div>
            <label class="text-sm text-neutral-600">소싱 사이트 ID :</label>
            <input class="mt-1 ml-1 w-[250px] rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="text-sm text-neutral-600">소싱 사이트 PW :</label>
            <input
              type="password"
              class=" ml-1 w-[250px] rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-600">연동 정보 활성화</span>
            <button
              type="button"
              :aria-pressed="isActive"
              :class="['relative h-6 w-11 rounded-full transition-colors duration-200', isActive ? 'bg-point' : 'bg-neutral-300']"
              @click="isActive = !isActive"
            >
              <span
                :class="['absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200', isActive ? 'translate-x-5' : 'translate-x-0.5']"
              />
            </button>
          </div>
          <BaseButton size="lg" block>연동 정보 저장하기</BaseButton>
          <BaseButton variant="secondary" block>연동 테스트</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
