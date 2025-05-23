const express = require('express');
const DB = require('../database/database');
const { vendorInfo } = require('./routerUtil');

const vendorRouter = express.Router();

vendorRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Gets vendor information',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json'`,
    response: {
      id: 'byustudent27',
      name: 'cs student',
      apiKey: 'abcxyz',
    },
  },
];

// get vendor
vendorRouter.get('/', vendorInfo, async (req, res) => {
  res.json({ name: 'joe', netId: '3', apiKey: 'xxx' });
});

module.exports = vendorRouter;
