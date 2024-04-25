const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('./config.json');

const app = express();
const apiKeys = {
  'abce4567-dddd-eeee-a345-996141749213': { id: '12344567-ffff-zzzz-a345-99614192abcd', name: 'SuperPie' },
  '99999999-dddd-eeee-a345-996141749213': { id: '99999999-ffff-zzzz-a345-99614192abcd', name: 'NTFPizza-Factory' },
};

app.use(express.json());

const verifyApiKey = (req, res, next) => {
  const apiKey = (req.headers.authorization || '').replace(/bearer /i, '');
  if (apiKeys[apiKey]) {
    req.franchiseInfo = apiKeys[apiKey];
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

app.post('/order', verifyApiKey, (req, res) => {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
