import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Please login to view dashboard');
                setLoading(false);
                return;
            }

            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiBaseUrl}/services`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    setRequests(data);
                } else {
                    setError(data.message || 'Failed to fetch requests');
                }
            } catch (err) {
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="status-icon pending" />;
            case 'accepted': return <Truck className="status-icon accepted" />;
            case 'completed': return <CheckCircle className="status-icon completed" />;
            default: return <AlertCircle className="status-icon" />;
        }
    };

    return (
        <div className="dashboard-page section-padding">
            <div className="container">
                <div className="dashboard-header">
                    <h2>Your <span className="highlight">Dashboard</span></h2>
                    <p>Track your active moves and past requests</p>
                </div>

                {loading ? (
                    <div className="text-center">Loading your requests...</div>
                ) : error ? (
                    <div className="auth-error">{error}</div>
                ) : requests.length === 0 ? (
                    <div className="glass-card text-center p-50">
                        <h3>No requests found</h3>
                        <p>You haven't booked any moves yet.</p>
                        <button className="btn-primary" onClick={() => window.location.href = '/booking'}>Book Now</button>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {requests.map((req) => (
                            <div key={req._id} className="request-card glass-card">
                                <div className="card-top">
                                    {getStatusIcon(req.status)}
                                    <span className={`status-badge ${req.status}`}>{req.status.toUpperCase()}</span>
                                </div>

                                <div className="card-body">
                                    <div className="info-item">
                                        <small>FROM</small>
                                        <p>{req.pickupLocation}</p>
                                    </div>
                                    <div className="info-item">
                                        <small>TO</small>
                                        <p>{req.dropoffLocation}</p>
                                    </div>
                                    <div className="info-split">
                                        <div className="info-item">
                                            <small>DATE</small>
                                            <p>{new Date(req.movingDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="info-item">
                                            <small>PRICE</small>
                                            <p>${req.estimatedPrice}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button className="btn-outline-sm">Details</button>
                                    {req.status === 'completed' && <button className="btn-primary-sm">Review <Star size={14} /></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
