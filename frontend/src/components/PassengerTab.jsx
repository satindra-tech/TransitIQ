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
  Navigation
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const CHENNAI_STOPS = [
  "Sholinganallur (OMR)",
  "Guindy Kathipara",
  "Madhya Kailash (Adyar)",
  "T. Nagar Bus Terminus",
  "Siruseri IT Park",
  "Tambaram Sanatorium",
  "Koyambedu (CMBT)",
  "Chennai Central (Puratchi Thalaivar)",
  "Broadway Bus Stand",
  "SRP Tools (Kandanchavadi)",
  "Velachery Vijayanagar",
  "Thiruvanmiyur R.T.O",
  "Anna Nagar West Depot",
  "Vadapalani Junction",
  "Poonamallee Terminus"
];

export default function PassengerTab({ hour = 9, dayOfWeek = 0 }) {
  const [query, setQuery] = useState('');
  const [passengerRoutes, setPassengerRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Passenger Wait Signal State
  const [selectedStop, setSelectedStop] = useState("Sholinganallur (OMR)");
  const [selectedRouteNum, setSelectedRouteNum] = useState("570");
  const [paxCount, setPaxCount] = useState(1);
  const [passengerName, setPassengerName] = useState("Daily Commuter");
  const [signalSending, setSignalSending] = useState(false);
  const [signalSuccess, setSignalSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/passenger/routes?query=${encodeURIComponent(query)}&hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setPassengerRoutes(data.routes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching passenger routes:', err);
        setLoading(false);
      });
  }, [query, hour, dayOfWeek]);

  // Submit live wait signal to operator dashboard
  const handleSendSignal = async () => {
    setSignalSending(true);
    setSignalSuccess(null);
    try {
      const res = await fetch('/api/passenger/waiting-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_num: selectedRouteNum,
          stop_name: selectedStop,
          pax_count: Number(paxCount),
          passenger_name: passengerName
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Passenger Portal Hero Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white/20 text-teal-100 border border-white/30 backdrop-blur-sm flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-300" /> Public Passenger Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Telemetry Linked
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            Chennai MTC Live Passenger Commute
          </h2>
          <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
            Check real-time bus arrival delays, view incoming vehicle locations, and <strong>signal the MTC Bus Operator Control Center directly from your bus stop</strong> to request frequency relief.
          </p>
        </div>
      </div>

      {/* 2. Interactive Curbside Stop Signal Tool (The User's Core Feature) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Signal MTC Operator from Your Bus Stop
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  Direct OCC Uplink
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you stranded or waiting at a bus stop? Send an instant live crowd signal to the Bus Operator Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Stop Selector */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Which Bus Stop are you waiting at?
            </label>
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {CHENNAI_STOPS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Route Number */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-teal-600" /> Which Bus Route are you waiting for?
            </label>
            <select
              value={selectedRouteNum}
              onChange={(e) => setSelectedRouteNum(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            >
              {["570", "21G", "5A", "23C", "48C", "11G", "70", "102", "A1", "D70"].map(r => (
                <option key={r} value={r}>Route {r}</option>
              ))}
            </select>
          </div>

          {/* Passenger Count */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-600" /> How many passengers waiting?
            </label>
            <select
              value={paxCount}
              onChange={(e) => setPaxCount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={1}>Just me (1 Passenger)</option>
              <option value={2}>2 Passengers</option>
              <option value={5}>Group (5 Passengers)</option>
              <option value={10}>Curbside Crowd (10+ Passengers)</option>
              <option value={20}>Heavy Surge (20+ Passengers Stranded)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Transmits GPS coordinates of <strong className="text-slate-700 dark:text-slate-200">{selectedStop}</strong> directly to MTC Central OCC.
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

        {/* Live Signal Confirmation Toast */}
        {signalSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm">Operator Alerted Successfully!</strong>
              <p className="text-[11px] leading-relaxed">
                MTC Control Room and incoming Route <strong>{signalSuccess.signal?.route_num}</strong> bus operators received an active alert indicating <strong>{signalSuccess.signal?.pax_count} passenger(s)</strong> are waiting at <strong>{signalSuccess.signal?.stop_name}</strong>.
              </p>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block pt-1">
                Live Signal ID: {signalSuccess.signal?.signal_id} • Status: MTC OPERATOR NOTIFIED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Live Route Bus Cards with Delays & ETA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Incoming Bus Delays &amp; Schedule Adherence ({passengerRoutes.length} Monitored Routes)
            </h3>
            <p className="text-xs text-slate-500">Comparing scheduled departure timetables with real road delays</p>
          </div>

          {/* Search bar */}
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
                  {/* Card Header */}
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

                  {/* Terminus */}
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                    {r.origin} → {r.destination}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-3">
                    Corridor: <span className="text-slate-700 dark:text-slate-300 font-medium">{r.corridor}</span>
                  </div>

                  {/* ETA & Delay Breakdown Pill */}
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

                {/* Alternative route suggestion if crowded */}
                {r.alternative_less_crowded_route && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      💡 Faster alternative: <strong>Route {r.alternative_less_crowded_route}</strong> has lower passenger crowd.
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