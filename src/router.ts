import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/world',
      name: 'world',
      component: () => import('@/features/world/WorldPlaceholderView.vue')
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('@/features/docs/DocsPlaceholderView.vue')
    },
    {
      path: '/docs/:slug',
      name: 'doc-detail',
      component: () => import('@/features/docs/DocsPlaceholderView.vue')
    },
    {
      path: '/ask',
      name: 'ask',
      component: () => import('@/features/knowledge/KnowledgeAskPlaceholderView.vue')
    }
  ]
})
