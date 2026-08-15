import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Train, ArrowLeft, Calendar, Users, CheckCircle2, AlertTriangle, 
    Loader2, ShieldCheck, MapPin, Clock, CreditCard, Sparkles, Navigation, Zap 
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { SeatClassBadge, TrainTypeBadge } from '../components/Badge';

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
    
    // Track interval for memory cleanup
    const pollIntervalRef = useRef(null);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

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

    // Generate 7 upcoming days for the calendar strip
    const upcomingDays = useMemo(() => {
        const days = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                dateString: d.toISOString().split('T')[0],
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: d.getDate(),
                monthName: d.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    }, []);

    // Auto-correct invalid destination if source changes
    useEffect(() => {
        if (!routeStops || routeStops.length === 0 || !sourceStationId) return;
        const srcIdx = routeStops.findIndex(s => s.stationId?.toString() === sourceStationId?.toString());
        
        // Use a functional state update to safely check the current destination without adding it to deps
        setDestinationStationId(currentDest => {
            const destIdx = routeStops.findIndex(s => s.stationId?.toString() === currentDest?.toString());
            if (destIdx <= srcIdx) {
                if (srcIdx + 1 < routeStops.length) {
                    return routeStops[srcIdx + 1].stationId.toString();
                } else {
                    return '';
                }
            }
            return currentDest; // Keep existing if valid
        });
    }, [sourceStationId, routeStops]);

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

        // Basic route direction validation
        if (routeStops && routeStops.length > 0) {
            const srcIdx = routeStops.findIndex(s => s.stationId?.toString() === sourceStationId?.toString());
            const destIdx = routeStops.findIndex(s => s.stationId?.toString() === destinationStationId?.toString());
            
            if (srcIdx !== -1 && destIdx !== -1 && srcIdx >= destIdx) {
                showToast("Invalid direction: Arrival station must be after departure station on this train's route.", "error");
                return;
            }
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
            pollIntervalRef.current = setInterval(async () => {
                attempts++;
                try {
                    const myBookingsPage = await api.get('/booking/bookings/my', { params: { page: 0, size: 10 } });
                    const list = myBookingsPage.content || [];
                    const activeBooking = list.find(b => b.id === returnedBookingId || b.bookingId === returnedBookingId);

                    if (activeBooking) {
                        if (activeBooking.status === 'PAYMENT_PENDING' || activeBooking.status === 'CONFIRMED') {
                            clearInterval(pollIntervalRef.current);
                            setBookingResult(activeBooking);
                            setBookingStage('success');
                            showToast(`Seat reserved! PNR: ${activeBooking.pnr}`, 'success');

                            // Redirect to payment after 1.5 seconds
                            setTimeout(() => {
                                navigate(`/payment/${activeBooking.pnr}`);
                            }, 1500);
                        } else if (activeBooking.status === 'FAILED') {
                            clearInterval(pollIntervalRef.current);
                            setBookingStage('failed');
                            setBookingError('Booking could not be confirmed due to seat unavailability.');
                            showToast('Seat allocation failed: Insufficient seats.', 'error');
                        }
                    }

                    if (attempts >= maxAttempts) {
                        clearInterval(pollIntervalRef.current);
                        if (bookingStage !== 'success') {
                            setBookingStage('success'); // allow viewing in dashboard
                            showToast('Booking is queued. Check your dashboard for status updates.', 'info');
                            setTimeout(() => navigate('/dashboard'), 2000);
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
                <div className="spin" style={{ fontSize: '3rem' }}>🚆</div>
                <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>Loading Express Train Parameters...</p>
            </div>
        );
    }

    if (!train) {
        return (
            <div style={styles.centerBox}>
                <Train size={54} color="#F43F5E" />
                <h2 className="font-display" style={{ color: 'var(--text-main)', marginTop: '1rem' }}>Train Not Found</h2>
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
                        <ArrowLeft size={18} />
                        <span>Return to Search</span>
                    </button>
                </div>

                <div style={styles.grid}>
                    {/* Left Column: Train Info, Stops & Classes */}
                    <div style={styles.leftCol}>
                        <div style={styles.trainHeaderCard}>
                            <div style={styles.trainMeta}>
                                <div style={styles.trainIconBox}>
                                    <Train size={34} color="#FFFFFF" />
                                </div>
                                <div>
                                    <div style={styles.badgeRow}>
                                        <span style={styles.trainCodeBadge} className="font-mono">{train.code}</span>
                                        <TrainTypeBadge type={train.trainType} />
                                    </div>
                                    <h1 className="font-display" style={styles.trainTitle}>{train.name}</h1>
                                </div>
                            </div>
                        </div>

                        {/* Station Route Pickers */}
                        <div style={styles.sectionCard}>
                            <h3 className="font-display" style={styles.cardHeading}>Select Journey Route</h3>
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
                                        <option value="" disabled>Select Departure</option>
                                        {routeStops.length > 0 ? (
                                            routeStops.map((stop, idx) => {
                                                const st = stations.find(s => s.id?.toString() === stop.stationId?.toString());
                                                if (!st || idx === routeStops.length - 1) return null; // Can't depart from final stop
                                                return (
                                                    <option key={`src-${st.id}`} value={st.id}>
                                                        {st.name} ({st.code})
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>Loading Route...</option>
                                        )}
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
                                        <option value="" disabled>Select Arrival</option>
                                        {routeStops.length > 0 ? (
                                            routeStops.map((stop, idx) => {
                                                const st = stations.find(s => s.id?.toString() === stop.stationId?.toString());
                                                if (!st) return null;

                                                const sourceIdx = routeStops.findIndex(s => s.stationId?.toString() === sourceStationId?.toString());
                                                const isInvalid = sourceIdx !== -1 && idx <= sourceIdx;

                                                return (
                                                    <option key={`dest-${st.id}`} value={st.id} disabled={isInvalid}>
                                                        {st.name} ({st.code})
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>Loading Route...</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Route Stops Timeline */}
                        {routeStops.length > 0 && (
                            <div style={styles.sectionCard}>
                                <div style={styles.stopsHeader}>
                                    <h3 className="font-display" style={styles.cardHeading}>Train Schedule & Stops</h3>
                                    <span style={styles.stopsBadge}>{routeStops.length} Halts</span>
                                </div>
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
                                                    <span style={styles.stopDistance} className="font-mono">{stop.distanceFromSource ?? stop.distanceFromSourceKm ?? 0} km</span>
                                                </div>
                                                <div style={styles.stopTiming} className="font-mono">
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
                                    <h2 className="font-display" style={styles.bookingTitle}>Configure Reservation</h2>
                                    <p style={styles.bookingSubtitle}>Lock seats with atomic consistency</p>
                                </div>
                                <ShieldCheck size={28} color="#38BDF8" />
                            </div>

                            {/* 7-Day Live Availability Calendar Strip */}
                            <div style={styles.inputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={styles.label}>
                                        <Calendar size={15} color="#F59E0B" />
                                        <span>Select Departure Date</span>
                                    </label>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next 7 Days</span>
                                </div>
                                <div style={styles.calendarStrip}>
                                    {upcomingDays.map((day) => {
                                        const isSelected = travelDate === day.dateString;
                                        return (
                                            <div 
                                                key={day.dateString}
                                                onClick={() => setTravelDate(day.dateString)}
                                                style={{
                                                    ...styles.calendarDayCard,
                                                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-bg-subtle)',
                                                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
                                                    color: isSelected ? '#fff' : 'var(--text-main)',
                                                }}
                                            >
                                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>{day.dayName}</span>
                                                <span className="font-display" style={{ fontSize: '1.25rem', margin: '0.15rem 0', fontWeight: 800 }}>{day.dayNumber}</span>
                                                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{day.monthName}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Class Selector */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select Coach Class</label>
                                <div style={styles.classSelectorGrid}>
                                    {train.seatConfigResponseList?.map((sc) => {
                                        const isSelected = seatClass === sc.seatClass;
                                        const rate = sc.fairPerKm || sc.farePerKm || 1.2;
                                        
                                        let classAvail = null;
                                        if (availability && availability.availabilityByClass) {
                                            const count = availability.availabilityByClass[sc.seatClass];
                                            if (count !== undefined && count !== null) {
                                                classAvail = count;
                                            }
                                        }

                                        return (
                                            <div
                                                key={sc.seatClass}
                                                onClick={() => setSeatClass(sc.seatClass)}
                                                style={{
                                                    ...styles.classOption,
                                                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
                                                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--glass-bg-subtle)',
                                                    boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
                                                    position: 'relative'
                                                }}
                                            >
                                                <SeatClassBadge seatClass={sc.seatClass} />
                                                <div style={styles.classFareText} className="font-mono">₹{rate}/km</div>
                                                
                                                <div style={{ marginTop: '0.2rem', textAlign: 'center' }}>
                                                    {checkingAvailability ? (
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)' }}><Loader2 size={10} className="spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}/> Checking...</span>
                                                    ) : classAvail !== null ? (
                                                        <span style={{ 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 800, 
                                                            color: classAvail >= seats ? '#10B981' : '#F43F5E' 
                                                        }}>
                                                            {classAvail > 0 ? `AVL ${classAvail}` : 'WAITLIST'}
                                                        </span>
                                                    ) : travelDate ? (
                                                        <span style={{ fontSize: '0.68rem', color: '#F43F5E', fontWeight: 600 }}>Not Available</span>
                                                    ) : (
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Select Date</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Seat Count Stepper */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Users size={15} color="#38BDF8" />
                                    <span>Number of Passengers</span>
                                </label>
                                <div style={styles.stepperWrapper}>
                                    <button 
                                        type="button" 
                                        onClick={() => setSeats(Math.max(1, seats - 1))}
                                        style={styles.stepperBtn}
                                        aria-label="Decrease passenger count"
                                    >-</button>
                                    <span style={styles.stepperValue} className="font-display">{seats}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setSeats(Math.min(6, seats + 1))}
                                        style={styles.stepperBtn}
                                        aria-label="Increase passenger count"
                                    >+</button>
                                </div>
                            </div>


                            {/* Fare Breakdown */}
                            <div style={styles.fareBreakdownBox}>
                                <div style={styles.fareRow}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Base Fare ({seats} {seats === 1 ? 'seat' : 'seats'} × {estimatedDistance} km @ ₹{farePerKm}/km)
                                    </span>
                                    <span style={{ color: 'var(--text-main)', fontWeight: 700 }} className="font-mono">₹{estimatedFare}</span>
                                </div>
                                <div style={styles.fareDivider}></div>
                                <div style={styles.totalRow}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Estimated Total</span>
                                    <motion.span 
                                        key={estimatedFare} // Forces re-animation on value change
                                        initial={{ scale: 0.8, color: '#10B981' }}
                                        animate={{ scale: 1, color: 'var(--accent-primary)' }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                        style={styles.totalAmount} 
                                        className="font-mono"
                                    >
                                        ₹{estimatedFare}
                                    </motion.span>
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
                                🔒 Protected by row-level pessimistic locking & Kafka stream idempotency.
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
                                    <h3 className="font-display" style={styles.modalTitle}>Initiating Reservation...</h3>
                                    <p style={styles.modalDesc}>Establishing secure connection with distributed reservation engine</p>
                                </div>
                            )}

                            {bookingStage === 'processing_kafka' && (
                                <div style={styles.modalStateBox}>
                                    <div style={styles.kafkaAnimation}>
                                        <Train size={36} color="#38BDF8" className="pulse-glow" />
                                    </div>
                                    <h3 className="font-display" style={styles.modalTitle}>Kafka Event Processing</h3>
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
                                    <h3 className="font-display" style={styles.modalTitle}>Seats Locked Successfully!</h3>
                                    <p style={styles.modalDesc}>
                                        PNR: <b className="font-mono">{bookingResult?.pnr}</b> • Redirecting to payment gateway...
                                    </p>
                                </div>
                            )}

                            {bookingStage === 'failed' && (
                                <div style={styles.modalStateBox}>
                                    <AlertTriangle size={48} color="#F43F5E" />
                                    <h3 className="font-display" style={{ ...styles.modalTitle, color: '#FDA4AF' }}>Reservation Failed</h3>
                                    <p style={styles.modalDesc}>{bookingError}</p>
                                    <button 
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setIsBooking(false)}
                                        style={{ marginTop: '1.25rem' }}
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
        maxWidth: '1320px',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 430px',
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
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '2.25rem',
        boxShadow: 'var(--shadow-lg)',
    },
    trainMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.35rem',
    },
    trainIconBox: {
        width: '68px',
        height: '68px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        flexShrink: 0,
    },
    trainTitle: {
        margin: 0,
        fontSize: '2.1rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        lineHeight: 1.1,
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.35rem',
    },
    trainCodeBadge: {
        padding: '0.2rem 0.6rem',
        borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)',
        fontSize: '0.82rem',
        fontWeight: 800,
        border: '1px solid rgba(56, 189, 248, 0.3)'
    },
    sectionCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)'
    },
    stopsHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem'
    },
    stopsBadge: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--accent-primary)',
        background: 'rgba(56, 189, 248, 0.1)',
        padding: '0.25rem 0.65rem',
        borderRadius: '8px',
        border: '1px solid rgba(56, 189, 248, 0.25)'
    },
    cardHeading: {
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        margin: 0
    },
    stationsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1.25rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        marginBottom: '1.25rem',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    select: {
        padding: '0.85rem 1.1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
    },
    dateInput: {
        padding: '0.85rem 1.1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
    },
    stopsTimeline: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    stopTimelineItem: {
        display: 'flex',
        gap: '1.15rem',
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
        boxShadow: '0 0 10px #38BDF8',
        zIndex: 2,
    },
    stopLine: {
        width: '2px',
        flex: 1,
        background: 'var(--glass-border)',
        margin: '4px 0',
        minHeight: '42px',
    },
    stopInfo: {
        flex: 1,
        paddingBottom: '1.35rem',
    },
    stopNameRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stopStation: {
        fontWeight: 700,
        color: 'var(--text-main)',
        fontSize: '0.95rem',
    },
    stopDistance: {
        fontSize: '0.82rem',
        color: '#10B981',
        fontWeight: 700,
    },
    stopTiming: {
        display: 'flex',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        marginTop: '0.25rem',
    },
    bookingCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '2rem',
        boxShadow: 'var(--shadow-xl), var(--glass-glow)',
    },
    bookingCardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
    },
    bookingTitle: {
        margin: 0,
        fontSize: '1.4rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    calendarStrip: {
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        marginTop: '0.5rem',
        scrollbarWidth: 'none', // Hide scrollbar Firefox
        width: '100%',
        WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
    },
    calendarDayCard: {
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.65rem 0.5rem',
        border: '1px solid',
        borderRadius: '12px',
        cursor: 'pointer',
        minWidth: '58px',
        transition: 'all 0.2s ease',
    },
    bookingSubtitle: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
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
        gap: '0.4rem',
        padding: '0.85rem 0.5rem',
        border: '1px solid',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    classFareText: {
        fontSize: '0.78rem',
        fontWeight: 800,
        color: 'var(--text-secondary)',
    },
    stepperWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '0.4rem',
    },
    stepperBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'none',
        color: 'var(--text-main)',
        fontSize: '1.35rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    },
    stepperValue: {
        fontSize: '1.3rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    availabilityCard: {
        background: 'var(--glass-bg-subtle)',
        borderRadius: '14px',
        padding: '0.9rem 1.1rem',
        border: '1px solid var(--glass-border)',
        marginBottom: '1.25rem',
    },
    availHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fareBreakdownBox: {
        background: 'rgba(56, 189, 248, 0.06)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        borderRadius: '16px',
        padding: '1.25rem',
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
        margin: '0.85rem 0',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalAmount: {
        fontSize: '1.6rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
    },
    bookSubmitBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '14px',
        fontSize: '0.98rem',
    },
    concurrencyNote: {
        textAlign: 'center',
        color: 'var(--text-dim)',
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
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
    },
    modalBox: {
        background: 'var(--bg-card-elevated, #0D1424)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '26px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 45px rgba(56, 189, 248, 0.25)',
        textAlign: 'center',
    },
    modalStateBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: '1.6rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        marginTop: '1.25rem',
        marginBottom: '0.5rem',
    },
    modalDesc: {
        color: 'var(--text-muted)',
        fontSize: '0.92rem',
        lineHeight: 1.5,
    },
    kafkaAnimation: {
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        background: 'rgba(56, 189, 248, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingBar: {
        width: '100%',
        height: '5px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '1.5rem',
    },
    loadingBarFill: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #38BDF8, #10B981)',
        animation: 'shimmerGlow 1.5s infinite',
    },
    successIconBox: {
        width: '68px',
        height: '68px',
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

