// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Authentication token is missing!' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded; // Save decoded payload to request object
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Invalid token!' });
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');
const User = require('../model/User');
const Company = require('../model/Company');

// Middleware for Admin authentication
const adminAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware for User authentication
const userAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware for Company authentication
const companyAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const company = await Company.findById(decoded.companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        req.company = company;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { adminAuth, userAuth, companyAuth };

