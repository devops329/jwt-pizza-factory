const request = require('supertest');
const app = require('../service.js');
const { createVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let vendor = null;
beforeAll(async () => {
  vendor = await createVendor();
});

afterAll(async () => {
  await DB.deleteVendor(vendor.id);
});

test('Create badge', async () => {
  const createBadge = await request(app).post(`/api/badge/${vendor.id}/pizza`).set('Authorization', `Bearer ${vendor.apiKey}`);
  expect(createBadge.status).toBe(200);
  const cleanedVendorId = vendor.id.replace(/[^a-zA-Z0-9]/g, '');
  expect(createBadge.body).toMatchObject({
    url: expect.stringContaining(`/api/badge/${cleanedVendorId}/pizza`),
  });

  // Make sure the badge is available
  const getBadge = await request(app).get(`/api/badge/${vendor.id}/pizza`);
  expect(getBadge.status).toBe(200);
  expect(Buffer.isBuffer(getBadge.body)).toBe(true);
  const svg = getBadge.body.toString();
  expect(/<svg[\s\S]*?>/i.test(svg)).toBe(true);
});
