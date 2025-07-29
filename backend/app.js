const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const mongoUri = process.env.MONGODB_URI;

app.get('/', (req, res) => {
  res.send('TransferMarketSim backend running');
});

app.get('/api/players', async (req, res) => {
  try {
    const client = new MongoClient(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    const db = client.db('Course_Project');
    const players = await db.collection('Players').find({}).toArray();
    await client.close();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 