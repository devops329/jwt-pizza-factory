const express = require('express');
const DB = require('../database/database');
const { v4: uuid } = require('uuid');

const adminRouter = express.Router();

adminRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/admin/vendor',
    requiresAuth: true,
    description: 'Add a new vendor',
    example: `curl -X POST $host/api/admin/vendor -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{"id":"byustudent27", "name":"cs student"}'`,
    response: {
      apiKey: 'abcxyz',
      vendor: {
        id: 'byustudent27',
        name: 'cs student',
        created: '2024-06-14T16:43:23.754Z',
        validUntil: '2024-12-14T16:43:23.754Z',
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/admin/vendor/:vendorToken',
    requiresAuth: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST $host/api/admin/vendor/111111 -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{"chaos":{"type":"throttle", "resolveUrl":"http://resolve.me"}}'`,
    response: {
      vendor: {
        id: 'byustudent27',
        name: 'cs student',
        website: 'pizza.byucsstudent.click',
        chaos: 'fail',
      },
    },
  },
];

const getAuthorizationInfo = async (req, res, next) => {
  const authToken = (req.headers.authorization || '').replace(/bearer /i, '');
  if (await DB.verifyAuthToken(authToken)) {
    next();
  } else {
    res.status(401).json({ message: 'invalid authentication' });
  }
};

// create a new vendor
adminRouter.post('/vendor', getAuthorizationInfo, async (req, res) => {
  const vendor = req.body;
  if (vendor.id) {
    const existingApiKey = await DB.getApiKeyByNetId(vendor.id);
    if (existingApiKey) {
      return res.json({ apiKey: existingApiKey, vendor: vendor });
    } else if (vendor.name) {
      const now = new Date();
      vendor.created = now.toISOString();
      now.setMonth(now.getMonth() + 6);
      vendor.validUntil = now.toISOString();
      const apiKey = uuid().replace(/-/g, '');

      await DB.addVendor(apiKey, vendor.id, vendor);

      res.json({ apiKey, vendor: vendor });
    }
  }
  if (!(vendor.id && vendor.name)) res.status(400).json({ message: 'Missing param. Must have id and name' });
});

// update a vendor
adminRouter.put('/vendor/:vendorToken', getAuthorizationInfo, async (req, res) => {
  const changes = req.body;
  const vendor = await DB.updateVendor(req.params.vendorToken, changes);
  if (vendor) {
    res.json({ vendor: vendor });
  } else {
    res.status(404).json({ message: 'Unknown vendor' });
  }
});

module.exports = adminRouter;
