// main nav
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown, Settings, Truck } from 'lucide-react';
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
        setUser(JSON.parse(storedUser));
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
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-text">HYDROX <span className="logo-highlight">MOVERS</span></span>
        </Link>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/booking" onClick={() => setIsOpen(false)}>Booking</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>


          <div className="nav-auth">
            <ThemeToggle />
            {user ? (
              <>
                <div className="profile-menu-container" style={{ position: 'relative' }}>
                  <button
                    className="profile-trigger"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--secondary)',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}
                  >
                    <div style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={20} />
                    </div>
                    <span>{user.name}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isProfileOpen && (
                    <div className="profile-dropdown glass-card" style={{
                      position: 'absolute',
                      top: '120%',
                      right: '0',
                      width: '200px',
                      padding: '10px',
                      borderRadius: '15px',
                      zIndex: '1000',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      <Link
                        to="/profile"
                        className="profile-menu-item"
                        onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                        style={{
                          padding: '10px 15px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          color: 'var(--secondary)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <User size={16} /> Profile
                      </Link>
                      {['client', 'provider'].includes(user.role?.trim().toLowerCase()) && (
                        <Link
                          to="/orders"
                          className="profile-menu-item"
                          onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                          style={{
                            padding: '10px 15px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            color: 'var(--secondary)',
                            transition: 'background 0.2s'
                          }}
                        >
                          <Truck size={16} /> Orders
                        </Link>
                      )}
                      {['admin', 'provider'].includes(user.role?.trim().toLowerCase()) && (
                        <Link
                          to="/dashboard"
                          className="profile-menu-item"
                          onClick={() => { setIsProfileOpen(false); setIsOpen(false); }}
                          style={{
                            padding: '10px 15px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            color: 'var(--secondary)',
                            transition: 'background 0.2s'
                          }}
                        >
                          <Settings size={16} /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="profile-menu-item"
                        style={{
                          padding: '10px 15px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          color: '#ff4d4d',
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
