import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

interface ControlDeckProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onResetSteps: () => void;
  onJumpToEnd: () => void;
  speed: number;
  onSetSpeed: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  isFinished: boolean;
  acceptedCount: number;
  targetCount: number;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBack,
  onResetSteps,
  onJumpToEnd,
  speed,
  onSetSpeed,
  currentStepIndex,
  totalSteps,
  isFinished,
  acceptedCount,
  targetCount,
}) => {
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          {/* Step Back */}
          <button
            type="button"
            onClick={onStepBack}
            disabled={currentStepIndex <= -1 || isPlaying}
            title="Step Backward"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-slate-200" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSteps === 0 || (isFinished && currentStepIndex >= totalSteps - 1)}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold transition-all inline-flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : isFinished ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Re-run</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Kruskal</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            title="Step Forward"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-slate-200" />
          </button>

          {/* Instant Solve / Jump to End */}
          <button
            type="button"
            onClick={onJumpToEnd}
            disabled={isFinished || totalSteps === 0}
            title="Instant Solve (Jump to Final Result)"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs font-medium text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instant Solve</span>
          </button>

          {/* Reset Steps */}
          <button
            type="button"
            onClick={onResetSteps}
            disabled={currentStepIndex === -1 && !isFinished}
            title="Restart Algorithm"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Speed Selector (Segmented control) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Anim Speed:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            {[
              { label: '0.5x', val: 1600 },
              { label: '1.0x', val: 900 },
              { label: '2.0x', val: 400 },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onSetSpeed(s.val)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  speed === s.val
                    ? 'bg-slate-900 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Step Progress Bar */}
        <div className="w-full lg:w-72 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium">
              {currentStepIndex >= 0
                ? `Testing Road ${currentStepIndex + 1} of ${totalSteps}`
                : 'Ready to start'}
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              MST: {acceptedCount}/{targetCount}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
