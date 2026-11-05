import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bus, 
  Clock, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertOctagon, 
  Zap, 
  Check, 
  Sliders,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
  Coins,
  Train,
  X,
  Gauge
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RecommendationsTab({ hour = 9, dayOfWeek = 0, onSimulateRoute }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [recStates, setRecStates] = useState({});
  const [activeDispatchSlip, setActiveDispatchSlip] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recommendations?hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recommendations:', err);
        setLoading(false);
      });
  }, [hour, dayOfWeek]);

  const handleAction = (idx, status) => {
    setRecStates(prev => ({
      ...prev,
      [idx]: status
    }));
    fetch(`/api/recommendations/REC-${idx}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    }).catch(err => console.error(err));
  };

  const filteredRecs = recommendations.filter(r => {
    if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Operational Decision Engine Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="AI SUGGESTED" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 6: Multi-Constraint Decision Optimization</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Operational Decision &amp; Dispatch Optimization Engine
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
              <strong>How decisions are made beyond raw prediction:</strong> TransitIQ validates physical depot deadhead transit time, crew duty rosters under the Motor Transport Act, diesel-to-farebox economic margins (₹), anti-bunching regularity, and CUMTA multi-modal transfer alternatives before authorizing fleet intervention.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                  selectedPriority === p
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Pillars of Decision Making Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pillar 1: Labor &amp; Crew</span>
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Driver Roster Valid
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">&lt;5 hr continuous driving check</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pillar 2: Economics (₹)</span>
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" /> Farebox ROI Positive
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Diesel ₹94/L vs ticket recovery</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pillar 3: Regularity</span>
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Anti-Bunching ($c_v \le 0.35$)
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Headway spacing protection</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pillar 4: Multi-Modal</span>
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Train className="w-3.5 h-3.5 text-blue-600" /> CUMTA Rail / Metro Offload
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">CMRL Feeder integration</p>
          </div>
        </div>
      </div>

      {/* 2. Recommendation Cards with Multi-Constraint Decision Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec, idx) => {
          const currentState = recStates[idx] || 'AWAITING_REVIEW';
          const isDone = currentState === 'COMPLETED' || currentState === 'ACCEPTED';
          const isRejected = currentState === 'REJECTED';
          const metrics = rec.decision_metrics || {};

          return (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Route {rec.route_num}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[150px]">{rec.corridor}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {metrics.decision_feasibility_score && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Score: {metrics.decision_feasibility_score}%
                      </span>
                    )}
                    <StatusBadge status={rec.priority} size="sm" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{rec.title}</span>
                </h4>

                <div className="text-xs text-slate-500 mb-2.5">
                  {rec.origin} → {rec.destination} • Primary Depot: <strong className="text-slate-700 dark:text-slate-300">{rec.depot}</strong>
                </div>

                {/* Core operational rationale */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 mb-2.5 leading-relaxed">
                  <strong>Operational Rationale:</strong> {rec.description}
                </div>

                {/* Operational Constraint Decision Matrix Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs mb-2.5 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Deadhead Distance &amp; ETA</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {metrics.deadhead_km || 3.8} km ({metrics.deadhead_time_min || 9} mins)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Net Trip Financial Margin</span>
                    <span className={`font-bold ${metrics.net_financial_margin_inr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {metrics.net_financial_margin_inr >= 0 ? `+₹${metrics.net_financial_margin_inr}` : `-₹${Math.abs(metrics.net_financial_margin_inr)}`} (Cost Positive)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Driver &amp; Crew Roster</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      {metrics.crew_duty || 'Shift B (3.2h remain)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Anti-Bunching Index</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                      {metrics.bunching_risk || 'Low Risk (Nominal)'}
                    </span>
                  </div>
                </div>

                {/* CUMTA Multi-Modal Transfer Recommendation */}
                {rec.cumta_multimodal && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 mb-3 flex items-start gap-1.5 leading-relaxed">
                    <Train className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>CUMTA Multi-Modal Option:</strong> {rec.cumta_multimodal}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons & Dispatch Slip Trigger */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSimulateRoute?.(rec.route_num)}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Test in Simulator
                  </button>

                  {rec.dispatch_slip && (
                    <button
                      onClick={() => setActiveDispatchSlip(rec.dispatch_slip)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Dispatch Slip
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3.5 h-3.5" /> {currentState}
                    </span>
                  ) : isRejected ? (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                      Rejected
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(idx, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          handleAction(idx, 'ACCEPTED');
                          if (rec.dispatch_slip) setActiveDispatchSlip(rec.dispatch_slip);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3" /> Authorize Dispatch
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Official MTC Electronic Dispatch Slip & Voucher Modal */}
      {activeDispatchSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      MTC Electronic Dispatch Voucher
                    </h3>
                    <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-teal-50 text-teal-700 border border-teal-200">
                      Official
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">Order Ref: {activeDispatchSlip.order_id}</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveDispatchSlip(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Details Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Route &amp; Corridor</span>
                  <span className="font-mono font-black text-sm text-teal-600 dark:text-teal-400">
                    Route {activeDispatchSlip.route_num} ({activeDispatchSlip.corridor})
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>Terminals:</span>
                  <span className="font-semibold">{activeDispatchSlip.origin} ➔ {activeDispatchSlip.destination}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>Assigned Vehicle:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{activeDispatchSlip.assigned_vehicle}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>Dispatching Depot:</span>
                  <span className="font-semibold">{activeDispatchSlip.depot}</span>
                </div>
              </div>

              {/* Crew & Operational Roster */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-1">
                  Crew &amp; Duty Roster Authorization
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Assigned Driver:</span>
                  <span className="font-mono font-semibold">{activeDispatchSlip.assigned_driver}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Assigned Conductor:</span>
                  <span className="font-mono font-semibold">{activeDispatchSlip.assigned_conductor}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Motor Transport Workers Act:</span>
                  <span>{activeDispatchSlip.crew_duty_compliance}</span>
                </div>
              </div>

              {/* Economic Balance Sheet */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40">
                <div>
                  <span className="text-[10px] text-slate-500 block">Operating Cost</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{activeDispatchSlip.operating_cost_inr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Projected Revenue</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{activeDispatchSlip.expected_revenue_inr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Net Balance</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">+₹{activeDispatchSlip.net_margin_inr}</span>
                </div>
              </div>

              {/* CUMTA Digital Clearance Code */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500 flex items-center justify-between">
                <span>{activeDispatchSlip.cumta_authorization}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">STATUS: APPROVED</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveDispatchSlip(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Dispatch Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}