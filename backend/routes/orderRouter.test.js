const request = require('supertest');
const app = require('../service');
const orderRouter = require('./orderRouter');
const DB = require('../database/database.js');
const { createOrder, createVendor, updateVendor } = require('./testUtil.js');

let adminAuthToken = null;
let vendorApiKey = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
  [, vendorApiKey] = await createVendor(adminAuthToken);
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
});

test('create order', async () => {
  const [status, order] = await createOrder(vendorApiKey);
  expect(status).toBe(200);
  expect(order.jwt).toBeDefined();
});

test('create order missing diner', async () => {
  const [status] = await createOrder(vendorApiKey, { order: { items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }], storeId: '5', franchiseId: 4, id: 278 } });
  expect(status).toBe(400);
});

test('create order no items', async () => {
  const order = { diner: { id: 719, name: 'j', email: 'j@jwt.com' }, order: { items: [], storeId: '5', franchiseId: 4, id: 278 } };
  try {
    orderRouter.settings.orderDelay = 1;
    const createOrderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${vendorApiKey}`).send(order);

    expect(createOrderRes.status).toBe(503);
    expect(createOrderRes.body.message).toBe('Unable to satisfy pizza order. The oven is full.');
  } finally {
    orderRouter.settings.orderDelay = 32000;
  }
});

test('create order with chaos badjwt', async () => {
  try {
    const [, vendor] = await updateVendor(adminAuthToken, vendorApiKey, { chaos: { type: 'badjwt', resolveUrl: 'http://resolve.me' } });
    const [status, body] = await createOrder(vendorApiKey);

    expect(status).toBe(200);
    expect(body.jwt).toMatch(/^dead.*/);
    expect(body.reportUrl).toEqual(`http://resolve.me?apiKey=${vendorApiKey}&fixCode=${vendor.chaos.fixCode}`);
  } finally {
    await updateVendor(adminAuthToken, vendorApiKey, { chaos: null });
  }
});

test('create order with chaos throttle', async () => {
  try {
    orderRouter.settings.orderDelay = 1;
    const [, vendor] = await updateVendor(adminAuthToken, vendorApiKey, { chaos: { type: 'throttle', resolveUrl: 'http://resolve.me' } });
    const [status, body] = await createOrder(vendorApiKey);

    expect(status).toBe(200);
    expect(body.reportUrl).toEqual(`http://resolve.me?apiKey=${vendorApiKey}&fixCode=${vendor.chaos.fixCode}`);
  } finally {
    orderRouter.settings.orderDelay = 32000;
    await updateVendor(adminAuthToken, vendorApiKey, { chaos: null });
  }
});

test('create order with chaos failure', async () => {
  try {
    const [, vendor] = await updateVendor(adminAuthToken, vendorApiKey, { chaos: { type: 'fail', resolveUrl: 'http://resolve.me' } });
    const [status, body] = await createOrder(vendorApiKey);

    expect(status).toBe(500);
    expect(body.message).toBe('chaos monkey');
    expect(body.reportUrl).toEqual(`http://resolve.me?apiKey=${vendorApiKey}&fixCode=${vendor.chaos.fixCode}`);
  } finally {
    await updateVendor(adminAuthToken, vendorApiKey, { chaos: null });
  }
});

test('verify order', async () => {
  const [, order] = await createOrder(vendorApiKey);
  const verifyOrderRes = await request(app).post('/api/order/verify').send({ jwt: order.jwt });
  expect(verifyOrderRes.status).toBe(200);
  expect(verifyOrderRes.body.message).toBe('valid');
});

test('verify order bad jwt', async () => {
  const verifyOrderRes = await request(app).post('/api/order/verify').send({ jwt: 'badjwt' });
  expect(verifyOrderRes.status).toBe(403);
  expect(verifyOrderRes.body.message).toBe('invalid');
});
