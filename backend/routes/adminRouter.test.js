const request = require('supertest');
const app = require('../service');
const DB = require('../database/database.js');
const { createVendor, getVendor } = require('./testUtil.js');

test('admin exists', async () => {
  const vendor = await DB.getVendorByNetId('admin');
  expect(vendor).toBeDefined();
  expect(vendor.id).toBe('admin');
  expect(vendor.roles).toContain('admin');
  expect(vendor.roles).toContain('vendor');
});

test('vendor default role', async () => {
  const vendor = await createVendor();
  expect(vendor.roles).toEqual(['vendor']);

  const result = await getVendor(vendor.apiKey);
  expect(result.roles).toEqual(['vendor']);
});

test('get vendors', async () => {
  const admin = await DB.getVendorByNetId('admin');
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
