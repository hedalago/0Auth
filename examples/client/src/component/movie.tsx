import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';

export type Ticket = {
  ticket: { [key: string]: string };
  sign: string;
}

export type MovieType = {
  id: number;
  name: string;
  age_limit: string;
  ticket: Ticket | undefined;
};

type MovieProps = {
  id: number;
  name: string;
  age_limit: string;
  ticket: Ticket | undefined;
  bookMovie: (id: number) => void;
}

const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    margin: 'auto .3rem',
    width: 275,
    textAlign: 'left'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 17,
    color: 'black'
  },
  pos: {
    fontSize: 12,
    marginBottom: 12,
  },
});

function Movie({ id, name, age_limit, ticket, bookMovie }: MovieProps) {
  const classes = useStyles();

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {name}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          age limit: {age_limit}
        </Typography>
      </CardContent>
      {
        ticket !== undefined
          ? (
            <CardActions>
              <Button size="small">Already Book</Button>
            </CardActions>
          )
          : (
            <CardActions onClick={() => bookMovie(id)}>
              <Button size="small">Reservation</Button>
            </CardActions>
          )
      }
    </Card>
  );
}

export default Movie;
