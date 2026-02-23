const path = require('path');
const dotenv = require('dotenv');

// Load .env FIRST before any other imports that might need env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate critical env vars
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'creatorhub_dev_secret_change_in_production_min32chars';
  console.warn('⚠️  JWT_SECRET not set in .env — using default dev value. Set it in backend/.env for production!');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/creators', require('./routes/creators'));
app.use('/api/brand-inquiry', require('./routes/brandInquiry'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/media-kit', require('./routes/mediaKit'));
app.use('/p', require('./routes/redirect')); // Short link redirect

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/creatorhub')
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
