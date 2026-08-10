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

const toastColors = {
    success: { border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.12)' },
    error: { border: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.12)' },
    warning: { border: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.12)' },
    info: { border: 'rgba(56, 189, 248, 0.3)', bg: 'rgba(56, 189, 248, 0.12)' }
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useContext(AuthContext);

    return (
        <div style={styles.container}>
            <AnimatePresence>
                {toasts.map(toast => {
                    const theme = toastColors[toast.type] || toastColors.info;
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            style={{
                                ...styles.toast,
                                borderColor: theme.border,
                                background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(15, 23, 42, 0.95) 100%)`
                            }}
                        >
                            <div style={styles.iconBox}>
                                {toastIcons[toast.type] || toastIcons.info}
                            </div>
                            <p style={styles.message}>{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={styles.closeBtn}
                                aria-label="Close notification"
                            >
                                <X size={16} />
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
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none'
    },
    toast: {
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.9rem 1.15rem',
        borderRadius: '14px',
        border: '1px solid',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        color: '#F8FAFC'
    },
    iconBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    message: {
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 500,
        lineHeight: 1.4,
        flex: 1
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#94A3B8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'color 0.2s, background-color 0.2s',
        flexShrink: 0
    }
};
