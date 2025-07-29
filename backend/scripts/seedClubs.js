const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGODB_URI;

const clubs = [
  {
    name: 'Manchester City',
    budget: 200000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Real Madrid',
    budget: 180000000,
    league: 'La Liga',
    country: 'Spain'
  },
  {
    name: 'Bayern Munich',
    budget: 150000000,
    league: 'Bundesliga',
    country: 'Germany'
  },
  {
    name: 'Paris Saint-Germain',
    budget: 250000000,
    league: 'Ligue 1',
    country: 'France'
  },
  {
    name: 'Liverpool',
    budget: 120000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Barcelona',
    budget: 100000000,
    league: 'La Liga',
    country: 'Spain'
  }
];

async function seedClubs() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Club.deleteMany({});
    await Club.insertMany(clubs);
    console.log('Clubs collection seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedClubs(); 