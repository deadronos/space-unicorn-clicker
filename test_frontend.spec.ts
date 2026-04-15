import { test, expect } from '@playwright/test';

test('app should load correctly', async ({ page }) => {
  await page.goto('http://localhost:5173/space-unicorn-clicker/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Space Unicorn Clicker')).toBeVisible();
});
