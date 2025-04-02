// models/WorkerFilter.js
const mongoose = require('mongoose');

const workerFilterSchema = new mongoose.Schema({
  roles: [{ type: String }],
  genders: [{ type: String }],
  departments: [{ type: String }],
  employmentTypes: [{ type: String }],
  documentTypes: [{ type: String }]
});

module.exports = mongoose.models.WorkerFilter||mongoose.model('WorkerFilter', workerFilterSchema);

