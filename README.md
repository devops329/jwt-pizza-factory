# nft-pizza-factory

Factory service for making JWT pizzas

## Usage

- Create an Admin endpoint to register JWT Pizza implementation this returns an API key for the JWT Pizza Server to use when making pizzas.

- Create JWT given an order

  ```sh
   curl -X POST localhost:3000/order -H 'authorization: Bearer abce4567-dddd-eeee-a345-996141749213' -d '{"store": "storeId-zzz", "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'
  ```

- Verify and order JWT

  ```sh
   curl -X POST localhost:3000/order/verify -d '{"order":"eyJpYXQiOjE3MTQwODUxMjIsImV4cCI6MTcxNDE3MTUyMiwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IkxmcF83eUpTTnV1WG4zVkdRS1FTcjNnZTNBZmFaV2JFTi1GTEpmM3N4NTAifQ.eyJmcmFuY2hpc2UiOnsiaWQiOiJzdXBlcnBpZS1mZmZmLXp6enotYTM0NS05OTYxNDE5MmFiY2QiLCJuYW1lIjoiU3VwZXJQaWUifSwic3RvcmUiOiJzdG9yZUlkLXp6eiIsIm9yZGVyIjp7InBpenphcyI6WyJwZXAiLCJjaGVlc2UiXX19.sww0ieFQWy9RL3z2zx5t0LzkdEFXDH7sGivyAj5YpYD4zfUE3oEmb88SNqSo_v1ODzZm3FUNw40V6PhM9e54DWa80kNkTiXxBCkoOWeLfr_ag495fmk3wLf_LJR1tdnIe7sjrwVVwqoUL3WpLTVq7KoHAy2Gt3p6iesQS6hYHj47S1y26WVILZMEBm8SyHLS0MNTEm15G5-5XIcgTUkjswj6zOlpW2e6yw97F5hvAUoulTD3rB1PStDx845I8K2Yp3uxS0LZ3IoBh768jJKo5t2rQoCFRDyevcS2zBqUxXpvW1eoIb4NQlsP9TDNrSucYwkIE1KjQiMLRsgR-0xOc9Qo7h2PRd8Er8qmWX93urVVVFxrlo95HC19I2CuBNS2d7ACOgjHL_0tT0JzmHaMFtRZZjucudFcaBn-wdB2xjghCpDCpkkzTSqOTlmHTMgpTtvrhKcAAEozJrW9dI_z1E4HnzyEc9Lkouj0gwB1aiHuVXr0V45NIvZZua_A1u971kybQpgozpvJbS4zyR7It48-zUOCVmgG6hutCWLaytNTB1IXmr-EUldvsqt2TcUbTEhxjmBHealjEE9VgquiI_eEyyc_OKmzzRGqeRrPBLE0zAV6x2oijSMR_FfVc2Mdgun6cohFlmxJXpAbyVJJvsPti7Mj4LLZ8nlIKB9H3uI"}' -H 'Content-Type: application/json'
  ```

- Get the JWKS for independent validation.

  ```sh
  curl localhost:3000/.well-known/jwks.json
  ```

## Development notes

1.  Initialize node.js
    ```sh
    npm init
    ```
1.  Install Express and jsonwebtoken. Express gives us a wrapper for HTTP communication. Jsonwebtoken helps us generate and validate our JWTs.
    ```sh
    npm install express node-jose
    ```
1.  Generate a secret used to sign the JWT
    ```js
    const k = require('crypto').randomBytes(64).toString('hex');
    console.log(k);
    ```

## JWT

A JWT Pizza is a JWT signed with an asymmetric key.

You can get the JWKS to verify JWTs using the `/.well-known/jwks.json` endpoint.

https://www.npmjs.com/package/node-jose
