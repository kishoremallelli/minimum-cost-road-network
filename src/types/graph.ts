export interface Village {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Road {
  id: string;
  source: string;
  target: string;
  cost: number;
}

export type StepVerdict = 'evaluating' | 'accepted' | 'rejected';

export interface KruskalStep {
  stepIndex: number;
  road: Road;
  sourceRoot: string;
  targetRoot: string;
  verdict: 'accepted' | 'rejected';
  reason: string;
  mstEdgesSoFar: Road[];
  mstCostSoFar: number;
  components: Record<string, string[]>; // rootId -> list of node IDs
  parentMap: Record<string, string>;
  isFinalMSTEdge?: boolean;
}

export interface KruskalResult {
  steps: KruskalStep[];
  mstEdges: Road[];
  totalCost: number;
  totalOriginalCost: number;
  isConnected: boolean;
  connectedComponentCount: number;
  unconnectedVillages: string[];
}
