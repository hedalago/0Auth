import express from 'express';
import bodyParser from 'body-parser';
import { authProperty, verifyProperty } from '@0auth/server';
import { AuthType, KeyType } from '@0auth/message';
import { validateAddress, validateAge, validatePhone } from './utils';
import cors from 'cors';
import { issueProperty, publicKeyFromSecret } from '@0auth/server/lib';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mockMovies = [
  { 'name': 'Tenet', 'age_limit': 12 },
  { 'name': 'Les Misérables', 'age_limit': 12 },
  { 'name': 'The Conjuring 2', 'age_limit': 15 },
];

let mockMovieReservation: { [key: string]: number } = mockMovies.map(movie => movie.name)
  .reduce((seatMap, name) => ({ ...seatMap, [name]: 0 }), {});

const privateKey = {
  key: '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a',
  type: KeyType.ECDSA,
};

const publicKey = publicKeyFromSecret(privateKey);

app.get('/movies', (req, res) => {
  res.send(mockMovies);
});

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
  const info = {
    name: movie.name,
    seat: ++mockMovieReservation[String(movie.name)] + '',
  };
  const ticketSign = issueProperty(info, privateKey, AuthType.Package);
  const ticket = verifyProperty(req.body.properties, req.body.sign, publicKey, AuthType.Privacy)
    .validate('age', (age) => Number(age) >= movie.age_limit)
    .confirm({ ticket: info, sign: ticketSign });
  res.send(ticket);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
