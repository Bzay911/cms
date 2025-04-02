const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  type: { type: String, required: true },
  documentNumber: { type: String, required: true },
  issueDate: Date,
  expiryDate: Date,
});

module.exports = mongoose.model('Document', documentSchema);
