import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

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
    }, []);

    if (!user || !user.token) {
        return (
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                textAlign: 'center',
                padding: '40px'
            }}>
                <div style={{ fontSize: '4rem' }}>🔒</div>
                <h2 style={{ fontSize: '2rem' }}>
                    Login <span className="highlight">Required</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.6' }}>
                    You need to be signed in to access this page.
                </p>
                <div style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: 'var(--primary, #f97316)',
                        animation: 'pulse 1s infinite'
                    }} />
                    Redirecting to Login in <strong style={{ color: 'var(--primary, #f97316)' }}>&nbsp;{countdown}s</strong>...
                </div>
                <button className="btn-primary" onClick={() => navigate('/login', { replace: true })}>
                    Sign In Now
                </button>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.4; transform: scale(0.8); }
                    }
                `}</style>
            </div>
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.toLowerCase())) {
        return (
            <div className="section-padding text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '5rem' }}>🚫</div>
                <h2 style={{ fontSize: '2.5rem' }}>Access <span className="highlight">Denied</span></h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>Sorry, you don't have permission to access this page. Please contact support if you believe this is an error.</p>
                <button className="btn-primary" onClick={() => window.location.href = '/'}>Return Home</button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
