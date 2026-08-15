import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, User, Mail, Lock, Phone, Eye, EyeOff, UserCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobileNo: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { showToast } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Basic client validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (!/^\d{10}$/.test(formData.mobileNo.trim())) {
            setError('Mobile number must be a valid 10-digit number.');
            return;
        }

        setLoading(true);

        const payload = {
            username: formData.username.trim(),
            firstName: formData.firstName.trim(),
            middleName: formData.middleName.trim() || null,
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            mobileNo: formData.mobileNo.trim(),
            password: formData.password
        };

        try {
            await api.post('/api/auth/signup', payload);
            localStorage.setItem('trainUserProfile', JSON.stringify({
                firstName: payload.firstName,
                lastName: payload.lastName,
                fullName: `${payload.firstName} ${payload.lastName}`.trim(),
                email: payload.email,
                username: payload.username
            }));
            showToast('Registration successful! Please sign in.', 'success');
            navigate('/login', {
                state: { message: 'Registration successful! Please sign in with your credentials.' }
            });
        } catch (err) {
            console.error("Signup error:", err);
            const msg = err.data?.message || err.message || 'Registration failed. Please check your details.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={styles.card}
            >
                {/* Header */}
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
                        <span>Instant Passenger Onboarding</span>
                    </div>
                    <h1 className="font-display" style={styles.title}>Create Passenger Account</h1>
                    <p style={styles.subtitle}>Register to reserve seats with instant lock & real-time confirmation</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={styles.errorBanner}>
                        <AlertTriangle size={18} color="#F43F5E" style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSignup} style={styles.form}>
                    {/* Name row */}
                    <div style={styles.row}>
                        <div style={styles.inputField}>
                            <label style={styles.label}>First Name *</label>
                            <input 
                                type="text" 
                                name="firstName" 
                                placeholder="Rishi" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                        </div>
                        <div style={styles.inputField}>
                            <label style={styles.label}>Last Name *</label>
                            <input 
                                type="text" 
                                name="lastName" 
                                placeholder="Kundar" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputField}>
                        <label style={styles.label}>Username *</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="rishikundar" 
                                value={formData.username} 
                                onChange={handleChange} 
                                style={styles.inputWithIcon} 
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputField}>
                        <label style={styles.label}>Email Address *</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="rishi@example.com" 
                                value={formData.email} 
                                onChange={handleChange} 
                                style={styles.inputWithIcon} 
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputField}>
                        <label style={styles.label}>Mobile Number * (10 Digits)</label>
                        <div style={styles.inputWrapper}>
                            <Phone size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type="tel" 
                                name="mobileNo" 
                                placeholder="9876543210" 
                                value={formData.mobileNo} 
                                onChange={handleChange} 
                                style={styles.inputWithIcon} 
                                maxLength={10}
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputField}>
                        <label style={styles.label}>Password * (Min 8 characters)</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} color="var(--text-dim)" style={styles.leadingIcon} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder="••••••••" 
                                value={formData.password} 
                                onChange={handleChange} 
                                style={styles.inputWithIcon} 
                                minLength={8}
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.trailingIconBtn}
                                title={showPassword ? "Hide password" : "Show password"}
                                aria-label="Toggle password visibility"
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
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Passenger Account</span>
                                <UserCheck size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
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
        padding: '2.75rem 2.5rem',
        width: '100%',
        maxWidth: '500px',
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
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
        marginBottom: '0.85rem',
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
        fontSize: '1.75rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        marginTop: '0.35rem',
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        lineHeight: 1.4,
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.35)',
        color: '#FDA4AF',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        marginBottom: '1.25rem',
        fontSize: '0.88rem',
        fontWeight: 600,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem',
    },
    inputField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.82rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
    },
    input: {
        width: '100%',
        padding: '0.82rem 1.1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.92rem',
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
    inputWithIcon: {
        width: '100%',
        padding: '0.82rem 2.8rem 0.82rem 2.8rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.92rem',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    footer: {
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    link: {
        color: 'var(--accent-primary)',
        textDecoration: 'none',
        fontWeight: 700,
    }
};

export default Signup;

