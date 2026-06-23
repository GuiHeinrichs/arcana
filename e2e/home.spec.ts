import { test, expect } from '@playwright/test'

// Smoke E2E: the dev server boots and the home page renders with a title.
test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})
