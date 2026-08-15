import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Search, Calendar, MapPin, CreditCard, XCircle, 
    AlertTriangle, Sparkles, RefreshCw, Train, ArrowRight, 
    CheckCircle2, Clock, ChevronRight, ShieldAlert, Download, Zap,
    Award, Utensils, Wifi, Coffee, Compass, TrendingUp, ShieldCheck,
    Radio, Activity, Copy, Check, QrCode, UserCheck, Flame, BarChart3,
    ArrowUpRight, Luggage, HeartHandshake, Eye
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { StatusBadge, SeatClassBadge, TrainTypeBadge } from '../components/Badge';


const STATION_RADAR_DATA = [
    { code: 'BCT', trainCode: 'VB-20608', trainName: 'Vande Bharat Exp', dest: 'Ahmedabad (ADI)', dep: '06:00 AM', platform: 'PF 1', status: 'ON TIME', statusColor: '#10B981' },
    { code: 'BCT', trainCode: 'RJ-12951', trainName: 'Mumbai Rajdhani', dest: 'New Delhi (NDLS)', dep: '16:55 PM', platform: 'PF 3', status: 'BOARDING', statusColor: '#38BDF8' },
    { code: 'NDLS', trainCode: 'SH-12002', trainName: 'Bhopal Shatabdi', dest: 'Bhopal Habibganj', dep: '06:00 AM', platform: 'PF 1', status: 'ON TIME', statusColor: '#10B981' },
    { code: 'NDLS', trainCode: 'VB-22436', trainName: 'Varanasi Vande Bharat', dest: 'Varanasi (BSB)', dep: '06:00 AM', platform: 'PF 16', status: 'ON TIME', statusColor: '#10B981' },
    { code: 'SBC', trainCode: 'VB-20607', trainName: 'Mysuru Vande Bharat', dest: 'Chennai (MAS)', dep: '05:45 AM', platform: 'PF 7', status: 'ON TIME', statusColor: '#10B981' },
    { code: 'HWH', trainCode: 'HWH-12301', trainName: 'Howrah Rajdhani', dest: 'New Delhi (NDLS)', dep: '16:50 PM', platform: 'PF 9', status: 'BOARDING', statusColor: '#38BDF8' }
];

const POPULAR_CORRIDORS = [
    { title: 'Mumbai ⇄ Ahmedabad', sub: 'High-Speed Bullet Corridor', duration: '5h 25m', type: 'Vande Bharat 2.0', fare: '₹1,420', srcId: 1, destId: 2, icon: '⚡' },
    { title: 'Delhi ⇄ Varanasi', sub: 'Kashi Cultural Express', duration: '8h 00m', type: 'Semi High Speed', fare: '₹1,750', srcId: 3, destId: 8, icon: '🛕' },
    { title: 'Bengaluru ⇄ Chennai', sub: 'Tech-Corridor HyperLink', duration: '4h 15m', type: 'Vande Bharat', fare: '₹980', srcId: 4, destId: 5, icon: '🏙️' },
    { title: 'Kolkata ⇄ Puri', sub: 'Coastal Seaside Line', duration: '6h 30m', type: 'Superfast AC', fare: '₹1,120', srcId: 7, destId: 9, icon: '🌊' }
];

const ADD_ON_SERVICES = [
    { icon: Utensils, title: 'In-Seat Gourmet Dining', desc: 'Pre-order five-star meals, diet thalis & beverages', tag: 'Chef Curated', color: '#F59E0B' },
    { icon: Wifi, title: 'Executive Lounge Access', desc: 'Complimentary high-speed WiFi, recliners & refreshments', tag: 'Complimentary for 1AC', color: '#38BDF8' },
    { icon: Luggage, title: 'Porter & Luggage Concierge', desc: 'Seamless door-to-coach baggage assistance', tag: 'Assisted Service', color: '#10B981' },
    { icon: ShieldCheck, title: 'Zero-Cancellation Shield', desc: '100% instant refund with no deduction penalty', tag: 'Assured Refund', color: '#EC4899' }
];

const Dashboard = () => {
    const [liveBookings, setLiveBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedPnr, setCopiedPnr] = useState(null);

    // Cancel modal state
    const [cancelModalPnr, setCancelModalPnr] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    // Filter tab: 'ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'
    const [filterTab, setFilterTab] = useState('ALL');

    // Radar station filter
    const [radarStation, setRadarStation] = useState('BCT');

    const { showToast, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const loadDashboardData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Replaced legacy merging with the new Enriched API built by the user!
            const bookingsRes = await api.get('/booking/bookings/my-enriched', { params: { page: 0, size: 50 } });
            setLiveBookings(bookingsRes.content || bookingsRes || []);
        } catch (err) {
            console.error("Dashboard fetch notice:", err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Format the enriched bookings for the dashboard
    const allCombinedBookings = useMemo(() => {
        return liveBookings.map(b => {
            // Fallback for duration if backend hasn't implemented it yet
            let calculatedDuration = 'TBD';
            if (b.departureTime && b.arrivalTime) {
                 calculatedDuration = 'Scheduled'; // Can add moment.js or manual diff logic here later
            }

            return {
                id: b.id || b.bookingId,
                pnr: b.pnr,
                trainId: b.trainId,
                trainName: b.trainName || `Express Train #${b.trainId || ''}`,
                trainCode: b.trainCode || 'TBS',
                trainType: b.trainType || 'SUPERFAST',
                sourceStationId: b.sourceStationId,
                sourceName: b.sourceStationName || b.sourceName || 'Origin',
                sourceCity: b.sourceCity || '',
                destStationId: b.destinationStationId,
                destName: b.destinationStationName || b.destName || 'Destination',
                destCity: b.destCity || '',
                travelDate: b.travelDate,
                departureTime: b.departureTime || 'TBD',
                arrivalTime: b.arrivalTime || 'TBD',
                platform: 'TBD', // Feature not yet in backend
                duration: calculatedDuration,
                distanceKm: b.distanceKm || 0,
                seatClass: b.seatClass,
                coachAndSeat: b.status === 'CONFIRMED' ? 'Seats Allocated' : (b.status === 'CANCELLED' ? 'Cancelled' : 'Processing'),
                seatsBooked: b.seatsBooked || b.seats || 1,
                fare: b.fare || b.totalAmount || 0,
                status: b.status,
                isUpcoming: b.isUpcoming || false
            };
        });
    }, [liveBookings]);

    // Copy PNR Helper
    const handleCopyPnr = (pnrText) => {
        if (!pnrText) return;
        navigator.clipboard.writeText(pnrText);
        setCopiedPnr(pnrText);
        showToast(`PNR ${pnrText} copied to clipboard!`, 'info');
        setTimeout(() => setCopiedPnr(null), 2000);
    };

    // Filter tickets
    const displayedBookings = useMemo(() => {
        return allCombinedBookings.filter(b => {
            if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
            if (filterTab === 'PENDING') return b.status === 'PENDING' || b.status === 'PAYMENT_PENDING';
            if (filterTab === 'COMPLETED') return b.status === 'COMPLETED';
            if (filterTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'FAILED' || b.status === 'PAYMENT_FAILED';
            return true;
        });
    }, [allCombinedBookings, filterTab]);

    // Spotlit upcoming journey (first confirmed upcoming booking)
    const nextUpcomingJourney = useMemo(() => {
        return allCombinedBookings.find(b => b.status === 'CONFIRMED') || allCombinedBookings[0];
    }, [allCombinedBookings]);

    // Counts
    const confirmedCount = allCombinedBookings.filter(b => b.status === 'CONFIRMED').length;
    const pendingCount = allCombinedBookings.filter(b => b.status === 'PAYMENT_PENDING' || b.status === 'PENDING').length;
    const completedCount = allCombinedBookings.filter(b => b.status === 'COMPLETED').length;

    // Handle Confirm Cancel
    const handleConfirmCancel = async () => {
        if (!cancelModalPnr) return;
        setCancelling(true);

        try {
            // Check if it's a live booking on server
            const isLive = liveBookings.some(b => b.pnr === cancelModalPnr);
            if (isLive) {
                const res = await api.delete(`/booking/bookings/${cancelModalPnr}`);
                showToast(res.message || 'Booking cancelled successfully. Seats restored.', 'success');
            } else {
                showToast(`Booking ${cancelModalPnr} cancelled & refund initiated.`, 'success');
            }
            setCancelModalPnr(null);
            loadDashboardData(true);
        } catch (err) {
            console.error("Cancellation notice:", err.message);
            showToast(err.message || 'Unable to cancel booking.', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const userName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || user?.username || (user?.email ? user.email.split('@')[0] : 'Passenger');

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                
                {/* 🌟 1. HERO COMMAND HUB GREETING */}
                <section style={styles.heroBanner}>
                    <div style={styles.heroLeft}>
                        <div style={styles.tierBadge}>
                            <Award size={15} color="#F59E0B" />
                            <span>Executive Platinum Traveler</span>
                            <span style={styles.tierDot}>•</span>
                            <span style={{ color: '#10B981', fontWeight: 800 }}>12,850 Express Miles</span>
                        </div>

                        <h1 className="font-display" style={styles.heroTitle}>
                            Welcome aboard, <span style={{ color: 'var(--accent-primary)' }}>{userName}</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Your high-speed reservation command center. Real-time GPS train radar, seamless boarding pass downloads, and live station telemetry.
                        </p>

                        {/* Quick Action Pills */}
                        <div style={styles.quickActionPills}>
                            <button onClick={() => navigate('/search')} style={styles.quickActionPillActive}>
                                <Search size={15} />
                                <span>Book New Express</span>
                            </button>
                            <button onClick={() => setFilterTab('CONFIRMED')} style={styles.quickActionPill}>
                                <Ticket size={15} />
                                <span>Active Passes ({confirmedCount})</span>
                            </button>
                            <button onClick={() => showToast("Live GPS tracking active. On-Time Telemetry: 99.4%", "info")} style={styles.quickActionPill}>
                                <Radio size={15} color="#10B981" className="live-pulse" />
                                <span>Live Rail Radar</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Analytics Cards */}
                    <div style={styles.kpiContainer}>
                        <div style={styles.kpiItem}>
                            <div style={styles.kpiHeaderRow}>
                                <span style={styles.kpiTitle}>Active Journeys</span>
                                <span className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                            </div>
                            <div style={styles.kpiValue} className="font-mono">{confirmedCount}</div>
                            <span style={styles.kpiFooterText}>Seats locked & verified</span>
                        </div>

                        <div style={styles.kpiItem}>
                            <div style={styles.kpiHeaderRow}>
                                <span style={styles.kpiTitle}>Track Distance</span>
                                <TrendingUp size={16} color="#38BDF8" />
                            </div>
                            <div style={styles.kpiValue} className="font-mono">4,890 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KM</span></div>
                            <span style={styles.kpiFooterText}>Lifetime rail transit</span>
                        </div>

                        <div style={styles.kpiItem}>
                            <div style={styles.kpiHeaderRow}>
                                <span style={styles.kpiTitle}>CO₂ Offset</span>
                                <Flame size={16} color="#10B981" />
                            </div>
                            <div style={{ ...styles.kpiValue, color: '#10B981' }} className="font-mono">-342 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KG</span></div>
                            <span style={styles.kpiFooterText}>Green electric travel</span>
                        </div>
                    </div>
                </section>

                {/* 🚅 2. SPOTLIGHT NEXT UPCOMING JOURNEY CARD */}
                {nextUpcomingJourney && (
                    <section style={styles.spotlightSection}>
                        <div style={styles.spotlightCard}>
                            <div style={styles.spotlightHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={styles.spotlightTrainIcon}>
                                        <Train size={24} color="#FFFFFF" />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={styles.spotlightLiveBadge}>
                                                <Radio size={12} color="#10B981" className="live-pulse" />
                                                NEXT DEPARTURE
                                            </span>
                                            <span style={styles.spotlightCode} className="font-mono">{nextUpcomingJourney.trainCode}</span>
                                        </div>
                                        <h2 className="font-display" style={styles.spotlightTrainName}>{nextUpcomingJourney.trainName}</h2>
                                    </div>
                                </div>

                                <div style={styles.pnrBox}>
                                    <span style={styles.pnrLabel}>BOOKING PNR</span>
                                    <div style={styles.pnrValueRow}>
                                        <span style={styles.pnrValue} className="font-mono">{nextUpcomingJourney.pnr}</span>
                                        <button 
                                            onClick={() => handleCopyPnr(nextUpcomingJourney.pnr)} 
                                            style={styles.pnrCopyBtn}
                                            title="Copy PNR"
                                        >
                                            {copiedPnr === nextUpcomingJourney.pnr ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.spotlightDivider}></div>

                            {/* Route Corridor Visualizer */}
                            <div style={styles.spotlightRouteGrid}>
                                <div style={styles.routeNode}>
                                    <span style={styles.routeCityLabel}>{nextUpcomingJourney.sourceCity}</span>
                                    <span style={styles.routeStationName}>{nextUpcomingJourney.sourceName}</span>
                                    <span style={styles.routeTime} className="font-mono">{nextUpcomingJourney.departureTime}</span>
                                    <span style={styles.routePlatformTag}>{nextUpcomingJourney.platform}</span>
                                </div>

                                <div style={styles.routeTrajectory}>
                                    <span style={styles.durationTag} className="font-mono">{nextUpcomingJourney.duration} • {nextUpcomingJourney.distanceKm} km</span>
                                    <div style={styles.trajectoryLine}>
                                        <div style={styles.trajectoryDotLeft}></div>
                                        <div style={styles.trajectoryDotRight}></div>
                                        <Train size={16} color="#38BDF8" style={styles.trajectoryTrainIcon} />
                                    </div>
                                    <span style={styles.speedRating}>⚡ High-Speed 160 km/h Corridor</span>
                                </div>

                                <div style={{ ...styles.routeNode, textAlign: 'right' }}>
                                    <span style={styles.routeCityLabel}>{nextUpcomingJourney.destCity}</span>
                                    <span style={styles.routeStationName}>{nextUpcomingJourney.destName}</span>
                                    <span style={styles.routeTime} className="font-mono">{nextUpcomingJourney.arrivalTime}</span>
                                    <span style={{ ...styles.routePlatformTag, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>Confirmed</span>
                                </div>
                            </div>

                            <div style={styles.spotlightDivider}></div>

                            {/* Bottom Seat & Actions Bar */}
                            <div style={styles.spotlightFooter}>
                                <div style={styles.seatMetaRow}>
                                    <SeatClassBadge seatClass={nextUpcomingJourney.seatClass} />
                                    <span style={styles.seatAllocationText} className="font-mono">{nextUpcomingJourney.coachAndSeat}</span>
                                </div>

                                <div style={styles.spotlightActionButtons}>
                                    {nextUpcomingJourney.pnr && (
                                        <button 
                                            className="btn-primary"
                                            onClick={() => navigate(`/payment/${nextUpcomingJourney.pnr}`)}
                                            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                                        >
                                            <Ticket size={16} />
                                            <span>View Electronic Boarding Pass</span>
                                        </button>
                                    )}
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => showToast("Downloading encrypted PDF e-ticket with QR security barcode...", "success")}
                                        style={{ padding: '0.65rem 1rem', fontSize: '0.88rem' }}
                                    >
                                        <Download size={16} />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 🎫 3. ALL PASSENGER RESERVATIONS & HISTORY */}
                <section style={{ marginBottom: '3.5rem' }}>
                    {/* Controls & Filter Tabs */}
                    <div style={styles.controlsBar}>
                        <div style={styles.tabsWrapper}>
                            {[
                                { id: 'ALL', label: `All Tickets (${allCombinedBookings.length})` },
                                { id: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
                                { id: 'PENDING', label: `Pending Payment (${pendingCount})` },
                                { id: 'COMPLETED', label: `Completed (${completedCount})` },
                                { id: 'CANCELLED', label: 'Cancelled' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterTab(tab.id)}
                                    style={{
                                        ...styles.tabButton,
                                        ...(filterTab === tab.id ? styles.tabButtonActive : {})
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/search')}
                                style={{ padding: '0.7rem 1.25rem', fontSize: '0.88rem' }}
                            >
                                <Search size={16} />
                                <span>Find Express Trains</span>
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => loadDashboardData(true)}
                                style={styles.refreshIconBtn}
                                title="Sync with Cloud"
                            >
                                <RefreshCw size={16} color="#38BDF8" className={refreshing ? 'spin' : ''} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Tickets Grid */}
                    {displayedBookings.length === 0 ? (
                        <div style={styles.emptyCard}>
                            <Ticket size={54} color="var(--text-dim)" />
                            <h3 className="font-display" style={{ color: 'var(--text-main)', marginTop: '1rem' }}>No Tickets Found in this Category</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0.4rem auto 1.5rem auto' }}>
                                You don't have any tickets matching the "{filterTab}" status filter. Explore express corridors to book your next journey.
                            </p>
                            <button className="btn-primary" onClick={() => navigate('/search')}>
                                <Search size={16} />
                                <span>Search Trains</span>
                            </button>
                        </div>
                    ) : (
                        <div style={styles.ticketsGrid}>
                            {displayedBookings.map((b, idx) => (
                                <motion.div
                                    key={b.pnr || b.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass-panel-interactive"
                                    style={styles.ticketCard}
                                >
                                    {/* Card Header */}
                                    <div style={styles.cardHeader}>
                                        <div>
                                            <div style={styles.cardPnrRow}>
                                                <span style={styles.pnrTag} className="font-mono">{b.pnr}</span>
                                                <button 
                                                    onClick={() => handleCopyPnr(b.pnr)} 
                                                    style={styles.copySmallBtn}
                                                    title="Copy PNR"
                                                >
                                                    {copiedPnr === b.pnr ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                            <h3 className="font-display" style={styles.trainTitleText}>{b.trainName}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
                                                <span style={styles.codeText} className="font-mono">{b.trainCode}</span>
                                                <TrainTypeBadge type={b.trainType} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
                                            <StatusBadge status={b.status} />
                                            <span style={styles.dateBadge} className="font-mono">
                                                <Calendar size={12} color="#38BDF8" />
                                                <span>{b.travelDate}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Route Corridor */}
                                    <div style={styles.cardRouteBox}>
                                        <div style={{ maxWidth: '42%' }}>
                                            <span style={styles.routeSubText}>Departure</span>
                                            <div style={styles.routeStationNameText}>{b.sourceName}</div>
                                            <span style={styles.timeTag} className="font-mono">{b.departureTime}</span>
                                        </div>

                                        <div style={styles.routeArrowBox}>
                                            <div style={styles.arrowLine}></div>
                                            <ChevronRight size={16} color="#38BDF8" />
                                        </div>

                                        <div style={{ maxWidth: '42%', textAlign: 'right' }}>
                                            <span style={styles.routeSubText}>Arrival</span>
                                            <div style={styles.routeStationNameText}>{b.destName}</div>
                                            <span style={styles.timeTag} className="font-mono">{b.arrivalTime}</span>
                                        </div>
                                    </div>

                                    {/* Coach & Fare Details */}
                                    <div style={styles.cardMetaRow}>
                                        <div>
                                            <span style={styles.metaLabel}>Coach & Berth</span>
                                            <div style={{ marginTop: '0.2rem' }}>
                                                <SeatClassBadge seatClass={b.seatClass} />
                                            </div>
                                        </div>

                                        <div>
                                            <span style={styles.metaLabel}>Passengers</span>
                                            <span style={styles.metaVal}>{b.seatsBooked} Seat{b.seatsBooked > 1 ? 's' : ''}</span>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <span style={styles.metaLabel}>Fare Total</span>
                                            <span style={styles.fareAmountText} className="font-mono">₹{b.fare}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={styles.cardFooterActions}>
                                        {b.status === 'CONFIRMED' && (
                                            <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => navigate(`/payment/${b.pnr}`)}
                                                    style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                                                >
                                                    <Ticket size={15} />
                                                    <span>View Boarding Pass</span>
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => setCancelModalPnr(b.pnr)}
                                                    style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                                                    title="Cancel Reservation & Restore Inventory"
                                                >
                                                    <XCircle size={15} />
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        )}

                                        {b.status === 'PAYMENT_PENDING' && (
                                            <button
                                                className="btn-primary"
                                                onClick={() => navigate(`/payment/${b.pnr}`)}
                                                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem' }}
                                            >
                                                <CreditCard size={16} />
                                                <span>Complete Payment (₹{b.fare})</span>
                                            </button>
                                        )}

                                        {b.status === 'COMPLETED' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>✓ Journey Completed</span>
                                                <button 
                                                    className="btn-secondary"
                                                    onClick={() => showToast("Receipt downloaded.", "success")}
                                                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                                                >
                                                    <Download size={13} />
                                                    <span>Receipt</span>
                                                </button>
                                            </div>
                                        )}

                                        {b.status === 'CANCELLED' && (
                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                Refund Processed to Source Method
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 📡 4. LIVE STATION RADAR & DEPARTURE MONITOR */}
                <section style={styles.stationRadarSection}>
                    <div style={styles.radarHeader}>
                        <div>
                            <div style={styles.radarBadge}>
                                <Radio size={14} color="#10B981" className="live-pulse" />
                                <span>LIVE TELEMETRY</span>
                            </div>
                            <h2 className="font-display" style={styles.radarTitle}>National Express Station Radar</h2>
                            <p style={styles.radarSubtitle}>Real-time live departures board across major metropolitan high-speed hubs</p>
                        </div>

                        {/* Station Filter Buttons */}
                        <div style={styles.radarStationPills}>
                            {[
                                { code: 'BCT', name: 'Mumbai Central' },
                                { code: 'NDLS', name: 'New Delhi' },
                                { code: 'SBC', name: 'Bengaluru' },
                                { code: 'HWH', name: 'Howrah Jn' }
                            ].map(st => (
                                <button
                                    key={st.code}
                                    onClick={() => setRadarStation(st.code)}
                                    style={{
                                        ...styles.radarPill,
                                        ...(radarStation === st.code ? styles.radarPillActive : {})
                                    }}
                                >
                                    {st.name} ({st.code})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.radarBoard}>
                        <div style={styles.radarTableHeader}>
                            <span>TRAIN NO. & NAME</span>
                            <span>DESTINATION</span>
                            <span>SCHEDULED DEP</span>
                            <span>PLATFORM</span>
                            <span>STATUS</span>
                        </div>

                        {STATION_RADAR_DATA.filter(r => r.code === radarStation).map((item, i) => (
                            <div key={i} style={styles.radarRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span style={styles.radarTrainCode} className="font-mono">{item.trainCode}</span>
                                    <span style={styles.radarTrainName}>{item.trainName}</span>
                                </div>
                                <span style={styles.radarDestText}>{item.dest}</span>
                                <span style={styles.radarTimeText} className="font-mono">{item.dep}</span>
                                <span style={styles.radarPfBadge} className="font-mono">{item.platform}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="live-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.statusColor }} />
                                    <span style={{ color: item.statusColor, fontWeight: 800, fontSize: '0.85rem' }}>{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🍱 5. ON-BOARD SERVICES & PASSENGER PRIVILEGES */}
                <section style={{ marginBottom: '3.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 className="font-display" style={styles.sectionHeading}>Executive On-Board Amenities</h2>
                        <p style={styles.sectionSub}>Elevate your transit experience with pre-booked executive services</p>
                    </div>

                    <div style={styles.addOnsGrid}>
                        {ADD_ON_SERVICES.map((srv, i) => {
                            const IconComp = srv.icon;
                            return (
                                <div key={i} style={styles.addOnCard} className="glass-panel-interactive">
                                    <div style={{ ...styles.addOnIconBox, background: `rgba(${srv.color === '#F59E0B' ? '245, 158, 11' : srv.color === '#38BDF8' ? '56, 189, 248' : srv.color === '#10B981' ? '16, 185, 129' : '236, 72, 153'}, 0.15)` }}>
                                        <IconComp size={22} color={srv.color} />
                                    </div>
                                    <div>
                                        <span style={{ ...styles.addOnTag, color: srv.color }}>{srv.tag}</span>
                                        <h3 className="font-display" style={styles.addOnTitle}>{srv.title}</h3>
                                        <p style={styles.addOnDesc}>{srv.desc}</p>
                                    </div>
                                    <button 
                                        onClick={() => showToast(`${srv.title} requested! Confirmation added to your reservation.`, "success")} 
                                        style={styles.addOnBtn}
                                    >
                                        <span>Add to Journey</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ⚡ 6. POPULAR HIGH-SPEED CORRIDORS */}
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 className="font-display" style={styles.sectionHeading}>Trending High-Speed Corridors</h2>
                        <p style={styles.sectionSub}>Fast-track reservations for India's most popular express transit routes</p>
                    </div>

                    <div style={styles.corridorsGrid}>
                        {POPULAR_CORRIDORS.map((c, i) => (
                            <div key={i} style={styles.corridorCard} className="glass-panel-interactive">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={styles.corridorEmoji}>{c.icon}</div>
                                    <span style={styles.corridorFare} className="font-mono">{c.fare}</span>
                                </div>
                                <h3 className="font-display" style={styles.corridorTitle}>{c.title}</h3>
                                <span style={styles.corridorSub}>{c.sub}</span>
                                
                                <div style={styles.corridorMetaRow}>
                                    <span style={styles.corridorTypeBadge}>{c.type}</span>
                                    <span style={styles.corridorDuration} className="font-mono">{c.duration}</span>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={() => navigate(`/search?sourceStationId=${c.srcId}&destinationStationId=${c.destId}`)}
                                    style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', fontSize: '0.85rem' }}
                                >
                                    <span>Book Corridor</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

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
                                <h2 className="font-display" style={styles.modalTitle}>Cancel Ticket Reservation?</h2>
                                <p style={styles.modalSubtitle}>
                                    Are you sure you want to cancel booking for PNR <b className="font-mono">{cancelModalPnr}</b>? Your seat quota will be instantly restored to the inventory pool and refund initiated.
                                </p>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setCancelModalPnr(null)}
                                    disabled={cancelling}
                                    style={{ flex: 1 }}
                                >
                                    Keep Reservation
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
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
    },
    heroBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '28px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-lg), var(--glass-glow)',
    },
    heroLeft: {
        flex: 1,
        minWidth: '320px',
    },
    tierBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.95rem',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '9999px',
        color: '#F59E0B',
        fontSize: '0.8rem',
        fontWeight: 800,
        marginBottom: '0.85rem',
    },
    tierDot: {
        color: 'rgba(245, 158, 11, 0.4)',
    },
    heroTitle: {
        margin: 0,
        fontSize: '2.35rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
    },
    heroSubtitle: {
        margin: '0.5rem 0 1.25rem 0',
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
        lineHeight: 1.5,
        maxWidth: '650px',
    },
    quickActionPills: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flexWrap: 'wrap',
    },
    quickActionPillActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.55rem 1.15rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: '0.85rem',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
    },
    quickActionPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.55rem 1.1rem',
        borderRadius: '12px',
        background: 'var(--glass-bg-subtle)',
        color: 'var(--text-main)',
        fontWeight: 700,
        fontSize: '0.85rem',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    kpiContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    kpiItem: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '1.15rem 1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        minWidth: '150px',
    },
    kpiHeaderRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    kpiTitle: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    kpiValue: {
        fontSize: '1.65rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        lineHeight: 1.1,
    },
    kpiFooterText: {
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
    },
    spotlightSection: {
        marginBottom: '3rem',
    },
    spotlightCard: {
        background: 'linear-gradient(135deg, rgba(17, 27, 49, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '28px',
        padding: '2.25rem',
        boxShadow: 'var(--shadow-xl), 0 0 35px rgba(56, 189, 248, 0.15)',
    },
    spotlightHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
    },
    spotlightTrainIcon: {
        width: '52px',
        height: '52px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
    },
    spotlightLiveBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10B981',
        fontSize: '0.72rem',
        fontWeight: 800,
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
    },
    spotlightCode: {
        fontSize: '0.8rem',
        fontWeight: 800,
        color: 'var(--accent-primary)',
    },
    spotlightTrainName: {
        margin: '0.2rem 0 0 0',
        fontSize: '1.45rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    pnrBox: {
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '0.65rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    pnrLabel: {
        fontSize: '0.68rem',
        fontWeight: 700,
        color: 'var(--text-dim)',
        letterSpacing: '0.04em',
    },
    pnrValueRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.1rem',
    },
    pnrValue: {
        fontSize: '1.15rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        letterSpacing: '0.04em',
    },
    pnrCopyBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.2rem',
        borderRadius: '4px',
    },
    spotlightDivider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.08)',
        margin: '1.5rem 0',
    },
    spotlightRouteGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr 1fr',
        alignItems: 'center',
        gap: '1.5rem',
    },
    routeNode: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    routeCityLabel: {
        fontSize: '0.8rem',
        fontWeight: 800,
        color: 'var(--accent-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    routeStationName: {
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    routeTime: {
        fontSize: '1.25rem',
        fontWeight: 900,
        color: '#F8FAFC',
        marginTop: '0.2rem',
    },
    routePlatformTag: {
        display: 'inline-block',
        width: 'fit-content',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        marginTop: '0.2rem',
    },
    routeTrajectory: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
    },
    durationTag: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
    },
    trajectoryLine: {
        width: '100%',
        height: '3px',
        background: 'linear-gradient(90deg, #38BDF8 0%, #10B981 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trajectoryDotLeft: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#38BDF8',
        position: 'absolute',
        left: 0,
    },
    trajectoryDotRight: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10B981',
        position: 'absolute',
        right: 0,
    },
    trajectoryTrainIcon: {
        background: '#0D1424',
        padding: '2px',
        borderRadius: '50%',
    },
    speedRating: {
        fontSize: '0.72rem',
        color: '#10B981',
        fontWeight: 700,
    },
    spotlightFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    seatMetaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    seatAllocationText: {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#E2E8F0',
    },
    spotlightActionButtons: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    controlsBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
    },
    tabsWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.4rem',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        flexWrap: 'wrap',
    },
    tabButton: {
        padding: '0.65rem 1.25rem',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '0.88rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabButtonActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)',
        boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)',
    },
    refreshIconBtn: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    ticketsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(390px, 1fr))',
        gap: '2rem',
    },
    ticketCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '1.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-md)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    cardPnrRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
    },
    pnrTag: {
        fontWeight: 900,
        color: 'var(--accent-primary)',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
    },
    copySmallBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.15rem',
    },
    trainTitleText: {
        margin: '0.25rem 0 0.1rem 0',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    codeText: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
    },
    dateBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        background: 'var(--glass-bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontWeight: 700,
    },
    cardRouteBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
    },
    routeSubText: {
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    routeStationNameText: {
        fontSize: '0.88rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        lineHeight: 1.25,
        marginTop: '0.1rem',
    },
    timeTag: {
        fontSize: '0.82rem',
        color: 'var(--accent-primary)',
        fontWeight: 800,
        display: 'block',
        marginTop: '0.2rem',
    },
    routeArrowBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        position: 'relative',
        margin: '0 0.5rem',
    },
    arrowLine: {
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, #38BDF8 0%, #10B981 100%)',
        opacity: 0.6,
    },
    cardMetaRow: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '0.75rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        padding: '0.9rem 1rem',
        borderRadius: '14px',
    },
    metaLabel: {
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    metaVal: {
        fontSize: '0.88rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        display: 'block',
        marginTop: '0.2rem',
    },
    fareAmountText: {
        fontSize: '1.1rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        display: 'block',
        marginTop: '0.1rem',
    },
    cardFooterActions: {
        marginTop: 'auto',
    },
    stationRadarSection: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '2.25rem',
        marginBottom: '3.5rem',
        boxShadow: 'var(--shadow-md)',
    },
    radarHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    radarBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10B981',
        fontSize: '0.75rem',
        fontWeight: 800,
        padding: '0.25rem 0.65rem',
        borderRadius: '6px',
        marginBottom: '0.5rem',
    },
    radarTitle: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    radarSubtitle: {
        margin: '0.25rem 0 0 0',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
    },
    radarStationPills: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    radarPill: {
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
    },
    radarPillActive: {
        background: 'rgba(56, 189, 248, 0.18)',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        color: 'var(--accent-primary)',
    },
    radarBoard: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '18px',
        overflow: 'hidden',
    },
    radarTableHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
        padding: '0.85rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        fontSize: '0.75rem',
        fontWeight: 800,
        color: 'var(--text-dim)',
        letterSpacing: '0.04em',
        borderBottom: '1px solid var(--glass-border)',
    },
    radarRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
        padding: '1rem 1.25rem',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'background 0.2s ease',
    },
    radarTrainCode: {
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)',
        fontSize: '0.8rem',
        fontWeight: 800,
    },
    radarTrainName: {
        fontWeight: 700,
        color: 'var(--text-main)',
        fontSize: '0.9rem',
    },
    radarDestText: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 600,
    },
    radarTimeText: {
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: 800,
    },
    radarPfBadge: {
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.06)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        fontWeight: 700,
        width: 'fit-content',
    },
    sectionHeading: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    sectionSub: {
        margin: '0.25rem 0 0 0',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
    },
    addOnsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
    },
    addOnCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '22px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        justifyContent: 'space-between',
    },
    addOnIconBox: {
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addOnTag: {
        fontSize: '0.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    addOnTitle: {
        margin: '0.25rem 0 0.2rem 0',
        fontSize: '1.15rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    addOnDesc: {
        margin: 0,
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4,
    },
    addOnBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        borderRadius: '12px',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    corridorsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
    },
    corridorCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '22px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    corridorEmoji: {
        fontSize: '1.75rem',
    },
    corridorFare: {
        fontSize: '1.25rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
    },
    corridorTitle: {
        margin: '0.5rem 0 0 0',
        fontSize: '1.2rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    corridorSub: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
    },
    corridorMetaRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    corridorTypeBadge: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#10B981',
        background: 'rgba(16, 185, 129, 0.12)',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
    },
    corridorDuration: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
    },
    emptyCard: {
        textAlign: 'center',
        padding: '5rem 2rem',
        background: 'var(--bg-card)',
        borderRadius: '26px',
        border: '1px dashed var(--glass-border)',
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
    },
    modalCard: {
        background: 'var(--bg-card-elevated, #0D1424)',
        border: '1px solid rgba(244, 63, 94, 0.35)',
        borderRadius: '26px',
        padding: '2.75rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(244, 63, 94, 0.2)',
    },
    modalHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    dangerIconBox: {
        width: '68px',
        height: '68px',
        borderRadius: '18px',
        background: 'rgba(244, 63, 94, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
        boxShadow: '0 0 25px rgba(244, 63, 94, 0.25)'
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    modalSubtitle: {
        marginTop: '0.6rem',
        color: 'var(--text-muted)',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
    }
};

export default Dashboard;