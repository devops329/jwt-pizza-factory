const request = require('supertest');
const app = require('../service');

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

async function createVendor(adminAuthToken, vendorName) {
  const testUser = { id: randomUserId(), name: vendorName };
  console.log('Creating vendor', testUser);
  const addVendorRes = await request(app).post('/api/admin/vendor').set('Authorization', `Bearer ${adminAuthToken}`).send(testUser);
  expect(addVendorRes.status).toBe(200);
  return [testUser.id, addVendorRes.body.apiKey, addVendorRes.body.vendor];
}

async function updateVendor(adminAuthToken, vendorApiKey, updateReq) {
  const updateVendorRes = await request(app).put(`/api/admin/vendor/${vendorApiKey}`).set('Authorization', `Bearer ${adminAuthToken}`).send(updateReq);
  return [updateVendorRes.status, updateVendorRes.body.vendor];
}

async function createOrder(apiKey, order = { diner: { id: 719, name: 'j', email: 'j@jwt.com' }, order: { items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }], storeId: '5', franchiseId: 4, id: 278 } }) {
  const createOrderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${apiKey}`).send(order);
  return [createOrderRes.status, createOrderRes.body];
}

function randomUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}
module.exports = {
  createOrder,
  createVendor,
  updateVendor,
  randomUserId,
};
