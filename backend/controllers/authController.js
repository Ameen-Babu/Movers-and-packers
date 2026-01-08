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


const Admin = require('../models/Admin');


const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, city, pincode, companyName, licenseNo, registerId } = req.body;

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
        } else if (role === 'admin') {
            if (!registerId) {
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ message: 'Please add registerId for admin' });
            }
            await Admin.create({
                userId: user._id,
                registerId,
            });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
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
        let profileData = {};
        if (user.role === 'client') {
            profileData = await Client.findOne({ userId: user._id });
        } else if (user.role === 'provider') {
            profileData = await Provider.findOne({ userId: user._id });
        } else if (user.role === 'admin') {
            profileData = await Admin.findOne({ userId: user._id });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            ...(profileData ? profileData.toObject() : {}),
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};


const getMe = async (req, res) => {
    let profileData = {};
    if (req.user.role === 'client') {
        profileData = await Client.findOne({ userId: req.user._id });
    } else if (req.user.role === 'provider') {
        profileData = await Provider.findOne({ userId: req.user._id });
    } else if (req.user.role === 'admin') {
        profileData = await Admin.findOne({ userId: req.user._id });
    }

    res.status(200).json({
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        ...(profileData ? profileData.toObject() : {}),
    });
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, address, city, pincode, companyName, licenseNo } = req.body;

        // Update User base fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        await user.save();

        let profile;
        if (user.role === 'client') {
            profile = await Client.findOne({ userId: user._id });
            if (profile) {
                profile.address = address || profile.address;
                profile.city = city || profile.city;
                profile.pincode = pincode || profile.pincode;
                await profile.save();
            }
        } else if (user.role === 'provider') {
            profile = await Provider.findOne({ userId: user._id });
            if (profile) {
                profile.companyName = companyName || profile.companyName;
                profile.licenseNo = licenseNo || profile.licenseNo;
                await profile.save();
            }
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            ...(profile ? profile.toObject() : {}),
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
};
