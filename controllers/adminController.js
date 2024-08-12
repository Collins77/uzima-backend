const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const Admin = require('../model/Admin');
const Counsellor = require('../model/Counsellor');
const User = require('../model/User');
const Company = require('../model/Company');
const FRONTEND = 'https://uzima.ai';
const crypto = require('crypto');
const Plan = require('../model/Plan');

// Generate a random password
const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex'); // Generate a random 16-character password
};

const register = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if the user already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // const otpSecret = authenticator.generateSecret();
        const otpSecret = speakeasy.generateSecret().base32;
        // const otpSecret = STATIC_OTP_SECRET;

        // Create new user
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        // Check if user exists
        if (!admin) {
            return res.status(401).json({ message: 'Admin does not exist' });
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT token if OTP is not enabled
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, admin });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createCounsellor = async (req, res) => {
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
}

const getCounsellors = async (req, res) => {
    try {
        const counsellors = await Counsellor.find(); // Fetch all users from the database
        res.status(200).json(counsellors);     // Send the users as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
const getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users);     // Send the users as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find(); // Fetch all users from the database
        res.status(200).json(companies);     // Send the users as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find(); // Fetch all users from the database
        res.status(200).json(plans);     // Send the users as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
const createUser = async (req, res) => {
    const { firstName, lastName, email } = req.body;

    try {

        if (!firstName || !lastName || !email) {
            return res.status(404).json({ message: 'Please provide all the details' });
        }
        // Generate and hash a new password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with company details
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isVerified: true
        });

        await newUser.save();

        // Send the user an email with their credentials
        await sendEmail(email, 'Your New Account Credentials', `Your account has been created. Here are your credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`);

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
}

const createPlan = async (req, res) => {
    const { name, description, price, duration,  } = req.body;

    // Basic validation
    if (!name || !description || !price) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const newPlan = new Plan({ name, description, price });
        await newPlan.save();
        res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
    } catch (error) {
        console.error('Error creating plan:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { register, login, createCounsellor, getPlans, getCounsellors, createPlan, getUsers, getCompanies, createUser };
