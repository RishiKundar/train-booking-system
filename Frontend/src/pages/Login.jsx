import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const data = await api.post('/api/auth/login', { email: email.trim(), password });
            if (data.accessToken) {
                const profileHint = { email: email.trim() };
                login(data.accessToken, data.refreshToken, profileHint);
                navigate('/', { replace: true });
            } else {
                setError('Invalid response from authentication server.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickFill = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <div style={styles.container}>
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={styles.card}
            >
                {/* Brand Header */}
                <div style={styles.header}>
                    <motion.div 
                        whileHover={{ scale: 1.12, rotate: 6 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.iconCircle}
                    >
                        <Train size={34} color="#FFFFFF" />
                    </motion.div>
                    <div style={styles.badgePill}>
                        <Sparkles size={13} color="#38BDF8" />
                        <span>High-Speed Rail Cloud</span>
                    </div>
                    <h1 className="font-display" style={styles.title}>TBS Passenger Portal</h1>
                    <p style={styles.subtitle}>Enter your credentials to manage tickets and instant bookings</p>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={styles.successBanner}>
                        {successMessage}
                    </motion.div>
                )}

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={styles.errorBanner}>
                        {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputField}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>
                    
                    <div style={styles.inputField}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.trailingIconBtn}
                                aria-label="Toggle password view"
                            >
                                {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spin">⚡</span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In to Portal</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Quick Demo Helper */}
                <div style={styles.demoSection}>
                    <div style={styles.demoTitle}>Quick Demo Logins</div>
                    <div style={styles.demoGrid}>
                        <button 
                            type="button" 
                            onClick={() => handleQuickFill('rishi@example.com', 'Password123!')}
                            style={styles.demoBtn}
                        >
                            <User size={14} color="#38BDF8" />
                            <span>Passenger Demo</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleQuickFill('admin@trainbooking.com', 'Admin123!')}
                            style={styles.demoBtnAdmin}
                        >
                            <ShieldCheck size={14} color="#F59E0B" />
                            <span>Admin Demo</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/signup" style={styles.link}>Create Account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        width: '100%',
        padding: '2.5rem 1rem',
    },
    card: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: 'var(--shadow-xl), var(--glass-glow)',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.75rem',
        textAlign: 'center',
    },
    iconCircle: {
        width: '68px',
        height: '68px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.45)',
        marginBottom: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    badgePill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        color: 'var(--accent-primary)',
        fontSize: '0.75rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        letterSpacing: '0.03em'
    },
    title: {
        margin: 0,
        fontSize: '1.85rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        marginTop: '0.4rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.4,
    },
    successBanner: {
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        color: '#34D399',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        textAlign: 'center',
        fontWeight: 600,
    },
    errorBanner: {
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.35)',
        color: '#FDA4AF',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        textAlign: 'center',
        fontWeight: 600,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    inputField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    leadingIcon: {
        position: 'absolute',
        left: '1.1rem',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '0.85rem 2.8rem 0.85rem 2.8rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
    },
    trailingIconBtn: {
        position: 'absolute',
        right: '1rem',
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        cursor: 'pointer',
    },
    submitBtn: {
        width: '100%',
        marginTop: '0.5rem',
        padding: '0.95rem',
        borderRadius: '14px',
    },
    demoSection: {
        marginTop: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--glass-border)'
    },
    demoTitle: {
        fontSize: '0.72rem',
        fontWeight: 800,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textAlign: 'center',
        marginBottom: '0.75rem'
    },
    demoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.65rem'
    },
    demoBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        padding: '0.6rem 0.75rem',
        borderRadius: '10px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    demoBtnAdmin: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        padding: '0.6rem 0.75rem',
        borderRadius: '10px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        color: '#F59E0B',
        fontSize: '0.78rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    footer: {
        marginTop: '1.75rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    link: {
        color: 'var(--accent-primary)',
        textDecoration: 'none',
        fontWeight: 700,
    }
};

export default Login;