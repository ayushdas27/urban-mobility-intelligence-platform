import React from 'react';
import { 
  Bus, 
  Eye, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Play, 
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';

export default function DemoTourModal({ isOpen, onClose, onNavigateTab, onTriggerSimulatedEvent }) {
  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: 'Mobile Sensing Fleet',
      tag: 'PRD G1 & FR-01',
      icon: Bus,
      color: 'sky',
      description: 'Public transit buses (e.g., BUS-001 to BUS-021) continuously traverse city routes with forward-facing cameras, turning every regular passenger commute into an urban sensing patrol.',
      actionLabel: 'View Live Fleet GIS Map',
      targetTab: 'gis'
    },
    {
      step: 2,
      title: 'Edge AI Computer Vision',
      tag: 'PRD FR-06 - FR-12',
      icon: Eye,
      color: 'indigo',
      description: 'Onboard Edge AI runs lightweight YOLOv8 models to detect potholes, damaged pavements, pedestrian crossings, traffic bottlenecks, and waterlogging without transmitting high-bandwidth raw video.',
      actionLabel: 'Open Edge AI Vision Lab',
      targetTab: 'vision'
    },
    {
      step: 3,
      title: 'Smart Deduplication & Clustering',
      tag: 'PRD Section 18',
      icon: Layers,
      color: 'purple',
      description: 'When multiple buses report the same defect along a corridor within 60 meters, the cloud spatial clustering engine merges redundant reports into a single high-priority civic work order.',
      actionLabel: 'Inspect Multi-Bus Corroboration',
      targetTab: 'dedup'
    },
    {
      step: 4,
      title: 'Automated Department Routing',
      tag: 'PRD FR-14 & FR-20',
      icon: Building2,
      color: 'amber',
      description: 'Incidents are classified and dispatched immediately with strict SLA response targets to Road Maintenance, Traffic Police, Drainage/Flood Control, or TANGEDCO Electricity Board.',
      actionLabel: 'View Department Queues',
      targetTab: 'departments'
    },
    {
      step: 5,
      title: 'Emergency Automated Dispatch',
      tag: 'PRD FR-15 & FR-20',
      icon: ShieldAlert,
      color: 'red',
      description: 'Critical collisions and live electrical hazards immediately trigger automated phone calls, synthetic voice dispatches, and SMS alerts to Apollo Trauma Hospital and Power Grid safety cells.',
      actionLabel: 'Open Emergency Center',
      targetTab: 'emergency'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-teal-200 to-indigo-200">
                  SIH 2026 #26124 Interactive Walkthrough
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500 text-sky-300">
                  End-to-End Demo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Simulation Banner */}
          <div className="bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-950 p-4 rounded-xl border border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-sky-300 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Want to see the entire pipeline run right now?</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Clicking "Simulate New Detection" emits an onboard AI detection from BUS-021, routes it to the Road Maintenance Department, clusters it with nearby reports, and alerts the GIS map.
              </p>
            </div>
            <button
              onClick={() => {
                onTriggerSimulatedEvent();
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Live Event</span>
            </button>
          </div>

          {/* 5-Step Architecture Flow */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              PRD End-to-End Operational Lifecycle
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 text-[10px] font-mono font-bold flex items-center justify-center">
                            {s.step}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{s.tag}</span>
                        </div>
                        <Icon className="w-4 h-4 text-sky-400" />
                      </div>
                      <h5 className="font-bold text-sm text-slate-200 mb-1">{s.title}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigateTab(s.targetTab);
                        onClose();
                      }}
                      className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer group"
                    >
                      <span>{s.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Smart India Hackathon 2026 · Software MVP Prototype</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
