const express = require('express');
const DB = require('../database/database');
const { vendorInfo } = require('./routerUtil');

const vendorRouter = express.Router();

vendorRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Gets vendor information',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer authToken'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/code',
    requiresAuth: true,
    description: 'Send authorization code email',
    example: `curl -X POST $host/api/vendor/code  -d '{"netId":"test3"}' -H 'Content-Type: application/json'`,
    response: {
      message: 'Code sent to test3.byu.edu',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/auth',
    requiresAuth: true,
    description: 'Gets vendor information',
    example: `curl -X POST $host/api/vendor  -d '{"netId":"test3", "code":"1234"}' -H 'Content-Type:application/json'`,
    response: {
      vendor: { id: 'test3', apiKey: 'abcxyz' },
      token: 'xyz',
    },
  },
];

// get vendor
vendorRouter.get('/', vendorInfo, async (req, res) => {
  res.json({ id: 'test3', apiKey: 'xxx' });
});

// create authorization code email
vendorRouter.post('/code', async (req, res) => {
  res.json({ message: 'Authorization code sent to email' });
});

// create vendor authorization based on the provided code
vendorRouter.post('/auth', async (req, res) => {
  req.body.code;
  res.json({ vendor: { id: 'test3', apiKey: 'xxx' }, token: 'xyz' });
});

module.exports = vendorRouter;
