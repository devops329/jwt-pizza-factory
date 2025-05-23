const request = require('supertest');
const app = require('./service');
const DB = require('./database/database.js');

beforeAll(async () => {
  const connection = await DB.getConnection();
  connection.end();
});

test('docs', async () => {
  const docsRes = await request(app).get('/api/docs');
  expect(docsRes.status).toBe(200);
  expect(docsRes.body).toMatchObject({
    message: 'welcome to JWT Pizza Factory',
    version: expect.any(String),
    endpoints: expect.arrayContaining([
      expect.objectContaining({
        method: expect.any(String),
        path: expect.any(String),
        description: expect.any(String),
        example: expect.any(String),
      }),
    ]),
  });
});

test('jwt key set', async () => {
  const jwksRes = await request(app).get('/.well-known/jwks.json');
  expect(jwksRes.status).toBe(200);
  expect(jwksRes.body).toMatchObject({
    keys: expect.arrayContaining([
      expect.objectContaining({
        kty: 'RSA',
        kid: expect.any(String),
        n: expect.any(String),
        e: expect.any(String),
      }),
    ]),
  });
});

test('endpoint unknown', async () => {
  const unknownRes = await request(app).get('/cow');
  expect(unknownRes.status).toBe(404);
  expect(unknownRes.body).toMatchObject({
    message: 'unknown endpoint',
  });
});
