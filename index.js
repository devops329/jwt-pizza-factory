const express = require('express');
const jose = require('node-jose');
const { keys } = require('./keys');
const config = require('./config.json');

const app = express();

app.use(express.json());

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: keys.jwks,
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

  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = { franchise: req.franchiseInfo, store, order };
  const options = {
    format: 'compact',
    fields: {
      iat: nowSecs,
      exp: nowSecs + 24 * 60 * 60,
      iss: 'cs329.click',
    },
  };
  jose.JWS.createSign(options, keys.privateKey)
    .update(JSON.stringify(payload))
    .final()
    .then((token) => {
      res.json({ token });
    })
    .catch(() => {
      res.status(500).json({ message: 'unable to process order' });
    });
});

app.post('/order/verify', (req, res) => {
  const orderJwt = req.body.order;

  jose.JWS.createVerify(keys.privateKey)
    .verify(orderJwt)
    .then((r) => {
      const payload = JSON.parse(r.payload.toString());
      res.status(200).json({ message: 'order is valid', order: payload });
    })
    .catch(() => {
      res.status(403).json({ message: 'order is invalid' });
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
