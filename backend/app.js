const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const clubsRouter = require('./routes/clubs');
const transfersRouter = require('./routes/transfers');
const simulationRouter = require('./routes/simulation');
const auctionsRouter = require('./routes/auctions');
const authRouter = require('./routes/auth');

app.use('/api/clubs', clubsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/auctions', auctionsRouter);
app.use('/api/auth', authRouter);

// Players route (for fetching players from database)
app.get('/api/players', async (req, res) => {
  try {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    const database = client.db();
    const players = await database.collection('Players').find({}).toArray();
    await client.close();

    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 