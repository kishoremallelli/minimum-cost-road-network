import { Village, Road } from '../types/graph';

export interface PresetNetwork {
  name: string;
  description: string;
  villages: Village[];
  roads: Road[];
}

export const PRESET_DEFAULT_EXAMPLE: PresetNetwork = {
  name: 'Standard Hackathon Benchmark (5 Villages)',
  description: 'The benchmark dataset specified in the problem statement (Villages A-E, 7 roads).',
  villages: [
    { id: 'vA', name: 'A', x: 220, y: 160 },
    { id: 'vB', name: 'B', x: 520, y: 140 },
    { id: 'vC', name: 'C', x: 370, y: 290 },
    { id: 'vD', name: 'D', x: 650, y: 350 },
    { id: 'vE', name: 'E', x: 420, y: 460 },
  ],
  roads: [
    { id: 'r_AB', source: 'vA', target: 'vB', cost: 4 },
    { id: 'r_AC', source: 'vA', target: 'vC', cost: 2 },
    { id: 'r_BC', source: 'vB', target: 'vC', cost: 1 },
    { id: 'r_BD', source: 'vB', target: 'vD', cost: 5 },
    { id: 'r_CD', source: 'vC', target: 'vD', cost: 8 },
    { id: 'r_CE', source: 'vC', target: 'vE', cost: 10 },
    { id: 'r_DE', source: 'vD', target: 'vE', cost: 2 },
  ],
};

export const PRESET_MOUNTAIN_VALLEY: PresetNetwork = {
  name: 'Highland River Valley (7 Villages)',
  description: 'A realistic regional network connecting hillside settlements and riverside towns.',
  villages: [
    { id: 'v1', name: 'Northpass', x: 180, y: 140 },
    { id: 'v2', name: 'Highfall', x: 400, y: 110 },
    { id: 'v3', name: 'Eastridge', x: 640, y: 160 },
    { id: 'v4', name: 'Timberton', x: 250, y: 310 },
    { id: 'v5', name: 'Riverdale', x: 480, y: 300 },
    { id: 'v6', name: 'Pinemeadow', x: 670, y: 360 },
    { id: 'v7', name: 'Southgate', x: 380, y: 460 },
  ],
  roads: [
    { id: 'r_12', source: 'v1', target: 'v2', cost: 7 },
    { id: 'r_14', source: 'v1', target: 'v4', cost: 5 },
    { id: 'r_23', source: 'v2', target: 'v3', cost: 8 },
    { id: 'r_24', source: 'v2', target: 'v4', cost: 9 },
    { id: 'r_25', source: 'v2', target: 'v5', cost: 7 },
    { id: 'r_36', source: 'v3', target: 'v6', cost: 5 },
    { id: 'r_45', source: 'v4', target: 'v5', cost: 15 },
    { id: 'r_47', source: 'v4', target: 'v7', cost: 6 },
    { id: 'r_56', source: 'v5', target: 'v6', cost: 8 },
    { id: 'r_57', source: 'v5', target: 'v7', cost: 9 },
    { id: 'r_67', source: 'v6', target: 'v7', cost: 11 },
  ],
};

export const PRESET_DISCONNECTED_ARCHIPELAGO: PresetNetwork = {
  name: 'Disconnected Islands (No Complete MST Demo)',
  description: 'Demonstrates handling when remote settlements cannot be connected by candidate roads.',
  villages: [
    { id: 'i1', name: 'Alpha', x: 200, y: 200 },
    { id: 'i2', name: 'Beta', x: 350, y: 150 },
    { id: 'i3', name: 'Gamma', x: 300, y: 340 },
    { id: 'i4', name: 'Delta (Isolated)', x: 600, y: 180 },
    { id: 'i5', name: 'Epsilon (Isolated)', x: 680, y: 350 },
  ],
  roads: [
    { id: 'r_ab', source: 'i1', target: 'i2', cost: 3 },
    { id: 'r_ac', source: 'i1', target: 'i3', cost: 4 },
    { id: 'r_bc', source: 'i2', target: 'i3', cost: 2 },
    { id: 'r_de', source: 'i4', target: 'i5', cost: 6 },
  ],
};

export function generateRandomNetwork(nodeCount = 6): PresetNetwork {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const villages: Village[] = [];
  const centerX = 420;
  const centerY = 280;
  const radius = 180;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    // slight jitter for organic look
    const jitterR = radius + (Math.random() * 40 - 20);
    villages.push({
      id: `rnd_${i}`,
      name: letters[i % letters.length],
      x: Math.round(centerX + jitterR * Math.cos(angle)),
      y: Math.round(centerY + jitterR * Math.sin(angle)),
    });
  }

  // Ensure connected graph: first create a random spanning chain, then add additional candidate roads
  const roads: Road[] = [];
  const existingPair = new Set<string>();

  const pairKey = (u: string, v: string) => (u < v ? `${u}_${v}` : `${v}_${u}`);

  // Random chain so it is guaranteed connected
  const shuffled = [...villages].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 1; i++) {
    const u = shuffled[i].id;
    const v = shuffled[i + 1].id;
    const key = pairKey(u, v);
    existingPair.add(key);
    const cost = Math.floor(Math.random() * 12) + 2;
    roads.push({
      id: `r_rnd_${roads.length}`,
      source: u,
      target: v,
      cost,
    });
  }

  // Add extra random cross roads to create interesting cycle choices for Kruskal
  const extraRoadCount = Math.floor(nodeCount * 0.8) + 2;
  let attempts = 0;
  while (roads.length < (nodeCount - 1) + extraRoadCount && attempts < 50) {
    attempts++;
    const idx1 = Math.floor(Math.random() * nodeCount);
    let idx2 = Math.floor(Math.random() * nodeCount);
    if (idx1 === idx2) continue;
    const u = villages[idx1].id;
    const v = villages[idx2].id;
    const key = pairKey(u, v);
    if (!existingPair.has(key)) {
      existingPair.add(key);
      const cost = Math.floor(Math.random() * 16) + 3;
      roads.push({
        id: `r_rnd_${roads.length}`,
        source: u,
        target: v,
        cost,
      });
    }
  }

  return {
    name: `Custom Random Network (${nodeCount} Villages)`,
    description: `Randomly generated topography with ${roads.length} candidate roads.`,
    villages,
    roads,
  };
}
