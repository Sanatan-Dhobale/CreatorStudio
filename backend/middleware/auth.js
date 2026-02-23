const jwt = require('jsonwebtoken');
const Creator = require('../models/Creator');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'creatorhub_dev_secret_change_in_production_min32chars';
    const decoded = jwt.verify(token, secret);
    req.creator = await Creator.findById(decoded.id);

    if (!req.creator) {
      return res.status(401).json({ success: false, error: 'Creator not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

module.exports = { protect };
