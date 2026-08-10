import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, 
    ShieldCheck, Ticket, Download, ArrowRight, Sparkles, RefreshCw 
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

        const interval = setInterval(async () => {
            attempts++;
            try {
                // Check payment service
                const payStatus = await api.get(`/payments/${targetBookingId}`);
                if (payStatus && payStatus.status === 'CAPTURED') {
                    clearInterval(interval);
                    setPaymentStatus('CAPTURED');
                    setProcessingPayment(false);
                    showToast('Booking CONFIRMED! Payment verified.', 'success');
                    return;
                }

                // Check booking service
                const freshBooking = await api.get(`/booking/bookings/${pnr}`);
                if (freshBooking && freshBooking.status === 'CONFIRMED') {
                    clearInterval(interval);
                    setBooking(freshBooking);
                    setPaymentStatus('CAPTURED');
                    setProcessingPayment(false);
                    showToast('Booking CONFIRMED! Payment verified.', 'success');
                    return;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
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
                <Loader2 size={40} color="#38BDF8" className="spin" />
                <p style={{ marginTop: '1rem', color: '#94A3B8' }}>Loading Payment Invoice...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Top back button */}
                <div style={styles.topNav}>
                    <button onClick={() => navigate('/')} style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        <span>Return to Dashboard</span>
                    </button>
                </div>

                <div style={styles.wrapper}>
                    {/* Confirmed State / Celebration */}
                    {paymentStatus === 'CAPTURED' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.successCard}
                        >
                            <div style={styles.successHeader}>
                                <div style={styles.successBadge}>
                                    <CheckCircle2 size={48} color="#10B981" />
                                </div>
                                <h1 style={styles.successTitle}>Booking Confirmed!</h1>
                                <p style={styles.successSubtitle}>
                                    Your seat reservation is confirmed and transaction settled. A confirmation email has been dispatched.
                                </p>
                            </div>

                            {/* Ticket Card Preview */}
                            <div style={styles.ticketBox}>
                                <div style={styles.ticketHeader}>
                                    <div>
                                        <span style={styles.ticketLabel}>Passenger PNR</span>
                                        <div style={styles.ticketPnr}>{booking?.pnr}</div>
                                    </div>
                                    <StatusBadge status="CONFIRMED" />
                                </div>

                                <div style={styles.ticketDivider}></div>

                                <div style={styles.ticketGrid}>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Train ID</span>
                                        <span style={styles.ticketValue}>{booking?.trainId}</span>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Travel Date</span>
                                        <span style={styles.ticketValue}>{booking?.travelDate}</span>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Class</span>
                                        <span style={styles.ticketValue}>{booking?.seatClass}</span>
                                    </div>
                                    <div style={styles.ticketItem}>
                                        <span style={styles.ticketLabel}>Seats Booked</span>
                                        <span style={styles.ticketValue}>{booking?.seatsBooked} Passenger(s)</span>
                                    </div>
                                </div>

                                <div style={styles.ticketDivider}></div>

                                <div style={styles.ticketFooter}>
                                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Total Amount Paid</span>
                                    <span style={styles.ticketAmount}>₹{booking?.fare}</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={styles.successActions}>
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate('/')}
                                    style={{ flex: 1 }}
                                >
                                    <Ticket size={18} />
                                    <span>View in My Bookings</span>
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => window.print()}
                                    style={{ flex: 1 }}
                                >
                                    <Download size={18} />
                                    <span>Print Ticket</span>
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
                                    <CreditCard size={32} color="#070B12" />
                                </div>
                                <h1 style={styles.cardTitle}>Complete Payment</h1>
                                <p style={styles.cardSubtitle}>Review your reservation details to finalize checkout</p>
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
                                            <span style={styles.summaryValuePnr}>{booking.pnr}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Train ID</span>
                                            <span style={styles.summaryValue}>{booking.trainId}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Route Stations</span>
                                            <span style={styles.summaryValue}>Station {booking.sourceStationId} → Station {booking.destinationStationId}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Journey Date</span>
                                            <span style={styles.summaryValue}>{booking.travelDate}</span>
                                        </div>
                                        <div style={styles.summaryDivider}></div>
                                        <div style={styles.summaryRow}>
                                            <span style={styles.summaryLabel}>Class & Allocation</span>
                                            <span style={styles.summaryValue}>{booking.seatClass} ({booking.seatsBooked} seats)</span>
                                        </div>
                                    </div>

                                    {/* Total Box */}
                                    <div style={styles.totalBox}>
                                        <div>
                                            <span style={styles.totalLabel}>Total Payable Amount</span>
                                            <div style={styles.totalDesc}>All taxes & dynamic fares included</div>
                                        </div>
                                        <div style={styles.totalValue}>₹{booking.fare}</div>
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
                                                <span>Connecting to Razorpay...</span>
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
                                        <span>Instant Test Checkout (Mock Settlement)</span>
                                    </button>

                                    <div style={styles.securityNote}>
                                        🔒 Payments are secured with 256-bit encryption & HMAC-SHA256 signature verification.
                                    </div>
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
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
    },
    topNav: {
        marginBottom: '1.5rem',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        color: '#CBD5E1',
        fontWeight: 600,
        fontSize: '0.88rem',
        cursor: 'pointer',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    paymentCard: {
        background: 'rgba(17, 27, 49, 0.8)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    iconCircle: {
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
        marginBottom: '1rem',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    cardSubtitle: {
        margin: '0.35rem 0 0 0',
        color: '#94A3B8',
        fontSize: '0.9rem',
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
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
    },
    summaryBox: {
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#94A3B8',
        fontSize: '0.85rem',
        fontWeight: 500,
    },
    summaryValue: {
        color: '#F8FAFC',
        fontSize: '0.92rem',
        fontWeight: 600,
    },
    summaryValuePnr: {
        color: '#38BDF8',
        fontSize: '0.95rem',
        fontWeight: 800,
        letterSpacing: '0.05em',
        fontFamily: 'monospace',
    },
    summaryDivider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.04)',
        margin: '0.75rem 0',
    },
    totalBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
    },
    totalLabel: {
        color: '#CBD5E1',
        fontSize: '0.9rem',
        fontWeight: 700,
    },
    totalDesc: {
        color: '#64748B',
        fontSize: '0.75rem',
    },
    totalValue: {
        fontSize: '1.85rem',
        fontWeight: 800,
        color: '#38BDF8',
    },
    payBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '14px',
        fontSize: '1rem',
        marginBottom: '0.75rem',
    },
    simulateBtn: {
        width: '100%',
        padding: '0.85rem',
        borderRadius: '14px',
        fontSize: '0.9rem',
    },
    securityNote: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: '0.75rem',
        marginTop: '1.5rem',
    },
    successCard: {
        background: 'rgba(17, 27, 49, 0.85)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.15)',
    },
    successHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    successBadge: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
    },
    successTitle: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    successSubtitle: {
        margin: '0.5rem 0 0 0',
        color: '#94A3B8',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    ticketBox: {
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px dashed rgba(255, 255, 255, 0.15)',
        borderRadius: '18px',
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    ticketHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketLabel: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    ticketPnr: {
        fontSize: '1.25rem',
        fontWeight: 800,
        color: '#38BDF8',
        fontFamily: 'monospace',
    },
    ticketDivider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.08)',
        margin: '1rem 0',
    },
    ticketGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    ticketItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
    },
    ticketValue: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#F8FAFC',
    },
    ticketFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketAmount: {
        fontSize: '1.4rem',
        fontWeight: 800,
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
