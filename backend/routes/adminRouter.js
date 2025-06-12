const express = require('express');
const DB = require('../database/database');
const { greateVendor, asyncHandler } = require('./routerUtil');

const adminRouter = express.Router();

adminRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/admin/vendor',
    requiresAuth: true,
    deprecated: true,
    description: 'Add a new vendor',
    example: `curl -X POST $host/api/admin/vendor -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"id":"byustudent27", "name":"cs student"}'`,
    response: {
      id: 'byustudent27',
      apiKey: 'abcxyz',
      name: 'cs student',
      created: '2024-06-14T16:43:23.754Z',
      validUntil: '2024-12-14T16:43:23.754Z',
    },
  },
  {
    method: 'PUT',
    path: '/api/admin/vendor/:vendorToken',
    requiresAuth: true,
    deprecated: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST $host/api/admin/vendor/111111 -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"chaos":{"type":"throttle", "resolveUrl":"http://resolve.me"}}'`,
    response: {
      id: 'byustudent27',
      name: 'cs student',
      website: 'pizza.byucsstudent.click',
      chaos: 'fail',
    },
  },
];

const authorizeAdmin = asyncHandler(async (req, res, next) => {
  const authToken = (req.headers.authorization || '').replace(/bearer /i, '');
  if (await DB.verifyAuthToken(authToken)) {
    next();
  } else {
    res.status(401).json({ message: 'invalid authentication' });
  }
});

// create a new vendor - depredated
adminRouter.post(
  '/vendor',
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const vendor = req.body;
    if (!vendor.id) {
      res.status(400).json({ message: 'Missing param. Must have ID' });
    } else {
      res.json(await greateVendor(vendor));
    }
  })
);

// update a vendor - deprecated
adminRouter.put(
  '/vendor/:vendorToken',
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const changes = req.body;
    const vendor = await DB.updateVendorByApiKey(req.params.vendorToken, changes);
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ message: 'Unknown vendor' });
    }
  })
);

module.exports = adminRouter;
