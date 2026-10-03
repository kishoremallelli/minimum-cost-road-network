import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Village, Road, KruskalResult } from './types/graph';
import { runKruskalAlgorithm } from './utils/kruskal';
import {
  PRESET_DEFAULT_EXAMPLE,
  PRESET_MOUNTAIN_VALLEY,
  PRESET_DISCONNECTED_ARCHIPELAGO,
  generateRandomNetwork,
} from './utils/presets';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { ProblemBanner } from './components/ProblemBanner';
import { StatsCards } from './components/StatsCards';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlDeck } from './components/ControlDeck';
import { CurrentStepCallout } from './components/CurrentStepCallout';
import { InputPanel } from './components/InputPanel';
import { RoadTable } from './components/RoadTable';
import { StepTraceTable } from './components/StepTraceTable';
import { EducationalSection } from './components/EducationalSection';
import { Footer } from './components/Footer';

export default function App() {
  // Network state: initial load with default benchmark dataset (A-E)
  const [villages, setVillages] = useState<Village[]>(PRESET_DEFAULT_EXAMPLE.villages);
  const [roads, setRoads] = useState<Road[]>(PRESET_DEFAULT_EXAMPLE.roads);

  // Playback & step simulation state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = initial state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(900); // 900ms default interval
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // External click selection for quick road pairing
  const [pendingPair, setPendingPair] = useState<{ source: string; target: string } | null>(null);

  // Compute full Kruskal result deterministically from state
  const kruskalResult: KruskalResult = useMemo(() => {
    return runKruskalAlgorithm(villages, roads);
  }, [villages, roads]);

  // Current step reference
  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < kruskalResult.steps.length
      ? kruskalResult.steps[currentStepIndex]
      : null;

  // Sync sound settings
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Reset execution whenever network changes
  const resetExecutionState = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setIsFinished(false);
  }, []);

  // Fire confetti celebration on optimal completion
  const triggerCelebration = useCallback(() => {
    sound.playCelebration();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#0284c7', '#fbbf24'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  // Forward one step
  const handleStepForward = useCallback(() => {
    if (kruskalResult.steps.length === 0) return;

    setCurrentStepIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < kruskalResult.steps.length) {
        const step = kruskalResult.steps[nextIndex];
        if (step.verdict === 'accepted') {
          sound.playAccepted();
        } else {
          sound.playRejected();
        }

        // Check if finished
        if (nextIndex === kruskalResult.steps.length - 1) {
          setIsFinished(true);
          setIsPlaying(false);
          if (kruskalResult.isConnected) {
            triggerCelebration();
          }
        }
        return nextIndex;
      } else {
        setIsFinished(true);
        setIsPlaying(false);
        return prev;
      }
    });
  }, [kruskalResult, triggerCelebration]);

  // Backward one step
  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setIsFinished(false);
    setCurrentStepIndex((prev) => Math.max(-1, prev - 1));
  }, []);

  // Jump to end (Instant solve)
  const handleJumpToEnd = useCallback(() => {
    setIsPlaying(false);
    if (kruskalResult.steps.length > 0) {
      setCurrentStepIndex(kruskalResult.steps.length - 1);
      setIsFinished(true);
      if (kruskalResult.isConnected) {
        triggerCelebration();
      }
    }
  }, [kruskalResult, triggerCelebration]);

  // Auto-play animation timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (currentStepIndex < kruskalResult.steps.length - 1) {
        handleStepForward();
      } else {
        setIsPlaying(false);
        setIsFinished(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, kruskalResult.steps.length, speed, handleStepForward]);

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (isFinished && currentStepIndex >= kruskalResult.steps.length - 1) {
      // Re-run from scratch
      setCurrentStepIndex(-1);
      setIsFinished(false);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  // Village management
  const handleAddVillage = (name: string) => {
    resetExecutionState();
    // Position near center with slight spread
    const centerX = 420;
    const centerY = 280;
    const angle = Math.random() * 2 * Math.PI;
    const dist = 140 + Math.random() * 60;
    const newVillage: Village = {
      id: `v_${Date.now()}`,
      name,
      x: Math.round(centerX + dist * Math.cos(angle)),
      y: Math.round(centerY + dist * Math.sin(angle)),
    };
    setVillages((prev) => [...prev, newVillage]);
  };

  const handleUpdateVillagePosition = (id: string, x: number, y: number) => {
    setVillages((prev) =>
      prev.map((v) => (v.id === id ? { ...v, x, y } : v))
    );
  };

  const handleQuickVillageCountChange = (count: number) => {
    resetExecutionState();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newVillages: Village[] = [];
    const centerX = 420;
    const centerY = 280;
    const radius = 180;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      newVillages.push({
        id: `v_${i}`,
        name: letters[i % letters.length],
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      });
    }

    // Connect adjacent nodes in ring
    const newRoads: Road[] = [];
    for (let i = 0; i < count; i++) {
      newRoads.push({
        id: `r_${i}_${(i + 1) % count}`,
        source: newVillages[i].id,
        target: newVillages[(i + 1) % count].id,
        cost: Math.floor(Math.random() * 9) + 2,
      });
    }
    // Add 1 or 2 cross shortcuts
    if (count >= 4) {
      newRoads.push({
        id: `r_cross_1`,
        source: newVillages[0].id,
        target: newVillages[Math.floor(count / 2)].id,
        cost: Math.floor(Math.random() * 12) + 3,
      });
    }

    setVillages(newVillages);
    setRoads(newRoads);
  };

  // Road management
  const handleAddRoad = (sourceId: string, targetId: string, cost: number): boolean => {
    resetExecutionState();
    const newRoad: Road = {
      id: `r_${Date.now()}`,
      source: sourceId,
      target: targetId,
      cost,
    };
    setRoads((prev) => [...prev, newRoad]);
    setPendingPair(null);
    return true;
  };

  const handleDeleteRoad = (roadId: string) => {
    resetExecutionState();
    setRoads((prev) => prev.filter((r) => r.id !== roadId));
  };

  const handleUpdateRoadCost = (roadId: string, newCost: number) => {
    resetExecutionState();
    setRoads((prev) =>
      prev.map((r) => (r.id === roadId ? { ...r, cost: newCost } : r))
    );
  };

  // Preset loaders
  const handleLoadPreset = (presetKey: 'default' | 'valley' | 'archipelago') => {
    resetExecutionState();
    if (presetKey === 'default') {
      setVillages(PRESET_DEFAULT_EXAMPLE.villages);
      setRoads(PRESET_DEFAULT_EXAMPLE.roads);
    } else if (presetKey === 'valley') {
      setVillages(PRESET_MOUNTAIN_VALLEY.villages);
      setRoads(PRESET_MOUNTAIN_VALLEY.roads);
    } else if (presetKey === 'archipelago') {
      setVillages(PRESET_DISCONNECTED_ARCHIPELAGO.villages);
      setRoads(PRESET_DISCONNECTED_ARCHIPELAGO.roads);
    }
  };

  const handleGenerateRandom = (count = 6) => {
    resetExecutionState();
    const network = generateRandomNetwork(count);
    setVillages(network.villages);
    setRoads(network.roads);
  };

  const handleReset = () => {
    resetExecutionState();
    setVillages(PRESET_DEFAULT_EXAMPLE.villages);
    setRoads(PRESET_DEFAULT_EXAMPLE.roads);
  };

  // Selecting two nodes on the canvas
  const handleSelectVillagesForRoad = (sourceId: string, targetId: string) => {
    setPendingPair({ source: sourceId, target: targetId });
  };

  const handleJumpToStep = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    if (index === kruskalResult.steps.length - 1) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  };

  const targetMSTEdgeCount = Math.max(0, villages.length - 1);
  const acceptedMSTCount = isFinished
    ? kruskalResult.mstEdges.length
    : currentStep
    ? currentStep.mstEdgesSoFar.length
    : 0;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Bar Contract compliant navigation */}
      <Header
        onLoadBenchmark={() => handleLoadPreset('default')}
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
      />

      <main className="flex-1">
        {/* Hackathon Problem Statement & Goal Banner */}
        <ProblemBanner />

        {/* Dashboard Content Container (Max width 1280px / 7xl) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Key Metric Statistics Cards */}
          <StatsCards
            villageCount={villages.length}
            totalRoadsCount={roads.length}
            result={kruskalResult}
            currentStepIndex={currentStepIndex}
            isFinished={isFinished}
          />

          {/* Interactive Graph Canvas Section */}
          <section id="map-section" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Territory Road Network Simulation
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive topological map. Villages are nodes, candidate roads are weighted edges.
                </p>
              </div>

              {/* Quick state summary */}
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{villages.length} villages</span>
                <span aria-hidden="true">·</span>
                <span>{roads.length} candidate roads</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  MST Target: {targetMSTEdgeCount} roads
                </span>
              </div>
            </div>

            {/* SVG Graph Canvas */}
            <GraphCanvas
              villages={villages}
              roads={roads}
              currentStep={currentStep}
              mstEdges={kruskalResult.mstEdges}
              isFinished={isFinished}
              onUpdateVillagePosition={handleUpdateVillagePosition}
              onSelectVillagesForRoad={handleSelectVillagesForRoad}
            />
          </section>

          {/* Execution Controls & Playback Deck */}
          <section id="control-section" className="space-y-3">
            <ControlDeck
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStepForward={handleStepForward}
              onStepBack={handleStepBack}
              onResetSteps={resetExecutionState}
              onJumpToEnd={handleJumpToEnd}
              speed={speed}
              onSetSpeed={setSpeed}
              currentStepIndex={currentStepIndex}
              totalSteps={kruskalResult.steps.length}
              isFinished={isFinished}
              acceptedCount={acceptedMSTCount}
              targetCount={targetMSTEdgeCount}
            />

            {/* Real-Time Step Callout & Cycle Rationale */}
            <CurrentStepCallout
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              totalSteps={kruskalResult.steps.length}
              result={kruskalResult}
              isFinished={isFinished}
              villages={villages}
            />
          </section>

          {/* Configuration & Inputs (Add Village / Add Road / Presets) */}
          <section id="registry-section">
            <InputPanel
              villages={villages}
              roads={roads}
              onAddVillage={handleAddVillage}
              onAddRoad={handleAddRoad}
              onLoadPreset={handleLoadPreset}
              onGenerateRandom={handleGenerateRandom}
              onQuickVillageCountChange={handleQuickVillageCountChange}
              pendingSourceId={pendingPair?.source}
              pendingTargetId={pendingPair?.target}
            />
          </section>

          {/* Candidate Roads Registry Table */}
          <RoadTable
            roads={roads}
            villages={villages}
            result={kruskalResult}
            isFinished={isFinished}
            activeRoadId={currentStep?.road.id}
            onDeleteRoad={handleDeleteRoad}
            onUpdateCost={handleUpdateRoadCost}
          />

          {/* Chronological Kruskal Trace Log Table */}
          <section id="trace-section">
            <StepTraceTable
              steps={kruskalResult.steps}
              villages={villages}
              result={kruskalResult}
              currentStepIndex={currentStepIndex}
              onJumpToStep={handleJumpToStep}
            />
          </section>

          {/* Computer Science & MST Theory Educational Section */}
          <EducationalSection />
        </div>
      </main>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
