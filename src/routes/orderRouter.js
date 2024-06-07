import express from 'express';
import jose from 'node-jose';
import { keys } from '../keys.js';
import DB from '../database/database.js';

const orderRouter = express.Router();

orderRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/order',
    requiresAuth: true,
    description: 'Create a JWT pizza',
    example: `curl -X POST localhost:3000/api/order -H 'authorization: Bearer a42nkl3fdsfagfdagnvcaklfdsafdsa9' -d '{"diner": {"name":"joe"}, "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'`,
    response: {
      jwt: 'JWT here',
    },
  },
  {
    method: 'POST',
    path: '/api/order/verify',
    requiresAuth: true,
    description: 'Verifies a pizza order',
    example: `curl -X POST localhost:3000/api/order/verify -d '{"jwt":"JWT here"}' -H 'Content-Type: application/json'`,
    response: {
      message: 'valid',
      payload: {
        vendor: { id: 'student-netid', name: 'Student Name', created: '2024-06-01T00:00:00Z', validUntil: '2025-12-31T23:59:59Z' },
        diner: { name: 'joe' },
        order: { pizzas: ['pep', 'cheese'] },
      },
    },
  },
  {
    method: 'GET',
    path: '/.well-known/jwks.json',
    requiresAuth: false,
    description: 'Get the JSON Web Key Set (JWKS) for independent JWT verification',
    example: `curl -X POST localhost:3000/.well-known/jwks.json`,
    response: {
      keys: [
        {
          kty: 'RSA',
          kid: 'KID here',
          n: 'Key value here',
          e: 'AQAB',
        },
      ],
    },
  },
];

const getAuthorizationInfo = async (req, res, next) => {
  const apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  const vendor = await DB.getVendor(apiKey);
  if (vendor) {
    req.vendor = vendor;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

// create a JWT order
orderRouter.post('/', getAuthorizationInfo, (req, res) => {
  const { diner, order } = req.body;
  if (!diner || !order) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = { vendor: req.vendor, diner, order };
  const options = {
    alg: 'HS256',
    format: 'compact',
    fields: {
      iat: nowSecs,
      exp: nowSecs + 24 * 60 * 60,
      iss: 'cs329.click',
    },
  };
  jose.JWS.createSign(options, keys.privateKey)
    .update(Buffer.from(JSON.stringify(payload), 'utf8'))
    .final()
    .then((jwt) => {
      res.json({ jwt });
    })
    .catch(() => {
      res.status(500).json({ message: 'unable to process order' });
    });
});

// verify a JWT order
orderRouter.post('/verify', (req, res) => {
  const jwt = req.body.jwt;

  jose.JWS.createVerify(keys.privateKey)
    .verify(jwt)
    .then((r) => {
      const payload = JSON.parse(r.payload.toString());
      res.status(200).json({ message: 'valid', payload: payload });
    })
    .catch(() => {
      res.status(403).json({ message: 'invalid' });
    });
});

export default orderRouter;
