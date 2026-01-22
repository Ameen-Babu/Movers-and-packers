import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.token) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login', { replace: true });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [user, navigate]);

    if (!user || !user.token) {
        return (
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                background: 'var(--bg-body)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg, 16px)',
                    padding: '36px 32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto',
                        color: 'var(--text-main)'
                    }}>
                        <Lock size={22} />
                    </div>

                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                        letterSpacing: '-0.3px'
                    }}>
                        Sign in required
                    </h2>

                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '24px'
                    }}>
                        You must be logged in to view this page. Redirecting in <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{countdown}s</span>...
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <button
                            onClick={() => navigate('/login', { replace: true })}
                            style={{
                                width: '100%',
                                padding: '11px 20px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#000000',
                                background: 'var(--accent-gold)',
                                border: 'none',
                                borderRadius: 'var(--radius-md, 10px)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-gold)'}
                        >
                            <LogIn size={16} />
                            Sign In
                        </button>

                        <button
                            onClick={() => navigate('/', { replace: true })}
                            style={{
                                width: '100%',
                                padding: '10px 20px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-muted)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <ArrowLeft size={14} />
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.toLowerCase())) {
        return (
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                background: 'var(--bg-body)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg, 16px)',
                    padding: '36px 32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(229, 57, 53, 0.1)',
                        border: '1px solid rgba(229, 57, 53, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto',
                        color: 'var(--status-error, #E53935)'
                    }}>
                        <Lock size={22} />
                    </div>

                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                        letterSpacing: '-0.3px'
                    }}>
                        Access restricted
                    </h2>

                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '24px'
                    }}>
                        You don't have permission to view this section.
                    </p>

                    <button
                        onClick={() => navigate('/', { replace: true })}
                        style={{
                            width: '100%',
                            padding: '11px 20px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--text-main)',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md, 10px)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
