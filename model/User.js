const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  },
  registeredByCompany: {
    type: Boolean,
    default: false,
  },
  firstLogin: {
    type: Boolean,
    default: false,
  },
  otpEnabled: {
    type: Boolean,
    default: false,
  },
  otpSecret: {
    type: String,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
