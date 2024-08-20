const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["daily", "monthly"],
    required: true,
  },
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
