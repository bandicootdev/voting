const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },  // Se agrega el campo con valor por defecto
  role: { type: String, default: 'user' },
  votedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }] // Candidatos votados
});

module.exports = mongoose.model('User', UserSchema);
