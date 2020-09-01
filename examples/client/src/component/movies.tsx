import React, { useState } from 'react';
import Movie, { MovieType, Ticket } from './movie';
import { Property, Signature } from '@0auth/message/lib';

export type MoviesProps = {
  properties: Property[];
  sign: Signature;
};

function Movies({ properties, sign }: MoviesProps) {
  const [movieList, setMovieList] = useState<MovieType[]>([]);
  const movieUrl = 'http://127.0.0.1:3000/movies';
  if (movieList.length === 0) {
    fetch(movieUrl)
      .then(res => res.json() as unknown as MovieType[])
      .then(res => res.map((movie, id) => ({ ...movie, id })))
      .then(res => setMovieList(res));
  }
  const bookMovie = (id: number) => {
    const url = `http://127.0.0.1:3000/view/movie/${id}`;
    fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ properties, sign }),
    }).then(res => res.json() as unknown as Ticket)
      .then(res => {
        movieList[id].ticket = res;
        setMovieList([...movieList]);
      });
  };

  return (
    <div className="Movies">
      <h2>Book Movie</h2>
      {movieList.map(movie => <Movie bookMovie={bookMovie} {...movie}/>)}
    </div>
  );
}

export default Movies;
