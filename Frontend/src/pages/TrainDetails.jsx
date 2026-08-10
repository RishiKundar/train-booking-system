import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Train, ArrowLeft, Calendar, Users, CheckCircle2, AlertTriangle, 
    Loader2, ShieldCheck, MapPin, Clock, CreditCard, Sparkles, Navigation 
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { SeatClassBadge } from '../components/Badge';

const TrainDetails = () => {
    const { trainId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useContext(AuthContext);

    // Train & Stations data
    const [train, setTrain] = useState(null);
    const [routeStops, setRouteStops] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Booking configuration state from search params or defaults
    const [travelDate, setTravelDate] = useState(() => {
        return searchParams.get('travelDate') || (() => {
            const tmrw = new Date();
            tmrw.setDate(tmrw.getDate() + 1);
            return tmrw.toISOString().split('T')[0];
        })();
    });

    const [sourceStationId, setSourceStationId] = useState(() => searchParams.get('sourceStationId') || '');
    const [destinationStationId, setDestinationStationId] = useState(() => searchParams.get('destinationStationId') || '');
    const [seatClass, setSeatClass] = useState('');
    const [seats, setSeats] = useState(1);

    // Availability state
    const [availability, setAvailability] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Processing & Polling State
    const [isBooking, setIsBooking] = useState(false);
    const [bookingStage, setBookingStage] = useState(''); // 'initiating', 'processing_kafka', 'success', 'failed'
    const [bookingId, setBookingId] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);
    const [bookingError, setBookingError] = useState('');

    // Fetch initial train and stations metadata
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // 1. Fetch train info
                const trainsData = await api.get('/train/trains', { params: { page: 0, size: 100 } });
                const trainList = trainsData.content || trainsData || [];
                const found = trainList.find(t => t.id.toString() === trainId);
                
                if (found) {
                    setTrain(found);
                    if (found.seatConfigResponseList?.length > 0) {
                        setSeatClass(found.seatConfigResponseList[0].seatClass);
                    }
                }

                // 2. Fetch stations
                const stationsData = await api.get('/train/stations', { params: { page: 0, size: 100 } });
                const stationList = stationsData.content || stationsData || [];
                setStations(stationList);

                // 3. Fetch stops for this train
                const stopsData = await api.get(`/train/routes/train-route/${trainId}`, { params: { page: 0, size: 50 } });
                const stopsList = stopsData.content || stopsData || [];
                setRouteStops(stopsList);

                // Auto-populate source & destination if not in URL
                if (!sourceStationId && stopsList.length >= 2) {
                    setSourceStationId(stopsList[0].stationId.toString());
                    setDestinationStationId(stopsList[stopsList.length - 1].stationId.toString());
                } else if (!sourceStationId && stationList.length >= 2) {
                    setSourceStationId(stationList[0].id.toString());
                    setDestinationStationId(stationList[1].id.toString());
                }
            } catch (err) {
                console.error("Failed to load train details", err);
                showToast("Could not load train details", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [trainId, showToast]);

    // Check live seat availability
    const fetchAvailability = async () => {
        if (!travelDate || !trainId) return;
        setCheckingAvailability(true);
        try {
            const data = await api.get('/booking/availability', {
                params: {
                    trainId: parseInt(trainId),
                    date: travelDate
                }
            });
            setAvailability(data);
        } catch (err) {
            console.error("Availability lookup failed", err);
        } finally {
            setCheckingAvailability(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [travelDate, trainId]);

    // Station name helper
    const getStationName = (id) => {
        if (!id) return '';
        const st = stations.find(s => s.id?.toString() === id?.toString());
        return st ? `${st.name} (${st.code})` : `Station #${id}`;
    };

    // Calculate dynamic distance & estimated fare
    const selectedClassConfig = train?.seatConfigResponseList?.find(c => c.seatClass === seatClass);
    const farePerKm = selectedClassConfig ? (Number(selectedClassConfig.fairPerKm || selectedClassConfig.farePerKm) || 1.2) : 1.2;

    const estimatedDistance = useMemo(() => {
        if (routeStops && routeStops.length >= 2 && sourceStationId && destinationStationId) {
            const srcStop = routeStops.find(s => s.stationId?.toString() === sourceStationId?.toString());
            const destStop = routeStops.find(s => s.stationId?.toString() === destinationStationId?.toString());
            if (srcStop && destStop) {
                const srcDist = Number(srcStop.distanceFromSource ?? srcStop.distanceFromSourceKm ?? 0);
                const destDist = Number(destStop.distanceFromSource ?? destStop.distanceFromSourceKm ?? 0);
                const calculated = Math.abs(destDist - srcDist);
                if (calculated > 0) return calculated;
            }
        }
        return 493; // Fallback default distance
    }, [routeStops, sourceStationId, destinationStationId]);

    const estimatedFare = useMemo(() => {
        return Math.round(farePerKm * estimatedDistance * Number(seats || 1));
    }, [farePerKm, estimatedDistance, seats]);

    // Selected class available seats count
    let availableCount = null;
    if (availability && availability.seatAvailabilities) {
        const match = availability.seatAvailabilities.find(a => a.seatClass === seatClass);
        if (match) {
            availableCount = match.availableSeats;
        }
    }

    // High-Concurrency Asynchronous Booking Action
    const handleInitiateBooking = async () => {
        if (!travelDate || !seatClass || seats < 1) return;
        if (!sourceStationId || !destinationStationId) {
            showToast("Please select source and destination stations.", "warning");
            return;
        }

        setIsBooking(true);
        setBookingStage('initiating');
        setBookingError('');

        try {
            // 1. Generate client-side UUID idempotency key to prevent double bookings
            const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : 'idemp-' + Math.random().toString(36).substr(2, 9);

            const payload = {
                idempotencyKey,
                trainId: parseInt(trainId),
                sourceStationId: parseInt(sourceStationId),
                destinationStationId: parseInt(destinationStationId),
                travelDate,
                seatClass,
                seats: parseInt(seats)
            };

            // 2. Submit async request to Booking Service (202 Accepted)
            const res = await api.post('/booking/bookings', payload);
            const returnedBookingId = res.bookingId;
            setBookingId(returnedBookingId);
            setBookingStage('processing_kafka');

            // 3. Poll for Kafka event processing & PNR generation
            let attempts = 0;
            const maxAttempts = 15;
            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const myBookingsPage = await api.get('/booking/bookings/my', { params: { page: 0, size: 10 } });
                    const list = myBookingsPage.content || [];
                    const activeBooking = list.find(b => b.id === returnedBookingId || b.bookingId === returnedBookingId);

                    if (activeBooking) {
                        if (activeBooking.status === 'PAYMENT_PENDING' || activeBooking.status === 'CONFIRMED') {
                            clearInterval(pollInterval);
                            setBookingResult(activeBooking);
                            setBookingStage('success');
                            showToast(`Seat reserved! PNR: ${activeBooking.pnr}`, 'success');

                            // Redirect to payment after 1.5 seconds
                            setTimeout(() => {
                                navigate(`/payment/${activeBooking.pnr}`);
                            }, 1500);
                        } else if (activeBooking.status === 'FAILED') {
                            clearInterval(pollInterval);
                            setBookingStage('failed');
                            setBookingError('Booking could not be confirmed due to seat unavailability.');
                            showToast('Seat allocation failed: Insufficient seats.', 'error');
                        }
                    }

                    if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        if (bookingStage !== 'success') {
                            setBookingStage('success'); // allow viewing in dashboard
                            showToast('Booking is queued. Check your dashboard for status updates.', 'info');
                            setTimeout(() => navigate('/'), 2000);
                        }
                    }
                } catch (pollErr) {
                    console.warn("Polling retry...", pollErr);
                }
            }, 1000);

        } catch (err) {
            console.error("Booking failed", err);
            setBookingStage('failed');
            setBookingError(err.message || 'Failed to submit reservation.');
            showToast(err.message || 'Booking submission failed', 'error');
        }
    };

    if (loading) {
        return (
            <div style={styles.centerBox}>
                <Loader2 size={40} color="#38BDF8" className="spin" />
                <p style={{ marginTop: '1rem', color: '#94A3B8' }}>Loading Train Configuration...</p>
            </div>
        );
    }

    if (!train) {
        return (
            <div style={styles.centerBox}>
                <Train size={48} color="#F43F5E" />
                <h2 style={{ color: '#F8FAFC', marginTop: '1rem' }}>Train Not Found</h2>
                <button onClick={() => navigate('/search')} className="btn-secondary" style={{ marginTop: '1rem' }}>
                    Return to Search
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Back Button */}
                <div style={styles.topNav}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        <span>Back to Search</span>
                    </button>
                </div>

                <div style={styles.grid}>
                    {/* Left Column: Train Info, Stops & Classes */}
                    <div style={styles.leftCol}>
                        <div style={styles.trainHeaderCard}>
                            <div style={styles.trainMeta}>
                                <div style={styles.trainIconBox}>
                                    <Train size={32} color="#070B12" />
                                </div>
                                <div>
                                    <h1 style={styles.trainTitle}>{train.name}</h1>
                                    <div style={styles.trainSubRow}>
                                        <span style={styles.trainCodeBadge}>{train.code}</span>
                                        <span style={styles.typeBadge}>{train.trainType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Station Route Pickers */}
                        <div style={styles.sectionCard}>
                            <h3 style={styles.cardHeading}>Select Journey Route</h3>
                            <div style={styles.stationsRow}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        <MapPin size={15} color="#38BDF8" />
                                        <span>Departure Station</span>
                                    </label>
                                    <select 
                                        value={sourceStationId} 
                                        onChange={(e) => setSourceStationId(e.target.value)}
                                        style={styles.select}
                                    >
                                        {stations.map(st => (
                                            <option key={`src-${st.id}`} value={st.id}>
                                                {st.name} ({st.code}) - {st.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        <MapPin size={15} color="#10B981" />
                                        <span>Arrival Station</span>
                                    </label>
                                    <select 
                                        value={destinationStationId} 
                                        onChange={(e) => setDestinationStationId(e.target.value)}
                                        style={styles.select}
                                    >
                                        {stations.map(st => (
                                            <option key={`dest-${st.id}`} value={st.id}>
                                                {st.name} ({st.code}) - {st.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Route Stops Timeline */}
                        {routeStops.length > 0 && (
                            <div style={styles.sectionCard}>
                                <h3 style={styles.cardHeading}>Train Schedule & Stops</h3>
                                <div style={styles.stopsTimeline}>
                                    {routeStops.map((stop, idx) => (
                                        <div key={idx} style={styles.stopTimelineItem}>
                                            <div style={styles.stopMarker}>
                                                <div style={styles.stopDot}></div>
                                                {idx < routeStops.length - 1 && <div style={styles.stopLine}></div>}
                                            </div>
                                            <div style={styles.stopInfo}>
                                                <div style={styles.stopNameRow}>
                                                    <span style={styles.stopStation}>
                                                        {getStationName(stop.stationId) || `Station #${stop.stationId}`}
                                                    </span>
                                                    <span style={styles.stopDistance}>{stop.distanceFromSource ?? stop.distanceFromSourceKm ?? 0} km</span>
                                                </div>
                                                <div style={styles.stopTiming}>
                                                    <span>Arr: {stop.arrivalTime ? stop.arrivalTime.substring(0, 5) : '--:--'}</span>
                                                    <span>•</span>
                                                    <span>Dep: {stop.departureTime ? stop.departureTime.substring(0, 5) : '--:--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Interactive Booking Panel */}
                    <div style={styles.rightCol}>
                        <div style={styles.bookingCard}>
                            <div style={styles.bookingCardHeader}>
                                <div>
                                    <h2 style={styles.bookingTitle}>Configure Reservation</h2>
                                    <p style={styles.bookingSubtitle}>Lock seats with atomic consistency</p>
                                </div>
                                <ShieldCheck size={28} color="#38BDF8" />
                            </div>

                            {/* Date Picker */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Calendar size={15} color="#F59E0B" />
                                    <span>Travel Date</span>
                                </label>
                                <input 
                                    type="date"
                                    value={travelDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    style={styles.dateInput}
                                    required
                                />
                            </div>

                            {/* Class Selector */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select Class</label>
                                <div style={styles.classSelectorGrid}>
                                    {train.seatConfigResponseList?.map((sc) => {
                                        const isSelected = seatClass === sc.seatClass;
                                        const rate = sc.fairPerKm || sc.farePerKm || 1.2;
                                        return (
                                            <div
                                                key={sc.seatClass}
                                                onClick={() => setSeatClass(sc.seatClass)}
                                                style={{
                                                    ...styles.classOption,
                                                    borderColor: isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.08)',
                                                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                                    boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none'
                                                }}
                                            >
                                                <SeatClassBadge seatClass={sc.seatClass} />
                                                <div style={styles.classFareText}>₹{rate}/km</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Seat Count Stepper */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Users size={15} color="#38BDF8" />
                                    <span>Number of Passengers / Seats</span>
                                </label>
                                <div style={styles.stepperWrapper}>
                                    <button 
                                        type="button" 
                                        onClick={() => setSeats(Math.max(1, seats - 1))}
                                        style={styles.stepperBtn}
                                    >-</button>
                                    <span style={styles.stepperValue}>{seats}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setSeats(Math.min(6, seats + 1))}
                                        style={styles.stepperBtn}
                                    >+</button>
                                </div>
                            </div>

                            {/* Availability Box */}
                            <div style={styles.availabilityCard}>
                                <div style={styles.availHeader}>
                                    <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Seat Inventory Status:</span>
                                    {checkingAvailability ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#38BDF8', fontSize: '0.8rem' }}>
                                            <Loader2 size={13} className="spin" /> Checking...
                                        </span>
                                    ) : availableCount !== null ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: availableCount >= seats ? '#10B981' : '#F43F5E',
                                            fontWeight: 700,
                                            fontSize: '0.88rem'
                                        }}>
                                            {availableCount >= seats ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                            <span>{availableCount} Available</span>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#64748B', fontSize: '0.8rem' }}>Select date to check</span>
                                    )}
                                </div>
                            </div>

                            {/* Fare Breakdown */}
                            <div style={styles.fareBreakdownBox}>
                                <div style={styles.fareRow}>
                                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                                        Base Fare ({seats} {seats === 1 ? 'seat' : 'seats'} × {estimatedDistance} km @ ₹{farePerKm}/km)
                                    </span>
                                    <span style={{ color: '#F8FAFC', fontWeight: 600 }}>₹{estimatedFare}</span>
                                </div>
                                <div style={styles.fareDivider}></div>
                                <div style={styles.totalRow}>
                                    <span style={{ color: '#CBD5E1', fontWeight: 700 }}>Estimated Total</span>
                                    <span style={styles.totalAmount}>₹{estimatedFare}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleInitiateBooking}
                                disabled={isBooking || (availableCount !== null && availableCount < seats)}
                                style={styles.bookSubmitBtn}
                            >
                                <CreditCard size={18} />
                                <span>Proceed to Reserve & Pay (₹{estimatedFare})</span>
                            </button>

                            <p style={styles.concurrencyNote}>
                                🔒 Protected by row-level pessimistic locking & idempotency keys.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Asynchronous Processing Modal Overlay */}
            <AnimatePresence>
                {isBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalBackdrop}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={styles.modalBox}
                        >
                            {bookingStage === 'initiating' && (
                                <div style={styles.modalStateBox}>
                                    <Loader2 size={48} color="#38BDF8" className="spin" />
                                    <h3 style={styles.modalTitle}>Sending Reservation Request...</h3>
                                    <p style={styles.modalDesc}>Establishing secure connection to API Gateway</p>
                                </div>
                            )}

                            {bookingStage === 'processing_kafka' && (
                                <div style={styles.modalStateBox}>
                                    <div style={styles.kafkaAnimation}>
                                        <Train size={36} color="#38BDF8" className="pulse-glow" />
                                    </div>
                                    <h3 style={styles.modalTitle}>Kafka Event Processing</h3>
                                    <p style={styles.modalDesc}>
                                        Acquiring row lock on Seat Inventory table and computing fare matrix...
                                    </p>
                                    <div style={styles.loadingBar}>
                                        <div style={styles.loadingBarFill}></div>
                                    </div>
                                </div>
                            )}

                            {bookingStage === 'success' && (
                                <div style={styles.modalStateBox}>
                                    <div style={styles.successIconBox}>
                                        <CheckCircle2 size={44} color="#10B981" />
                                    </div>
                                    <h3 style={styles.modalTitle}>Seats Locked Successfully!</h3>
                                    <p style={styles.modalDesc}>
                                        PNR: <b>{bookingResult?.pnr}</b> • Redirecting to payment gateway...
                                    </p>
                                </div>
                            )}

                            {bookingStage === 'failed' && (
                                <div style={styles.modalStateBox}>
                                    <AlertTriangle size={48} color="#F43F5E" />
                                    <h3 style={{ ...styles.modalTitle, color: '#FDA4AF' }}>Reservation Failed</h3>
                                    <p style={styles.modalDesc}>{bookingError}</p>
                                    <button 
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setIsBooking(false)}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        Close & Try Again
                                    </button>
                                </div>
                            )}
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
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: '2rem',
        alignItems: 'flex-start',
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
    },
    rightCol: {
        position: 'sticky',
        top: '6rem',
    },
    trainHeaderCard: {
        background: 'rgba(17, 27, 49, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    },
    trainMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
    },
    trainIconBox: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
        flexShrink: 0,
    },
    trainTitle: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 800,
        color: '#F8FAFC',
        lineHeight: 1.1,
    },
    trainSubRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginTop: '0.5rem',
    },
    trainCodeBadge: {
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38BDF8',
        fontSize: '0.85rem',
        fontWeight: 700,
    },
    typeBadge: {
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.06)',
        color: '#94A3B8',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    sectionCard: {
        background: 'rgba(17, 27, 49, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
    },
    cardHeading: {
        fontSize: '1.2rem',
        fontWeight: 800,
        color: '#F8FAFC',
        marginBottom: '1.25rem',
    },
    stationsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        marginBottom: '1.25rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#CBD5E1',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    select: {
        padding: '0.85rem 1rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#F8FAFC',
        fontSize: '0.95rem',
    },
    dateInput: {
        padding: '0.85rem 1rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#F8FAFC',
        fontSize: '0.95rem',
    },
    stopsTimeline: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    stopTimelineItem: {
        display: 'flex',
        gap: '1rem',
        position: 'relative',
    },
    stopMarker: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '20px',
    },
    stopDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#38BDF8',
        boxShadow: '0 0 8px #38BDF8',
        zIndex: 2,
    },
    stopLine: {
        width: '2px',
        flex: 1,
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '4px 0',
        minHeight: '40px',
    },
    stopInfo: {
        flex: 1,
        paddingBottom: '1.25rem',
    },
    stopNameRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stopStation: {
        fontWeight: 700,
        color: '#F8FAFC',
        fontSize: '0.95rem',
    },
    stopDistance: {
        fontSize: '0.82rem',
        color: '#10B981',
        fontWeight: 600,
    },
    stopTiming: {
        display: 'flex',
        gap: '0.5rem',
        color: '#94A3B8',
        fontSize: '0.82rem',
        marginTop: '0.2rem',
    },
    bookingCard: {
        background: 'rgba(17, 27, 49, 0.85)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
    },
    bookingCardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
    },
    bookingTitle: {
        margin: 0,
        fontSize: '1.35rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    bookingSubtitle: {
        margin: '0.2rem 0 0 0',
        fontSize: '0.82rem',
        color: '#94A3B8',
    },
    classSelectorGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.65rem',
    },
    classOption: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.85rem 0.5rem',
        border: '1px solid',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    classFareText: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#CBD5E1',
    },
    stepperWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.35rem',
    },
    stepperBtn: {
        width: '38px',
        height: '38px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'none',
        color: '#F8FAFC',
        fontSize: '1.25rem',
        fontWeight: 700,
        cursor: 'pointer',
    },
    stepperValue: {
        fontSize: '1.2rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    availabilityCard: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '1.25rem',
    },
    availHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fareBreakdownBox: {
        background: 'rgba(56, 189, 248, 0.06)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '14px',
        padding: '1.15rem',
        marginBottom: '1.5rem',
    },
    fareRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareDivider: {
        height: '1px',
        background: 'rgba(56, 189, 248, 0.15)',
        margin: '0.75rem 0',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalAmount: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#38BDF8',
    },
    bookSubmitBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        fontSize: '1rem',
    },
    concurrencyNote: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: '0.75rem',
        marginTop: '1rem',
        marginBottom: 0,
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
    modalBox: {
        background: '#0D1424',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.2)',
        textAlign: 'center',
    },
    modalStateBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#F8FAFC',
        marginTop: '1.25rem',
        marginBottom: '0.5rem',
    },
    modalDesc: {
        color: '#94A3B8',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    kafkaAnimation: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(56, 189, 248, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingBar: {
        width: '100%',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '1.5rem',
    },
    loadingBarFill: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #38BDF8, #10B981)',
        animation: 'shimmer 1.5s infinite',
    },
    successIconBox: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
    }
};

export default TrainDetails;
