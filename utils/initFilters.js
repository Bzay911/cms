const mongoose = require('mongoose');
const WorkerFilter = require('../models/WorkerFilter'); // WorkerFilter model
const fs = require('fs');
const path = require('path');

const initializeWorkerFilters = async () => {
  try {
    // Check if the worker filter already exists
    const filterExists = await WorkerFilter.findOne();
    if (filterExists) {
      console.log('Worker filters already exist in the database.');
      return;
    }

    // Read from workerFilters.json
    const dataPath = path.join(__dirname, '../workerFilters.json');
    const filterData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Save worker filters to the database
    const workerFilter = new WorkerFilter(filterData);
    await workerFilter.save();

    console.log('Worker filters successfully initialized in the database.');
  } catch (error) {
    console.error('Error initializing worker filters:', error);
  }
};

module.exports = initializeWorkerFilters;
