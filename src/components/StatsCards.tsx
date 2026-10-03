import React from 'react';
import { Network, GitBranch, Banknote, ShieldCheck, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { KruskalResult } from '../types/graph';

interface StatsCardsProps {
  villageCount: number;
  totalRoadsCount: number;
  result: KruskalResult;
  currentStepIndex: number; // -1 for not started, stepIndex for progress
  isFinished: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  villageCount,
  totalRoadsCount,
  result,
  currentStepIndex,
  isFinished,
}) => {
  const currentStep = currentStepIndex >= 0 && currentStepIndex < result.steps.length
    ? result.steps[currentStepIndex]
    : null;

  const roadsSelected = isFinished
    ? result.mstEdges.length
    : currentStep
    ? currentStep.mstEdgesSoFar.length
    : 0;

  const currentCost = isFinished
    ? result.totalCost
    : currentStep
    ? currentStep.mstCostSoFar
    : 0;

  const targetEdges = Math.max(0, villageCount - 1);
  const totalAllRoadsCost = result.totalOriginalCost;
  const costSavings = isFinished && result.isConnected ? Math.max(0, totalAllRoadsCost - result.totalCost) : 0;
  const savingsPct = totalAllRoadsCost > 0 ? ((costSavings / totalAllRoadsCost) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* 1. Total Villages */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Villages (V)</span>
          <Network className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {villageCount}
          </span>
          <span className="text-xs text-slate-500">settlements</span>
        </div>
      </div>

      {/* 2. Candidate Roads */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Candidate Roads (E)</span>
          <GitBranch className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalRoadsCount}
          </span>
          <span className="text-xs text-slate-500">possible routes</span>
        </div>
      </div>

      {/* 3. Roads Selected (Target V - 1) */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Roads Selected</span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {roadsSelected}
          </span>
          <span className="text-sm font-semibold text-slate-400">/</span>
          <span className="text-sm font-semibold text-slate-600 font-mono tabular-nums">
            {targetEdges}
          </span>
          <span className="text-xs text-slate-500 ml-1">
            {roadsSelected === targetEdges && targetEdges > 0 ? '(Target met)' : '(V - 1 needed)'}
          </span>
        </div>
      </div>

      {/* 4. Minimum Total Cost */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">
            {isFinished ? 'Minimum Construction Cost' : 'Current MST Cost'}
          </span>
          <Banknote className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-slate-500">₹</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {currentCost.toLocaleString()}
          </span>
          {isFinished && result.isConnected && (
            <span className="text-xs text-emerald-600 font-medium ml-1">Optimal</span>
          )}
        </div>
      </div>

      {/* 5. Budget Saved / Connectivity Status */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 md:col-span-4 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Network Status</span>
          {!result.isConnected && isFinished ? (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          )}
        </div>
        <div>
          {!result.isConnected && isFinished ? (
            <div className="text-sm font-semibold text-rose-600">
              Disconnected ({result.connectedComponentCount} islands)
            </div>
          ) : isFinished ? (
            <div>
              <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                Saved ₹{costSavings.toLocaleString()} ({savingsPct}%)
              </div>
              <div className="text-xs text-slate-500">vs building all candidate roads</div>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-700">
              {currentStepIndex >= 0 ? `Evaluating edge ${currentStepIndex + 1} of ${result.steps.length}` : 'Ready to solve'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
