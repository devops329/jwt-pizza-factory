const express = require('express');
const { adminAuth, vendorAuth, asyncHandler } = require('./routerUtil');

const logRouter = express.Router();

let logRes = 'Log received';

logRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/log',
    requiresAuth: false,
    description: 'Log a message',
    example: `curl -X POST $host/api/log -H 'Content-Type:application/json' -d '{"message": "message to log"}'`,
    response: 'Log received',
  },
  {
    method: 'PUT',
    path: '/api/log',
    requiresAuth: true,
    description: 'Update the log response',
    example: `curl -X PUT $host/api/log -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{"message": "Updated Log Response"}'`,
    response: 'Updated Log Response',
  },
];

logRouter.post(
  '/',
  vendorAuth,
  asyncHandler((req, res) => {
    // TODO: Do something with the log
    res.send(logRes);
  })
);

logRouter.put(
  '/',
  adminAuth,
  asyncHandler((req, res) => {
    const resMessage = req.body.message;
    logRes = resMessage;
    res.send(logRes);
  })
);

module.exports = logRouter;
