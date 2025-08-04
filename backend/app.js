/**
 * Football Transfer Market Simulation - Backend Server
 * 
 * This is the main entry point for the backend API server.
 * It handles database connections, middleware setup, and route configuration.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import and start autoBidder for AI bidding functionality
require('./scripts/autoBidder');

/**
 * Express application instance
 * @type {import('express').Application}
 */
const app = express();

/**
 * Database connection configuration
 * Uses MongoDB with Mongoose ODM for data persistence
 */
const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Course_Project';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Middleware configuration
 * Sets up CORS, JSON parsing, and other essential middleware
 */
const configureMiddleware = () => {
  // CORS configuration for cross-origin requests
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // JSON body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
};

/**
 * Route configuration
 * Sets up all API endpoints with proper error handling
 */
const configureRoutes = () => {
  // Import route modules
  const clubsRouter = require('./routes/clubs');
  const transfersRouter = require('./routes/transfers');
  const simulationRouter = require('./routes/simulation');
  const auctionsRouter = require('./routes/auctions');
  const authRouter = require('./routes/auth');

  // Register API routes
  app.use('/api/clubs', clubsRouter);
  app.use('/api/transfers', transfersRouter);
  app.use('/api/simulation', simulationRouter);
  app.use('/api/auctions', auctionsRouter);
  app.use('/api/auth', authRouter);

  // Players route for fetching player data from database
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
      console.error('❌ Error fetching players:', error);
      res.status(500).json({ 
        message: 'Error fetching players',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
};

/**
 * Error handling middleware
 * Catches and processes all application errors
 */
const configureErrorHandling = () => {
  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({ 
      message: 'Route not found',
      path: req.path,
      method: req.method
    });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    
    res.status(error.status || 500).json({
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });
};

/**
 * Server startup function
 * Initializes all components and starts the server
 */
const startServer = async () => {
  try {
    // Configure middleware
    configureMiddleware();
    
    // Configure routes
    configureRoutes();
    
    // Configure error handling
    configureErrorHandling();
    
    // Connect to database
    await connectDatabase();
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// Start the server
startServer(); 