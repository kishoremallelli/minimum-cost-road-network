import React, { useState } from 'react';
import { Village, Road } from '../types/graph';
import { Plus, Shuffle, MapPin, Route, Sparkles, AlertCircle } from 'lucide-react';

interface InputPanelProps {
  villages: Village[];
  roads: Road[];
  onAddVillage: (name: string) => void;
  onAddRoad: (sourceId: string, targetId: string, cost: number) => boolean;
  onLoadPreset: (presetKey: 'default' | 'valley' | 'archipelago') => void;
  onGenerateRandom: (count: number) => void;
  onQuickVillageCountChange: (count: number) => void;
  pendingSourceId?: string | null;
  pendingTargetId?: string | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  villages,
  roads,
  onAddVillage,
  onAddRoad,
  onLoadPreset,
  onGenerateRandom,
  onQuickVillageCountChange,
  pendingSourceId,
  pendingTargetId,
}) => {
  const [newVillageName, setNewVillageName] = useState('');
  const [sourceId, setSourceId] = useState(villages[0]?.id || '');
  const [targetId, setTargetId] = useState(villages[1]?.id || '');
  const [roadCost, setRoadCost] = useState('5');
  const [villageCountInput, setVillageCountInput] = useState(villages.length.toString());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if external selection occurs (e.g., clicking on canvas nodes)
  React.useEffect(() => {
    if (pendingSourceId) setSourceId(pendingSourceId);
    if (pendingTargetId) setTargetId(pendingTargetId);
  }, [pendingSourceId, pendingTargetId]);

  // Keep dropdowns valid when villages list changes
  React.useEffect(() => {
    if (villages.length > 0 && !villages.some((v) => v.id === sourceId)) {
      setSourceId(villages[0].id);
    }
    if (villages.length > 1 && !villages.some((v) => v.id === targetId)) {
      setTargetId(villages[1]?.id || villages[0].id);
    }
    setVillageCountInput(villages.length.toString());
  }, [villages, sourceId, targetId]);

  const handleAddVillageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = newVillageName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a village name (e.g. F, Riverdale).');
      return;
    }
    if (villages.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`A village named "${trimmed}" already exists.`);
      return;
    }
    onAddVillage(trimmed);
    setNewVillageName('');
  };

  const handleAddRoadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sourceId || !targetId) {
      setErrorMessage('Please choose both a source and destination village.');
      return;
    }

    if (sourceId === targetId) {
      setErrorMessage('Cannot construct a road connecting a village to itself (self-loop).');
      return;
    }

    const costNum = parseInt(roadCost, 10);
    if (isNaN(costNum) || costNum <= 0) {
      setErrorMessage('Road construction cost must be a positive number greater than 0.');
      return;
    }

    // Check duplicate
    const alreadyExists = roads.some(
      (r) =>
        (r.source === sourceId && r.target === targetId) ||
        (r.source === targetId && r.target === sourceId)
    );

    if (alreadyExists) {
      setErrorMessage('A candidate road between these two villages already exists in the registry.');
      return;
    }

    const success = onAddRoad(sourceId, targetId, costNum);
    if (success) {
      setRoadCost('5');
    }
  };

  const handleGenerateVillagesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(villageCountInput, 10);
    if (isNaN(count) || count < 2 || count > 15) {
      setErrorMessage('Village count must be between 2 and 15.');
      return;
    }
    onQuickVillageCountChange(count);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
      {/* Error alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Preset Pickers & Quick Actions Header */}
      <div className="p-4 sm:p-5 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Network Configuration & Presets
            </h3>
            <p className="text-xs text-slate-500">
              Quickly load hackathon sample topologies or create your own custom network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onLoadPreset('default')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Benchmark (A-E)
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('valley')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Highland Valley (7)
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('archipelago')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Disconnected Warning Demo
            </button>
            <button
              type="button"
              onClick={() => onGenerateRandom(6)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors inline-flex items-center gap-1"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random 6</span>
            </button>
          </div>
        </div>

        {/* Quick Village count generator */}
        <form onSubmit={handleGenerateVillagesSubmit} className="flex items-center gap-2 max-w-sm">
          <label htmlFor="village-count" className="text-xs text-slate-600 font-medium whitespace-nowrap">
            Set Village Count:
          </label>
          <input
            id="village-count"
            type="number"
            min={2}
            max={15}
            value={villageCountInput}
            onChange={(e) => setVillageCountInput(e.target.value)}
            className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Generate Letters (A..N)
          </button>
        </form>
      </div>

      {/* Two-Column Forms: Add Village + Add Road */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Add Single Village */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>1. Add Village</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Add a new settlement node (e.g. F, G or Riverdale) to the territory map.
          </p>

          <form onSubmit={handleAddVillageSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Village F or Summit"
              maxLength={16}
              value={newVillageName}
              onChange={(e) => setNewVillageName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-md transition-all inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Village</span>
            </button>
          </form>

          {/* Quick preview of current villages */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {villages.map((v) => (
              <span
                key={v.id}
                className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded font-medium border border-slate-200"
              >
                {v.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form 2: Add Candidate Road */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
            <Route className="w-4 h-4 text-emerald-600" />
            <span>2. Add Candidate Road</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Connect two settlements and specify the estimated construction cost.
          </p>

          <form onSubmit={handleAddRoadSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Source Village
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Destination Village
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Construction Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={roadCost}
                    onChange={(e) => setRoadCost(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={villages.length < 2}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Road</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
