import { expect, test } from '@playwright/test'

test('renders the home page and links to the reserved modules', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await expect(page).toHaveTitle('blog-frontend')
  await expect(page.getByRole('heading', { name: '走进我的空间' })).toBeVisible()
  await expect(page.getByLabel('3D 空间预览')).toBeVisible()
  await expect(page.getByRole('img', { name: '佟金龙简历第一页' })).toBeVisible()
  await expect(page.locator('iframe[title="佟金龙简历"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: '打开简历' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: '下载简历' })).toHaveCount(0)

  await page.getByRole('link', { name: '进入空间' }).click()
  await expect(page).toHaveURL(/\/world$/)
  await expect(page.getByRole('heading', { name: '空间世界' })).toBeVisible()
})
