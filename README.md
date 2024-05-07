# JWT Pizza Factory

Factory service for making JWT pizzas

## Usage

- Create an Admin endpoint to register JWT Pizza implementation this returns an API key for the JWT Pizza Server to use when making pizzas.

## Endpoints

You can get the documentation for all endpoints by making the following request.

```sh
curl localhost:3000/api/docs
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
    a42nkl3fdsfagfdagnvcaklfdsafdsa9: {
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
