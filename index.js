import express from 'express';
import jose from 'node-jose';
import { keys } from './keys.js';
import config from './config.js';

const app = express();

app.use(express.json());

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: keys.jwks,
  });
});

const getAuthorizationInfo = (req, res, next) => {
  const factoryAuth = config.apiKeys[(req.headers.authorization || '').replace(/bearer /i, '')];
  if (factoryAuth) {
    req.factoryAuth = factoryAuth;
    next();
  } else {
    return res.status(401).json({ message: 'invalid authentication' });
  }
};

app.post('/order', getAuthorizationInfo, (req, res) => {
  const { diner, order } = req.body;
  if (!diner || !order) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = { factoryAuth: req.factoryAuth, diner, order };
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
    .then((order) => {
      res.json({ order });
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
      const order = JSON.parse(r.payload.toString());
      res.status(200).json({ message: 'order is valid', order });
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

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
