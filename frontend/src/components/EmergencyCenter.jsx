import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Send, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Radio, 
  CheckCircle2, 
  Zap, 
  HeartHandshake, 
  Volume2,
  RefreshCw,
  MapPin,
  Flame,
  FileText
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function EmergencyCenter({ onEmergencyTriggered }) {
  const [logs, setLogs] = useState([]);
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerSuccessMsg, setTriggerSuccessMsg] = useState(null);

  // Manual Trigger Form state
  const [selectedScenario, setSelectedScenario] = useState('accident');
  const [customDetails, setCustomDetails] = useState('');

  const EMERGENCY_SCENARIOS = [
    {
      id: 'accident',
      title: 'Major Bus & Pedestrian Collision',
      type: 'Major Road Incident / Collision',
      severity: 'CRITICAL',
      vehicleId: 'BUS-021',
      latitude: 13.0478,
      longitude: 80.2090,
      target: 'Emergency Medical & Trauma Hospital',
      details: 'Severe vehicular collision reported by front AI camera near Anna Flyover. Immediate ambulance required.'
    },
    {
      id: 'live_wire',
      title: 'High-Tension Live Wire Grounded',
      type: 'Live Wire Sparking Hazard',
      severity: 'CRITICAL',
      vehicleId: 'BUS-015',
      latitude: 13.0067,
      longitude: 80.2025,
      target: 'TANGEDCO Electricity Grid Safety Cell',
      details: 'Storm damage caused overhead power line snap. Active electrical arching on wet asphalt at Guindy intersection.'
    },
    {
      id: 'cave_in',
      title: 'Severe Road Cave-in / Collapse',
      type: 'Road Surface Cave-in',
      severity: 'HIGH',
      vehicleId: 'BUS-004',
      latitude: 13.0827,
      longitude: 80.2707,
      target: 'Traffic Police & Municipal Rapid Action Team',
      details: 'Sudden sub-surface sinkhole collapse. Roadway impassable; urgent barricading and traffic diversion requested.'
    }
  ];

  const fetchEmergencyData = async () => {
    setLoading(true);
    try {
      const [logsRes, contactsRes] = await Promise.all([
        fetch('/api/emergency/logs'),
        fetch('/api/emergency/contacts')
      ]);
      const logsData = await logsRes.json();
      const contactsData = await contactsRes.json();
      setLogs(logsData);
      setContacts(contactsData);
    } catch (err) {
      console.error("Error fetching emergency data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const handleTriggerEmergency = async () => {
    const scenario = EMERGENCY_SCENARIOS.find(s => s.id === selectedScenario) || EMERGENCY_SCENARIOS[0];
    setIsTriggering(true);
    setTriggerSuccessMsg(null);
    sounds.playEmergencySiren();

    try {
      const payload = {
        incident_type: scenario.type,
        vehicle_id: scenario.vehicleId,
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        severity: scenario.severity,
        details: customDetails.trim() || scenario.details
      };

      const res = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resultLog = await res.json();
        setTriggerSuccessMsg(`Emergency dispatch initiated! Dispatched to: ${resultLog.target_department || scenario.target}`);
        sounds.speak(`Emergency alert dispatched for ${scenario.type}`);
        fetchEmergencyData();
        if (onEmergencyTriggered) {
          onEmergencyTriggered(resultLog);
        }
      }
    } catch (err) {
      console.error("Failed to trigger emergency:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 p-6 rounded-2xl border border-red-900/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-400 text-xs font-mono uppercase mb-1">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <span>PRD FR-15 & Section 20 · Automated Emergency Communication Protocol</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">
              Emergency Response & Hospital Dispatch Operations
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              When onboard Edge AI identifies life-threatening road incidents or electrical hazards, the platform instantly triggers automated telephone calls and SMS payloads with GPS coordinates to emergency responders.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchEmergencyData}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Contacts & Trigger Sandbox) + Right Column (Live Audit Trail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Configured Emergency Contacts & Simulation Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          {/* Configured Emergency Contacts Directory */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-sky-400" />
              <span>Configured Emergency Hotlines (PRD Section 6)</span>
            </h3>

            {contacts ? (
              <div className="space-y-3">
                {/* Hospital Trauma Center */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-red-900/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center">
                      <HeartHandshake className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{contacts.hospital?.name || 'Apollo Trauma Center'}</h4>
                      <p className="text-[11px] text-slate-400">Medical Trauma & Ambulance Dispatch</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${contacts.hospital?.phone}`}
                    className="font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/60 hover:bg-red-900/50 transition-colors"
                  >
                    {contacts.hospital?.phone || '+91 44 2829 0200'}
                  </a>
                </div>

                {/* Electricity Department (TANGEDCO) */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-yellow-900/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-950/80 border border-yellow-800 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{contacts.electricity?.name || 'TANGEDCO Electricity Board'}</h4>
                      <p className="text-[11px] text-slate-400">Power Grid Spark & Live Wire Emergency</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${contacts.electricity?.phone}`}
                    className="font-mono text-xs font-bold text-yellow-400 bg-yellow-950/60 px-2.5 py-1 rounded-lg border border-yellow-800/60 hover:bg-yellow-900/50 transition-colors"
                  >
                    {contacts.electricity?.phone || '1912'}
                  </a>
                </div>

                {/* Traffic Police Control */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-900/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{contacts.police?.name || 'Greater Chennai Police'}</h4>
                      <p className="text-[11px] text-slate-400">Traffic Regulation & Incident Response</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${contacts.police?.phone}`}
                    className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/60 hover:bg-sky-900/50 transition-colors"
                  >
                    {contacts.police?.phone || '103'}
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">Loading emergency hotlines...</div>
            )}
          </div>

          {/* Emergency Trigger Sandbox */}
          <div className="bg-slate-900/90 border border-red-900/30 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Simulate Incident Dispatch (PRD Section 22)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Trigger a high-priority incident scenario to verify automated emergency notifications and siren escalation in real time.
            </p>

            <div className="space-y-2.5 mb-4">
              {EMERGENCY_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500/70 shadow-lg shadow-red-500/10 ring-1 ring-red-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{sc.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        sc.severity === 'CRITICAL' ? 'bg-red-900/80 text-red-200 border border-red-500' : 'bg-amber-900/80 text-amber-200'
                      }`}>
                        {sc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{sc.details}</p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center space-x-2">
                      <span>🚌 {sc.vehicleId}</span>
                      <span>·</span>
                      <span>Target: <strong className="text-slate-400">{sc.target}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom details */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Custom Notes / Context (Optional)</label>
              <textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="e.g., Multiple injured passengers observed; emergency medical triage requested immediately."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {triggerSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{triggerSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleTriggerEmergency}
              disabled={isTriggering}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isTriggering ? 'Transmitting Dispatch...' : 'Broadcast Emergency Alert Now'}</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Live Emergency Dispatch Logs & Call Audit Trail */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="font-extrabold text-base text-slate-100">
                  Automated Emergency Dispatch Audit Trail
                </h3>
              </div>
              <span className="text-xs font-mono bg-red-950/60 border border-red-800/50 text-red-300 px-2.5 py-1 rounded-full">
                {logs.length} Logged Events
              </span>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-[640px] pr-1">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isCallSuccessful = log.call_status === 'COMPLETED' || log.call_status === 'INITIATED';
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-950/90 border border-slate-800/90 hover:border-red-900/50 rounded-xl p-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="font-bold text-sm text-slate-200">{log.incident_type}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-600/40">
                            {log.severity}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Location & Vehicle metadata */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-sky-400 border border-slate-800">
                          {log.vehicle_id}
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</span>
                        </span>
                        <span className="text-slate-400">
                          Target: <strong className="text-slate-300">{log.target_department}</strong>
                        </span>
                      </div>

                      {/* SMS & Voice Transmission Log Box */}
                      <div className="mt-3 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs">
                        <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 flex items-center justify-between">
                          <span>SMS / Voice Transmission Payload:</span>
                          <span className={isCallSuccessful ? 'text-emerald-400' : 'text-amber-400'}>
                            Call: {log.call_status || 'SENT'} · SMS: {log.sms_status || 'DELIVERED'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                          {log.message_payload || log.details || 'Automated dispatch packet sent with incident GPS and severity assessment.'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No emergency dispatches recorded yet. Use the simulation tool on the left to test the workflow.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
