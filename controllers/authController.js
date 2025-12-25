const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Client = require('../models/Client');
const Provider = require('../models/Provider');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, city, pincode, companyName, licenseNo } = req.body;

        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ message: 'Please add all required base fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create base User
        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            phone,
            role,
        });

        // Create specific profile based on role
        if (role === 'client') {
            if (!address || !city || !pincode) {
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ message: 'Please add address, city, and pincode for client' });
            }
            await Client.create({
                userId: user._id,
                address,
                city,
                pincode,
            });
        } else if (role === 'provider') {
            if (!companyName || !licenseNo) {
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ message: 'Please add companyName and licenseNo for provider' });
            }
            await Provider.create({
                userId: user._id,
                companyName,
                licenseNo,
            });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Invalid user data', error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};


const getMe = async (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
