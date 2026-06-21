<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { skillProfiles } from '@/config/skills.config'

const route = useRoute()

const docSlug = computed(() => {
  const slug = route.params.slug

  return typeof slug === 'string' ? slug : ''
})

const queryContext = computed(() => {
  const skill = typeof route.query.skill === 'string' ? route.query.skill : ''
  const category = typeof route.query.category === 'string' ? route.query.category : ''

  return { category, skill }
})

const currentDocName = computed(() => {
  const matchedSkill = skillProfiles.find((skill) => skill.docSlug === docSlug.value)

  return matchedSkill?.name ?? docSlug.value
})
</script>

<template>
  <main class="placeholder-page placeholder-page--docs">
    <section class="placeholder-page__content" aria-labelledby="docs-title">
      <p class="placeholder-page__eyebrow">Docs Library</p>
      <h1 id="docs-title">{{ docSlug ? '内容正在同步' : '文档图书馆' }}</h1>
      <p v-if="docSlug">「{{ currentDocName }}」的内容正在同步，待开放。</p>
      <p v-else-if="queryContext.skill || queryContext.category">
        正在为技能「{{ queryContext.skill || '全部' }}」和分类「{{ queryContext.category || '全部' }}」预留文档列表。
      </p>
      <p v-else>文档列表、分类筛选和后端 API 接入点已经预留。</p>
      <nav class="placeholder-page__actions" aria-label="文档页面导航">
        <RouterLink :to="{ name: 'home' }">回到首页</RouterLink>
        <RouterLink :to="{ name: 'ask' }">知识库问答</RouterLink>
      </nav>
    </section>
  </main>
</template>
