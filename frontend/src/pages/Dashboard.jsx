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
                    setError(data.message || 'Failed to fetch requests');
                }

                if (isApprovedAdmin || isSuperAdmin) {
                    const pendingRes = await fetch(`${apiBaseUrl}/services?view=pending`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (pendingRes.ok) setPendingRequests(await pendingRes.json());

                    const statsRes = await fetch(`${apiBaseUrl}/admin/stats`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (statsRes.ok) setStats(await statsRes.json());

                    const usersRes = await fetch(`${apiBaseUrl}/admin/users`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (usersRes.ok) setUsers(await usersRes.json());

                    if (isSuperAdmin) {
                        const adminPendingRes = await fetch(`${apiBaseUrl}/admin/pending-admins`, {
                            headers: { 'Authorization': `Bearer ${user.token}` }
                        });
                        if (adminPendingRes.ok) setPendingAdmins(await adminPendingRes.json());
                    }

                    const claimedRes = await fetch(`${apiBaseUrl}/services?view=claimed`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (claimedRes.ok) setClaimedRequests(await claimedRes.json());

                    const perfRes = await fetch(`${apiBaseUrl}/admin/my-performance?timeRange=${analyticsTimeRange}`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (perfRes.ok) setAdminPerformance(await perfRes.json());
                }
            } catch (err) {
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

    const renderRequestCard = (req, showStatusControls = false) => (
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
                        <p>&#8377;{req.estimatedPrice}</p>
                    </div>
                </div>
            </div>

            <div className="card-footer" style={{ borderTop: '1px solid var(--bg-light)', paddingTop: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-outline-sm" style={{ borderRadius: '50px', padding: '8px 20px' }} onClick={() => openDetails(req)}>Details</button>

                {(userRole === 'admin' || userRole === 'superadmin') && (
                    <button
                        className="btn-outline"
                        style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '8px 25px', fontSize: '0.9rem', marginLeft: 'auto' }}
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
                    <span className="user-role-badge" style={{ background: 'var(--primary)', color: 'var(--white)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {userRole || 'User'} Mode
                    </span>
                </div>

                {isPendingAdmin && (
                    <div className="white-card p-30 text-center mb-30" style={{ borderLeft: '5px solid #f59e0b', background: 'var(--bg-card)' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <Clock size={30} color="#f59e0b" />
                        </div>
                        <h3 style={{ color: '#f59e0b', marginBottom: '10px' }}>Dashboard Under Review</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                            Your admin account is currently pending approval from the SuperAdmin. 
                            You will gain access to orders and platform controls once your account is verified.
                        </p>
                    </div>
                )}

                {isApprovedAdmin && (
                    <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        <button className={`btn-outline-sm ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>All Orders</button>
                        <button
                            className={`btn-outline-sm ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                            style={{ position: 'relative' }}
                        >
                            Pending Orders
                            {pendingRequests.length > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#f59e0b', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            className={`btn-outline-sm ${activeTab === 'claimed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('claimed')}
                            style={{ position: 'relative' }}
                        >
                            Claimed Orders
                            {claimedRequests.length > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {claimedRequests.length}
                                </span>
                            )}
                        </button>
                        <button className={`btn-outline-sm ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                        {isSuperAdmin && (
                            <button className={`btn-outline-sm ${activeTab === 'admin-pending' ? 'active' : ''}`} onClick={() => setActiveTab('admin-pending')} style={{ position: 'relative' }}>
                                Pending Admins
                                {pendingAdmins.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4d', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingAdmins.length}</span>}
                            </button>
                        )}
                        <button className={`btn-outline-sm ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Analytics</button>
                        <button className={`btn-outline-sm ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Platform Overview</button>
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
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Go to the Orders page to claim pending orders and start managing them here.</p>
                                <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => window.location.href = '/orders'}>Browse Unclaimed Orders</button>
                            </div>
                        ) : (
                            <div className="requests-grid">
                                {claimedRequests.map((req) => (
                                    <div key={req._id} className="request-card glass-card" style={{ borderLeft: '3px solid var(--primary)' }}>
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
                                                    <p>&#8377;{req.estimatedPrice}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-footer" style={{ borderTop: '1px solid var(--bg-light)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <button className="btn-outline-sm" style={{ borderRadius: '50px', padding: '8px 20px' }} onClick={() => openDetails(req)}>Details</button>
                                                <button
                                                    className="btn-outline"
                                                    style={{ color: '#ff4d4d', borderColor: '#ff4d4d', borderRadius: '50px', padding: '8px 25px', fontSize: '0.9rem' }}
                                                    onClick={() => handleDeleteRequest(req._id)}
                                                >Delete</button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                                {['accepted', 'completed', 'cancelled'].map(s => (
                                                    <button
                                                        key={s}
                                                        className={`btn-outline-sm ${req.status === s ? 'active' : ''}`}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '8px 0',
                                                            fontSize: '0.8rem',
                                                            flex: 1,
                                                            ...(s === 'cancelled' ? { color: '#ff4d4d', borderColor: '#ff4d4d' } : {}),
                                                            ...(s === 'completed' ? { color: 'green', borderColor: 'green' } : {})
                                                        }}
                                                        onClick={() => handleUpdateStatus(req._id, s)}
                                                        disabled={req.status === s}
                                                    >
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                                    <tr key={u._id} style={{ opacity: u.isActive === false ? 0.6 : 1 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {u.name}
                                                {u.isActive === false && (
                                                    <span style={{ background: '#ff4d4d22', color: '#ff4d4d', borderRadius: '50px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px' }}>INACTIVE</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            {isSuperAdmin && u._id !== JSON.parse(localStorage.getItem('user'))?._id ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                    style={{ 
                                                        padding: '6px 30px 6px 15px', 
                                                        borderRadius: '50px', 
                                                        border: '1px solid var(--border-color)',
                                                        fontSize: '0.85rem',
                                                        background: (u.role === 'admin' || u.role === 'superadmin') ? 'var(--primary)' : 'var(--bg-light)',
                                                        color: (u.role === 'admin' || u.role === 'superadmin') ? 'var(--white)' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        width: 'max-content',
                                                        appearance: 'none',
                                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 10px center',
                                                        backgroundSize: '14px'
                                                    }}
                                                >
                                                    <option value="client" style={{ color: 'var(--text-color)', background: 'white' }}>client</option>
                                                    <option value="admin" style={{ color: 'var(--text-color)', background: 'white' }}>admin</option>
                                                    <option value="superadmin" style={{ color: 'var(--text-color)', background: 'white' }}>superadmin</option>
                                                </select>
                                            ) : (
                                                <span className="status-badge" style={{ background: (u.role === 'admin' || u.role === 'superadmin') ? 'var(--primary)' : 'var(--bg-light)', color: (u.role === 'admin' || u.role === 'superadmin') ? 'var(--white)' : 'var(--text-muted)', borderRadius: '50px' }}>{u.role}</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-outline"
                                                style={{
                                                    borderRadius: '50px',
                                                    padding: '8px 20px',
                                                    fontSize: '0.9rem',
                                                    color: u.isActive === false ? '#22c55e' : '#ff4d4d',
                                                    borderColor: u.isActive === false ? '#22c55e' : '#ff4d4d',
                                                }}
                                                onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                                                disabled={u.role === 'admin' || u.role === 'superadmin'}
                                            >{u.isActive === false ? 'Activate' : 'Deactivate'}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'admin-pending' ? (
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
                ) : activeTab === 'performance' ? (
                    <div className="performance-view">
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {isSuperAdmin && (
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '15px', flex: 1, minWidth: '300px' }}>
                                    <label style={{ fontWeight: '600', color: 'var(--secondary)', minWidth: 'max-content' }}>Select Admin:</label>
                                    <select
                                        style={{
                                            padding: '10px 15px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-light)',
                                            color: 'var(--text-main)',
                                            outline: 'none',
                                            width: '100%',
                                            cursor: 'pointer'
                                        }}
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

                            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '15px', flex: isSuperAdmin ? 1 : 'none', minWidth: '300px' }}>
                                <label style={{ fontWeight: '600', color: 'var(--secondary)', minWidth: 'max-content' }}>Time Range:</label>
                                <select
                                    style={{
                                        padding: '10px 15px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-light)',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        width: '100%',
                                        cursor: 'pointer'
                                    }}
                                    value={analyticsTimeRange}
                                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                                >
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="6m">Last 6 Months</option>
                                </select>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            <div className="stat-card glass-card p-30" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: 'rgba(247, 183, 51, 0.2)', padding: '20px', borderRadius: '20px', color: 'var(--primary)' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>{adminPerformance?.totalCompleted || 0}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Jobs Completed</p>
                                </div>
                            </div>
                            <div className="stat-card glass-card p-30" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '20px', borderRadius: '20px', color: '#22c55e' }}>
                                    <DollarSign size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>&#8377;{adminPerformance?.totalRevenue?.toLocaleString() || 0}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
                                </div>
                            </div>
                            <div className="stat-card glass-card p-30" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '20px', borderRadius: '20px', color: '#38bdf8' }}>
                                    <TrendingUp size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>
                                        {adminPerformance?.chartData?.length ? 
                                            adminPerformance.chartData[adminPerformance.chartData.length - 1].jobs 
                                        : 0}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Jobs Today</p>
                                </div>
                            </div>
                        </div>

                        <div className="chart-container glass-card p-30" style={{ height: '400px', width: '100%', paddingBottom: '70px' }}>
                            <h3 style={{ marginBottom: '25px', color: 'var(--secondary)' }}>Performance Timeline</h3>
                            {adminPerformance?.chartData && adminPerformance.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adminPerformance.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="var(--text-muted)" 
                                            tick={{ fill: 'var(--text-muted)' }} 
                                            axisLine={false} 
                                            tickLine={false} 
                                            minTickGap={20}
                                        />
                                        
                                        <YAxis yAxisId="left" orientation="left" stroke="var(--primary)" tick={{ fill: 'var(--primary)' }} axisLine={false} tickLine={false} tickFormatter={(val) => Math.round(val)} />
                                        
                                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tick={{ fill: '#22c55e' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                                        
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '15px', color: 'var(--text-main)' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        
                                        <Bar yAxisId="left" dataKey="jobs" name="Jobs Completed" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar yAxisId="right" dataKey="revenue" name="Revenue Earned (₹)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    No performance data available yet.
                                </div>
                            )}
                        </div>
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
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This order is unclaimed. Go to the <strong>Orders</strong> page to claim it first.</p>
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
                )
            }
        </div >
    );
};

export default Dashboard;
