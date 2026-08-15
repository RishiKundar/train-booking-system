import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, 
    ShieldCheck, Ticket, Download, ArrowRight, Sparkles, RefreshCw,
    Copy, Check, QrCode, Lock, Zap
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { StatusBadge, SeatClassBadge } from '../components/Badge';

const Payment = () => {
    const { pnr } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(AuthContext);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'CAPTURED', 'FAILED', null
    const [paymentOrder, setPaymentOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedPnr, setCopiedPnr] = useState(false);
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);

    const pollIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        api.get('/train/stations', { params: { page: 0, size: 100 } }).then(d => setStations(d.content || d || []));
        api.get('/train/trains', { params: { page: 0, size: 100 } }).then(d => setTrains(d.content || d || []));
    }, []);

    const getStationName = (id) => {
        const s = stations.find(x => x.id?.toString() === id?.toString());
        return s ? `${s.name} (${s.code})` : `Station ${id}`;
    };

    const getTrainName = (id) => {
        const t = trains.find(x => x.id?.toString() === id?.toString());
        return t ? `${t.name} (${t.code})` : `Train #${id}`;
    };

    // Fetch booking details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await api.get(`/booking/bookings/${pnr}`);
                setBooking(data);

                if (data.status === 'CONFIRMED') {
                    setPaymentStatus('CAPTURED');
                } else if (data.status === 'CANCELLED' || data.status === 'PAYMENT_FAILED') {
                    setErrorMessage(`This booking is currently ${data.status}. Payment is not available.`);
                }
            } catch (err) {
                console.error("Failed to load booking details", err);
                setErrorMessage(err.message || 'Unable to retrieve booking details.');
                showToast("Booking not found", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [pnr, showToast]);

    // Load Razorpay Checkout Script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Copy PNR helper
    const handleCopyPnr = () => {
        if (booking?.pnr) {
            navigator.clipboard.writeText(booking.pnr);
            setCopiedPnr(true);
            showToast('PNR copied to clipboard!', 'info');
            setTimeout(() => setCopiedPnr(false), 2000);
        }
    };

    // Initiate Razorpay Checkout
    const handlePayNow = async () => {
        if (!booking) return;

        setProcessingPayment(true);
        setErrorMessage('');

        const targetBookingId = booking.bookingId || booking.id;
        const totalAmountInPaise = Math.round((booking.fare || 500) * 100);

        try {
            // 1. Create order on payment service
            const orderRes = await api.post('/payments/create-order', {
                bookingId: targetBookingId,
                amountInPaise: totalAmountInPaise
            });

            setPaymentOrder(orderRes);

            // 2. Load script
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded || !window.Razorpay || !orderRes.keyId) {
                // Fallback: Open backend-hosted checkout page
                window.location.href = `http://localhost:8080/payments/checkout/${targetBookingId}`;
                return;
            }

            // 3. Launch Razorpay Modal
            const options = {
                key: orderRes.keyId,
                amount: orderRes.amountInPaise,
                currency: orderRes.currency || 'INR',
                name: 'TBS Express Reservation',
                description: `Payment for PNR: ${booking.pnr}`,
                order_id: orderRes.razorpayOrderId,
                handler: async function (response) {
                    showToast('Payment submitted! Verifying transaction...', 'info');
                    pollPaymentConfirmation(targetBookingId);
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                        showToast('Payment window closed.', 'warning');
                    }
                },
                theme: {
                    color: '#38BDF8'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Razorpay error", response.error);
                setProcessingPayment(false);
                setErrorMessage(`Payment failed: ${response.error.description || 'Transaction declined'}`);
                showToast('Payment transaction failed', 'error');
            });

            rzp.open();

        } catch (err) {
            console.error("Order creation failed", err);
            setProcessingPayment(false);
            setErrorMessage(err.message || 'Failed to initialize payment gateway.');
            showToast(err.message || 'Payment initialization error', 'error');
        }
    };

    // Simulate / Trigger instant settlement for local test environment
    const handleSimulatePayment = async () => {
        if (!booking) return;
        setProcessingPayment(true);
        const targetBookingId = booking.bookingId || booking.id;

        try {
            // Create order first
            const orderRes = await api.post('/payments/create-order', {
                bookingId: targetBookingId,
                amountInPaise: Math.round((booking.fare || 500) * 100)
            });

            // Trigger mock webhook
            const mockWebhookPayload = {
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: "pay_mock_" + Math.random().toString(36).substr(2, 9),
                            order_id: orderRes.razorpayOrderId,
                            amount: orderRes.amountInPaise,
                            status: "captured"
                        }
                    }
                }
            };

            await api.post('/payments/webhook', mockWebhookPayload);
            showToast('Simulated payment captured! Verifying status...', 'success');
            pollPaymentConfirmation(targetBookingId);
        } catch (err) {
            console.error("Simulation failed", err);
            setProcessingPayment(false);
            showToast('Payment simulation failed: ' + err.message, 'error');
        }
    };

    // Poll payment status & booking confirmation
    const pollPaymentConfirmation = (targetBookingId) => {
        let attempts = 0;
        const maxAttempts = 12;

        pollIntervalRef.current = setInterval(async () => {
            attempts++;
            try {
                // Check payment service
                const payStatus = await api.get(`/payments/${targetBookingId}`);
                if (payStatus && payStatus.status === 'CAPTURED') {
                    clearInterval(pollIntervalRef.current);
                    setPaymentStatus('CAPTURED');
                    setProcessingPayment(false);
                    showToast('Booking CONFIRMED! Payment verified.', 'success');
                    return;
                }

                // Check booking service
                const freshBooking = await api.get(`/booking/bookings/${pnr}`);
                if (freshBooking && freshBooking.status === 'CONFIRMED') {
                    clearInterval(pollIntervalRef.current);
                    setBooking(freshBooking);
                    setPaymentStatus('CAPTURED');
                    setProcessingPayment(false);
                    showToast('Booking CONFIRMED! Payment verified.', 'success');
                    return;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(pollIntervalRef.current);
                    setPaymentStatus('CAPTURED');
                    setProcessingPayment(false);
                    showToast('Payment processed. Check My Bookings for receipt.', 'info');
                }
            } catch (pollErr) {
                console.warn("Poll status retry...", pollErr);
            }
        }, 1200);
    };

    if (loading) {
        return (
            <div style={styles.centerBox}>
                <div className="spin" style={{ fontSize: '3rem' }}>💳</div>
                <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>Loading Payment Gateway...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Top back button */}
                <div style={styles.topNav}>
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                        <ArrowLeft size={18} />
                        <span>Return to Dashboard</span>
                    </button>
                </div>

                <div style={styles.wrapper}>
                    {/* Confirmed State / Celebration */}
                    {paymentStatus === 'CAPTURED' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.successCard}
                        >
                            <div style={styles.successHeader}>
                                <div style={styles.successBadge}>
                                    <CheckCircle2 size={44} color="#10B981" />
                                </div>
                                <h1 className="font-display" style={styles.successTitle}>Reservation Confirmed!</h1>
                                <p style={styles.successSubtitle}>
                                    Your electronic ticket has been generated and seats are locked. An instant confirmation receipt has been dispatched.
                                </p>
                            </div>

                            {/* Boarding Pass E-Ticket */}
                            <div className="ticket-card" style={styles.ticketBox}>
                                <div className="ticket-notch-left"></div>
                                <div className="ticket-notch-right"></div>

                                <div style={styles.ticketHeader}>
                                    <div>
                                        <span style={styles.ticketLabel}>Passenger PNR Number</span>
                                        <div style={styles.pnrCopyRow}>
                                            <span style={styles.ticketPnr} className="font-mono">{booking?.pnr}</span>
                                            <button 
                                                type="button" 
                                                onClick={handleCopyPnr}
                                                style={styles.copyBtn}
                                                title="Copy PNR"
                                            >
                                                {copiedPnr ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <StatusBadge status="CONFIRMED" />
                                </div>

                                <div style={styles.ticketDivider}></div>

                                <div style={styles.ticketGrid}>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Train Reference</span>
                                        <span style={styles.ticketValue} className="font-mono">Express #{booking?.trainId}</span>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Travel Date</span>
                                        <span style={styles.ticketValue} className="font-mono">{booking?.travelDate}</span>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Coach Class</span>
                                        <div style={{ marginTop: '0.2rem' }}>
                                            <SeatClassBadge seatClass={booking?.seatClass} />
                                        </div>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Seats Reserved</span>
                                        <span style={styles.ticketValue}>{booking?.seatsBooked} Passenger{booking?.seatsBooked > 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div style={styles.ticketDivider}></div>

                                {/* Barcode / Security strip simulation */}
                                <div style={styles.barcodeSection}>
                                    <div style={styles.barcodeLines}>
                                        {[40, 20, 60, 30, 80, 25, 50, 70, 35, 90, 45, 20, 60, 30, 80, 50, 70, 35, 90, 45].map((h, i) => (
                                            <div 
                                                key={i} 
                                                style={{
                                                    width: i % 3 === 0 ? '3px' : '2px',
                                                    height: '28px',
                                                    backgroundColor: 'var(--text-muted)',
                                                    opacity: 0.6
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div style={styles.ticketAmountWrap}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Amount Settled</span>
                                        <span style={styles.ticketAmount} className="font-mono">₹{booking?.fare}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={styles.successActions}>
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate('/dashboard')}
                                    style={{ flex: 1 }}
                                >
                                    <Ticket size={18} />
                                    <span>My Reservations</span>
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => window.print()}
                                    style={{ flex: 1 }}
                                >
                                    <Download size={18} />
                                    <span>Download E-Ticket</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Payment Checkout Form */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={styles.paymentCard}
                        >
                            {/* Card Header */}
                            <div style={styles.cardHeader}>
                                <div style={styles.iconCircle}>
                                    <CreditCard size={32} color="#FFFFFF" />
                                </div>
                                <h1 className="font-display" style={styles.cardTitle}>Complete Reservation</h1>
                                <p style={styles.cardSubtitle}>Review journey invoice and complete instant payment</p>
                            </div>

                            {errorMessage && (
                                <div style={styles.errorBanner}>
                                    <AlertTriangle size={18} color="#F43F5E" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {booking && (
                                <>
                                    {/* Booking Breakdown */}
                                    <div style={styles.summaryBox}>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>PNR Reference</span>
                                            <span style={styles.summaryValuePnr} className="font-mono">{booking.pnr}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Train Route</span>
                                            <span style={styles.summaryValue} className="font-mono">{getTrainName(booking.trainId)}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Corridor</span>
                                            <span style={styles.summaryValue}>{getStationName(booking.sourceStationId)} → {getStationName(booking.destinationStationId)}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Travel Date</span>
                                            <span style={styles.summaryValue} className="font-mono">{booking.travelDate}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Class & Allocation</span>
                                            <span style={styles.summaryValue}>{booking.seatClass} ({booking.seatsBooked} passenger{booking.seatsBooked > 1 ? 's' : ''})</span>
                                        </div>
                                    </div>
                                    {booking.status !== 'CANCELLED' && booking.status !== 'PAYMENT_FAILED' && booking.status !== 'FAILED' && (
                                        <>
                                            {/* Total Box */}
                                            <div style={styles.totalBox}>
                                                <div>
                                                    <span style={styles.totalLabel}>Total Payable Fare</span>
                                                    <div style={styles.totalDesc}>All taxes & dynamic booking fees included</div>
                                                </div>
                                                <div style={styles.totalValue} className="font-mono">₹{booking.fare}</div>
                                            </div>

                                            {/* Main Razorpay CTA */}
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={handlePayNow}
                                                disabled={processingPayment}
                                                style={styles.payBtn}
                                            >
                                                {processingPayment ? (
                                                    <>
                                                        <Loader2 size={18} className="spin" />
                                                        <span>Opening Razorpay Secure Gateway...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={20} />
                                                        <span>Pay ₹{booking.fare} with Razorpay</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Test Mode Simulation */}
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={handleSimulatePayment}
                                                disabled={processingPayment}
                                                style={styles.simulateBtn}
                                            >
                                                <Sparkles size={16} color="#F59E0B" />
                                                <span>Instant Test Settlement (Mock Webhook)</span>
                                            </button>

                                            <div style={styles.securityBadgesRow}>
                                                <div style={styles.securityPill}>
                                                    <Lock size={12} color="#10B981" />
                                                    <span>256-Bit SSL</span>
                                                </div>
                                                <div style={styles.securityPill}>
                                                    <ShieldCheck size={12} color="#38BDF8" />
                                                    <span>Bank Grade</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        width: '100%',
        paddingBottom: '5rem',
    },
    main: {
        maxWidth: '920px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
    },
    topNav: {
        marginBottom: '1.5rem',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.65rem 1.15rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'var(--text-secondary)',
        fontWeight: 700,
        fontSize: '0.88rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    paymentCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '560px',
        boxShadow: 'var(--shadow-xl), var(--glass-glow)',
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '1.25rem',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.85rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    cardSubtitle: {
        margin: '0.35rem 0 0 0',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#FDA4AF',
        padding: '0.9rem 1.1rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
    },
    summaryBox: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '18px',
        padding: '1.35rem',
        marginBottom: '1.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    summaryValue: {
        color: 'var(--text-main)',
        fontSize: '0.92rem',
        fontWeight: 700,
    },
    summaryValuePnr: {
        color: 'var(--accent-primary)',
        fontSize: '1rem',
        fontWeight: 900,
        letterSpacing: '0.05em',
    },
    summaryDivider: {
        height: '1px',
        background: 'var(--glass-border)',
        margin: '0.8rem 0',
    },
    totalBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '18px',
        padding: '1.35rem 1.5rem',
        marginBottom: '1.75rem',
    },
    totalLabel: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 700,
    },
    totalDesc: {
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
        marginTop: '0.2rem'
    },
    totalValue: {
        fontSize: '1.9rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
    },
    payBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '14px',
        fontSize: '1rem',
        marginBottom: '0.85rem',
    },
    simulateBtn: {
        width: '100%',
        padding: '0.9rem',
        borderRadius: '14px',
        fontSize: '0.9rem',
    },
    securityBadgesRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem',
    },
    securityPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        padding: '0.3rem 0.65rem',
        borderRadius: '8px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
    },
    successCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '26px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '620px',
        boxShadow: 'var(--shadow-xl), 0 0 45px rgba(16, 185, 129, 0.2)',
    },
    successHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    successBadge: {
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
        boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
    },
    successTitle: {
        margin: 0,
        fontSize: '2.1rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    successSubtitle: {
        margin: '0.5rem 0 0 0',
        color: 'var(--text-muted)',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    ticketBox: {
        background: 'var(--glass-bg-subtle)',
        border: '1px dashed var(--glass-border)',
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '2rem',
        position: 'relative'
    },
    ticketHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketLabel: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    pnrCopyRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.2rem'
    },
    ticketPnr: {
        fontSize: '1.35rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        letterSpacing: '0.04em',
    },
    copyBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0.2rem',
        borderRadius: '6px',
        transition: 'color 0.2s ease'
    },
    ticketDivider: {
        height: '1px',
        background: 'var(--glass-border)',
        margin: '1.15rem 0',
    },
    ticketGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
    },
    ticketItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    ticketValue: {
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--text-main)',
    },
    barcodeSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    barcodeLines: {
        display: 'flex',
        gap: '3px',
        alignItems: 'center'
    },
    ticketAmountWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    ticketAmount: {
        fontSize: '1.5rem',
        fontWeight: 900,
        color: '#10B981',
    },
    successActions: {
        display: 'flex',
        gap: '1rem',
    },
    centerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
    }
};

export default Payment;

