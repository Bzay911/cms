const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Route to get worker filters
router.get('/', (req, res) => {
  try {
    const filtersPath = path.join(__dirname, '../data/workerFilters.json');
    const data = fs.readFileSync(filtersPath, 'utf-8');
    const filters = JSON.parse(data);
    res.status(200).json(filters);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ error: 'Failed to fetch filter options.' });
  }
});

module.exports = router;
