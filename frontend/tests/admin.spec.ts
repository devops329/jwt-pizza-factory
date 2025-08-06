import { test, expect } from 'playwright-test-coverage';
import { Vendor } from '../src/model';
import { login, registerLoginHandlers } from './authTestUtils';

async function registerAdminHandlers(page, vendor) {
  await page.route('**/api/admin/vendors', async (route) => {
    if (route.request().method() === 'GET') {
      const body = [
        vendor,
        {
          name: 'test1',
          email: 'test1@mailinator.com',
          phone: '111-111-1111',
          id: 'test1',
          apiKey: 'af4fca30016c4910bd4fa190558a03de',
          created: '2025-08-04T19:49:33.594Z',
          website: 'https://pizza-service.cs329.click',
          gitHubUrl: 'https://pizza-service.cs329.click',
          chaos: {
            type: 'fail',
            initiatedDate: '2025-08-04T19:53:36.838Z',
            fixDate: '2025-08-04T20:01:12.252Z',
          },
          roles: ['vendor'],
          connections: {
            penetrationTest: {
              id: 'test2',
              purpose: 'penetrationTest',
              created: '2025-08-04T19:51:32.000Z',
              name: 'test2',
              phone: '222-222-2222',
              email: 'test2@mailinator.com',
              website: 'https://pizza-service.cs329.click',
              rating: 1,
            },
          },
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    }
  });

  await page.route('**/api/admin/role', async (route) => {
    if (route.request().method() === 'PUT') {
      vendor.roles = ['vendor'];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(vendor),
      });
    }
  });

  await page.route('**/api/admin/vendor', async (route) => {
    if (route.request().method() === 'DELETE') {
      const postData = route.request().postData() || '{}';
      const json = JSON.parse(postData);
      if (json.deleteType === 'chaos') {
        delete vendor.chaos;
      } else if (json.deleteType === 'connections') {
        vendor.connections = {};
      }
      await route.fulfill({
        status: 204,
      });
    }
  });
}

test('Admin selection', async ({ page }) => {
  const admin: Vendor = {
    id: 'test3',
    name: 'Test 3',
    phone: '333-333-3333',
    email: 'test3@byu.edu',
    apiKey: 'xyz',
    roles: ['admin', 'vendor'],
    connections: {},
  };

  await registerAdminHandlers(page, admin);
  await registerLoginHandlers(page, admin);
  await login(page);

  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('Test 3');

  await page.getByRole('combobox').selectOption('test1');
  await expect(page.getByRole('textbox', { name: 'Name:' })).toHaveValue('test1');

  await page.getByRole('textbox', { name: 'Filter by name or id...' }).click();
  await page.getByRole('textbox', { name: 'Filter by name or id...' }).fill('test3');
  await expect(page.getByRole('textbox', { name: 'Name:' })).toHaveValue('Test 3');

  await page.getByRole('textbox', { name: 'Filter by name or id...' }).fill('x');
  await expect(page.getByRole('main')).toContainText('No vendor selected.');
  await page.getByRole('textbox', { name: 'Filter by name or id...' }).fill('');
  await expect(page.getByRole('textbox', { name: 'Name:' })).toHaveValue('Test 3');
});

test('Admin modify', async ({ page }) => {
  const admin: Vendor = {
    id: 'test3',
    name: 'Test 3',
    phone: '333-333-3333',
    email: 'test3@byu.edu',
    apiKey: 'xyz',
    website: 'https://pizza.test.com',
    gitHubUrl: 'https://github.com/test3',
    roles: ['admin', 'vendor'],
    chaos: {
      type: 'none',
      initiatedDate: '2025-08-04T19:53:36.838Z',
      fixDate: '2025-08-04T20:01:12.252Z',
    },
    connections: {},
  };

  await registerAdminHandlers(page, admin);
  await registerLoginHandlers(page, admin);
  await login(page);

  await page.getByRole('button', { name: '▶ Show tools' }).click();
  await expect(page.getByRole('textbox', { name: 'Name:' })).toHaveValue('Test 3');

  await expect(page.getByRole('button', { name: '▼ Hide tools' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Admin' })).toBeChecked();

  await expect(page.getByRole('main')).toContainText('"roles": [ "admin", "vendor" ]');
  await page.getByRole('checkbox', { name: 'Admin' }).click();
  await expect(page.getByRole('checkbox', { name: 'Admin' })).not.toBeChecked();

  await expect(page.getByRole('main')).toContainText('"roles": [ "vendor" ]');

  await page.getByRole('button', { name: 'Delete Chaos' }).click();
  await expect(page.getByText('{ "id": "test3", "name": "').first()).not.toContainText('"chaos": {');
});
