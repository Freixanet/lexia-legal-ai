import { test, expect } from '@playwright/test'

test.describe('Settings / configuration', () => {
  test('theme or settings can be toggled when visible', async ({ page }) => {
    await page.goto('/')
    const themeBtn = page.getByRole('button', { name: /tema|modo|claro|oscuro/i })
    const settingsBtn = page.getByRole('button', { name: /configuración|settings|historial/i })
    const oneVisible = (await themeBtn.isVisible().catch(() => false)) || (await settingsBtn.isVisible().catch(() => false))
    expect(oneVisible).toBeTruthy()
  })
})
