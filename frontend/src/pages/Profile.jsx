import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        } else {
            window.location.href = '/login';
        }
    }, []);

    if (!user) return null;

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return { bg: '#ffe5e5', color: '#d32f2f' };
            case 'provider': return { bg: '#e3f2fd', color: '#1976d2' };
            default: return { bg: '#e8f5e9', color: '#2e7d32' };
        }
    };

    const roleStyle = getRoleBadgeColor(user.role);

    return (
        <div className="profile-page section-padding" style={{ paddingTop: '40px' }}>
            <div className="container">
                <div className="white-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                    <h2 style={{ marginBottom: '30px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
                        <User size={24} color="var(--primary)" /> My Profile
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <User size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>NAME</p>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <Mail size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>EMAIL</p>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <Phone size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>PHONE</p>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{user.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                            <Shield size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>ROLE</p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '15px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    background: roleStyle.bg,
                                    color: roleStyle.color
                                }}>
                                    {user.role || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
