const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    specialty: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Counsellor = mongoose.model('Counsellor', counsellorSchema);

module.exports = Counsellor;
