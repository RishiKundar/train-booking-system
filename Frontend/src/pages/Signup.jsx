import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, User, Mail, Lock, Phone, Eye, EyeOff, UserCheck, AlertTriangle } from 'lucide-react';
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
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={styles.card}
            >
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.iconCircle}>
                        <Train size={36} color="#070B12" />
                    </div>
                    <h1 style={styles.title}>Create Passenger Account</h1>
                    <p style={styles.subtitle}>Register to reserve seats with instant confirmation & tracking</p>
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
                            <User size={18} color="#64748B" style={styles.leadingIcon} />
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
                            <Mail size={18} color="#64748B" style={styles.leadingIcon} />
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
                            <Phone size={18} color="#64748B" style={styles.leadingIcon} />
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
                            <Lock size={18} color="#64748B" style={styles.leadingIcon} />
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
                    <p style={{ margin: 0 }}>
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
        minHeight: '100vh',
        width: '100%',
        padding: '2.5rem 1rem',
    },
    card: {
        background: 'rgba(17, 27, 49, 0.75)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.5rem 2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.75rem',
        textAlign: 'center',
    },
    iconCircle: {
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#F8FAFC',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        marginTop: '0.35rem',
        color: '#94A3B8',
        fontSize: '0.88rem',
        lineHeight: 1.4,
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#FDA4AF',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        marginBottom: '1.25rem',
        fontSize: '0.88rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem',
    },
    inputField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    label: {
        fontSize: '0.82rem',
        fontWeight: 600,
        color: '#CBD5E1',
    },
    input: {
        width: '100%',
        padding: '0.8rem 1rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#F8FAFC',
        fontSize: '0.92rem',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    leadingIcon: {
        position: 'absolute',
        left: '1rem',
        pointerEvents: 'none',
    },
    inputWithIcon: {
        width: '100%',
        padding: '0.8rem 2.8rem 0.8rem 2.6rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#F8FAFC',
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
        padding: 0,
        cursor: 'pointer',
    },
    submitBtn: {
        width: '100%',
        marginTop: '0.5rem',
        padding: '0.95rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    footer: {
        marginTop: '1.5rem',
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

export default Signup;
