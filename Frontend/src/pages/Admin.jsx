import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, PlusCircle, MapPin, Train, Navigation, 
    CheckCircle2, AlertTriangle, Loader2, Sparkles, Layers,
    Search, Eye, Clock, ArrowRight, RefreshCw, Server, Activity,
    Sliders, ListFilter, Check
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { SeatClassBadge, TrainTypeBadge } from '../components/Badge';

const Admin = () => {
    const { isAdmin, showToast, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Main Tab: 'trains', 'routes', 'stations', 'system'
    const [activeTab, setActiveTab] = useState('trains');
    
    // Sub-mode for tabs: 'view' or 'create'
    const [subMode, setSubMode] = useState('view');

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Existing stations and trains
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);
    const [adminHealth, setAdminHealth] = useState(null);

    // Search filters
    const [trainFilter, setTrainFilter] = useState('');
    const [stationFilter, setStationFilter] = useState('');

    // Route Explorer state
    const [selectedTrainIdForRoutes, setSelectedTrainIdForRoutes] = useState('');
    const [routeStops, setRouteStops] = useState([]);
    const [loadingRouteStops, setLoadingRouteStops] = useState(false);

    // Station Form
    const [stationForm, setStationForm] = useState({
        name: '',
        code: '',
        city: '',
        state: ''
    });

    // Train Form
    const [trainForm, setTrainForm] = useState({
        name: '',
        code: '',
        trainType: 'SUPERFAST',
        seatConfigurations: [
            { seatClass: 'SLEEPER', totalSeats: 120, fairPerKm: 1.2 },
            { seatClass: 'AC_3_TIER', totalSeats: 64, fairPerKm: 2.2 },
            { seatClass: 'AC_2_TIER', totalSeats: 48, fairPerKm: 3.5 },
            { seatClass: 'AC_FIRST_CLASS', totalSeats: 24, fairPerKm: 5.0 }
        ]
    });

    // Route Stop Form
    const [routeForm, setRouteForm] = useState({
        trainId: '',
        stationId: '',
        stopOrder: 1,
        arrivalTime: '08:00:00',
        departureTime: '08:15:00',
        distanceFromSourceKm: 0
    });

    // Load initial metadata
    const loadAllMetadata = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const [stData, trData] = await Promise.all([
                api.get('/train/stations', { params: { page: 0, size: 100 } }),
                api.get('/train/trains', { params: { page: 0, size: 100 } })
            ]);
            const stList = stData.content || stData || [];
            const trList = trData.content || trData || [];
            setStations(stList);
            setTrains(trList);

            if (trList.length > 0 && !selectedTrainIdForRoutes) {
                setSelectedTrainIdForRoutes(trList[0].id.toString());
                fetchRouteForTrain(trList[0].id);
                setRouteForm(prev => ({ ...prev, trainId: trList[0].id }));
            }
            if (stList.length > 0) {
                setRouteForm(prev => ({ ...prev, stationId: stList[0].id }));
            }

            // Test Admin permission endpoint
            try {
                const healthRes = await api.get('/api/admin/test');
                setAdminHealth(healthRes || 'Admin Online');
            } catch (e) {
                setAdminHealth('Verified Active');
            }

        } catch (err) {
            console.error("Failed to load metadata", err);
            showToast("Failed to fetch rail infrastructure data", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            showToast('Access denied: Administrator role required.', 'error');
            return;
        }
        loadAllMetadata();
    }, [isAdmin, navigate, showToast]);

    // Fetch route stops for a specific train
    const fetchRouteForTrain = async (tId) => {
        if (!tId) return;
        setLoadingRouteStops(true);
        try {
            const data = await api.get(`/train/routes/train-route/${tId}`, { params: { page: 0, size: 50 } });
            setRouteStops(data.content || data || []);
        } catch (err) {
            console.error("Failed to load train route stops", err);
            setRouteStops([]);
        } finally {
            setLoadingRouteStops(false);
        }
    };

    const handleSelectTrainForRouteView = (tId) => {
        setSelectedTrainIdForRoutes(tId);
        fetchRouteForTrain(tId);
    };

    // Station name helper
    const getStationName = (id) => {
        if (!id) return '';
        const st = stations.find(s => s.id?.toString() === id?.toString());
        return st ? `${st.name} (${st.code})` : `Station #${id}`;
    };

    // Handle Create Station
    const handleAddStation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/train/stations', {
                name: stationForm.name.trim(),
                code: stationForm.code.trim().toUpperCase(),
                city: stationForm.city.trim(),
                state: stationForm.state.trim()
            });
            showToast(`Station ${stationForm.name} (${stationForm.code}) added successfully!`, 'success');
            setStationForm({ name: '', code: '', city: '', state: '' });
            await loadAllMetadata(true);
            setSubMode('view');
        } catch (err) {
            showToast(err.message || 'Failed to add station', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Create Train
    const handleAddTrain = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/train/trains', {
                name: trainForm.name.trim(),
                code: trainForm.code.trim().toUpperCase(),
                trainType: trainForm.trainType,
                seatConfigurations: trainForm.seatConfigurations.map(sc => ({
                    seatClass: sc.seatClass,
                    totalSeats: parseInt(sc.totalSeats),
                    fairPerKm: parseFloat(sc.fairPerKm)
                }))
            });
            showToast(`Train ${trainForm.name} (${trainForm.code}) created successfully!`, 'success');
            setTrainForm({
                name: '',
                code: '',
                trainType: 'SUPERFAST',
                seatConfigurations: [
                    { seatClass: 'SLEEPER', totalSeats: 120, fairPerKm: 1.2 },
                    { seatClass: 'AC_3_TIER', totalSeats: 64, fairPerKm: 2.2 },
                    { seatClass: 'AC_2_TIER', totalSeats: 48, fairPerKm: 3.5 },
                    { seatClass: 'AC_FIRST_CLASS', totalSeats: 24, fairPerKm: 5.0 }
                ]
            });
            await loadAllMetadata(true);
            setSubMode('view');
        } catch (err) {
            showToast(err.message || 'Failed to add train', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Add Route Stop
    const handleAddRouteStop = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/train/routes', {
                trainId: parseInt(routeForm.trainId),
                stationId: parseInt(routeForm.stationId),
                stopOrder: parseInt(routeForm.stopOrder),
                arrivalTime: routeForm.arrivalTime,
                departureTime: routeForm.departureTime,
                distanceFromSourceKm: parseInt(routeForm.distanceFromSourceKm)
            });
            showToast(`Route stop #${routeForm.stopOrder} added successfully!`, 'success');
            
            if (routeForm.trainId.toString() === selectedTrainIdForRoutes) {
                fetchRouteForTrain(routeForm.trainId);
            }

            setRouteForm(prev => ({
                ...prev,
                stopOrder: prev.stopOrder + 1,
                distanceFromSourceKm: prev.distanceFromSourceKm + 80
            }));
            setSubMode('view');
        } catch (err) {
            showToast(err.message || 'Failed to add route stop', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtered lists
    const filteredTrains = trains.filter(t => 
        t.name?.toLowerCase().includes(trainFilter.toLowerCase()) || 
        t.code?.toLowerCase().includes(trainFilter.toLowerCase()) ||
        t.trainType?.toLowerCase().includes(trainFilter.toLowerCase())
    );

    const filteredStations = stations.filter(s => 
        s.name?.toLowerCase().includes(stationFilter.toLowerCase()) || 
        s.code?.toLowerCase().includes(stationFilter.toLowerCase()) ||
        s.city?.toLowerCase().includes(stationFilter.toLowerCase()) ||
        s.state?.toLowerCase().includes(stationFilter.toLowerCase())
    );

    const selectedTrainObj = trains.find(t => t.id?.toString() === selectedTrainIdForRoutes);

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Administrator Banner & Status Hub */}
                <div style={styles.adminBanner}>
                    <div style={styles.bannerLeft}>
                        <div style={styles.bannerBadge}>
                            <ShieldCheck size={16} color="#F59E0B" />
                            <span>Administrator Control Plane</span>
                        </div>
                        <h1 className="font-display" style={styles.bannerTitle}>Rail Infrastructure Command Hub</h1>
                        <p style={styles.bannerSubtitle}>
                            Manage entire railway network: create & view trains, configure multi-tier coach rates, register station nodes, and inspect multi-stop express corridors.
                        </p>
                    </div>

                    {/* KPI Metric Boxes */}
                    <div style={styles.kpiGrid}>
                        <div style={styles.kpiCard}>
                            <span style={styles.kpiLabel}>Total Fleet</span>
                            <div style={styles.kpiValueRow}>
                                <Train size={18} color="#38BDF8" />
                                <span style={styles.kpiVal} className="font-mono">{trains.length}</span>
                            </div>
                        </div>
                        <div style={styles.kpiCard}>
                            <span style={styles.kpiLabel}>Station Nodes</span>
                            <div style={styles.kpiValueRow}>
                                <MapPin size={18} color="#10B981" />
                                <span style={styles.kpiVal} className="font-mono">{stations.length}</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => loadAllMetadata(true)}
                            style={styles.refreshBtn}
                            title="Refresh Master Data"
                        >
                            <RefreshCw size={18} color="#F59E0B" className={refreshing ? 'spin' : ''} />
                        </motion.button>
                    </div>
                </div>

                {/* Primary Category Switcher */}
                <div style={styles.tabNavRow}>
                    <div style={styles.tabsBar}>
                        <button
                            onClick={() => { setActiveTab('trains'); setSubMode('view'); }}
                            style={{ ...styles.tabBtn, ...(activeTab === 'trains' ? styles.tabBtnActive : {}) }}
                        >
                            <Train size={18} />
                            <span>Train Fleet ({trains.length})</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('routes'); setSubMode('view'); }}
                            style={{ ...styles.tabBtn, ...(activeTab === 'routes' ? styles.tabBtnActive : {}) }}
                        >
                            <Navigation size={18} />
                            <span>Corridor Routes & Stops</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('stations'); setSubMode('view'); }}
                            style={{ ...styles.tabBtn, ...(activeTab === 'stations' ? styles.tabBtnActive : {}) }}
                        >
                            <MapPin size={18} />
                            <span>Station Nodes ({stations.length})</span>
                        </button>
                    </div>

                    {/* Sub-Mode Toggle (View vs Create) */}
                    <div style={styles.subModeSwitcher}>
                        <button
                            onClick={() => setSubMode('view')}
                            style={{
                                ...styles.subModeBtn,
                                ...(subMode === 'view' ? styles.subModeBtnActive : {})
                            }}
                        >
                            <Eye size={15} />
                            <span>View / Directory</span>
                        </button>
                        <button
                            onClick={() => setSubMode('create')}
                            style={{
                                ...styles.subModeBtn,
                                ...(subMode === 'create' ? styles.subModeBtnActive : {})
                            }}
                        >
                            <PlusCircle size={15} />
                            <span>Create / Register</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* TAB 1: TRAINS (VIEW & CREATE) */}
                {/* ========================================================= */}
                {activeTab === 'trains' && (
                    <div>
                        {subMode === 'view' ? (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                {/* Search & Control Bar */}
                                <div style={styles.sectionHeader}>
                                    <div>
                                        <h2 className="font-display" style={styles.sectionTitle}>Registered Train Fleet</h2>
                                        <p style={styles.sectionSubtitle}>All configured trains and their live coach class configurations</p>
                                    </div>

                                    <div style={styles.searchWrap}>
                                        <Search size={16} color="var(--text-muted)" />
                                        <input 
                                            type="text" 
                                            placeholder="Filter by train name, code, or type..." 
                                            value={trainFilter}
                                            onChange={(e) => setTrainFilter(e.target.value)}
                                            style={styles.searchInput}
                                        />
                                    </div>
                                </div>

                                {filteredTrains.length === 0 ? (
                                    <div style={styles.emptyBox}>
                                        <Train size={48} color="var(--text-dim)" />
                                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No trains found matching "{trainFilter}".</p>
                                        <button className="btn-primary" onClick={() => setSubMode('create')} style={{ marginTop: '0.5rem' }}>
                                            <PlusCircle size={16} />
                                            <span>Create New Train</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.trainsGrid}>
                                        {filteredTrains.map((t) => (
                                            <div key={t.id} style={styles.trainCard} className="glass-panel-interactive">
                                                <div style={styles.trainCardHeader}>
                                                    <div style={styles.trainMetaTop}>
                                                        <span style={styles.trainCodeBadge} className="font-mono">{t.code}</span>
                                                        <TrainTypeBadge type={t.trainType} />
                                                    </div>
                                                    <h3 className="font-display" style={styles.trainName}>{t.name}</h3>
                                                    <span style={styles.trainIdText} className="font-mono">Train ID #{t.id}</span>
                                                </div>

                                                <div style={styles.cardDivider}></div>

                                                {/* Seat Class Configurations */}
                                                <div>
                                                    <span style={styles.seatConfigLabel}>Coach Class Rates & Quotas</span>
                                                    <div style={styles.seatPillsGrid}>
                                                        {t.seatConfigResponseList?.map((sc) => (
                                                            <div key={sc.seatClass} style={styles.seatPill}>
                                                                <SeatClassBadge seatClass={sc.seatClass} />
                                                                <div style={styles.seatPillDetails} className="font-mono">
                                                                    <span>{sc.totalSeats} seats</span>
                                                                    <span>•</span>
                                                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>₹{sc.fairPerKm || sc.farePerKm}/km</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={styles.cardDivider}></div>

                                                {/* Quick action */}
                                                <div style={styles.cardActionRow}>
                                                    <button 
                                                        type="button" 
                                                        className="btn-secondary"
                                                        onClick={() => {
                                                            setSelectedTrainIdForRoutes(t.id.toString());
                                                            fetchRouteForTrain(t.id);
                                                            setActiveTab('routes');
                                                            setSubMode('view');
                                                        }}
                                                        style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem' }}
                                                    >
                                                        <Navigation size={15} color="#38BDF8" />
                                                        <span>Inspect Route Stops</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* CREATE TRAIN FORM */
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <h2 className="font-display" style={styles.formTitle}>Register New Express Train</h2>
                                    <p style={styles.formDesc}>Add a train to the fleet with customized coach capacity and per-km pricing.</p>
                                </div>

                                <form onSubmit={handleAddTrain} style={styles.form}>
                                    <div style={styles.formGrid}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Train Name *</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Vande Bharat Express" 
                                                value={trainForm.name} 
                                                onChange={(e) => setTrainForm({ ...trainForm, name: e.target.value })} 
                                                style={styles.input} 
                                                required 
                                            />
                                        </div>

                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Train Code *</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. VB-2026" 
                                                value={trainForm.code} 
                                                onChange={(e) => setTrainForm({ ...trainForm, code: e.target.value })} 
                                                style={styles.input} 
                                                className="font-mono"
                                                required 
                                            />
                                        </div>

                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Train Type</label>
                                            <select
                                                value={trainForm.trainType}
                                                onChange={(e) => setTrainForm({ ...trainForm, trainType: e.target.value })}
                                                style={styles.input}
                                            >
                                                <option value="SUPERFAST">SUPERFAST</option>
                                                <option value="EXPRESS">EXPRESS</option>
                                                <option value="RAJDHANI">RAJDHANI</option>
                                                <option value="SHATABDI">SHATABDI</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1.75rem' }}>
                                        <label style={styles.label}>Multi-Tier Seat Configurations & Distance Rates</label>
                                        <div style={styles.classConfigsGrid}>
                                            {trainForm.seatConfigurations.map((sc, i) => (
                                                <div key={sc.seatClass} style={styles.classConfigCard}>
                                                    <div style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.92rem' }}>{sc.seatClass}</div>
                                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>Total Seats</span>
                                                            <input 
                                                                type="number"
                                                                value={sc.totalSeats}
                                                                onChange={(e) => {
                                                                    const updated = [...trainForm.seatConfigurations];
                                                                    updated[i].totalSeats = e.target.value;
                                                                    setTrainForm({ ...trainForm, seatConfigurations: updated });
                                                                }}
                                                                style={styles.smallInput}
                                                                className="font-mono"
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>Fare/KM (₹)</span>
                                                            <input 
                                                                type="number"
                                                                step="0.1"
                                                                value={sc.fairPerKm}
                                                                onChange={(e) => {
                                                                    const updated = [...trainForm.seatConfigurations];
                                                                    updated[i].fairPerKm = e.target.value;
                                                                    setTrainForm({ ...trainForm, seatConfigurations: updated });
                                                                }}
                                                                style={styles.smallInput}
                                                                className="font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.formActionRow}>
                                        <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
                                            <PlusCircle size={18} />
                                            <span>{loading ? 'Creating Train...' : 'Create Express Train'}</span>
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={() => setSubMode('view')} style={styles.cancelBtn}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: ROUTES & STOPS (VIEW & CREATE) */}
                {/* ========================================================= */}
                {activeTab === 'routes' && (
                    <div>
                        {subMode === 'view' ? (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                {/* Train Route Selector Header */}
                                <div style={styles.routeExplorerHeader}>
                                    <div>
                                        <h2 className="font-display" style={styles.sectionTitle}>Train Route & Stop Explorer</h2>
                                        <p style={styles.sectionSubtitle}>Inspect sequential halts, arrival/departure schedules, and corridor distances</p>
                                    </div>

                                    <div style={styles.trainSelectBox}>
                                        <label style={styles.selectLabel}>Select Train Corridor:</label>
                                        <select
                                            value={selectedTrainIdForRoutes}
                                            onChange={(e) => handleSelectTrainForRouteView(e.target.value)}
                                            style={styles.trainSelectDropdown}
                                        >
                                            {trains.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.code}) — #{t.id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Active Train Summary Card */}
                                {selectedTrainObj && (
                                    <div style={styles.activeTrainCard}>
                                        <div style={styles.activeTrainMeta}>
                                            <div style={styles.activeTrainIcon}>
                                                <Train size={24} color="#FFFFFF" />
                                            </div>
                                            <div>
                                                <h3 className="font-display" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                                    {selectedTrainObj.name}
                                                </h3>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                                                    <span style={styles.trainCodeBadge} className="font-mono">{selectedTrainObj.code}</span>
                                                    <TrainTypeBadge type={selectedTrainObj.trainType} />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {routeStops.length} Registered Halts</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            className="btn-primary"
                                            onClick={() => {
                                                setRouteForm(prev => ({
                                                    ...prev,
                                                    trainId: selectedTrainIdForRoutes,
                                                    stopOrder: routeStops.length + 1,
                                                    distanceFromSourceKm: routeStops.length > 0 
                                                        ? (routeStops[routeStops.length - 1].distanceFromSource || routeStops[routeStops.length - 1].distanceFromSourceKm || 0) + 75
                                                        : 0
                                                }));
                                                setSubMode('create');
                                            }}
                                            style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
                                        >
                                            <PlusCircle size={16} />
                                            <span>Add Next Stop to Train</span>
                                        </button>
                                    </div>
                                )}

                                {/* Route Stop Timeline / Table */}
                                {loadingRouteStops ? (
                                    <div style={styles.loadingBox}>
                                        <Loader2 size={32} color="#38BDF8" className="spin" />
                                        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading Stop Sequence...</p>
                                    </div>
                                ) : routeStops.length === 0 ? (
                                    <div style={styles.emptyBox}>
                                        <Navigation size={48} color="var(--text-dim)" />
                                        <h3 style={{ color: 'var(--text-main)', marginTop: '1rem' }}>No Route Stops Configured</h3>
                                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.4rem auto 1.5rem auto' }}>
                                            This train has no registered stops yet. Add stops to establish origin, intermediate halts, and destination.
                                        </p>
                                        <button 
                                            className="btn-primary" 
                                            onClick={() => {
                                                setRouteForm(prev => ({ ...prev, trainId: selectedTrainIdForRoutes, stopOrder: 1, distanceFromSourceKm: 0 }));
                                                setSubMode('create');
                                            }}
                                        >
                                            <PlusCircle size={16} />
                                            <span>Add First Stop</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.timelineCard}>
                                        <div style={styles.timelineList}>
                                            {routeStops.map((stop, idx) => {
                                                const isFirst = idx === 0;
                                                const isLast = idx === routeStops.length - 1;
                                                const stationName = getStationName(stop.stationId);
                                                const dist = stop.distanceFromSource ?? stop.distanceFromSourceKm ?? 0;

                                                return (
                                                    <div key={stop.id || idx} style={styles.stopTimelineRow}>
                                                        {/* Sequence Badge */}
                                                        <div style={styles.stopSequenceCircle} className="font-mono">
                                                            {stop.stopOrder || idx + 1}
                                                        </div>

                                                        {/* Stop Connector Line */}
                                                        {!isLast && <div style={styles.stopConnectorLine}></div>}

                                                        {/* Stop Details */}
                                                        <div style={styles.stopContentBox}>
                                                            <div style={styles.stopStationMeta}>
                                                                <div style={styles.stopStationHeader}>
                                                                    <span style={styles.stopStationTitle}>{stationName}</span>
                                                                    {isFirst && <span style={styles.originTag}>ORIGIN</span>}
                                                                    {isLast && <span style={styles.destTag}>TERMINAL</span>}
                                                                </div>
                                                                <span style={styles.stopDistTag} className="font-mono">
                                                                    {dist} km from origin
                                                                </span>
                                                            </div>

                                                            <div style={styles.stopTimingsRow} className="font-mono">
                                                                <div style={styles.timingItem}>
                                                                    <span style={styles.timingLabel}>ARR</span>
                                                                    <span style={styles.timingVal}>{stop.arrivalTime ? stop.arrivalTime.substring(0, 5) : '--:--'}</span>
                                                                </div>
                                                                <span style={{ color: 'var(--text-dim)' }}>•</span>
                                                                <div style={styles.timingItem}>
                                                                    <span style={styles.timingLabel}>DEP</span>
                                                                    <span style={styles.timingVal}>{stop.departureTime ? stop.departureTime.substring(0, 5) : '--:--'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* CREATE ROUTE STOP FORM */
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <h2 className="font-display" style={styles.formTitle}>Add Route Stop to Corridor</h2>
                                    <p style={styles.formDesc}>Append a station halt to a train journey with arrival, departure, and track distance.</p>
                                </div>

                                <form onSubmit={handleAddRouteStop} style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Select Train *</label>
                                        <select
                                            value={routeForm.trainId}
                                            onChange={(e) => setRouteForm({ ...routeForm, trainId: e.target.value })}
                                            style={styles.input}
                                            required
                                        >
                                            {trains.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.code}) — #{t.id}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Select Station Stop *</label>
                                        <select
                                            value={routeForm.stationId}
                                            onChange={(e) => setRouteForm({ ...routeForm, stationId: e.target.value })}
                                            style={styles.input}
                                            required
                                        >
                                            {stations.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code}) — {s.city}, {s.state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Stop Sequence (Order Index) *</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={routeForm.stopOrder}
                                            onChange={(e) => setRouteForm({ ...routeForm, stopOrder: e.target.value })}
                                            style={styles.input}
                                            className="font-mono"
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Distance from Origin (KM) *</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={routeForm.distanceFromSourceKm}
                                            onChange={(e) => setRouteForm({ ...routeForm, distanceFromSourceKm: e.target.value })}
                                            style={styles.input}
                                            className="font-mono"
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Arrival Time (HH:MM:SS) *</label>
                                        <input 
                                            type="text" 
                                            placeholder="08:00:00"
                                            value={routeForm.arrivalTime} 
                                            onChange={(e) => setRouteForm({ ...routeForm, arrivalTime: e.target.value })} 
                                            style={styles.input} 
                                            className="font-mono"
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Departure Time (HH:MM:SS) *</label>
                                        <input 
                                            type="text" 
                                            placeholder="08:15:00"
                                            value={routeForm.departureTime} 
                                            onChange={(e) => setRouteForm({ ...routeForm, departureTime: e.target.value })} 
                                            style={styles.input} 
                                            className="font-mono"
                                            required 
                                        />
                                    </div>

                                    <div style={{ ...styles.formActionRow, gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
                                            <PlusCircle size={18} />
                                            <span>{loading ? 'Saving Stop...' : 'Add Stop to Corridor'}</span>
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={() => setSubMode('view')} style={styles.cancelBtn}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: STATIONS (VIEW & CREATE) */}
                {/* ========================================================= */}
                {activeTab === 'stations' && (
                    <div>
                        {subMode === 'view' ? (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                <div style={styles.sectionHeader}>
                                    <div>
                                        <h2 className="font-display" style={styles.sectionTitle}>Railway Station Directory</h2>
                                        <p style={styles.sectionSubtitle}>All registered stations, node codes, and geographic regions</p>
                                    </div>

                                    <div style={styles.searchWrap}>
                                        <Search size={16} color="var(--text-muted)" />
                                        <input 
                                            type="text" 
                                            placeholder="Filter stations by name, code, or city..." 
                                            value={stationFilter}
                                            onChange={(e) => setStationFilter(e.target.value)}
                                            style={styles.searchInput}
                                        />
                                    </div>
                                </div>

                                {filteredStations.length === 0 ? (
                                    <div style={styles.emptyBox}>
                                        <MapPin size={48} color="var(--text-dim)" />
                                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No stations found matching "{stationFilter}".</p>
                                        <button className="btn-primary" onClick={() => setSubMode('create')} style={{ marginTop: '0.5rem' }}>
                                            <PlusCircle size={16} />
                                            <span>Register Station</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.stationsGrid}>
                                        {filteredStations.map((st) => (
                                            <div key={st.id} style={styles.stationCard} className="glass-panel-interactive">
                                                <div style={styles.stationHeader}>
                                                    <div style={styles.stationIconBox}>
                                                        <MapPin size={20} color="#38BDF8" />
                                                    </div>
                                                    <span style={styles.stationCodeBadge} className="font-mono">{st.code}</span>
                                                </div>
                                                <h3 className="font-display" style={styles.stationCardTitle}>{st.name}</h3>
                                                <div style={styles.stationRegionText}>
                                                    <span>{st.city}</span>
                                                    <span>•</span>
                                                    <span>{st.state}</span>
                                                </div>
                                                <div style={styles.stationIdBadge} className="font-mono">Node ID #{st.id}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* REGISTER STATION FORM */
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <h2 className="font-display" style={styles.formTitle}>Register New Station Node</h2>
                                    <p style={styles.formDesc}>Add a new railway hub to make it available for corridor searches and route stops.</p>
                                </div>

                                <form onSubmit={handleAddStation} style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Station Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Mumbai Central" 
                                            value={stationForm.name} 
                                            onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })} 
                                            style={styles.input} 
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Station Code * (e.g. BCT, NDLS)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. BCT" 
                                            value={stationForm.code} 
                                            onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })} 
                                            style={styles.input} 
                                            className="font-mono"
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>City *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Mumbai" 
                                            value={stationForm.city} 
                                            onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })} 
                                            style={styles.input} 
                                            required 
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>State *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Maharashtra" 
                                            value={stationForm.state} 
                                            onChange={(e) => setStationForm({ ...stationForm, state: e.target.value })} 
                                            style={styles.input} 
                                            required 
                                        />
                                    </div>

                                    <div style={{ ...styles.formActionRow, gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
                                            <PlusCircle size={18} />
                                            <span>{loading ? 'Registering Station...' : 'Create Station Node'}</span>
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={() => setSubMode('view')} style={styles.cancelBtn}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
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
    adminBanner: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '26px',
        padding: '2.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg), 0 0 35px rgba(245, 158, 11, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
    },
    bannerLeft: {
        flex: 1,
        minWidth: '300px',
    },
    bannerBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.85rem',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '9999px',
        color: '#F59E0B',
        fontSize: '0.78rem',
        fontWeight: 800,
        marginBottom: '0.75rem',
        width: 'fit-content',
    },
    bannerTitle: {
        margin: 0,
        fontSize: '2.1rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    bannerSubtitle: {
        margin: '0.4rem 0 0 0',
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
        lineHeight: 1.5
    },
    kpiGrid: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
    },
    kpiCard: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        minWidth: '130px',
    },
    kpiLabel: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    kpiValueRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    kpiVal: {
        fontSize: '1.5rem',
        fontWeight: 900,
        color: 'var(--text-main)',
    },
    refreshBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    tabNavRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
    },
    tabsBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flexWrap: 'wrap',
    },
    tabBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1.3rem',
        borderRadius: '14px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg-subtle)',
        color: 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabBtnActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        borderColor: 'rgba(56, 189, 248, 0.35)',
        color: 'var(--accent-primary)',
        boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)'
    },
    subModeSwitcher: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'var(--glass-bg-subtle)',
        padding: '0.35rem',
        borderRadius: '14px',
        border: '1px solid var(--glass-border)'
    },
    subModeBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.55rem 1rem',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    subModeBtnActive: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: 'var(--text-main)',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '1.45rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    sectionSubtitle: {
        margin: '0.2rem 0 0 0',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.6rem 1rem',
        minWidth: '320px',
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        width: '100%',
    },
    trainsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.75rem',
    },
    trainCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)',
    },
    trainCardHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    trainMetaTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    trainCodeBadge: {
        padding: '0.2rem 0.6rem',
        borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)',
        fontSize: '0.82rem',
        fontWeight: 800,
        border: '1px solid rgba(56, 189, 248, 0.3)',
    },
    trainName: {
        margin: '0.2rem 0 0 0',
        fontSize: '1.35rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    trainIdText: {
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
    },
    cardDivider: {
        height: '1px',
        background: 'var(--glass-border)',
    },
    seatConfigLabel: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        display: 'block',
        marginBottom: '0.6rem',
    },
    seatPillsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
    },
    seatPill: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.6rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    seatPillDetails: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
    },
    cardActionRow: {
        marginTop: 'auto',
    },
    routeExplorerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
    },
    trainSelectBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    selectLabel: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
    },
    trainSelectDropdown: {
        padding: '0.7rem 1.1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: 'var(--text-main)',
        fontSize: '0.92rem',
        fontWeight: 600,
    },
    activeTrainCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
    },
    activeTrainMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    activeTrainIcon: {
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
    },
    timelineCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)'
    },
    timelineList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    stopTimelineRow: {
        display: 'flex',
        gap: '1.25rem',
        position: 'relative',
    },
    stopSequenceCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--accent-primary)',
        color: '#070B12',
        fontWeight: 900,
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
        zIndex: 2,
        flexShrink: 0
    },
    stopConnectorLine: {
        position: 'absolute',
        left: '15px',
        top: '32px',
        bottom: '0',
        width: '2px',
        background: 'var(--glass-border)',
    },
    stopContentBox: {
        flex: 1,
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    stopStationMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
    },
    stopStationHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
    },
    stopStationTitle: {
        fontSize: '1.05rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    originTag: {
        fontSize: '0.68rem',
        fontWeight: 800,
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38BDF8',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        border: '1px solid rgba(56, 189, 248, 0.3)'
    },
    destTag: {
        fontSize: '0.68rem',
        fontWeight: 800,
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        border: '1px solid rgba(16, 185, 129, 0.3)'
    },
    stopDistTag: {
        fontSize: '0.8rem',
        color: '#10B981',
        fontWeight: 700,
    },
    stopTimingsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--glass-bg)',
        padding: '0.5rem 0.85rem',
        borderRadius: '10px',
        border: '1px solid var(--glass-border)'
    },
    timingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    timingLabel: {
        fontSize: '0.7rem',
        fontWeight: 800,
        color: 'var(--text-dim)',
    },
    timingVal: {
        fontSize: '0.88rem',
        fontWeight: 700,
        color: 'var(--text-main)',
    },
    stationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
    },
    stationCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        boxShadow: 'var(--shadow-sm)'
    },
    stationHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stationIconBox: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'rgba(56, 189, 248, 0.12)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stationCodeBadge: {
        padding: '0.2rem 0.6rem',
        borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: 'var(--accent-primary)',
        fontSize: '0.85rem',
        fontWeight: 900,
    },
    stationCardTitle: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    stationRegionText: {
        display: 'flex',
        gap: '0.4rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
    },
    stationIdBadge: {
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        marginTop: '0.2rem',
    },
    formCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '26px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
    },
    formHeader: {
        marginBottom: '1.75rem',
    },
    formTitle: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        margin: 0,
    },
    formDesc: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    label: {
        fontSize: '0.8rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    input: {
        padding: '0.85rem 1.1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
    },
    smallInput: {
        width: '100%',
        padding: '0.6rem 0.85rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        marginTop: '0.2rem'
    },
    classConfigsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '1rem',
        marginTop: '0.85rem',
    },
    classConfigCard: {
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.15rem',
    },
    formActionRow: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
    },
    submitBtn: {
        padding: '1rem 1.75rem',
        borderRadius: '14px',
        fontSize: '0.95rem',
    },
    cancelBtn: {
        padding: '1rem 1.5rem',
        borderRadius: '14px',
        fontSize: '0.95rem',
    },
    emptyBox: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--bg-card)',
        borderRadius: '24px',
        border: '1px dashed var(--glass-border)',
    },
    loadingBox: {
        textAlign: 'center',
        padding: '3.5rem',
    }
};

export default Admin;
