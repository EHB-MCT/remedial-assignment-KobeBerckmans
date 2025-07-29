const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const clubsRouter = require('./routes/clubs');
const transfersRouter = require('./routes/transfers');
const simulationRouter = require('./routes/simulation');
app.use('/api/clubs', clubsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/simulation', simulationRouter);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('TransferMarketSim backend running');
});

app.get('/api/players', async (req, res) => {
  try {
    const { MongoClient, ServerApiVersion } = require('mongodb');
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