import React, { useState } from 'react';
import { User, Mail, Lock, Phone, ShieldCheck, Truck, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
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
                setSuccess('Admin registration submitted! Account pending SuperAdmin approval.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
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
                            <p className="auth-brand-tagline">STAFF & ADMIN DISPATCH PORTAL</p>
                        </div>

                        <div className="auth-brand-body">
                            <h2>Admin Command & Operations Control</h2>
                            <p>Register as an internal staff administrator to claim customer move requests, manage fleet assignments, and issue binding survey invoices.</p>
                            
                            <div className="auth-feature-list">
                                <div className="auth-feat-item">
                                    <ShieldCheck size={18} className="feat-icon" />
                                    <span>SuperAdmin Approval & Audit Controls</span>
                                </div>
                                <div className="auth-feat-item">
                                    <Truck size={18} className="feat-icon" />
                                    <span>Live Relocation Dispatch Management</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-brand-footer">
                            <span>Internal Staff Access Only</span>
                        </div>
                    </div>

                    {/* Right Form Side */}
                    <div className="auth-form-side">
                        <div className="auth-form-header">
                            <h2>Admin Registration</h2>
                            <p>Register for internal administrative dispatch credentials</p>
                        </div>

                        {error && (
                            <div className="auth-error-banner">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="auth-error-banner" style={{ background: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}>
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form-body">
                            <div className="form-grid-2">
                                <div className="form-group-field full-width">
                                    <label>Admin Officer Name</label>
                                    <div className="input-icon-wrapper">
                                        <User size={18} className="input-left-icon" />
                                        <input 
                                            name="name" 
                                            type="text" 
                                            placeholder="Vikram Nair" 
                                            value={formData.name}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field full-width">
                                    <label>Corporate Email</label>
                                    <div className="input-icon-wrapper">
                                        <Mail size={18} className="input-left-icon" />
                                        <input 
                                            name="email" 
                                            type="email" 
                                            placeholder="vikram.admin@hydrox.in" 
                                            value={formData.email}
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-field full-width">
                                    <label>Direct Mobile Phone</label>
                                    <div className="input-icon-wrapper">
                                        <Phone size={18} className="input-left-icon" />
                                        <input 
                                            name="phone" 
                                            type="text" 
                                            placeholder="+91 98450 12345" 
                                            value={formData.phone}
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

                                <div className="form-group-field">
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
                                {loading ? 'Submitting Application...' : (
                                    <>
                                        Register Admin Account <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-form-footer">
                            <p>
                                Already registered? <Link to="/login">Sign In to Portal</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
