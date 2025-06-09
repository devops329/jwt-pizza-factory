const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');
const { randomUserId, createVendor, updateVendor } = require('./testUtil.js');

const testVendorName = 'vendor name';

let adminAuthToken = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
});

afterAll(async () => {
  console.log('Deleting admin auth token');
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('add vendor', async () => {
  const [userId, apiKey, vendor] = await createVendor(adminAuthToken, testVendorName);
  expect(vendor.id).toBe(userId);
  expect(apiKey).toBeDefined();
  expect(vendor.name).toBe(testVendorName);
});

test('add vendor no auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').send({ id: randomUserId(), name: testVendorName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor bad auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer bogus`).send({ id: randomUserId(), name: testVendorName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor duplicate', async () => {
  const [userId, apiKey, vendor] = await createVendor(adminAuthToken, testVendorName);
  const addVendorRes2 = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send({ id: userId, name: testVendorName });
  expect(apiKey).toBe(addVendorRes2.body.apiKey);
  expect(vendor).toMatchObject(addVendorRes2.body.vendor);
});

test('add vendor missing params', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send({});
  expect(addVendorRes.status).toBe(400);
});

test('update vendor name', async () => {
  const [, apiKey] = await createVendor(adminAuthToken, testVendorName);

  const updateVendorRes = await request(app).put(`/api/admin/vendor/${apiKey}`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
  expect(updateVendorRes.status).toBe(200);
  expect(updateVendorRes.body.vendor.name).toBe('updated name');
});

test('update vendor chaos', async () => {
  const chaosReq = { chaos: { type: 'throttle', resolveUrl: 'http://resolve.me' } };
  const [, apiKey] = await createVendor(adminAuthToken, testVendorName);

  const [status, vendor] = await updateVendor(adminAuthToken, apiKey, chaosReq);
  expect(status).toBe(200);
  expect(vendor.chaos).toMatchObject(chaosReq.chaos);
  expect(vendor.chaos.fixCode).toBeDefined();
  expect(vendor.chaos.errorDate).toBeDefined();
});

test('update vendor unknown', async () => {
  const updateVendorRes = await request(app).put(`/api/admin/vendor/bogus`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
  expect(updateVendorRes.status).toBe(404);
});
