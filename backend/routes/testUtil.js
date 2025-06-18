const request = require('supertest');
const app = require('../service');

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

async function getVendor(apiKey) {
  const vendorRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${apiKey}`);
  return vendorRes.body;
}

async function createVendor(adminAuthToken) {
  const testUser = { id: randomUserId() };
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send(testUser);
  expect(addVendorRes.status).toBe(200);
  return addVendorRes.body;
}
async function createOrder(apiKey, order = { diner: { id: 719, name: 'j', email: 'j@jwt.com' }, order: { items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }], storeId: '5', franchiseId: 4, id: 278 } }) {
  const createOrderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${apiKey}`).send(order);
  return [createOrderRes.status, createOrderRes.body];
}

function randomUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}
module.exports = {
  getVendor,
  createOrder,
  createVendor,
  randomUserId,
};
