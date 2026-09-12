import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  PhoneCall, 
  ArrowUpRight, 
  Filter,
  Wrench,
  Car,
  Droplet,
  Zap,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function DepartmentDashboard({ onStatusChange, onTriggerEmergency }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepts = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data);
      if (!selectedDeptId && data.length > 0) {
        setSelectedDeptId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleUpdateStatus = async (eventId, newStatus) => {
    sounds.playBeep(850, 0.1);
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: `Updated to ${newStatus} from department hub` })
      });
      if (res.ok) {
        fetchDepts();
        if (onStatusChange) onStatusChange();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const getDeptIcon = (name) => {
    if (name.includes('Road')) return <Wrench className="w-5 h-5 text-sky-400" />;
    if (name.includes('Traffic')) return <Car className="w-5 h-5 text-amber-400" />;
    if (name.includes('Drainage') || name.includes('Flood')) return <Droplet className="w-5 h-5 text-cyan-400" />;
    if (name.includes('Electric')) return <Zap className="w-5 h-5 text-yellow-400" />;
    if (name.includes('Medical') || name.includes('Hospital')) return <ShieldAlert className="w-5 h-5 text-red-400" />;
    return <Building2 className="w-5 h-5 text-indigo-400" />;
  };

  const activeDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Top Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono uppercase mb-1">
              <Building2 className="w-4 h-4" />
              <span>PRD FR-14 & FR-20 · Automated Department Assignment</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">
              Department Incident Queues & SLA Routing
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Incidents detected by the public bus sensing fleet are automatically classified and routed to the responsible municipal or emergency department with strict SLA tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Selection Cards (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500/80 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getDeptIcon(dept.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 leading-snug">{dept.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">SLA: {dept.sla_hours} hrs</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-sky-400 translate-x-1' : 'text-slate-600'}`} />
                </div>

                <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-400">
                    Active: <strong className="text-sky-400">{dept.active_issues}</strong>
                  </span>
                  {dept.escalated_issues > 0 && (
                    <span className="text-red-400 font-bold">
                      🚨 {dept.escalated_issues} Escalated
                    </span>
                  )}
                  <span className="text-slate-500 ml-auto">
                    Total: {dept.total_assigned}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Department Action Queue Detail (Right 8 cols) */}
        <div className="lg:col-span-8">
          {activeDept ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Department Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    {getDeptIcon(activeDept.name)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-100">{activeDept.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeDept.jurisdiction}</p>
                  </div>
                </div>

                {activeDept.emergency_contact && (
                  <div className="bg-red-950/40 border border-red-500/40 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                    <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-mono font-bold">{activeDept.emergency_contact}</span>
                  </div>
                )}
              </div>

              {/* Department Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">ACTIVE WORK ORDERS</span>
                  <span className="text-xl font-bold text-sky-400 block mt-0.5">{activeDept.active_issues}</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">RESPONSE TARGET</span>
                  <span className="text-xl font-bold text-amber-400 block mt-0.5">&lt; {activeDept.sla_hours} hrs</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">RESOLVED YTD</span>
                  <span className="text-xl font-bold text-emerald-400 block mt-0.5">{activeDept.resolved_issues}</span>
                </div>
              </div>

              {/* Incidents Queue Table */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Assigned Public Transport Sensing Queue
                </h4>

                {activeDept.latest_events && activeDept.latest_events.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeDept.latest_events.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-200">{ev.issue_type}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              ev.severity === 'CRITICAL' ? 'bg-red-950 border border-red-500 text-red-300' :
                              ev.severity === 'HIGH' ? 'bg-amber-950 border border-amber-500 text-amber-300' :
                              'bg-sky-950 border border-sky-500 text-sky-300'
                            }`}>
                              {ev.severity}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                              {ev.vehicle_id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Logged: {new Date(ev.timestamp).toLocaleTimeString()} · Status: <span className="text-slate-200 font-semibold">{ev.status}</span>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center space-x-2">
                          {ev.status !== 'IN_PROGRESS' && ev.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ev.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              In Progress
                            </button>
                          )}
                          {ev.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ev.id, 'RESOLVED')}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No open incidents currently waiting in this department queue.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-12">Loading department queues...</div>
          )}
        </div>
      </div>
    </div>
  );
}
