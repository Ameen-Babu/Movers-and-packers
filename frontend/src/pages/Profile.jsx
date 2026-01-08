import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Save } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        companyName: '',
        licenseNo: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setFormData({
                name: storedUser.name || '',
                email: storedUser.email || '',
                phone: storedUser.phone || '',
                address: storedUser.address || '',
                city: storedUser.city || '',
                pincode: storedUser.pincode || '',
                companyName: storedUser.companyName || '',
                licenseNo: storedUser.licenseNo || ''
            });
        } else {
            window.location.href = '/login';
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...user, ...data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('userLogin'));
                setMessage('Profile updated successfully');
            } else {
                setMessage(data.message || 'Update failed');
            }
        } catch (err) {
            setMessage('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = (e) => {
        e.target.select();
    };

    if (!user) return null;

    return (
        <div className="profile-page section-padding" style={{ paddingTop: '40px' }}>
            <div className="container">
                <div className="white-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
                    <h2 style={{ marginBottom: '25px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
                        <User size={24} color="var(--primary)" /> My Profile
                    </h2>

                    {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px' }}>{message}</div>}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>FULL NAME</label>
                                <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                    <User size={16} color="#888" style={{ marginRight: '10px' }} />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>EMAIL</label>
                                <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                    <Mail size={16} color="#888" style={{ marginRight: '10px' }} />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: '#999', cursor: 'not-allowed', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>PHONE</label>
                                <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                    <Phone size={16} color="#888" style={{ marginRight: '10px' }} />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                    />
                                </div>
                            </div>

                            {user.role === 'client' && (
                                <>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>ADDRESS</label>
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                            <MapPin size={16} color="#888" style={{ marginRight: '10px' }} />
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>CITY</label>
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                            <Building size={16} color="#888" style={{ marginRight: '10px' }} />
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>PINCODE</label>
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                            <MapPin size={16} color="#888" style={{ marginRight: '10px' }} />
                                            <input
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.role === 'provider' && (
                                <>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>COMPANY NAME</label>
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                            <Building size={16} color="#888" style={{ marginRight: '10px' }} />
                                            <input
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>LICENSE NO</label>
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '8px 12px' }}>
                                            <CreditCard size={16} color="#888" style={{ marginRight: '10px' }} />
                                            <input
                                                name="licenseNo"
                                                value={formData.licenseNo}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ marginTop: '25px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', fontSize: '14px' }}
                        >
                            {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default Profile;
