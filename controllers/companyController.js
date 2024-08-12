const bcrypt = require('bcryptjs');
const Company = require('../model/Company');
const Plan = require('../model/Plan');
// const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email'); // Import your sendEmail function
const User = require('../model/User');

// Generate a random password
const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex'); // Generate a random 16-character password
};

const createCompany = async (req, res) => {
  const { name, address, planSubscribedTo, email, password } = req.body;

  // Basic validation
  if (!name || !address || !planSubscribedTo || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if the plan exists
    const plan = await Plan.findById(planSubscribedTo);
    if (!plan) {
      return res.status(400).json({ message: 'Plan not found' });
    }

    // Check if the company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new company
    const newCompany = new Company({
      name,
      address,
      planSubscribedTo,
      email,
      password: hashedPassword,
    });

    // Save the company to the database
    await newCompany.save();

    res.status(201).json({ message: 'Company created successfully', company: newCompany });
  } catch (error) {
    console.error('Error creating company:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerCompanyUser = async (req, res) => {
  const { companyId, firstName, lastName, email } = req.body;

  try {

    if (!companyId || !firstName || !lastName || !email) {
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
      companyId,
      registeredByCompany: true,
      firstLogin: true, // Indicate that the user must change the password on first login
    });

    await newUser.save();

    // Send the user an email with their credentials
    await sendEmail(email, 'Your New Account Credentials', `Your account has been created. Here are your credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
}

const editCompany = async (req, res) => {
  const { id } = req.params;
  const { name, address, planSubscribedTo, email, password } = req.body;

  try {
    const updateData = { name, address, planSubscribedTo, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company updated successfully', company: updatedCompany });
  } catch (error) {
    console.error('Error updating company:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const companyLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { _id: company._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getCompanyUsers = async (req, res) => {
  const { companyId } = req.params;
    try {
        const users = await User.find({ companyId });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createCompany, editCompany, registerCompanyUser, companyLogin, getCompanyUsers, deleteCompany };
