const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const Admin = require('../model/Admin');
const FRONTEND = 'https://uzima.ai'

const register = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, bio, specialty } = req.body;

    // Basic validation
    if (!email || !firstName || !lastName || !bio || !phoneNumber || !specialty) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if the user already exists
        const existingCounsellor = await Counsellor.findOne({ email });
        if (existingCounsellor) {
            return res.status(400).json({ message: 'Counsellor already exists' });
        }

        // Create new user
        const newCounsellor = new Counsellor({
            firstName,
            lastName,
            email,
            bio,
            phoneNumber,
            specialty      
        });

        // Save the user to the database
        await newCounsellor.save();

        res.status(201).json({ message: 'Counsellor registered successfully.' });
    } catch (error) {
        console.error('Error registering counsellor:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { register, login };
