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
  req.apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  const vendor = await DB.getVendor(req.apiKey);
  if (vendor) {
    req.vendor = vendor;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

const injectChaos = async (req, res, next) => {
  if (req.vendor.chaos && req.vendor.chaos.type !== 'none') {
    const reportUrl = `${req.protocol}://${req.hostname}/api/support/${req.apiKey}/report/${req.vendor.chaos.fixCode}`;
    switch (req.vendor.chaos.type) {
      case 'badjwt':
        res.json({
          jwt: 'xedead6MTcb33f3ODgzOTgsImV4cCI6MTcxNzg3NDc5OCwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ0YWNvTGVlIiwibmFtZSI6IlRlc3QgdmVuZG9yIiwiY2hhb3MiOiJ0aHJvdHRsZSJ9LCJkaW5lciI6eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIn0sIm9yZGVyIjp7ImZyYW5jaGlzZUlkIjoxLCJzdG9yZUlkIjoxLCJpdGVtcyI6W3sibWVudUlkIjoxLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjA1fV0sImlkIjoyMTI2fX0.uFu8dJZ7hpW-XiHTatzFqERAdjRBVKuHFr1ZzrvqBGXO6YN5ZG_QDeEttjJrGmUxTCwuNtoar-O1ccWQl5_bbdKSgHROdam8Wcz3kgj-TiV4EWDJMOxkNFBqTKWlXmzYgZeazDwpxImE1MfjV3oXHpkaM9_lStnT2Cgw1GDwz5MG5zXtGvQWp_8vfXt2cSccrX7ph8Eqm-7vW7dbZ-auUciO-qmUoEE_lbBhlcWjrajp0rzn-ZvDH4GjyG4liDrVpoafVqwdSASbBO-t1l_xc2YDCdLBvtCFhf6ZafM6IOOP1xCFigsV6LXY0g3nPfVmBsnEE9p935cCrNwk650B5HhwlzlGZEaNxFhe5s1P-cSNJ-panpLTRwg9b-To0MV2qHJcWARA3Z8B-v2dm73aXoEaATGAiPC3-W1MuMsX3hJDcge8hIsp91xC0-9aOrAOmCSv-zSykTtq6YoG95XRRB87Wq8nD7Ykm1JNC27pv0QFWXkkVvXHUTNcJcUE3VeVesLPks2AfInulzbArbNsYnoAqdr42x4Hw3Y54dy1FFLf1JObAqwD6cZR57Q7zOwLX7AwK8S3hMOMTlwWz1sajXD7umCxVORZ3Gl6B1ubEt66u394Ws9g76FA_2AR5-PdJgf6zBDnXxe81lBCrHjvN7RM4N6iIzPhcTfvTqbeef4',
          reportUrl,
        });
        return;
      case 'throttle':
        await new Promise((resolve) => setTimeout(resolve, 32000));
        req.reportUrl = reportUrl;
        next();
        return;
      case 'fail':
        return res.status(500).json({ message: 'chaos monkey', reportUrl });
    }
  }
  next();
};

// create a JWT order
orderRouter.post('/', getAuthorizationInfo, injectChaos, (req, res) => {
  const { diner, order } = req.body;
  if (!diner || !order) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = { vendor: { id: req.vendor.id, name: req.vendor.name }, diner, order };
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
      res.json({ jwt, reportUrl: req.reportUrl });
    })
    .catch(() => {
      res.status(500).json({ message: 'unable to process order' });
    });
});

// verify a JWT order
orderRouter.post('/verify', (req, res) => {
  const jwt = req.body.jwt;

  try {
    jose.JWS.createVerify(keys.privateKey)
      .verify(jwt)
      .then((r) => {
        const payload = JSON.parse(r.payload.toString());
        res.status(200).json({ message: 'valid', payload: payload });
      })
      .catch(() => {
        res.status(403).json({ message: 'invalid' });
      });
  } catch (e) {
    res.status(403).json({ message: 'invalid' });
  }
});

export default orderRouter;
