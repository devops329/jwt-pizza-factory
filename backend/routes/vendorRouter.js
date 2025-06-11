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
  {
    method: 'PUT',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"gitHubUrl":"https://github.com/byustudent23"}'`,
    response: {
      id: 'byustudent23',
      name: 'cs student',
      gitHubUrl: 'https://github.com/byustudent23',
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
      subject: 'BYU CS 329 JWT Pizza Factory',
      html: `<html><body><h1>Hello ${id}</h1><p>Here is the code that you requested: <b>${code}</b>. Best regards, the CS 329 Team. <i>This message was sent by BYU CS 329. For questions, contact help@cs329.click.</i></body></html>`,
      text: `Hello ${id}! Here is the code that you requested: ${code}. Best regards, the CS 329 Team. This message was sent by BYU CS 329. For questions, contact help@cs329.click.`,
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

// update a vendor
vendorRouter.put(
  '/',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const changes = {};
    const allowedFields = ['gitHubUrl', 'name', 'website'];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        changes[key] = req.body[key];
      }
    });
    const vendor = await DB.updateVendor(req.apiKey, changes);
    res.json(vendor);
  })
);

module.exports = vendorRouter;
