const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('./config.json');

const fs = require('fs');
const path = require('path');
const jose = require('node-jose');

const pubKeyPath = path.resolve(__dirname, 'jwt.key.pub');
const pubKey = fs.readFileSync(pubKeyPath, 'utf8');
let jwks;
jose.JWK.asKey(pubKey, 'pem')
  .then((jwk) => {
    console.log('Successfully imported JWK:', jwk);
    jwks = [jwk];
  })
  .catch((error) => {
    console.error('Error importing JWK:', error);
  });

const app = express();

app.use(express.json());

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: jwks,
  });
});

const getFranchiseInfo = (req, res, next) => {
  const franchiseInfo = config.apiKeys[(req.headers.authorization || '').replace(/bearer /i, '')];
  if (franchiseInfo) {
    req.franchiseInfo = franchiseInfo;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

app.post('/order', getFranchiseInfo, (req, res) => {
  const { store, order } = req.body;
  if (!store || !order) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const token = jwt.sign({ franchise: req.franchiseInfo, store, order }, config.jwtSecret, {
    expiresIn: '1d',
    issuer: 'cs329.click',
  });

  res.json({ token });
});

app.post('/order/verify', (req, res) => {
  const orderJwt = req.body.order;

  const d = jwt.decode(orderJwt);
  jwt.verify(orderJwt, jwtSecret, (err, decodedJwt) => {
    const status = err ? 403 : 200;
    const message = err ? 'invalid order' : 'valid order';
    const result = { message: message, order: d };
    res.status(status).json(result);
  });
});

app.get('*', (_, res) => {
  res.send({ message: 'NFT Pizza Factory' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
