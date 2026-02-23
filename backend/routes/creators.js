const express = require('express');
const router = express.Router();
const Creator = require('../models/Creator');

// GET /api/creators/:username — Public creator profile
router.get('/:username', async (req, res) => {
  try {
    const creator = await Creator.findOne({ username: req.params.username, isActive: true })
      .select('name username bio profilePhoto niche instagramHandle');

    if (!creator) return res.status(404).json({ success: false, error: 'Creator not found' });

    res.json({ success: true, creator });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
