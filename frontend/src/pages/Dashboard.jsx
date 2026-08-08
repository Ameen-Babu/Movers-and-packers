import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertCircle, Star, Tag, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [claimedRequests, setClaimedRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminPerformance, setAdminPerformance] = useState(null);
    const [selectedAdminIdForStats, setSelectedAdminIdForStats] = useState('');
    const [analyticsTimeRange, setAnalyticsTimeRange] = useState('7d');
    const [userRole, setUserRole] = useState('');
    const [activeTab, setActiveTab] = useState('requests');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isSuperAdmin = currentUser?.role?.toLowerCase() === 'superadmin';
    const isApprovedAdmin = isSuperAdmin || (currentUser?.role?.toLowerCase() === 'admin' && currentUser?.isApproved === true);
    const isAdmin = isApprovedAdmin || isSuperAdmin;
    const isPendingAdmin = currentUser?.role?.toLowerCase() === 'admin' && !currentUser?.isApproved;

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

                let currentUserObj = user;
                try {
                    const meRes = await fetch(`${apiBaseUrl}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        currentUserObj = { ...user, ...meData };
                        localStorage.setItem('user', JSON.stringify(currentUserObj));
                        setUserRole(currentUserObj.role);
                    }
                } catch {

                }

                const response = await fetch(`${apiBaseUrl}/services`, {
                    headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                });

                if (response.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }

                const text = await response.text();
                let data = [];
                try {
                    data = text ? JSON.parse(text) : [];
                } catch {
                    data = [];
                }

                if (response.ok) {
                    setRequests(Array.isArray(data) ? data : []);
                } else {
                    setError(data.message || 'Failed to fetch requests');
                }

                if (isApprovedAdmin || isSuperAdmin) {
                    try {
                        const statsRes = await fetch(`${apiBaseUrl}/admin/stats`, {
                            headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                        });
                        if (statsRes.ok) setStats(await statsRes.json());
                    } catch (err) {
                        console.error('Stats error:', err);
                    }

                    try {
                        const usersRes = await fetch(`${apiBaseUrl}/admin/users`, {
                            headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                        });
                        if (usersRes.ok) setUsers(await usersRes.json());
                    } catch (err) {
                        console.error('Users error:', err);
                    }

                    try {
                        if (isSuperAdmin) {
                            const adminPendingRes = await fetch(`${apiBaseUrl}/admin/pending-admins`, {
                                headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                            });
                            if (adminPendingRes.ok) setPendingAdmins(await adminPendingRes.json());
                        }
                    } catch (err) {
                        console.error('Pending admins error:', err);
                    }

                    try {
                        const pendingRes = await fetch(`${apiBaseUrl}/services?view=pending`, {
                            headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                        });
                        if (pendingRes.ok) setPendingRequests(await pendingRes.json());
                    } catch (err) { }

                    try {
                        const claimedRes = await fetch(`${apiBaseUrl}/services?view=claimed`, {
                            headers: { 'Authorization': `Bearer ${currentUserObj.token}` }
                        });
                        if (claimedRes.ok) setClaimedRequests(await claimedRes.json());
                    } catch (err) { }
                }
            } catch (err) {
                console.error('Main fetch error:', err);
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const fetchSpecificAdminPerformance = async (adminId, range = analyticsTimeRange) => {
        setSelectedAdminIdForStats(adminId);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const adminQuery = adminId ? `adminId=${adminId}&` : '';
            const perfRes = await fetch(`${apiBaseUrl}/admin/my-performance?${adminQuery}timeRange=${range}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (perfRes.ok) setAdminPerformance(await perfRes.json());
        } catch (err) {
            console.error('Failed to fetch performance stats', err);
        }
    };

    const handleTimeRangeChange = (range) => {
        setAnalyticsTimeRange(range);
        fetchSpecificAdminPerformance(selectedAdminIdForStats, range);
    };

    const getStatusIcon = (status) => {
        if (status === 'accepted') return <CheckCircle className="status-icon accepted" />;
        if (status === 'completed') return <CheckCircle className="status-icon completed" />;
        if (status === 'pending') return <Clock className="status-icon pending" />;
        if (status === 'claimed') return <Tag className="status-icon claimed" />;
        return <AlertCircle className="status-icon" />;
    };

    const getStatusLabel = (status) => {
        if (status === 'pending') return 'NEW ORDER';
        if (status === 'claimed') return 'ASSIGNED';
        if (status === 'accepted') return 'CONFIRMED';
        if (status === 'completed') return 'COMPLETED';
        if (status === 'cancelled') return 'CANCELLED';
        return status.toUpperCase();
    };

    const handleToggleUserStatus = async (id, currentlyActive) => {
        const action = currentlyActive ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/admin/users/${id}/toggle-status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(users.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
            } else {
                alert('Action failed');
            }
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleUpdateRole = async (id, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/admin/users/${id}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(users.map(u => u._id === id ? { ...u, role: data.user.role } : u));
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Action failed');
            }
        } catch (err) {
            alert('Action failed');
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
                setClaimedRequests(claimedRequests.filter(r => r._id !== id));
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
                setClaimedRequests(claimedRequests.map(r => r._id === id ? updated : r));
                setSelectedRequest(updated);
                alert('Status updated to ' + newStatus);
            } else {
                const data = await res.json();
                alert(data.message || 'Update failed');
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
    const isClaimedByMe = (req) => {
        if (!req.claimedBy || !currentUser) return false;
        const claimedById = typeof req.claimedBy === 'object' ? req.claimedBy._id || req.claimedBy : req.claimedBy;
        return claimedById.toString() === currentUser.id?.toString();
    };

    const handleClaimOrder = async (id) => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBaseUrl}/services/${id}/claim`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const updated = await res.json();
                setRequests(requests.map(r => r._id === id ? updated : r));
                setPendingRequests(pendingRequests.filter(r => r._id !== id));
                setClaimedRequests(prev => [...prev, updated]);
                setSelectedRequest(updated);
                alert('Order claimed! You can manage it in the Claimed Orders tab.');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to claim order');
            }
        } catch (err) {
            alert('Failed to claim order');
        }
    };

    const renderRequestCard = (req) => (
        <div key={req._id} className="request-card glass-card">
            <div className="card-top">
                <span className={`status-badge ${req.status || 'pending'}`}>{getStatusLabel(req.status)}</span>
                <span className="card-price-tag">₹{req.estimatedPrice ? Number(req.estimatedPrice).toLocaleString('en-IN') : 'N/A'}</span>
            </div>

            <div className="card-body">
                <div className="info-item">
                    <small>PICKUP FROM</small>
                    <p>{req.pickupLocation}</p>
                </div>
                <div className="info-item">
                    <small>DESTINATION</small>
                    <p>{req.dropoffLocation}</p>
                </div>
                <div className="info-split">
                    <div className="info-item">
                        <small>MOVING DATE</small>
                        <p>{req.movingDate ? new Date(req.movingDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="info-item">
                        <small>SERVICE TYPE</small>
                        <p>{req.serviceType || 'Relocation'}</p>
                    </div>
                </div>
            </div>

            <div className="card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <button className="btn-card-details" onClick={() => openDetails(req)}>Details</button>

                {(userRole === 'admin' || userRole === 'superadmin') && (
                    <button
                        className="btn-card-delete"
                        onClick={() => handleDeleteRequest(req._id)}
                    >Delete</button>
                )}
                {(userRole === 'client' && (req.status === 'pending' || req.status === 'accepted')) && (
                    <button
                        className="btn-card-cancel"
                        onClick={() => handleCancelRequest(req._id)}
                    >Cancel Order</button>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-page section-padding">
            <div className="container">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        {['admin', 'superadmin'].includes(userRole?.toLowerCase()) ? (
                            <h2 style={{ textTransform: 'capitalize' }}>{userRole} <span className="highlight">Dashboard</span></h2>
                        ) : (
                            <h2>Your <span className="highlight">Orders</span></h2>
                        )}
                        <p>{['admin', 'superadmin'].includes(userRole?.toLowerCase()) ? 'Manage platform activity and orders' : 'Track your active moves and past requests'}</p>
                    </div>
                </div>

                {isPendingAdmin && (
                    <div className="white-card p-30 text-center mb-30" style={{ borderLeft: '5px solid #0D9488', background: 'var(--bg-card)' }}>
                        <div style={{ background: 'rgba(13, 148, 136, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <Clock size={30} color="#0D9488" />
                        </div>
                        <h3 style={{ color: '#0D9488', marginBottom: '10px' }}>Dashboard Under Review</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                            Your admin account is currently pending approval from the SuperAdmin.
                            You will gain access to orders and platform controls once your account is verified.
                        </p>
                    </div>
                )}

                {isApprovedAdmin && (
                    <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        <button className={`btn-outline-sm ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                            All Orders ({requests.length})
                        </button>
                        <button
                            className={`btn-outline-sm ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending Orders {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                        </button>
                        <button
                            className={`btn-outline-sm ${activeTab === 'claimed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('claimed')}
                        >
                            Claimed Orders {claimedRequests.length > 0 && `(${claimedRequests.length})`}
                        </button>
                        <button className={`btn-outline-sm ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                            Users ({users.length})
                        </button>
                        {isSuperAdmin && (
                            <button className={`btn-outline-sm ${activeTab === 'admin-pending' ? 'active' : ''}`} onClick={() => setActiveTab('admin-pending')}>
                                Pending Admins {pendingAdmins.length > 0 && `(${pendingAdmins.length})`}
                            </button>
                        )}
                        <button className={`btn-outline-sm ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
                            Analytics
                        </button>
                        <button className={`btn-outline-sm ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                            Platform Overview
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center">Loading your requests...</div>
                ) : error ? (
                    <div className="auth-error">{error}</div>
                ) : activeTab === 'requests' ? (
                    requests.length === 0 ? (
                        <div className="white-card text-center p-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'var(--bg-card)' }}>
                            <div style={{ background: 'var(--bg-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                <Truck size={40} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>No orders found</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                                {isApprovedAdmin ? 'There are no service requests in the platform yet.' : "You haven't booked any moves yet. Start your journey with us by booking your first professional move today."}
                            </p>
                            {!isApprovedAdmin && (
                                <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => window.location.href = '/booking'}>Book Your First Move</button>
                            )}
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {requests.map((req) => renderRequestCard(req))}
                        </div>
                    )
                ) : activeTab === 'pending' ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: 'var(--secondary)', marginBottom: '5px' }}>Pending Orders</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>New unclaimed orders awaiting assignment. Claim an order to start managing it.</p>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <div className="white-card text-center p-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: 'var(--bg-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={40} color="var(--primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>No pending orders</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>All orders have been claimed or there are no new bookings yet.</p>
                            </div>
                        ) : (
                            <div className="requests-grid">
                                {pendingRequests.map((req) => (
                                    <div key={req._id} className="request-card glass-card">
                                        <div className="card-top">
                                            {getStatusIcon(req.status)}
                                            <span className={`status-badge ${req.status}`}>{getStatusLabel(req.status)}</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="info-item"><small>FROM</small><p>{req.pickupLocation}</p></div>
                                            <div className="info-item"><small>TO</small><p>{req.dropoffLocation}</p></div>
                                            <div className="info-split">
                                                <div className="info-item"><small>DATE</small><p>{new Date(req.movingDate).toLocaleDateString()}</p></div>
                                                <div className="info-item"><small>PRICE</small><p>&#8377;{req.estimatedPrice}</p></div>
                                            </div>
                                        </div>
                                        <div className="card-footer" style={{ borderTop: '1px solid var(--bg-light)', paddingTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button className="btn-outline-sm" style={{ borderRadius: '50px', padding: '8px 20px' }} onClick={() => openDetails(req)}>Details</button>
                                            {req.status !== 'cancelled' && (
                                                <button
                                                    className="btn-primary-sm"
                                                    style={{ borderRadius: '50px', padding: '8px 22px', marginLeft: 'auto' }}
                                                    onClick={() => handleClaimOrder(req._id)}
                                                >Claim</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'claimed' ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: 'var(--secondary)', marginBottom: '5px' }}>My Claimed Orders</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>These are the orders you have personally claimed. Manage their status below.</p>
                        </div>
                        {claimedRequests.length === 0 ? (
                            <div className="white-card text-center p-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: 'var(--bg-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={40} color="var(--primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>No claimed orders yet</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Go to the Pending Orders tab to claim pending orders and start managing them here.</p>
                                <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => setActiveTab('pending')}>Browse Unclaimed Orders</button>
                            </div>
                        ) : (
                            <div className="requests-grid">
                                {claimedRequests.map((req) => renderRequestCard(req))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="users-table-container">
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>User Directory</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage registered client accounts, admin privileges, and access permissions.</p>
                        </div>
                        <div className="table-responsive">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email Address</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.email}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.phone || 'N/A'}</td>
                                            <td>
                                                {isSuperAdmin && u.email !== currentUser?.email ? (
                                                    <select
                                                        className="role-select-dropdown"
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    >
                                                        <option value="client">Client</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="superadmin">SuperAdmin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className={`btn-user-action ${u.isActive === false ? 'activate' : 'deactivate'}`}
                                                    onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                                                    disabled={u.role === 'admin' || u.role === 'superadmin'}
                                                >
                                                    {u.isActive === false ? 'Activate' : 'Deactivate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'admin-pending' ? (
                    <div className="users-table-container">
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>Pending Admin Approvals</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Review and verify newly registered administrative personnel.</p>
                        </div>
                        {pendingAdmins.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>No pending admin approval requests</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Applicant Name</th>
                                            <th>Email Address</th>
                                            <th>Phone Number</th>
                                            <th style={{ textAlign: 'right' }}>Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingAdmins.map(admin => (
                                            <tr key={admin._id}>
                                                <td style={{ fontWeight: '600' }}>{admin.name}</td>
                                                <td>{admin.email}</td>
                                                <td>{admin.phone}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                        <button className="btn-approve-sm" onClick={() => handleApproveAdmin(admin._id)}>Approve</button>
                                                        <button className="btn-reject-sm" onClick={() => handleRejectAdmin(admin._id)}>Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'performance' ? (
                    <div className="performance-view">
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            {isSuperAdmin && (
                                <div className="filter-card">
                                    <label>Select Administrator:</label>
                                    <select
                                        className="filter-select"
                                        value={selectedAdminIdForStats}
                                        onChange={(e) => fetchSpecificAdminPerformance(e.target.value)}
                                    >
                                        <option value="">{currentUser?.name} (You)</option>
                                        {users.filter(u => u.role === 'admin' || u.role === 'superadmin')
                                            .filter(u => u.email !== currentUser?.email)
                                            .map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                            <div className="filter-card">
                                <label>Time Window:</label>
                                <select
                                    className="filter-select"
                                    value={analyticsTimeRange}
                                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                                >
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="6m">Last 6 Months</option>
                                </select>
                            </div>
                        </div>

                        <div className="stats-kpi-grid">
                            <div className="stat-kpi-card">
                                <small>JOBS COMPLETED</small>
                                <h3>{adminPerformance?.totalCompleted || 0}</h3>
                            </div>
                            <div className="stat-kpi-card">
                                <small>TOTAL REVENUE</small>
                                <h3 style={{ color: '#10B981' }}>₹{adminPerformance?.totalRevenue?.toLocaleString('en-IN') || 0}</h3>
                            </div>
                            <div className="stat-kpi-card">
                                <small>JOBS TODAY</small>
                                <h3 style={{ color: '#38BDF8' }}>
                                    {adminPerformance?.chartData?.length ? adminPerformance.chartData[adminPerformance.chartData.length - 1].jobs : 0}
                                </h3>
                            </div>
                        </div>

                        <div className="chart-card-container">
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)' }}>Performance Analytics Timeline</h3>
                            {adminPerformance?.chartData && adminPerformance.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={adminPerformance.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" orientation="left" stroke="var(--accent-gold)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10B981" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '15px' }} />
                                        <Bar yAxisId="left" dataKey="jobs" name="Jobs Completed" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                        <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No analytics performance data recorded for this time window.
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'stats' ? (
                    <div className="stats-kpi-grid">
                        <div className="stat-kpi-card">
                            <small>TOTAL REGISTERED USERS</small>
                            <h3>{stats?.users || 0}</h3>
                        </div>
                        <div className="stat-kpi-card">
                            <small>ACTIVE ACCOUNTS</small>
                            <h3>{stats?.activeUsers || 0}</h3>
                        </div>
                        <div className="stat-kpi-card">
                            <small>TOTAL BOOKINGS</small>
                            <h3>{stats?.serviceRequests || 0}</h3>
                        </div>
                        <div className="stat-kpi-card">
                            <small>PENDING ORDERS</small>
                            <h3 style={{ color: '#F59E0B' }}>{stats?.pendingRequests || 0}</h3>
                        </div>
                        <div className="stat-kpi-card">
                            <small>COMPLETED MOVES</small>
                            <h3 style={{ color: '#10B981' }}>{stats?.completedRequests || 0}</h3>
                        </div>
                        <div className="stat-kpi-card">
                            <small>CANCELLED MOVES</small>
                            <h3 style={{ color: '#EF4444' }}>{stats?.cancelledRequests || 0}</h3>
                        </div>
                        <div className="stat-kpi-card hero-kpi-card" style={{ gridColumn: '1 / -1' }}>
                            <small>CUMULATIVE PLATFORM REVENUE</small>
                            <h2>₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : 0}</h2>
                        </div>
                    </div>
                ) : null}

                {isModalOpen && selectedRequest && (
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
                                    <p style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>&#8377;{selectedRequest.estimatedPrice}</p>
                                </div>
                                {selectedRequest.claimedBy && (
                                    <div className="modal-item">
                                        <small>STATUS</small>
                                        <p style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                            {isClaimedByMe(selectedRequest) ? '✅ Claimed by you' : `➡️ Claimed by ${selectedRequest.claimedBy?.name || 'another admin'}`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Live GPS Telemetry Simulator */}
                            <div className="telemetry-card" style={{ background: '#0F172A', borderRadius: '16px', padding: '24px', border: '1px solid #334155', marginBottom: '30px', color: '#F8FAFC' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="telemetry-live-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
                                        <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', color: '#38BDF8' }}>LIVE FREIGHT TELEMETRY</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>CARGO DISPATCH</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <small style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>DRIVER CAPTAIN</small>
                                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC', margin: '3px 0 0' }}>Ramesh V. (Certified)</p>
                                    </div>
                                    <div>
                                        <small style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>TELEMETRY SPEED</small>
                                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', margin: '3px 0 0' }}>64 km/h (Nominal)</p>
                                    </div>
                                    <div>
                                        <small style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>CARGO TEMP</small>
                                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8', margin: '3px 0 0' }}>21.5°C Monitored</p>
                                    </div>
                                    <div>
                                        <small style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>ESTIMATED ETA</small>
                                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', margin: '3px 0 0' }}>2h 15m Remaining</p>
                                    </div>
                                </div>

                                {/* Animated Route Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#CBD5E1', marginBottom: '8px' }}>
                                        <span>{selectedRequest.pickupLocation}</span>
                                        <span style={{ color: '#0D9488' }}>78% IN TRANSIT</span>
                                        <span>{selectedRequest.dropoffLocation}</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg, #0D9488, #38BDF8)', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="status-management" style={{ borderTop: '2px solid var(--bg-light)', paddingTop: '30px' }}>
                                {(userRole === 'admin' || userRole === 'superadmin') ? (
                                    <>
                                        {(isSuperAdmin || isClaimedByMe(selectedRequest)) ? (
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
                                        ) : selectedRequest.claimedBy ? (
                                            <div style={{ padding: '15px', background: 'var(--bg-light)', borderRadius: '10px', textAlign: 'center' }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>➡️ This order has been claimed by another admin. Only they can update the status.</p>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '15px', background: 'var(--bg-light)', borderRadius: '10px', textAlign: 'center' }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This order is unclaimed. Go to the <strong style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setIsModalOpen(false); setActiveTab('pending'); }}>Pending Orders</strong> tab to claim it first.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    userRole === 'client' && (selectedRequest.status === 'pending' || selectedRequest.status === 'accepted' || selectedRequest.status === 'claimed') && (
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

                            {(userRole === 'admin' || userRole === 'superadmin') && (
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
                )}
            </div>
        </div>
    );
};

export default Dashboard;
