import React from 'react';
import { Route, CheckCircle2, ShieldAlert, Coins } from 'lucide-react';

export const ProblemBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-8 pb-10 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-2">
            <span>Hackathon Project</span>
            <span aria-hidden="true">·</span>
            <span>Graph Theory & Civil Infrastructure</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            Village Road Network Optimizer
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal mb-6">
            A government wants to connect remote rural settlements with all-weather roads. Each candidate road has a distinct construction cost. Determine the exact subset of roads to build so that every village is connected at the absolute minimum total expenditure—without redundant loops or budget waste.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Full Connectivity</div>
                <div className="text-xs text-slate-300">Every single village can reach all others directly or indirectly.</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Zero Redundant Cycles</div>
                <div className="text-xs text-slate-300">Disjoint Set Union eliminates expensive redundant loops.</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
              <Coins className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Minimum Construction Cost</div>
                <div className="text-xs text-slate-300">Greedy Kruskal ordering guarantees the global optimal minimum budget.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
