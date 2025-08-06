const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');
const { createVendor, getVendor } = require('./testUtil.js');

let admin = null;
beforeAll(async () => {
  admin = await createVendor();
  DB.assignRole(admin.id, 'admin', true);
});

afterAll(async () => {
  await DB.deleteVendor(admin.id);
});

test('admin exists', async () => {
  const result = await DB.getVendorByNetId(admin.id);
  expect(result).toBeDefined();
  expect(result.id).toBe(admin.id);
  expect(result.roles).toContain('admin');
  expect(result.roles).toContain('vendor');
});

test('update to admin', async () => {
  const vendor = await createVendor();
  try {
    expect(vendor.roles).toEqual(['vendor']);

    const updateRes = await request(app)
      .put('/api/admin/role')
      .set('Authorization', `Bearer ${admin.apiKey}`)
      .send({ id: vendor.id, roles: ['vendor', 'admin'] });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.roles).toEqual(expect.arrayContaining(['vendor', 'admin']));

    const getRes = await getVendor(vendor.apiKey);
    expect(getRes.roles).toEqual(expect.arrayContaining(['vendor', 'admin']));
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('update bad params', async () => {
  const updateRes = await request(app)
    .put('/api/admin/role')
    .set('Authorization', `Bearer ${admin.apiKey}`)
    .send({ roles: ['vendor', 'admin'] });
  expect(updateRes.status).toBe(400);
});

test('get vendors', async () => {
  const getVendorsRes = await request(app).get('/api/admin/vendors').set('Authorization', `Bearer ${admin.apiKey}`);
  expect(getVendorsRes.status).toBe(200);
  expect(getVendorsRes.body).toBeDefined();
  expect(Array.isArray(getVendorsRes.body)).toBe(true);
  expect(getVendorsRes.body.length).toBeGreaterThan(0);
  getVendorsRes.body.forEach((vendor) => {
    expect(vendor).toHaveProperty('id');
    expect(vendor).toHaveProperty('name');
  });
});

test('delete vendor all', async () => {
  const vendor = await createVendor();
  try {
    const deleteRes = await request(app).delete(`/api/admin/vendor`).set('Authorization', `Bearer ${admin.apiKey}`).send({ id: vendor.id, deleteType: 'all' });
    expect(deleteRes.status).toBe(204);

    const getRes = await getVendor(vendor.apiKey);
    expect(getRes.message).toBe('invalid authentication');
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('delete vendor chaos', async () => {
  const vendor = await createVendor();
  try {
    const chaosResp = await request(app).put(`/api/vendor/chaos/badjwt`).set('Authorization', `Bearer ${vendor.apiKey}`).send({});
    expect(chaosResp.status).toBe(200);

    const getRes1 = await getVendor(vendor.apiKey);
    expect(getRes1.chaos.type).toBe('badjwt');

    const deleteRes = await request(app).delete(`/api/admin/vendor`).set('Authorization', `Bearer ${admin.apiKey}`).send({ id: vendor.id, deleteType: 'chaos' });
    expect(deleteRes.status).toBe(204);

    const getRes2 = await getVendor(vendor.apiKey);
    expect(getRes2.chaos).not.toBeDefined();
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('delete vendor connection', async () => {
  const vendor = await createVendor();
  try {
    await request(app).post(`/api/vendor/connect`).set('Authorization', `Bearer ${vendor.apiKey}`).send({ purpose: 'test' });

    const getRes1 = await getVendor(vendor.apiKey);
    expect(getRes1.connections.test.purpose).toBe('test');

    const deleteRes = await request(app).delete(`/api/admin/vendor`).set('Authorization', `Bearer ${admin.apiKey}`).send({ id: vendor.id, deleteType: 'connection', purpose: 'test' });
    expect(deleteRes.status).toBe(204);

    const getRes2 = await getVendor(vendor.apiKey);
    expect(getRes2.connections.test).not.toBeDefined();
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});
