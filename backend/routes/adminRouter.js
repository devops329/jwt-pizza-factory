const express = require('express');
const DB = require('../database/database');
const { adminAuth, asyncHandler } = require('./routerUtil');
const trafficGenerator = require('../trafficGenerator/trafficGenerator.js');

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
    path: '/api/admin/role',
    requiresAuth: true,
    description: 'Update the role of a vendor',
    example: `curl -X PUT $host/api/admin/role -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"id":"xyz", "roles":["admin"]}'`,
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
  {
    method: 'DELETE',
    path: '/api/admin/vendor',
    requiresAuth: true,
    description: 'Delete a vendor',
    example: `curl -X DELETE $host/api/admin/vendor -H 'authorization: Bearer adminAuthToken'  -H 'Content-Type:application/json' -d '{"id":"xyz", "deleteType":"all"}'`,
    response: [],
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

// update vendor to have the given roles
adminRouter.put(
  '/role',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { id, roles } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Missing required parameter' });
    }
    if (roles) {
      await DB.assignRole(id, 'admin', roles.includes('admin'));
    }
    const vendor = await DB.getVendorByNetId(id);
    res.send(vendor);
  })
);

// delete vendor connection or chaos
adminRouter.delete(
  '/vendor',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { id, deleteType } = req.body;
    if (!id || !deleteType || (deleteType !== 'connection' && deleteType !== 'chaos' && deleteType !== 'all')) {
      return res.status(400).json({ message: 'Missing required parameter' });
    }

    if (deleteType === 'connection') {
      await DB.deleteVendorConnection(id, req.body.purpose);
    } else if (deleteType === 'chaos') {
      await DB.removeChaos(id);
      //trafficGenerator.stop(id);
    } else if (deleteType === 'all') {
      await DB.deleteVendor(id);
    }
    res.status(204).send();
  })
);

module.exports = adminRouter;
