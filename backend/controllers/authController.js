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
        const { name, email, password, role, phone, address, city, pincode, companyName, licenseNo } = req.body;

        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
        if (userExists) {
            return res.status(400).json({ message: 'Account already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: normalizedEmail,
            passwordHash: hashedPassword,
            phone,
            role: role || 'client',
            isApproved: role === 'admin' ? false : true,
        });

        if (role === 'client') {
            await Client.create({
                userId: user._id,
                address: address || 'Flat 4B, Skyline Towers, Edappally',
                city: city || 'Kochi',
                pincode: pincode || '682024',
            });
        } else if (role === 'provider') {
            await Provider.create({
                userId: user._id,
                companyName: companyName || 'Hydrox Logistics',
                licenseNo: licenseNo || `HYD-${Math.floor(10000 + Math.random() * 90000)}`,
            });
        } else if (role === 'admin') {
            await Admin.create({
                userId: user._id,
            });
        }

        if (role === 'admin') {
            return res.status(201).json({
                message: 'Admin registration submitted. Pending approval.',
                pending: true,
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                }
            });
        } else {
            const token = generateToken(user.id);
            return res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: token,
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    token: token,
                }
            });
        }
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(400).json({ message: 'Registration failed', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            if (user.role === 'admin' && !user.isApproved) {
                return res.status(403).json({ message: 'Your admin account is pending approval' });
            }

            let profileData = {};
            if (user.role === 'client') {
                profileData = await Client.findOne({ userId: user._id });
            } else if (user.role === 'provider') {
                profileData = await Provider.findOne({ userId: user._id });
            } else if (['admin', 'superadmin'].includes(user.role)) {
                profileData = await Admin.findOne({ userId: user._id });
            }

            return res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isApproved: user.isApproved,
                ...(profileData ? profileData.toObject() : {}),
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    isApproved: user.isApproved,
                    token: generateToken(user.id),
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid email or password. Please check your credentials or register.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal server login error', error: error.message });
    }
};


const getMe = async (req, res) => {
    try {
        let profileData = {};
        if (req.user.role === 'client') {
            profileData = await Client.findOne({ userId: req.user._id });
        } else if (req.user.role === 'provider') {
            profileData = await Provider.findOne({ userId: req.user._id });
        } else if (['admin', 'superadmin'].includes(req.user.role)) {
            profileData = await Admin.findOne({ userId: req.user._id });
        }

        const extraData = profileData && typeof profileData.toObject === 'function' ? profileData.toObject() : (profileData || {});

        return res.status(200).json({
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            isApproved: req.user.isApproved,
            ...extraData,
        });
    } catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, address, city, pincode, companyName, licenseNo } = req.body;

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        await user.save();

        let clientProfile = await Client.findOne({ userId: user._id });
        if (!clientProfile) {
            clientProfile = await Client.create({
                userId: user._id,
                address: address || '',
                city: city || '',
                pincode: pincode || ''
            });
        } else {
            if (address !== undefined) clientProfile.address = address;
            if (city !== undefined) clientProfile.city = city;
            if (pincode !== undefined) clientProfile.pincode = pincode;
            await clientProfile.save();
        }

        if (user.role === 'provider') {
            let providerProfile = await Provider.findOne({ userId: user._id });
            if (providerProfile) {
                if (companyName !== undefined) providerProfile.companyName = companyName;
                if (licenseNo !== undefined) providerProfile.licenseNo = licenseNo;
                await providerProfile.save();
            }
        }

        const responseObj = {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: clientProfile.address,
            city: clientProfile.city,
            pincode: clientProfile.pincode,
            token: generateToken(user.id),
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: clientProfile.address,
                city: clientProfile.city,
                pincode: clientProfile.pincode,
                token: generateToken(user.id),
            }
        };

        return res.status(200).json(responseObj);
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile
};
