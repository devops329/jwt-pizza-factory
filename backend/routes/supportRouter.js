const express = require('express');
const DB = require('../database/database.js');
const { asyncHandler } = require('./routerUtil.js');
const trafficGenerator = require('./trafficGenerator.js');

const supportRouter = express.Router();

supportRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/support/:vendorToken/report/:fixCode',
    requiresAuth: false,
    description: 'Report a problem',
    example: `curl -X POST $host/api/support/abcxyz/report/123`,
    response: {
      message: 'ticket status',
    },
  },
];

// Report a problem
supportRouter.get(
  '/:vendorToken/report/:fixCode',
  asyncHandler(async (req, res) => {
    const vendor = await DB.getVendorByApiKey(req.params.vendorToken);
    if (vendor && vendor.chaos && req.params.fixCode === vendor.chaos.fixCode) {
      await DB.removeChaos(vendor.id);
      trafficGenerator.stop(vendor);
      res.json({ message: 'Problem resolved. Pizza is back on the menu!' });
    } else {
      return res.status(400).json({ message: 'Problem unresolved' });
    }
  })
);

module.exports = supportRouter;
