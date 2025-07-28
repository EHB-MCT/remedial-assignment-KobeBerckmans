const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectToMongo = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

connectToMongo();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('TransferMarketSim backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 