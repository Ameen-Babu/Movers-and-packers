import React, { useState } from 'react';
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                if (data.pending) {
                    setSuccess('Registration submitted! Please wait for approval from an existing admin.');
                } else {
                    localStorage.setItem('user', JSON.stringify(data.user || data));
                    window.dispatchEvent(new Event('storage'));
                    window.dispatchEvent(new Event('userLogin'));
                    navigate('/dashboard');
                }
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card signup-card">
                    <h2>ADMIN SIGNUP</h2>
                    {error && <div className="auth-error">{error}</div>}
                    {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>{success}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>FULL NAME</label>
                                <div className="input-wrapper">
                                    <input name="name" type="text" placeholder="Admin Name" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>EMAIL</label>
                                <div className="input-wrapper">
                                    <input name="email" type="email" placeholder="admin@example.com" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>PHONE</label>
                                <div className="input-wrapper">
                                    <input name="phone" type="text" placeholder="1234567890" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>PASSWORD</label>
                                <div className="input-wrapper">
                                    <input name="password" type="password" placeholder="********" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>CONFIRM PASSWORD</label>
                                <div className="input-wrapper">
                                    <input name="confirmPassword" type="password" placeholder="********" required onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'CREATE ADMIN ACCOUNT'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
