const request = require('supertest');
const app = require('../service');
const { createVendor, updateVendor } = require('./adminRouter.test.js');
const { createOrder } = require('./orderRouter.test.js');

let vendorApiKey = null;
beforeAll(async () => {
  [, vendorApiKey] = await createVendor();
});

test('Report problem', async () => {
  await updateVendor(vendorApiKey, { chaos: { type: 'badjwt', resolveUrl: 'http://resolve.me' } });
  const [, body] = await createOrder(vendorApiKey);

  const reportUrl = body.reportUrl;

  const url = new URL(reportUrl);
  const apiKeyParam = url.searchParams.get('apiKey');
  const fixCodeParam = url.searchParams.get('fixCode');

  const reportRes = await request(app).get(`/api/support/${apiKeyParam}/report/${fixCodeParam}`);
  expect(reportRes.status).toBe(200);
  expect(reportRes.body.message).toBe('Problem resolved. Pizza is back on the menu!');

  const [status, vendor] = await updateVendor(vendorApiKey, {});
  expect(status).toBe(200);
  expect(vendor.chaos.type).toBe('none');
});

test('Report problem unknown vendor', async () => {
  const reportRes = await request(app).get(`/api/support/xyz/report/33333`);
  expect(reportRes.status).toBe(400);
  expect(reportRes.body.message).toBe('Unknown vendor');
});
