const crypto = require('crypto');

const getSecret = () => {
    return process.env.OTP_SECRET || process.env.JWT_SECRET || 'hydrox_otp_secret_fallback';
};

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
    return crypto
        .createHmac('sha256', getSecret())
        .update(String(otp).trim())
        .digest('hex');
};

const verifyOTPHash = (inputOtp, storedHash) => {
    if (!inputOtp || !storedHash) return false;
    const computedHash = hashOTP(inputOtp);
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');

    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTPHash
};
