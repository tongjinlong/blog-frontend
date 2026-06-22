<script setup lang="ts">
import { computed, ref } from 'vue'

const question = ref('')
const submittedQuestion = ref('')

const normalizedQuestion = computed(() => question.value.trim())

function submitQuestion() {
  submittedQuestion.value = normalizedQuestion.value
}
</script>

<template>
  <main class="placeholder-page placeholder-page--knowledge">
    <section class="placeholder-page__content knowledge-panel" aria-labelledby="ask-title">
      <p class="placeholder-page__eyebrow">Knowledge Terminal</p>
      <h1 id="ask-title">知识库问答</h1>
      <p>问答界面已经预留，后续会接入知识库检索和回答接口。</p>

      <form class="knowledge-panel__form" @submit.prevent="submitQuestion">
        <label for="knowledge-question">向我的知识库提问</label>
        <div class="knowledge-panel__row">
          <input
            id="knowledge-question"
            v-model="question"
            type="text"
            placeholder="例如：你的前端工程经验有哪些？"
          />
          <button type="submit" :disabled="!normalizedQuestion">发送</button>
        </div>
      </form>

      <p v-if="submittedQuestion" class="knowledge-panel__draft">
        已收到：「{{ submittedQuestion }}」。接口接入后会在这里返回答案。
      </p>

      <nav class="placeholder-page__actions" aria-label="知识库页面导航">
        <RouterLink :to="{ name: 'home' }">回到首页</RouterLink>
        <RouterLink :to="{ name: 'docs' }">查看文档</RouterLink>
      </nav>
    </section>
  </main>
</template>
