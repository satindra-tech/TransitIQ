import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Layers, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Info,
  CheckCircle2
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

export default function DemandForecastTab({
  routes = [],
  selectedRoute = '21G',
  onSelectRoute,
  hour = 9,
  dayOfWeek = 0
}) {
  const [routeNum, setRouteNum] = useState(selectedRoute);
  const [forecastDate, setForecastDate] = useState('2026-11-05');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(hour);
  const [forecastResult, setForecastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (selectedRoute) {
      setRouteNum(selectedRoute);
    }
  }, [selectedRoute]);

  const handleGenerateForecast = () => {
    setLoading(true);
    fetch(`/api/demand-prediction?route_num=${routeNum}&hour=${selectedTimeSlot}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setForecastResult(data);
        setGenerated(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating forecast:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleGenerateForecast();
  }, [routeNum, selectedTimeSlot, dayOfWeek]);

  const pt = forecastResult?.point_prediction;
  const capacityUtilization = pt ? Math.round((pt.predicted_demand / Math.max(1, pt.total_capacity)) * 100) : 0;
  
  // Section 10 badge mapping
  let crowdBadge = 'LOW';
  if (capacityUtilization >= 130) crowdBadge = 'CRITICAL';
  else if (capacityUtilization >= 100) crowdBadge = 'HIGH';
  else if (capacityUtilization >= 75) crowdBadge = 'MODERATE';

  const curveData = forecastResult?.full_day_forecast?.map(p => ({
    hour: `${p.hour}:00`,
    demand: Math.round(p.predicted_demand),
    capacity: p.total_capacity
  })) || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Workflow Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <StatusBadge status="AI SUGGESTED" size="sm" />
          <span className="text-xs text-slate-500 font-mono">Module 3: Demand Forecasting</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Passenger Demand Prediction
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1 mb-5">
          Predict future passenger demand by route, operating date, and time slot using Random Forest Regression.
        </p>

        {/* 4-Step User Workflow Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          {/* Step 1: Route */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              1. Select Route
            </label>
            <select
              value={routeNum}
              onChange={(e) => {
                setRouteNum(e.target.value);
                onSelectRoute?.(e.target.value);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {routes.map(r => (
                <option key={r.route_num} value={r.route_num}>
                  Route {r.route_num} ({r.origin} → {r.destination})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              2. Select Date
            </label>
            <input
              type="date"
              value={forecastDate}
              onChange={(e) => setForecastDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Step 3: Time Slot */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              3. Select Time Period
            </label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {Array.from({ length: 18 }, (_, i) => i + 5).map(h => (
                <option key={h} value={h}>
                  {h % 12 === 0 ? 12 : h % 12}:00 {h >= 12 ? 'PM' : 'AM'} { (8<=h&&h<=10)||(17<=h&&h<=20) ? '(Peak Hour)' : '' }
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Generate Action */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateForecast}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{loading ? 'Forecasting...' : 'Generate Forecast'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Output Example Card & Capacity Utilization (Section 8) */}
      {pt && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Forecast Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Forecast Summary
              </span>
              <StatusBadge status={crowdBadge} size="md" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/80">
                <span className="text-slate-500">Route Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Route {pt.route_num}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/80">
                <span className="text-slate-500">Predicted Passengers:</span>
                <span className="font-mono font-extrabold text-teal-600 dark:text-teal-400 text-base">
                  {Math.round(pt.predicted_demand)} passengers
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/80">
                <span className="text-slate-500">Available Bus Capacity:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {pt.total_capacity} seats + stand
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/80">
                <span className="text-slate-500">Capacity Utilization:</span>
                <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                  {capacityUtilization}%
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Crowd Status:</span>
                <StatusBadge status={crowdBadge} size="sm" />
              </div>
            </div>

            {/* Meter */}
            <div className="space-y-1 pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    capacityUtilization >= 130 ? 'bg-rose-500' : capacityUtilization >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, capacityUtilization * 0.7)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 block text-right font-mono">
                Threshold: &lt; 85% optimal
              </span>
            </div>
          </div>

          {/* 24-Hour Passenger Trend Line Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Route {routeNum} Demand Profile Across Operating Hours
                </h3>
                <p className="text-xs text-slate-500">Predicted passenger volumes (05:00 - 22:00 hrs)</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                  <span className="text-slate-600 dark:text-slate-300">Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="text-slate-400">Capacity</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#0d9488" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#tealGrad)" 
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="capacity" 
                    stroke="#94a3b8" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    fill="none" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. Feature 8: Explainable AI Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Explainable AI: Key Prediction Contributing Factors
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Model Accuracy: R² = 74.25%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 1 (65.1% Weight)
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Historical Baseline</h4>
            <p className="text-[11px] text-slate-500">
              Historical passenger demand for this corridor and time slot averages {Math.round(pt?.historical_avg || 68)} pax.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 2 (14.9% Weight)
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Scheduled Frequency</h4>
            <p className="text-[11px] text-slate-500">
              Active scheduled fleet: {pt?.scheduled_buses || 1} bus(es) deployed per hour on this trip.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 3 (5.2% Weight)
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Corridor Peak Rush</h4>
            <p className="text-[11px] text-slate-500">
              Congestion factor of {pt?.traffic_index || 1.35}x on {pt?.corridor || 'OMR Corridor'}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 4 (4.6% Weight)
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Service Configuration</h4>
            <p className="text-[11px] text-slate-500">
              Ordinary service with government concession / free travel scheme (Vidiyal Payanam).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
