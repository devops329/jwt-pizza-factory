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
