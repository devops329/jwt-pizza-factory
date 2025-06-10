const express = require('express');
const DB = require('../database/database');
const { greateVendor, vendorAuth, asyncHandler } = require('./routerUtil');

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
    requiresAuth: false,
    description: 'Send authorization code email',
    example: `curl -X POST $host/api/vendor/code  -d '{"id":"test3"}' -H 'Content-Type: application/json'`,
    response: {
      message: 'Code sent to test3.byu.edu',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/auth',
    requiresAuth: false,
    description: 'Authorize vendor using the code sent to email',
    example: `curl -X POST $host/api/vendor  -d '{"id":"test3", "code":"1234"}' -H 'Content-Type:application/json'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
    },
  },
];

// get vendor
vendorRouter.get('/', vendorAuth, (req, res) => {
  res.json(req.vendor);
});

// create authorization code email
vendorRouter.post(
  '/code',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const email = `${id}@byu.edu`;
    const code = Math.random().toString(36).substring(2, 10);
    await DB.addAuthCode(id, code);
    await req.services.sendEmail({
      to: email,
      subject: 'JWT Pizza Factory Authorization Code',
      html: `<p>Your authorization code is <b>${code}</b>. Use this code to authenticate.</p>`,
    });
    res.json({ message: `Code sent to ${email}` });
  })
);

// create vendor authorization based on the provided code
vendorRouter.post(
  '/auth',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const code = req.body.code;
    if (await DB.validateAuthCode(id, code)) {
      const vendor = await greateVendor({ id });
      res.json(vendor);
    } else {
      return res.status(401).json({ message: 'Invalid code' });
    }
  })
);

module.exports = vendorRouter;
