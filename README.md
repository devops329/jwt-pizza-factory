# JWT Pizza Factory

Factory service for making JWT pizzas

## Usage

- Create an Admin endpoint to register JWT Pizza implementation this returns an API key for the JWT Pizza Server to use when making pizzas.

- Create JWT given an order

  ```sh
   curl -X POST localhost:3000/order -H 'authorization: Bearer 123456' -d '{"diner": {"name":"joe"}, "order": {"pizzas":["pep", "cheese"]}}' -H 'Content-Type: application/json'
  ```

- Verify and order JWT

  ```sh
   curl -X POST localhost:3000/order/verify -d '{"order":"eyJpYXQiOjE3MTUwMTI5NTYsImV4cCI6MTcxNTA5OTM1NiwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJmYWN0b3J5QXV0aCI6eyJpZCI6InN0dWRlbnQtbmV0aWQiLCJuYW1lIjoiU3R1ZGVudCBOYW1lIiwiY3JlYXRlZCI6IjIwMjQtMDYtMDFUMDA6MDA6MDBaIiwidmFsaWRVbnRpbCI6IjIwMjUtMTItMzFUMjM6NTk6NTlaIn0sImRpbmVyIjp7Im5hbWUiOiJqb2UifSwib3JkZXIiOnsicGl6emFzIjpbInBlcCIsImNoZWVzZSJdfX0.MTGE6-SvbDpxO6tr6f-57CDfnaqTdwryxjS3RFRaKu8pUemG43k15Nxx4-3SFMU0eULU_JMVrEq8fWJ82-0XV9UwLMxsZHc9R5xhdcvLg0fScAvg3SaC8ZVui1AqIt_yUw79-AABEIlaYx-2dhdJKhZQhM9QFSpRKF3DmYXkOpN6VGw8kMCo-kAra9W_H3kzD52vY_3QWiB6uO4V14p8U7Caz9cDPnEvRJKE3CjC0vJh-d5MF0O3z80ajcCx0GRIv8BIpy8ca1Xg-CyqGEx6YH2oqV9QFLNQfzj5Aba_AonTAAMDtQMpVwbrNizFDKXF75-9FcX1_PdtjfX_YUhEpZBQ-Y7peODb0dp29i-7HrWWhAUH_bvR_c9i8PXVw4YBBJV5tpKhN0aw-Fj4ZfV7ZoK_y5WWQvb-zvYoLp4mb5i6btLvS7AEdDCy7RqSyeatNYPK2AifHbJmaKpXiV-d5vMXSuHHcjTM4_BWPXX6sb_5R_nr5rKWH7_aJO2zNDtR5GXY5P-4SatlfjTCu5vaYIcCxCM7BajMQOg5R8iE4hrI4q0Qdw4vOIe5gM3yeAkaqlQiMFH8EnJkV1qdmApEO7P9QTG6rc7toG5LwJkjHWFfV7ETSWfCw0u9Jacwozbp1KrMcGdXvlLVyTM3i5f5OazqrZJNLsbBEX2euhTYh_w"}' -H 'Content-Type: application/json'
  ```

- Get the JWKS for independent validation. You can use this with a tool such as [JWT.io](https://jwt.io). Paste the JWT order into the interface and then supply the first key returned from the JWKS endpoint in the public key verify signature input.

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
1.  Key pairs are expected to be in the working directory. You can generate the keys with the following.

    ```sh
    ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key
    openssl rsa -in jwt.key -pubout -outform PEM -out jwt.key.pub
    ```

1.  Generate a secret you can use to sign a JWT
    ```js
    const k = require('crypto').randomBytes(64).toString('hex');
    console.log(k);
    ```

## JWT

A JWT Pizza is a JWT signed with an asymmetric key.

You can get the JWKS to verify JWTs using the `/.well-known/jwks.json` endpoint.

https://www.npmjs.com/package/node-jose

## Configuration

You must have key files and a configuration file for the factory to work. Eventually this will be moved to the database.

```js
const config = {
  apiKeys: {
    42nkl3fdsf-agfdagnvcaklfdsa-fdsa9: {
      id: 'student-netid',
      name: 'Student Name',
      created: '2024-06-01T00:00:00Z',
      validUntil: '2025-12-31T23:59:59Z',
    },
  },
  admin: {
    email: 'admin@example.com',
    password: '$2b$10$DF3Z64Z5WFVI6a2C3WuTveOJlIEnRc36J8v9WxhAqf7qlukfS2YRa',
  },
};

export default config;
```
