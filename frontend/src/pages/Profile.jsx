import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, KeyRound, MapPin, Truck, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('account'); // 'account' or 'security'
    const [activeForm, setActiveForm] = useState(null);

    const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
    const [emailMsg, setEmailMsg] = useState({ text: '', ok: false });
    const [emailLoading, setEmailLoading] = useState(false);

    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passMsg, setPassMsg] = useState({ text: '', ok: false });
    const [passLoading, setPassLoading] = useState(false);

    const [addressForm, setAddressForm] = useState({ address: '', city: '', pincode: '' });
    const [addressMsg, setAddressMsg] = useState({ text: '', ok: false });
    const [addressLoading, setAddressLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setAddressForm({
                address: storedUser.address || '',
                city: storedUser.city || '',
                pincode: storedUser.pincode || ''
            });
        } else {
            window.location.href = '/login';
        }
    }, []);

    if (!user) return null;

    const token = user.token;
    const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    const toggleForm = (form) => {
        setActiveForm(activeForm === form ? null : form);
        setEmailMsg({ text: '', ok: false });
        setPassMsg({ text: '', ok: false });
        setAddressMsg({ text: '', ok: false });
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        setAddressMsg({ text: '', ok: false });
        try {
            const res = await fetch(`${API}/auth/update-profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    address: addressForm.address,
                    city: addressForm.city,
                    pincode: addressForm.pincode
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddressMsg({ text: data.message || 'Error updating address', ok: false });
            } else {
                const updated = {
                    ...user,
                    ...(data.user || data),
                    address: data.address || addressForm.address,
                    city: data.city || addressForm.city,
                    pincode: data.pincode || addressForm.pincode
                };
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
                setAddressMsg({ text: 'Address updated successfully!', ok: true });
                setActiveForm(null);
            }
        } catch {
            setAddressMsg({ text: 'Unable to update address. Check backend connection.', ok: false });
        }
        setAddressLoading(false);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailMsg({ text: '', ok: false });
        try {
            const res = await fetch(`${API}/auth/change-email`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(emailForm),
            });
            const data = await res.json();
            if (!res.ok) {
                setEmailMsg({ text: data.message, ok: false });
            } else {
                const updated = { ...user, email: data.email };
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
                setEmailForm({ newEmail: '', password: '' });
                setEmailMsg({ text: 'Email address updated successfully!', ok: true });
                setActiveForm(null);
            }
        } catch {
            setEmailMsg({ text: 'Unable to update email. Please check server connection.', ok: false });
        }
        setEmailLoading(false);
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassMsg({ text: 'New passwords do not match', ok: false });
            return;
        }
        setPassLoading(true);
        setPassMsg({ text: '', ok: false });
        try {
            const res = await fetch(`${API}/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPassMsg({ text: data.message, ok: false });
            } else {
                setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPassMsg({ text: 'Password updated successfully!', ok: true });
                setActiveForm(null);
            }
        } catch {
            setPassMsg({ text: 'Unable to update password. Please check server connection.', ok: false });
        }
        setPassLoading(false);
    };

    return (
        <div className="enterprise-profile-page">
            {/* Top User Header Banner */}
            <section className="profile-hero-banner">
                <div className="container">
                    <div className="profile-banner-flex">
                        <div className="profile-avatar-block">
                            <div className="avatar-circle-large">
                                {initialLetter}
                            </div>
                            <div className="profile-identity-info">
                                <div className="identity-title-row">
                                    <h1>{user.name || 'Account User'}</h1>
                                </div>
                                <p className="identity-email">{user.email}</p>
                            </div>
                        </div>

                        <div className="profile-quick-actions">
                            <Link to="/orders" className="btn-profile-action">
                                <Truck size={16} /> My Relocations & Orders <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <section className="profile-main-content section-padding">
                <div className="container" style={{ maxWidth: '900px' }}>
                    {/* Navigation Tab Bar */}
                    <div className="profile-nav-tabs">
                        <button 
                            className={`p-nav-tab ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <User size={16} /> Account Information
                        </button>
                        <button 
                            className={`p-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={16} /> Password & Security
                        </button>
                    </div>

                    {/* Tab 1: Account Information */}
                    {activeTab === 'account' && (
                        <div className="profile-tab-panel">
                            <div className="profile-section-card">
                                <div className="card-section-head">
                                    <div>
                                        <h3>Personal Account Details</h3>
                                        <p>Manage your identity information and contact details on file.</p>
                                    </div>
                                </div>

                                <div className="profile-details-grid">
                                    <div className="p-detail-box">
                                        <div className="p-detail-icon"><User size={18} /></div>
                                        <div className="p-detail-content">
                                            <label>FULL NAME</label>
                                            <strong>{user.name || 'Not Specified'}</strong>
                                        </div>
                                    </div>

                                    <div className="p-detail-box">
                                        <div className="p-detail-icon"><Phone size={18} /></div>
                                        <div className="p-detail-content">
                                            <label>PRIMARY PHONE</label>
                                            <strong>{user.phone || '+91 98765 43210'}</strong>
                                        </div>
                                    </div>

                                    <div className="p-detail-box full">
                                        <div className="p-detail-icon"><Mail size={18} /></div>
                                        <div className="p-detail-content">
                                            <label>EMAIL ADDRESS</label>
                                            <strong>{user.email || 'N/A'}</strong>
                                        </div>
                                        <button onClick={() => toggleForm('email')} className="btn-detail-action">
                                            Update Email
                                        </button>
                                    </div>

                                    {activeForm === 'email' && (
                                        <form onSubmit={handleEmailSubmit} className="p-inline-form full">
                                            <h4>Update Primary Email Address</h4>
                                            {emailMsg.text && (
                                                <div className={`p-form-msg ${emailMsg.ok ? 'success' : 'error'}`}>
                                                    {emailMsg.text}
                                                </div>
                                            )}
                                            <div className="p-form-row">
                                                <input 
                                                    type="email" 
                                                    placeholder="New Email Address" 
                                                    value={emailForm.newEmail} 
                                                    onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })} 
                                                    required 
                                                />
                                                <input 
                                                    type="password" 
                                                    placeholder="Current Account Password" 
                                                    value={emailForm.password} 
                                                    onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="p-form-btns">
                                                <button type="submit" className="btn-p-save" disabled={emailLoading}>
                                                    {emailLoading ? 'Updating...' : 'Save Email Address'}
                                                </button>
                                                <button type="button" onClick={() => toggleForm('email')} className="btn-p-cancel">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="p-detail-box full">
                                        <div className="p-detail-icon"><MapPin size={18} /></div>
                                        <div className="p-detail-content">
                                            <label>REGISTERED ADDRESS</label>
                                            <strong>
                                                {user.address ? `${user.address}${user.city ? ', ' + user.city : ''}${user.pincode ? ' - ' + user.pincode : ''}` : 'No primary address registered. Click Update Address below.'}
                                            </strong>
                                        </div>
                                        <button onClick={() => toggleForm('address')} className="btn-detail-action">
                                            Update Address
                                        </button>
                                    </div>

                                    {activeForm === 'address' && (
                                        <form onSubmit={handleAddressSubmit} className="p-inline-form full">
                                            <h4>Update Registered Address</h4>
                                            {addressMsg.text && (
                                                <div className={`p-form-msg ${addressMsg.ok ? 'success' : 'error'}`}>
                                                    {addressMsg.text}
                                                </div>
                                            )}
                                            <div className="p-form-col">
                                                <input 
                                                    type="text" 
                                                    placeholder="Street / Flat / House Address" 
                                                    value={addressForm.address} 
                                                    onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} 
                                                    required 
                                                />
                                                <div className="p-form-row">
                                                    <input 
                                                        type="text" 
                                                        placeholder="City" 
                                                        value={addressForm.city} 
                                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} 
                                                        required 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Pincode" 
                                                        value={addressForm.pincode} 
                                                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-form-btns">
                                                <button type="submit" className="btn-p-save" disabled={addressLoading}>
                                                    {addressLoading ? 'Updating...' : 'Save Registered Address'}
                                                </button>
                                                <button type="button" onClick={() => toggleForm('address')} className="btn-p-cancel">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Security & Password */}
                    {activeTab === 'security' && (
                        <div className="profile-tab-panel">
                            <div className="profile-section-card">
                                <div className="card-section-head">
                                    <div>
                                        <h3>Security & Password Management</h3>
                                        <p>Update your account access credentials and password.</p>
                                    </div>
                                </div>

                                <div className="profile-details-grid">
                                    <div className="p-detail-box full">
                                        <div className="p-detail-icon"><KeyRound size={18} /></div>
                                        <div className="p-detail-content">
                                            <label>ACCOUNT PASSWORD</label>
                                            <strong className="password-dots">••••••••••••••••</strong>
                                        </div>
                                        <button onClick={() => toggleForm('password')} className="btn-detail-action">
                                            Change Password
                                        </button>
                                    </div>

                                    {activeForm === 'password' && (
                                        <form onSubmit={handlePassSubmit} className="p-inline-form full">
                                            <h4>Change Account Password</h4>
                                            {passMsg.text && (
                                                <div className={`p-form-msg ${passMsg.ok ? 'success' : 'error'}`}>
                                                    {passMsg.text}
                                                </div>
                                            )}
                                            <div className="p-form-col">
                                                <input 
                                                    type="password" 
                                                    placeholder="Current Password" 
                                                    value={passForm.currentPassword} 
                                                    onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} 
                                                    required 
                                                />
                                                <input 
                                                    type="password" 
                                                    placeholder="New Password (min 6 characters)" 
                                                    value={passForm.newPassword} 
                                                    onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} 
                                                    required 
                                                />
                                                <input 
                                                    type="password" 
                                                    placeholder="Confirm New Password" 
                                                    value={passForm.confirmPassword} 
                                                    onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="p-form-btns">
                                                <button type="submit" className="btn-p-save" disabled={passLoading}>
                                                    {passLoading ? 'Updating...' : 'Update Password'}
                                                </button>
                                                <button type="button" onClick={() => toggleForm('password')} className="btn-p-cancel">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Profile;
