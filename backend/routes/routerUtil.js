const DB = require('../database/database');

const vendorInfo = async (req, res, next) => {
  req.apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  const vendor = await DB.getVendorByApiKey(req.apiKey);
  if (vendor) {
    req.vendor = vendor;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

module.exports = { vendorInfo };
