const express = require('express');
const router = express.Router();
const { registerCompany, loginCompany } = require('../controllers/authController');

// Register Route
router.post('/register', registerCompany);

// Login Route
router.post('/login', loginCompany);

module.exports = router;
