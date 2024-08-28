const bcrypt = require('bcryptjs');
const User = require('../model/User');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const speakeasy = require('speakeasy');
const fs = require('fs');
const path = require('path');

const FRONTEND = 'https://uzima.ai'

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
      return res.status(400).json({ message: 'User with this email is already registered.' });
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
      // Update user's active status and last login time
      user.isActive = true;
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token if OTP is not enabled
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, user });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserMood = async (req, res) => {
  const { userId, mood } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingRecord = user.moods.find(record => record.date === today);

    if (existingRecord) {
      existingRecord.mood = mood;
    } else {
      user.moods.push({ date: today, mood });
    }

    await user.save();

    res.status(200).json({ message: 'Mood updated successfully.', moods: user.moods });
  } catch (error) {
    console.error('Error updating mood:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};



const updateUser = async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameters
    const { firstName, lastName, email } = req.body;

    try {
        // Find and update the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;

        await user.save();

        res.status(200).json({ message: 'User details updated successfully.', user });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const changePassword = async (req, res) => {
  const { id } = req.params; // Assuming userId is retrieved from the JWT token in the middleware
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the current password matches
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Check if the new password is different from the current password
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }

    // Validate new password (you can add your own criteria here)
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};


const getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ user });
  } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Server error.' });
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

const checkPromptLimit = async (req, res, next) => {
  const { userId } = req.body;

  try {
      const user = await User.findById(userId).populate('planId');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const currentDate = new Date();

      // Check if the user is on the free plan
      if (user.planId.name === 'Free') {
          // Reset the prompt count if it's a new day
          const lastReset = new Date(user.lastPromptReset);
          if (lastReset.toDateString() !== currentDate.toDateString()) {
              user.promptsToday = 0;
              user.lastPromptReset = currentDate;
              await user.save();
          }

          // Check if the user has reached their daily limit
          if (user.promptsToday >= 5) {
              return res.status(403).json({ message: 'Daily prompt limit reached. Upgrade your plan to send more prompts.' });
          }
      }

      // Increment the prompt count
      user.promptsToday += 1;
      await user.save();

      next();
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({email});
    if(!oldUser) {
      return res.status(400).json({ message: 'User not found'});
    }
    //token
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });
    const link = `https://uzima-backe.vercel.app/api/users/reset-password/${oldUser._id}/${token}`;
    // const link = `http://localhost:5000/api/users/reset-password/${oldUser._id}/${token}`;
    const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', oldUser.firstName)
        .replace('{{link}}', link)

    // Send an email with the formatted template
    // await sendMail({
    //     email: oldUser.email,
    //     subject: "Password Reset",
    //     html: formattedTemplate,
    // });
    await sendEmail(oldUser.email, 'Password Reset', `Click on this link to reset your password, ${link}`);
    return res.status(200).json({ message: 'Check your email' })
  } catch (error) {
    
  }
}

const resetPassword = async (req, res) => {
  const {id, token} = req.params;
  const oldUser = await User.findOne({_id: id})
  if(!oldUser) {
    return res.status(400).json({ message: "User does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    res.render('forgot', { email: verify.email, status:"not verified" })
  } catch (error) {
    res.send("Not verified")
  }

}

const resetPasswordComplete = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Update the password for the Reseller document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true } // To return the updated document
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Password successfully updated, render a response
    res.render("forgot", { email: verify.email, status: "verified" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }

}

module.exports = { register, changePassword, updateUserMood, getUserDetails, updateUser, verifyEmail, login, verifyOtp, disableOtp, checkPromptLimit, resetPassword, resetPasswordComplete, forgotPassword  };
