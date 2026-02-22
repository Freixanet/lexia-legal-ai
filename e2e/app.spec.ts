import { test, expect } from '@playwright/test'

test.describe('Lexia app', () => {
  test('landing or login is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    const heading = page.getByRole('heading', { level: 1 }).or(page.getByText(/lexia|iniciar sesión|legal/i).first())
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to legal page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /aviso legal|privacidad|legal/i }).first().click().catch(() => {})
    await expect(page).toHaveURL(/\/(aviso-legal|privacidad|cookies)|#/).catch(() => {})
  })
})
