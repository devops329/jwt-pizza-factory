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

module.exports = adminRouter;
