import { test, expect } from 'playwright-test-coverage';
import { Vendor } from '../src/model';
import { login, registerLoginHandlers } from './user';

test('Login', async ({ page }) => {
  const vendor = { id: 'test3', name: 'Test 3', email: 'test3@byu.edu', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await registerLoginHandlers(page, vendor);

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
  await page.getByRole('textbox', { name: 'Login' }).fill(vendor.id);
  await page.getByRole('button', { name: 'Get code' }).click();
  await expect(page.locator('b')).toContainText('tes...@byu.edu');
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();

  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');
  await expect(page.getByText('test3', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue(vendor.name);
  await expect(page.getByRole('textbox', { name: 'Pizza Service:', exact: true })).toHaveValue(vendor.website);

  await page.reload();
  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
});

test('Register', async ({ page }) => {
  const vendor: any = {};

  await registerLoginHandlers(page, vendor);

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
  await page.getByRole('textbox', { name: 'Login' }).fill('test1');
  await page.getByRole('button', { name: 'Get code' }).click();

  await expect(page.locator('h2')).toContainText('Create Vendor Account');

  await page.getByRole('textbox', { name: 'Name' }).fill('Test 1');
  await page.getByRole('textbox', { name: 'Email That you check' }).fill('test1@byu.edu');
  await page.getByRole('textbox', { name: 'For working with a peer' }).fill('111-111-1111');

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('b')).toContainText('tes...@byu.edu');
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();

  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');
  await expect(page.getByText('test1', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 1');
});

test('Badge', async ({ page }) => {
  const vendor: Vendor = { id: 'test3', name: 'Test 3', phone: '333-333-3333', email: 'test3@byu.edu', apiKey: 'xyz', website: 'https://pizza.test.com', gitHubUrl: 'https://github.com/test3' };

  await page.route('**/api/badge/test3/a?*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/api/badge/test3/a' }),
      });
    } else if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 201,
        contentType: 'image/svg+xml',
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20"><rect width="50" height="20" fill="#0b0"/><text x="25" y="14" fill="#fff" font-size="12" text-anchor="middle">Test</text></svg>`,
      });
    }
  });

  await registerLoginHandlers(page, vendor);
  await login(page);

  await page.getByRole('textbox', { name: 'Badge Name:' }).fill('a');
  await page.getByRole('textbox', { name: 'Label:' }).fill('Taco');
  await page.getByRole('textbox', { name: 'Value:' }).fill('5');
  await page.getByRole('button', { name: 'Generate Badge' }).click();

  await expect(page.getByRole('img', { name: 'Badge' })).toBeVisible();
  await expect(page.getByRole('link')).toContainText('http://localhost:3000/api/badge/test3/a');
});

test('Chaos', async ({ page }) => {
  const vendor: Vendor = { id: 'test3', name: 'Test 3', phone: '333-333-3333', email: 'test3@byu.edu', apiKey: 'xyz', website: 'https://pizza.test.com', gitHubUrl: 'https://github.com/test3' };

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

test('Update', async ({ page }) => {
  const vendor: Vendor = { id: 'test3', name: 'Test 3', phone: '333-333-3333', email: 'test3@byu.edu', apiKey: 'xyz', website: 'https://pizza.test.com', gitHubUrl: 'https://github.com/test3' };

  await registerLoginHandlers(page, vendor);
  await login(page);
  await page.getByRole('textbox', { name: 'Name:', exact: true }).fill('Test 4');
  await page.getByRole('textbox', { name: 'Phone:' }).fill('333-333-3334');
  await page.getByRole('textbox', { name: 'Email:' }).fill('test4@byu.edu');
  await page.getByRole('textbox', { name: 'Pizza Service:' }).fill('https://pizza.test4.com');
  await page.getByRole('textbox', { name: 'GitHub URL:' }).fill('https://github.com/test4');
  await page.getByText('Name:Phone:Email:Pizza Service:GitHub URL:Update').click();
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 4');
  await expect(page.getByRole('textbox', { name: 'Phone:' })).toHaveValue('333-333-3334');
  await expect(page.getByRole('textbox', { name: 'Email:' })).toHaveValue('test4@byu.edu');
  await expect(page.getByRole('textbox', { name: 'Pizza Service:' })).toHaveValue('https://pizza.test4.com');
  await expect(page.getByRole('textbox', { name: 'GitHub URL:' })).toHaveValue('https://github.com/test4');

  await page.reload();

  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 4');
});
