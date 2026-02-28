const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Client = require('../models/Client');
const { sendWelcomeEmail } = require('../utils/emailService');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const Admin = require('../models/Admin');
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, city, pincode, companyName, licenseNo } = req.body;

        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ message: 'Please add all required base fields' });
        }


        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            phone,
            role,
            isApproved: (role === 'admin' || role === 'superadmin') ? false : true,
        });


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
        } else if (role === 'admin' || role === 'superadmin') {
            await Admin.create({
                userId: user._id,
            });
        }

        if (user) {
            sendWelcomeEmail({ to: user.email, name: user.name, role: user.role })
                .catch((err) => console.error('Welcome email failed:', err.message));

            if (role === 'admin' || role === 'superadmin') {
                res.status(201).json({
                    message: 'Admin registration submitted. Please wait for approval from an existing admin.',
                    pending: true,
                });
            } else {
                res.status(201).json({
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    token: generateToken(user.id),
                });
            }
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

        if (user.role === 'admin' && !user.isApproved) {
            return res.status(403).json({ message: 'Your admin account is pending approval' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
        }

        let profileData = {};
        if (user.role === 'client') {
            profileData = await Client.findOne({ userId: user._id });
        } else if (user.role === 'admin' || user.role === 'superadmin') {
            profileData = await Admin.findOne({ userId: user._id });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isApproved: user.isApproved,
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
    } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        profileData = await Admin.findOne({ userId: req.user._id });
    }

    res.status(200).json({
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        isApproved: req.user.isApproved,
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

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { newEmail, password } = req.body;
        if (!newEmail || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }
        const emailTaken = await User.findOne({ email: newEmail });
        if (emailTaken) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        user.email = newEmail;
        await user.save();
        res.json({ message: 'Email updated successfully', email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    changePassword,
    changeEmail,
};
