<script setup lang="ts">
import { computed, ref } from 'vue'

const resumeImageUrl = '/resume/tongjinlong-resume-page-1-transparent.png'

const rotateX = ref(0)
const rotateY = ref(0)
const translateX = ref(0)
const translateY = ref(0)

const stageStyle = computed(() => ({
  transform: `perspective(1400px) translate3d(${translateX.value}px, ${translateY.value}px, 0) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`
}))

function resetParallax() {
  rotateX.value = 0
  rotateY.value = 0
  translateX.value = 0
  translateY.value = 0
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') {
    return
  }

  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width - 0.5
  const y = (event.clientY - bounds.top) / bounds.height - 0.5

  rotateX.value = Number((-y * 5).toFixed(2))
  rotateY.value = Number((x * 7).toFixed(2))
  translateX.value = Number((x * 8).toFixed(2))
  translateY.value = Number((y * 7).toFixed(2))
}
</script>

<template>
  <section class="resume-embed" aria-label="简历第一页展示">
    <div
      class="resume-stage"
      :style="stageStyle"
      @pointermove="handlePointerMove"
      @pointerleave="resetParallax"
    >
      <img
        class="resume-stage__page"
        :src="resumeImageUrl"
        alt="佟金龙简历第一页"
        draggable="false"
      />
    </div>
  </section>
</template>

<style scoped>
.resume-embed {
  position: relative;
  justify-self: end;
  width: min(44vw, 680px);
  min-width: 0;
  pointer-events: auto;
}

.resume-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: min(90svh, 880px);
  min-height: 620px;
  transform-style: preserve-3d;
  transition: transform 0.18s ease;
  will-change: transform;
}

.resume-stage__page {
  display: block;
  width: auto;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  user-select: none;
  object-fit: contain;
  filter:
    drop-shadow(0 30px 58px rgb(16 28 24 / 18%))
    drop-shadow(0 3px 1px rgb(255 255 255 / 22%));
}

@media (prefers-reduced-motion: reduce) {
  .resume-stage {
    transform: none !important;
    transition: none;
  }
}

@media (width <= 1024px) {
  .resume-embed {
    justify-self: stretch;
    width: min(760px, 100%);
    margin: 0 auto;
  }

  .resume-stage {
    height: 68svh;
    min-height: 500px;
  }
}

@media (width <= 560px) {
  .resume-stage {
    height: 58svh;
    min-height: 390px;
  }
}
</style>
