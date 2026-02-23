const express = require('express');
const router = express.Router();
const Creator = require('../models/Creator');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if username or email already exists
    const existing = await Creator.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: existing.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    const creator = await Creator.create({ name, username, email, password });
    const token = creator.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        username: creator.username,
        email: creator.email,
        plan: creator.plan
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const creator = await Creator.findOne({ email }).select('+password');
    if (!creator || !(await creator.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = creator.getSignedJwtToken();

    res.json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        username: creator.username,
        email: creator.email,
        plan: creator.plan,
        profilePhoto: creator.profilePhoto,
        bio: creator.bio,
        niche: creator.niche
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, creator: req.creator });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, instagramHandle, niche, whatsappNumber, emailNotifications, whatsappNotifications } = req.body;

    const updated = await Creator.findByIdAndUpdate(
      req.creator._id,
      { name, bio, instagramHandle, niche, whatsappNumber, emailNotifications, whatsappNotifications },
      { new: true, runValidators: true }
    );

    res.json({ success: true, creator: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
