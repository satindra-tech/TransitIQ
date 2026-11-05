import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Filter, 
  Search, 
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function BusAllocationTab({ hour = 9, dayOfWeek = 0, onSimulateRoute }) {
  const [allocations, setAllocations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depotFilter, setDepotFilter] = useState('ALL');
  const [assignedSuccess, setAssignedSuccess] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/smart-allocations?hour=${hour}&day_of_week=${dayOfWeek}`).then(r => r.json()),
      fetch('/api/buses').then(r => r.json())
    ])
      .then(([allocData, busData]) => {
        setAllocations(allocData.allocations || []);
        setBuses(busData.buses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching allocation data:', err);
        setLoading(false);
      });
  }, [hour, dayOfWeek]);

  const handleAssignBus = (allocId, busReg, routeNum) => {
    setAssignedSuccess(prev => ({
      ...prev,
      [allocId]: `Bus ${busReg} successfully assigned to Route ${routeNum}. Dispatch order transmitted to depot.`
    }));
  };

  const standbyBuses = buses.filter(b => b.status === 'STANDBY_AVAILABLE');
  const activeBuses = buses.filter(b => b.status === 'ACTIVE_IN_SERVICE');
  const maintenanceBuses = buses.filter(b => b.status === 'MAINTENANCE');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="AI SUGGESTED" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 7: Smart Bus Reallocation</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Smart Bus Allocation &amp; Fleet Matching
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Automatically compares depot fleet availability with route passenger demand to suggest optimal bus reallocation, respecting depot proximity and crew readiness.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-sm font-mono">{standbyBuses.length}</span>
              <span className="text-emerald-800 dark:text-emerald-300 text-[10px]">Standby Ready</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-2.5 rounded-xl">
              <span className="text-blue-700 dark:text-blue-400 font-bold block text-sm font-mono">{activeBuses.length}</span>
              <span className="text-blue-800 dark:text-blue-300 text-[10px]">In Active Service</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl">
              <span className="text-slate-700 dark:text-slate-300 font-bold block text-sm font-mono">{maintenanceBuses.length}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Allocation Matches Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            AI-Suggested Bus-to-Route Matches ({allocations.length} Recommended)
          </h3>
          <span className="text-xs text-slate-500">Matched by depot distance &amp; demand surge</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allocations.map(item => {
            const isAssigned = !!assignedSuccess[item.allocation_id];

            return (
              <div 
                key={item.allocation_id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/50 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Route {item.route_num}
                      </span>
                      <StatusBadge status={item.current_load_ratio >= 1.3 ? 'CRITICAL' : 'HIGH'} size="sm" />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      Feasibility: <strong className="text-teal-600 dark:text-teal-400">{item.operational_feasibility_score}%</strong>
                    </span>
                  </div>

                  {/* Route & Overcrowd Context */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.origin} → {item.destination}</div>
                    <div className="text-slate-500 mt-0.5">Corridor: {item.corridor}</div>
                  </div>

                  {/* Matched Bus Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 my-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Matched Bus: {item.matched_bus.registration_no}
                      </span>
                      <StatusBadge status="LOW" size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-2">
                      <div>Depot: <strong className="text-slate-900 dark:text-white block truncate">{item.matched_bus.depot}</strong></div>
                      <div>Type: <strong className="text-slate-900 dark:text-white block truncate">{item.matched_bus.bus_type}</strong></div>
                      <div>Capacity: <strong className="text-teal-600 dark:text-teal-400 block font-mono">+{item.matched_bus.capacity} pax</strong></div>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {item.reason}
                  </p>
                </div>

                {/* Footer Action */}
                {isAssigned ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{assignedSuccess[item.allocation_id]}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                    <button
                      onClick={() => onSimulateRoute?.(item.route_num)}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      Test in Simulator →
                    </button>

                    <button
                      onClick={() => handleAssignBus(item.allocation_id, item.matched_bus.registration_no, item.route_num)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>Assign Bus to Route</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Depot Standby Fleet Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            Standby &amp; Available Fleet Registry
          </h3>
          <span className="text-xs text-slate-500">MTC Depot Spare Reserve</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Bus ID</th>
                <th className="py-2.5 px-3">Registration Plate</th>
                <th className="py-2.5 px-3">Home Depot</th>
                <th className="py-2.5 px-3">Vehicle Configuration</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Driver Duty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {standbyBuses.slice(0, 10).map((b, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{b.bus_id}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">{b.registration_no}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{b.depot}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{b.bus_type}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{b.capacity}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status="LOW" size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{b.driver_duty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
