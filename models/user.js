const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  designFirmLocation: {
    type: String,
    trim: true,
  },
  roleDesignFocus: {
    type: String,
    trim: true,
  },
  curiosity: {
    type: String,
    trim: true,
  },
  howHeard: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
