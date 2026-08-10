import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
    const s = (status || 'UNKNOWN').toUpperCase();

    const config = {
        CONFIRMED: {
            label: 'Confirmed',
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.15)',
            border: 'rgba(16, 185, 129, 0.3)',
            icon: <CheckCircle2 size={13} color="#10B981" />
        },
        PAYMENT_PENDING: {
            label: 'Payment Pending',
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.15)',
            border: 'rgba(245, 158, 11, 0.3)',
            icon: <Clock size={13} color="#F59E0B" />
        },
        PENDING: {
            label: 'Processing...',
            color: '#38BDF8',
            bg: 'rgba(56, 189, 248, 0.15)',
            border: 'rgba(56, 189, 248, 0.3)',
            icon: <Clock size={13} color="#38BDF8" className="spin" />
        },
        CANCELLED: {
            label: 'Cancelled',
            color: '#F43F5E',
            bg: 'rgba(244, 63, 94, 0.15)',
            border: 'rgba(244, 63, 94, 0.3)',
            icon: <XCircle size={13} color="#F43F5E" />
        },
        FAILED: {
            label: 'Failed',
            color: '#94A3B8',
            bg: 'rgba(148, 163, 184, 0.15)',
            border: 'rgba(148, 163, 184, 0.3)',
            icon: <AlertCircle size={13} color="#94A3B8" />
        },
        PAYMENT_FAILED: {
            label: 'Payment Failed',
            color: '#F43F5E',
            bg: 'rgba(244, 63, 94, 0.15)',
            border: 'rgba(244, 63, 94, 0.3)',
            icon: <AlertTriangle size={13} color="#F43F5E" />
        }
    };

    const current = config[s] || {
        label: s,
        color: '#94A3B8',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        icon: null
    };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: current.color,
            background: current.bg,
            border: `1px solid ${current.border}`
        }}>
            {current.icon}
            {current.label}
        </span>
    );
};

export const SeatClassBadge = ({ seatClass }) => {
    const classLabels = {
        SLEEPER: { label: 'Sleeper (SL)', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.1)' },
        AC_3_TIER: { label: 'AC 3 Tier (3A)', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.1)' },
        AC_2_TIER: { label: 'AC 2 Tier (2A)', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
        AC_FIRST_CLASS: { label: 'Executive AC (1A)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
    };

    const info = classLabels[seatClass] || { label: seatClass, color: '#CBD5E1', bg: 'rgba(255,255,255,0.05)' };

    return (
        <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.6rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: info.color,
            background: info.bg,
            border: `1px solid ${info.color}33`
        }}>
            {info.label}
        </span>
    );
};
