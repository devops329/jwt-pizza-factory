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
    example: `curl -X POST localhost:3000/api/admin/vendor -H 'authorization: Bearer a42nkl3fdsfagfdagnvcaklfdsafdsa9' -d '{"vendor": {"id":"byustudent27", "name":"cs student"}}' -H 'Content-Type: application/json'`,
    response: {
      jwt: 'JWT here',
    },
  },
  {
    method: 'PUT',
    path: '/api/vendor/:apiKey',
    requiresAuth: true,
    description: 'Updates a vendor',
    example: `curl -X POST localhost:3000/api/admin/vendor -H 'authorization: Bearer a42nkl3fdsfagfdagnvcaklfdsafdsa9' -d '{"vendor": {"id":"byustudent27", "name":"cs student", "chaos":"throttle"}}' -H 'Content-Type: application/json'`,
    response: {
      jwt: 'JWT here',
    },
  },
];

const getAuthorizationInfo = async (req, res, next) => {
  const authToken = (req.headers.authorization || '').replace(/bearer /i, '');
  if (await DB.verifyAuthToken(authToken)) {
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

// create a new vendor
adminRouter.post('/vendor', getAuthorizationInfo, async (req, res) => {
  const body = req.body;
  if (body.vendor && body.vendor.id && body.vendor.name) {
    const vendor = body.vendor;
    const now = new Date();
    vendor.created = now.toISOString();
    now.setMonth(now.getMonth() + 6);
    vendor.validUntil = now.toISOString();
    const apiKey = uuid().replace(/-/g, '');

    await DB.addVendor(apiKey, vendor);

    res.json({ apiKey, vendor });
  } else {
    return res.status(400).json({ message: 'missing vendor' });
  }
});

// update a vendor
adminRouter.put('/vendor/:apiKey', getAuthorizationInfo, async (req, res) => {
  const body = req.body;
  if (body.vendor && body.vendor.id && body.vendor.name) {
    const vendor = body.vendor;
    if (await DB.updateVendor(req.params.apiKey, vendor)) {
      res.json({ vendor });
    } else {
      res.status(404).json({ message: 'Unknown vendor' });
    }
  } else {
    return res.status(400).json({ message: 'missing vendor' });
  }
});

export default adminRouter;
