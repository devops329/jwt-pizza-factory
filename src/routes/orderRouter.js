import express from 'express';
import jose from 'node-jose';
import { keys } from '../keys.js';
import config from '../config.js';

const orderRouter = express.Router();

orderRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/order',
    requiresAuth: true,
    description: 'Create a JWT pizza',
    example: `curl -X POST localhost:3000/api/order -H 'authorization: Bearer a42nkl3fdsfagfdagnvcaklfdsafdsa9' -d '{"diner": {"name":"joe"}, "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'`,
  },
  {
    method: 'POST',
    path: '/api/order/verify',
    requiresAuth: true,
    description: 'Verifies a pizza order',
    example: `curl -X POST localhost:3000/api/order/verify -d '{"jwt":"JWT here"}' -H 'Content-Type: application/json'`,
  },
  {
    method: 'GET',
    path: '/.well-known/jwks.json',
    requiresAuth: true,
    description: 'Get the JSON Web Key Set (JWKS) for independent JWT verification',
    example: `curl -X POST localhost:3000/.well-known/jwks.json`,
  },
];

const getAuthorizationInfo = (req, res, next) => {
  const factoryAuth = config.apiKeys[(req.headers.authorization || '').replace(/bearer /i, '')];
  if (factoryAuth) {
    req.factoryAuth = factoryAuth;
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
  const payload = { vendor: req.factoryAuth, diner, order };
  const options = {
    alg: 'HS256',
    format: 'compact',
    fields: {
      iat: nowSecs,
      exp: nowSecs + 24 * 60 * 60,
      iss: 'cs329.click',
    },
  };
  console.log('payload:', JSON.stringify(payload));
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
