import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  Users, 
  Bus, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import StatusBadge from './StatusBadge';

export default function SimulationTab({ 
  routes = [], 
  selectedRoute = '570', 
  hour = 9, 
  dayOfWeek = 0 
}) {
  const [routeNum, setRouteNum] = useState(selectedRoute);
  const [simHour, setSimHour] = useState(hour);
  const [additionalBuses, setAdditionalBuses] = useState(2);
  const [busType, setBusType] = useState('Standard');
  const [demandModifier, setDemandModifier] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRoute) {
      setRouteNum(selectedRoute);
    }
  }, [selectedRoute]);

  const runSimulation = () => {
    setLoading(true);
    fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route_num: routeNum,
        hour: simHour,
        day_of_week: dayOfWeek,
        additional_buses: additionalBuses,
        bus_type: busType,
        demand_modifier_pct: demandModifier
      })
    })
      .then(res => res.json())
      .then(data => {
        setSimResult(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error running simulation:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runSimulation();
  }, [routeNum, simHour, additionalBuses, busType, demandModifier]);

  const base = simResult?.baseline;
  const sim = simResult?.simulated;
  const impact = simResult?.impact;
  const hourlyCurve = simResult?.hourly_curve || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="AI SUGGESTED" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 8: What-If Simulation Sandbox</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Operational What-If Scenario Simulator
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Test the effect of adding buses, adjusting departure frequency, or managing demand shocks before deploying changes to live Chennai corridors.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Select Route
            </label>
            <select
              value={routeNum}
              onChange={(e) => setRouteNum(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              {routes.map(r => (
                <option key={r.route_num} value={r.route_num}>
                  Route {r.route_num}: {r.origin} → {r.destination}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Simulation Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Proposed Scenario Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Slider 1: Add buses */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Additional Buses:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                {additionalBuses > 0 ? `+${additionalBuses}` : additionalBuses} bus(es)
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="6"
              value={additionalBuses}
              onChange={(e) => setAdditionalBuses(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>-2</span>
              <span>0 (Keep)</span>
              <span>+6</span>
            </div>
          </div>

          {/* Selector 2: Bus type */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Bus Configuration:
            </label>
            <select
              value={busType}
              onChange={(e) => setBusType(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Standard">Standard MTC (Cap: 60)</option>
              <option value="Electric">Electric Bus (Cap: 70)</option>
              <option value="Deluxe">Deluxe Superfast (Cap: 50)</option>
              <option value="Mini-Bus">Feeder Mini-Bus (Cap: 35)</option>
            </select>
          </div>

          {/* Slider 3: Demand shock */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Demand Shock:</span>
              <span className={`font-mono font-bold ${demandModifier > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {demandModifier > 0 ? `+${demandModifier}%` : `${demandModifier}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="80"
              step="5"
              value={demandModifier}
              onChange={(e) => setDemandModifier(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>-40%</span>
              <span>0%</span>
              <span>+80%</span>
            </div>
          </div>

          {/* Slider 4: Time */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Operating Hour:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {simHour}:00 hrs
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="22"
              value={simHour}
              onChange={(e) => setSimHour(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>05:00 AM</span>
              <span>10:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section 6 Example: Current Plan vs Proposed Plan Split Cards */}
      {base && sim && impact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Plan
              </span>
              <StatusBadge 
                status={base.load_ratio >= 1.3 ? 'CRITICAL' : base.load_ratio >= 1.0 ? 'HIGH' : base.load_ratio >= 0.75 ? 'MODERATE' : 'LOW'} 
                size="md" 
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Predicted Demand:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(base.demand)} passengers</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Available Capacity:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{base.capacity} seats+stand ({base.buses} bus)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Capacity Utilization:</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">{Math.round(base.load_ratio * 100)}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Crowd Status:</span>
                <StatusBadge status={base.load_ratio >= 1.0 ? 'HIGH' : 'LOW'} size="sm" />
              </div>
            </div>

            {base.unmet_demand > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                ⚠️ {Math.round(base.unmet_demand)} unboarded passengers left waiting at stops
              </div>
            )}
          </div>

          {/* Proposed Plan Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Proposed Plan
              </span>
              <StatusBadge status={sim.load_ratio <= 1.0 ? 'WITHIN CAPACITY' : 'HIGH'} size="md" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Predicted Demand:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(sim.demand)} passengers</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Available Capacity:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{sim.capacity} seats+stand ({sim.buses} buses)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Capacity Utilization:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{Math.round(sim.load_ratio * 100)}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Crowd Status:</span>
                <StatusBadge status={sim.load_ratio <= 1.0 ? 'WITHIN CAPACITY' : 'HIGH'} size="sm" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ Passenger wait time reduced by {impact.wait_time_saved_min} mins. Feasibility: {impact.feasibility_score}%
            </div>
          </div>
        </div>
      )}

      {/* 4. Full Day Curve Comparison */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Day-Long Capacity vs Demand Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-4">Simulated fleet capacity reliably absorbs peak passenger demand</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="baseline_demand" stroke="#ef4444" strokeWidth={2} name="Baseline Demand" fill="none" />
              <Area type="monotone" dataKey="simulated_capacity" stroke="#0d9488" strokeWidth={2} name="Simulated Capacity" fill="#ccfbf1" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
