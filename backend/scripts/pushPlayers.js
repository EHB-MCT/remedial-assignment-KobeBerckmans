const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGODB_URI;

const players = [
  { name: 'Lionel Messi', age: 36, position: 'Forward', marketValue: 35000000, club: 'Inter Miami', nationality: 'Argentina', goals: 25, assists: 18, appearances: 30 },
  { name: 'Kevin De Bruyne', age: 32, position: 'Midfielder', marketValue: 70000000, club: 'Manchester City', nationality: 'Belgium', goals: 10, assists: 22, appearances: 28 },
  { name: 'Erling Haaland', age: 23, position: 'Forward', marketValue: 180000000, club: 'Manchester City', nationality: 'Norway', goals: 38, assists: 7, appearances: 34 },
  { name: 'Jude Bellingham', age: 20, position: 'Midfielder', marketValue: 120000000, club: 'Real Madrid', nationality: 'England', goals: 14, assists: 10, appearances: 29 },
  { name: 'Virgil van Dijk', age: 32, position: 'Defender', marketValue: 50000000, club: 'Liverpool', nationality: 'Netherlands', goals: 3, assists: 2, appearances: 33 },
  { name: 'Kylian Mbappé', age: 25, position: 'Forward', marketValue: 180000000, club: 'Paris Saint-Germain', nationality: 'France', goals: 40, assists: 12, appearances: 35 },
  { name: 'Robert Lewandowski', age: 35, position: 'Forward', marketValue: 30000000, club: 'Barcelona', nationality: 'Poland', goals: 28, assists: 8, appearances: 32 },
  { name: 'Mohamed Salah', age: 31, position: 'Forward', marketValue: 65000000, club: 'Liverpool', nationality: 'Egypt', goals: 22, assists: 13, appearances: 31 },
  { name: 'Phil Foden', age: 23, position: 'Midfielder', marketValue: 110000000, club: 'Manchester City', nationality: 'England', goals: 15, assists: 15, appearances: 33 },
  { name: 'Bukayo Saka', age: 22, position: 'Winger', marketValue: 120000000, club: 'Arsenal', nationality: 'England', goals: 13, assists: 14, appearances: 34 },
  { name: 'Pedri', age: 21, position: 'Midfielder', marketValue: 90000000, club: 'Barcelona', nationality: 'Spain', goals: 5, assists: 10, appearances: 28 },
  { name: 'Vinícius Júnior', age: 23, position: 'Winger', marketValue: 150000000, club: 'Real Madrid', nationality: 'Brazil', goals: 18, assists: 16, appearances: 32 },
  { name: 'Harry Kane', age: 30, position: 'Forward', marketValue: 110000000, club: 'Bayern Munich', nationality: 'England', goals: 32, assists: 9, appearances: 33 },
  { name: 'Martin Ødegaard', age: 25, position: 'Midfielder', marketValue: 100000000, club: 'Arsenal', nationality: 'Norway', goals: 12, assists: 13, appearances: 34 },
  { name: 'Joshua Kimmich', age: 29, position: 'Midfielder', marketValue: 75000000, club: 'Bayern Munich', nationality: 'Germany', goals: 4, assists: 11, appearances: 32 },
  { name: 'Alphonso Davies', age: 23, position: 'Defender', marketValue: 70000000, club: 'Bayern Munich', nationality: 'Canada', goals: 2, assists: 8, appearances: 30 },
  { name: 'João Cancelo', age: 29, position: 'Defender', marketValue: 50000000, club: 'Barcelona', nationality: 'Portugal', goals: 3, assists: 7, appearances: 29 },
  { name: 'Rodri', age: 27, position: 'Midfielder', marketValue: 100000000, club: 'Manchester City', nationality: 'Spain', goals: 6, assists: 8, appearances: 34 },
  { name: 'Jamal Musiala', age: 21, position: 'Midfielder', marketValue: 110000000, club: 'Bayern Munich', nationality: 'Germany', goals: 10, assists: 12, appearances: 31 },
  { name: 'Rafael Leão', age: 24, position: 'Winger', marketValue: 90_000_000, club: 'AC Milan', nationality: 'Portugal', goals: 11, assists: 10, appearances: 32 }
];

async function pushPlayers() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  try {
    await client.connect();
    const db = client.db('Course_Project');
    const collection = db.collection('Players');
    await collection.deleteMany({});
    await collection.insertMany(players);
    console.log('20 players pushed to Players collection!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

pushPlayers(); 