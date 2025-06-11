const request = require('supertest');
const app = require('../service.js');
const { createVendor } = require('./testUtil.js');
const DB = require('../database/database.js');

let adminAuthToken = null;
let vendor = null;
beforeAll(async () => {
  adminAuthToken = await DB.createAdminAuthToken();
  vendor = await createVendor(adminAuthToken);
});

afterAll(async () => {
  await DB.deleteAdminAuthToken(adminAuthToken);
  await DB.deleteVendor(vendor.id);
});

test('Get vendor', async () => {
  const getVendorRes = await request(app).get(`/api/vendor`).set('Authorization', `Bearer ${vendor.apiKey}`);
  expect(getVendorRes.status).toBe(200);
  expect(getVendorRes.body).toMatchObject({ id: vendor.id, apiKey: vendor.apiKey });
});

test('Create vendor with auth code', async () => {
  let code = null;
  const ogSendEmail = app.services.sendEmail;
  try {
    app.services.sendEmail = jest.fn(async ({ to, subject, html, text }) => {
      code = readAuthCode(html);
      return true;
    });

    const id = Math.random().toString(36).substring(2, 10);
    const createAuthCodeRes = await request(app).post(`/api/vendor/code`).send({ id });
    expect(app.services.sendEmail).toHaveBeenCalled();
    expect(createAuthCodeRes.status).toBe(200);
    expect(createAuthCodeRes.body).toMatchObject({ message: `Code sent to ${id + '@byu.edu'}` });

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

test('Login vendor with auth code', async () => {
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

function readAuthCode(html) {
  const codeMatch = html.match(/<strong>(.{8})<\/strong>/);
  return codeMatch ? codeMatch[1] : null;
}
