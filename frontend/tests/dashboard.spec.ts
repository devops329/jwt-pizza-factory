//import { test, expect } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Vendor } from '../src/model';

// Do this:
// const mockRoutes = [
//   {
//     method: 'GET',
//     url: /\/api\/users$/,
//     response: [{ id: 1, name: 'Alice' }],
//     status: 200
//   },
//   {
//     method: 'POST',
//     url: /\/api\/users$/,
//     response: { id: 2, name: 'Bob' },
//     status: 201
//   }
// ];

// await page.route('**/*', async (route, request) => {
//   const match = mockRoutes.find(r =>
//     r.method === request.method() &&
//     r.url.test(request.url())
//   );

//   if (match) {
//     return route.fulfill({
//       status: match.status,
//       contentType: 'application/json',
//       body: JSON.stringify(match.response)
//     });
//   }

//   return route.continue();
// });

function getUrlParam(route, regex) {
  const url = route.request().url();
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function registerLoginHandlers(page, vendor) {
  await page.route('**/api/vendor/*', async (route, request) => {
    const param = getUrlParam(route, /\/api\/vendor\/([^/]+)/);
    if (param === 'code') {
      // Send auth code email
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ email: vendor.email }),
      });
    } else if (param === 'auth') {
      // Authorize code received from email
      const postData = request.postData();
      const json = postData ? JSON.parse(postData) : {};
      expect(json).toEqual({ id: vendor.id, code: '1234' });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(vendor),
      });
    } else {
      // Check if vendor exists
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ exists: vendor.id === param }),
      });
    }
  });

  await page.route('**/api/vendor', async (route) => {
    const authHeader = route.request().headers()['authorization'];
    if (authHeader) {
      // Update vendor
      if (route.request().method() === 'PUT') {
        const postData = route.request().postData();
        if (postData) {
          const updatedFields = JSON.parse(postData);
          Object.assign(vendor, updatedFields);
        }
      } else {
        // Get vendor
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(vendor),
      });
      return;
    } else {
      // Create vendor
      if (route.request().method() === 'POST') {
        const postData = route.request().postData();
        if (postData) {
          const updatedFields = JSON.parse(postData);
          Object.assign(vendor, updatedFields);
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(vendor),
      });
      return;
    }
  });
}

async function login(page) {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Login' }).fill('test3');
  await page.getByRole('button', { name: 'Get code' }).click();
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();
}

test('Login', async ({ page }) => {
  const vendor = { id: 'test3', name: 'Test 3', email: 'test3@byu.edu', apiKey: 'xyz', website: 'https://pizza.test.com' };

  await registerLoginHandlers(page, vendor);

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('🍕 JWT Pizza Factory');
  await expect(page.getByText('Login')).toBeVisible();
  await page.getByRole('textbox', { name: 'Login' }).fill(vendor.id);
  await page.getByRole('button', { name: 'Get code' }).click();
  await expect(page.locator('b')).toContainText(vendor.email);
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
  await page.getByRole('textbox', { name: 'Phone Number For text' }).fill('111-111-1111');

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('b')).toContainText('test1@byu.edu');
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();

  await expect(page.locator('h2')).toContainText('Pizza Vendor Dashboard');
  await expect(page.getByText('test1', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 1');
});

test('Badge', async ({ page }) => {
  const vendor: Vendor = { id: 'test3', name: 'Test 3', apiKey: 'xyz', website: 'https://pizza.test.com' };

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
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20"><rect width="50" height="20" fill="#0b0"/><text x="25" y="14" fill="#fff" font-size="12" text-anchor="middle">Test</text></svg>`,
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
