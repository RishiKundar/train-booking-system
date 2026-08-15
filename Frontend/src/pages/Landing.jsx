import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Train, Search, Calendar, MapPin, ArrowRight, Sparkles, 
    ShieldCheck, Zap, Radio, Clock, Award, CheckCircle2, 
    ChevronRight, Star, Utensils, Wifi, Luggage, HeartHandshake,
    Layers, Cpu, Server, Activity, Users, ArrowUpRight, Check
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const FLEET_DATA = [
    {
        id: 'vb',
        name: 'Vande Bharat 2.0 Express',
        tag: 'FLAGSHIP SEMI-HIGH SPEED',
        speed: '160 km/h',
        speedRating: 'Cruising Speed',
        desc: 'Aerodynamic trainsets with 180° rotating executive plush chairs, bio-vacuum touchless lavatories, automatic sensor plug doors, and Kavach anti-collision defense.',
        amenities: ['180° Rotating Seats', 'Kavach Safety 4.0', 'OLED Infotainment', 'Whisper-Quiet Cabins'],
        gradient: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        color: '#38BDF8',
        tagColor: '#38BDF8',
        accentBg: 'rgba(56, 189, 248, 0.12)'
    },
    {
        id: 'rj',
        name: 'Rajdhani Luxury Overnight',
        tag: 'PREMIER SUPERFAST',
        speed: '140 km/h',
        speedRating: 'Continuous Haul',
        desc: 'India’s premier overnight express network connecting national capitals with gourmet five-star dining, sanitized linen packs, and sound-insulated AC First cabins.',
        amenities: ['Gourmet Dinners Included', 'Spacious AC 1st Berths', 'Priority Green Signal', 'Electronic Access Keys'],
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: '#F59E0B',
        tagColor: '#F59E0B',
        accentBg: 'rgba(245, 158, 11, 0.12)'
    },
    {
        id: 'tj',
        name: 'Tejas Smart Express',
        tag: 'INTELLIGENT FLEET',
        speed: '150 km/h',
        speedRating: 'Connected Fleet',
        desc: 'Equipped with smart sensor predictive monitoring, personalised on-demand entertainment screens, automatic tea/coffee vending stations, and attendants-on-call.',
        amenities: ['Smart Sensor Doors', 'Individual Screens', 'Free Hot Beverages', 'Executive Lounge Pass'],
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: '#10B981',
        tagColor: '#10B981',
        accentBg: 'rgba(16, 185, 129, 0.12)'
    }
];

const CORRIDORS = [
    {
        name: 'Mumbai Central ⇄ Ahmedabad Jn',
        code: 'BULLET-01',
        time: '5h 25m',
        dist: '493 KM',
        fare: 'From ₹1,420',
        trainType: 'Vande Bharat Express',
        freq: '6 Days/Week',
        srcId: 1,
        destId: 2,
        badge: '⚡ Most Popular'
    },
    {
        name: 'New Delhi ⇄ Varanasi Jn',
        code: 'KASHI-EXP',
        time: '8h 00m',
        dist: '755 KM',
        fare: 'From ₹1,750',
        trainType: 'Vande Bharat 2.0',
        freq: 'Daily Service',
        srcId: 3,
        destId: 8,
        badge: '🛕 Cultural Line'
    },
    {
        name: 'Bengaluru City ⇄ Chennai Central',
        code: 'SILICON-LINK',
        time: '4h 15m',
        dist: '358 KM',
        fare: 'From ₹980',
        trainType: 'Shatabdi Express',
        freq: 'Daily Service',
        srcId: 4,
        destId: 5,
        badge: '🏙️ Tech Corridor'
    },
    {
        name: 'Kolkata Howrah ⇄ New Delhi',
        code: 'CAPITAL-RUN',
        time: '17h 25m',
        dist: '1,447 KM',
        fare: 'From ₹2,890',
        trainType: 'Rajdhani Express',
        freq: 'Daily Express',
        srcId: 7,
        destId: 3,
        badge: '⭐ Luxury Overnight'
    }
];

const REVIEWS = [
    {
        name: 'Dr. Vikram Malhotra',
        role: 'Chief Cardiologist, Mumbai',
        avatar: 'VM',
        stars: 5,
        comment: 'The millisecond seat reservation system is mindblowing. I booked my Vande Bharat executive ticket during peak Diwali rush without a single gateway timeout.',
        route: 'Mumbai ⇄ Ahmedabad'
    },
    {
        name: 'Ananya Deshmukh',
        role: 'Tech Lead @ Razorpay',
        avatar: 'AD',
        stars: 5,
        comment: 'The offline QR e-ticket worked seamlessly at station turnstiles without internet connectivity. Stunning design and the in-seat meal ordering was exceptional.',
        route: 'Bengaluru ⇄ Chennai'
    },
    {
        name: 'Col. Rajeshwar Singh',
        role: 'Veteran, New Delhi',
        avatar: 'RS',
        stars: 5,
        comment: 'Punctuality was 100% on the dot. The real-time GPS radar kept my family informed throughout the journey. A world-class standard for Indian railway tech.',
        route: 'New Delhi ⇄ Varanasi'
    }
];

const TECH_SPECS = [
    {
        icon: Zap,
        title: 'Zero-Race-Condition Redis Locks',
        desc: 'Distributed in-memory locks isolate seat allocation threads, eliminating duplicate seat bookings during simultaneous high-velocity checkout spikes.',
        stat: '< 4ms Latency'
    },
    {
        icon: Server,
        title: 'Apache Kafka Event Streams',
        desc: 'Asynchronous event-driven messaging pipelines buffer booking queries, generating reliable ledger events for tickets, payments, and seat telemetry.',
        stat: '50,000+ Req/Sec'
    },
    {
        icon: ShieldCheck,
        title: 'HMAC-SHA256 Webhook Security',
        desc: 'Cryptographically verified signatures prevent tampering, guaranteeing instant automated seat confirmation or rapid sub-minute refund processing.',
        stat: 'Bank-Grade SSL'
    },
    {
        icon: Activity,
        title: 'Live IoT Telemetry Radar',
        desc: 'Direct station platform tracking, speed monitoring, and arrival predictions with 99.8% precision across 400+ rail junction corridors.',
        stat: '99.8% Accuracy'
    }
];

const Landing = () => {
    const { isAuthenticated, showToast } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stations, setStations] = useState([]);
    const [selectedFleet, setSelectedFleet] = useState(FLEET_DATA[0]);

    // Quick Search Form State
    const [sourceId, setSourceId] = useState('');
    const [destId, setDestId] = useState('');
    const [travelDate, setTravelDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await api.get('/train/stations', { params: { page: 0, size: 100 } });
                const list = data.content || data || [];
                setStations(list);
                if (list.length >= 2) {
                    setSourceId(list[0].id.toString());
                    setDestId(list[1].id.toString());
                }
            } catch (e) {
                // Fallback default mock stations
                setStations([
                    { id: 1, name: 'Mumbai Central', code: 'BCT', city: 'Mumbai' },
                    { id: 2, name: 'Ahmedabad Jn', code: 'ADI', city: 'Ahmedabad' },
                    { id: 3, name: 'New Delhi', code: 'NDLS', city: 'New Delhi' },
                    { id: 4, name: 'Bengaluru City', code: 'SBC', city: 'Bengaluru' },
                    { id: 5, name: 'MGR Chennai Central', code: 'MAS', city: 'Chennai' }
                ]);
                setSourceId('1');
                setDestId('2');
            }
        };
        fetchStations();
    }, []);

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (sourceId === destId) {
            showToast('Origin and Destination cannot be the same station.', 'warning');
            return;
        }
        navigate(`/search?sourceStationId=${sourceId}&destinationStationId=${destId}&travelDate=${travelDate}`);
    };

    return (
        <div style={styles.container}>
            {/* ========================================================================= */}
            {/* 1. HERO SECTION WITH EMBEDDED CONSOLE */}
            {/* ========================================================================= */}
            <section style={styles.heroSection}>
                <div style={styles.heroInner}>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={styles.heroContent}
                    >
                        <div style={styles.heroBadge}>
                            <Sparkles size={14} color="#38BDF8" />
                            <span>Next-Generation High-Speed Rail Network</span>
                            <span style={styles.badgePulse} className="live-pulse" />
                        </div>

                        <h1 className="font-display" style={styles.heroHeading}>
                            Experience The Future Of <br />
                            <span style={styles.heroGradientText}>High-Speed Rail Travel</span>
                        </h1>

                        <p style={styles.heroDesc}>
                            Instant millisecond seat locking with distributed Redis caches, Kafka event streaming, and contactless biometric boarding passes for India’s fastest express fleet.
                        </p>

                        {/* Search Console */}
                        <div style={styles.searchConsoleCard} className="glass-panel">
                            <form onSubmit={handleQuickSearch} style={styles.searchForm}>
                                <div style={styles.searchFormGrid}>
                                    {/* Departure */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>
                                            <MapPin size={14} color="#38BDF8" />
                                            <span>From (Departure)</span>
                                        </label>
                                        <select
                                            value={sourceId}
                                            onChange={(e) => setSourceId(e.target.value)}
                                            style={styles.selectInput}
                                        >
                                            {stations.map(st => (
                                                <option key={st.id} value={st.id}>
                                                    {st.name} ({st.code}) — {st.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Arrival */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>
                                            <MapPin size={14} color="#10B981" />
                                            <span>To (Destination)</span>
                                        </label>
                                        <select
                                            value={destId}
                                            onChange={(e) => setDestId(e.target.value)}
                                            style={styles.selectInput}
                                        >
                                            {stations.map(st => (
                                                <option key={st.id} value={st.id}>
                                                    {st.name} ({st.code}) — {st.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>
                                            <Calendar size={14} color="#F59E0B" />
                                            <span>Journey Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={travelDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setTravelDate(e.target.value)}
                                            style={styles.dateInput}
                                            className="font-mono"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button type="submit" className="btn-primary" style={styles.searchSubmitBtn}>
                                        <Search size={18} />
                                        <span>Find Trains</span>
                                    </button>
                                </div>
                            </form>

                            {/* Trust badges */}
                            <div style={styles.heroTrustRow}>
                                <div style={styles.trustItem}>
                                    <CheckCircle2 size={15} color="#10B981" />
                                    <span>Zero Overbooking Guarantee</span>
                                </div>
                                <div style={styles.trustItem}>
                                    <CheckCircle2 size={15} color="#38BDF8" />
                                    <span>256-Bit Bank Grade SSL</span>
                                </div>
                                <div style={styles.trustItem}>
                                    <CheckCircle2 size={15} color="#F59E0B" />
                                    <span>Instant Automated Refund</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 2. STATS KPI TICKER */}
            {/* ========================================================================= */}
            <section style={styles.statsSection}>
                <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                        <span style={styles.statNumber} className="font-mono">160 km/h</span>
                        <span style={styles.statLabel}>Vande Bharat Cruising Speed</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statNumber} className="font-mono">99.4%</span>
                        <span style={styles.statLabel}>On-Time Arrival Precision</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statNumber} className="font-mono">2.4 Million+</span>
                        <span style={styles.statLabel}>Passengers Transported</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statNumber} className="font-mono">&lt; 4ms</span>
                        <span style={styles.statLabel}>Redis Seat Locking Latency</span>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. PREMIER TRAIN FLEET SHOWCASE */}
            {/* ========================================================================= */}
            <section style={styles.sectionWrap}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionBadge}>
                        <Train size={14} color="#38BDF8" />
                        <span>PREMIER FLEET</span>
                    </div>
                    <h2 className="font-display" style={styles.sectionTitle}>Engineered For Velocity & Luxury</h2>
                    <p style={styles.sectionSubtitle}>Explore the aerodynamic trains reshaping modern Indian transit</p>
                </div>

                {/* Fleet Switcher Tabs */}
                <div style={styles.fleetNavRow}>
                    {FLEET_DATA.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedFleet(t)}
                            style={{
                                ...styles.fleetTabBtn,
                                ...(selectedFleet.id === t.id ? { ...styles.fleetTabBtnActive, borderColor: t.color, color: t.color, background: t.accentBg } : {})
                            }}
                        >
                            <Train size={16} />
                            <span>{t.name}</span>
                        </button>
                    ))}
                </div>

                {/* Active Fleet Spotlight Card */}
                <motion.div 
                    key={selectedFleet.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    style={styles.fleetSpotlightCard}
                    className="glass-panel"
                >
                    <div style={styles.fleetContentGrid}>
                        <div>
                            <span style={{ ...styles.fleetTagPill, color: selectedFleet.color, borderColor: selectedFleet.color, background: selectedFleet.accentBg }}>
                                {selectedFleet.tag}
                            </span>
                            <h3 className="font-display" style={styles.fleetCardTitle}>{selectedFleet.name}</h3>
                            <p style={styles.fleetCardDesc}>{selectedFleet.desc}</p>

                            <div style={styles.amenitiesGrid}>
                                {selectedFleet.amenities.map((am, i) => (
                                    <div key={i} style={styles.amenityItem}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedFleet.color }} />
                                        <span>{am}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/search')}
                                style={{ marginTop: '2rem', padding: '0.85rem 1.75rem' }}
                            >
                                <span>Check Schedule & Book</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Visual Specs Dial */}
                        <div style={styles.fleetSpeedDial}>
                            <div style={{ ...styles.speedCircle, borderColor: selectedFleet.color, boxShadow: `0 0 40px ${selectedFleet.color}33` }}>
                                <span style={styles.speedVal} className="font-mono">{selectedFleet.speed}</span>
                                <span style={styles.speedText}>{selectedFleet.speedRating}</span>
                            </div>
                            <div style={styles.fleetSafetyBadge}>
                                <ShieldCheck size={18} color="#10B981" />
                                <span>Kavach 4.0 Collision Shield Active</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ========================================================================= */}
            {/* 4. POPULAR HIGH-SPEED CORRIDORS */}
            {/* ========================================================================= */}
            <section style={{ ...styles.sectionWrap, background: 'rgba(255, 255, 255, 0.01)' }}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionBadge}>
                        <Radio size={14} color="#10B981" className="live-pulse" />
                        <span>FASTEST ROUTES</span>
                    </div>
                    <h2 className="font-display" style={styles.sectionTitle}>High-Frequency Express Corridors</h2>
                    <p style={styles.sectionSubtitle}>Seamless high-speed point-to-point connections with live availability</p>
                </div>

                <div style={styles.corridorsGrid}>
                    {CORRIDORS.map((c, i) => (
                        <div key={i} style={styles.corridorCard} className="glass-panel-interactive">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={styles.corridorBadge}>{c.badge}</span>
                                <span style={styles.corridorFare} className="font-mono">{c.fare}</span>
                            </div>

                            <h3 className="font-display" style={styles.corridorTitle}>{c.name}</h3>
                            <span style={styles.corridorTrainType}>{c.trainType}</span>

                            <div style={styles.corridorStatsRow}>
                                <div style={styles.corridorStatItem}>
                                    <span style={styles.corridorStatLabel}>TRANSIT TIME</span>
                                    <span style={styles.corridorStatVal} className="font-mono">{c.time}</span>
                                </div>
                                <div style={styles.corridorStatItem}>
                                    <span style={styles.corridorStatLabel}>DISTANCE</span>
                                    <span style={styles.corridorStatVal} className="font-mono">{c.dist}</span>
                                </div>
                                <div style={styles.corridorStatItem}>
                                    <span style={styles.corridorStatLabel}>FREQUENCY</span>
                                    <span style={styles.corridorStatVal}>{c.freq}</span>
                                </div>
                            </div>

                            <button
                                className="btn-primary"
                                onClick={() => navigate(`/search?sourceStationId=${c.srcId}&destinationStationId=${c.destId}&travelDate=${travelDate}`)}
                                style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', fontSize: '0.88rem' }}
                            >
                                <span>Reserve Seats on Corridor</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. ARCHITECTURE & RELIABILITY PILLARS */}
            {/* ========================================================================= */}
            <section style={styles.sectionWrap}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionBadge}>
                        <Cpu size={14} color="#38BDF8" />
                        <span>CLOUD ARCHITECTURE</span>
                    </div>
                    <h2 className="font-display" style={styles.sectionTitle}>Built For High-Velocity Concurrency</h2>
                    <p style={styles.sectionSubtitle}>Zero race conditions, zero downtime, and instant cryptographic payment webhooks</p>
                </div>

                <div style={styles.techGrid}>
                    {TECH_SPECS.map((item, i) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={i} style={styles.techCard} className="glass-panel">
                                <div style={styles.techIconBox}>
                                    <IconComponent size={24} color="#38BDF8" />
                                </div>
                                <div style={styles.techStatBadge} className="font-mono">{item.stat}</div>
                                <h3 className="font-display" style={styles.techTitle}>{item.title}</h3>
                                <p style={styles.techDesc}>{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 6. VERIFIED PASSENGER REVIEWS */}
            {/* ========================================================================= */}
            <section style={styles.sectionWrap}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionBadge}>
                        <Star size={14} color="#F59E0B" />
                        <span>PASSENGER VOICES</span>
                    </div>
                    <h2 className="font-display" style={styles.sectionTitle}>Trusted By Millions Across India</h2>
                    <p style={styles.sectionSubtitle}>Read verified reviews from executive travelers, commuters, and families</p>
                </div>

                <div style={styles.reviewsGrid}>
                    {REVIEWS.map((rev, i) => (
                        <div key={i} style={styles.reviewCard} className="glass-panel-interactive">
                            <div style={styles.starsRow}>
                                {[...Array(rev.stars)].map((_, idx) => (
                                    <Star key={idx} size={15} color="#F59E0B" fill="#F59E0B" />
                                ))}
                            </div>
                            <p style={styles.reviewComment}>"{rev.comment}"</p>
                            
                            <div style={styles.reviewAuthorRow}>
                                <div style={styles.authorAvatar} className="font-mono">{rev.avatar}</div>
                                <div>
                                    <h4 style={styles.authorName}>{rev.name}</h4>
                                    <span style={styles.authorRole}>{rev.role}</span>
                                    <span style={styles.authorRoute}>• {rev.route}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 7. HIGH CONVERTING CALL TO ACTION BANNER */}
            {/* ========================================================================= */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaCard} className="glass-panel">
                    <div style={styles.ctaContent}>
                        <div style={styles.ctaBadge}>
                            <Sparkles size={15} color="#38BDF8" />
                            <span>Start Traveling In Minutes</span>
                        </div>
                        <h2 className="font-display" style={styles.ctaTitle}>Ready For Your Next Journey?</h2>
                        <p style={styles.ctaDesc}>
                            Join over 2.4 million smart commuters. Lock your seats with zero overbooking and download biometric e-tickets instantly.
                        </p>
                        
                        <div style={styles.ctaBtnRow}>
                            <button onClick={() => navigate('/search')} className="btn-primary" style={{ padding: '0.95rem 2rem', fontSize: '1rem' }}>
                                <Search size={18} />
                                <span>Find Express Trains</span>
                            </button>
                            {!isAuthenticated && (
                                <button onClick={() => navigate('/signup')} className="btn-secondary" style={{ padding: '0.95rem 1.75rem', fontSize: '1rem' }}>
                                    <span>Create Free Account</span>
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 8. MODERN FOOTER */}
            {/* ========================================================================= */}
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={styles.footerColBrand}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={styles.footerLogo}>
                                <Train size={22} color="#FFFFFF" />
                            </div>
                            <span className="font-display" style={styles.footerBrandName}>TBS Rail</span>
                        </div>
                        <p style={styles.footerBrandText}>
                            High-Speed Express Train Reservation System. Powered by Apache Kafka, Redis Distributed Locks, and Spring Boot Cloud microservices.
                        </p>
                        <span style={styles.footerCopyright}>© {new Date().getFullYear()} TBS Rail Technologies Inc. All rights reserved.</span>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.footerColTitle}>Corridors</h4>
                        <Link to="/search" style={styles.footerLink}>Mumbai Central ⇄ Ahmedabad</Link>
                        <Link to="/search" style={styles.footerLink}>New Delhi ⇄ Varanasi Jn</Link>
                        <Link to="/search" style={styles.footerLink}>Bengaluru ⇄ Chennai</Link>
                        <Link to="/search" style={styles.footerLink}>Kolkata ⇄ Puri Beach</Link>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.footerColTitle}>Passenger Hub</h4>
                        <Link to="/dashboard" style={styles.footerLink}>My Bookings & E-Tickets</Link>
                        <Link to="/search" style={styles.footerLink}>Corridor Schedule Search</Link>
                        <Link to="/login" style={styles.footerLink}>Passenger Sign In</Link>
                        <Link to="/signup" style={styles.footerLink}>Register New Account</Link>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.footerColTitle}>Infrastructure</h4>
                        <span style={styles.footerLink}>Spring Boot Microservices</span>
                        <span style={styles.footerLink}>Apache Kafka 3.6 Event Stream</span>
                        <span style={styles.footerLink}>Redis 7.2 In-Memory Lock</span>
                        <span style={styles.footerLink}>Razorpay 256-Bit Gateway</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        minHeight: '100vh',
    },
    heroSection: {
        position: 'relative',
        padding: '4rem 1.5rem 6rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    heroInner: {
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
    },
    heroContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1.15rem',
        borderRadius: '9999px',
        background: 'rgba(56, 189, 248, 0.12)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        color: '#38BDF8',
        fontSize: '0.85rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
    },
    badgePulse: {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#10B981',
    },
    heroHeading: {
        fontSize: '3.6rem',
        fontWeight: 900,
        color: 'var(--text-main)',
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        margin: 0,
    },
    heroGradientText: {
        background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroDesc: {
        fontSize: '1.15rem',
        color: 'var(--text-muted)',
        maxWidth: '720px',
        lineHeight: 1.6,
        margin: '1.25rem 0 2.5rem 0',
    },
    searchConsoleCard: {
        width: '100%',
        maxWidth: '960px',
        padding: '2rem',
        borderRadius: '28px',
        boxShadow: 'var(--shadow-xl), 0 0 50px rgba(56, 189, 248, 0.15)',
        textAlign: 'left',
    },
    searchFormGrid: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.2fr 1fr auto',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    inputLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.78rem',
        fontWeight: 800,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    selectInput: {
        padding: '0.85rem 1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.92rem',
        fontWeight: 600,
    },
    dateInput: {
        padding: '0.85rem 1rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        color: 'var(--text-main)',
        fontSize: '0.92rem',
        fontWeight: 600,
    },
    searchSubmitBtn: {
        padding: '0.9rem 1.6rem',
        borderRadius: '14px',
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
    },
    heroTrustRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--glass-border)',
        flexWrap: 'wrap',
    },
    trustItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
    },
    statsSection: {
        padding: '2.5rem 1.5rem',
        background: 'var(--glass-bg-subtle)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
    },
    statsGrid: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
    },
    statBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    statNumber: {
        fontSize: '2.4rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        letterSpacing: '-0.02em',
    },
    statLabel: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
    },
    sectionWrap: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '6rem 1.5rem',
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '3.5rem',
    },
    sectionBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.85rem',
        background: 'rgba(56, 189, 248, 0.12)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '9999px',
        color: '#38BDF8',
        fontSize: '0.75rem',
        fontWeight: 800,
        marginBottom: '0.75rem',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '2.4rem',
        fontWeight: 900,
        color: 'var(--text-main)',
        letterSpacing: '-0.02em',
    },
    sectionSubtitle: {
        margin: '0.5rem 0 0 0',
        fontSize: '1rem',
        color: 'var(--text-muted)',
    },
    fleetNavRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.85rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    fleetTabBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '14px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg-subtle)',
        color: 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '0.92rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    fleetTabBtnActive: {
        fontWeight: 800,
    },
    fleetSpotlightCard: {
        padding: '3rem',
        borderRadius: '30px',
        boxShadow: 'var(--shadow-xl)',
    },
    fleetContentGrid: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '3rem',
        alignItems: 'center',
    },
    fleetTagPill: {
        display: 'inline-block',
        padding: '0.3rem 0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '0.75rem',
        fontWeight: 800,
        marginBottom: '0.85rem',
    },
    fleetCardTitle: {
        margin: 0,
        fontSize: '2.2rem',
        fontWeight: 900,
        color: 'var(--text-main)',
    },
    fleetCardDesc: {
        margin: '0.85rem 0 1.75rem 0',
        color: 'var(--text-muted)',
        fontSize: '1.05rem',
        lineHeight: 1.6,
    },
    amenitiesGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem',
    },
    amenityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
    },
    fleetSpeedDial: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
    },
    speedCircle: {
        width: '210px',
        height: '210px',
        borderRadius: '50%',
        border: '3px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--glass-bg-subtle)',
    },
    speedVal: {
        fontSize: '2rem',
        fontWeight: 900,
        color: 'var(--text-main)',
    },
    speedText: {
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    fleetSafetyBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10B981',
        fontSize: '0.82rem',
        fontWeight: 800,
    },
    corridorsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.75rem',
    },
    corridorCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '1.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    corridorBadge: {
        fontSize: '0.75rem',
        fontWeight: 800,
        color: '#38BDF8',
        background: 'rgba(56, 189, 248, 0.12)',
        padding: '0.25rem 0.65rem',
        borderRadius: '6px',
    },
    corridorFare: {
        fontSize: '1.15rem',
        fontWeight: 900,
        color: 'var(--accent-primary)',
    },
    corridorTitle: {
        margin: '0.75rem 0 0.15rem 0',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    corridorTrainType: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '0.85rem',
    },
    corridorStatsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'var(--glass-bg-subtle)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
    },
    corridorStatItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
    },
    corridorStatLabel: {
        fontSize: '0.65rem',
        color: 'var(--text-dim)',
        fontWeight: 800,
    },
    corridorStatVal: {
        fontSize: '0.82rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    techGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.75rem',
    },
    techCard: {
        padding: '2rem',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
    },
    techIconBox: {
        width: '50px',
        height: '50px',
        borderRadius: '16px',
        background: 'rgba(56, 189, 248, 0.12)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    techStatBadge: {
        fontSize: '0.82rem',
        fontWeight: 800,
        color: '#10B981',
    },
    techTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    techDesc: {
        margin: 0,
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.5,
    },
    reviewsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem',
    },
    reviewCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
    },
    starsRow: {
        display: 'flex',
        gap: '0.25rem',
    },
    reviewComment: {
        margin: 0,
        fontSize: '0.98rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        fontStyle: 'italic',
    },
    reviewAuthorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
    },
    authorAvatar: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: '0.88rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorName: {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    authorRole: {
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
    },
    authorRoute: {
        fontSize: '0.78rem',
        color: 'var(--accent-primary)',
        fontWeight: 700,
    },
    ctaSection: {
        maxWidth: '1200px',
        margin: '0 auto 6rem auto',
        padding: '0 1.5rem',
    },
    ctaCard: {
        background: 'linear-gradient(135deg, rgba(17, 27, 49, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '32px',
        padding: '4rem 2rem',
        textAlign: 'center',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 45px rgba(56, 189, 248, 0.2)',
    },
    ctaContent: {
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    ctaBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.9rem',
        borderRadius: '9999px',
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38BDF8',
        fontSize: '0.82rem',
        fontWeight: 800,
        marginBottom: '1rem',
    },
    ctaTitle: {
        margin: 0,
        fontSize: '2.8rem',
        fontWeight: 900,
        color: '#F8FAFC',
        lineHeight: 1.15,
    },
    ctaDesc: {
        margin: '1rem 0 2rem 0',
        color: '#94A3B8',
        fontSize: '1.05rem',
        lineHeight: 1.6,
    },
    ctaBtnRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    footer: {
        background: 'var(--glass-bg)',
        borderTop: '1px solid var(--glass-border)',
        padding: '4rem 1.5rem 3rem 1.5rem',
    },
    footerInner: {
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '3rem',
    },
    footerColBrand: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    footerLogo: {
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBrandName: {
        fontSize: '1.4rem',
        fontWeight: 900,
        color: 'var(--text-main)',
    },
    footerBrandText: {
        margin: 0,
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        maxWidth: '360px',
    },
    footerCopyright: {
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
    },
    footerCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    footerColTitle: {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '0.02em',
    },
    footerLink: {
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'color 0.2s ease',
    }
};

export default Landing;
