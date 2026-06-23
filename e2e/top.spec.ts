import { expect, test } from '@playwright/test';

test('top cards page: podium, tab switch, and detail sheet', async ({ page }) => {
  await page.goto('/top');

  // Header nav marks Top Cards active.
  await expect(page.getByRole('link', { name: 'Top Cards' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // Default lens tab is selected.
  await expect(page.getByRole('tab', { name: 'Em alta' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  // Switching to Staples (always populated) shows cards and updates the URL.
  await page.getByRole('tab', { name: 'Staples' }).click();
  await expect(page.getByRole('tab', { name: 'Staples' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page).toHaveURL(/\?lens=staples/);

  const firstCard = page.getByRole('button', { name: /^View / }).first();
  await expect(firstCard).toBeVisible();

  // Clicking a card opens the detail sheet.
  await firstCard.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
