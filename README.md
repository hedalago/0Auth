# 0Auth
> A library for servicing using information stored in the user's local
> area even if the data is not stored on the server.

## Installation

```bash
// using npm
npm install @0auth/server  // server library
npm install @0auth/client  // client library

// using yarn
yarn add @0auth/server     // server library
yarn add @0auth/client     // client library
```

## Usage

### In Client

* Register Step
```javascript
const object = { name, phone, age, address };
// create property using object.
const properties = objectToProperty(object);
setProperties(properties);
const url = 'http://127.0.0.1:3000/register';
fetch(url, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  method: 'POST',
  
  // Register Properties and get sign of server.
  body: JSON.stringify({ properties }),
}).then(res => res.json() as unknown as Signature)
  .then(res => {
    // store signature
    storeSignature(properties, res, StorageType.LocalStorage);
    setSign(res)
  });
```

* Authentication step
```javascript
const bookMovie = (id: number) => {
const url = `http://127.0.0.1:3000/view/movie/${id}`;
fetch(url, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  method: 'POST',

  // Authenticate using sign of server.
  body: JSON.stringify({ properties, sign }),
}).then(res => res.json() as unknown as Ticket)
  .then(res => {
    movieList[id].ticket = res;
    setMovieList([...movieList]);
  });
};
```

### In server

* Register & Validate rest api

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import { authProperty, verifyProperty } from '@0auth/server';
import { AuthType, KeyType } from '@0auth/message';
import { validateAddress, validateAge, validatePhone } from './utils';

const app = express();
app.use(bodyParser.json());

// Set Key Pair for use in server.
const privateKey = {
  key: '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a',
  type: KeyType.ECDSA,
};

const publicKey = publicKeyFromSecret(privateKey);

app.post('/register', (req, res) => {
  // Validate User info and send sign of server.
  const sign = authProperty(req.body.properties)
    .validate('phone', validatePhone)
    .validate('address', validateAddress)
    .validate('address', validateAge)
    .sign(privateKey, AuthType.Privacy);
  res.send(sign);
});

app.post('/view/movie/:id', (req, res) => {
  const movie = mockMovies[Number(req.params.id)];
  const info = {
    name: movie.name,
    seat: ++mockMovieReservation[String(movie.name)] + '',
  };
  // Issue ticket using signature of server.
  const ticketSign = issueProperty(info, privateKey, AuthType.Package);

  // Verify sign of server and issue ticket. 
  const ticket = verifyProperty(req.body.properties, req.body.sign, publicKey, AuthType.Privacy)
    .validate('age', (age) => Number(age) >= movie.age_limit)
    .confirm({ ticket: info, sign: ticketSign });
  res.send(ticket);
});
```

## Example

* example of [client](./examples/client)
* example of [server](./examples/server)

## License

This project is licensed under the terms of the [MIT license](./LICENSE).
