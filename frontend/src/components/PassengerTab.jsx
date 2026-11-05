import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Radio,
  CheckCircle2,
  Send,
  Bus,
  Zap,
  Navigation,
  Phone,
  User,
  LogOut,
  LocateFixed,
  Compass
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const CHENNAI_PRESETS = [
  { name: "OMR Sholinganallur Junction", lat: 12.9010, lon: 80.2279 },
  { name: "Guindy Kathipara Interchange", lat: 13.0067, lon: 80.2030 },
  { name: "Adyar Madhya Kailash", lat: 13.0074, lon: 80.2584 },
  { name: "T. Nagar Bus Terminus", lat: 13.0418, lon: 80.2337 },
  { name: "Tambaram Sanatorium", lat: 12.9249, lon: 80.1180 },
  { name: "Siruseri IT Park SIPCOT", lat: 12.8250, lon: 80.2180 },
  { name: "Koyambedu CMBT Transit Hub", lat: 13.0694, lon: 80.1948 }
];

export default function PassengerTab({ hour = 9, dayOfWeek = 0 }) {
  // 1. Passenger Authentication State
  const [passengerPhone, setPassengerPhone] = useState(() => {
    return localStorage.getItem('transitiq_passenger_phone') || '';
  });
  const [passengerName, setPassengerName] = useState(() => {
    return localStorage.getItem('transitiq_passenger_name') || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('transitiq_passenger_phone'));
  });

  // Login form inputs
  const [inputPhone, setInputPhone] = useState('98401 23456');
  const [inputName, setInputName] = useState('Karthikeyan S.');

  // 2. Location & Nearby Bus Stops State
  const [userCoords, setUserCoords] = useState({ lat: 12.9010, lon: 80.2279 }); // default OMR
  const [locationName, setLocationName] = useState('OMR Sholinganallur Junction');
  const [detectingGps, setDetectingGps] = useState(false);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);

  // 3. Route & Waiting Telemetry State
  const [query, setQuery] = useState('');
  const [passengerRoutes, setPassengerRoutes] = useState([]);
  const [selectedRouteNum, setSelectedRouteNum] = useState('570');
  const [paxCount, setPaxCount] = useState(1);
  const [signalSending, setSignalSending] = useState(false);
  const [signalSuccess, setSignalSuccess] = useState(null);

  // Fetch nearby bus stops whenever coordinates change
  useEffect(() => {
    if (userCoords) {
      fetch(`/api/passenger/nearby-stops?lat=${userCoords.lat}&lon=${userCoords.lon}&limit=8`)
        .then(r => r.json())
        .then(data => {
          const stops = data.stops || [];
          setNearbyStops(stops);
          if (stops.length > 0 && !selectedStop) {
            setSelectedStop(stops[0]);
          }
        })
        .catch(err => console.error('Error fetching nearby stops:', err));
    }
  }, [userCoords]);

  // Fetch incoming bus routes & delays
  useEffect(() => {
    fetch(`/api/passenger/routes?query=${encodeURIComponent(query)}&hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setPassengerRoutes(data.routes || []);
      })
      .catch(err => console.error(err));
  }, [query, hour, dayOfWeek]);

  // Handle Passenger Login
  const handleLogin = (e) => {
    e?.preventDefault();
    const cleanPhone = inputPhone.trim();
    const cleanName = inputName.trim() || 'Passenger';
    if (!cleanPhone) return;

    setPassengerPhone(cleanPhone);
    setPassengerName(cleanName);
    setIsLoggedIn(true);
    localStorage.setItem('transitiq_passenger_phone', cleanPhone);
    localStorage.setItem('transitiq_passenger_name', cleanName);

    // Auto detect GPS location on login
    detectLiveLocation();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassengerPhone('');
    setPassengerName('');
    localStorage.removeItem('transitiq_passenger_phone');
    localStorage.removeItem('transitiq_passenger_name');
  };

  // Browser Geolocation Detection
  const detectLiveLocation = () => {
    setDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserCoords(coords);
          setLocationName(`GPS Location (${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E)`);
          setDetectingGps(false);
        },
        (error) => {
          console.warn('Geolocation denied or unavailable, using Chennai benchmark', error);
          // Fallback to Sholinganallur
          setUserCoords({ lat: 12.9010, lon: 80.2279 });
          setLocationName('OMR Sholinganallur (Benchmarked)');
          setDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setDetectingGps(false);
    }
  };

  // Submit Waiting Signal to Operator Dashboard
  const handleSendSignal = async () => {
    if (!selectedStop) return;
    setSignalSending(true);
    setSignalSuccess(null);
    try {
      const res = await fetch('/api/passenger/waiting-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_num: selectedRouteNum,
          stop_name: selectedStop.name,
          pax_count: Number(paxCount),
          passenger_name: passengerName,
          phone_number: passengerPhone,
          user_lat: userCoords.lat,
          user_lon: userCoords.lon,
          distance_m: selectedStop.distance_m
        })
      });
      const data = await res.json();
      setSignalSuccess(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSignalSending(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW A: If NOT Logged In ➔ Show Passenger Phone Login Screen
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-6 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30 font-black">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Passenger Live Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Login with your mobile number to detect your live GPS location, find nearby bus stops, and signal the MTC Bus Operator.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mobile Number (+91)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="98401 23456"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Karthikeyan S."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
          >
            <LocateFixed className="w-4 h-4" />
            <span>Login &amp; Detect My Location</span>
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-2">Hackathon Quick Demo Fill:</span>
          <button
            type="button"
            onClick={() => {
              setInputPhone('98401 23456');
              setInputName('Karthikeyan S.');
              handleLogin();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            ⚡ Quick Demo: Login as Karthik (+91 98401 23456)
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: Logged-In Passenger Portal with GPS & Stop Selection
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Passenger Profile & GPS Hero Strip */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white/20 text-teal-100 border border-white/30 backdrop-blur-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-300" /> Commuter Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> GPS Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Hello, {passengerName}!
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 flex items-center gap-2">
              <span>Mobile: <strong className="font-mono text-white">{passengerPhone}</strong></span>
              <span>•</span>
              <span className="truncate max-w-xs">{locationName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectLiveLocation}
              disabled={detectingGps}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
              <span>{detectingGps ? 'Locating...' : 'Refresh GPS'}</span>
            </button>

            <button
              onClick={handleLogout}
              title="Logout Passenger"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 border border-white/20 text-xs font-bold transition flex items-center gap-1 text-teal-200 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Detected Live Location & Nearby Bus Stops Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 1: Select Where You Are Waiting (Nearby Bus Stops)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bus stops detected within walking distance of your live coordinates ({userCoords.lat.toFixed(4)}°, {userCoords.lon.toFixed(4)}°)
            </p>
          </div>

          {/* Quick Preset Location Simulator for Testing */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Simulate Location:</span>
            <select
              onChange={(e) => {
                const preset = CHENNAI_PRESETS.find(p => p.name === e.target.value);
                if (preset) {
                  setUserCoords({ lat: preset.lat, lon: preset.lon });
                  setLocationName(preset.name);
                }
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 font-semibold text-xs focus:outline-none"
            >
              {CHENNAI_PRESETS.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nearby Stops Horizontal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nearbyStops.map((stop, idx) => {
            const isSelected = selectedStop?.name === stop.name;

            return (
              <div
                key={idx}
                onClick={() => setSelectedStop(stop)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-400 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 font-bold border border-slate-200 dark:border-slate-700">
                      {stop.distance_m}m away
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {stop.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{stop.zone} Zone</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Walk time:</span>
                  <strong className="text-teal-700 dark:text-teal-300">~{stop.walk_time_mins} mins</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: Route Selection & Transmit Signal to Operator */}
      {selectedStop && (
        <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 2: Signal MTC Operator from <span className="text-teal-600">{selectedStop.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmits your verified mobile (+{passengerPhone}) and stop wait signal directly to the Bus Operator Command Center.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Stop Selected: {selectedStop.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Route Selector */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                Which bus route are you waiting for?
              </label>
              <select
                value={selectedRouteNum}
                onChange={(e) => setSelectedRouteNum(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {["570", "21G", "5A", "23C", "48C", "11G", "70", "102", "A1", "D70"].map(r => (
                  <option key={r} value={r}>Route {r}</option>
                ))}
              </select>
            </div>

            {/* Passenger Count */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                Number of passengers waiting with you?
              </label>
              <select
                value={paxCount}
                onChange={(e) => setPaxCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={1}>Just me (1 Passenger)</option>
                <option value={2}>2 Passengers</option>
                <option value={5}>Group (5 Passengers)</option>
                <option value={10}>Curbside Crowd (10+ Passengers Stranded)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Commuter Phone: <strong className="font-mono text-slate-700 dark:text-slate-300">{passengerPhone}</strong> • Distance to Stop: <strong className="text-teal-600">{selectedStop.distance_m}m</strong>
            </span>

            <button
              onClick={handleSendSignal}
              disabled={signalSending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {signalSending ? (
                <span>Transmitting Signal...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Signal to Bus Operator Dashboard</span>
                </>
              )}
            </button>
          </div>

          {/* Success Voucher */}
          {signalSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-sm">Operator Alerted! Commuter Signal Active</strong>
                <p className="text-[11px] leading-relaxed">
                  MTC Control Room and incoming Route <strong>{signalSuccess.signal?.route_num}</strong> operators received your telemetry: <strong>{signalSuccess.signal?.passenger_name} ({signalSuccess.signal?.phone_number})</strong> waiting at <strong>{signalSuccess.signal?.stop_name}</strong>.
                </p>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block pt-1">
                  Signal Reference: {signalSuccess.signal?.signal_id} • Status: MTC CONTROL ROOM ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Live Incoming Bus Routes & Road Delays */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Incoming Bus Delays &amp; Schedule Adherence ({passengerRoutes.length} Monitored Routes)
            </h3>
            <p className="text-xs text-slate-500">Scheduled arrival vs live road delays on Chennai transit spines</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search route (e.g. 570)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passengerRoutes.map((r, i) => {
            const delayMin = r.delay_minutes || (r.eta_mins > 12 ? Math.round(r.eta_mins * 0.7) : 4);
            const isDelayed = delayMin >= 8;

            return (
              <div 
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        Route {r.route_num}
                      </span>
                      <StatusBadge status={r.crowd_status} size="sm" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${isDelayed ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                        {isDelayed ? `+${delayMin}m Delayed` : 'On Time'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                    {r.origin} → {r.destination}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-3">
                    Corridor: <span className="text-slate-700 dark:text-slate-300 font-medium">{r.corridor}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Next Bus Arrival ETA</span>
                          <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                            ~{r.eta_mins} mins
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Traffic Delay</span>
                        <span className={`font-mono font-bold text-xs ${isDelayed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isDelayed ? `+${delayMin} mins delay` : 'Nominal Headway'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Bus Occupancy:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {r.capacity_utilization}% ({r.crowd_status})
                      </span>
                    </div>
                  </div>
                </div>

                {r.alternative_less_crowded_route && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      💡 Alternative: <strong>Route {r.alternative_less_crowded_route}</strong> has lower passenger crowd.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}