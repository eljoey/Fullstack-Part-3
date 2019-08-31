require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const Person = require('./models/persons');

app.use(cors());
app.use(express.static('build'));
app.use(bodyParser.json());

//custom token to get the body of request as a string to print
const morgan = require('morgan');
morgan.token('body', function getBody(req) {
  return JSON.stringify(req.body);
});
//IT WILL ONLY PRINT ON POST REQUESTS
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      skip: (req, res) => {
        return req.method !== 'POST';
      }
    }
  )
);

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'Dan Abramaov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
];

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>  
    <p>${new Date()} </p>`
  );
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()));
  });
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person.toJSON());
    console.log(person);
  });
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (body.name === undefined) {
    return res.status(400).json({
      error: 'Name missing'
    });
  } else if (body.number === undefined) {
    return res.status(400).json({
      error: 'Number missing'
    });
  } else if (
    persons.find(
      person => person.name.toLowerCase() === body.name.toLowerCase()
    )
  ) {
    return res.status(400).json({
      error: 'Name must be unique'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'uknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
