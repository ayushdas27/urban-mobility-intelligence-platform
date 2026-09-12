import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Bus, 
  CheckCircle, 
  Zap, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/summary').then(res => res.json()),
      fetch('/api/simulator/route-delays').then(res => res.json())
    ])
      .then(([summaryData, delaysData]) => {
        setSummary(summaryData);
        setDelays(delaysData);
      })
      .catch(err => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const departmentChartData = summary?.department_distribution ? Object.entries(summary.department_distribution).map(([dept, count]) => ({
    name: dept.replace(" Department", "").replace(" Wing", ""),
    count
  })) : [];

  const severityChartData = summary?.severity_distribution ? Object.entries(summary.severity_distribution).map(([sev, count]) => ({
    name: sev,
    value: count
  })) : [];

  const SEVERITY_COLORS = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#38bdf8'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono uppercase mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>PRD Section 11 · Urban Intelligence Analytics & Route Delay</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">
              Fleet Telemetry, Traffic Patterns & Infrastructure Health
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time aggregation of thousands of vehicle sensing kilometers, comparing scheduled vs observed transit travel times and department resolution efficacy.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">TOTAL EVENTS DETECTED</span>
            <AlertTriangle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 mt-2 font-mono">
            {summary?.total_events || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all public bus lines</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">ACTIVE SENSING BUSES</span>
            <Bus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            {summary?.active_buses || 5} Units
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Streaming real-time edge telemetry</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">CONSOLIDATED HOTSPOTS</span>
            <CheckCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-2 font-mono">
            {summary?.consolidated_issues || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-bus spatial clusters</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">EMERGENCY DISPATCHES</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 mt-2 font-mono">
            {summary?.emergency_dispatches || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hospital & Power hazard calls</div>
        </div>
      </div>

      {/* PRD FR-27: Route Delay Estimation Section */}
      <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              PRD FR-27 · Route Delay Estimation & Bottleneck Analysis
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Scheduled vs Actual Transit Duration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {delays.map((route) => (
            <div
              key={route.route_id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-sky-400">{route.route_id}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  route.congestion_level === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-500' :
                  route.congestion_level === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}>
                  {route.congestion_level} CONGESTION
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-3">
                {route.route_name}
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Scheduled:</span>
                  <span>{route.expected_duration_min} min</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Observed:</span>
                  <span className="font-bold">{route.observed_duration_min} min</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-amber-400 font-bold">
                  <span>Observed Delay:</span>
                  <span>+{route.delay_min} min delay</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Department Incident Workload Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Incident Severity Breakdown
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono mt-2">
            {severityChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.name] || '#94a3b8' }} />
                <span className="text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
