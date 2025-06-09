const DB = require('../database/database');
const { v4: uuid } = require('uuid');

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

async function createVendor(vendor) {
  if (!vendor || !vendor.id) {
    throw new Error('Missing vendor ID');
  }
  const existingApiKey = await DB.getApiKeyByNetId(vendor.id || '');
  if (existingApiKey) {
    return { apiKey: existingApiKey, vendor };
  } else {
    const now = new Date();
    vendor.created = now.toISOString();
    now.setMonth(now.getMonth() + 6);
    vendor.validUntil = now.toISOString();
    const apiKey = uuid().replace(/-/g, '');

    await DB.addVendor(apiKey, vendor.id, vendor);

    return { apiKey, vendor };
  }
}

module.exports = { vendorInfo, createVendor };
