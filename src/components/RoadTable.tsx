import React, { useState } from 'react';
import { Road, Village, KruskalResult } from '../types/graph';
import { Trash2, Edit2, Check, X, ArrowUpDown, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface RoadTableProps {
  roads: Road[];
  villages: Village[];
  result: KruskalResult;
  isFinished: boolean;
  activeRoadId?: string;
  onDeleteRoad: (id: string) => void;
  onUpdateCost: (id: string, newCost: number) => void;
}

export const RoadTable: React.FC<RoadTableProps> = ({
  roads,
  villages,
  result,
  isFinished,
  activeRoadId,
  onDeleteRoad,
  onUpdateCost,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCostVal, setEditCostVal] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cost-asc' | 'cost-desc' | 'id'>('cost-asc');

  const villageMap = new Map<string, string>();
  villages.forEach((v) => villageMap.set(v.id, v.name));

  const mstRoadIdSet = new Set(result.mstEdges.map((r) => r.id));

  const sortedRoads = [...roads].sort((a, b) => {
    if (sortBy === 'cost-asc') return a.cost - b.cost;
    if (sortBy === 'cost-desc') return b.cost - a.cost;
    return a.id.localeCompare(b.id);
  });

  const handleStartEdit = (road: Road) => {
    setEditingId(road.id);
    setEditCostVal(road.cost.toString());
  };

  const handleSaveEdit = (roadId: string) => {
    const val = parseInt(editCostVal, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateCost(roadId, val);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Candidate Road Registry ({roads.length} routes)
          </h3>
          <p className="text-xs text-slate-500">
            All proposed road segments between villages with their budgeted construction costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'cost-asc' ? 'cost-desc' : 'cost-asc')}
            className="px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Cost {sortBy === 'cost-asc' ? '(Low to High)' : '(High to Low)'}</span>
          </button>
        </div>
      </div>

      {roads.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No roads added yet. Use the input form above or click &quot;Load Example&quot; to populate.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Road</th>
                <th className="py-2.5 px-4">Route</th>
                <th className="py-2.5 px-4">Cost</th>
                <th className="py-2.5 px-4">Algorithm Verdict</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedRoads.map((road, idx) => {
                const sourceName = villageMap.get(road.source) || road.source;
                const targetName = villageMap.get(road.target) || road.target;
                const isSelectedInMST = isFinished && mstRoadIdSet.has(road.id);
                const isRejectedInMST = isFinished && !mstRoadIdSet.has(road.id);
                const isActive = activeRoadId === road.id;

                return (
                  <tr
                    key={road.id}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-amber-50/70 font-medium'
                        : isSelectedInMST
                        ? 'bg-emerald-50/40'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      #{idx + 1}
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-1.5 font-mono">
                        <span className="w-5 h-5 rounded bg-slate-100 border border-slate-300 inline-flex items-center justify-center font-bold text-slate-700">
                          {sourceName}
                        </span>
                        <span className="text-slate-400">↔</span>
                        <span className="w-5 h-5 rounded bg-slate-100 border border-slate-300 inline-flex items-center justify-center font-bold text-slate-700">
                          {targetName}
                        </span>
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      {editingId === road.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            value={editCostVal}
                            onChange={(e) => setEditCostVal(e.target.value)}
                            className="w-16 px-2 py-0.5 border border-slate-300 rounded font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(road.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          ₹{road.cost}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          Evaluating Now
                        </span>
                      ) : isSelectedInMST ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Included in MST
                        </span>
                      ) : isRejectedInMST ? (
                        <span className="inline-flex items-center gap-1 text-rose-600">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          Cycle / Redundant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Run
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(road)}
                          title="Edit Cost"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRoad(road.id)}
                          title="Delete Road"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
