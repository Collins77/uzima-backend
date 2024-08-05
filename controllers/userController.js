const bcrypt = require('bcryptjs');
const User = require('../model/User');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const speakeasy = require('speakeasy');

const FRONTEND = 'https://test.ai.uzima.ai'

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // const otpSecret = authenticator.generateSecret();
    const otpSecret = speakeasy.generateSecret().base32;
    // const otpSecret = STATIC_OTP_SECRET;

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      otpSecret,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `${FRONTEND}/verify-email?token=${verificationToken}`;

    await sendEmail(email, 'Email Verification', `Click the link to verify your email: ${verificationLink}`);

    res.status(201).json({ message: 'User registered successfully. Please verify your email' });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'ac8147f18afbfd4e751a5b21d46b5a609ea313da3ef7edcd275fb833fdb6c7a854c59f42497ac1a47407eacea5d135a3d28f30a5485df291b90784182f39e7a4');
    await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true });
    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first.' });
    }

    // Check if OTP is enabled
    if (user.otpEnabled) {
      // Generate and send OTP
      const otp = speakeasy.totp({
        secret: user.otpSecret,
        encoding: 'base32'
      });

      // Send OTP email
      await sendEmail(user.email, 'OTP Code', `Your OTP code is ${otp}`);
      return res.json({ message: 'OTP sent to your email.', otpRequired: true });
    } else {
      // Generate JWT token if OTP is not enabled
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, user });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the OTP secret exists for the user
    if (!user.otpSecret) {
      return res.status(400).json({ message: 'OTP is not enabled for this user' });
    }

    const isValidOtp = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: otp
    });


    if (isValidOtp) {
      // OTP is valid, generate and send JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }

};


const disableOtp = async (req, res) => {
  const { userId } = req.user;
  try {
    await User.findByIdAndUpdate(userId, { otpEnabled: false });
    res.json({ message: 'OTP disabled' });
  } catch (error) {
    console.error('Error disabling OTP:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, verifyEmail, login, verifyOtp, disableOtp };
