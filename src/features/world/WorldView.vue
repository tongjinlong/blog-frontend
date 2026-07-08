<script setup lang="ts">
import SpaceScene from '@/features/space/SpaceScene.vue'
</script>

<template>
  <main class="world-page" aria-label="沉浸式空间">
    <SpaceScene view-mode="immersive" aria-label="3D 空间沉浸场景" />

    <nav class="world-page__nav" aria-label="空间页面导航">
      <RouterLink :to="{ name: 'home' }" aria-label="返回首页">
        <span aria-hidden="true">←</span>
        首页
      </RouterLink>
    </nav>
  </main>
</template>

<style scoped>
.world-page {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  color: #fff8e6;
  background: #f3dfad;
  isolation: isolate;
}

.world-page__nav {
  position: fixed;
  top: max(18px, env(safe-area-inset-top));
  left: max(18px, env(safe-area-inset-left));
  z-index: 2;
}

.world-page__nav a {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 15px;
  font-weight: 900;
  color: #26332d;
  text-decoration: none;
  background: rgb(255 247 218 / 86%);
  border: 1px solid rgb(255 255 255 / 32%);
  border-radius: 999px;
  box-shadow: 0 18px 44px rgb(34 45 35 / 18%);
  backdrop-filter: blur(14px);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.world-page__nav a:hover {
  background: #fff9e5;
  transform: translateY(-2px);
}

.world-page__nav a:focus-visible {
  outline: 3px solid rgb(255 249 229 / 62%);
  outline-offset: 3px;
}
</style>
