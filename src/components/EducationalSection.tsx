import React, { useState } from 'react';
import { BookOpen, GitFork, Cpu, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mst' | 'civil' | 'kruskal' | 'dsu' | 'proof' | 'complexity'>('mst');

  return (
    <section id="theory-section" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Computer Science & Engineering Fundamentals</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Algorithm Theory: Minimum Spanning Trees (MST) & Kruskal&apos;s Strategy
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Understand why Kruskal&apos;s Algorithm with Disjoint Set Union (DSU) delivers mathematically provable minimum cost infrastructure connectivity.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-slate-200 bg-slate-100/70 px-4 sm:px-6 flex overflow-x-auto">
        {[
          { key: 'mst', label: '1. What is an MST?' },
          { key: 'civil', label: '2. Civil Engineering Analogy' },
          { key: 'kruskal', label: '3. How Kruskal&apos;s Works' },
          { key: 'dsu', label: '4. Cycle Detection & DSU' },
          { key: 'proof', label: '5. Why Exactly V - 1 Roads?' },
          { key: 'complexity', label: '6. Time & Space Complexity' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-950 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-8 text-sm leading-relaxed text-slate-700">
        {activeTab === 'mst' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              Definition: What is a Minimum Spanning Tree?
            </h3>
            <p className="text-base text-slate-800">
              A <strong>Minimum Spanning Tree (MST)</strong> is a subset of the edges of a connected, edge-weighted undirected graph that connects all vertices together without any cycles, and with the <strong>minimum possible total edge weight</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Spanning</div>
                <div className="text-xs text-slate-600">
                  It spans all vertices: every village in the territory is included and has at least one path to every other village.
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Tree (No Cycles)</div>
                <div className="text-xs text-slate-600">
                  It contains no closed loops. If an edge creates a loop back to an already connected group, it is redundant and discarded.
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Minimum Weight</div>
                <div className="text-xs text-slate-600">
                  Among all possible spanning trees that could connect the vertices, the sum of its edge weights is strictly minimal.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'civil' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              Real-World Applications in Civil Infrastructure
            </h3>
            <p>
              In public works and regional planning, connecting every town or village with high-grade paved roads is a high-cost capital investment. Building roads between every single pair of villages (a complete graph Kn) would require n × (n - 1) / 2 roads, which is financially prohibitive and ecologically damaging.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Rural All-Weather Road Connectivity:</strong> Programs like PMGSY (Pradhan Mantri Gram Sadak Yojana) prioritize connecting every unconnected habitant with minimum asphalt laying cost.
              </li>
              <li>
                <strong>Power Grid Distribution:</strong> Connecting electrical substations and residential grids with high-voltage lines at minimal copper wire expense.
              </li>
              <li>
                <strong>Water Supply Networks & Municipal Pipelines:</strong> Laying water transmission mains between water treatment reservoirs and municipal wards without wasteful parallel piping.
              </li>
              <li>
                <strong>Telecommunications & Fiber Optics:</strong> Trenching fiber optic cables across rural districts to provide broadband connectivity with lowest digging cost.
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'kruskal' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              How Kruskal&apos;s Algorithm Works
            </h3>
            <p>
              Kruskal&apos;s algorithm is a <strong>greedy algorithm</strong> designed by Joseph Kruskal in 1956. It processes edges in ascending order of weight and iteratively builds up the spanning forest until a single connected tree is formed:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Sort All Candidate Roads:</strong> Sort all edges $E$ in non-decreasing order of cost: $c(e_1) \le c(e_2) \le \dots \le c(e_m)$.
              </li>
              <li>
                <strong>Initialize Disjoint Sets:</strong> Place each of the V villages into its own independent partition: <code>{'{ {v1}, {v2}, ..., {vn} }'}</code>.
              </li>
              <li>
                <strong>Greedy Edge Selection:</strong> For each sorted edge $(u, v)$ with cost $c$:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li>Check if $u$ and $v$ belong to different sets using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">find(u)</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">find(v)</code>.</li>
                  <li><strong>If different:</strong> Add edge to the MST and merge the two sets using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">union(u, v)</code>.</li>
                  <li><strong>If identical:</strong> Reject the edge, as adding it would create an unwanted cycle!</li>
                </ul>
              </li>
              <li>
                <strong>Termination:</strong> Stop as soon as $V - 1$ edges are accepted, or all edges have been evaluated.
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'dsu' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              Disjoint Set Union (DSU / Union-Find) & Cycle Detection
            </h3>
            <p>
              How do we test whether adding an edge between Village $A$ and Village $B$ creates a closed loop in nearly $O(1)$ time? We use the <strong>Disjoint Set Union</strong> data structure:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 font-mono text-xs mb-1">find(node) with Path Compression</div>
                <div className="text-xs text-slate-600">
                  Follows parent pointers up to the tree root. During recursion, it re-points all visited nodes directly to the root, flattening tree height to almost 1 for subsequent lookups.
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 font-mono text-xs mb-1">union(u, v) with Union by Rank</div>
                <div className="text-xs text-slate-600">
                  Finds root representatives <code className="bg-white px-1 border rounded">rootU</code> and <code className="bg-white px-1 border rounded">rootV</code>. If they are equal, a cycle exists! If unequal, attaches the shallower tree under the deeper tree to prevent degeneration into a linked list.
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
              <strong>Cycle Invariant:</strong> If two vertices $u$ and $v$ already have the same set root, there already exists an indirect path between them using previously selected roads. Adding direct road $(u, v)$ would create a second path, completing a cycle!
            </div>
          </div>
        )}

        {activeTab === 'proof' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              Why Does the MST Contain Exactly V - 1 Roads for V Villages?
            </h3>
            <p>
              This is a foundational theorem in graph theory:
            </p>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs space-y-2">
              <div>• Initial state: V villages = V disconnected components (islands).</div>
              <div>• Each accepted non-cycle road merges exactly two separate components into one.</div>
              <div>• To reduce V components down to exactly 1 fully connected network requires:</div>
              <div className="text-emerald-700 font-bold text-sm">V - 1 successful union merges!</div>
            </div>
            <p className="text-xs text-slate-600">
              Any fewer than $V - 1$ edges leaves at least two disconnected components. Any more than $V - 1$ edges in a connected graph of $V$ vertices mathematically guarantees at least one cycle (by the Pigeonhole Principle on tree paths).
            </p>
          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-lg font-bold text-slate-900">
              Computational Time & Space Complexity Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs uppercase font-semibold text-slate-500 mb-1">Time Complexity</div>
                <div className="text-lg font-bold font-mono text-emerald-700 mb-2">
                  O(E · log E) or O(E · log V)
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• <strong>Edge Sorting:</strong> $O(E \log E)$ dominates the runtime.</div>
                  <div>• <strong>DSU Operations:</strong> 2E find operations and V - 1 union operations take O(E · α(V)) where α is the Inverse Ackermann function (α(V) ≤ 4 for any universe scale).</div>
                  <div>• Since $E \le V^2$, $\log E \le 2 \log V$, so $O(E \log E) \equiv O(E \log V)$.</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs uppercase font-semibold text-slate-500 mb-1">Space Complexity</div>
                <div className="text-lg font-bold font-mono text-sky-700 mb-2">
                  O(V + E)
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Storing the road edge list: $O(E)$ memory.</div>
                  <div>• Storing the DSU <code className="font-mono bg-white px-1 border rounded">parent</code> and <code className="font-mono bg-white px-1 border rounded">rank</code> arrays: $O(V)$ memory.</div>
                  <div>• Highly space efficient; optimal for embedded and low-memory environments.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
