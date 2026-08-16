import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, UserCheck, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('client'); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = data.user || data;
                localStorage.setItem('user', JSON.stringify(userObj));
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('userLogin'));

                const role = userObj.role?.toLowerCase();
                if (['admin', 'superadmin'].includes(role)) {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Login failed. Please check your email and password.');
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
                    {/* Left Brand & Context Banner */}
                    <div className="auth-brand-side">
                        <div className="auth-brand-header">
                            <span className="auth-brand-name">HYDROX <span className="accent">MOVERS</span></span>
                            <p className="auth-brand-tagline">LOGISTICS & RELOCATION PORTAL</p>
                        </div>

                        <div className="auth-brand-body">
                            <h2>Manage Your Relocations With Confidence</h2>
                            <p>Access your live dispatch tracking, itemized quotes, and verified carrier reports in one place.</p>
                            
                            <div className="auth-feature-list">
                                <div className="auth-feat-item">
                                    <ShieldCheck size={18} className="feat-icon" />
                                    <span>Fixed Contract Quotations & Insurance</span>
                                </div>
                                <div className="auth-feat-item">
                                    <Truck size={18} className="feat-icon" />
                                    <span>Real-Time GPS Vehicle Tracking</span>
                                </div>
                                <div className="auth-feat-item">
                                    <UserCheck size={18} className="feat-icon" />
                                    <span>Background Checked Certified Staff</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-brand-footer">
                        </div>
                    </div>

                    {/* Right Form Card */}
                    <div className="auth-form-side">
                        <div className="auth-form-header">
                            <h2>{activeTab === 'admin' ? 'Admin Portal Sign In' : 'Sign In'}</h2>
                            <p>{activeTab === 'admin' ? 'Enter administrative credentials to access operational controls' : 'Enter your credentials to access your account'}</p>
                        </div>

                        {/* Quick Role Tab Switcher */}
                        <div className="auth-role-tabs">
                            <button 
                                type="button" 
                                className={`role-tab-btn ${activeTab === 'client' ? 'active' : ''}`}
                                onClick={() => setActiveTab('client')}
                            >
                                Login
                            </button>
                            <button 
                                type="button" 
                                className={`role-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                                onClick={() => setActiveTab('admin')}
                            >
                                Admin Portal
                            </button>
                        </div>

                        {error && (
                            <div className="auth-error-banner">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form-body">
                            <div className="form-group-field">
                                <label>Email Address</label>
                                <div className="input-icon-wrapper">
                                    <Mail size={18} className="input-left-icon" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group-field">
                                <div className="label-with-link">
                                    <label>Password</label>
                                </div>
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
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-auth-submit" disabled={loading}>
                                {loading ? 'Authenticating...' : (
                                    <>
                                        Sign In <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-form-footer">
                            <p>
                                Don't have an account? <Link to="/signup">Create Client Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
