const express = require('express');
const DB = require('../database/database');
const { adminAuth, asyncHandler } = require('./routerUtil');

const adminRouter = express.Router();

adminRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/admin/vendors',
    requiresAuth: true,
    description: 'Gets all the vendors',
    example: `curl -X GET $host/api/admin/vendors -H 'authorization: Bearer adminAuthToken'`,
    response: [
      {
        id: 'byustudent27',
        apiKey: 'abcxyz',
        name: 'cs student',
        created: '2024-06-14T16:43:23.754Z',
        validUntil: '2024-12-14T16:43:23.754Z',
      },
    ],
  },
  {
    method: 'PUT',
    path: '/api/admin/vendor',
    requiresAuth: true,
    description: 'Update a vendor',
    example: `curl -X PUT $host/api/admin/vendor -H 'authorization: Bearer adminAuthToken'  -H 'Content-Type:application/json' -d '{"id":"xyz", "roles":["admin"]}'`,
    response: [
      {
        id: 'byustudent27',
        apiKey: 'abcxyz',
        name: 'cs student',
        created: '2024-06-14T16:43:23.754Z',
        validUntil: '2024-12-14T16:43:23.754Z',
        roles: ['admin', 'vendor'],
      },
    ],
  },
];

// get vendors
adminRouter.get(
  '/vendors',
  adminAuth,
  asyncHandler(async (req, res) => {
    const vendors = await DB.getVendors();
    res.json(vendors);
  })
);

// update vendor
adminRouter.put(
  '/vendor',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { id, roles } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Missing required parameter' });
    }
    if (roles) {
      DB.assignRole(id, 'admin', roles.includes('admin'));
    }
    const vendor = await DB.getVendorByNetId(id);
    res.send(vendor);
  })
);

module.exports = adminRouter;
