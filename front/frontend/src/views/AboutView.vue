<script setup></script>

<template>
  <section class="page mx-auto max-w-3xl px-6 py-10">
    <h1>소개</h1>
    <p class="lead">
      이 디렉터리는 팀 프로젝트의 프론트엔드입니다. 페이지와 컴포넌트를 <code>src/views</code>,
      <code>src/components</code>에 추가하면 됩니다.
    </p>
    <ul class="list">
      <li><code>npm run dev</code> — 개발 서버 (기본 포트 5173)</li>
      <li><code>npm run build</code> — 정적 빌드 (<code>dist/</code>)</li>
      <li><code>npm run preview</code> — 빌드 결과 미리보기</li>
    </ul>
  </section>
</template>

<style scoped>
.page {
  max-width: 42rem;
}

.lead {
  margin: 0 0 1rem;
  line-height: 1.6;
}

.list {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.8;
  text-align: left;
}

.list code {
  font-size: 0.88em;
}
</style>
