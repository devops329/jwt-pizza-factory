# nft-pizza-factory

Factory service for making NFT pizzas

## Usage

- Admin endpoint to register NFT Pizza implementation this returns an API key for the

- Create JWT given an order

  ```sh
   curl -X POST localhost:3000/order -H 'authorization: Bearer abce4567-dddd-eeee-a345-996141749213' -d '{"store": "storeId-zzz", "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'
  ```

- Verify and order JWT
  ```sh
   curl -X POST localhost:3000/order/verify -d '{"order":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmFuY2hpc2UiOnsiaWQiOiIxMjM0NDU2Ny1mZmZmLXp6enotYTM0NS05OTYxNDE5MmFiY2QiLCJuYW1lIjoiU3VwZXJQaWUifSwic3RvcmUiOiJzdG9yZUlkLXp6eiIsIm9yZGVyIjp7InBpenphcyI6WyJwZXAiLCJjaGVlc2UiXX0sImlhdCI6MTcxNDA1NTcyOSwiZXhwIjoxNzE0MTQyMTI5LCJpc3MiOiJjczMyOS5jbGljayJ9.xcHR31MMMm3b4NR2xIHV4obryFvg0ytYDYkUmGF9wJ4"}' -H 'Content-Type: application/json'
  ```

## Development notes

1.  Initialize node.js
    ```sh
    npm init
    ```
1.  Install Express and jsonwebtoken. Express gives us a wrapper for HTTP communication. Jsonwebtoken helps us generate and validate our JWTs.
    ```sh
    npm install express jsonwebtoken
    ```
1.  Generate a secret used to sign the JWT
    ```js
    const k = require('crypto').randomBytes(64).toString('hex');
    console.log(k);
    ```
