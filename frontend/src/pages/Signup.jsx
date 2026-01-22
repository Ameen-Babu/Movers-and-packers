import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Building, ShieldCheck, Truck, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'client',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user || data));
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('userLogin'));
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Server connection error. Is the backend running on port 5000?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="container auth-content-container">
                <div className="auth-card-dual">
                    {/* Left Brand Side */}
                    <div className="auth-brand-side">
                        <div className="auth-brand-header">
                            <span className="auth-brand-name">HYDROX <span className="accent">MOVERS</span></span>
                            <p className="auth-brand-tagline">CLIENT REGISTRATION PORTAL</p>
                        </div>

                        <div className="auth-brand-body">
                            <h2>Join Thousands of Satisfied Homeowners & Businesses</h2>
                            <p>Create your client account to calculate instant fare quotes, request surveys, and track active moves in real time.</p>
                            
                            <div className="auth-feature-list">
                                <div className="auth-feat-item">
                                    <ShieldCheck size={18} className="feat-icon" />
                                    <span>Zero Hidden Charges & Written Binding Quotes</span>
                                </div>
                                <div className="auth-feat-item">
                                    <Truck size={18} className="feat-icon" />
                                    <span>Direct Fleet Dispatch with GPS Monitoring</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-brand-footer">
                        </div>
                    </div>

                    {/* Right Form Side */}
                    <div className="auth-form-side">
                        <div className="auth-form-header">
                            <h2>Create Account</h2>
                            <p>Register as a client to manage your relocations</p>
                        </div>

                        {error && (
                            <div className="auth-error-banner">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form-body">
                            <div className="form-grid-2">
                                <div className="form-group-field">
                                    <label>Full Name</label>
                                    <div className="input-icon-wrapper">
                                        <User size={18} className="input-left-icon" />
                                        <input 
                                            name="name" 
                                            type="text" 
                                            placeholder="e.g. Rahul Sharma" 
                                            value={formData.name}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label>Email Address</label>
                                    <div className="input-icon-wrapper">
                                        <Mail size={18} className="input-left-icon" />
                                        <input 
                                            name="email" 
                                            type="email" 
                                            placeholder="rahul.sharma@example.com" 
                                            value={formData.email}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label>Phone Number</label>
                                    <div className="input-icon-wrapper">
                                        <Phone size={18} className="input-left-icon" />
                                        <input 
                                            name="phone" 
                                            type="text" 
                                            placeholder="+91 98765 43210" 
                                            value={formData.phone}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label>City</label>
                                    <div className="input-icon-wrapper">
                                        <Building size={18} className="input-left-icon" />
                                        <input 
                                            name="city" 
                                            type="text" 
                                            placeholder="Kochi" 
                                            value={formData.city}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field full-width">
                                    <label>Street Address</label>
                                    <div className="input-icon-wrapper">
                                        <MapPin size={18} className="input-left-icon" />
                                        <input 
                                            name="address" 
                                            type="text" 
                                            placeholder="Flat 4B, Skyline Towers, Edappally" 
                                            value={formData.address}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label>Pincode</label>
                                    <div className="input-icon-wrapper">
                                        <MapPin size={18} className="input-left-icon" />
                                        <input 
                                            name="pincode" 
                                            type="text" 
                                            placeholder="682024" 
                                            value={formData.pincode}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label>Password</label>
                                    <div className="input-icon-wrapper">
                                        <Lock size={18} className="input-left-icon" />
                                        <input 
                                            name="password" 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="••••••••" 
                                            value={formData.password}
                                            required 
                                            onChange={handleChange} 
                                        />
                                        <button
                                            type="button"
                                            className="btn-toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group-field full-width">
                                    <label>Confirm Password</label>
                                    <div className="input-icon-wrapper">
                                        <Lock size={18} className="input-left-icon" />
                                        <input 
                                            name="confirmPassword" 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="••••••••" 
                                            value={formData.confirmPassword}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-auth-submit" disabled={loading}>
                                {loading ? 'Creating Account...' : (
                                    <>
                                        Register Account <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-form-footer">
                            <p>
                                Already have an account? <Link to="/login">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
