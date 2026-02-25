import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, KeyRound, AtSign } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeForm, setActiveForm] = useState(null);

    const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
    const [emailMsg, setEmailMsg] = useState({ text: '', ok: false });
    const [emailLoading, setEmailLoading] = useState(false);

    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passMsg, setPassMsg] = useState({ text: '', ok: false });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        } else {
            window.location.href = '/login';
        }
    }, []);

    if (!user) return null;

    const token = user.token;

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return { bg: '#ffe5e5', color: '#d32f2f' };
            case 'provider': return { bg: '#e3f2fd', color: '#1976d2' };
            default: return { bg: '#e8f5e9', color: '#2e7d32' };
        }
    };

    const roleStyle = getRoleBadgeColor(user.role);

    const toggleForm = (form) => {
        setActiveForm(activeForm === form ? null : form);
        setEmailMsg({ text: '', ok: false });
        setPassMsg({ text: '', ok: false });
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
                setEmailMsg({ text: 'Email updated successfully!', ok: true });
                setActiveForm(null);
            }
        } catch {
            setEmailMsg({ text: 'Something went wrong. Try again.', ok: false });
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
            setPassMsg({ text: 'Something went wrong. Try again.', ok: false });
        }
        setPassLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-body)',
        color: 'var(--text-main)',
        fontSize: '14px',
        outline: 'none',
    };

    const formBoxStyle = {
        marginTop: '10px',
        padding: '20px',
        background: 'var(--bg-light)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    };

    return (
        <div className="profile-page section-padding" style={{ paddingTop: '40px' }}>
            <div className="container">
                <div className="white-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                    <h2 style={{ marginBottom: '30px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
                        <User size={24} color="var(--primary)" /> My Profile
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <User size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>NAME</p>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Mail size={20} color="var(--primary)" />
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>EMAIL</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={() => toggleForm('email')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '50px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    <AtSign size={14} /> Change
                                </button>
                            </div>

                            {activeForm === 'email' && (
                                <form onSubmit={handleEmailSubmit} style={formBoxStyle}>
                                    <input style={inputStyle} type="email" placeholder="New Email" value={emailForm.newEmail} onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })} required />
                                    <input style={inputStyle} type="password" placeholder="Current Password" value={emailForm.password} onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} required />
                                    {emailMsg.text && <p style={{ fontSize: '13px', color: emailMsg.ok ? '#2e7d32' : '#d32f2f' }}>{emailMsg.text}</p>}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '50px', fontSize: '14px' }} disabled={emailLoading}>{emailLoading ? 'Saving...' : 'Save'}</button>
                                        <button type="button" onClick={() => toggleForm('email')} style={{ flex: 1, padding: '10px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px' }}>Cancel</button>
                                    </div>
                                </form>
                            )}
                            {emailMsg.ok && activeForm !== 'email' && <p style={{ marginTop: '8px', fontSize: '13px', color: '#2e7d32' }}>{emailMsg.text}</p>}
                        </div>

                        <div style={{ padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Phone size={20} color="var(--primary)" />
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>PHONE</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <Shield size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>ROLE</p>
                                <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '15px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: roleStyle.bg, color: roleStyle.color }}>{user.role || 'N/A'}</span>
                            </div>
                        </div>

                        <div style={{ padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <KeyRound size={20} color="var(--primary)" />
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>PASSWORD</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '3px' }}>••••••••</p>
                                    </div>
                                </div>
                                <button onClick={() => toggleForm('password')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '50px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    <KeyRound size={14} /> Change
                                </button>
                            </div>

                            {activeForm === 'password' && (
                                <form onSubmit={handlePassSubmit} style={formBoxStyle}>
                                    <input style={inputStyle} type="password" placeholder="Current Password" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} required />
                                    <input style={inputStyle} type="password" placeholder="New Password" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} required />
                                    <input style={inputStyle} type="password" placeholder="Confirm New Password" value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} required />
                                    {passMsg.text && <p style={{ fontSize: '13px', color: passMsg.ok ? '#2e7d32' : '#d32f2f' }}>{passMsg.text}</p>}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '50px', fontSize: '14px' }} disabled={passLoading}>{passLoading ? 'Saving...' : 'Save'}</button>
                                        <button type="button" onClick={() => toggleForm('password')} style={{ flex: 1, padding: '10px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px' }}>Cancel</button>
                                    </div>
                                </form>
                            )}
                            {passMsg.ok && activeForm !== 'password' && <p style={{ marginTop: '8px', fontSize: '13px', color: '#2e7d32' }}>{passMsg.text}</p>}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
