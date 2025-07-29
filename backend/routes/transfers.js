const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const Club = require('../models/Club');

// GET all transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('fromClub')
      .populate('toClub');
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single transfer
router.get('/:id', async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('fromClub')
      .populate('toClub');
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new transfer
router.post('/', async (req, res) => {
  const transfer = new Transfer({
    playerId: req.body.playerId,
    playerName: req.body.playerName,
    fromClub: req.body.fromClub,
    toClub: req.body.toClub,
    amount: req.body.amount,
    status: req.body.status || 'pending',
    transferWindow: req.body.transferWindow || 'Summer 2024',
    notes: req.body.notes
  });

  try {
    const newTransfer = await transfer.save();
    const populatedTransfer = await Transfer.findById(newTransfer._id)
      .populate('fromClub')
      .populate('toClub');
    res.status(201).json(populatedTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update transfer
router.put('/:id', async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (req.body.status) transfer.status = req.body.status;
    if (req.body.amount) transfer.amount = req.body.amount;
    if (req.body.notes) transfer.notes = req.body.notes;

    const updatedTransfer = await transfer.save();
    const populatedTransfer = await Transfer.findById(updatedTransfer._id)
      .populate('fromClub')
      .populate('toClub');
    res.json(populatedTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST add negotiation offer
router.post('/:id/negotiate', async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    transfer.negotiationHistory.push({
      club: req.body.club,
      offer: req.body.offer,
      action: req.body.action
    });

    if (req.body.action === 'accept') {
      transfer.status = 'accepted';
    } else if (req.body.action === 'reject') {
      transfer.status = 'rejected';
    }

    const updatedTransfer = await transfer.save();
    const populatedTransfer = await Transfer.findById(updatedTransfer._id)
      .populate('fromClub')
      .populate('toClub');
    res.json(populatedTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE transfer
router.delete('/:id', async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    await Transfer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transfer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 