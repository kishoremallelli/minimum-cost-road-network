import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Village, Road, KruskalStep } from '../types/graph';
import { ZoomIn, ZoomOut, Maximize2, Move, HelpCircle, Check, X } from 'lucide-react';

interface GraphCanvasProps {
  villages: Village[];
  roads: Road[];
  currentStep: KruskalStep | null;
  mstEdges: Road[];
  isFinished: boolean;
  onUpdateVillagePosition: (id: string, x: number, y: number) => void;
  onSelectVillagesForRoad?: (sourceId: string, targetId: string) => void;
}

// Distinct component palette to color-code disjoint sets dynamically!
const COMPONENT_COLORS = [
  '#0284c7', // Sky
  '#16a34a', // Green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#4f46e5', // Indigo
];

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  villages,
  roads,
  currentStep,
  mstEdges,
  isFinished,
  onUpdateVillagePosition,
  onSelectVillagesForRoad,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedVillageA, setSelectedVillageA] = useState<string | null>(null);

  // Village lookup map
  const villageMap = useMemo(() => {
    const map = new Map<string, Village>();
    villages.forEach((v) => map.set(v.id, v));
    return map;
  }, [villages]);

  // Map components to colors for current step
  const villageColorMap = useMemo(() => {
    const colorMap = new Map<string, string>();
    if (!currentStep) {
      villages.forEach((v, idx) => {
        colorMap.set(v.id, COMPONENT_COLORS[idx % COMPONENT_COLORS.length]);
      });
      return colorMap;
    }

    // currentStep.components is Record<rootId, memberIds[]>
    const compRoots = Object.keys(currentStep.components);
    compRoots.forEach((root, compIdx) => {
      const color = COMPONENT_COLORS[compIdx % COMPONENT_COLORS.length];
      const members = currentStep.components[root] || [];
      members.forEach((m) => colorMap.set(m, color));
    });
    return colorMap;
  }, [villages, currentStep]);

  // Edges categorized by state
  const edgeStates = useMemo(() => {
    const activeRoadId = currentStep?.road.id;
    const acceptedRoadIds = new Set<string>();
    const rejectedRoadIds = new Set<string>();

    if (isFinished) {
      mstEdges.forEach((r) => acceptedRoadIds.add(r.id));
      // all other roads in roads list that are not in mstEdges are rejected
      roads.forEach((r) => {
        if (!acceptedRoadIds.has(r.id)) {
          rejectedRoadIds.add(r.id);
        }
      });
    } else if (currentStep) {
      currentStep.mstEdgesSoFar.forEach((r) => acceptedRoadIds.add(r.id));
      // check previous steps before current
      // we can also see if current step itself is accepted or rejected
      if (currentStep.verdict === 'accepted') {
        acceptedRoadIds.add(currentStep.road.id);
      } else if (currentStep.verdict === 'rejected') {
        rejectedRoadIds.add(currentStep.road.id);
      }
    }

    return {
      activeRoadId,
      acceptedRoadIds,
      rejectedRoadIds,
    };
  }, [currentStep, mstEdges, isFinished, roads]);

  // Center/Fit view handler
  const handleFitView = useCallback(() => {
    if (villages.length === 0) return;
    const minX = Math.min(...villages.map((v) => v.x));
    const maxX = Math.max(...villages.map((v) => v.x));
    const minY = Math.min(...villages.map((v) => v.y));
    const maxY = Math.max(...villages.map((v) => v.y));

    const width = maxX - minX || 400;
    const height = maxY - minY || 300;

    const svgWidth = 800;
    const svgHeight = 560;

    const scaleX = (svgWidth - 160) / width;
    const scaleY = (svgHeight - 160) / height;
    const newZoom = Math.max(0.6, Math.min(1.4, Math.min(scaleX, scaleY)));

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: svgWidth / 2 - midX * newZoom,
      y: svgHeight / 2 - midY * newZoom,
    });
  }, [villages]);

  // Initial fit
  useEffect(() => {
    handleFitView();
  }, [handleFitView]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan if clicking canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = Math.round((mouseX - pan.x) / zoom);
      const worldY = Math.round((mouseY - pan.y) / zoom);

      onUpdateVillagePosition(draggingNodeId, worldX, worldY);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, village: Village) => {
    e.stopPropagation();
    setDraggingNodeId(village.id);
  };

  // Interactive node click for quick road creation
  const handleNodeClick = (e: React.MouseEvent, villageId: string) => {
    e.stopPropagation();
    if (!selectedVillageA) {
      setSelectedVillageA(villageId);
    } else if (selectedVillageA === villageId) {
      setSelectedVillageA(null);
    } else {
      if (onSelectVillagesForRoad) {
        onSelectVillagesForRoad(selectedVillageA, villageId);
      }
      setSelectedVillageA(null);
    }
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner select-none">
      {/* Canvas Toolset Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFitView}
          title="Fit Network to View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <div className="text-xs text-slate-400 px-2 font-mono tabular-nums">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Helpful Hint banner */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <Move className="w-3.5 h-3.5 text-slate-400" />
        <span>Drag villages to customize layout · Click 2 villages to link road</span>
      </div>

      {/* Selected village indicator for road pairing */}
      {selectedVillageA && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-emerald-700">
          <span>Selected village: <strong>{villageMap.get(selectedVillageA)?.name}</strong></span>
          <span className="text-slate-400">· Click destination village to add road</span>
          <button
            onClick={() => setSelectedVillageA(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Edge Legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-wrap items-center gap-3 text-xs bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-slate-500 rounded-sm" />
          <span className="text-slate-400">Candidate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-amber-400 rounded-sm animate-pulse" />
          <span className="text-amber-300 font-medium">Evaluating</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-emerald-400 rounded-sm" />
          <span className="text-emerald-300 font-medium">MST Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 border-t border-rose-400 border-dashed" />
          <span className="text-rose-400">Rejected (Cycle)</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="canvas-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>

          {/* Glow Filters */}
          <filter id="glow-accepted" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-active" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Scaled & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Candidate Roads (Lines) */}
          {roads.map((road) => {
            const u = villageMap.get(road.source);
            const v = villageMap.get(road.target);
            if (!u || !v) return null;

            const isCurrentActive = edgeStates.activeRoadId === road.id;
            const isAccepted = edgeStates.acceptedRoadIds.has(road.id);
            const isRejected = edgeStates.rejectedRoadIds.has(road.id);

            // Midpoint coordinates for road label
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            // Stroke styling
            let strokeColor = '#475569'; // slate-600
            let strokeWidth = 2.5;
            let strokeDasharray = 'none';
            let filter = 'none';

            if (isCurrentActive) {
              strokeColor = '#fbbf24'; // amber-400
              strokeWidth = 4.5;
              filter = 'url(#glow-active)';
            } else if (isAccepted) {
              strokeColor = '#10b981'; // emerald-500
              strokeWidth = 4.5;
              filter = 'url(#glow-accepted)';
            } else if (isRejected) {
              strokeColor = '#f43f5e'; // rose-500
              strokeWidth = 2;
              strokeDasharray = '5,4';
            }

            return (
              <g key={road.id} className="transition-all duration-300">
                {/* Edge line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  filter={filter}
                />

                {/* Animated traveling dash on active evaluating road */}
                {isCurrentActive && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="8,12"
                    strokeLinecap="round"
                    className="animate-dash"
                  />
                )}

                {/* Cost Label Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-20"
                    y="-12"
                    width="40"
                    height="24"
                    rx="12"
                    fill={
                      isCurrentActive
                        ? '#d97706'
                        : isAccepted
                        ? '#065f46'
                        : isRejected
                        ? '#881337'
                        : '#1e293b'
                    }
                    stroke={
                      isCurrentActive
                        ? '#fbbf24'
                        : isAccepted
                        ? '#34d399'
                        : isRejected
                        ? '#fb7185'
                        : '#475569'
                    }
                    strokeWidth={isCurrentActive || isAccepted ? '1.5' : '1'}
                    className="shadow-sm"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={
                      isCurrentActive
                        ? '#ffffff'
                        : isAccepted
                        ? '#ecfdf5'
                        : isRejected
                        ? '#ffe4e6'
                        : '#e2e8f0'
                    }
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    ₹{road.cost}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 2. Village Nodes */}
          {villages.map((village) => {
            const isHovered = hoveredNodeId === village.id;
            const isSelected = selectedVillageA === village.id;
            const nodeColor = villageColorMap.get(village.id) || '#0ea5e9';

            return (
              <g
                key={village.id}
                transform={`translate(${village.x}, ${village.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, village)}
                onClick={(e) => handleNodeClick(e, village.id)}
                onMouseEnter={() => setHoveredNodeId(village.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer group"
              >
                {/* Selection halo */}
                {isSelected && (
                  <circle
                    r="32"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    className="animate-spin origin-center"
                  />
                )}

                {/* Outer shadow / touch target */}
                <circle
                  r="24"
                  fill="transparent"
                />

                {/* Main Node Circle */}
                <circle
                  r={isHovered ? 24 : 22}
                  fill="#0f172a"
                  stroke={nodeColor}
                  strokeWidth={isHovered || isSelected ? 3.5 : 2.5}
                  className="transition-all duration-150 shadow-lg"
                />

                {/* Village Core */}
                <circle
                  r={isHovered ? 16 : 14}
                  fill={nodeColor}
                  fillOpacity="0.25"
                />

                {/* Village Name Text */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {village.name}
                </text>

                {/* Village Subtitle Badge on Hover */}
                {isHovered && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-40"
                      y="-12"
                      width="80"
                      height="20"
                      rx="4"
                      fill="#020617"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="500"
                    >
                      Village {village.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
