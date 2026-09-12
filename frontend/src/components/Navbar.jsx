import React from 'react';
import { 
  Bus, 
  MapPin, 
  Radio, 
  Eye, 
  Building2, 
  Layers, 
  BarChart3, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Activity,
  Play,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  liveBusCount, 
  isWsConnected, 
  soundMuted, 
  toggleSound, 
  onOpenDemoTour,
  onQuickSimulate 
}) {
  const navItems = [
    { id: 'gis', label: 'GIS Live Map', icon: MapPin, badge: liveBusCount ? `${liveBusCount} Buses` : null },
    { id: 'vision', label: 'Edge AI Vision Lab', icon: Eye, highlight: true },
    { id: 'departments', label: 'Department Queues', icon: Building2 },
    { id: 'dedup', label: 'Smart Deduplication', icon: Layers },
    { id: 'analytics', label: 'Analytics & Delays', icon: BarChart3 },
    { id: 'emergency', label: 'Emergency Center', icon: ShieldAlert },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('gis')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-[2px] flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bus className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300">
                  URBAN INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-600/40 text-sky-300 hidden sm:inline-block">
                  SIH #26124
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                AI Mobile Sensing Fleet · Edge Vision · GIS Analytics
              </p>
            </div>
          </div>

          {/* Desktop Nav items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } ${item.highlight && !isActive ? 'border border-indigo-500/30 text-indigo-300' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-slate-800 text-sky-400 px-1.5 py-0.2 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Simulate Detection Button */}
            <button
              onClick={onQuickSimulate}
              title="Simulate a new AI detection from a moving bus"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 cursor-pointer transition-all"
            >
              <Play className="w-3 h-3" />
              <span>Simulate Detection</span>
            </button>

            {/* Interactive Demo Tour Button */}
            <button
              onClick={onOpenDemoTour}
              title="Interactive Platform Walkthrough & SIH Overview"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Demo Guide</span>
            </button>

            {/* Live Telemetry Ping indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-[10px]">{isWsConnected ? 'LIVE' : 'SYNCING'}</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
