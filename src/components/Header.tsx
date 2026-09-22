import React from 'react';
import { Brain, Sparkles, BookOpen, Activity, User, ShieldCheck, Cpu } from 'lucide-react';

export type AppView = 'child' | 'parent' | 'engine';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenDoc: () => void;
  knowledgeStability: number;
  criticalDebt: 'LOW' | 'MEDIUM' | 'HIGH';
  activeTrajectoryTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenDoc,
  knowledgeStability,
  criticalDebt,
  activeTrajectoryTitle,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0a0d16]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tesis */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/50 border border-indigo-400/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                Personal Intelligence OS
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                Draf v0.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Memelihara lintasan intelektual unik · Mass education tanpa standarisasi kaku
            </p>
          </div>
        </div>

        {/* View Switcher: Child vs Parent vs Engine */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            id="view-child-btn"
            onClick={() => onViewChange('child')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentView === 'child'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Child View (Eksplorasi)</span>
            <span className="sm:hidden">Child</span>
          </button>
          <button
            id="view-parent-btn"
            onClick={() => onViewChange('parent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentView === 'parent'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parent Telemetry</span>
            <span className="sm:hidden">Parent</span>
          </button>
          <button
            id="view-engine-btn"
            onClick={() => onViewChange('engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentView === 'engine'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Engine & Uji Tahap 2</span>
            <span className="md:hidden">Tahap 2</span>
          </button>
        </div>

        {/* Status Pills & Doc Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stability Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Stabilitas:</span>
            <strong className="text-emerald-300">{knowledgeStability}%</strong>
          </div>

          {/* Critical Debt Pill */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Critical Debt:</span>
            <strong className="text-emerald-400 font-bold">{criticalDebt}</strong>
          </div>

          {/* Document Reference Modal Button */}
          <button
            id="open-foundation-doc-btn"
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-lg text-xs text-indigo-300 font-medium transition shadow-sm"
            title="Buka Dokumen Fondasi Konsep & Arsitektur"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dokumen Fondasi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
