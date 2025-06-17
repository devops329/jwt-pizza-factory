//import { test, expect } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Vendor } from '../src/model';

async function registerLoginHandlers(page, vendor) {
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
}

test('Login', async ({ page }) => {
  const vendor = { id: 'test3', name: 'Test 3', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await registerLoginHandlers(page, vendor);

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

async function login(page) {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Login' }).fill('test3');
  await page.getByRole('button', { name: 'Get code' }).click();
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();
}

test('Badge', async ({ page }) => {
  const vendor = { id: 'test3', name: 'Test 3', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await page.route('**/api/badge/test3/a?label=Example&value=100%25&color=%2344aa44', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/api/badge/test3/a' }),
      });
    }
  });

  await page.route('**/api/badge/test3/a', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 201,
        contentType: 'image/svg+xml',
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20"><rect width="100" height="20" fill="#555"/><text x="50" y="14" fill="#fff" font-size="12" text-anchor="middle">Test</text></svg>`,
      });
    }
  });

  await registerLoginHandlers(page, vendor);
  await login(page);

  await page.getByRole('textbox', { name: 'Badge Name:' }).click();
  await page.getByRole('textbox', { name: 'Badge Name:' }).fill('a');
  await page.getByRole('button', { name: 'Generate Badge' }).click();

  await expect(page.getByRole('img', { name: 'Badge' })).toBeVisible();
  await expect(page.getByRole('link')).toContainText('http://localhost:3000/api/badge/test3/a');
});

test('Chaos', async ({ page }) => {
  const vendor: Vendor = { id: 'test3', name: 'Test 3', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await page.route('**/api/vendor/chaos/fail', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Chaos initiated' }),
      });
    }
  });

  await registerLoginHandlers(page, vendor);
  await login(page);

  await page.getByRole('button', { name: 'Initiate chaos' }).click();
  await expect(page.locator('#chaosStatus')).toContainText('chaotic');

  vendor.chaos = {
    type: 'fail',
    initiatedDate: '2025-06-17T17:27:12.882Z',
  };
  await page.reload();
  await expect(page.locator('#chaosStatus')).toContainText('chaotic');

  vendor.chaos = {
    type: 'none',
    initiatedDate: '2025-06-17T17:27:12.882Z',
  };
  await page.reload();
  await expect(page.locator('#chaosStatus')).toContainText('calm');
});
