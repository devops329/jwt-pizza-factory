const request = require('supertest');
const app = require('../service.js');
const { createOrder, createVendor, updateVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let adminAuthToken = null;
let vendorApiKey = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
  const vendor = await createVendor(adminAuthToken);
  vendorApiKey = vendor.apiKey;
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('Report problem', async () => {
  await updateVendor(adminAuthToken, vendorApiKey, { chaos: { type: 'badjwt', resolveUrl: 'http://resolve.me' } });
  const [, body] = await createOrder(vendorApiKey);

  const reportUrl = body.reportUrl;

  const url = new URL(reportUrl);
  const apiKeyParam = url.searchParams.get('apiKey');
  const fixCodeParam = url.searchParams.get('fixCode');

  const reportRes = await request(app).get(`/api/support/${apiKeyParam}/report/${fixCodeParam}`);
  expect(reportRes.status).toBe(200);
  expect(reportRes.body.message).toBe('Problem resolved. Pizza is back on the menu!');

  const [status, vendor] = await updateVendor(adminAuthToken, vendorApiKey, {});
  expect(status).toBe(200);
  expect(vendor.chaos.type).toBe('none');
});

test('Report problem unknown vendor', async () => {
  const reportRes = await request(app).get(`/api/support/xyz/report/33333`);
  expect(reportRes.status).toBe(400);
  expect(reportRes.body.message).toBe('Unknown vendor');
});
