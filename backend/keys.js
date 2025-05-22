const fs = require('fs');
const jose = require('node-jose');
const path = require('path');
const keys = { privateKey: undefined, jwks: undefined };

const privateKeyPath = path.resolve(__dirname, 'jwt.key');
const privatePemKey = fs.readFileSync(privateKeyPath, 'utf8');
jose.JWK.asKey(privatePemKey, 'pem')
  .then((jwk) => {
    keys.privateKey = jwk;
  })
  .catch((error) => {
    console.error('Error importing JWK:', error);
  });

const publicKeyPath = path.resolve(__dirname, 'jwt.key.pub');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
jose.JWK.asKey(publicKey, 'pem')
  .then((jwk) => {
    keys.jwks = [jwk];
  })
  .catch((error) => {
    console.error('Error importing JWK:', error);
  });

module.exports.keys = keys;
