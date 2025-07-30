const express = require('express');
const router = express.Router();
const { simulateTransfer, simulateTransferWindow, simulateDay } = require('../controllers/simulationController');

// POST simulate single transfer
router.post('/transfer', simulateTransfer);

// POST simulate transfer window
router.post('/transfer-window', simulateTransferWindow);

// POST simulate a full day
router.post('/day', simulateDay);

module.exports = router; 