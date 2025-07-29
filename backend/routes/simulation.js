const express = require('express');
const router = express.Router();
const { simulateTransfer, simulateTransferWindow } = require('../controllers/simulationController');

// POST simulate single transfer
router.post('/transfer', simulateTransfer);

// POST simulate transfer window
router.post('/transfer-window', simulateTransferWindow);

module.exports = router; 