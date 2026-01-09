// user orders
import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

const Orders = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Please login to view your orders');
                setLoading(false);
                return;
            }

            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiBaseUrl}/services`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });

                if (response.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    setRequests(data);
                } else {
                    setError(data.message || 'Failed to fetch orders');
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
        if (status === 'accepted') return <CheckCircle className="status-icon accepted" />;
        if (status === 'completed') return <CheckCircle className="status-icon completed" />;
        if (status === 'pending') return <Clock className="status-icon pending" />;
        return <AlertCircle className="status-icon" />;
    };

    const getStatusLabel = (status) => {
        if (status === 'accepted') return 'PAID & VERIFIED';
        if (status === 'completed') return 'COMPLETED';
        if (status === 'pending') return 'PAYMENT PENDING';
        return status.toUpperCase();
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;

        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/services/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (res.ok) {
                const updated = await res.json();
                setRequests(requests.map(r => r._id === id ? updated : r));
                setSelectedRequest(updated);
                alert('Order cancelled');
            }
        } catch (err) {
            alert('Cancellation failed');
        }
    };

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    return (
        <div className="orders-page section-padding">
            <div className="container">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>Your <span className="highlight">Orders</span></h2>
                        <p>Track your active moves and past requests</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center">Loading your orders...</div>
                ) : error ? (
                    <div className="auth-error">{error}</div>
                ) : requests.length === 0 ? (
                    <div className="white-card text-center p-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'var(--bg-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            <Truck size={40} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>No orders found</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>You haven't booked any moves yet. Start your journey with us by booking your first professional move today.</p>
                        <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => window.location.href = '/booking'}>Book Your First Move</button>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {requests.map((req) => (
                            <div key={req._id} className="request-card glass-card">
                                <div className="card-top">
                                    {getStatusIcon(req.status)}
                                    <span className={`status-badge ${req.status}`}>{getStatusLabel(req.status)}</span>
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
                                            <p>₹{req.estimatedPrice}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer" style={{ borderTop: '1px solid var(--bg-light)', paddingTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button className="btn-outline-sm" style={{ borderRadius: '50px', padding: '8px 20px' }} onClick={() => openDetails(req)}>Details</button>

                                    {(req.status === 'pending' || req.status === 'accepted') && (
                                        <button
                                            className="btn-outline-sm"
                                            style={{ borderRadius: '50px', padding: '8px 20px', marginLeft: 'auto' }}
                                            onClick={() => handleCancelRequest(req._id)}
                                        >Cancel Order</button>
                                    )}
                                    {req.status === 'completed' && <button className="btn-primary-sm" style={{ borderRadius: '50px' }}>Review <Star size={14} /></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {
                isModalOpen && selectedRequest && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close" style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', color: 'var(--text-muted)', fontSize: '28px' }}>&times;</button>

                            <h3 style={{ color: 'var(--primary)', marginBottom: '30px', fontSize: '1.8rem' }}>Order Details</h3>

                            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                <div className="modal-item">
                                    <small>ORDER ID</small>
                                    <p>#{selectedRequest._id.substring(selectedRequest._id.length - 8).toUpperCase()}</p>
                                </div>
                                <div className="modal-item">
                                    <small>BOOKED ON</small>
                                    <p>{new Date(selectedRequest.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                </div>
                                <div className="modal-item">
                                    <small>SERVICE TYPE</small>
                                    <p style={{ textTransform: 'uppercase' }}>{selectedRequest.serviceType}</p>
                                </div>
                                <div className="modal-item">
                                    <small>FROM</small>
                                    <p>{selectedRequest.pickupLocation}</p>
                                </div>
                                <div className="modal-item">
                                    <small>TO</small>
                                    <p>{selectedRequest.dropoffLocation}</p>
                                </div>
                                <div className="modal-item">
                                    <small>MOVING DATE</small>
                                    <p>{new Date(selectedRequest.movingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                                <div className="modal-item">
                                    <small>ESTIMATED PRICE</small>
                                    <p style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>₹{selectedRequest.estimatedPrice}</p>
                                </div>
                            </div>

                            <div className="status-management" style={{ borderTop: '2px solid var(--bg-light)', paddingTop: '30px' }}>
                                {(selectedRequest.status === 'pending' || selectedRequest.status === 'accepted') && (
                                    <div style={{ textAlign: 'center' }}>
                                        <button
                                            className="btn-outline"
                                            style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', width: '100%', padding: '15px' }}
                                            onClick={() => handleCancelRequest(selectedRequest._id)}
                                        >
                                            Cancel This Order
                                        </button>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>You can only cancel orders that are still pending or accepted.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Orders;
