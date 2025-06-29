const request = require('supertest');
const app = require('../service.js');
const { createOrder, createVendor, getVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let vendor = null;
beforeAll(async () => {
  vendor = await createVendor();
});

afterAll(async () => {
  await DB.deleteVendor(vendor.id);
});

test('Report problem', async () => {
  try {
    const initChaosRes = await request(app).put(`/api/vendor/chaos/fail`).set('Authorization', `Bearer ${vendor.apiKey}`).send({});
    expect(initChaosRes.status).toBe(200);

    const [, body] = await createOrder(vendor.apiKey);
    const reportRes = await request(app).get(new URL(body.reportUrl).pathname);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.message).toBe('Problem resolved. Pizza is back on the menu!');

    const updatedVendor = await getVendor(vendor.apiKey);
    expect(updatedVendor.chaos.type).toBe('none');
  } finally {
    await DB.removeChaos(vendor.id);
  }
});

test('Report problem unknown vendor', async () => {
  const reportRes = await request(app).get(`/api/support/xyz/report/33333`);
  expect(reportRes.status).toBe(400);
  expect(reportRes.body.message).toBe('Problem unresolved');
});
