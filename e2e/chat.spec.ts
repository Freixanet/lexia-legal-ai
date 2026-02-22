import { test, expect } from '@playwright/test'

test.describe('Chat flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('if on landing, new chat or input is reachable', async ({ page }) => {
    const newChat = page.getByRole('button', { name: /nueva|primera vez|empezar/i })
    const input = page.getByPlaceholder(/duda legal|consulta|describe/i)
    const hasNewChat = await newChat.isVisible().catch(() => false)
    const hasInput = await input.isVisible().catch(() => false)
    expect(hasNewChat || hasInput).toBeTruthy()
  })
})
