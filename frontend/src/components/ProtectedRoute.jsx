import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
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
