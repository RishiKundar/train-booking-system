import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, PlusCircle, MapPin, Train, Navigation, 
    CheckCircle2, AlertTriangle, Loader2, Sparkles, Layers 
} from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
    const { isAdmin, showToast } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('stations'); // 'stations', 'trains', 'routes'
    const [loading, setLoading] = useState(false);

    // Existing stations and trains for dropdowns
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);

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

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            showToast('Access denied: Administrator role required.', 'error');
            return;
        }

        const loadMetadata = async () => {
            try {
                const [stData, trData] = await Promise.all([
                    api.get('/train/stations', { params: { page: 0, size: 100 } }),
                    api.get('/train/trains', { params: { page: 0, size: 100 } })
                ]);
                const stList = stData.content || stData || [];
                const trList = trData.content || trData || [];
                setStations(stList);
                setTrains(trList);

                if (trList.length > 0) setRouteForm(prev => ({ ...prev, trainId: trList[0].id }));
                if (stList.length > 0) setRouteForm(prev => ({ ...prev, stationId: stList[0].id }));
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };

        loadMetadata();
    }, [isAdmin, navigate, showToast]);

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
            // Refresh stations
            const updated = await api.get('/train/stations', { params: { page: 0, size: 100 } });
            setStations(updated.content || updated || []);
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
            // Refresh trains
            const updated = await api.get('/train/trains', { params: { page: 0, size: 100 } });
            setTrains(updated.content || updated || []);
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
            setRouteForm(prev => ({
                ...prev,
                stopOrder: prev.stopOrder + 1,
                distanceFromSourceKm: prev.distanceFromSourceKm + 100
            }));
        } catch (err) {
            showToast(err.message || 'Failed to add route stop', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Header */}
                <div style={styles.adminBanner}>
                    <div style={styles.bannerInfo}>
                        <div style={styles.bannerBadge}>
                            <ShieldCheck size={16} color="#F59E0B" />
                            <span>Administrator Control Plane</span>
                        </div>
                        <h1 style={styles.bannerTitle}>Rail Master Configuration</h1>
                        <p style={styles.bannerSubtitle}>Register stations, configure trains with class quotas, and manage transit routes.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabsBar}>
                    <button
                        onClick={() => setActiveTab('stations')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'stations' ? styles.tabBtnActive : {}) }}
                    >
                        <MapPin size={18} />
                        <span>Add Railway Station ({stations.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('trains')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'trains' ? styles.tabBtnActive : {}) }}
                    >
                        <Train size={18} />
                        <span>Add Train & Seats ({trains.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('routes')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'routes' ? styles.tabBtnActive : {}) }}
                    >
                        <Navigation size={18} />
                        <span>Configure Route Stops</span>
                    </button>
                </div>

                {/* Tab 1: Stations */}
                {activeTab === 'stations' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                        <h2 style={styles.formTitle}>Register New Station</h2>
                        <form onSubmit={handleAddStation} style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Station Name *</label>
                                <input 
                                    type="text" 
                                    placeholder="Mumbai Central" 
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
                                    placeholder="BCT" 
                                    value={stationForm.code} 
                                    onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })} 
                                    style={styles.input} 
                                    required 
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>City *</label>
                                <input 
                                    type="text" 
                                    placeholder="Mumbai" 
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
                                    placeholder="Maharashtra" 
                                    value={stationForm.state} 
                                    onChange={(e) => setStationForm({ ...stationForm, state: e.target.value })} 
                                    style={styles.input} 
                                    required 
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
                                <PlusCircle size={18} />
                                <span>{loading ? 'Registering Station...' : 'Create Station'}</span>
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Tab 2: Trains */}
                {activeTab === 'trains' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                        <h2 style={styles.formTitle}>Register New Train</h2>
                        <form onSubmit={handleAddTrain} style={styles.form}>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Train Name *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Vande Bharat Express" 
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
                                        placeholder="VB-2026" 
                                        value={trainForm.code} 
                                        onChange={(e) => setTrainForm({ ...trainForm, code: e.target.value })} 
                                        style={styles.input} 
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

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={styles.label}>Seat Configurations & Rates per KM</label>
                                <div style={styles.classConfigsGrid}>
                                    {trainForm.seatConfigurations.map((sc, i) => (
                                        <div key={sc.seatClass} style={styles.classConfigCard}>
                                            <div style={{ fontWeight: 700, color: '#38BDF8', fontSize: '0.9rem' }}>{sc.seatClass}</div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Total Seats</span>
                                                    <input 
                                                        type="number"
                                                        value={sc.totalSeats}
                                                        onChange={(e) => {
                                                            const updated = [...trainForm.seatConfigurations];
                                                            updated[i].totalSeats = e.target.value;
                                                            setTrainForm({ ...trainForm, seatConfigurations: updated });
                                                        }}
                                                        style={styles.smallInput}
                                                    />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Fare/KM (₹)</span>
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
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ ...styles.submitBtn, marginTop: '2rem' }}>
                                <PlusCircle size={18} />
                                <span>{loading ? 'Creating Train...' : 'Create Train'}</span>
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Tab 3: Route Stops */}
                {activeTab === 'routes' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
                        <h2 style={styles.formTitle}>Add Route Stop to Train</h2>
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
                                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
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
                                        <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.city}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Stop Order (Sequence) *</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={routeForm.stopOrder}
                                    onChange={(e) => setRouteForm({ ...routeForm, stopOrder: e.target.value })}
                                    style={styles.input}
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
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Arrival Time (HH:MM:SS) *</label>
                                <input 
                                    type="text"
                                    value={routeForm.arrivalTime}
                                    onChange={(e) => setRouteForm({ ...routeForm, arrivalTime: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Departure Time (HH:MM:SS) *</label>
                                <input 
                                    type="text"
                                    value={routeForm.departureTime}
                                    onChange={(e) => setRouteForm({ ...routeForm, departureTime: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ ...styles.submitBtn, gridColumn: '1 / -1' }}>
                                <PlusCircle size={18} />
                                <span>{loading ? 'Adding Stop...' : 'Add Route Stop'}</span>
                            </button>
                        </form>
                    </motion.div>
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
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
    },
    adminBanner: {
        background: 'rgba(17, 27, 49, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '24px',
        padding: '2.25rem',
        marginBottom: '2rem',
    },
    bannerInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    bannerBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.8rem',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '9999px',
        color: '#F59E0B',
        fontSize: '0.78rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        width: 'fit-content',
    },
    bannerTitle: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 800,
        color: '#F8FAFC',
    },
    bannerSubtitle: {
        margin: '0.35rem 0 0 0',
        color: '#94A3B8',
        fontSize: '0.95rem',
    },
    tabsBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    tabBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.03)',
        color: '#94A3B8',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabBtnActive: {
        background: 'rgba(56, 189, 248, 0.15)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        color: '#38BDF8',
    },
    formCard: {
        background: 'rgba(17, 27, 49, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.5rem',
    },
    formTitle: {
        fontSize: '1.4rem',
        fontWeight: 800,
        color: '#F8FAFC',
        marginBottom: '1.5rem',
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
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#CBD5E1',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    input: {
        padding: '0.85rem 1rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#F8FAFC',
        fontSize: '0.95rem',
    },
    smallInput: {
        padding: '0.5rem 0.75rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '0.9rem',
    },
    classConfigsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
        marginTop: '0.75rem',
    },
    classConfigCard: {
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '14px',
        padding: '1rem',
    },
    submitBtn: {
        gridColumn: '1 / -1',
        padding: '1rem',
        borderRadius: '12px',
        marginTop: '1rem',
    }
};

export default Admin;
