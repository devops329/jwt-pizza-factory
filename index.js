const express = require('express');
const jwt = require('jsonwebtoken');

// curl -X POST localhost:3000/order -H 'authorization: abce4567-dddd-eeee-a345-996141749213' -d '{"franchise":"monkeypie", "store": "provo", "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'
// curl -X POST localhost:3000/order/verify -H 'authorization: abce4567-dddd-eeee-a345-996141749213' -d '{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmFuY2hpc2UiOiJtb25rZXlwaWUiLCJzdG9yZSI6InByb3ZvIiwib3JkZXIiOnsicGl6emFzIjpbInBlcCIsImNoZWVzZSJdfSwiaWF0IjoxNzE0MDAwMTY4LCJleHAiOjE3NDU1MzYxNjgsImlzcyI6ImNzMzI5LmNsaWNrIn0.KJGn675PXpKppdwbEuOND-7mB24BGJMos0-Wd-PXLWU"}' -H 'Content-Type: application/json'

const app = express();
const apiKeys = {
  'abce4567-dddd-eeee-a345-996141749213': '123e4567-e89b-12d3-a456-426614174000',
};

app.use(express.json());

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization;
  if (apiKey && apiKeys[apiKey]) {
    req.secretKey = apiKeys[apiKey];
    next();
  } else {
    return res.status(401).json({ message: 'No API key provided' });
  }
};

app.post('/order', verifyApiKey, (req, res) => {
  const { franchise, store, order } = req.body;
  if (!franchise || !store || !order) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const token = jwt.sign({ franchise, store, order }, req.secretKey, {
    expiresIn: '365d',
    issuer: 'cs329.click',
  });

  res.json({ token });
});

app.post('/order/verify', verifyApiKey, (req, res) => {
  const encodedJwt = req.body.jwt;

  jwt.verify(encodedJwt, req.secretKey, (err, decodedJwt) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate jwt' });
    }
    res.json({ order: decodedJwt });
  });
});

app.get('*', (_, res) => {
  res.send({ message: 'NFT Pizza Factory' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
