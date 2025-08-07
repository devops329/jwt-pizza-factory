const request = require('supertest');
const app = require('../service.js');
const { getVendor, createVendor, randomUserId } = require('./testUtil.js');
const DB = require('../database/database.js');

let vendor = null;
beforeAll(async () => {
  vendor = await createVendor();
});

afterAll(async () => {
  await DB.deleteVendor(vendor.id);
});

test('Get vendor', async () => {
  const getVendorRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`);
  expect(getVendorRes.status).toBe(200);
  expect(getVendorRes.body).toMatchObject({ id: vendor.id, apiKey: vendor.apiKey });
});

test('Vendor exists', async () => {
  const getVendorRes = await request(app).get(`/api/vendor/${vendor.id}`);
  expect(getVendorRes.status).toBe(200);
  expect(getVendorRes.body).toMatchObject({ exists: true });
});

test('Vendor not exists', async () => {
  const getVendorRes = await request(app).get(`/api/vendor/bogus`);
  expect(getVendorRes.status).toBe(200);
  expect(getVendorRes.body).toMatchObject({ exists: false });
});

test('Update vendor', async () => {
  const vendor = await createVendor();
  try {
    const updateRes = await request(app).put(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`).send({ id: vendor.id, name: 'Updated Vendor' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({ id: vendor.id, name: 'Updated Vendor' });
    const updatedVendor = await getVendor(vendor.apiKey);
    expect(updatedVendor.name).toBe('Updated Vendor');
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('Update vendor without id param', async () => {
  const vendor = await createVendor();
  try {
    const updateRes = await request(app).put(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`).send({ name: 'Updated Vendor' });
    expect(updateRes.status).toBe(400);
    expect(updateRes.body).toMatchObject({ message: 'Missing required parameter: id' });
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('Update vendor unknown', async () => {
  const admin = await createVendor();
  await DB.assignRole(admin.id, 'admin', true);
  try {
    const updateRes = await request(app).put(`/api/vendor`).set('Authorization', `Bearer ${admin.apiKey}`).send({ id: 'bogusId', name: 'Updated Vendor' });
    expect(updateRes.status).toBe(404);
  } finally {
    await DB.deleteVendor(admin.id);
  }
});

test('Update other vendor as non-admin', async () => {
  const vendor = await createVendor();
  const otherVendor = await createVendor();
  try {
    const updateRes = await request(app).put(`/api/vendor`).set('Authorization', `Bearer ${otherVendor.apiKey}`).send({ id: vendor.id, name: 'Updated Vendor' });
    expect(updateRes.status).toBe(401);
  } finally {
    await DB.deleteVendor(vendor.id);
    await DB.deleteVendor(otherVendor.id);
  }
});

test('Update other vendor as admin', async () => {
  const vendor = await createVendor();
  const admin = await createVendor();
  await DB.assignRole(admin.id, 'admin', true);
  try {
    const updateRes = await request(app).put(`/api/vendor`).set('Authorization', `Bearer ${admin.apiKey}`).send({ id: vendor.id, name: 'Updated Vendor' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({ id: vendor.id, name: 'Updated Vendor' });
    const updatedVendor = await getVendor(vendor.apiKey);
    expect(updatedVendor.name).toBe('Updated Vendor');
  } finally {
    await DB.deleteVendor(vendor.id);
    await DB.deleteVendor(admin.id);
  }
});

test('vendor default role', async () => {
  const vendor = await createVendor();
  try {
    expect(vendor.roles).toEqual(['vendor']);

    const result = await getVendor(vendor.apiKey);
    expect(result.roles).toEqual(['vendor']);
  } finally {
    await DB.deleteVendor(vendor.id);
  }
});

test('Create vendor with auth code', async () => {
  let code = null;
  const ogSendEmail = app.services.sendEmail;
  try {
    app.services.sendEmail = jest.fn(async ({ to, subject, html, text }) => {
      code = readAuthCode(html);
      return true;
    });

    const id = randomUserId();
    const addVendorRes = await request(app).post(`/api/vendor`).send({ id, email: 'test3@hotmail.com', name: 'Test 3' });
    expect(addVendorRes.status).toBe(200);

    const createAuthCodeRes = await request(app).post(`/api/vendor/code`).send({ id });
    expect(createAuthCodeRes.status).toBe(200);
    expect(createAuthCodeRes.body).toMatchObject({ email: `test3@hotmail.com` });
    expect(app.services.sendEmail).toHaveBeenCalled();

    const loginRes = await request(app).post(`/api/vendor/auth`).send({ id, code });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toMatchObject({ id, apiKey: expect.any(String) });

    const vendor = loginRes.body;
    try {
      const getVendorRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`);
      expect(getVendorRes.status).toBe(200);
      expect(getVendorRes.body).toMatchObject({ id: vendor.id, apiKey: vendor.apiKey });
    } finally {
      await DB.deleteVendor(vendor.id);
    }
  } finally {
    app.services.sendEmail = ogSendEmail;
  }
});

test('Login existing vendor with auth code', async () => {
  let code = null;
  const ogSendEmail = app.services.sendEmail;
  try {
    app.services.sendEmail = jest.fn(async ({ to, subject, html }) => {
      code = readAuthCode(html);
      return true;
    });

    await request(app).post(`/api/vendor/code`).send({ id: vendor.id });
    const loginRes = await request(app).post(`/api/vendor/auth`).send({ id: vendor.id, code });
    expect(loginRes.body).toMatchObject(vendor);
  } finally {
    app.services.sendEmail = ogSendEmail;
  }
});

test('Connect vendors', async () => {
  const vendor1 = await createVendor();
  const vendor2 = await createVendor();
  try {
    const connect1Res = await request(app).post(`/api/vendor/connect`).set('Authorization', `Bearer ${vendor1.apiKey}`).send({ purpose: 'test' });
    expect(connect1Res.status).toBe(200);
    expect(connect1Res.body.connections.test).toMatchObject({ id: null, purpose: 'test' });

    const vendor1Update = await DB.getVendorByApiKey(vendor1.apiKey);
    expect(vendor1Update.connections.test).toMatchObject({ id: null, purpose: 'test' });

    const connect2Res = await request(app).post(`/api/vendor/connect`).set('Authorization', `Bearer ${vendor2.apiKey}`).send({ purpose: 'test' });
    expect(connect2Res.body.connections.test).toMatchObject({ id: vendor1.id, purpose: 'test' });

    const vendor2Update = await DB.getVendorByApiKey(vendor2.apiKey);
    expect(vendor2Update.connections.test).toMatchObject({ id: vendor1.id, purpose: 'test' });
  } finally {
    await DB.deleteVendor(vendor1.id);
    await DB.deleteVendor(vendor2.id);
  }
});

function readAuthCode(html) {
  const codeMatch = html.match(/<strong>(.{8})<\/strong>/);
  return codeMatch ? codeMatch[1] : null;
}
