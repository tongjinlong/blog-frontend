<script setup lang="ts">
import SpaceScene from '@/features/space/SpaceScene.vue'
</script>

<template>
  <main class="home-page">
    <section class="home-hero" aria-labelledby="home-title" aria-label="户外知识园区入口">
      <SpaceScene view-mode="overview" />

      <div class="home-hero__veil" aria-hidden="true"></div>

      <div class="home-hero__content" data-visual-layer="floating">
        <div class="home-hero__copy">
          <p class="home-hero__eyebrow">Simon 的知识园区</p>
          <h1 id="home-title">走进我的空间</h1>
          <p class="home-hero__lead">从园区入口进入我的工程经验、三维实验、交付方法和 AI 实践。</p>
        </div>
      </div>

      <div class="home-hero__entry" data-visual-layer="center-entry">
        <RouterLink class="home-hero__action" :to="{ name: 'world' }" aria-label="进入空间">
          <span aria-hidden="true">↗</span>
          进入空间
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  color: var(--color-ink);
  background: #eaf2dd;
}

.home-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
}

.home-hero__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 23% 44%,
      transparent 0 25%,
      rgb(242 246 235 / 22%) 48%,
      rgb(242 246 235 / 64%) 80%
    ),
    linear-gradient(
      90deg,
      rgb(242 246 235 / 0%) 0 48%,
      rgb(244 248 242 / 50%) 70%,
      rgb(246 243 247 / 86%) 100%
    ),
    linear-gradient(
      180deg,
      rgb(255 246 224 / 20%) 0%,
      rgb(255 246 224 / 0%) 46%,
      rgb(36 52 43 / 26%) 100%
    );
}

.home-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  width: min(1440px, calc(100% - 32px));
  min-width: 0;
  min-height: 100svh;
  padding: clamp(28px, 5vw, 64px) 0;
  margin: 0 auto;
  pointer-events: none;
}

.home-hero__copy,
.home-hero__content :deep(a),
.home-hero__content :deep(button) {
  pointer-events: auto;
}

.home-hero__copy {
  max-width: 660px;
  padding-bottom: min(12vh, 118px);
  color: #fdf8e8;
  text-shadow: 0 2px 20px rgb(29 45 38 / 34%);
}

.home-hero__eyebrow {
  margin: 0 0 12px;
  font-size: 0.78rem;
  font-weight: 800;
  color: rgb(255 250 235 / 84%);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home-hero__lead {
  max-width: 560px;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgb(255 250 235 / 80%);
}

.home-hero__copy h1 {
  color: #fff7df;
}

.home-hero__entry {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.home-hero__action {
  position: relative;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-width: 168px;
  min-height: 56px;
  padding: 0 28px;
  overflow: hidden;
  font-weight: 900;
  color: #fff8e5;
  text-decoration: none;
  text-shadow: 0 2px 16px rgb(25 39 32 / 60%);
  pointer-events: auto;
  background:
    linear-gradient(140deg, rgb(255 255 255 / 20%), rgb(255 255 255 / 4%) 44%, transparent 72%),
    rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 250 231 / 66%);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 58%),
    inset 0 -24px 42px rgb(255 255 255 / 5%),
    0 20px 70px rgb(18 30 25 / 24%);
  isolation: isolate;
  backdrop-filter: blur(5px) saturate(124%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.home-hero__action::before,
.home-hero__action::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  content: '';
}

.home-hero__action::before {
  background:
    linear-gradient(
      90deg,
      transparent calc(50% - 0.5px),
      rgb(255 250 231 / 34%) 50%,
      transparent calc(50% + 0.5px)
    ),
    linear-gradient(
      180deg,
      transparent calc(50% - 0.5px),
      rgb(255 250 231 / 22%) 50%,
      transparent calc(50% + 0.5px)
    );
  opacity: 0.62;
}

.home-hero__action::after {
  inset: 1px;
  background: linear-gradient(122deg, rgb(255 255 255 / 28%), transparent 34%);
  border-radius: 7px;
  opacity: 0.74;
}

.home-hero__action span {
  display: inline-grid;
  place-items: center;
  width: 22px;
  aspect-ratio: 1;
  font-size: 1rem;
  line-height: 1;
  border: 1px solid rgb(255 250 231 / 46%);
  border-radius: 50%;
}

.home-hero__action:hover {
  border-color: rgb(255 252 240 / 88%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 70%),
    inset 0 -28px 50px rgb(255 255 255 / 8%),
    0 24px 78px rgb(18 30 25 / 30%);
  transform: translateY(-2px);
}

.home-hero__action:focus-visible {
  outline: 3px solid rgb(255 249 229 / 68%);
  outline-offset: 3px;
}

@media (width <= 1024px) {
  .home-hero__content {
    width: min(760px, calc(100% - 36px));
  }

  .home-hero__copy {
    max-width: 620px;
    padding: 0;
  }
}

@media (width <= 560px) {
  .home-hero__veil {
    background:
      linear-gradient(
        180deg,
        rgb(20 39 31 / 4%) 0%,
        rgb(20 39 31 / 28%) 54%,
        rgb(20 39 31 / 70%) 100%
      ),
      radial-gradient(
        circle at 50% 36%,
        transparent 0 26%,
        rgb(245 244 233 / 28%) 68%,
        rgb(245 244 233 / 58%) 100%
      );
  }

  .home-hero__content {
    width: min(100% - 24px, 520px);
    padding: 22px 0;
  }

  .home-hero__lead {
    font-size: 0.98rem;
  }

  .home-hero__action {
    min-width: 150px;
    min-height: 50px;
    padding: 0 22px;
  }
}
</style>
