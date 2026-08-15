import React, { useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Search, Ticket, ShieldCheck, LogOut, Sun, Moon, Sparkles, LogIn, UserPlus, Compass } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export const Navbar = () => {
    const { isAuthenticated, user, isAdmin, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Resolve Full Name & Initials
    const displayName = user?.fullName || 
                        (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || 
                        user?.username || 
                        (user?.email ? user.email.split('@')[0] : 'Passenger');

    const getInitials = (name) => {
        if (!name || name === 'Passenger') return 'P';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header style={styles.header}>
            <div style={styles.navContainer}>
                {/* Brand */}
                <Link to="/" style={styles.brand}>
                    <motion.div
                        whileHover={{ rotate: 8, scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.logoBadge}
                    >
                        <Train size={22} color="#FFFFFF" />
                    </motion.div>
                    <div>
                        <div style={styles.brandTitleWrap}>
                            <span className="font-display" style={styles.brandTitle}>TBS Rail</span>
                            <span style={styles.liveDot} className="live-pulse" title="System Online" />
                        </div>
                        <div style={styles.brandSubtitle}>Express Reservation Engine</div>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav style={styles.navLinks}>
                    <Link
                        to="/"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') ? styles.navLinkActive : {})
                        }}
                    >
                        <Compass size={17} />
                        <span>Explore</span>
                        {isActive('/') && (
                            <motion.div 
                                layoutId="navIndicator" 
                                style={styles.activeIndicator} 
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </Link>

                    {isAuthenticated && (
                        <Link
                            to="/dashboard"
                            style={{
                                ...styles.navLink,
                                ...(isActive('/dashboard') ? styles.navLinkActive : {})
                            }}
                        >
                            <Ticket size={17} />
                            <span>My Journeys</span>
                            {isActive('/dashboard') && (
                                <motion.div 
                                    layoutId="navIndicator" 
                                    style={styles.activeIndicator} 
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    )}

                    <Link
                        to="/search"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/search') ? styles.navLinkActive : {})
                        }}
                    >
                        <Search size={17} />
                        <span>Find Trains</span>
                        {isActive('/search') && (
                            <motion.div 
                                layoutId="navIndicator" 
                                style={styles.activeIndicator} 
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </Link>

                    {isAuthenticated && isAdmin && (
                        <Link
                            to="/admin"
                            style={{
                                ...styles.navLink,
                                ...(isActive('/admin') ? styles.adminLinkActive : {}),
                                color: isActive('/admin') ? '#F59E0B' : 'var(--text-muted)'
                            }}
                        >
                            <ShieldCheck size={17} color={isActive('/admin') ? '#F59E0B' : 'var(--text-muted)'} />
                            <span>Command Hub</span>
                            {isActive('/admin') && (
                                <motion.div 
                                    layoutId="navIndicator" 
                                    style={{ ...styles.activeIndicator, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)', borderColor: 'rgba(245, 158, 11, 0.4)' }} 
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    )}
                </nav>

                {/* User & Actions Section */}
                <div style={styles.rightSection}>
                    {/* Dark/Light Mode Switcher */}
                    <motion.button
                        whileHover={{ scale: 1.08, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        style={styles.themeToggleBtn}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Sun size={18} color="#F59E0B" />
                        ) : (
                            <Moon size={18} color="#0284C7" />
                        )}
                    </motion.button>

                    {isAuthenticated ? (
                        <>
                            {/* User Profile Badge */}
                            <div style={styles.userBadge}>
                                <div style={styles.avatar}>
                                    <span style={styles.initialsText} className="font-mono">{getInitials(displayName)}</span>
                                </div>
                                <div style={styles.userInfo}>
                                    <span style={styles.userName}>{displayName}</span>
                                    {isAdmin ? (
                                        <span style={styles.roleTagAdmin}>ADMIN</span>
                                    ) : (
                                        <span style={styles.roleTagPassenger}>PASSENGER</span>
                                    )}
                                </div>
                            </div>

                            {/* Sign Out */}
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(244, 63, 94, 0.18)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                style={styles.logoutBtn}
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                                <span style={styles.logoutText}>Logout</span>
                            </motion.button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Link to="/login" style={styles.signInBtn}>
                                <LogIn size={15} />
                                <span>Sign In</span>
                            </Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
                                <UserPlus size={15} />
                                <span>Get Started</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const styles = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)'
    },
    navContainer: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        textDecoration: 'none',
        color: 'var(--text-main)'
    },
    logoBadge: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    brandTitleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem'
    },
    brandTitle: {
        fontWeight: 800,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        color: 'var(--text-main)'
    },
    liveDot: {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: '#10B981',
        display: 'inline-block'
    },
    brandSubtitle: {
        fontSize: '0.68rem',
        color: 'var(--text-dim)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.35rem',
        borderRadius: '14px',
        border: '1px solid var(--glass-border)'
    },
    navLink: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.6rem 1.15rem',
        borderRadius: '10px',
        textDecoration: 'none',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'color 0.2s ease',
        zIndex: 1
    },
    navLinkActive: {
        color: 'var(--accent-primary)'
    },
    adminLinkActive: {
        color: '#F59E0B'
    },
    activeIndicator: {
        position: 'absolute',
        inset: 0,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.06) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        zIndex: -1,
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
    },
    themeToggleBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    signInBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.55rem 1rem',
        borderRadius: '12px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        fontWeight: 700,
        textDecoration: 'none',
        transition: 'all 0.2s ease'
    },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.4rem 0.95rem 0.4rem 0.5rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px'
    },
    avatar: {
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    initialsText: {
        fontSize: '0.8rem',
        fontWeight: 800,
        color: 'var(--accent-primary)',
        letterSpacing: '0.05em'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    userName: {
        fontSize: '0.88rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        lineHeight: 1.2
    },
    roleTagAdmin: {
        fontSize: '0.62rem',
        fontWeight: 800,
        color: '#F59E0B',
        letterSpacing: '0.06em'
    },
    roleTagPassenger: {
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'var(--accent-primary)',
        letterSpacing: '0.06em'
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.6rem 0.95rem',
        background: 'rgba(244, 63, 94, 0.1)',
        color: '#FDA4AF',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    logoutText: {
        display: 'inline'
    }
};

export default Navbar;
