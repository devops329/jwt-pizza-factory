const express = require('express');
const DB = require('../database/database');
const { greateVendor, vendorAuth, asyncHandler } = require('./routerUtil');

const vendorRouter = express.Router();

vendorRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Gets vendor information',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer authToken'`,
    response: {
      id: 'test3',
      apiKey: 'abcxyz',
    },
  },
  {
    method: 'POST',
    path: '/api/vendor/code',
    requiresAuth: false,
    description: 'Send authorization code email',
    example: `curl -X POST $host/api/vendor/code  -d '{"id":"test3"}' -H 'Content-Type: application/json'`,
    response: {
      message: 'Code sent to test3.byu.edu',
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
    method: 'PUT',
    path: '/api/vendor',
    requiresAuth: true,
    description: 'Updates a vendor. Only supply the changed fields. Use null to remove a field.',
    example: `curl -X POST $host/api/vendor -H 'authorization: Bearer adminAuthToken' -H 'Content-Type:application/json' -d '{"gitHubUrl":"https://github.com/byustudent23"}'`,
    response: {
      id: 'byustudent23',
      name: 'cs student',
      gitHubUrl: 'https://github.com/byustudent23',
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

// get vendor
vendorRouter.get('/', vendorAuth, (req, res) => {
  if (req.vendor.chaos && req.vendor.chaos.fixCode) {
    delete req.vendor.chaos.fixCode;
  }
  res.json(req.vendor);
});

// create authorization code email
vendorRouter.post(
  '/code',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const email = `${id}@byu.edu`;
    const code = Math.random().toString(36).substring(2, 10);

    const htmlTemplate = `
  <p>Hello ${id},</p>
  <p>Your verification code for the BYU CS 329 JWT Pizza Factory website is:</p>
  <p><strong>${code}</strong></p>
  <p>Please enter this code in the form you were using to create your secure session.</p>
  <p>Do not share this code for others. If you did not request this code, please contact us at <a href="mailto:lee@cs.byu.edu">lee@cs.byu.edu</a>.</p>
  <p>Thank you,<br>
  The BYU CS 329 Team</p>
  <p>For more information, visit <a href="https://cs329.click">https://cs329.click</a></p>
  `;

    const textTemplate = `
  Hello ${id},

  Your verification code for the BYU CS 329 JWT Pizza Factory website is: ${code}

  Please enter this code in the form you were using to create your secure session.

  Do not share this code with others. If you did not request this code, please contact us at lee@cs.byu.edu.

  Thank you,
  The BYU CS 329 Team

  For more information, visit https://cs329.click
  `;

    await DB.addAuthCode(id, code);
    await req.services.sendEmail({
      to: email,
      subject: 'BYU CS 329 JWT Pizza Factory',
      html: htmlTemplate,
      text: textTemplate,
    });
    res.json({ message: `Code sent to ${email}` });
  })
);

// create vendor authorization based on the provided code
vendorRouter.post(
  '/auth',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const code = req.body.code;
    if (await DB.validateAuthCode(id, code)) {
      const vendor = await greateVendor({ id });
      res.json(vendor);
    } else {
      return res.status(401).json({ message: 'Invalid code' });
    }
  })
);

// create a vendor connection
vendorRouter.post(
  '/connect',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const purpose = req.body.purpose;
    if (!purpose || typeof purpose !== 'string' || purpose.length < 1) {
      return res.status(400).json({ message: 'Invalid purpose' });
    }
    let vendor = await DB.getVendorByApiKey(req.apiKey);
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
    if (['badjwt', 'fail', 'throttle'].includes(type)) {
      const vendor = await DB.getVendorByApiKey(req.apiKey);
      if (vendor) {
        const changes = {
          chaos: {
            type: type,
            fixCode: Math.random().toString(36).substring(2, 10),
            initiatedDate: new Date().toISOString(),
          },
        };
        await DB.updateVendorByApiKey(req.apiKey, changes);
        res.json({ message: 'Chaos initiated' });
      } else {
        res.status(404).json({ message: 'Vendor not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid chaos type' });
    }
  })
);

module.exports = vendorRouter;
