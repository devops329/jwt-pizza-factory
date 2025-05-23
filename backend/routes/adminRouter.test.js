const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

const testVenderName = 'vendor name';

let adminAuthToken = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('add vendor', async () => {
  const [userId, apiKey, vendor] = await createVendor();
  expect(vendor.id).toBe(userId);
  expect(apiKey).toBeDefined();
  expect(vendor.name).toBe(testVenderName);
});

test('add vendor no auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').send({ id: randomUserId(), name: testVenderName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor bad auth', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer bogus`).send({ id: randomUserId(), name: testVenderName });
  expect(addVendorRes.status).toBe(401);
});

test('add vendor duplicate', async () => {
  const [userId, apiKey, vendor] = await createVendor();
  const addVendorRes2 = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send({ id: userId, name: testVenderName });
  expect(apiKey).toBe(addVendorRes2.body.apiKey);
  expect(vendor).toMatchObject(addVendorRes2.body.vendor);
});

test('add vendor missing params', async () => {
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send({});
  expect(addVendorRes.status).toBe(400);
});

test('update vendor name', async () => {
  const [, apiKey] = await createVendor();

  const updateVendorRes = await request(app).put(`/api/admin/vendor/${apiKey}`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
  expect(updateVendorRes.status).toBe(200);
  expect(updateVendorRes.body.vendor.name).toBe('updated name');
});

test('update vendor chaos', async () => {
  const chaosReq = { type: 'throttle', resolveUrl: 'http://resolve.me' };
  const [, apiKey] = await createVendor();

  const [status, chaos] = await injectChaos(apiKey, chaosReq);
  expect(status).toBe(200);
  expect(chaos).toMatchObject(chaosReq);
  expect(chaos.fixCode).toBeDefined();
  expect(chaos.errorDate).toBeDefined();
});

test('update vendor unknown', async () => {
  const updateVendorRes = await request(app).put(`/api/admin/vendor/bogus`).set('Authorization', `Bearer ${adminAuthToken}`).send({ name: 'updated name' });
  expect(updateVendorRes.status).toBe(404);
});

async function createVendor() {
  const testUser = { id: randomUserId(), name: testVenderName };
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send(testUser);
  expect(addVendorRes.status).toBe(200);
  return [testUser.id, addVendorRes.body.apiKey, addVendorRes.body.vendor];
}

async function injectChaos(vendorApiKey, chaosReq) {
  const updateVendorRes = await request(app).put(`/api/admin/vendor/${vendorApiKey}`).set('Authorization', `Bearer ${adminAuthToken}`).send({ chaos: chaosReq });
  return [updateVendorRes.status, updateVendorRes.body.vendor.chaos];
}

function randomUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}

module.exports = {
  createVendor,
  injectChaos,
  randomUserId,
};
