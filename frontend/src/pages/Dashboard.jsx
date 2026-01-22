// user dashboard
import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [activeTab, setActiveTab] = useState('requests');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Please login to view dashboard');
                setLoading(false);
                return;
            }
            setUserRole(user.role);

            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                // Fetch all requests for dashboard view (for admin and provider)
                const response = await fetch(`${apiBaseUrl}/services?view=all`, {
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
                    setError(data.message || 'Failed to fetch requests');
                }

                if (user.role?.toLowerCase() === 'admin') {
                    const statsRes = await fetch(`${apiBaseUrl}/admin/stats`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (statsRes.ok) setStats(await statsRes.json());

                    const usersRes = await fetch(`${apiBaseUrl}/admin/users`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (usersRes.ok) setUsers(await usersRes.json());

                    const pendingRes = await fetch(`${apiBaseUrl}/admin/pending-admins`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (pendingRes.ok) setPendingAdmins(await pendingRes.json());
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

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== id));
                alert('User deleted');
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!window.confirm('Delete this service request? This cannot be undone.')) return;
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setRequests(requests.filter(r => r._id !== id));
                setIsModalOpen(false);
                alert('Request deleted');
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;
        handleUpdateStatus(id, 'cancelled');
    };

    const handleUpdateStatus = async (id, newStatus) => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/services/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setRequests(requests.map(r => r._id === id ? updated : r));
                setSelectedRequest(updated);
                alert('Status updated to ' + newStatus);
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleApproveAdmin = async (id) => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/admin/approve-admin/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setPendingAdmins(pendingAdmins.filter(a => a._id !== id));
                alert('Admin approved!');
            }
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleRejectAdmin = async (id) => {
        if (!window.confirm('Reject and delete this admin request?')) return;
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setPendingAdmins(pendingAdmins.filter(a => a._id !== id));
                alert('Admin request rejected');
            }
        } catch (err) {
            alert('Rejection failed');
        }
    };

    return (
        <div className="dashboard-page section-padding">
            <div className="container">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        {['admin', 'provider'].includes(userRole?.toLowerCase()) ? (
                            <h2 style={{ textTransform: 'capitalize' }}>{userRole} <span className="highlight">Dashboard</span></h2>
                        ) : (
                            <h2>Your <span className="highlight">Orders</span></h2>
                        )}
                        <p>{['admin', 'provider'].includes(userRole?.toLowerCase()) ? 'Manage platform activity and orders' : 'Track your active moves and past requests'}</p>
                    </div>
                    <span className="user-role-badge" style={{ background: 'var(--primary)', color: 'var(--white)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {userRole || 'User'} Mode
                    </span>
                </div>

                {['admin', 'provider'].includes(userRole?.toLowerCase()) && (
                    <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        <button className={`btn-outline-sm ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Orders</button>
                        {userRole?.toLowerCase() === 'admin' && (
                            <>
                                <button className={`btn-outline-sm ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Customers</button>
                                <button className={`btn-outline-sm ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')} style={{ position: 'relative' }}>
                                    Pending Admins
                                    {pendingAdmins.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4d', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingAdmins.length}</span>}
                                </button>
                                <button className={`btn-outline-sm ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Dashboard</button>
                            </>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="text-center">Loading your requests...</div>
                ) : error ? (
                    <div className="auth-error">{error}</div>
                ) : activeTab === 'requests' ? (
                    requests.length === 0 ? (
                        <div className="white-card text-center p-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: 'var(--bg-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                <Truck size={40} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>No requests found</h3>
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
                                        {userRole === 'admin' && (
                                            <button
                                                className="btn-outline"
                                                style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '8px 25px', fontSize: '0.9rem' }}
                                                onClick={() => handleDeleteRequest(req._id)}
                                            >Delete</button>
                                        )}
                                        {(userRole === 'client' && (req.status === 'pending' || req.status === 'accepted')) && (
                                            <button
                                                className="btn-outline-sm"
                                                style={{ borderRadius: '50px', padding: '8px 20px', marginLeft: 'auto' }}
                                                onClick={() => handleCancelRequest(req._id)}
                                            >Cancel Order</button>
                                        )}
                                        {req.status === 'completed' && userRole === 'client' && <button className="btn-primary-sm" style={{ borderRadius: '50px' }}>Review <Star size={14} /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'users' ? (
                    <div className="users-list glass-card p-30">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Name</th>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Role</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className="status-badge" style={{ background: u.role === 'admin' ? 'var(--primary)' : 'var(--bg-light)', color: u.role === 'admin' ? 'var(--white)' : 'var(--text-muted)', borderRadius: '50px' }}>{u.role}</span></td>
                                        <td>
                                            <button
                                                className="btn-outline"
                                                style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '8px 25px', fontSize: '0.9rem' }}
                                                onClick={() => handleDeleteUser(u._id)}
                                                disabled={u.role === 'admin'}
                                            >Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'pending' ? (
                    <div className="users-list glass-card p-30">
                        <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Pending Admin Approvals</h3>
                        {pendingAdmins.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending admin requests</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>Name</th>
                                        <th style={{ padding: '10px' }}>Email</th>
                                        <th style={{ padding: '10px' }}>Phone</th>
                                        <th style={{ padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAdmins.map(admin => (
                                        <tr key={admin._id}>
                                            <td style={{ padding: '10px' }}>{admin.name}</td>
                                            <td style={{ padding: '10px' }}>{admin.email}</td>
                                            <td style={{ padding: '10px' }}>{admin.phone}</td>
                                            <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-primary-sm"
                                                    style={{ borderRadius: '50px', padding: '6px 15px', fontSize: '0.8rem' }}
                                                    onClick={() => handleApproveAdmin(admin._id)}
                                                >Approve</button>
                                                <button
                                                    className="btn-outline-sm"
                                                    style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '6px 15px', fontSize: '0.8rem' }}
                                                    onClick={() => handleRejectAdmin(admin._id)}
                                                >Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : activeTab === 'stats' ? (
                    <div className="stats-view grid-3">
                        <div className="glass-card p-30 text-center">
                            <small>TOTAL USERS</small>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0' }}>{stats?.users || 0}</h2>
                        </div>
                        <div className="glass-card p-30 text-center">
                            <small>TOTAL BOOKINGS</small>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0' }}>{stats?.serviceRequests || 0}</h2>
                        </div>
                        <div className="glass-card p-30 text-center">
                            <small>PROVIDERS</small>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0' }}>{stats?.providers || 0}</h2>
                        </div>
                    </div>
                ) : null}
            </div>

            {
                isModalOpen && selectedRequest && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close" style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', color: 'var(--text-muted)', fontSize: '28px' }}>&times;</button>

                            <h3 style={{ color: 'var(--primary)', marginBottom: '30px', fontSize: '1.8rem' }}>Request Details</h3>

                            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                <div className="modal-item">
                                    <small>REQUEST ID</small>
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
                                {userRole === 'admin' ? (
                                    <>
                                        <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '15px', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Manage Status</small>
                                        <div className="status-btns" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {['pending', 'accepted', 'completed', 'cancelled'].map(s => (
                                                <button
                                                    key={s}
                                                    className={`btn-outline-sm ${selectedRequest.status === s ? 'active' : ''}`}
                                                    onClick={() => handleUpdateStatus(selectedRequest._id, s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    userRole === 'client' && (selectedRequest.status === 'pending' || selectedRequest.status === 'accepted') && (
                                        <div style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn-outline"
                                                style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', width: '100%', padding: '15px' }}
                                                onClick={() => handleCancelRequest(selectedRequest._id)}
                                            >
                                                Cancel This Request
                                            </button>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>You can only cancel requests that are still pending or accepted.</p>
                                        </div>
                                    )
                                )}
                            </div>

                            {userRole === 'admin' && (
                                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'right' }}>
                                    <button
                                        className="btn-outline"
                                        style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '10px 30px' }}
                                        onClick={() => handleDeleteRequest(selectedRequest._id)}
                                    >
                                        Delete This Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
