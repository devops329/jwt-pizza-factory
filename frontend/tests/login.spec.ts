//import { test, expect } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

test('test', async ({ page }) => {
  const vendor = { id: 'test3', name: 'Test 3', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await page.route('**/api/vendor/test3', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ exists: true }),
    });
  });

  await page.route('**/api/vendor', async (route) => {
    const authHeader = route.request().headers()['authorization'];
    if (authHeader) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(vendor),
      });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not authorized' }),
    });
  });

  await page.route('**/api/vendor/code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: 'test3.byu.edu' }),
    });
  });

  await page.route('**/api/vendor/auth', async (route, request) => {
    const postData = request.postData();
    const json = postData ? JSON.parse(postData) : {};
    expect(json).toEqual({ id: 'test3', code: '1234' });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(vendor),
    });
  });

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
  await page.getByRole('textbox', { name: 'Login' }).fill('test3');
  await page.getByRole('button', { name: 'Get code' }).click();
  await expect(page.locator('b')).toContainText('test3.byu.edu');
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();

  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');
  await expect(page.getByText('test3', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 3');
  await expect(page.getByRole('textbox', { name: 'Pizza Website:', exact: true })).toHaveValue('https://pizza.test.com');

  await page.reload();
  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
});
