import express from 'express';
import DB from '../database/database.js';

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
supportRouter.get('/:vendorToken/report/:fixCode', async (req, res) => {
  const vendor = await DB.getVendorByApiKey(req.params.vendorToken);
  if (vendor && vendor.chaos) {
    if (req.params.fixCode === vendor.chaos.fixCode) {
      delete vendor.chaos.fixCode;
      vendor.chaos.fixDate = new Date().toISOString();
      vendor.chaos.type = 'none';
      await DB.updateVendor(req.params.vendorToken, { chaos: vendor.chaos });
    }
    res.json({ message: 'Problem resolved. Pizza is back on the menu!' });
  } else {
    return res.status(400).json({ message: 'Unknown vendor' });
  }
});

export default supportRouter;
