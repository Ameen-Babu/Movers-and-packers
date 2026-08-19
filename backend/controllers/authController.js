const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Provider = require('../models/Provider');
const Admin = require('../models/Admin');
const PendingRegistration = require('../models/PendingRegistration');
const { generateOTP, hashOTP, verifyOTPHash } = require('../utils/otpHelper');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const signupInitiate = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, city, pincode, companyName, licenseNo } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
        if (userExists) {
            await bcrypt.hash('dummy_password_for_timing', 10);
            return res.status(400).json({ message: 'Account already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpHash = hashOTP(otp);

        await PendingRegistration.findOneAndUpdate(
            { email: normalizedEmail },
            {
                email: normalizedEmail,
                otpHash,
                userData: {
                    name,
                    passwordHash: hashedPassword,
                    phone,
                    role: role || 'client',
                    address: address || '',
                    city: city || '',
                    pincode: pincode || '',
                    companyName: companyName || '',
                    licenseNo: licenseNo || ''
                },
                attempts: 0,
                resendCount: 0,
                lastSentAt: new Date(),
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        await sendOTPEmail({ to: normalizedEmail, name, otp });

        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent to your email address',
            email: normalizedEmail,
            expiresInSeconds: 600,
            cooldownSeconds: 60
        });
    } catch (error) {
        console.error('Signup Initiate Error:', error);
        return res.status(500).json({ message: 'Failed to send verification email. Please verify your email address.', error: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = String(otp).trim();

        if (!/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({ message: 'Verification code must be 6 numeric digits' });
        }

        const pending = await PendingRegistration.findOne({ email: normalizedEmail });
        if (!pending) {
            return res.status(400).json({ message: 'Verification session expired or not found. Please sign up again.' });
        }

        const isValid = verifyOTPHash(cleanOtp, pending.otpHash);
        if (!isValid) {
            pending.attempts += 1;
            if (pending.attempts >= 5) {
                await PendingRegistration.deleteOne({ _id: pending._id });
                return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please restart registration.' });
            }
            await pending.save();
            return res.status(400).json({
                message: 'Invalid verification code',
                attemptsRemaining: 5 - pending.attempts
            });
        }

        let user;
        let session = null;
        let useTransactions = false;

        try {
            session = await mongoose.startSession();
            session.startTransaction();
            useTransactions = true;
        } catch (sessErr) {
            useTransactions = false;
        }

        if (useTransactions && session) {
            try {
                const userArray = await User.create([{
                    name: pending.userData.name,
                    email: pending.email,
                    passwordHash: pending.userData.passwordHash,
                    phone: pending.userData.phone,
                    role: pending.userData.role || 'client',
                    isApproved: pending.userData.role === 'admin' ? false : true,
                    isActive: true,
                    isEmailVerified: true
                }], { session });

                user = userArray[0];

                if (pending.userData.role === 'client') {
                    await Client.create([{
                        userId: user._id,
                        address: pending.userData.address || 'Flat 4B, Skyline Towers, Edappally',
                        city: pending.userData.city || 'Kochi',
                        pincode: pending.userData.pincode || '682024'
                    }], { session });
                } else if (pending.userData.role === 'provider') {
                    await Provider.create([{
                        userId: user._id,
                        companyName: pending.userData.companyName || 'Hydrox Logistics',
                        licenseNo: pending.userData.licenseNo || `HYD-${Math.floor(10000 + Math.random() * 90000)}`
                    }], { session });
                } else if (pending.userData.role === 'admin') {
                    await Admin.create([{
                        userId: user._id
                    }], { session });
                }

                await PendingRegistration.deleteOne({ _id: pending._id }, { session });
                await session.commitTransaction();
                session.endSession();
            } catch (txErr) {
                await session.abortTransaction();
                session.endSession();
                throw txErr;
            }
        } else {
            user = await User.create({
                name: pending.userData.name,
                email: pending.email,
                passwordHash: pending.userData.passwordHash,
                phone: pending.userData.phone,
                role: pending.userData.role || 'client',
                isApproved: pending.userData.role === 'admin' ? false : true,
                isActive: true,
                isEmailVerified: true
            });

            try {
                if (pending.userData.role === 'client') {
                    await Client.create({
                        userId: user._id,
                        address: pending.userData.address || 'Flat 4B, Skyline Towers, Edappally',
                        city: pending.userData.city || 'Kochi',
                        pincode: pending.userData.pincode || '682024'
                    });
                } else if (pending.userData.role === 'provider') {
                    await Provider.create({
                        userId: user._id,
                        companyName: pending.userData.companyName || 'Hydrox Logistics',
                        licenseNo: pending.userData.licenseNo || `HYD-${Math.floor(10000 + Math.random() * 90000)}`
                    });
                } else if (pending.userData.role === 'admin') {
                    await Admin.create({
                        userId: user._id
                    });
                }
                await PendingRegistration.deleteOne({ _id: pending._id });
            } catch (rollbackErr) {
                await User.findByIdAndDelete(user._id);
                throw rollbackErr;
            }
        }

        sendWelcomeEmail({ to: user.email, name: user.name, role: user.role }).catch((mailErr) => {
            console.error('Welcome email async delivery error:', mailErr.message);
        });

        if (user.role === 'admin') {
            return res.status(201).json({
                success: true,
                message: 'Email verified. Admin registration submitted and pending approval.',
                pending: true,
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    isEmailVerified: true,
                    isApproved: user.isApproved
                }
            });
        } else {
            let profileData = {};
            const clientDoc = await Client.findOne({ userId: user._id });
            if (clientDoc) {
                profileData.address = clientDoc.address || '';
                profileData.city = clientDoc.city || '';
                profileData.pincode = clientDoc.pincode || '';
            }
            if (user.role === 'provider') {
                const providerDoc = await Provider.findOne({ userId: user._id });
                if (providerDoc) {
                    profileData.companyName = providerDoc.companyName || '';
                    profileData.licenseNo = providerDoc.licenseNo || '';
                }
            }
            const token = generateToken(user.id);
            const userPayload = {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isEmailVerified: true,
                token: token,
                ...profileData
            };
            return res.status(201).json({
                success: true,
                message: 'Email verified and account created successfully',
                ...userPayload,
                user: userPayload
            });
        }
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const pending = await PendingRegistration.findOne({ email: normalizedEmail });

        if (!pending) {
            hashOTP('dummy_otp');
            return res.status(400).json({ message: 'No active registration found for this email. Please sign up.' });
        }

        if (pending.resendCount >= 3) {
            return res.status(429).json({ message: 'Maximum resend limit reached for this session. Please restart registration.' });
        }

        const cooldowns = [60, 120, 300];
        const requiredCooldown = cooldowns[pending.resendCount] || 300;
        const elapsedSeconds = Math.floor((Date.now() - new Date(pending.lastSentAt).getTime()) / 1000);

        if (elapsedSeconds < requiredCooldown) {
            const retryAfter = requiredCooldown - elapsedSeconds;
            return res.status(429).json({
                message: `Please wait ${retryAfter} seconds before requesting another verification code.`,
                retryAfterSeconds: retryAfter
            });
        }

        const freshOtp = generateOTP();
        const freshHash = hashOTP(freshOtp);

        pending.otpHash = freshHash;
        pending.resendCount += 1;
        pending.attempts = 0;
        pending.lastSentAt = new Date();
        pending.createdAt = new Date();
        await pending.save();

        await sendOTPEmail({ to: pending.email, name: pending.userData.name, otp: freshOtp });

        const nextCooldown = cooldowns[pending.resendCount] || 300;

        return res.status(200).json({
            success: true,
            message: 'A fresh verification OTP has been sent to your email',
            expiresInSeconds: 600,
            cooldownSeconds: nextCooldown,
            resendsRemaining: 3 - pending.resendCount
        });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        return res.status(500).json({ message: 'Server error resending verification code', error: error.message });
    }
};

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
            isEmailVerified: true
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
                    isEmailVerified: true
                }
            });
        } else {
            const token = generateToken(user.id);
            const userPayload = {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isEmailVerified: true,
                token: token,
                ...profileData
            };
            return res.status(201).json({
                ...userPayload,
                user: userPayload
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
            const clientDoc = await Client.findOne({ userId: user._id });
            if (clientDoc) {
                profileData.address = clientDoc.address || '';
                profileData.city = clientDoc.city || '';
                profileData.pincode = clientDoc.pincode || '';
            }
            if (user.role === 'provider') {
                const providerDoc = await Provider.findOne({ userId: user._id });
                if (providerDoc) {
                    profileData.companyName = providerDoc.companyName || '';
                    profileData.licenseNo = providerDoc.licenseNo || '';
                }
            }

            const token = generateToken(user.id);
            const userPayload = {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isApproved: user.isApproved,
                isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true,
                ...profileData,
                token: token
            };

            return res.json({
                ...userPayload,
                user: userPayload
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
        const clientDoc = await Client.findOne({ userId: req.user._id });
        if (clientDoc) {
            profileData.address = clientDoc.address || '';
            profileData.city = clientDoc.city || '';
            profileData.pincode = clientDoc.pincode || '';
        }
        if (req.user.role === 'provider') {
            const providerDoc = await Provider.findOne({ userId: req.user._id });
            if (providerDoc) {
                profileData.companyName = providerDoc.companyName || '';
                profileData.licenseNo = providerDoc.licenseNo || '';
            }
        }

        return res.status(200).json({
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            isApproved: req.user.isApproved,
            isEmailVerified: req.user.isEmailVerified !== undefined ? req.user.isEmailVerified : true,
            ...profileData,
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
    signupInitiate,
    verifyOTP,
    resendOTP,
    registerUser,
    loginUser,
    getMe,
    updateProfile
};

