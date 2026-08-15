import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, AlertCircle, Sparkles, Zap, Award } from 'lucide-react';

export const StatusBadge = ({ status }) => {
    const s = (status || 'UNKNOWN').toUpperCase();

    const config = {
        CONFIRMED: {
            label: 'Confirmed',
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.35)',
            glow: 'rgba(16, 185, 129, 0.3)',
            pulseClass: 'live-pulse',
            icon: <CheckCircle2 size={13} color="#10B981" />
        },
        PAYMENT_PENDING: {
            label: 'Payment Pending',
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.35)',
            glow: 'rgba(245, 158, 11, 0.3)',
            pulseClass: 'live-pulse-amber',
            icon: <Clock size={13} color="#F59E0B" />
        },
        PENDING: {
            label: 'Processing Lock...',
            color: '#38BDF8',
            bg: 'rgba(56, 189, 248, 0.12)',
            border: 'rgba(56, 189, 248, 0.35)',
            glow: 'rgba(56, 189, 248, 0.3)',
            pulseClass: '',
            icon: <Clock size={13} color="#38BDF8" className="spin" />
        },
        CANCELLED: {
            label: 'Cancelled',
            color: '#F43F5E',
            bg: 'rgba(244, 63, 94, 0.12)',
            border: 'rgba(244, 63, 94, 0.35)',
            glow: 'none',
            pulseClass: '',
            icon: <XCircle size={13} color="#F43F5E" />
        },
        FAILED: {
            label: 'Booking Failed',
            color: '#94A3B8',
            bg: 'rgba(148, 163, 184, 0.12)',
            border: 'rgba(148, 163, 184, 0.3)',
            glow: 'none',
            pulseClass: '',
            icon: <AlertCircle size={13} color="#94A3B8" />
        },
        PAYMENT_FAILED: {
            label: 'Payment Declined',
            color: '#F43F5E',
            bg: 'rgba(244, 63, 94, 0.12)',
            border: 'rgba(244, 63, 94, 0.35)',
            glow: 'none',
            pulseClass: '',
            icon: <AlertTriangle size={13} color="#F43F5E" />
        }
    };

    const current = config[s] || {
        label: s,
        color: '#94A3B8',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.12)',
        glow: 'none',
        pulseClass: '',
        icon: null
    };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: current.color,
            background: current.bg,
            border: `1px solid ${current.border}`,
            boxShadow: current.glow !== 'none' ? `0 0 12px ${current.glow}` : 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
        }}>
            {current.pulseClass ? (
                <span
                    className={current.pulseClass}
                    style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: current.color,
                        display: 'inline-block'
                    }}
                />
            ) : current.icon}
            {current.label}
        </span>
    );
};

export const SeatClassBadge = ({ seatClass }) => {
    const classLabels = {
        SLEEPER: { 
            label: 'Sleeper (SL)', 
            code: 'SL',
            color: '#38BDF8', 
            bg: 'rgba(56, 189, 248, 0.12)', 
            border: 'rgba(56, 189, 248, 0.3)' 
        },
        AC_3_TIER: { 
            label: 'AC 3 Tier (3A)', 
            code: '3A',
            color: '#818CF8', 
            bg: 'rgba(129, 140, 248, 0.12)', 
            border: 'rgba(129, 140, 248, 0.3)' 
        },
        AC_2_TIER: { 
            label: 'AC 2 Tier (2A)', 
            code: '2A',
            color: '#C084FC', 
            bg: 'rgba(192, 132, 252, 0.12)', 
            border: 'rgba(192, 132, 252, 0.3)' 
        },
        AC_FIRST_CLASS: { 
            label: 'Executive (1A)', 
            code: '1A',
            color: '#F59E0B', 
            bg: 'rgba(245, 158, 11, 0.12)', 
            border: 'rgba(245, 158, 11, 0.3)' 
        }
    };

    const info = classLabels[seatClass] || { 
        label: seatClass, 
        code: seatClass, 
        color: '#CBD5E1', 
        bg: 'rgba(255,255,255,0.05)', 
        border: 'rgba(255,255,255,0.1)' 
    };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: info.color,
            background: info.bg,
            border: `1px solid ${info.border}`,
            letterSpacing: '0.02em'
        }}>
            <Award size={12} color={info.color} />
            {info.label}
        </span>
    );
};

export const TrainTypeBadge = ({ type }) => {
    const t = (type || 'EXPRESS').toUpperCase();
    const isVande = t.includes('VANDE') || t.includes('BULLET') || t.includes('SPECIAL');
    const isSuperfast = t.includes('SUPERFAST') || t.includes('RAJDHANI') || t.includes('SHATABDI');

    const color = isVande ? '#06B6D4' : isSuperfast ? '#F59E0B' : '#38BDF8';
    const bg = isVande ? 'rgba(6, 182, 212, 0.12)' : isSuperfast ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.12)';
    const border = isVande ? 'rgba(6, 182, 212, 0.3)' : isSuperfast ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)';

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: color,
            background: bg,
            border: `1px solid ${border}`,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
        }}>
            {isVande ? <Sparkles size={11} color={color} /> : <Zap size={11} color={color} />}
            {t}
        </span>
    );
};

