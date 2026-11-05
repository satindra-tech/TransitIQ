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
  Sliders
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RecommendationsTab({ hour = 9, dayOfWeek = 0, onSimulateRoute }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [recStates, setRecStates] = useState({});

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
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="AI SUGGESTED" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 6: Recommendations Centre</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Operational Recommendations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Translates ML passenger demand predictions and detected bottlenecks into practical operational actions for transport operators.
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
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec, idx) => {
          const currentState = recStates[idx] || 'AWAITING_REVIEW';
          const isDone = currentState === 'COMPLETED' || currentState === 'ACCEPTED';
          const isRejected = currentState === 'REJECTED';

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

                  <StatusBadge status={rec.priority} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{rec.title}</span>
                </h4>

                <div className="text-xs text-slate-500 mb-2.5">
                  {rec.origin} → {rec.destination} • Depot: <strong className="text-slate-700 dark:text-slate-300">{rec.depot}</strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  <strong>Reason:</strong> {rec.description}
                </div>

                <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-100 dark:border-teal-800/60 mb-3">
                  <strong>Expected Impact:</strong> {rec.expected_impact}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSimulateRoute?.(rec.route_num)}
                  className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" /> Simulate First
                </button>

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
                        onClick={() => handleAction(idx, 'ACCEPTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
                      >
                        Accept Directive
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
