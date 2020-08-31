import express from 'express';
import bodyParser from 'body-parser';
import { authProperty, verifyProperty } from '@0auth/server';
import { AuthType, KeyType } from '@0auth/message';
import { validateAddress, validateAge, validatePhone } from './utils';

const app = express();
app.use(bodyParser.json());

const mockMovies = [
  { 'name': 'Tenet', 'age_limit': 12 },
  { 'name': 'Les Misérables', 'age_limit': 12 },
  { 'name': 'The Conjuring 2', 'age_limit': 15 },
];

let mockMovieReservation:  { [key: string]: number } = mockMovies.map(movie => movie.name)
  .reduce((seatMap, name) => ({...seatMap, [name]:0}), {});

const privateKey = {
  key: '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a',
  type: KeyType.ECDSA,
};

const publicKey = {
  key: '048da7b63430eb4db203177baf2e8699a25116561624e67a31c2bf288d54216ce3f6f9c7b81fdbb5732342475a6ee5ccab883277ddbb38fdb79ab5424d401b844a',
  type: KeyType.ECDSA,
};

app.post('/register', (req, res) => {
  const sign = authProperty(req.body.properties)
    .validate('phone', validatePhone)
    .validate('address', validateAddress)
    .validate('address', validateAge)
    .sign(privateKey, AuthType.Privacy);
  res.send(sign);
});

app.post('/view/movie/:id', (req, res) => {
  const movie = mockMovies[Number(req.params.id)];
  const ticket = verifyProperty(req.body.properties, req.body.sign, publicKey, AuthType.Privacy)
    .validate('age', (age) => Number(age) >= movie.age_limit)
    .confirm({ "name": movie.name, "seat": ++mockMovieReservation[String(movie.name)] });
  res.send(ticket);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
