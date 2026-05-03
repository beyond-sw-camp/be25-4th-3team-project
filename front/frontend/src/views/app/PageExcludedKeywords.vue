<script setup>
import { onMounted, ref } from 'vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCheckTable from '../../components/common/BaseCheckTable.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import {
  createBlockedWord,
  createReplacementWord,
  deleteBlockedWord,
  deleteReplacementWord,
  getBlockedWords,
  getReplacementWords,
  updateBlockedWord,
  updateReplacementWord,
} from '../../api/uploadBlockedWord'

const forbiddenSelectedKeys = ref([])
const replacementSelectedKeys = ref([])

const forbiddenRows = ref([])
const replacementRows = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')

const forbiddenColumns = [
  {
    key: 'no',
    label: 'No.',
    headerClass: 'w-20 text-center',
    cellClass: 'text-center text-neutral-600',
  },
  { key: 'word', label: '단어', cellClass: 'font-medium' },
  { key: 'management', label: '관리', headerClass: 'w-28 text-center', cellClass: 'text-center' },
]

const replacementColumns = [
  {
    key: 'no',
    label: 'No.',
    headerClass: 'w-20 text-center',
    cellClass: 'text-center text-neutral-600',
  },
  { key: 'sourceWord', label: '원본 단어', cellClass: 'font-medium' },
  { key: 'replacementWord', label: '치환 단어', cellClass: 'font-medium' },
  { key: 'management', label: '관리', headerClass: 'w-28 text-center', cellClass: 'text-center' },
]

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getBlockedWordId(item) {
  // 백엔드 응답 DTO 이름이 바뀌어도 화면 행 식별자는 안정적으로 잡는다.
  return item.userBlockedWordId ?? item.blockedWordId ?? item.id
}

function getReplacementWordId(item) {
  // 치환어도 사용자 정책 테이블의 PK를 우선 사용한다.
  return item.userReplacementWordId ?? item.replacementWordId ?? item.id
}

function getSourceWord(item) {
  // 원본 단어 필드명은 DTO 버전에 따라 다를 수 있어 가능한 이름을 순서대로 확인한다.
  return item.sourceWord ?? item.originalWord ?? item.beforeWord ?? item.targetWord ?? ''
}

function mapForbiddenRows(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: getBlockedWordId(item),
    no: index + 1,
    word: item.blockedWord ?? item.word ?? '',
    editing: false,
    isNew: false,
  }))
}

function mapReplacementRows(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: getReplacementWordId(item),
    no: index + 1,
    sourceWord: getSourceWord(item),
    replacementWord: item.replacementWord ?? item.afterWord ?? '',
    editing: false,
    isNew: false,
  }))
}

function renumberRows(rows) {
  rows.forEach((row, index) => {
    row.no = index + 1
  })
}

async function loadPolicyWords() {
  // 금지단어와 치환단어는 한 화면에서 함께 쓰므로 진입 시 동시에 조회한다.
  loading.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    const [blockedWords, replacementWords] = await Promise.all([
      getBlockedWords(),
      getReplacementWords(),
    ])
    forbiddenRows.value = mapForbiddenRows(blockedWords)
    replacementRows.value = mapReplacementRows(replacementWords)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '단어 설정을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function addForbiddenRow() {
  forbiddenRows.value.push({
    id: nextId('forbidden'),
    no: forbiddenRows.value.length + 1,
    word: '',
    editing: true,
    isNew: true,
  })
}

function addReplacementRow() {
  replacementRows.value.push({
    id: nextId('replacement'),
    no: replacementRows.value.length + 1,
    sourceWord: '',
    replacementWord: '',
    editing: true,
    isNew: true,
  })
}

async function deleteForbiddenRows() {
  if (forbiddenSelectedKeys.value.length === 0) return

  // 아직 저장하지 않은 새 행은 서버 요청 없이 화면에서만 제거한다.
  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    const selectedRows = forbiddenRows.value.filter((row) => forbiddenSelectedKeys.value.includes(row.id))
    await Promise.all(selectedRows.filter((row) => !row.isNew).map((row) => deleteBlockedWord(row.id)))
    forbiddenRows.value = forbiddenRows.value.filter(
      (row) => !forbiddenSelectedKeys.value.includes(row.id),
    )
    forbiddenSelectedKeys.value = []
    renumberRows(forbiddenRows.value)
    savedMessage.value = '금지단어를 삭제했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '금지단어를 삭제하지 못했습니다.'
  } finally {
    saving.value = false
  }
}

async function deleteReplacementRows() {
  if (replacementSelectedKeys.value.length === 0) return

  // 선택 삭제는 저장된 행만 DELETE 요청을 보내고, 새 행은 로컬에서 제거한다.
  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    const selectedRows = replacementRows.value.filter((row) =>
      replacementSelectedKeys.value.includes(row.id),
    )
    await Promise.all(
      selectedRows.filter((row) => !row.isNew).map((row) => deleteReplacementWord(row.id)),
    )
    replacementRows.value = replacementRows.value.filter(
      (row) => !replacementSelectedKeys.value.includes(row.id),
    )
    replacementSelectedKeys.value = []
    renumberRows(replacementRows.value)
    savedMessage.value = '치환단어를 삭제했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '치환단어를 삭제하지 못했습니다.'
  } finally {
    saving.value = false
  }
}

async function toggleForbiddenEdit(row) {
  if (!row.editing) {
    row.editing = true
    return
  }

  const word = row.word.trim()
  if (!word) {
    errorMessage.value = '금지단어를 입력해 주세요.'
    return
  }

  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    const savedRow = row.isNew
      ? await createBlockedWord(word)
      : await updateBlockedWord(row.id, word)
    Object.assign(row, mapForbiddenRows([savedRow])[0])
    renumberRows(forbiddenRows.value)
    savedMessage.value = '금지단어를 저장했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '금지단어를 저장하지 못했습니다.'
  } finally {
    saving.value = false
  }
}

async function toggleReplacementEdit(row) {
  if (!row.editing) {
    row.editing = true
    return
  }

  const sourceWord = row.sourceWord.trim()
  const replacementWord = row.replacementWord.trim()
  if (!sourceWord || !replacementWord) {
    errorMessage.value = '원본 단어와 치환 단어를 모두 입력해 주세요.'
    return
  }

  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    const savedRow = row.isNew
      ? await createReplacementWord(sourceWord, replacementWord)
      : await updateReplacementWord(row.id, sourceWord, replacementWord)
    Object.assign(row, mapReplacementRows([savedRow])[0])
    renumberRows(replacementRows.value)
    savedMessage.value = '치환단어를 저장했습니다.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '치환단어를 저장하지 못했습니다.'
  } finally {
    saving.value = false
  }
}

onMounted(loadPolicyWords)
</script>

<template>
  <div class="space-y-5">
    <div
      v-if="errorMessage || savedMessage"
      class="rounded-lg border px-4 py-3 text-sm"
      :class="
        errorMessage
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      "
    >
      {{ errorMessage || savedMessage }}
    </div>

    <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <section>
      <BaseSectionTitle>금지단어</BaseSectionTitle>
      <div class="mt-2 flex">
        <span class="mr-2 text-amber-600">ⓘ</span>
        <p class="text-sm text-neutral-700">
          상품명에 해당 단어가 포함되면 검색, 수집, 업로드 과정에서 자동으로 제외됩니다.
        </p>
      </div>
      
      <BaseCheckTable
        v-model:selected-keys="forbiddenSelectedKeys"
        class="mt-4"
        :columns="forbiddenColumns"
        :rows="forbiddenRows"
        row-key="id"
        :max-visible-rows="5"
        select-all-label="금지단어 전체 선택"
        :empty-text="loading ? '금지단어를 불러오는 중입니다.' : '등록된 금지단어가 없습니다.'"
        :row-select-label="(row) => `${row.no}번 금지단어 선택`"
      >
        <template #cell-word="{ row }">
          <input
            v-if="row.editing"
            v-model="row.word"
            type="text"
            placeholder="금지단어 입력"
            class="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-300 focus:bg-white"
          />
          <span v-else>{{ row.word }}</span>
        </template>
        <template #cell-management="{ row }">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="saving"
            @click="toggleForbiddenEdit(row)"
          >
            {{ row.editing ? '저장' : '수정' }}
          </BaseButton>
        </template>
      </BaseCheckTable>

      <div class="mt-4 flex justify-end gap-2">
        <BaseButton size="sm" :disabled="loading || saving" @click="addForbiddenRow">
          + 추가하기
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="forbiddenSelectedKeys.length === 0 || loading || saving"
          @click="deleteForbiddenRows"
        >
          - 삭제하기
        </BaseButton>
      </div>
    </section>
    </div>

    <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <section>
      <BaseSectionTitle>치환단어</BaseSectionTitle>
      <div class="mt-2 flex">
        <span class="mr-2 text-amber-600">ⓘ</span>
        <p class="text-sm text-neutral-700">
          특정 단어를 다른 표현으로 자동 변경됩니다. (예 : 무료배송 → 배송비 포함)
        </p>
      </div>

      <BaseCheckTable
        v-model:selected-keys="replacementSelectedKeys"
        class="mt-4"
        :columns="replacementColumns"
        :rows="replacementRows"
        row-key="id"
        :max-visible-rows="5"
        select-all-label="치환단어 전체 선택"
        :empty-text="loading ? '치환단어를 불러오는 중입니다.' : '등록된 치환단어가 없습니다.'"
        :row-select-label="(row) => `${row.no}번 치환단어 선택`"
      >
        <template #cell-sourceWord="{ row }">
          <input
            v-if="row.editing"
            v-model="row.sourceWord"
            type="text"
            placeholder="원본 단어 입력"
            class="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-300 focus:bg-white"
          />
          <span v-else>{{ row.sourceWord }}</span>
        </template>
        <template #cell-replacementWord="{ row }">
          <input
            v-if="row.editing"
            v-model="row.replacementWord"
            type="text"
            placeholder="치환 단어 입력"
            class="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-300 focus:bg-white"
          />
          <span v-else>{{ row.replacementWord }}</span>
        </template>
        <template #cell-management="{ row }">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="saving"
            @click="toggleReplacementEdit(row)"
          >
            {{ row.editing ? '저장' : '수정' }}
          </BaseButton>
        </template>
      </BaseCheckTable>

      <div class="mt-4 flex justify-end gap-2">
        <BaseButton size="sm" :disabled="loading || saving" @click="addReplacementRow">
          + 추가하기
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="replacementSelectedKeys.length === 0 || loading || saving"
          @click="deleteReplacementRows"
        >
          - 삭제하기
        </BaseButton>
      </div>
    </section>
    </div>
    
  </div>
</template>
