const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGODB_URI;

const clubs = [
  {
    name: 'Manchester City',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Real Madrid',
    budget: 500000000,
    league: 'La Liga',
    country: 'Spain'
  },
  {
    name: 'Bayern Munich',
    budget: 500000000,
    league: 'Bundesliga',
    country: 'Germany'
  },
  {
    name: 'Paris Saint-Germain',
    budget: 500000000,
    league: 'Ligue 1',
    country: 'France'
  },
  {
    name: 'Liverpool',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Barcelona',
    budget: 500000000,
    league: 'La Liga',
    country: 'Spain'
  },
  {
    name: 'Manchester United',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Chelsea',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Arsenal',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Tottenham Hotspur',
    budget: 500000000,
    league: 'Premier League',
    country: 'England'
  },
  {
    name: 'Atletico Madrid',
    budget: 500000000,
    league: 'La Liga',
    country: 'Spain'
  },
  {
    name: 'Sevilla',
    budget: 500000000,
    league: 'La Liga',
    country: 'Spain'
  },
  {
    name: 'Borussia Dortmund',
    budget: 500000000,
    league: 'Bundesliga',
    country: 'Germany'
  },
  {
    name: 'RB Leipzig',
    budget: 500000000,
    league: 'Bundesliga',
    country: 'Germany'
  },
  {
    name: 'Bayer Leverkusen',
    budget: 500000000,
    league: 'Bundesliga',
    country: 'Germany'
  },
  {
    name: 'AC Milan',
    budget: 500000000,
    league: 'Serie A',
    country: 'Italy'
  },
  {
    name: 'Inter Milan',
    budget: 500000000,
    league: 'Serie A',
    country: 'Italy'
  },
  {
    name: 'Juventus',
    budget: 500000000,
    league: 'Serie A',
    country: 'Italy'
  },
  {
    name: 'Napoli',
    budget: 500000000,
    league: 'Serie A',
    country: 'Italy'
  },
  {
    name: 'AS Roma',
    budget: 500000000,
    league: 'Serie A',
    country: 'Italy'
  },
  {
    name: 'Marseille',
    budget: 500000000,
    league: 'Ligue 1',
    country: 'France'
  },
  {
    name: 'Lyon',
    budget: 500000000,
    league: 'Ligue 1',
    country: 'France'
  },
  {
    name: 'Monaco',
    budget: 500000000,
    league: 'Ligue 1',
    country: 'France'
  },
  {
    name: 'Porto',
    budget: 500000000,
    league: 'Primeira Liga',
    country: 'Portugal'
  },
  {
    name: 'Benfica',
    budget: 500000000,
    league: 'Primeira Liga',
    country: 'Portugal'
  },
  {
    name: 'Ajax',
    budget: 500000000,
    league: 'Eredivisie',
    country: 'Netherlands'
  },
  {
    name: 'PSV Eindhoven',
    budget: 500000000,
    league: 'Eredivisie',
    country: 'Netherlands'
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