import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const toastIcons = {
    success: <CheckCircle2 size={18} color="#10B981" />,
    error: <AlertCircle size={18} color="#F43F5E" />,
    warning: <AlertTriangle size={18} color="#F59E0B" />,
    info: <Info size={18} color="#38BDF8" />
};

const toastThemes = {
    success: { 
        border: 'rgba(16, 185, 129, 0.35)', 
        bg: 'rgba(16, 185, 129, 0.12)',
        glow: 'rgba(16, 185, 129, 0.25)',
        accent: '#10B981'
    },
    error: { 
        border: 'rgba(244, 63, 94, 0.35)', 
        bg: 'rgba(244, 63, 94, 0.12)',
        glow: 'rgba(244, 63, 94, 0.25)',
        accent: '#F43F5E'
    },
    warning: { 
        border: 'rgba(245, 158, 11, 0.35)', 
        bg: 'rgba(245, 158, 11, 0.12)',
        glow: 'rgba(245, 158, 11, 0.25)',
        accent: '#F59E0B'
    },
    info: { 
        border: 'rgba(56, 189, 248, 0.35)', 
        bg: 'rgba(56, 189, 248, 0.12)',
        glow: 'rgba(56, 189, 248, 0.25)',
        accent: '#38BDF8'
    }
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useContext(AuthContext);

    return (
        <div style={styles.container}>
            <AnimatePresence>
                {toasts.map(toast => {
                    const theme = toastThemes[toast.type] || toastThemes.info;
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.92, x: 20 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.88, x: 30, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            style={{
                                ...styles.toast,
                                borderColor: theme.border,
                                boxShadow: `0 15px 35px -5px rgba(0, 0, 0, 0.45), 0 0 20px ${theme.glow}`
                            }}
                        >
                            <div style={{ ...styles.iconBox, background: theme.bg, border: `1px solid ${theme.border}` }}>
                                {toastIcons[toast.type] || toastIcons.info}
                            </div>
                            <p style={styles.message}>{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={styles.closeBtn}
                                aria-label="Close notification"
                            >
                                <X size={15} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100% - 2.5rem)',
        pointerEvents: 'none'
    },
    toast: {
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.85rem 1.15rem',
        borderRadius: '16px',
        border: '1px solid',
        background: 'var(--bg-card-elevated, rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--text-main, #F8FAFC)'
    },
    iconBox: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    message: {
        margin: 0,
        fontSize: '0.88rem',
        fontWeight: 600,
        lineHeight: 1.4,
        flex: 1
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted, #94A3B8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
    }
};

