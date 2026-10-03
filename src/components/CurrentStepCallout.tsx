import React from 'react';
import { KruskalStep, Village, KruskalResult } from '../types/graph';
import { CheckCircle2, XCircle, AlertTriangle, Layers, ArrowRight, Check } from 'lucide-react';

interface CurrentStepCalloutProps {
  currentStep: KruskalStep | null;
  currentStepIndex: number;
  totalSteps: number;
  result: KruskalResult;
  isFinished: boolean;
  villages: Village[];
}

export const CurrentStepCallout: React.FC<CurrentStepCalloutProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  result,
  isFinished,
  villages,
}) => {
  const villageMap = new Map<string, string>();
  villages.forEach((v) => villageMap.set(v.id, v.name));

  // If finished, show the comprehensive completion summary
  if (isFinished) {
    if (!result.isConnected) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-rose-950">
                Warning: Graph is Disconnected — No Complete MST Exists
              </h3>
              <p className="text-sm text-rose-800 mt-1 leading-relaxed">
                All candidate roads were evaluated, but the network forms {result.connectedComponentCount} isolated partitions.
                Only {result.mstEdges.length} of {villages.length - 1} required roads could be built.
                Villages cannot all reach each other without adding more candidate roads between the disconnected clusters.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-950 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Kruskal Algorithm Complete · Global Optimum Reached
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mt-0.5">
                Minimum Spanning Tree Successfully Constructed
              </h3>
              <p className="text-sm text-emerald-800 mt-1">
                Connected all {villages.length} villages using exactly {result.mstEdges.length} roads with zero redundant cycles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/80 backdrop-blur rounded-lg px-4 py-2.5 border border-emerald-200 self-start md:self-auto">
            <div>
              <div className="text-xs text-slate-500 font-medium">Selected Roads</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {result.mstEdges.length} roads
              </div>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Minimum Cost</div>
              <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                ₹{result.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not started yet
  if (!currentStep) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-700 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Ready to Execute Kruskal&apos;s Algorithm
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Run Kruskal&quot; to auto-play step-by-step cycle elimination, or use &quot;Step Forward&quot; to inspect each road.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs text-slate-400 font-mono">
          DSU Disjoint Sets: {villages.length} independent components
        </div>
      </div>
    );
  }

  // Active step in progress
  const sourceName = villageMap.get(currentStep.road.source) || currentStep.road.source;
  const targetName = villageMap.get(currentStep.road.target) || currentStep.road.target;
  const sourceRootName = villageMap.get(currentStep.sourceRoot) || currentStep.sourceRoot;
  const targetRootName = villageMap.get(currentStep.targetRoot) || currentStep.targetRoot;

  const isAccepted = currentStep.verdict === 'accepted';

  return (
    <div
      className={`border rounded-xl p-5 shadow-xs transition-all ${
        isAccepted
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/70 border-rose-200 text-rose-950'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Step identification */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isAccepted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isAccepted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <XCircle className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className={isAccepted ? 'text-emerald-700' : 'text-rose-700'}>
                Step {currentStep.stepIndex} of {totalSteps}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isAccepted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isAccepted ? 'ACCEPTED INTO MST' : 'REJECTED — CYCLE DETECTED'}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Candidate Road:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-900">
                {sourceName} — {targetName}
              </span>
              <span className="text-slate-500 font-normal">at cost</span>
              <span className="font-mono font-bold text-emerald-700">₹{currentStep.road.cost}</span>
            </h4>

            <p className="text-xs sm:text-sm mt-1.5 leading-relaxed text-slate-700">
              {currentStep.reason}
            </p>
          </div>
        </div>

        {/* DSU Inspection Panel */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-3 border border-slate-200 text-xs shrink-0 min-w-[260px]">
          <div className="font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Disjoint Set Union (DSU) Check:</span>
            <span className="font-mono text-[10px] text-slate-400">find(u) vs find(v)</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>find({sourceName}) root:</span>
              <span className="font-bold text-slate-900">{sourceRootName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>find({targetName}) root:</span>
              <span className="font-bold text-slate-900">{targetRootName}</span>
            </div>
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between font-semibold">
              <span>Status:</span>
              <span className={isAccepted ? 'text-emerald-700' : 'text-rose-700'}>
                {isAccepted ? 'Different Components → Union()' : 'Same Root → Redundant Cycle'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
