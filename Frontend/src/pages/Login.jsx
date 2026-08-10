import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const data = await api.post('/api/auth/login', { email, password });
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

    return (
        <div style={styles.container}>
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={styles.card}
            >
                {/* Header */}
                <div style={styles.header}>
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        style={styles.iconCircle}
                    >
                        <Train size={36} color="#070B12" />
                    </motion.div>
                    <h1 style={styles.title}>TBS Passenger Portal</h1>
                    <p style={styles.subtitle}>Enter your credentials to access fast train reservations</p>
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
                            <Mail size={18} color="#64748B" style={styles.leadingIcon} />
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
                            <Lock size={18} color="#64748B" style={styles.leadingIcon} />
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
                            >
                                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
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
                                <span>Sign In</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={{ margin: 0 }}>
                        Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
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
        minHeight: '100vh',
        width: '100%',
        padding: '2rem 1rem',
    },
    card: {
        background: 'rgba(17, 27, 49, 0.75)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem',
        textAlign: 'center',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
        marginBottom: '1.25rem',
    },
    title: {
        margin: 0,
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#F8FAFC',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        marginTop: '0.5rem',
        color: '#94A3B8',
        fontSize: '0.9rem',
        lineHeight: 1.4,
    },
    successBanner: {
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#34D399',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        textAlign: 'center',
        fontWeight: 500,
    },
    errorBanner: {
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#FDA4AF',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        textAlign: 'center',
        fontWeight: 500,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    inputField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#CBD5E1',
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
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#F8FAFC',
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
        padding: 0,
        cursor: 'pointer',
    },
    submitBtn: {
        width: '100%',
        marginTop: '0.5rem',
        padding: '0.95rem',
        borderRadius: '12px',
    },
    footer: {
        marginTop: '2rem',
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: '0.9rem',
    },
    link: {
        color: '#38BDF8',
        textDecoration: 'none',
        fontWeight: 700,
    }
};

export default Login;