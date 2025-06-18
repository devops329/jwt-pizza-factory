const DB = require('../database/database');

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

const adminAuth = asyncHandler(async (req, res, next) => {
  req.apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  const vendor = await DB.getVendorByApiKey(req.apiKey);
  if (vendor && DB.verifyRole(vendor.id, 'admin')) {
    req.vendor = vendor;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
});

module.exports = { adminAuth, vendorAuth, asyncHandler };
