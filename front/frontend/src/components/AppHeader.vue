<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">3팀 프론트</RouterLink>
    <nav class="nav">
      <RouterLink
        to="/"
        class="nav-link"
        active-class="nav-link--active"
        exact-active-class="nav-link--active"
      >
        홈
      </RouterLink>
      <RouterLink to="/about" class="nav-link" active-class="nav-link--active"> 소개 </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  font-weight: 600;
  color: var(--text-h);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.brand:hover {
  color: var(--accent);
}

.nav {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 0.95rem;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-link:hover {
  background: var(--muted);
  color: var(--text-h);
}

.nav-link--active {
  background: var(--accent-bg);
  color: var(--accent);
}
</style>
