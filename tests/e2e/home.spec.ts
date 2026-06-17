import { expect, test } from '@playwright/test'

test('renders the home page and supports the counter interaction', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('blog-frontend')
  await expect(page.getByRole('heading', { name: 'Get started' })).toBeVisible()

  const counter = page.getByRole('button', { name: 'Count is 0' })

  await expect(counter).toBeVisible()
  await counter.click()
  await expect(page.getByRole('button', { name: 'Count is 1' })).toBeVisible()
})
