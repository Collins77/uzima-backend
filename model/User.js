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
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: '66addc7680a7383656304b26',
  },
  plan:{
    type:String,
    default:String
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  promptsToday: {
    type: Number,
    default: 0
},
lastPromptReset: {
    type: String, // Date in YYYY-MM-DD format
    default: new Date().toISOString().split('T')[0]
},
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
