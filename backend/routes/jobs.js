const express = require('express');
const router = express.Router();

// Example route to get all jobs
router.get('/', (req, res) => {
  res.send('Jobs API is running...');
});

module.exports = router;
