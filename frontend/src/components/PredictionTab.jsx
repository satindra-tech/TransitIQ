import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Layers, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function PredictionTab({ 
  routes = [], 
  selectedRoute = '570', 
  onSelectRoute,
  hour = 9,
  dayOfWeek = 0
}) {
  const [routeNum, setRouteNum] = useState(selectedRoute);
  const [modelMeta, setModelMeta] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom single-point prediction controls
  const [customHour, setCustomHour] = useState(hour);
  const [customDay, setCustomDay] = useState(dayOfWeek);
  const [customBuses, setCustomBuses] = useState(2);
  const [customService, setCustomService] = useState('Ordinary');

  useEffect(() => {
    if (selectedRoute) {
      setRouteNum(selectedRoute);
    }
  }, [selectedRoute]);

  // Load Model Metadata
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.model_metadata) {
          setModelMeta(data.model_metadata);
        }
      })
      .catch(err => console.error('Error fetching model meta:', err));
  }, []);

  // Fetch Route Curve and Prediction
  useEffect(() => {
    setLoading(true);
    fetch(`/api/demand-prediction?route_num=${routeNum}&hour=${customHour}&day_of_week=${customDay}&scheduled_buses=${customBuses}&service_type=${customService}`)
      .then(res => res.json())
      .then(data => {
        setPredictionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching prediction:', err);
        setLoading(false);
      });
  }, [routeNum, customHour, customDay, customBuses, customService]);

  const curveData = predictionData?.full_day_forecast?.map(pt => ({
    hour: `${pt.hour}:00`,
    demand: pt.predicted_demand,
    capacity: pt.total_capacity,
    loadRatio: Math.round(pt.load_ratio * 100),
    risk: pt.risk_level
  })) || [];

  const pointPred = predictionData?.point_prediction;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-slate-900 border border-blue-900/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" /> Module 2: AI Demand Prediction
              </span>
              <span className="text-xs text-slate-400">Random Forest Regressor</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Predictive Passenger Demand Forecasting
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Anticipates future passenger loads across Chennai MTC routes by correlating historical ridership, time of day, corridor congestion, and fleet schedules.
            </p>
          </div>

          {/* Route Selector Dropdown */}
          <div className="w-full lg:w-72 bg-slate-950/80 border border-slate-700 rounded-xl p-3 shadow-inner">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Bus Route
            </label>
            <select
              value={routeNum}
              onChange={(e) => {
                setRouteNum(e.target.value);
                onSelectRoute?.(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
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

      {/* 2. Main Forecast Curve & Interactive Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Passenger Demand Curve */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                24-Hour Passenger Demand Curve vs Fleet Capacity
              </h3>
              <p className="text-xs text-slate-400">
                Route <span className="font-mono font-bold text-cyan-300">{routeNum}</span> • Operating Hours (05:00 - 22:00)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300 font-medium">Predicted Demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                <span className="text-slate-400 font-medium">Bus Capacity</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name) => [value, name === 'demand' ? 'Predicted Demand' : 'Total Fleet Capacity']}
                />
                <Area 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#demandGrad)" 
                />
                <Area 
                  type="stepAfter" 
                  dataKey="capacity" 
                  stroke="#64748b" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#capGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar below chart */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Morning Peak Hour</span>
              <span className="text-sm font-bold font-mono text-cyan-400">08:00 - 10:00</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Evening Peak Hour</span>
              <span className="text-sm font-bold font-mono text-amber-400">17:00 - 20:00</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Corridor Classification</span>
              <span className="text-sm font-bold font-mono text-white truncate block">
                {pointPred?.corridor || 'OMR IT Expressway'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Scenario Calculator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Live Prediction Simulator
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Inspect model prediction for specific operating conditions
            </p>

            <div className="space-y-4">
              {/* Hour Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Departure Hour</span>
                  <span className="font-mono font-bold text-white">{customHour}:00 hrs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="22"
                  value={customHour}
                  onChange={(e) => setCustomHour(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Scheduled Buses Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Scheduled Buses</span>
                  <span className="font-mono font-bold text-cyan-400">{customBuses} bus(es)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={customBuses}
                  onChange={(e) => setCustomBuses(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Service Type Dropdown */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Service Type</label>
                <select
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  <option value="Ordinary">Ordinary (Capacity 60 / Vidiyal Payanam Free)</option>
                  <option value="Deluxe">Deluxe Superfast (Capacity 50)</option>
                  <option value="A/C">Air-Conditioned Volvo (Capacity 45)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prediction Result Box */}
          {pointPred && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Predicted Demand:</span>
                <span className="font-mono font-extrabold text-xl text-cyan-400">
                  {Math.round(pointPred.predicted_demand)} <span className="text-xs text-slate-400 font-normal">passengers</span>
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Available Capacity:</span>
                <span className="font-mono font-bold text-sm text-slate-200">
                  {pointPred.total_capacity} seats+stand
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Load Factor:</span>
                <span className={`px-2 py-0.5 text-xs font-bold font-mono rounded ${
                  pointPred.risk_level === 'Severely Overcrowded' 
                    ? 'bg-red-500/20 text-red-400' 
                    : pointPred.risk_level === 'Overcrowded'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {Math.round(pointPred.load_ratio * 100)}% ({pointPred.risk_level})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ML Model Transparency & Feature Importances */}
      {modelMeta && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                AI Model Architecture &amp; Feature Importances
              </h3>
              <p className="text-xs text-slate-400">
                Trained on 12,027 real Chennai MTC electronic ticketing records and corridor telemetry
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                R² Accuracy: {modelMeta.accuracy_pct}%
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                MAE: {modelMeta.mae} passengers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Feature Importance Bar List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Key Predictor Variables
              </span>
              {modelMeta.feature_importances?.slice(0, 6).map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{f.feature}</span>
                    <span className="font-mono font-bold text-cyan-400">{f.importance}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, f.importance * 1.5)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Model Details Specs */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Core Machine Learning Model:</span>
                  <span className="font-semibold text-white">{modelMeta.algorithm}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Ensemble Estimators:</span>
                  <span className="font-mono text-cyan-400 font-bold">{modelMeta.n_estimators} Decision Trees</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Active MTC Routes Trained:</span>
                  <span className="font-mono text-white font-bold">{modelMeta.total_routes_trained} routes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Root Mean Squared Error (RMSE):</span>
                  <span className="font-mono text-slate-300">{modelMeta.rmse} passengers</span>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  The model updates predictions dynamically when operators adjust departure frequency, bus types, or scheduled fleet in the What-If simulation module.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
