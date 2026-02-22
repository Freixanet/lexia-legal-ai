import { test, expect } from '@playwright/test'

test.describe('Responsive', () => {
  test('mobile viewport shows content', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('desktop viewport shows content', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
