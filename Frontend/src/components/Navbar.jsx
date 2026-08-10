import React, { useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Search, Ticket, ShieldCheck, LogOut, User, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export const Navbar = () => {
    const { isAuthenticated, user, isAdmin, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) return null;

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
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        style={styles.logoBadge}
                    >
                        <Train size={22} color="#070B12" />
                    </motion.div>
                    <div>
                        <div style={styles.brandTitle}>TBS Rail</div>
                        <div style={styles.brandSubtitle}>Express Reservation</div>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav style={styles.navLinks}>
                    <Link
                        to="/"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') ? styles.navLinkActive : {})
                        }}
                    >
                        <Ticket size={18} />
                        <span>My Bookings</span>
                    </Link>

                    <Link
                        to="/search"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/search') ? styles.navLinkActive : {})
                        }}
                    >
                        <Search size={18} />
                        <span>Find Trains</span>
                    </Link>

                    {isAdmin && (
                        <Link
                            to="/admin"
                            style={{
                                ...styles.navLink,
                                ...(isActive('/admin') ? styles.adminLinkActive : {}),
                                color: isActive('/admin') ? '#F59E0B' : '#CBD5E1'
                            }}
                        >
                            <ShieldCheck size={18} color="#F59E0B" />
                            <span>Admin Portal</span>
                        </Link>
                    )}
                </nav>

                {/* User & Actions */}
                <div style={styles.rightSection}>
                    {/* Dark/Light Mode Switcher */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
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

                    {/* User Profile Badge */}
                    <div style={styles.userBadge}>
                        <div style={styles.avatar}>
                            <span style={styles.initialsText}>{getInitials(displayName)}</span>
                        </div>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{displayName}</span>
                            {isAdmin && <span style={styles.roleTag}>ADMIN</span>}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        style={styles.logoutBtn}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                        <span style={styles.logoutText}>Logout</span>
                    </motion.button>
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
        background: 'rgba(7, 11, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    },
    navContainer: {
        maxWidth: '1280px',
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
        gap: '0.75rem',
        textDecoration: 'none',
        color: 'var(--text-main)'
    },
    logoBadge: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
    },
    brandTitle: {
        fontWeight: 800,
        fontSize: '1.15rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.1
    },
    brandSubtitle: {
        fontSize: '0.7rem',
        color: '#64748B',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.3rem 0.5rem',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)'
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 1rem',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'all 0.2s ease'
    },
    navLinkActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)'
    },
    adminLinkActive: {
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#F59E0B'
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
    },
    themeToggleBtn: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.4rem 0.85rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.25) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    initialsText: {
        fontSize: '0.78rem',
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
    roleTag: {
        fontSize: '0.65rem',
        fontWeight: 800,
        color: '#F59E0B',
        letterSpacing: '0.05em'
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.55rem 0.9rem',
        background: 'rgba(244, 63, 94, 0.1)',
        color: '#FDA4AF',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        borderRadius: '10px',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    logoutText: {
        display: 'inline'
    }
};

export default Navbar;
