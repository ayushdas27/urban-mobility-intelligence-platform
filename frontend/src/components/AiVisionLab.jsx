import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Upload, 
  Play, 
  Send, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Sliders, 
  Terminal,
  Activity
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function AiVisionLab({ onEventIngested }) {
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('pothole_annasalai');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ingestedStatus, setIngestedStatus] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);

  // Load presets on mount
  useEffect(() => {
    fetch('/api/ai/presets')
      .then(res => res.json())
      .then(data => {
        setPresets(data);
        if (data.length > 0) {
          runPresetAnalysis('pothole_annasalai');
        }
      })
      .catch(err => console.error("Error fetching presets:", err));
  }, []);

  const runPresetAnalysis = async (scenarioKey) => {
    setLoading(true);
    setIngestedStatus(null);
    setSelectedPreset(scenarioKey);
    sounds.playBeep(650, 0.08);

    try {
      const res = await fetch(`/api/ai/analyze-preset/${scenarioKey}?auto_ingest=false`, {
        method: 'POST'
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const runCustomAnalysis = async () => {
    if (!customFile) return;
    setLoading(true);
    setIngestedStatus(null);
    sounds.playBeep(700, 0.1);

    const formData = new FormData();
    formData.append('file', customFile);
    formData.append('vehicle_id', 'BUS-021');
    formData.append('latitude', '13.0827');
    formData.append('longitude', '80.2707');
    formData.append('auto_ingest', 'false');

    try {
      const res = await fetch('/api/ai/analyze-upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Upload analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const ingestToCloud = async () => {
    if (!analysisResult) return;
    setLoading(true);
    try {
      const payload = {
        vehicle_id: analysisResult.vehicle_id || 'BUS-021',
        issue_type: analysisResult.issue_type,
        confidence: analysisResult.confidence || 0.93,
        latitude: analysisResult.latitude || 13.0478,
        longitude: analysisResult.longitude || 80.2090,
        severity: analysisResult.severity || 'MEDIUM',
        details: analysisResult.details || 'Detected via Edge AI Vision Workbench',
        image_evidence: analysisResult.annotated_image || null
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdEvent = await res.json();
        setIngestedStatus('SUCCESS');
        sounds.playBeep(980, 0.2);
        if (createdEvent.severity === 'CRITICAL') {
          sounds.playEmergencySiren();
        }
        if (onEventIngested) {
          onEventIngested(createdEvent);
        }
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
      setIngestedStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-slate-100">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-900/40">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono tracking-wide uppercase mb-1">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>PRD Section 12 · Edge AI & Computer Vision Testing Suite</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            Bus Dashcam Edge AI Inference Lab
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Simulate onboard vehicle cameras running YOLOv8 object detection, pedestrian density analysis, road defect recognition, and real-time metadata dispatch to the cloud.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <div className="text-[11px] text-slate-400 font-mono">BANDWIDTH REDUCTION</div>
            <div className="text-emerald-400 font-bold font-mono text-base">98.4% SAVED</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Scenarios & Custom Upload */}
        <div className="lg:col-span-4 space-y-5">
          {/* Preset scenarios list */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Curated Dashcam Scenarios</span>
            </h3>

            <div className="space-y-2">
              {presets.map(p => {
                const isSelected = selectedPreset === p.id && !customFile;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCustomFile(null);
                      setCustomPreview(null);
                      runPresetAnalysis(p.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/60 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-100">{p.issue_type}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        p.severity === 'CRITICAL' ? 'bg-red-950 border border-red-500 text-red-300' :
                        p.severity === 'HIGH' ? 'bg-amber-950 border border-amber-500 text-amber-300' :
                        'bg-sky-950 border border-sky-500 text-sky-300'
                      }`}>
                        {p.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.title}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>🚌 {p.vehicle_id}</span>
                      <span>Density: {p.traffic_density}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom File Upload Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Custom Road Image</span>
            </h3>

            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/20">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs text-slate-300 text-center font-medium">
                Click or drag & drop dashcam frame
              </span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 10MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            {customFile && (
              <div className="mt-3 flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-300 truncate max-w-[200px]">{customFile.name}</span>
                <button
                  onClick={runCustomAnalysis}
                  disabled={loading}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Analyze</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Vision Visualizer & FR-18 Event Payload */}
        <div className="lg:col-span-8 space-y-5">
          {/* Visualizer Canvas Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-slate-100">
                  {analysisResult?.scenario || 'Edge AI Computer Vision Detections'}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Confidence: {analysisResult ? `${(analysisResult.confidence * 100).toFixed(0)}%` : '--'}
                </span>
                <span className={`px-2 py-1 rounded border font-bold ${
                  analysisResult?.severity === 'CRITICAL' ? 'bg-red-950 border-red-600 text-red-300' :
                  analysisResult?.severity === 'HIGH' ? 'bg-amber-950 border-amber-600 text-amber-300' :
                  'bg-sky-950 border-sky-600 text-sky-300'
                }`}>
                  {analysisResult?.severity || 'MEDIUM'}
                </span>
              </div>
            </div>

            {/* Inference Preview Screen */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Activity className="w-8 h-8 text-sky-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-400">RUNNING YOLOV8 EDGE INFERENCE...</span>
                </div>
              ) : customPreview && analysisResult?.annotated_image ? (
                <img 
                  src={analysisResult.annotated_image} 
                  alt="Custom Analyzed" 
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Preset visual simulation canvas */
                <div className="w-full h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
                  {/* Simulated road background texture */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent flex justify-center">
                    <div className="w-3 h-full border-r-2 border-dashed border-amber-500/80"></div>
                  </div>

                  {/* Render Bounding Boxes */}
                  {analysisResult?.detections?.map((det, idx) => {
                    // Normalize bounding box coordinates to percentage of canvas for responsive rendering
                    const [x1, y1, x2, y2] = det.bbox;
                    const leftPct = (x1 / 640) * 100;
                    const topPct = (y1 / 360) * 100;
                    const widthPct = ((x2 - x1) / 640) * 100;
                    const heightPct = ((y2 - y1) / 360) * 100;

                    const colorClass = det.category === 'vehicle' ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300' :
                                       det.category === 'pedestrian' ? 'border-amber-400 bg-amber-500/15 text-amber-300' :
                                       det.category === 'emergency' ? 'border-red-500 bg-red-500/20 text-red-300' :
                                       'border-sky-400 bg-sky-500/15 text-sky-300';

                    return (
                      <div
                        key={idx}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`
                        }}
                        className={`absolute border-2 rounded-sm transition-all duration-300 ${colorClass}`}
                      >
                        <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap bg-slate-950 border border-current shadow-md">
                          {det.label} {det.confidence ? `${(det.confidence * 100).toFixed(0)}%` : ''}
                        </div>
                      </div>
                    );
                  })}

                  {/* Watermark telemetry */}
                  <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
                    SENSING UNIT: <span className="text-sky-400">{analysisResult?.vehicle_id}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
                    GPS: {analysisResult?.latitude?.toFixed(4)}, {analysisResult?.longitude?.toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            {/* AI Diagnostics Metrics bar */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TRAFFIC DENSITY</span>
                <span className={`text-base font-bold ${
                  analysisResult?.traffic_density === 'HIGH' ? 'text-red-400' :
                  analysisResult?.traffic_density === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {analysisResult?.traffic_density || 'NORMAL'}
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ASSIGNED DEPARTMENT</span>
                <span className="text-sm font-semibold text-sky-400 truncate block">
                  {analysisResult?.assigned_department || 'Auto Routing...'}
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">EMERGENCY WORKFLOW</span>
                <span className={`text-sm font-bold ${analysisResult?.severity === 'CRITICAL' ? 'text-red-400' : 'text-slate-400'}`}>
                  {analysisResult?.severity === 'CRITICAL' ? '🚨 AUTO CALL HOSPITAL' : 'CIVIC QUEUE'}
                </span>
              </div>
            </div>
          </div>

          {/* FR-18 Event Payload & Ingestion Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                  PRD FR-18 · Event Metadata Sent to Cloud API (POST /events)
                </h4>
              </div>

              <button
                onClick={ingestToCloud}
                disabled={loading || !analysisResult}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ingest Event to Platform</span>
              </button>
            </div>

            {ingestedStatus === 'SUCCESS' && (
              <div className="mb-3 bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Event Ingested Successfully!</strong> Routed to {analysisResult.assigned_department} and populated on the live GIS map.
                </span>
              </div>
            )}

            {/* Code Block of FR-18 Payload */}
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-[11px] font-mono text-sky-300 overflow-x-auto">
{JSON.stringify({
  vehicle_id: analysisResult?.vehicle_id || "BUS-021",
  issue_type: analysisResult?.issue_type || "Pothole",
  confidence: analysisResult?.confidence || 0.94,
  latitude: analysisResult?.latitude || 13.0478,
  longitude: analysisResult?.longitude || 80.2090,
  timestamp: new Date().toISOString(),
  severity: analysisResult?.severity || "HIGH",
  details: analysisResult?.details || "Deep asphalt cavity detected by camera.",
  traffic_density: analysisResult?.traffic_density || "MEDIUM",
  assigned_department: analysisResult?.assigned_department || "Road Maintenance Department"
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
