import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Bus, 
  AlertTriangle, 
  Droplet, 
  Zap, 
  ShieldAlert, 
  Car, 
  Activity, 
  Layers, 
  Maximize2, 
  Camera,
  RefreshCw,
  Navigation,
  CheckCircle2,
  List,
  Search,
  ChevronRight,
  X,
  FastForward,
  Clock
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GisMap({ events = [], vehicles = [], onSelectEvent, onStatusUpdate, onTriggerEmergency, onAdvanceSim }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const busMarkersLayerRef = useRef(null);

  const [selectedIssueType, setSelectedIssueType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [activeBusView, setActiveBusView] = useState(null);
  const [inspectEvent, setInspectEvent] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTicking, setIsTicking] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Chennai coordinates (PRD Section 23: 13.0478, 80.2350)
      const map = L.map(mapContainerRef.current, {
        center: [13.0478, 80.2350],
        zoom: 12,
        zoomControl: false
      });

      // CartoDB Dark Matter tiles (sleek, high-contrast dark theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      busMarkersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Update Event Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const filteredEvents = events.filter(e => {
      const matchType = selectedIssueType === 'ALL' || e.issue_type === selectedIssueType;
      const matchSeverity = selectedSeverity === 'ALL' || e.severity === selectedSeverity;
      return matchType && matchSeverity;
    });

    filteredEvents.forEach(event => {
      let borderColor = '#38bdf8'; // sky
      let bgGlow = 'rgba(56, 189, 248, 0.4)';
      let iconSymbol = '⚠️';

      if (event.severity === 'CRITICAL') {
        borderColor = '#ef4444';
        bgGlow = 'rgba(239, 68, 68, 0.6)';
        iconSymbol = '🚨';
      } else if (event.severity === 'HIGH') {
        borderColor = '#f97316';
        bgGlow = 'rgba(249, 115, 22, 0.5)';
        iconSymbol = '⚡';
      } else if (event.severity === 'MEDIUM') {
        borderColor = '#f59e0b';
        bgGlow = 'rgba(245, 158, 11, 0.4)';
        iconSymbol = '⚠️';
      }

      if (event.issue_type.includes('Water')) iconSymbol = '🌊';
      if (event.issue_type.includes('Traffic')) iconSymbol = '🚗';
      if (event.issue_type.includes('Electric')) iconSymbol = '⚡';
      if (event.issue_type.includes('Pothole')) iconSymbol = '🕳️';

      const customIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px;">
            ${event.severity === 'CRITICAL' ? `
              <div style="position: absolute; inset: -6px; border-radius: 9999px; background: ${bgGlow}; animation: pulse-ring 2s infinite;"></div>
            ` : ''}
            <div style="
              width: 32px;
              height: 32px;
              background: #0f172a;
              border: 2px solid ${borderColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              box-shadow: 0 0 14px ${bgGlow};
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${iconSymbol}
            </div>
            ${event.deduplicated_count > 1 ? `
              <span style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #6366f1;
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                padding: 1px 4px;
                border-radius: 9999px;
                border: 1px solid #1e1b4b;
              ">${event.deduplicated_count}x</span>
            ` : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      marker.on('click', () => {
        setInspectEvent(event);
      });

      const popupHtml = `
        <div style="min-width: 220px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; color: ${borderColor}; font-size: 13px;">${event.issue_type}</span>
            <span style="background: #1e293b; color: #94a3b8; font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px;">${event.vehicle_id}</span>
          </div>
          <p style="font-size: 11px; color: #cbd5e1; margin: 4px 0 8px 0; line-height: 1.4;">
            ${event.details || 'Detected by bus edge camera during transit route.'}
          </p>
          <div style="background: #0b0f19; padding: 6px; border-radius: 6px; font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
            <div><strong>Location:</strong> ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}</div>
            <div><strong>AI Confidence:</strong> ${(event.confidence * 100).toFixed(0)}%</div>
            <div><strong>Assigned To:</strong> <span style="color: #38bdf8;">${event.assigned_department}</span></div>
            <div><strong>Status:</strong> <span style="color: #a7f3d0; font-weight: bold;">${event.status}</span></div>
          </div>
          ${event.severity === 'CRITICAL' ? `
            <div style="background: #450a0a; border: 1px solid #991b1b; padding: 5px; border-radius: 4px; font-size: 10px; color: #fca5a5; margin-bottom: 8px;">
              🚨 <strong>Emergency Dispatched:</strong> Hospital & Authorities Alerted
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      layer.addLayer(marker);
    });
  }, [events, selectedIssueType, selectedSeverity]);

  // Update Moving Bus Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !busMarkersLayerRef.current) return;
    const busLayer = busMarkersLayerRef.current;
    busLayer.clearLayers();

    vehicles.forEach(bus => {
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; cursor: pointer;">
            <div style="
              position: absolute;
              inset: 0;
              background: rgba(14, 165, 233, 0.25);
              border-radius: 50%;
              animation: pulse-ring 2.5s infinite;
            "></div>
            <div style="
              position: absolute;
              inset: 4px;
              background: linear-gradient(135deg, #0284c7, #0369a1);
              border: 2px solid #38bdf8;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px rgba(14, 165, 233, 0.7);
            ">
              <span style="font-size: 16px; transform: rotate(${bus.heading}deg);">🚌</span>
            </div>
            <div style="
              position: absolute;
              bottom: -16px;
              left: 50%;
              transform: translateX(-50%);
              background: #0f172a;
              color: #38bdf8;
              font-size: 9px;
              font-family: monospace;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 4px;
              border: 1px solid #38bdf8;
              white-space: nowrap;
            ">
              ${bus.vehicle_id}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      const busMarker = L.marker([bus.latitude, bus.longitude], { icon: busIcon });
      busMarker.on('click', () => {
        setActiveBusView(bus);
      });

      busMarker.bindPopup(`
        <div style="min-width: 200px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #38bdf8; font-size: 13px;">${bus.vehicle_id} · Mobile Sensing Unit</strong>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            ${bus.route_name}
          </div>
          <div style="background: #0b0f19; padding: 6px; border-radius: 6px; font-size: 10px; color: #cbd5e1;">
            <div>Speed: <strong style="color: #34d399;">${bus.speed_kmh} km/h</strong></div>
            <div>Heading: <strong>${bus.heading}°</strong></div>
            <div>Camera: <strong style="color: #38bdf8;">ACTIVE (Edge AI Processing)</strong></div>
          </div>
        </div>
      `);

      busLayer.addLayer(busMarker);
    });
  }, [vehicles]);

  const handleFlyToEvent = (ev) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([ev.latitude, ev.longitude], 15, {
        duration: 1.2
      });
      setInspectEvent(ev);
    }
  };

  const handleManualAdvanceSim = async () => {
    setIsTicking(true);
    sounds.playBeep(600, 0.08);
    try {
      if (onAdvanceSim) {
        await onAdvanceSim();
      } else {
        await fetch('/api/simulator/tick', { method: 'POST' });
      }
    } catch (e) {
      console.warn("Manual tick error:", e);
    } finally {
      setIsTicking(false);
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    sounds.playBeep(820, 0.1);
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: `Updated to ${newStatus} via GIS Inspector` })
      });
      if (res.ok) {
        const updated = await res.json();
        setInspectEvent(updated);
        if (onStatusUpdate) onStatusUpdate(updated);
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const filteredDrawerEvents = events.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.issue_type.toLowerCase().includes(q) ||
      e.vehicle_id.toLowerCase().includes(q) ||
      (e.details && e.details.toLowerCase().includes(q)) ||
      (e.assigned_department && e.assigned_department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* GIS Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Filter & Controls Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 max-w-[90%] sm:max-w-xl">
        {/* Severity Filter */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center space-x-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? sev === 'CRITICAL' ? 'bg-red-500 text-white font-bold' :
                    sev === 'HIGH' ? 'bg-amber-500 text-slate-950 font-bold' :
                    'bg-sky-500 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Issue Type Filter */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center space-x-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Type:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Pothole', label: '🕳️ Potholes' },
            { id: 'Traffic Congestion', label: '🚗 Congestion' },
            { id: 'Waterlogging', label: '🌊 Flood' },
            { id: 'Electricity Hazard', label: '⚡ Electric' },
            { id: 'Critical Incident', label: '🚨 Critical' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedIssueType(type.id)}
              className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedIssueType === type.id
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Right Action Controls */}
      <div className="absolute top-4 right-14 z-10 flex items-center space-x-2">
        {/* Step Fleet Simulation Button */}
        <button
          onClick={handleManualAdvanceSim}
          disabled={isTicking}
          title="Advance bus positions along real routes"
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-semibold shadow-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <FastForward className={`w-3.5 h-3.5 text-sky-400 ${isTicking ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Step Fleet</span>
        </button>

        {/* Toggle Live Detections Drawer */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl backdrop-blur-md border shadow-xl text-xs font-semibold transition-all cursor-pointer ${
            showDrawer
              ? 'bg-sky-500 text-white border-sky-400'
              : 'bg-slate-900/95 text-slate-200 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Detections Feed</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
            {events.length}
          </span>
        </button>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 shadow-2xl hidden md:block">
        <div className="font-bold text-slate-100 mb-2 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span>Fleet GIS Telemetry Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300 flex items-center justify-center text-[8px]">🚌</span>
            <span>Mobile Sensing Bus</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-[8px]">🚨</span>
            <span className="text-red-400 font-medium">Critical Emergency</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px]">⚡</span>
            <span>High Severity Hazard</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 flex items-center justify-center text-[8px]">🕳️</span>
            <span>Road Pothole / Defect</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">🌊</span>
            <span>Waterlogged Area</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-1 py-0.5 rounded bg-indigo-900 border border-indigo-500 text-[9px] font-mono font-bold">3x</span>
            <span>Deduplicated Multi-Bus</span>
          </div>
        </div>
      </div>

      {/* Collapsible Live Detections Feed Drawer (Right Side) */}
      {showDrawer && (
        <div className="absolute top-16 right-4 bottom-6 z-20 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-100">Live Detections Feed</h4>
              <p className="text-[11px] text-slate-400">Click an incident to locate on GIS map</p>
            </div>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by issue, road, bus..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredDrawerEvents.length > 0 ? (
              filteredDrawerEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => handleFlyToEvent(ev)}
                  className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{ev.issue_type}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      ev.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/50' :
                      ev.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
                      'bg-sky-950 text-sky-300 border border-sky-500/50'
                    }`}>
                      {ev.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ev.details}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-sky-400 font-bold">{ev.vehicle_id}</span>
                    <span>{ev.assigned_department?.replace(" Department", "")}</span>
                    <span className="text-slate-500 group-hover:text-sky-300 flex items-center">
                      Locate <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No detections matching filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Event Details & Management Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {inspectEvent.issue_type.includes('Pothole') ? '🕳️' :
                   inspectEvent.issue_type.includes('Water') ? '🌊' :
                   inspectEvent.issue_type.includes('Traffic') ? '🚗' :
                   inspectEvent.issue_type.includes('Electric') ? '⚡' : '🚨'}
                </span>
                <div>
                  <h4 className="font-extrabold text-base text-slate-100">{inspectEvent.issue_type}</h4>
                  <span className="text-xs text-slate-400 font-mono">Event ID: {inspectEvent.id?.slice(0, 8)}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-mono text-[10px] uppercase mb-1">Observation Details:</div>
                <p className="text-slate-200 text-xs leading-relaxed">{inspectEvent.details || 'Detected by bus edge camera'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">SENSING VEHICLE:</span>
                  <span className="text-sky-400 font-bold text-sm">{inspectEvent.vehicle_id}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">AI CONFIDENCE:</span>
                  <span className="text-emerald-400 font-bold text-sm">{((inspectEvent.confidence || 0.9) * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">GPS COORDINATES:</span>
                  <span className="text-slate-200">{inspectEvent.latitude?.toFixed(4)}, {inspectEvent.longitude?.toFixed(4)}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">ASSIGNED DEPARTMENT:</span>
                  <span className="text-indigo-300 font-semibold">{inspectEvent.assigned_department}</span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="pt-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Update Civic Lifecycle Status (PRD FR-20):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleUpdateEventStatus(inspectEvent.id, statusOption)}
                      className={`py-1.5 px-2 rounded-xl border font-mono text-xs font-semibold cursor-pointer transition-all ${
                        inspectEvent.status === statusOption
                          ? statusOption === 'RESOLVED' ? 'bg-emerald-600 text-white border-emerald-500' :
                            statusOption === 'IN_PROGRESS' ? 'bg-amber-600 text-white border-amber-500' :
                            'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bus Dashcam Live Stream Simulation Drawer */}
      {activeBusView && (
        <div className="absolute top-16 right-4 z-20 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h4 className="font-bold text-sm text-slate-100">{activeBusView.vehicle_id} Dashcam Feed</h4>
            </div>
            <button
              onClick={() => setActiveBusView(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-900 rounded-md cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60 z-10" />
            
            <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-800 to-slate-900 flex justify-center">
                <div className="w-2 h-full border-r-2 border-dashed border-amber-400/80"></div>
              </div>
              <div className="z-10 text-center">
                <span className="text-3xl animate-bounce inline-block">🛣️</span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">EDGE AI SCANNING ROADWAY</p>
              </div>
            </div>

            <div className="absolute top-6 right-10 z-20 border border-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300">
              Vehicle: 94%
            </div>
            <div className="absolute bottom-8 left-8 z-20 border border-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300">
              Surface: Normal
            </div>

            <div className="absolute top-2 left-2 z-20 flex items-center space-x-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>REC · {activeBusView.vehicle_id}</span>
            </div>
            <div className="absolute bottom-2 right-2 z-20 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
              {activeBusView.speed_kmh} KM/H · GPS OK
            </div>
          </div>

          <div className="mt-3 text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Route:</span>
              <span className="text-slate-200 font-medium">{activeBusView.route_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Coordinates:</span>
              <span className="font-mono text-slate-300">{activeBusView.latitude.toFixed(4)}, {activeBusView.longitude.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Edge AI Status:</span>
              <span className="text-emerald-400 font-mono">YOLOv8 Real-time Inference</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
