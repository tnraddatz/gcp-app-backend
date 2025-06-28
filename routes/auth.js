const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.get('/user', authenticateToken, (req, res) => {
  res.json({ user: req.user, message: 'User data (Authenticated)' });
});

module.exports = router;
