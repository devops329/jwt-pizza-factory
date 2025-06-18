const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

async function getVendor(apiKey) {
  const vendorRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${apiKey}`);
  return vendorRes.body;
}

async function createVendor() {
  const id = randomUserId();
  const vendor = {
    id,
    name: 'Test Vendor',
    email: `${id}@byu.edu`,
    created: new Date().toISOString(),
    apiKey: randomUserId(),
  };
  await DB.addVendor(vendor);
  return getVendor(vendor.apiKey);
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
