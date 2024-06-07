import express from 'express';
import DB from '../database/database.js';
import { v4 as uuid } from 'uuid';

const adminRouter = express.Router();

adminRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Add a new vendor',
    example: `curl -X POST localhost:3000/api/admin/vendor -H 'authorization: Bearer abcxyz' -d '{"id":"byustudent27", "name":"cs student", "website":"pizza.byucsstudent.click"}' -H 'Content-Type: application/json'`,
    response: {
      vendor: {
        id: 'byustudent27',
        name: 'cs student',
        website: 'pizza.byucsstudent.click',
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/vendor/:vendorToken',
    requiresAuth: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST localhost:3000/api/admin/vendor/111111 -H 'authorization: Bearer abcxyz' -d '{"chaos":{"type":"throttle"}}' -H 'Content-Type: application/json'`,
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
  if (vendor.id && vendor.name && vendor.website) {
    const now = new Date();
    vendor.created = now.toISOString();
    now.setMonth(now.getMonth() + 6);
    vendor.validUntil = now.toISOString();
    const apiKey = uuid().replace(/-/g, '');

    await DB.addVendor(apiKey, vendor);

    res.json({ apiKey, vendor: vendor });
  } else {
    res.status(400).json({ message: 'Missing param. Must have id, name, website' });
  }
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

export default adminRouter;
