const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');

let adminAuthToken = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('add vendor', async () => {
  const userId = randomUserId();
  const testUser = { id: userId, name: 'cs student' };
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send(testUser);
  expect(addVendorRes.status).toBe(200);
});

function randomUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}

test('hello world', () => {
  expect('hello' + ' world').toBe('hello world');
});
