import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Check, Clock3, MapPin, ShieldCheck, Sparkles, Train, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const fallbackStations = [
    { id: 1, name: 'Mumbai Central', code: 'BCT' }, { id: 2, name: 'Ahmedabad Junction', code: 'ADI' },
    { id: 3, name: 'New Delhi', code: 'NDLS' }, { id: 4, name: 'Bengaluru City', code: 'SBC' },
];
const highlights = [
    { icon: Zap, title: 'Book in moments', text: 'Fast search, clear fares, no detours.' },
    { icon: ShieldCheck, title: 'Seats that stay yours', text: 'Secure reservations with live availability.' },
    { icon: Clock3, title: 'Travel with a plan', text: 'Easy tickets and journey updates in one place.' },
];

export default function Landing() {
    const navigate = useNavigate();
    const { showToast } = useContext(AuthContext);
    const [stations, setStations] = useState(fallbackStations);
    const [sourceId, setSourceId] = useState('1');
    const [destinationId, setDestinationId] = useState('2');
    const [travelDate, setTravelDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); });

    useEffect(() => {
        api.get('/train/stations', { params: { page: 0, size: 100 } }).then((result) => {
            const list = result.content || result;
            if (Array.isArray(list) && list.length >= 2) { setStations(list); setSourceId(String(list[0].id)); setDestinationId(String(list[1].id)); }
        }).catch(() => { /* Popular-route defaults keep search useful offline. */ });
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        if (sourceId === destinationId) { showToast('Choose two different stations to continue.', 'warning'); return; }
        navigate(`/search?sourceStationId=${sourceId}&destinationStationId=${destinationId}&travelDate=${travelDate}`);
    };

    return <main className="landing">
        <section className="landing-hero"><div className="landing-orb landing-orb-one" /><div className="landing-orb landing-orb-two" />
            <div className="landing-shell landing-hero-grid">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                    <div className="eyebrow"><Sparkles size={14} /> India, one easy ticket at a time</div>
                    <h1>Meet <em>ChooChoo</em>.<br />Your shortcut to the good part of travel.</h1>
                    <p className="hero-copy">Find a seat, lock it in, and get going. ChooChoo makes train travel feel delightfully uncomplicated.</p>
                    <div className="hero-proof"><span><Check size={15} /> Clear fares</span><span><Check size={15} /> Secure payments</span><span><Check size={15} /> Instant tickets</span></div>
                </motion.div>
                <motion.form className="trip-card" onSubmit={handleSearch} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
                    <div className="trip-card-heading"><span>Plan a journey</span><span className="trip-status"><i /> Live availability</span></div>
                    <label>From<span className="select-wrap"><MapPin size={18} /><select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>{stations.map((station) => <option key={station.id} value={station.id}>{station.name} ({station.code})</option>)}</select></span></label>
                    <div className="route-stem"><span /><Train size={17} /><span /></div>
                    <label>To<span className="select-wrap select-destination"><MapPin size={18} /><select value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>{stations.map((station) => <option key={station.id} value={station.id}>{station.name} ({station.code})</option>)}</select></span></label>
                    <label>When<span className="select-wrap"><CalendarDays size={18} /><input type="date" min={new Date().toISOString().slice(0, 10)} value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required /></span></label>
                    <button className="journey-button" type="submit">Find my train <ArrowRight size={18} /></button>
                </motion.form>
            </div>
        </section>
        <section className="landing-shell popular-section"><div><p className="section-kicker">Popular right now</p><h2>Pick a city. We’ll handle the rails.</h2></div><button className="text-link" onClick={() => navigate('/search')}>Explore all trains <ArrowRight size={16} /></button>
            <div className="route-list">
                <article><div className="route-icon coral"><Train size={19} /></div><div><b>Mumbai → Ahmedabad</b><span>From ₹1,420 · 5h 25m</span></div><ArrowRight size={19} /></article>
                <article><div className="route-icon lilac"><Train size={19} /></div><div><b>Delhi → Varanasi</b><span>From ₹1,750 · 8h 00m</span></div><ArrowRight size={19} /></article>
                <article><div className="route-icon gold"><Train size={19} /></div><div><b>Bengaluru → Chennai</b><span>From ₹980 · 4h 15m</span></div><ArrowRight size={19} /></article>
            </div>
        </section>
        <section className="landing-shell feature-section"><p className="section-kicker">Less booking. More looking forward.</p><div className="feature-grid">{highlights.map(({ icon: Icon, title, text }) => <article key={title} className="feature-card"><Icon size={22} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className="landing-shell closing-cta"><div><p className="section-kicker">Ready when you are</p><h2>Go somewhere nice.</h2></div><button className="journey-button" onClick={() => navigate('/signup')}>Start with ChooChoo <ArrowRight size={18} /></button></section>
    </main>;
}
