const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  votes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Candidate', CandidateSchema);