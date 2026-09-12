import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Bus, 
  TrendingUp, 
  MapPin, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function SmartDeduplication() {
  const [consolidated, setConsolidated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events/consolidated')
      .then(res => res.json())
      .then(data => {
        setConsolidated(data);
      })
      .catch(err => console.error("Error loading consolidated issues:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>PRD Section 18 · Spatial Clustering & Smart Deduplication</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">
              Multi-Vehicle Corroboration & Consolidation
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              When multiple public transit buses traverse the same corridor and detect identical road defects or hazards within 60 meters, the platform collapses redundant detections into a single high-priority work order.
            </p>
          </div>

          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <div className="text-[11px] text-slate-400 font-mono">DUPLICATE NOISE REDUCTION</div>
            <div className="text-sky-400 font-bold font-mono text-base">74.2% OPTIMIZED</div>
          </div>
        </div>
      </div>

      {/* PRD Section 18 Interactive Flow Diagram */}
      <div className="mb-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
          Architecture Flow: How 3 Raw Bus Detections Become 1 Priority Urban Work Order
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Step 1: Raw bus detections */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="text-xs font-mono text-sky-400 font-bold mb-2 flex items-center space-x-1.5">
              <span>1. DISPERSED BUS REPORTS</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <span className="font-mono text-slate-300">BUS-001 · 14:15</span>
                <span className="text-amber-400 font-mono">Pothole (91%)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <span className="font-mono text-slate-300">BUS-008 · 14:28</span>
                <span className="text-amber-400 font-mono">Pothole (94%)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <span className="font-mono text-slate-300">BUS-015 · 14:35</span>
                <span className="text-amber-400 font-mono">Pothole (93%)</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center justify-center text-slate-500 py-2">
            <div className="px-3 py-1 bg-indigo-950/60 border border-indigo-500/40 rounded-full text-[11px] font-mono text-indigo-300 mb-1">
              Spatial Radius &le; 60m
            </div>
            <ArrowRight className="w-6 h-6 text-sky-400 hidden md:block" />
          </div>

          {/* Step 2: Consolidated output */}
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-4 rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-500/10">
            <div className="text-xs font-mono text-emerald-400 font-bold mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. CONSOLIDATED WORK ORDER</span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Corroborated Reports:</span>
                <strong className="text-indigo-300 font-mono">3 Vehicles (BUS-001, 008, 015)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consolidated Confidence:</span>
                <strong className="text-emerald-400 font-mono">94% (High Certainty)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority Score Escalation:</span>
                <strong className="text-red-400 font-mono">HIGH PRIORITY (18.8 pts)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Department:</span>
                <strong className="text-sky-400">Road Maintenance Wing</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Issues Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Active Consolidated Physical Hotspots</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Clustering spatial detections...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Consolidated Hotspot</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Representative GPS</th>
                  <th className="py-3 px-4">Corroborating Buses</th>
                  <th className="py-3 px-4">Reports</th>
                  <th className="py-3 px-4">Priority Score</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {consolidated.map((issue) => (
                  <tr key={issue.cluster_id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-sky-400 font-bold">
                      {issue.cluster_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-100">{issue.issue_type}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {issue.representative_latitude.toFixed(4)}, {issue.representative_longitude.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {issue.reporting_vehicles.map((v, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs ${
                        issue.report_count > 1 ? 'bg-indigo-950 text-indigo-300 border border-indigo-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {issue.report_count}x Reports
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-mono font-bold text-amber-400">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>{issue.priority_score}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {issue.assigned_department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
