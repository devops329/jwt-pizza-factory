const request = require('supertest');
const app = require('../service.js');
const { createVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let adminAuthToken = null;
let vendor = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
  vendor = await createVendor(adminAuthToken);
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('Get vendor', async () => {
  const reportRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`);
  expect(reportRes.status).toBe(200);
  expect(reportRes.body).toMatchObject({ id: vendor.id, apiKey: vendor.apiKey });
});
