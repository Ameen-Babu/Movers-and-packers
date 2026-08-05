import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown, Settings, Truck, Phone, Clock, MapPin, ShieldCheck, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('userLogin', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userLogin', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <header className="site-header">
      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <Link to="/" className="logo-brand">
            <span className="brand-name">HYDROX <span className="brand-accent">MOVERS</span></span>
          </Link>

          <div className={`nav-links ${isOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-item" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="nav-item" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/booking" className="nav-item" onClick={() => setIsOpen(false)}>Instant Quote & Booking</Link>
            <Link to="/contact" className="nav-item" onClick={() => setIsOpen(false)}>Contact & Branches</Link>

            <div className="nav-auth-section">
              <div className="desktop-theme-toggle">
                <ThemeToggle />
              </div>
              {user ? (
                <div className="profile-menu-container">
                  <button
                    className="profile-trigger-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <span className="user-name-label">{user.name || 'Account'}</span>
                    <ChevronDown size={14} />
                  </button>

                  {isProfileOpen && (
                    <div className="profile-dropdown-panel">
                      <div className="dropdown-user-header">
                        <p className="dropdown-user-name">{user.name}</p>
                        <p className="dropdown-user-email">{user.email || 'Verified Customer'}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link
                        to="/profile"
                        className="profile-menu-item"
                        onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                      >
                        <User size={16} /> My Account Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="profile-menu-item"
                        onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                      >
                        <Truck size={16} /> Active Relocations & Orders
                      </Link>

                      {['admin', 'superadmin'].includes(user.role?.trim().toLowerCase()) && (
                        <Link
                          to="/dashboard"
                          className="profile-menu-item"
                          onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                        >
                          <Settings size={16} /> Admin Command Portal
                        </Link>
                      )}

                      <div className="dropdown-divider"></div>

                      <button onClick={handleLogout} className="profile-menu-item logout-item">
                        <LogOut size={16} /> End Session (Logout)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-btn-group">
                  <Link to="/login" className="btn-secondary-nav" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/booking" className="btn-primary-nav" onClick={() => setIsOpen(false)}>Book Relocation</Link>
                </div>
              )}
            </div>
          </div>

          <div className="mobile-controls">
            <div className="mobile-theme-toggle">
              <ThemeToggle />
            </div>
            <button className="mobile-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Navigation">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
