import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Train, Search as SearchIcon, ArrowRight, ArrowLeftRight, 
    Calendar, MapPin, Clock, Sparkles, Filter, 
    ChevronDown, ChevronUp, Navigation, AlertCircle, Compass, Zap
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { SeatClassBadge, TrainTypeBadge } from '../components/Badge';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useContext(AuthContext);

    // Station list
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);

    // URL Parameters
    const initialSource = searchParams.get('sourceStationId');
    const initialDest = searchParams.get('destinationStationId');
    const initialDate = searchParams.get('travelDate') || searchParams.get('date');

    // Form inputs
    const [sourceStationId, setSourceStationId] = useState(initialSource || '');
    const [destinationStationId, setDestinationStationId] = useState(initialDest || '');
    const [travelDate, setTravelDate] = useState(() => {
        if (initialDate) return initialDate;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    // Results state
    const [searchResults, setSearchResults] = useState([]);
    const [allTrains, setAllTrains] = useState([]);
    const [viewMode, setViewMode] = useState('search'); // 'search' or 'catalog'
    const [loadingResults, setLoadingResults] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Expanded route details for all trains catalog
    const [expandedTrainId, setExpandedTrainId] = useState(null);
    const [trainRoutes, setTrainRoutes] = useState({});

    // Filter by name/code
    const [filterQuery, setFilterQuery] = useState('');

    // Fetch stations on mount
    useEffect(() => {
        const fetchStationsAndDefaults = async () => {
            try {
                const data = await api.get('/train/stations', { params: { page: 0, size: 100 } });
                const list = data.content || data || [];
                setStations(list);

                if (list.length >= 2) {
                    if (!initialSource) setSourceStationId(list[0].id.toString());
                    if (!initialDest) setDestinationStationId(list[1].id.toString());
                }
            } catch (err) {
                console.error("Failed to load stations", err);
                showToast("Could not load stations. Using fallback catalog.", "error");
            } finally {
                setLoadingStations(false);
            }
        };

        const fetchAllTrains = async () => {
            try {
                const data = await api.get('/train/trains', { params: { page: 0, size: 100 } });
                setAllTrains(data.content || data || []);
            } catch (err) {
                console.error("Failed to load trains catalog", err);
            }
        };

        fetchStationsAndDefaults();
        fetchAllTrains();
    }, [showToast, initialSource, initialDest]);

    // Auto-execute search if navigated from Landing with parameters
    useEffect(() => {
        if (initialSource && initialDest && stations.length > 0 && !hasSearched) {
            handleSearch();
        }
    }, [initialSource, initialDest, stations.length, hasSearched]);

    // Handle station-to-station search
    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (!sourceStationId || !destinationStationId) {
            showToast("Please select both source and destination stations.", "warning");
            return;
        }

        if (sourceStationId === destinationStationId) {
            showToast("Source and destination stations cannot be the same.", "warning");
            return;
        }

        setLoadingResults(true);
        setHasSearched(true);
        setViewMode('search');

        try {
            const data = await api.get('/train/routes/search', {
                params: {
                    sourceStationId: parseInt(sourceStationId),
                    destinationStationId: parseInt(destinationStationId),
                    page: 0,
                    size: 50
                }
            });

            const results = data.content || data || [];
            setSearchResults(results);

            if (results.length === 0) {
                showToast("No direct trains found on this route. Browsing all available trains.", "info");
            }
        } catch (err) {
            console.error("Search failed", err);
            showToast(err.message || "Failed to search trains on this route.", "error");
            setSearchResults([]);
        } finally {
            setLoadingResults(false);
        }
    };

    // Swap stations
    const handleSwapStations = () => {
        setSourceStationId(destinationStationId);
        setDestinationStationId(sourceStationId);
    };

    // Quick Date Picker helpers
    const setQuickDate = (daysAhead) => {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        setTravelDate(d.toISOString().split('T')[0]);
    };

    // Toggle train route stop details
    const toggleTrainRoute = async (trainId) => {
        if (expandedTrainId === trainId) {
            setExpandedTrainId(null);
            return;
        }

        setExpandedTrainId(trainId);
        if (!trainRoutes[trainId]) {
            try {
                const data = await api.get(`/train/routes/train-route/${trainId}`, { params: { page: 0, size: 50 } });
                setTrainRoutes(prev => ({ ...prev, [trainId]: data.content || data || [] }));
            } catch (err) {
                console.error("Failed to load stops for train", trainId, err);
            }
        }
    };

    // Navigate to booking
    const handleSelectTrain = (trainId, srcId = sourceStationId, destId = destinationStationId) => {
        const query = new URLSearchParams({
            sourceStationId: srcId || '',
            destinationStationId: destId || '',
            travelDate: travelDate || ''
        }).toString();
        navigate(`/booking/${trainId}?${query}`);
    };

    const sourceStationObj = stations.find(s => s.id.toString() === sourceStationId);
    const destStationObj = stations.find(s => s.id.toString() === destinationStationId);

    // Filtered catalog
    const filteredCatalog = allTrains.filter(t => 
        t.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.code?.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Hero Search Section */}
                <div style={styles.heroSection}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={styles.heroHeader}
                    >
                        <div style={styles.badge}>
                            <Sparkles size={14} color="#38BDF8" />
                            <span>Real-Time Seat Inventory & Distributed Reservation</span>
                        </div>
                        <h1 className="font-display" style={styles.heroTitle}>Book Express Train Tickets</h1>
                        <p style={styles.heroSubtitle}>Search high-speed direct routes, inspect live seat availability, and lock bookings instantly.</p>
                    </motion.div>

                    {/* Search Form Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={styles.searchCard}
                    >
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            {/* Source Station */}
                            <div style={styles.formCol}>
                                <label style={styles.label}>
                                    <MapPin size={15} color="#38BDF8" />
                                    <span>Origin Station</span>
                                </label>
                                <select 
                                    value={sourceStationId}
                                    onChange={(e) => setSourceStationId(e.target.value)}
                                    style={styles.select}
                                    disabled={loadingStations}
                                >
                                    <option value="" disabled>Select Origin</option>
                                    {stations.map(st => (
                                        <option key={`src-${st.id}`} value={st.id}>
                                            {st.name} ({st.code}) — {st.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Swap Button */}
                            <motion.button 
                                type="button"
                                whileHover={{ rotate: 180, scale: 1.12 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSwapStations}
                                style={styles.swapBtn}
                                title="Swap Origin and Destination"
                                aria-label="Swap Stations"
                            >
                                <ArrowLeftRight size={18} color="#38BDF8" />
                            </motion.button>

                            {/* Destination Station */}
                            <div style={styles.formCol}>
                                <label style={styles.label}>
                                    <MapPin size={15} color="#10B981" />
                                    <span>Destination Station</span>
                                </label>
                                <select 
                                    value={destinationStationId}
                                    onChange={(e) => setDestinationStationId(e.target.value)}
                                    style={styles.select}
                                    disabled={loadingStations}
                                >
                                    <option value="" disabled>Select Destination</option>
                                    {stations.map(st => (
                                        <option key={`dest-${st.id}`} value={st.id}>
                                            {st.name} ({st.code}) — {st.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Travel Date */}
                            <div style={styles.formColDate}>
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

                            {/* Submit */}
                            <button 
                                type="submit" 
                                className="btn-primary"
                                style={styles.searchSubmitBtn}
                                disabled={loadingResults}
                            >
                                {loadingResults ? (
                                    <>
                                        <span className="spin">⚡</span>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <SearchIcon size={18} />
                                        <span>Find Trains</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Quick Date Shortcuts */}
                        <div style={styles.quickDatesRow}>
                            <span style={styles.quickDatesLabel}>Quick Departure:</span>
                            <button type="button" onClick={() => setQuickDate(0)} style={styles.quickDateChip}>Today</button>
                            <button type="button" onClick={() => setQuickDate(1)} style={styles.quickDateChip}>Tomorrow</button>
                            <button type="button" onClick={() => setQuickDate(2)} style={styles.quickDateChip}>In 2 Days</button>
                            <button type="button" onClick={() => setQuickDate(7)} style={styles.quickDateChip}>Next Week</button>
                        </div>
                    </motion.div>
                </div>

                {/* Mode Selector / Tabs */}
                <div style={styles.tabsContainer}>
                    <div style={styles.tabs}>
                        <button
                            type="button"
                            onClick={() => setViewMode('search')}
                            style={{
                                ...styles.tabBtn,
                                ...(viewMode === 'search' ? styles.tabBtnActive : {})
                            }}
                        >
                            <Compass size={16} />
                            <span>Route Search {hasSearched ? `(${searchResults.length})` : ''}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('catalog')}
                            style={{
                                ...styles.tabBtn,
                                ...(viewMode === 'catalog' ? styles.tabBtnActive : {})
                            }}
                        >
                            <Train size={16} />
                            <span>All Express Trains ({allTrains.length})</span>
                        </button>
                    </div>

                    {viewMode === 'catalog' && (
                        <div style={styles.filterBox}>
                            <SearchIcon size={16} color="var(--text-dim)" />
                            <input 
                                type="text"
                                placeholder="Filter by train name or code..."
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                style={styles.filterInput}
                            />
                        </div>
                    )}
                </div>

                {/* Search Results View */}
                {viewMode === 'search' && (
                    <div style={styles.resultsWrapper}>
                        {loadingResults ? (
                            <div style={styles.loadingBox}>
                                <div className="spin" style={{ fontSize: '3rem' }}>🚆</div>
                                <h3 className="font-display" style={{ marginTop: '1.25rem', color: 'var(--text-main)' }}>Scanning Live Schedules & Seat Matrices...</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Querying inter-station distance matrices across direct corridors</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div style={styles.resultsGrid}>
                                {searchResults.map((train, idx) => (
                                    <motion.div
                                        key={`search-res-${train.trainId || idx}`}
                                        initial={{ opacity: 0, y: 25 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                                        style={styles.trainCard}
                                    >
                                        {/* Card Header */}
                                        <div style={styles.trainCardHeader}>
                                            <div style={styles.trainIdentity}>
                                                <div style={styles.trainIconBox}>
                                                    <Train size={24} color="#38BDF8" />
                                                </div>
                                                <div>
                                                    <h3 style={styles.trainName}>{train.trainName}</h3>
                                                    <div style={styles.badgeRow}>
                                                        <span style={styles.trainCode} className="font-mono">{train.trainCode}</span>
                                                        <TrainTypeBadge type={train.trainType} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={styles.distanceBadge}>
                                                <Navigation size={13} color="#10B981" />
                                                <span className="font-mono">{train.distanceKm || 0} km</span>
                                            </div>
                                        </div>

                                        {/* Route Visualizer Timeline */}
                                        <div style={styles.timelineBox}>
                                            <div style={styles.timelineStop}>
                                                <div style={styles.timeText} className="font-mono">
                                                    {train.sourceDepartureTime ? train.sourceDepartureTime.substring(0, 5) : '08:00'}
                                                </div>
                                                <div style={styles.stationName}>{train.sourceStationName || sourceStationObj?.name}</div>
                                            </div>

                                            <div style={styles.timelineBar}>
                                                <div style={styles.timelineLine}></div>
                                                <div style={styles.timelineDotStart}></div>
                                                <div style={styles.timelineTrainIcon}>
                                                    <Zap size={11} color="#38BDF8" />
                                                </div>
                                                <div style={styles.timelineDotEnd}></div>
                                            </div>

                                            <div style={styles.timelineStopEnd}>
                                                <div style={styles.timeText} className="font-mono">
                                                    {train.destinationArrivalTime ? train.destinationArrivalTime.substring(0, 5) : '18:30'}
                                                </div>
                                                <div style={styles.stationName}>{train.destinationStationName || destStationObj?.name}</div>
                                            </div>
                                        </div>

                                        {/* Seat Classes Breakdown */}
                                        <div style={styles.classesSection}>
                                            <span style={styles.sectionLabel}>Configured Travel Coaches</span>
                                            <div style={styles.classesGrid}>
                                                {train.seatClasses?.map((sc, i) => (
                                                    <div key={i} style={styles.classCard}>
                                                        <SeatClassBadge seatClass={sc.seatClass} />
                                                        <span style={styles.classFare} className="font-mono">₹{sc.fairPerKm || sc.farePerKm}/km</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => handleSelectTrain(train.trainId)}
                                            style={styles.bookBtn}
                                        >
                                            <span>Check Live Availability & Reserve</span>
                                            <ArrowRight size={17} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : hasSearched ? (
                            <div style={styles.emptyCard}>
                                <AlertCircle size={48} color="#F59E0B" style={{ opacity: 0.85, marginBottom: '1rem' }} />
                                <h3 className="font-display" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>No Direct Trains on This Route</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0.65rem auto 1.5rem auto', lineHeight: 1.5 }}>
                                    We couldn't find a direct corridor between <b>{sourceStationObj?.name}</b> and <b>{destStationObj?.name}</b>. You can explore all available express routes below.
                                </p>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setViewMode('catalog')}
                                >
                                    Browse Complete Network Catalog ({allTrains.length})
                                </button>
                            </div>
                        ) : (
                            <div style={styles.promptCard}>
                                <Train size={54} color="#38BDF8" style={{ opacity: 0.65, marginBottom: '1rem' }} />
                                <h3 className="font-display" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Select Corridor & Search</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0.5rem auto' }}>
                                    Choose your origin and destination station above to check live seat inventory and reserve express journeys.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Catalog View */}
                {viewMode === 'catalog' && (
                    <div style={styles.catalogGrid}>
                        {filteredCatalog.map((train, idx) => (
                            <motion.div
                                key={`catalog-${train.id}`}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.4 }}
                                style={styles.trainCard}
                            >
                                <div style={styles.trainCardHeader}>
                                    <div style={styles.trainIdentity}>
                                        <div style={styles.trainIconBox}>
                                            <Train size={24} color="#38BDF8" />
                                        </div>
                                        <div>
                                            <h3 style={styles.trainName}>{train.name}</h3>
                                            <div style={styles.badgeRow}>
                                                <span style={styles.trainCode} className="font-mono">{train.code}</span>
                                                <TrainTypeBadge type={train.trainType} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.classesSection}>
                                    <span style={styles.sectionLabel}>Available Classes</span>
                                    <div style={styles.classesGrid}>
                                        {train.seatConfigResponseList?.map((sc, i) => (
                                            <div key={i} style={styles.classCard}>
                                                <SeatClassBadge seatClass={sc.seatClass} />
                                                <span style={styles.classFare} className="font-mono">₹{sc.fairPerKm || sc.farePerKm}/km</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expand Stops Button */}
                                <button
                                    type="button"
                                    onClick={() => toggleTrainRoute(train.id)}
                                    style={styles.expandStopsBtn}
                                >
                                    <span>Route Halts & Schedule</span>
                                    {expandedTrainId === train.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {/* Expanded Stops List */}
                                <AnimatePresence>
                                    {expandedTrainId === train.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={styles.stopsDropdown}
                                        >
                                            {trainRoutes[train.id] ? (
                                                trainRoutes[train.id].length > 0 ? (
                                                    <div style={styles.stopsTimeline}>
                                                        {trainRoutes[train.id].map((stop, sIdx) => (
                                                            <div key={sIdx} style={styles.stopRow}>
                                                                <div style={styles.stopOrder} className="font-mono">#{stop.stopOrder || sIdx + 1}</div>
                                                                <div style={styles.stopDetails}>
                                                                    <div style={styles.stopStationName}>
                                                                        {(() => {
                                                                            const st = stations.find(s => s.id === stop.stationId || s.id?.toString() === stop.stationId?.toString());
                                                                            return st ? `${st.name} (${st.code})` : `Station #${stop.stationId}`;
                                                                        })()}
                                                                    </div>
                                                                    <div style={styles.stopTimes} className="font-mono">
                                                                        Arr: {stop.arrivalTime ? stop.arrivalTime.substring(0, 5) : '--:--'} | Dep: {stop.departureTime ? stop.departureTime.substring(0, 5) : '--:--'}
                                                                    </div>
                                                                </div>
                                                                <div style={styles.stopDistance} className="font-mono">{stop.distanceFromSourceKm || 0} km</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
                                                        No route stops configured for this train yet.
                                                    </p>
                                                )
                                            ) : (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
                                                    Loading route stops...
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => handleSelectTrain(train.id)}
                                    style={styles.bookBtn}
                                >
                                    <span>Select Train & Configure</span>
                                    <ArrowRight size={17} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
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
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
    },
    heroSection: {
        marginBottom: '2.75rem',
    },
    heroHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 1rem',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        borderRadius: '9999px',
        color: 'var(--accent-primary)',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '1rem',
        letterSpacing: '0.02em'
    },
    heroTitle: {
        fontSize: '2.6rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.025em',
        margin: '0 0 0.5rem 0',
        lineHeight: 1.15
    },
    heroSubtitle: {
        color: 'var(--text-muted)',
        fontSize: '1.05rem',
        maxWidth: '660px',
        margin: '0 auto',
        lineHeight: 1.5
    },
    searchCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '1.85rem',
        boxShadow: 'var(--shadow-xl), var(--glass-glow)',
    },
    searchForm: {
        display: 'grid',
        gridTemplateColumns: '1.2fr auto 1.2fr 1fr auto',
        alignItems: 'flex-end',
        gap: '1rem',
    },
    formCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    formColDate: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
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
    swapBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        marginBottom: '2px',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)'
    },
    searchSubmitBtn: {
        padding: '0.85rem 1.85rem',
        height: '50px',
        alignSelf: 'flex-end',
        borderRadius: '14px',
    },
    quickDatesRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--glass-border)',
        flexWrap: 'wrap'
    },
    quickDatesLabel: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    quickDateChip: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        padding: '0.35rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    tabsContainer: {
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
        gap: '0.4rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.35rem',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
    },
    tabBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.35rem',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabBtnActive: {
        background: 'rgba(56, 189, 248, 0.18)',
        color: 'var(--accent-primary)',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
        border: '1px solid rgba(56, 189, 248, 0.35)'
    },
    filterBox: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '0.45rem 1.15rem',
        minWidth: '290px',
    },
    filterInput: {
        background: 'transparent',
        border: 'none',
        padding: '0.4rem 0',
        fontSize: '0.9rem',
        boxShadow: 'none',
        color: 'var(--text-main)'
    },
    resultsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
        gap: '1.75rem',
    },
    catalogGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
        gap: '1.75rem',
    },
    trainCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '1.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.35rem',
        transition: 'all 0.25s ease',
        boxShadow: 'var(--shadow-md)',
    },
    trainCardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
    },
    trainIdentity: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.95rem',
    },
    trainIconBox: {
        width: '50px',
        height: '50px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(2, 132, 199, 0.18) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
    },
    trainName: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        lineHeight: 1.2,
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        marginTop: '0.35rem'
    },
    trainCode: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
    },
    distanceBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '10px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10B981',
        fontSize: '0.78rem',
        fontWeight: 700,
    },
    timelineBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.1rem 1.35rem',
        background: 'var(--glass-bg-subtle)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
    },
    timelineStop: {
        display: 'flex',
        flexDirection: 'column',
    },
    timelineStopEnd: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: '1.15rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    stationName: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        maxWidth: '130px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    timelineBar: {
        flex: 1,
        position: 'relative',
        height: '2px',
        background: 'var(--glass-border)',
        margin: '0 1.25rem',
    },
    timelineLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #38BDF8 0%, #10B981 100%)',
    },
    timelineDotStart: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#38BDF8',
        boxShadow: '0 0 8px #38BDF8',
    },
    timelineTrainIcon: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: 'var(--bg-primary)',
        border: '1px solid #38BDF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineDotEnd: {
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10B981',
        boxShadow: '0 0 8px #10B981',
    },
    classesSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    sectionLabel: {
        fontSize: '0.75rem',
        fontWeight: 800,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    classesGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.55rem',
    },
    classCard: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.35rem 0.75rem',
        borderRadius: '10px',
        border: '1px solid var(--glass-border)',
    },
    classFare: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
    },
    bookBtn: {
        width: '100%',
        padding: '0.9rem',
        borderRadius: '14px',
        marginTop: 'auto',
    },
    expandStopsBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 0.95rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
    },
    stopsDropdown: {
        overflow: 'hidden',
        background: 'var(--glass-bg-subtle)',
        borderRadius: '14px',
        padding: '0.85rem',
        border: '1px solid var(--glass-border)',
    },
    stopsTimeline: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    stopRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        padding: '0.4rem 0',
        borderBottom: '1px solid var(--glass-border)',
    },
    stopOrder: {
        color: 'var(--accent-primary)',
        fontWeight: 800,
        width: '32px',
    },
    stopDetails: {
        flex: 1,
    },
    stopStationName: {
        color: 'var(--text-main)',
        fontWeight: 700,
    },
    stopTimes: {
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
    },
    stopDistance: {
        color: 'var(--text-muted)',
        fontWeight: 700,
    },
    loadingBox: {
        textAlign: 'center',
        padding: '5rem 2rem',
    },
    emptyCard: {
        textAlign: 'center',
        padding: '4.5rem 2rem',
        background: 'var(--bg-card)',
        borderRadius: '26px',
        border: '1px dashed var(--glass-border)',
    },
    promptCard: {
        textAlign: 'center',
        padding: '4.5rem 2rem',
        background: 'var(--bg-card)',
        borderRadius: '26px',
        border: '1px dashed var(--glass-border)',
    }
};

export default Search;
