const DB = require('../database/database');
const { v4: uuid } = require('uuid');

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const vendorAuth = asyncHandler(async (req, res, next) => {
  req.apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  const vendor = await DB.getVendorByApiKey(req.apiKey);
  if (vendor) {
    req.vendor = vendor;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
});

async function greateVendor(vendorId) {
  const existingVendor = await DB.getVendorByNetId(vendorId || '');
  if (existingVendor) {
    return existingVendor;
  } else {
    const now = new Date();
    const vendor = {
      id: vendorId,
      created: now.toISOString(),
      apiKey: uuid().replace(/-/g, ''),
      email: `${vendorId}@byu.edu`,
    };

    await DB.addVendor(vendor);

    return vendor;
  }
}

module.exports = { vendorAuth, greateVendor, asyncHandler };
