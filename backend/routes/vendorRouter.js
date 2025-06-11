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
];

// get vendor
vendorRouter.get('/', vendorAuth, (req, res) => {
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

// update a vendor
vendorRouter.put(
  '/',
  vendorAuth,
  asyncHandler(async (req, res) => {
    const changes = {};
    const allowedFields = ['gitHubUrl', 'name', 'website'];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        changes[key] = req.body[key];
      }
    });
    const vendor = await DB.updateVendor(req.apiKey, changes);
    res.json(vendor);
  })
);

module.exports = vendorRouter;
