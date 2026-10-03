import React, { useState } from 'react';
import { KruskalStep, Village, KruskalResult } from '../types/graph';
import { Check, X, Filter, Copy, CheckCheck } from 'lucide-react';

interface StepTraceTableProps {
  steps: KruskalStep[];
  villages: Village[];
  result: KruskalResult;
  currentStepIndex: number;
  onJumpToStep: (index: number) => void;
}

export const StepTraceTable: React.FC<StepTraceTableProps> = ({
  steps,
  villages,
  result,
  currentStepIndex,
  onJumpToStep,
}) => {
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected'>('all');
  const [copied, setCopied] = useState(false);

  const villageMap = new Map<string, string>();
  villages.forEach((v) => villageMap.set(v.id, v.name));

  const filteredSteps = steps.filter((step) => {
    if (filter === 'accepted') return step.verdict === 'accepted';
    if (filter === 'rejected') return step.verdict === 'rejected';
    return true;
  });

  const handleCopySummary = () => {
    const lines = [
      '=== VILLAGE ROAD NETWORK OPTIMIZER - KRUSKAL MST REPORT ===',
      `Total Villages: ${villages.length}`,
      `Total Evaluated Roads: ${steps.length}`,
      `Selected Roads in MST (${result.mstEdges.length}):`,
      ...result.mstEdges.map((e) => {
        const u = villageMap.get(e.source) || e.source;
        const v = villageMap.get(e.target) || e.target;
        return `  • Road ${u}-${v}: ₹${e.cost}`;
      }),
      `Total Minimum Construction Cost: ₹${result.totalCost}`,
      `Connectivity Status: ${result.isConnected ? 'Fully Connected' : 'Disconnected'}`,
      '===========================================================',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Kruskal Algorithm Execution Trace & Step Log
          </h3>
          <p className="text-xs text-slate-500">
            Chronological audit of every edge tested in ascending order of cost with DSU cycle evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({steps.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('accepted')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                filter === 'accepted'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accepted ({steps.filter((s) => s.verdict === 'accepted').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('rejected')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                filter === 'rejected'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected ({steps.filter((s) => s.verdict === 'rejected').length})
            </button>
          </div>

          {/* Copy Report Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No steps generated yet. Click &quot;Run Kruskal&quot; to execute the algorithm.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Step</th>
                <th className="py-2.5 px-4">Road Tested</th>
                <th className="py-2.5 px-4">Cost</th>
                <th className="py-2.5 px-4">Decision</th>
                <th className="py-2.5 px-4">DSU Roots & Cycle Rationale</th>
                <th className="py-2.5 px-4 text-right">Running MST Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSteps.map((step) => {
                const sourceName = villageMap.get(step.road.source) || step.road.source;
                const targetName = villageMap.get(step.road.target) || step.road.target;
                const isCurrent = currentStepIndex === step.stepIndex - 1;
                const isAccepted = step.verdict === 'accepted';

                return (
                  <tr
                    key={step.stepIndex}
                    onClick={() => onJumpToStep(step.stepIndex - 1)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-amber-50/80 font-medium'
                        : isAccepted
                        ? 'hover:bg-emerald-50/30'
                        : 'hover:bg-rose-50/30'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      #{step.stepIndex}
                    </td>

                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {sourceName} — {targetName}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-slate-800 tabular-nums">
                      ₹{step.road.cost}
                    </td>

                    <td className="py-2.5 px-4">
                      {isAccepted ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ACCEPTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          REJECTED (CYCLE)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 max-w-md">
                      {step.reason}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{step.mstCostSoFar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
