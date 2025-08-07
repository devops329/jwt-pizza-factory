const request = require('supertest');
const app = require('../service.js');
const { createVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let admin = null;
let vendor = null;
beforeAll(async () => {
  vendor = await createVendor();
  admin = await createVendor();
  DB.assignRole(admin.id, 'admin', true);
});

afterAll(async () => {
  await DB.deleteVendor(vendor.id);
  await DB.deleteVendor(admin.id);
});

test('Log message', async () => {
  const logRes = await sendLogMessage(vendor, 'Test log message');
  expect(logRes.status).toBe(200);
  expect(logRes.text).toBe('Log received');
});

test('Change response message', async () => {
  const logRes = await request(app).put(`/api/log`).set('Authorization', `Bearer ${admin.apiKey}`).send({ message: 'Updated log message' });
  expect(logRes.status).toBe(200);
  expect(logRes.text).toBe('Updated log message');
});

test('Change response message non admin', async () => {
  const vendorLogRes = await request(app).put(`/api/log`).set('Authorization', `Bearer ${vendor.apiKey}`).send({ message: 'Updated log message' });
  expect(vendorLogRes.status).toBe(401);

  const unknownLogRes = await request(app).put(`/api/log`).set('Authorization', `Bearer bogus`).send({ message: 'Updated log message' });
  expect(unknownLogRes.status).toBe(401);
});

async function sendLogMessage(vendor, message) {
  return await request(app).post(`/api/log`).set('Authorization', `Bearer ${vendor.apiKey}`).send({ message });
}
