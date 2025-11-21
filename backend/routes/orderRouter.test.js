const request = require('supertest');
const app = require('../service');
const orderRouter = require('./orderRouter');
const DB = require('../database/database.js');
const { createOrder, createVendor, getVendor, updateVendorChaos } = require('./testUtil.js');

let vendor = null;
beforeAll(async () => {
  vendor = await createVendor();
});

afterAll(async () => {
  await DB.deleteVendor(vendor.id);
});

test('create order', async () => {
  const [status, order] = await createOrder(vendor.apiKey);
  expect(status).toBe(200);
  expect(order.jwt).toBeDefined();
});

test('create order missing diner', async () => {
  const [status] = await createOrder(vendor.apiKey, { order: { items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }], storeId: '5', franchiseId: 4, id: 278 } });
  expect(status).toBe(400);
});

test('create order no items', async () => {
  const order = { diner: { id: 719, name: 'j', email: 'j@jwt.com' }, order: { items: [], storeId: '5', franchiseId: 4, id: 278 } };
  try {
    orderRouter.settings.orderDelay = 1;
    const createOrderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${vendor.apiKey}`).send(order);

    expect(createOrderRes.status).toBe(503);
    expect(createOrderRes.body.message).toBe('Unable to satisfy pizza order. The oven is full.');
  } finally {
    orderRouter.settings.orderDelay = 32000;
  }
});

test('create order with chaos badjwt', async () => {
  const chaosResp = await request(app).put(`/api/vendor/chaos/badjwt`).set('Authorization', `Bearer ${vendor.apiKey}`).send({});
  expect(chaosResp.status).toBe(200);

  const [statusBefore, bodyBefore] = await createOrder(vendor.apiKey);
  expect(statusBefore).toBe(200);
  expect(bodyBefore.jwt).not.toMatch(/^dead.*/);

  const chaos = await DB.getChaosByNetId(vendor.id);
  expect(chaos.type).toBe('badjwt');
  expect(new Date(chaos.startDate).getTime()).toBeGreaterThan(new Date(chaos.initiatedDate).getTime());

  await updateVendorChaos(vendor.id, { ...chaos, startDate: chaos.initiatedDate });
  const [statusAfter, bodyAfter] = await createOrder(vendor.apiKey);
  expect(bodyAfter.jwt).toMatch(/^dead.*/);
  expect(statusAfter).toBe(200);
  expect(bodyAfter.reportUrl).toContain(`api/support/${vendor.apiKey}/report/`);
  await request(app).get(new URL(bodyAfter.reportUrl).pathname);

  const chaosAfter = await DB.getChaosByNetId(vendor.id);
  expect(chaosAfter.type).toBe('none');
});

test('create order with chaos throttle', async () => {
  try {
    orderRouter.settings.orderDelay = 1;
    await request(app).put(`/api/vendor/chaos/throttle`).set('Authorization', `Bearer ${vendor.apiKey}`).send({});
    const [statusBefore, bodyBefore] = await createOrder(vendor.apiKey);
    expect(statusBefore).toBe(200);
    expect(bodyBefore.reportUrl).toBeUndefined();

    const chaos = await DB.getChaosByNetId(vendor.id);
    expect(chaos.type).toBe('throttle');
    expect(new Date(chaos.startDate).getTime()).toBeGreaterThan(new Date(chaos.initiatedDate).getTime());

    await updateVendorChaos(vendor.id, { ...chaos, startDate: chaos.initiatedDate });
    const [statusAfter, bodyAfter] = await createOrder(vendor.apiKey);
    expect(statusAfter).toBe(200);
    expect(bodyAfter.reportUrl).toContain(`api/support/${vendor.apiKey}/report/`);

    await request(app).get(new URL(bodyAfter.reportUrl).pathname);

    const chaosAfter = await DB.getChaosByNetId(vendor.id);
    expect(chaosAfter.type).toBe('none');
  } finally {
    orderRouter.settings.orderDelay = 32000;
  }
});

test('create order with chaos failure', async () => {
  await request(app).put(`/api/vendor/chaos/fail`).set('Authorization', `Bearer ${vendor.apiKey}`).send({});
  const [statusOk] = await createOrder(vendor.apiKey);
  expect(statusOk).toBe(200);

  const chaos = await DB.getChaosByNetId(vendor.id);
  expect(chaos.type).toBe('fail');
  expect(new Date(chaos.startDate).getTime()).toBeGreaterThan(new Date(chaos.initiatedDate).getTime());

  await updateVendorChaos(vendor.id, { ...chaos, startDate: chaos.initiatedDate });
  const [status, body] = await createOrder(vendor.apiKey);

  expect(status).toBe(500);
  expect(body.message).toBe('chaos monkey');
  expect(body.reportUrl).toContain(`api/support/${vendor.apiKey}/report/`);
  await request(app).get(new URL(body.reportUrl).pathname);

  const chaosAfter = await DB.getChaosByNetId(vendor.id);
  expect(chaosAfter.type).toBe('none');
});

test('verify order', async () => {
  const [, order] = await createOrder(vendor.apiKey);
  const verifyOrderRes = await request(app).post('/api/order/verify').send({ jwt: order.jwt });
  expect(verifyOrderRes.status).toBe(200);
  expect(verifyOrderRes.body.message).toBe('valid');
});

test('verify order bad jwt', async () => {
  const verifyOrderRes = await request(app).post('/api/order/verify').send({ jwt: 'badjwt' });
  expect(verifyOrderRes.status).toBe(403);
  expect(verifyOrderRes.body.message).toBe('invalid');
});
