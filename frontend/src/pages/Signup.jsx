import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Building, CreditCard } from 'lucide-react';
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
        pincode: '',
        companyName: '',
        licenseNo: ''
    });
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
                    <h2>SIGN UP</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>FULL NAME</label>
                                <div className="input-wrapper">
                                    <input name="name" type="text" placeholder="John Doe" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>EMAIL</label>
                                <div className="input-wrapper">
                                    <input name="email" type="email" placeholder="john@example.com" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>PHONE</label>
                                <div className="input-wrapper">
                                    <input name="phone" type="text" placeholder="1234567890" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>ROLE</label>
                                <div className="input-wrapper">
                                    <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                                        <option value="client">Client</option>
                                        <option value="provider">Provider</option>
                                    </select>
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

                            {formData.role === 'client' ? (
                                <>
                                    <div className="form-group full-width">
                                        <label>ADDRESS</label>
                                        <div className="input-wrapper">
                                            <input name="address" type="text" placeholder="123 Main St" required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>CITY</label>
                                        <div className="input-wrapper">
                                            <input name="city" type="text" placeholder="New York" required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>PINCODE</label>
                                        <div className="input-wrapper">
                                            <input name="pincode" type="text" placeholder="10001" required onChange={handleChange} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>COMPANY NAME</label>
                                        <div className="input-wrapper">
                                            <input name="companyName" type="text" placeholder="Hydrox Logistics" required onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>LICENSE NO</label>
                                        <div className="input-wrapper">
                                            <input name="licenseNo" type="text" placeholder="L-12345" required onChange={handleChange} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'SIGN UP'}
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

export default Signup;
