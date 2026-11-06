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
  Info
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function PassengerTab({ hour = 9, dayOfWeek = 0 }) {
  const [query, setQuery] = useState('');
  const [passengerRoutes, setPassengerRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Passenger Portal Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white/20 text-teal-100 border border-white/30 backdrop-blur-sm">
              Public Passenger Portal
            </span>
            <StatusBadge status="ON TIME" size="sm" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            Chennai MTC Smart Commute
          </h2>
          <p className="text-sm text-teal-100/90 max-w-xl">
            Real-time estimated arrival times, bus crowd levels, and AI-recommended less-crowded alternative routes for your daily journey.
          </p>

          {/* Search Input Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Bus Route (e.g. 570, 21G, 23C) or Stop Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium shadow-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </div>

      {/* Live Route Bus Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Live Incoming Services ({passengerRoutes.length} Available Routes)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Updated just now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passengerRoutes.map((r, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/50 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Route {r.route_num}
                    </span>
                    <StatusBadge status={r.crowd_status} size="sm" />
                  </div>

                  <StatusBadge status={r.service_status} size="sm" />
                </div>

                {/* Terminus */}
                <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  {r.origin} → {r.destination}
                </div>
                <div className="text-[11px] text-slate-500 mb-4">
                  Corridor: {r.corridor}
                </div>

                {/* ETA Big Pill */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Next Bus Arrives in</span>
                      <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                        ~{r.eta_mins} mins
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Crowd Level</span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {r.capacity_utilization}% occupancy
                    </span>
                  </div>
                </div>
              </div>

              {/* Alternative route suggestion if crowded */}
              {r.alternative_less_crowded_route && (
                <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    💡 Faster &amp; less crowded alternative: <strong>Route {r.alternative_less_crowded_route}</strong> (Lower occupancy)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
