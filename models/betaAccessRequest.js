const mongoose = require('mongoose');

const BetaAccessRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  designFirmLocation: {
    type: String,
    required: true,
    trim: true,
  },
  roleDesignFocus: {
    type: String,
    required: true,
    trim: true,
  },
  curiosity: {
    type: String,
    required: true,
    trim: true,
  },
  howHeard: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  verificationToken: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.models.BetaAccessRequest || mongoose.model('BetaAccessRequest', BetaAccessRequestSchema);
