import { test, expect } from '@playwright/test'

test.describe('Delete account', () => {
  test('app loads and has main content', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    const main = page.getByRole('main').or(page.locator('[id="main-content"]'))
    await expect(main.first()).toBeVisible({ timeout: 10000 })
  })
})
