const mongoose = require('mongoose');

const ProbeDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  participantNumber: {
    type: String,
    required: true,
  },
  vitalType: {
    type: String,
    required: true,
  },
  currentCondition: {
    type: String,
    required: true,
  },
  trend: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Pdata', ProbeDataSchema);
