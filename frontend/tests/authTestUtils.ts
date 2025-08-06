import { expect } from 'playwright-test-coverage';

function getUrlParam(route, regex) {
  const url = route.request().url();
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function registerLoginHandlers(page, vendor) {
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

export async function login(page) {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Login' }).fill('test3');
  await page.getByRole('button', { name: 'Get code' }).click();
  await page.getByRole('textbox', { name: 'Authenticate code' }).fill('1234');
  await page.getByRole('button', { name: 'Validate code' }).click();
}
