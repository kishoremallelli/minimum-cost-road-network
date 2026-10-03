/**
 * Disjoint Set Union (Union-Find) Data Structure
 * Includes Path Compression and Union by Rank for near O(1) amortized operations.
 */
export class DisjointSetUnion {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();

    for (const elem of elements) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
    }
  }

  /**
   * Find the representative root of the set containing element x with path compression.
   */
  public find(x: string): string {
    const p = this.parent.get(x);
    if (p === undefined) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      return x;
    }
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return x;
  }

  /**
   * Union the two sets containing x and y by rank.
   * Returns true if union occurred (they were in different sets), false if cycle (same set).
   */
  public union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Cycle detected: already in the same connected component
    }

    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }

  /**
   * Check if two elements belong to the same component.
   */
  public connected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Get a snapshot mapping of all connected components: root -> array of member IDs.
   */
  public getComponents(allElements: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    for (const elem of allElements) {
      const root = this.find(elem);
      if (!groups[root]) {
        groups[root] = [];
      }
      groups[root].push(elem);
    }
    return groups;
  }

  /**
   * Get an immutable snapshot of current parent pointers for visual trace.
   */
  public getParentMap(allElements: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const elem of allElements) {
      map[elem] = this.parent.get(elem) || elem;
    }
    return map;
  }

  /**
   * Clone current DSU state.
   */
  public clone(allElements: string[]): DisjointSetUnion {
    const cloneDsu = new DisjointSetUnion(allElements);
    for (const elem of allElements) {
      cloneDsu.parent.set(elem, this.parent.get(elem) || elem);
      cloneDsu.rank.set(elem, this.rank.get(elem) || 0);
    }
    return cloneDsu;
  }
}
