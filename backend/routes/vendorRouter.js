const express = require('express');
const DB = require('../database/database');
const { vendorAuth, asyncHandler } = require('./routerUtil');
const trafficGenerator = require('./trafficGenerator');
const { v4: uuid } = require('uuid');

const vendorRouter = express.Router();

vendorRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/vendor/:id',
    requiresAuth: false,
    description: 'Check if a vendor exists',
    example: `curl -X GET $host/api/vendor/test3`,
    response: {
      exists: true,
    },
  },
  {
    method: 'GET',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Gets vendor information',
    example: `curl -X GET $host/api/vendor -H 'authorization: Bearer authToken'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor',
    requiresAuth: false,
    description: 'Creates a new vendor. This does not authenticate.',
    example: `curl -X POST $host/api/vendor -H 'Content-Type:application/json' -d '{"id":"test3", "name":"cs student", "gitHubUrl":"https://github.com/test3"}'`,
    response: {
      id: 'test3',
      name: 'cs student',
      gitHubUrl: 'https://github.com/test3',
    },
  },
  {
    method: 'PUT',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"gitHubUrl":"https://github.com/test3"}'`,
    response: {
      id: 'test3',
      name: 'cs student',
      gitHubUrl: 'https://github.com/test3',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/code',
    requiresAuth: false,
    description: 'Send authorization code email',
    example: `curl -X POST $host/api/vendor/code  -d '{"id":"test3"}' -H 'Content-Type: application/json'`,
    response: {
      email: 'test3.byu.edu',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/auth',
    requiresAuth: false,
    description: 'Authorize vendor using the code sent to email',
    example: `curl -X POST $host/api/vendor  -d '{"id":"test3", "code":"1234"}' -H 'Content-Type:application/json'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/connect',
    requiresAuth: true,
    description: 'Connects one vendor to another vendor for a specific purpose. Repeated calls with the same purpose will update the connection if another vendor is available.',
    example: `curl -X POST $host/api/vendor/connect  -d '{"purpose":"penetrationTesting"}' -H 'Content-Type:application/json'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
      connections: {
        penetrationTesting: {
          id: 'connectedVendorId',
          purpose: 'penetration',
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/vendor/chaos/:type',
    requiresAuth: true,
    description: 'Initiate chaos testing for a vendor.',
    example: `curl -X POST $host/api/vendor/chaos/fail -H 'authorization: Bearer adminAuthToken'`,
    response: {
      message: 'Chaos initiated',
    },
  },
];

// vendor exists check
vendorRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const vendor = await DB.getVendorByNetId(id);
    res.json({ exists: !!vendor });
  })
);

// get vendor
vendorRouter.get('/', vendorAuth, (req, res) => {
  if (req.vendor.chaos && req.vendor.chaos.fixCode) {
    delete req.vendor.chaos.fixCode;
  }
  res.json(req.vendor);
});

// add a vendor
vendorRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    let vendor = req.body;
    if (!vendor || !vendor.id) {
      return res.status(400).json({ message: 'Missing param. Must have ID' });
    }
    if (await DB.getVendorByNetId(vendor.id)) {
      return res.status(409).json({ message: 'Vendor already exists' });
    }
    const allowedFields = ['id', 'gitHubUrl', 'name', 'website', 'phone', 'email'];
    vendor = Object.fromEntries(Object.entries(vendor).filter(([key]) => allowedFields.includes(key)));
    vendor.apiKey = uuid().replace(/-/g, '');
    vendor.created = new Date().toISOString();
    vendor.email = vendor.email || `${vendor.id}@byu.edu`;
    await DB.addVendor(vendor);
    delete vendor.apiKey;
    res.json(vendor);
  })
);

// update a vendor
vendorRouter.put(
  '/',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const changes = {};
    const allowedFields = ['gitHubUrl', 'name', 'website', 'phone', 'email', 'connections'];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        changes[key] = req.body[key];
      }
    });
    const vendor = await DB.updateVendor(req.vendor, changes);
    res.json(vendor);
  })
);

// create authorization code email
vendorRouter.post(
  '/code',
  asyncHandler(async (req, res) => {
    const vendor = await DB.getVendorByNetId(req.body.id || '');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const code = Math.random().toString(36).substring(2, 10);

    const htmlTemplate = `
  <p>Hello ${vendor.name},</p>
  <p>Your verification code for the BYU CS 329 JWT Pizza Factory website is:</p>
  <p><strong>${code}</strong></p>
  <p>Please enter this code in the form you were using to create your secure session.</p>
  <p>Do not share this code for others. If you did not request this code, please contact us at <a href="mailto:ta@cs329.click">ta@cs329.click</a>.</p>
  <p>Thank you,<br>
  The BYU CS 329 Team</p>
  <p>For more information, visit <a href="https://cs329.click">https://cs329.click</a></p>
  `;

    const textTemplate = `
  Hello ${vendor.name},

  Your verification code for the BYU CS 329 JWT Pizza Factory website is: ${code}

  Please enter this code in the form you were using to create your secure session.

  Do not share this code with others. If you did not request this code, please contact us at lee@cs.byu.edu.

  Thank you,
  The BYU CS 329 Team

  For more information, visit https://cs329.click
  `;

    await DB.addAuthCode(vendor.id, code);
    try {
      await req.services.sendEmail({
        to: vendor.email,
        subject: 'BYU CS 329 JWT Pizza Factory',
        html: htmlTemplate,
        text: textTemplate,
      });
    } catch (error) {
      return res.status(500).json({ message: `Unable to send authorization code to ${vendor.email}` });
    }
    res.json({ email: vendor.email });
  })
);

// create vendor authorization based on the provided code
vendorRouter.post(
  '/auth',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const code = req.body.code;
    if (await DB.validateAuthCode(id, code)) {
      const vendor = await DB.getVendorByNetId(id);
      res.json(vendor);
    } else {
      return res.status(401).json({ message: 'Invalid code' });
    }
  })
);

// create a vendor connection to another vendor
vendorRouter.post(
  '/connect',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const purpose = req.body.purpose;
    if (!purpose || typeof purpose !== 'string' || purpose.length < 1) {
      return res.status(400).json({ message: 'Invalid purpose' });
    }
    let vendor = req.vendor;
    vendor = await DB.requestVendorConnection(vendor, purpose);
    res.json(vendor);
  })
);

// initiate chaos testing for a vendor
vendorRouter.put(
  '/chaos/:type',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const type = req.params.type;
    if (!['badjwt', 'fail', 'throttle'].includes(type)) {
      return res.status(400).json({ message: 'Invalid chaos type' });
    }

    if (req.vendor.website && !(await trafficGenerator.start(req.vendor))) {
      return res.status(400).json({ message: `website (${vendor.website}) failed to respond` });
    }

    const chaos = {
      type: type,
      fixCode: Math.random().toString(36).substring(2, 10),
      initiatedDate: new Date().toISOString(),
    };
    await DB.addChaos(req.vendor.id, chaos);

    res.json({ message: 'Chaos initiated' });
  })
);

module.exports = vendorRouter;
