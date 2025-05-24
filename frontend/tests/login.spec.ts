import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'BYU Net ID' }).click();
  await page.getByRole('textbox', { name: 'BYU Net ID' }).fill('test3');
  await page.getByRole('button', { name: 'Get code' }).click();
  await page.getByRole('textbox', { name: 'Authentication code' }).click();
  await page.getByRole('textbox', { name: 'Authentication code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.locator('b')).toContainText('test3.byu.edu');
});
