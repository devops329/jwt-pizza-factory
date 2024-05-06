import fs from 'fs';
import jose from 'node-jose';

const keys = { privateKey: undefined, jwks: undefined };

const privateKeyPath = new URL('jwt.key', import.meta.url);
const privatePemKey = fs.readFileSync(privateKeyPath, 'utf8');
jose.JWK.asKey(privatePemKey, 'pem')
  .then((jwk) => {
    console.log('Successfully imported JWK:', jwk);
    keys.privateKey = jwk;
  })
  .catch((error) => {
    console.error('Error importing JWK:', error);
  });

const publicKeyPath = new URL('jwt.key.pub', import.meta.url);
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
jose.JWK.asKey(publicKey, 'pem')
  .then((jwk) => {
    console.log('Successfully imported JWK:', jwk);
    keys.jwks = [jwk];
  })
  .catch((error) => {
    console.error('Error importing JWK:', error);
  });

export { keys };
