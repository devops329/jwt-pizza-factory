const express = require('express');
const { keys } = require('./keys');
const orderRouter = require('./routes/orderRouter');
const adminRouter = require('./routes/adminRouter');
const supportRouter = require('./routes/supportRouter');
const vendorRouter = require('./routes/vendorRouter');
const badgeRouter = require('./routes/badgeRouter');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('./email/sesEmail.js');

// Read version.json synchronously since we can't use top-level await in CommonJS
const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, './version.json'), 'utf8'));
const app = express();

// add services
app.services = {
  sendEmail,
};
app.use((req, res, next) => {
  req.services = app.services;
  next();
});

// Add general request middleware
app.use(express.static('public'));
app.use(express.json());

// Ignore CORS for this trivial service
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Set up the endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);
apiRouter.use('/order', orderRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/support', supportRouter);
apiRouter.use('/vendor', vendorRouter);
apiRouter.use('/badge', badgeRouter);

apiRouter.use('/docs', (_req, res) => {
  res.json({
    message: 'welcome to JWT Pizza Factory',
    version: version.version,
    endpoints: [...orderRouter.endpoints, ...adminRouter.endpoints, ...supportRouter.endpoints],
  });
});

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: keys.jwks,
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({
    message: 'unknown endpoint',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

module.exports = app;
