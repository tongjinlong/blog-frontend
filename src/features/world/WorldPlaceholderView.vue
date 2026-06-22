<template>
  <main class="placeholder-page placeholder-page--world">
    <section class="placeholder-page__content" aria-labelledby="world-title">
      <p class="placeholder-page__eyebrow">Space World</p>
      <h1 id="world-title">空间世界</h1>
      <p>第一人称漫游入口已经预留，后续会在这里接入小屋、图书馆和文档传送点。</p>
      <nav class="placeholder-page__actions" aria-label="空间页面导航">
        <RouterLink :to="{ name: 'home' }">回到首页</RouterLink>
        <RouterLink :to="{ name: 'docs' }">查看文档</RouterLink>
      </nav>
    </section>
  </main>
</template>
