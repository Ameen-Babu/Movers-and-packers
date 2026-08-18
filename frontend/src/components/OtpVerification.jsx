import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, ArrowRight, RotateCcw, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const OtpVerification = ({ email, name, role = 'client', onVerified, onCancel, apiBaseUrl }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(60);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const [isLocked, setIsLocked] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const maskEmail = (val) => {
        if (!val || !val.includes('@')) return val;
        const [local, domain] = val.split('@');
        if (local.length <= 2) return `${local}***@${domain}`;
        return `${local.substring(0, 2)}****${local.substring(local.length - 1)}@${domain}`;
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
    };

    const handleDigitChange = (index, value) => {
        if (isLocked) return;
        const cleanVal = value.replace(/[^0-9]/g, '');
        const newOtp = [...otp];

        if (cleanVal.length > 0) {
            newOtp[index] = cleanVal[cleanVal.length - 1];
            setOtp(newOtp);

            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        } else {
            newOtp[index] = '';
            setOtp(newOtp);
        }

        if (newOtp.every(d => d !== '')) {
            submitVerification(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (isLocked) return;
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        if (isLocked) return;
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        if (pastedData) {
            const digits = pastedData.slice(0, 6).split('');
            const newOtp = ['', '', '', '', '', ''];
            digits.forEach((d, idx) => {
                newOtp[idx] = d;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex]?.focus();

            if (digits.length >= 6) {
                submitVerification(digits.slice(0, 6).join(''));
            }
        }
    };

    const submitVerification = async (codeToVerify) => {
        const fullCode = codeToVerify || otp.join('');
        if (fullCode.length !== 6) {
            setError('Please enter all 6 digits of your verification code');
            triggerShake();
            return;
        }

        setError('');
        setInfo('');
        setLoading(true);

        try {
            const baseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: fullCode })
            });

            const data = await response.json();

            if (response.ok) {
                onVerified(data);
            } else {
                setError(data.message || 'Invalid verification code');
                triggerShake();

                if (data.attemptsRemaining !== undefined) {
                    setAttemptsRemaining(data.attemptsRemaining);
                }

                if (data.message && data.message.includes('Maximum verification attempts exceeded')) {
                    setIsLocked(true);
                }
            }
        } catch (err) {
            setError('Server connection error. Please try again.');
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading || isLocked) return;

        setError('');
        setInfo('');
        setResendLoading(true);

        try {
            const baseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setInfo('A new 6-digit verification code has been sent to your email.');
                setOtp(['', '', '', '', '', '']);
                setCooldown(data.cooldownSeconds || 60);
                setAttemptsRemaining(5);
                inputRefs.current[0]?.focus();
            } else {
                setError(data.message || 'Failed to resend verification code.');
                if (data.retryAfterSeconds) {
                    setCooldown(data.retryAfterSeconds);
                }
            }
        } catch (err) {
            setError('Server connection error while resending code.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="otp-container-panel">
            <div className="otp-header">
                <div className="otp-header-spacer" style={{ height: '20px' }}></div>
                <h2>Verify Email Ownership</h2>
                <p className="otp-subtitle">
                    We've sent a 6-digit security code to <strong className="otp-email-highlight">{maskEmail(email)}</strong>.
                </p>
                <button type="button" className="btn-edit-email" onClick={onCancel} disabled={loading}>
                    Wrong email? Edit details
                </button>
            </div>

            {error && (
                <div className="auth-error-banner">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {info && (
                <div className="auth-error-banner" style={{ background: 'rgba(0, 177, 79, 0.1)', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
                    <CheckCircle size={16} />
                    <span>{info}</span>
                </div>
            )}

            <div className={`otp-boxes-wrapper ${isShaking ? 'otp-shake' : ''}`}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        pattern="[0-9]*"
                        value={digit}
                        disabled={loading || isLocked}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`otp-digit-input ${digit ? 'filled' : ''} ${isLocked ? 'locked' : ''}`}
                        aria-label={`Verification code digit ${index + 1} of 6`}
                    />
                ))}
            </div>

            <div className="otp-meta-info">
                {!isLocked && (
                    <span className="otp-attempts-badge">
                        Attempts remaining: <strong>{attemptsRemaining}</strong>
                    </span>
                )}
            </div>

            {isLocked ? (
                <button type="button" className="btn-auth-submit" onClick={onCancel}>
                    <ArrowLeft size={18} /> Restart Registration
                </button>
            ) : (
                <>
                    <button
                        type="button"
                        className="btn-auth-submit"
                        disabled={loading || otp.join('').length !== 6}
                        onClick={() => submitVerification()}
                    >
                        {loading ? 'Verifying Code...' : (
                            <>
                                Verify &amp; Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="otp-resend-row">
                        <span>Didn't receive the email?</span>
                        {cooldown > 0 ? (
                            <span className="resend-countdown-text">
                                Resend available in <strong>{cooldown}s</strong>
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="btn-resend-link"
                                disabled={resendLoading}
                                onClick={handleResend}
                            >
                                <RotateCcw size={14} />
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default OtpVerification;
