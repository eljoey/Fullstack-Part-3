const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please give your password');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://fullstack:${password}@phonebook-snfox.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

person = new Person({
  name: name,
  number: number
});

if (process.argv.length === 5) {
  person.save().then(res => {
    console.log(`added ${name} number ${number} to the phonebook`);
    mongoose.connection.close();
  });
}

if (process.argv.length === 3) {
  Person.find({}).then(response => {
    console.log('Phonebook:');
    response.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length > 5) {
  console.log('too many arguments');
  mongoose.connection.close();
}
