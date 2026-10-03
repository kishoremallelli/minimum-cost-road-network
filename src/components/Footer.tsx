import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-white">Village Road Network Optimizer</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>Hackathon Demonstration Project</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Minimum Spanning Tree (MST)</span>
          <span aria-hidden="true">·</span>
          <span>Kruskal&apos;s Algorithm</span>
          <span aria-hidden="true">·</span>
          <span>Disjoint Set Union (DSU)</span>
        </div>
      </div>
    </footer>
  );
};
