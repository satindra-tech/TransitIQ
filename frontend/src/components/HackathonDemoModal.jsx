import React, { useState } from 'react';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Sparkles, 
  Trophy,
  ArrowRight
} from 'lucide-react';

const DEMO_STEPS = [
  { step: 1, tab: 'dashboard', title: 'Open TransitIQ Dashboard', desc: 'Central OCC overview monitoring Chennai MTC fleet and high-volume corridors.' },
  { step: 2, tab: 'dashboard', title: 'Show Transport Overview', desc: 'Review key KPIs: Active buses, demand/capacity balance, and corridor load factors.' },
  { step: 3, tab: 'forecast', title: 'Select Target Route (Route 570 / 21G)', desc: 'Choose high-demand arterial route (CMBT to Kelambakkam Siruseri IT Corridor).' },
  { step: 4, tab: 'forecast', title: 'Generate Demand Forecast', desc: 'Run Random Forest ML model on historical ticketing, time-of-day, and traffic.' },
  { step: 5, tab: 'forecast', title: 'Show Predicted Passenger Demand', desc: 'AI forecasts 84-90 passengers/hour approaching peak morning hours.' },
  { step: 6, tab: 'forecast', title: 'Compare Demand with Available Capacity', desc: 'Scheduled capacity is only 60 passengers (Capacity Utilization = 140%).' },
  { step: 7, tab: 'forecast', title: 'Display CRITICAL Crowd Badge', desc: 'System automatically flags CRITICAL / HIGH crowd status badge.' },
  { step: 8, tab: 'alerts', title: 'Show Generated Operational Alert', desc: 'Alert ALT-101 created: Overcrowding Risk at Siruseri IT Park segment.' },
  { step: 9, tab: 'recommendations', title: 'Open Recommendation Centre', desc: 'Review AI Decision Support suggestions generated from operational rules.' },
  { step: 10, tab: 'recommendations', title: 'Review Suggested Action', desc: 'AI recommends injecting standby bus from Vadapalani Depot + compressing headway.' },
  { step: 11, tab: 'bus-allocation', title: 'Open Smart Bus Allocation Module', desc: 'Match overcrowded Route 570 with idle buses at nearby depots.' },
  { step: 12, tab: 'bus-allocation', title: 'Identify Available Standby Bus', desc: 'Bus TN-01-N-9214 identified at Vadapalani Depot with driver ready.' },
  { step: 13, tab: 'simulator', title: 'Open What-If Simulator', desc: 'Digital Twin environment to test decisions before dispatching to roads.' },
  { step: 14, tab: 'simulator', title: 'Add Bus to Proposed Plan (+1 Bus)', desc: 'Adjust additional bus slider to +1 (Total Capacity increased to 120 pax).' },
  { step: 15, tab: 'simulator', title: 'Compare Current vs Proposed Capacity', desc: 'Load ratio drops from 140% (Overcrowded) to 70% (Within Capacity).' },
  { step: 16, tab: 'simulator', title: 'Show Estimated Improvement', desc: 'Zero unboarded passengers left waiting, wait time reduced by 6.5 mins.' },
  { step: 17, tab: 'analytics', title: 'Open Analytics to Review Results', desc: 'Long-term demand trends, corridor performance, and ML accuracy report.' }
];

export default function HackathonDemoModal({ 
  isOpen, 
  onClose, 
  onNavigateTab, 
  onSelectRoute 
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === DEMO_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = DEMO_STEPS[nextIdx];
      onNavigateTab(nextStep.tab);
      if (nextStep.tab === 'forecast' || nextStep.tab === 'simulator') {
        onSelectRoute?.('570');
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      const prevStep = DEMO_STEPS[prevIdx];
      onNavigateTab(prevStep.tab);
    }
  };

  const handleJump = (idx) => {
    setCurrentStepIdx(idx);
    const step = DEMO_STEPS[idx];
    onNavigateTab(step.tab);
    if (step.tab === 'forecast' || step.tab === 'simulator') {
      onSelectRoute?.('570');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-900 border-2 border-teal-500 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              17-Step Hackathon Demo Story
            </h4>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
              Step {current.step} of 17: {current.title}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full my-3 overflow-hidden">
        <div 
          className="bg-teal-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / DEMO_STEPS.length) * 100}%` }}
        ></div>
      </div>

      {/* Body */}
      <div className="my-3 text-xs">
        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {current.desc}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          {current.step} / 17
        </span>

        {isLast ? (
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm flex items-center gap-1"
          >
            <span>Next Step</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
