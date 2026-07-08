import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '../../src/views/Home.vue'

function renderHome() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Home },
      { path: '/world', name: 'world', component: { template: '<div />' } },
      { path: '/docs/:slug', name: 'doc-detail', component: { template: '<div />' } },
      { path: '/ask', name: 'ask', component: { template: '<div />' } }
    ]
  })

  router.push('/')

  return render(Home, {
    global: {
      plugins: [router]
    }
  })
}

describe('Home', () => {
  it('renders the space entry without resume content', () => {
    renderHome()

    expect(screen.getByRole('heading', { name: '走进我的空间' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '进入空间' })).toHaveAttribute('href', '/world')
    expect(screen.queryByRole('img', { name: '佟金龙简历第一页' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '打开简历' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '下载简历' })).not.toBeInTheDocument()
  })
})
