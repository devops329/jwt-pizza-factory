import express from 'express';
import DB from '../database/database.js';

const logRouter = express.Router();

let logRes = 'Log Received';

logRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/log',
    requiresAuth: false,
    description: 'Report a problem',
    example: `curl -X POST $host/api/log -H 'Content-Type:application/json' -d '{"message": "Log Response"}'`,
    response: 'Message',
  },
  {
    method: 'PUT',
    path: '/api/log/update',
    requiresAuth: true,
    description: 'Update the log response',
    example: `curl -X PUT $host/api/log -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{"message": "Updated Log Response"}'`,
    response: 'Updated Log Response',
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

logRouter.put('/update', getAuthorizationInfo, (req, res) => {
  const resMessage = req.body.message;
  logRes = resMessage;
  res.send(logRes);
});

logRouter.post('/', (req, res) => {
  // TODO: Do something with the log
  res.send(logRes);
});

export default logRouter;
