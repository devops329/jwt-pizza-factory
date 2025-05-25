import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.route('**/api/vendor/code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Code sent to test3.byu.edu' }),
    });
  });

  await page.route('**/api/vendor/authenticate', async (route, request) => {
    const postData = request.postData();
    const json = postData ? JSON.parse(postData) : {};
    expect(json).toEqual({ code: 1234 });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'abcd', vendor: { netId: 'test3', email: 'test3.byu.edu' } }),
    });
  });

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  // await page.getByRole('textbox', { name: 'BYU Net ID' }).click();
  // await page.getByRole('textbox', { name: 'BYU Net ID' }).fill('test3');
  // await page.getByRole('button', { name: 'Get code' }).click();
  await expect(page.locator('b')).toContainText('test3.byu.edu');
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();
});
