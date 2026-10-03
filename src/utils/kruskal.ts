import { Village, Road, KruskalStep, KruskalResult } from '../types/graph';
import { DisjointSetUnion } from './dsu';

export function runKruskalAlgorithm(villages: Village[], roads: Road[]): KruskalResult {
  const villageIds = villages.map((v) => v.id);
  const villageNameMap = new Map<string, string>();
  villages.forEach((v) => villageNameMap.set(v.id, v.name));

  const totalOriginalCost = roads.reduce((acc, r) => acc + r.cost, 0);

  if (villages.length === 0) {
    return {
      steps: [],
      mstEdges: [],
      totalCost: 0,
      totalOriginalCost: 0,
      isConnected: true,
      connectedComponentCount: 0,
      unconnectedVillages: [],
    };
  }

  if (villages.length === 1) {
    return {
      steps: [],
      mstEdges: [],
      totalCost: 0,
      totalOriginalCost,
      isConnected: true,
      connectedComponentCount: 1,
      unconnectedVillages: [],
    };
  }

  // 1. Sort all candidate roads by construction cost in ascending order.
  // Stable sort tie-breaker by road ID
  const sortedRoads = [...roads].sort((a, b) => {
    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }
    return a.id.localeCompare(b.id);
  });

  // 2. Initialize DSU with all villages as separate components
  const dsu = new DisjointSetUnion(villageIds);
  const steps: KruskalStep[] = [];
  const mstEdges: Road[] = [];
  let runningCost = 0;
  const targetMSTEdgeCount = villages.length - 1;

  for (let i = 0; i < sortedRoads.length; i++) {
    const road = sortedRoads[i];
    const sourceName = villageNameMap.get(road.source) || road.source;
    const targetName = villageNameMap.get(road.target) || road.target;

    const sourceRoot = dsu.find(road.source);
    const targetRoot = dsu.find(road.target);
    const sourceRootName = villageNameMap.get(sourceRoot) || sourceRoot;
    const targetRootName = villageNameMap.get(targetRoot) || targetRoot;

    // Check if adding this road creates a cycle
    if (sourceRoot !== targetRoot) {
      // Different components -> ACCEPT
      dsu.union(road.source, road.target);
      mstEdges.push(road);
      runningCost += road.cost;

      const isFinalMSTEdge = mstEdges.length === targetMSTEdgeCount;

      steps.push({
        stepIndex: steps.length + 1,
        road,
        sourceRoot,
        targetRoot,
        verdict: 'accepted',
        reason: `Root(${sourceName}) = ${sourceRootName} ≠ Root(${targetName}) = ${targetRootName}. Distinct components connected. Road added to MST.`,
        mstEdgesSoFar: [...mstEdges],
        mstCostSoFar: runningCost,
        components: dsu.getComponents(villageIds),
        parentMap: dsu.getParentMap(villageIds),
        isFinalMSTEdge,
      });

      // If MST has reached V - 1 edges, we could stop or keep testing remaining roads as rejected
      // For thorough educational demonstration, if MST is full, remaining roads will naturally create cycles.
    } else {
      // Same component -> REJECT (Cycle detected)
      steps.push({
        stepIndex: steps.length + 1,
        road,
        sourceRoot,
        targetRoot,
        verdict: 'rejected',
        reason: `Root(${sourceName}) = Root(${targetName}) = ${sourceRootName}. Both villages already belong to the same component. Adding this road would form a redundant cycle!`,
        mstEdgesSoFar: [...mstEdges],
        mstCostSoFar: runningCost,
        components: dsu.getComponents(villageIds),
        parentMap: dsu.getParentMap(villageIds),
      });
    }
  }

  // Check if graph was fully connected
  const finalComponents = dsu.getComponents(villageIds);
  const componentRoots = Object.keys(finalComponents);
  const isConnected = componentRoots.length <= 1 && mstEdges.length === targetMSTEdgeCount;

  // Find villages that are in smaller disjoint components
  let unconnectedVillages: string[] = [];
  if (!isConnected && componentRoots.length > 1) {
    // Find largest component root
    let largestRoot = componentRoots[0];
    for (const r of componentRoots) {
      if (finalComponents[r].length > finalComponents[largestRoot].length) {
        largestRoot = r;
      }
    }
    // Any village not in largest component is considered disconnected
    unconnectedVillages = villageIds.filter((id) => dsu.find(id) !== largestRoot);
  }

  return {
    steps,
    mstEdges,
    totalCost: runningCost,
    totalOriginalCost,
    isConnected,
    connectedComponentCount: componentRoots.length,
    unconnectedVillages,
  };
}
