import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Train, Search as SearchIcon, ArrowRight, ArrowLeftRight, 
    Calendar, MapPin, Clock, ArrowRightLeft, Sparkles, Filter, 
    ChevronDown, ChevronUp, Navigation, AlertCircle 
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { SeatClassBadge } from '../components/Badge';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useContext(AuthContext);

    // Station list
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);

    // Form inputs
    const [sourceStationId, setSourceStationId] = useState('');
    const [destinationStationId, setDestinationStationId] = useState('');
    const [travelDate, setTravelDate] = useState(() => {
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
                    setSourceStationId(list[0].id.toString());
                    setDestinationStationId(list[1].id.toString());
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
    }, [showToast]);

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
                        style={styles.heroHeader}
                    >
                        <div style={styles.badge}>
                            <Sparkles size={14} color="#38BDF8" />
                            <span>Real-Time Seat Inventory & Fare Engine</span>
                        </div>
                        <h1 style={styles.heroTitle}>Book Express Train Tickets</h1>
                        <p style={styles.heroSubtitle}>Search direct routes, inspect live seat availability, and reserve with zero race-conditions.</p>
                    </motion.div>

                    {/* Search Form Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.searchCard}
                    >
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            {/* Source Station */}
                            <div style={styles.formCol}>
                                <label style={styles.label}>
                                    <MapPin size={15} color="#38BDF8" />
                                    <span>From Station</span>
                                </label>
                                <select 
                                    value={sourceStationId}
                                    onChange={(e) => setSourceStationId(e.target.value)}
                                    style={styles.select}
                                    disabled={loadingStations}
                                >
                                    <option value="" disabled>Select Source</option>
                                    {stations.map(st => (
                                        <option key={`src-${st.id}`} value={st.id}>
                                            {st.name} ({st.code}) - {st.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Swap Button */}
                            <motion.button 
                                type="button"
                                whileHover={{ rotate: 180, scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSwapStations}
                                style={styles.swapBtn}
                                title="Swap Stations"
                            >
                                <ArrowLeftRight size={18} color="#38BDF8" />
                            </motion.button>

                            {/* Destination Station */}
                            <div style={styles.formCol}>
                                <label style={styles.label}>
                                    <MapPin size={15} color="#10B981" />
                                    <span>To Station</span>
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
                                            {st.name} ({st.code}) - {st.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Travel Date */}
                            <div style={styles.formColDate}>
                                <label style={styles.label}>
                                    <Calendar size={15} color="#F59E0B" />
                                    <span>Journey Date</span>
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
                            <span>Route Results {hasSearched ? `(${searchResults.length})` : ''}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('catalog')}
                            style={{
                                ...styles.tabBtn,
                                ...(viewMode === 'catalog' ? styles.tabBtnActive : {})
                            }}
                        >
                            <span>Browse All Trains ({allTrains.length})</span>
                        </button>
                    </div>

                    {viewMode === 'catalog' && (
                        <div style={styles.filterBox}>
                            <SearchIcon size={16} color="#64748B" />
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
                                <div className="spin" style={{ fontSize: '2.5rem' }}>🚆</div>
                                <h3 style={{ marginTop: '1rem', color: '#F8FAFC' }}>Scanning Routes & Schedules...</h3>
                                <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Querying inter-station distance matrices</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div style={styles.resultsGrid}>
                                {searchResults.map((train, idx) => (
                                    <motion.div
                                        key={`search-res-${train.trainId || idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={styles.trainCard}
                                    >
                                        <div style={styles.trainCardHeader}>
                                            <div style={styles.trainIdentity}>
                                                <div style={styles.trainIconBox}>
                                                    <Train size={24} color="#38BDF8" />
                                                </div>
                                                <div>
                                                    <h3 style={styles.trainName}>{train.trainName}</h3>
                                                    <span style={styles.trainCode}>{train.trainCode} • {train.trainType}</span>
                                                </div>
                                            </div>
                                            <div style={styles.distanceBadge}>
                                                <Navigation size={13} color="#10B981" />
                                                <span>{train.distanceKm || 0} km</span>
                                            </div>
                                        </div>

                                        {/* Route Timeline */}
                                        <div style={styles.timelineBox}>
                                            <div style={styles.timelineStop}>
                                                <div style={styles.timeText}>{train.sourceDepartureTime ? train.sourceDepartureTime.substring(0, 5) : '08:00'}</div>
                                                <div style={styles.stationName}>{train.sourceStationName || sourceStationObj?.name}</div>
                                            </div>

                                            <div style={styles.timelineBar}>
                                                <div style={styles.timelineLine}></div>
                                                <div style={styles.timelineDotStart}></div>
                                                <div style={styles.timelineDotEnd}></div>
                                            </div>

                                            <div style={styles.timelineStopEnd}>
                                                <div style={styles.timeText}>{train.destinationArrivalTime ? train.destinationArrivalTime.substring(0, 5) : '18:30'}</div>
                                                <div style={styles.stationName}>{train.destinationStationName || destStationObj?.name}</div>
                                            </div>
                                        </div>

                                        {/* Seat Classes Breakdown */}
                                        <div style={styles.classesSection}>
                                            <span style={styles.sectionLabel}>Available Travel Classes</span>
                                            <div style={styles.classesGrid}>
                                                {train.seatClasses?.map((sc, i) => (
                                                    <div key={i} style={styles.classCard}>
                                                        <SeatClassBadge seatClass={sc.seatClass} />
                                                        <span style={styles.classFare}>₹{sc.fairPerKm}/km</span>
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
                                            <span>Check Availability & Book</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : hasSearched ? (
                            <div style={styles.emptyCard}>
                                <AlertCircle size={48} color="#F59E0B" style={{ opacity: 0.8, marginBottom: '1rem' }} />
                                <h3>No Direct Trains on This Route</h3>
                                <p style={{ color: '#94A3B8', maxWidth: '450px', margin: '0.5rem auto 1.5rem auto' }}>
                                    We couldn't find a direct route between <b>{sourceStationObj?.name}</b> and <b>{destStationObj?.name}</b>. You can browse all active trains below.
                                </p>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setViewMode('catalog')}
                                >
                                    Browse All Trains ({allTrains.length})
                                </button>
                            </div>
                        ) : (
                            <div style={styles.promptCard}>
                                <Train size={48} color="#38BDF8" style={{ opacity: 0.6, marginBottom: '1rem' }} />
                                <h3>Select Stations & Search</h3>
                                <p style={{ color: '#94A3B8' }}>Choose your source and destination to discover fast express trains.</p>
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                style={styles.trainCard}
                            >
                                <div style={styles.trainCardHeader}>
                                    <div style={styles.trainIdentity}>
                                        <div style={styles.trainIconBox}>
                                            <Train size={24} color="#38BDF8" />
                                        </div>
                                        <div>
                                            <h3 style={styles.trainName}>{train.name}</h3>
                                            <span style={styles.trainCode}>{train.code} • {train.trainType}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.classesSection}>
                                    <span style={styles.sectionLabel}>Configured Classes</span>
                                    <div style={styles.classesGrid}>
                                        {train.seatConfigResponseList?.map((sc, i) => (
                                            <div key={i} style={styles.classCard}>
                                                <SeatClassBadge seatClass={sc.seatClass} />
                                                <span style={styles.classFare}>₹{sc.fairPerKm}/km</span>
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
                                    <span>Route Stops & Schedule</span>
                                    {expandedTrainId === train.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {/* Expanded Stops List */}
                                <AnimatePresence>
                                    {expandedTrainId === train.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={styles.stopsDropdown}
                                        >
                                            {trainRoutes[train.id] ? (
                                                trainRoutes[train.id].length > 0 ? (
                                                    <div style={styles.stopsTimeline}>
                                                        {trainRoutes[train.id].map((stop, sIdx) => (
                                                            <div key={sIdx} style={styles.stopRow}>
                                                                <div style={styles.stopOrder}>#{stop.stopOrder || sIdx + 1}</div>
                                                                <div style={styles.stopDetails}>
                                                                    <div style={styles.stopStationName}>Station {stop.stationId}</div>
                                                                    <div style={styles.stopTimes}>
                                                                        Arr: {stop.arrivalTime ? stop.arrivalTime.substring(0, 5) : '--:--'} | Dep: {stop.departureTime ? stop.departureTime.substring(0, 5) : '--:--'}
                                                                    </div>
                                                                </div>
                                                                <div style={styles.stopDistance}>{stop.distanceFromSourceKm || 0} km</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
                                                        No route stops configured for this train yet.
                                                    </p>
                                                )
                                            ) : (
                                                <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
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
                                    <span>Select Train</span>
                                    <ArrowRight size={18} />
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
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
    },
    heroSection: {
        marginBottom: '3rem',
    },
    heroHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.9rem',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '9999px',
        color: '#38BDF8',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '1rem',
    },
    heroTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: '#F8FAFC',
        letterSpacing: '-0.025em',
        margin: '0 0 0.5rem 0',
    },
    heroSubtitle: {
        color: '#94A3B8',
        fontSize: '1.05rem',
        maxWidth: '650px',
        margin: '0 auto',
    },
    searchCard: {
        background: 'rgba(17, 27, 49, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '1.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.08)',
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
        gap: '0.4rem',
    },
    formColDate: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
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
    swapBtn: {
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        marginBottom: '2px',
    },
    searchSubmitBtn: {
        padding: '0.85rem 1.75rem',
        height: '48px',
        alignSelf: 'flex-end',
        borderRadius: '12px',
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
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.35rem',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
    tabBtn: {
        padding: '0.6rem 1.25rem',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: '#94A3B8',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabBtnActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38BDF8',
    },
    filterBox: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.4rem 1rem',
        minWidth: '280px',
    },
    filterInput: {
        background: 'transparent',
        border: 'none',
        padding: '0.4rem 0',
        fontSize: '0.9rem',
        boxShadow: 'none',
    },
    resultsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.75rem',
    },
    catalogGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.75rem',
    },
    trainCard: {
        background: 'rgba(17, 27, 49, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        transition: 'all 0.25s ease',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
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
        gap: '0.85rem',
    },
    trainIconBox: {
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: 'rgba(56, 189, 248, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    trainName: {
        margin: 0,
        fontSize: '1.15rem',
        fontWeight: 800,
        color: '#F8FAFC',
        lineHeight: 1.2,
    },
    trainCode: {
        fontSize: '0.8rem',
        color: '#94A3B8',
        fontWeight: 600,
    },
    distanceBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.65rem',
        borderRadius: '8px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        color: '#10B981',
        fontSize: '0.78rem',
        fontWeight: 700,
    },
    timelineBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.04)',
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
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    stationName: {
        fontSize: '0.8rem',
        color: '#94A3B8',
        fontWeight: 500,
        maxWidth: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    timelineBar: {
        flex: 1,
        position: 'relative',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.12)',
        margin: '0 1rem',
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
        gap: '0.5rem',
    },
    sectionLabel: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    classesGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    classCard: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.35rem 0.65rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    classFare: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#CBD5E1',
    },
    bookBtn: {
        width: '100%',
        padding: '0.85rem',
        borderRadius: '12px',
        marginTop: 'auto',
    },
    expandStopsBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 0.85rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        color: '#CBD5E1',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    stopsDropdown: {
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '12px',
        padding: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.04)',
    },
    stopsTimeline: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    stopRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        padding: '0.35rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    },
    stopOrder: {
        color: '#38BDF8',
        fontWeight: 700,
        width: '30px',
    },
    stopDetails: {
        flex: 1,
    },
    stopStationName: {
        color: '#F8FAFC',
        fontWeight: 600,
    },
    stopTimes: {
        color: '#64748B',
        fontSize: '0.75rem',
    },
    stopDistance: {
        color: '#94A3B8',
        fontWeight: 600,
    },
    loadingBox: {
        textAlign: 'center',
        padding: '5rem 2rem',
    },
    emptyCard: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'rgba(17, 27, 49, 0.5)',
        borderRadius: '24px',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
    },
    promptCard: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'rgba(17, 27, 49, 0.3)',
        borderRadius: '24px',
        border: '1px dashed rgba(255, 255, 255, 0.08)',
    }
};

export default Search;
