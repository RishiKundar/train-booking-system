import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Search, Calendar, MapPin, CreditCard, XCircle, 
    AlertTriangle, Sparkles, RefreshCw, Train, ArrowRight, 
    CheckCircle2, Clock, ChevronRight, ShieldAlert, Download 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { StatusBadge, SeatClassBadge } from '../components/Badge';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cancel modal state
    const [cancelModalPnr, setCancelModalPnr] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    // Filter tab: 'ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'
    const [filterTab, setFilterTab] = useState('ALL');

    const { showToast, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const loadDashboardData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // 1. Fetch user bookings
            const bookingsRes = await api.get('/booking/bookings/my', { params: { page: 0, size: 50 } });
            setBookings(bookingsRes.content || bookingsRes || []);

            // 2. Fetch stations
            const stationsRes = await api.get('/train/stations', { params: { page: 0, size: 100 } });
            setStations(stationsRes.content || stationsRes || []);

            // 3. Fetch trains
            const trainsRes = await api.get('/train/trains', { params: { page: 0, size: 100 } });
            setTrains(trainsRes.content || trainsRes || []);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
            showToast("Failed to load user reservations.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Station name resolver helper
    const getStationName = (id) => {
        if (!id) return 'Unknown Station';
        const st = stations.find(s => s.id === id || s.id.toString() === id.toString());
        return st ? `${st.name} (${st.code})` : `Station #${id}`;
    };

    // Train name resolver helper
    const getTrainInfo = (id) => {
        if (!id) return { name: 'Express Train', code: 'TBS' };
        const tr = trains.find(t => t.id === id || t.id.toString() === id.toString());
        return tr ? { name: tr.name, code: tr.code, type: tr.trainType } : { name: `Train #${id}`, code: `TR-${id}` };
    };

    // Cancel Booking Action
    const handleConfirmCancel = async () => {
        if (!cancelModalPnr) return;
        setCancelling(true);

        try {
            const res = await api.delete(`/booking/bookings/${cancelModalPnr}`);
            showToast(res.message || 'Booking cancelled successfully. Seats restored.', 'success');
            setCancelModalPnr(null);
            loadDashboardData(true);
        } catch (err) {
            console.error("Cancellation failed", err);
            showToast(err.message || 'Unable to cancel booking.', 'error');
        } finally {
            setCancelling(false);
        }
    };

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(b => {
        if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
        if (filterTab === 'PENDING') return b.status === 'PENDING' || b.status === 'PAYMENT_PENDING';
        if (filterTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'FAILED' || b.status === 'PAYMENT_FAILED';
        return true;
    });

    const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pendingCount = bookings.filter(b => b.status === 'PAYMENT_PENDING' || b.status === 'PENDING').length;

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Dashboard Welcome Banner */}
                <div style={styles.welcomeBanner}>
                    <div style={styles.welcomeInfo}>
                        <div style={styles.welcomeBadge}>
                            <Sparkles size={14} color="#38BDF8" />
                            <span>Passenger Hub</span>
                        </div>
                        <h1 style={styles.welcomeTitle}>Welcome back, {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || user?.username || (user?.email ? user.email.split('@')[0] : 'Passenger')}</h1>
                        <p style={styles.welcomeSubtitle}>Track your active journeys, complete pending checkouts, and manage your tickets.</p>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Active Confirmed</span>
                            <span style={styles.statValueGreen}>{confirmedCount}</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Payment Pending</span>
                            <span style={styles.statValueAmber}>{pendingCount}</span>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => loadDashboardData(true)}
                            style={styles.refreshBtn}
                            title="Refresh Bookings"
                        >
                            <RefreshCw size={18} color="#38BDF8" className={refreshing ? 'spin' : ''} />
                        </motion.button>
                    </div>
                </div>

                {/* Filter Tabs & Quick Action */}
                <div style={styles.controlsBar}>
                    <div style={styles.tabs}>
                        {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                style={{
                                    ...styles.tabBtn,
                                    ...(filterTab === tab ? styles.tabBtnActive : {})
                                }}
                            >
                                {tab === 'ALL' ? `All Tickets (${bookings.length})` : 
                                 tab === 'CONFIRMED' ? `Confirmed (${confirmedCount})` :
                                 tab === 'PENDING' ? `Pending (${pendingCount})` : 'Cancelled / Expired'}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn-primary"
                        onClick={() => navigate('/search')}
                        style={styles.findTrainsBtn}
                    >
                        <Search size={18} />
                        <span>Book New Journey</span>
                    </button>
                </div>

                {/* Bookings List / Grid */}
                {loading ? (
                    <div style={styles.loadingState}>
                        <div className="spin" style={{ fontSize: '2.5rem' }}>🚆</div>
                        <h3 style={{ marginTop: '1rem', color: '#F8FAFC' }}>Loading Your Bookings...</h3>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <Ticket size={56} color="#64748B" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ color: '#F8FAFC', fontSize: '1.4rem' }}>No Bookings Found</h3>
                        <p style={{ color: '#94A3B8', maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
                            {filterTab === 'ALL' 
                                ? "You haven't reserved any train journeys yet. Find express routes and book tickets instantly."
                                : `No tickets with status ${filterTab}.`}
                        </p>
                        <button className="btn-primary" onClick={() => navigate('/search')}>
                            <Search size={18} />
                            <span>Search & Book Trains</span>
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {filteredBookings.map((b, idx) => {
                            const trainInfo = getTrainInfo(b.trainId);
                            const srcName = getStationName(b.sourceStationId);
                            const destName = getStationName(b.destinationStationId);
                            const isPaid = b.status === 'CONFIRMED';
                            const isPendingPayment = b.status === 'PAYMENT_PENDING';
                            const isProcessing = b.status === 'PENDING';

                            return (
                                <motion.div
                                    key={b.pnr || b.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={styles.bookingCard}
                                >
                                    {/* Card Header */}
                                    <div style={styles.cardHeader}>
                                        <div>
                                            <div style={styles.pnrTag}>PNR: {b.pnr || 'GENERATING...'}</div>
                                            <h3 style={styles.trainNameText}>{trainInfo.name}</h3>
                                            <span style={styles.trainSubText}>{trainInfo.code} • {trainInfo.type || 'Express'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                            <StatusBadge status={b.status} />
                                            <span style={styles.travelDateBadge}>
                                                <Calendar size={13} color="#38BDF8" />
                                                <span>{b.travelDate}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Route Visualizer */}
                                    <div style={styles.routeBox}>
                                        <div style={styles.routePoint}>
                                            <MapPin size={16} color="#38BDF8" />
                                            <div>
                                                <div style={styles.stationLabel}>Origin</div>
                                                <div style={styles.stationValue}>{srcName}</div>
                                            </div>
                                        </div>

                                        <div style={styles.routeConnector}>
                                            <div style={styles.routeLine}></div>
                                            <ChevronRight size={16} color="#64748B" style={styles.arrowIcon} />
                                        </div>

                                        <div style={styles.routePoint}>
                                            <MapPin size={16} color="#10B981" />
                                            <div>
                                                <div style={styles.stationLabel}>Destination</div>
                                                <div style={styles.stationValue}>{destName}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Details */}
                                    <div style={styles.detailsRow}>
                                        <div style={styles.detailCol}>
                                            <span style={styles.detailLabel}>Class</span>
                                            <SeatClassBadge seatClass={b.seatClass} />
                                        </div>
                                        <div style={styles.detailCol}>
                                            <span style={styles.detailLabel}>Passengers</span>
                                            <span style={styles.detailVal}>{b.seatsBooked || b.seats || 1} Seat(s)</span>
                                        </div>
                                        <div style={styles.detailCol}>
                                            <span style={styles.detailLabel}>Total Fare</span>
                                            <span style={styles.fareVal}>₹{b.fare || b.totalAmount || '---'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={styles.cardActions}>
                                        {isPendingPayment && b.pnr && (
                                            <button
                                                className="btn-primary"
                                                onClick={() => navigate(`/payment/${b.pnr}`)}
                                                style={{ flex: 1 }}
                                            >
                                                <CreditCard size={18} />
                                                <span>Complete Payment (₹{b.fare})</span>
                                            </button>
                                        )}

                                        {isProcessing && (
                                            <div style={styles.processingBanner}>
                                                <Clock size={16} className="spin" color="#38BDF8" />
                                                <span>Kafka Async Worker Processing Reservation...</span>
                                            </div>
                                        )}

                                        {isPaid && (
                                            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => navigate(`/payment/${b.pnr}`)}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Ticket size={16} />
                                                    <span>View Ticket</span>
                                                </button>

                                                <button
                                                    className="btn-danger"
                                                    onClick={() => setCancelModalPnr(b.pnr)}
                                                    style={{ padding: '0.85rem 1.25rem' }}
                                                    title="Cancel Booking & Restore Seats"
                                                >
                                                    <XCircle size={16} />
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {cancelModalPnr && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalBackdrop}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            style={styles.modalCard}
                        >
                            <div style={styles.modalHeader}>
                                <div style={styles.dangerIconBox}>
                                    <AlertTriangle size={36} color="#F43F5E" />
                                </div>
                                <h2 style={styles.modalTitle}>Cancel Ticket Reservation?</h2>
                                <p style={styles.modalSubtitle}>
                                    Are you sure you want to cancel booking for PNR <b>{cancelModalPnr}</b>? Locked seats will be automatically restored to the inventory.
                                </p>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setCancelModalPnr(null)}
                                    disabled={cancelling}
                                    style={{ flex: 1 }}
                                >
                                    Keep Booking
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={handleConfirmCancel}
                                    disabled={cancelling}
                                    style={{ flex: 1 }}
                                >
                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Ticket'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
    },
    welcomeBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        background: 'rgba(17, 27, 49, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.25rem',
        marginBottom: '2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    },
    welcomeInfo: {
        flex: 1,
        minWidth: '280px',
    },
    welcomeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.8rem',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '9999px',
        color: '#38BDF8',
        fontSize: '0.78rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
    },
    welcomeTitle: {
        margin: 0,
        fontSize: '2.2rem',
        fontWeight: 800,
        color: '#F8FAFC',
        letterSpacing: '-0.02em',
    },
    welcomeSubtitle: {
        margin: '0.4rem 0 0 0',
        color: '#94A3B8',
        fontSize: '0.95rem',
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statBox: {
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '130px',
    },
    statLabel: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#94A3B8',
    },
    statValueGreen: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#10B981',
    },
    statValueAmber: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#F59E0B',
    },
    refreshBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    controlsBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
    },
    tabs: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.35rem',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
    tabBtn: {
        padding: '0.6rem 1.2rem',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: '#94A3B8',
        fontWeight: 600,
        fontSize: '0.88rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabBtnActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38BDF8',
    },
    findTrainsBtn: {
        padding: '0.75rem 1.4rem',
        borderRadius: '12px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '2rem',
    },
    bookingCard: {
        background: 'rgba(17, 27, 49, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '22px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    pnrTag: {
        fontFamily: 'monospace',
        fontWeight: 800,
        color: '#38BDF8',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
    },
    trainNameText: {
        margin: '0.25rem 0 0.1rem 0',
        fontSize: '1.2rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    trainSubText: {
        fontSize: '0.8rem',
        color: '#94A3B8',
        fontWeight: 500,
    },
    travelDateBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.6rem',
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: '#CBD5E1',
        fontWeight: 600,
    },
    routeBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
    },
    routePoint: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        maxWidth: '42%',
    },
    stationLabel: {
        fontSize: '0.72rem',
        color: '#64748B',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    stationValue: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#F8FAFC',
        lineHeight: 1.2,
    },
    routeConnector: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        position: 'relative',
        margin: '0 0.5rem',
    },
    routeLine: {
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, #38BDF8 0%, #10B981 100%)',
        opacity: 0.4,
    },
    arrowIcon: {
        position: 'absolute',
    },
    detailsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.75rem',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '0.85rem',
        borderRadius: '12px',
    },
    detailCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
    },
    detailLabel: {
        fontSize: '0.72rem',
        color: '#64748B',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    detailVal: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#CBD5E1',
    },
    fareVal: {
        fontSize: '1rem',
        fontWeight: 800,
        color: '#38BDF8',
    },
    cardActions: {
        marginTop: 'auto',
    },
    processingBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.85rem',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        color: '#38BDF8',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    loadingState: {
        textAlign: 'center',
        padding: '5rem 2rem',
    },
    emptyCard: {
        textAlign: 'center',
        padding: '5rem 2rem',
        background: 'rgba(17, 27, 49, 0.4)',
        borderRadius: '24px',
        border: '1px dashed rgba(255, 255, 255, 0.08)',
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
    },
    modalCard: {
        background: '#0D1424',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(244, 63, 94, 0.15)',
    },
    modalHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    dangerIconBox: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(244, 63, 94, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    modalSubtitle: {
        marginTop: '0.5rem',
        color: '#94A3B8',
        fontSize: '0.9rem',
        lineHeight: 1.5,
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
    }
};

export default Dashboard;