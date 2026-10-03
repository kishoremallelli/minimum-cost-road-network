import React from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  onLoadBenchmark: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadBenchmark,
  onReset,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a href="#top" className="flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-tight text-white hover:text-emerald-400 transition-colors">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="whitespace-nowrap">Village Road Network Optimizer</span>
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#map-section" className="hover:text-white transition-colors">
            Interactive Network
          </a>
          <a href="#control-section" className="hover:text-white transition-colors">
            Kruskal Execution
          </a>
          <a href="#registry-section" className="hover:text-white transition-colors">
            Road Registry
          </a>
          <a href="#trace-section" className="hover:text-white transition-colors">
            Step Trace
          </a>
          <a href="#theory-section" className="hover:text-white transition-colors">
            MST Theory
          </a>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md border border-slate-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onLoadBenchmark}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-md transition-all inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Example</span>
          </button>
        </div>
      </div>
    </header>
  );
};
