const request = require('supertest');
const app = require('../service.js');
const DB = require('../database/database.js');
const { randomUserId, createVendor, updateVendor } = require('./testUtil.js');

const testVendorName = 'vendor name';

let adminAuthToken = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('add vendor', async () => {
  const vendor = await createVendor(adminAuthToken, testVendorName);
  try {
    expect(vendor.id).toBeDefined();
    expect(vendor.apiKey).toBeDefined();
    expect(vendor.name).toBe(testVendorName);
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('add vendor no auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').send({ id: randomUserId(), name: testVendorName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor bad auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer bogus`).send({ id: randomUserId(), name: testVendorName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor missing params', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send({});
  expect(addVendorRes.status).toBe(400);
});

test('update vendor name', async () => {
  const vendor = await createVendor(adminAuthToken, testVendorName);
  try {
    const updateVendorRes = await request(app).put(`/api/admin/vendor/${vendor.apiKey}`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
    expect(updateVendorRes.status).toBe(200);
    expect(updateVendorRes.body.name).toBe('updated name');
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('update vendor chaos', async () => {
  const chaosReq = { chaos: { type: 'throttle', resolveUrl: 'http://resolve.me' } };
  const vendor = await createVendor(adminAuthToken, testVendorName);
  try {
    const [status, updatedVendor] = await updateVendor(adminAuthToken, vendor.apiKey, chaosReq);
    expect(status).toBe(200);
    expect(updatedVendor.chaos).toMatchObject(chaosReq.chaos);
    expect(updatedVendor.chaos.fixCode).toBeDefined();
    expect(updatedVendor.chaos.errorDate).toBeDefined();
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('update vendor unknown', async () => {
  const updateVendorRes = await request(app).put(`/api/admin/vendor/bogus`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
  expect(updateVendorRes.status).toBe(404);
});
