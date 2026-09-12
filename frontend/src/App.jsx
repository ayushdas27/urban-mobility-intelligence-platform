import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import GisMap from './components/GisMap';
import AiVisionLab from './components/AiVisionLab';
import DepartmentDashboard from './components/DepartmentDashboard';
import SmartDeduplication from './components/SmartDeduplication';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EmergencyCenter from './components/EmergencyCenter';
import DemoTourModal from './components/DemoTourModal';
import { sounds } from './utils/audio';
import { CheckCircle2, AlertTriangle, ShieldAlert, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('gis');
  const [events, setEvents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Add toast alert helper
  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle sound
  const toggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    sounds.muted = nextMuted;
    if (!nextMuted) {
      sounds.playBeep(880, 0.1);
    }
  };

  // Initial data loading
  const fetchAllData = useCallback(async () => {
    try {
      const [eventsRes, vehiclesRes] = await Promise.all([
        fetch('/api/events?limit=200'),
        fetch('/api/simulator/vehicles')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      }
    } catch (err) {
      console.warn("Telemetry fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // WebSocket Live Telemetry Connection with automatic reconnect & fallback
  useEffect(() => {
    let ws;
    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'FLEET_TELEMETRY_UPDATE' && data.data) {
              if (data.data.vehicles) {
                setVehicles(data.data.vehicles);
              }
              if (data.data.new_event) {
                const newEv = data.data.new_event;
                setEvents((prev) => [newEv, ...prev]);
                addToast(
                  newEv.severity === 'CRITICAL' ? 'critical' : 'info',
                  `New AI Detection: ${newEv.issue_type}`,
                  `Bus ${newEv.vehicle_id} · Assigned to ${newEv.assigned_department}`
                );
                if (newEv.severity === 'CRITICAL') {
                  sounds.playEmergencySiren();
                } else {
                  sounds.playBeep(750, 0.1);
                }
              }
            }
          } catch (e) {
            // handle string ping/pong
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWs, 4000);
        };

        ws.onerror = () => {
          setIsWsConnected(false);
        };

        wsRef.current = ws;
      } catch (err) {
        setIsWsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWs, 4000);
      }
    };

    connectWs();

    // Fallback interval polling to keep bus positions fresh even if WS is quiet
    const pollInterval = setInterval(() => {
      fetch('/api/simulator/vehicles')
        .then((res) => res.json())
        .then((vData) => {
          if (Array.isArray(vData)) setVehicles(vData);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pollInterval);
    };
  }, []);

  // Handle Event Ingestion from AI Vision Lab
  const handleNewEventIngested = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    addToast(
      newEvent.severity === 'CRITICAL' ? 'critical' : 'success',
      'AI Detection Ingested!',
      `${newEvent.issue_type} from ${newEvent.vehicle_id} routed to ${newEvent.assigned_department}`
    );
  };

  // Handle manual advance simulation step
  const handleAdvanceSim = async () => {
    try {
      const res = await fetch('/api/simulator/tick', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.new_event) {
          handleNewEventIngested(data.new_event);
        }
      }
    } catch (e) {
      console.warn("Manual tick error:", e);
    }
  };

  // Handle Quick Simulate Detection from Navbar
  const handleQuickSimulate = async () => {
    sounds.playBeep(780, 0.1);
    try {
      const presets = [
        {
          vehicle_id: 'BUS-021',
          issue_type: 'Pothole',
          confidence: 0.94,
          latitude: 13.0478,
          longitude: 80.2090,
          severity: 'HIGH',
          details: 'Fresh severe asphalt crater detected along Anna Salai corridor by bus camera.'
        },
        {
          vehicle_id: 'BUS-004',
          issue_type: 'Traffic Congestion',
          confidence: 0.91,
          latitude: 13.0418,
          longitude: 80.2341,
          severity: 'MEDIUM',
          details: 'Heavy vehicle backup approaching T. Nagar Usman Road flyover. Speed below 8 km/h.'
        },
        {
          vehicle_id: 'BUS-015',
          issue_type: 'Waterlogging',
          confidence: 0.89,
          latitude: 13.0067,
          longitude: 80.2025,
          severity: 'HIGH',
          details: 'Standing monsoon puddle over 20cm depth occupying left transit lane near Guindy.'
        }
      ];

      const sample = presets[Math.floor(Math.random() * presets.length)];
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });

      if (res.ok) {
        const created = await res.json();
        handleNewEventIngested(created);
        // Switch to GIS tab so user sees it right away
        setActiveTab('gis');
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  // Handle emergency triggered
  const handleEmergencyTriggered = (log) => {
    addToast('critical', 'EMERGENCY DISPATCH TRANSMITTED', `${log.incident_type} · ${log.target_department}`);
    fetchAllData();
  };

  // Handle event status updated
  const handleEventUpdated = (updatedEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    addToast('info', 'Status Updated', `Event marked as ${updatedEvent.status}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveBusCount={vehicles.length}
        isWsConnected={isWsConnected}
        soundMuted={soundMuted}
        toggleSound={toggleSound}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onQuickSimulate={handleQuickSimulate}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {activeTab === 'gis' && (
          <GisMap
            events={events}
            vehicles={vehicles}
            onSelectEvent={() => {}}
            onStatusUpdate={handleEventUpdated}
            onAdvanceSim={handleAdvanceSim}
          />
        )}

        {activeTab === 'vision' && (
          <AiVisionLab onEventIngested={handleNewEventIngested} />
        )}

        {activeTab === 'departments' && (
          <DepartmentDashboard
            onStatusChange={fetchAllData}
            onTriggerEmergency={handleEmergencyTriggered}
          />
        )}

        {activeTab === 'dedup' && <SmartDeduplication />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'emergency' && (
          <EmergencyCenter onEmergencyTriggered={handleEmergencyTriggered} />
        )}
      </main>

      {/* Floating Toast Alerts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start justify-between space-x-3 transition-all animate-slide-up backdrop-blur-md ${
              t.type === 'critical'
                ? 'bg-red-950/90 border-red-500 text-red-100'
                : t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                : 'bg-slate-900/95 border-sky-500/50 text-slate-100'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {t.type === 'critical' ? (
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
              ) : t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="font-bold text-xs">{t.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5">{t.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive SIH Demo Walkthrough Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
        onTriggerSimulatedEvent={handleQuickSimulate}
      />
    </div>
  );
}
