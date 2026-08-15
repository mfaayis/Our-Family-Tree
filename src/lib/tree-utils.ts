// Utility functions for family tree relationship derivation
import type { Person, Relationship, RelationshipLabel } from './types';

export interface FamilyGraph {
  people: Map<string, Person>;
  relationships: Relationship[];
}

/**
 * Build a lookup map for fast relationship traversal
 */
export function buildGraph(people: Person[], relationships: Relationship[]): FamilyGraph {
  const map = new Map<string, Person>();
  for (const p of people) map.set(p.id, p);
  return { people: map, relationships };
}

/**
 * Get all parent IDs for a person
 */
export function getParents(personId: string, rels: Relationship[]): string[] {
  return rels
    .filter(r => r.relationshipType === 'parent' && r.personB === personId)
    .map(r => r.personA);
}

/**
 * Get all child IDs for a person
 */
export function getChildren(personId: string, rels: Relationship[]): string[] {
  return rels
    .filter(r => r.relationshipType === 'parent' && r.personA === personId)
    .map(r => r.personB);
}

/**
 * Get all spouse IDs for a person
 */
export function getSpouses(personId: string, rels: Relationship[]): string[] {
  return rels
    .filter(r => r.relationshipType === 'spouse' && (r.personA === personId || r.personB === personId))
    .map(r => r.personA === personId ? r.personB : r.personA);
}

/**
 * Get siblings (people who share at least one parent)
 */
export function getSiblings(personId: string, rels: Relationship[]): string[] {
  const parents = getParents(personId, rels);
  if (parents.length === 0) return [];
  const siblingSet = new Set<string>();
  for (const parentId of parents) {
    const children = getChildren(parentId, rels);
    for (const childId of children) {
      if (childId !== personId) siblingSet.add(childId);
    }
  }
  return Array.from(siblingSet);
}

/**
 * Get all ancestors in order (parent → grandparent → great-grandparent → ...)
 */
export function getAncestors(personId: string, rels: Relationship[]): { id: string; generation: number }[] {
  const result: { id: string; generation: number }[] = [];
  const visited = new Set<string>();
  
  function traverse(id: string, gen: number) {
    if (visited.has(id)) return;
    visited.add(id);
    const parents = getParents(id, rels);
    for (const parentId of parents) {
      result.push({ id: parentId, generation: gen });
      traverse(parentId, gen + 1);
    }
  }
  
  traverse(personId, 1);
  return result;
}

/**
 * Get all descendants
 */
export function getDescendants(personId: string, rels: Relationship[]): { id: string; generation: number }[] {
  const result: { id: string; generation: number }[] = [];
  const visited = new Set<string>();
  
  function traverse(id: string, gen: number) {
    if (visited.has(id)) return;
    visited.add(id);
    const children = getChildren(id, rels);
    for (const childId of children) {
      result.push({ id: childId, generation: gen });
      traverse(childId, gen + 1);
    }
  }
  
  traverse(personId, 1);
  return result;
}

/**
 * Find path between two people using BFS
 * Returns array of person IDs from source to target
 */
export function findPath(fromId: string, toId: string, rels: Relationship[]): string[] | null {
  if (fromId === toId) return [fromId];
  
  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);
  
  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    
    // Get all connected people (parents, children, spouses, siblings)
    const connected = [
      ...getParents(current, rels),
      ...getChildren(current, rels),
      ...getSpouses(current, rels),
    ];
    
    for (const neighbor of connected) {
      if (neighbor === toId) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  return null;
}

/**
 * Derive relationship label between two people
 * e.g. "grandchild", "uncle", "cousin"
 */
export function deriveRelationshipLabel(
  fromId: string,
  toId: string,
  rels: Relationship[],
  people: Map<string, Person>
): string {
  if (fromId === toId) return 'self';
  
  // Check direct relationships
  const fromChildren = getChildren(fromId, rels);
  const fromParents = getParents(fromId, rels);
  const fromSpouses = getSpouses(fromId, rels);
  
  if (fromChildren.includes(toId)) return 'child';
  if (fromParents.includes(toId)) return 'parent';
  if (fromSpouses.includes(toId)) return 'spouse';
  if (getSiblings(fromId, rels).includes(toId)) return 'sibling';
  
  // Grandparent / grandchild
  const grandchildren = fromChildren.flatMap(c => getChildren(c, rels));
  if (grandchildren.includes(toId)) return 'grandchild';
  
  const grandparents = fromParents.flatMap(p => getParents(p, rels));
  if (grandparents.includes(toId)) return 'grandparent';
  
  // Great-grandchild / great-grandparent
  const greatGrandchildren = grandchildren.flatMap(c => getChildren(c, rels));
  if (greatGrandchildren.includes(toId)) return 'great-grandchild';
  
  const greatGrandparents = grandparents.flatMap(p => getParents(p, rels));
  if (greatGrandparents.includes(toId)) return 'great-grandparent';
  
  // Aunt / Uncle / Niece / Nephew
  const parentSiblings = fromParents.flatMap(p => getSiblings(p, rels));
  if (parentSiblings.includes(toId)) {
    const toPerson = people.get(toId);
    return toPerson?.gender === 'male' ? 'uncle' : toPerson?.gender === 'female' ? 'aunt' : 'parent\'s sibling';
  }
  
  const fromSiblings = getSiblings(fromId, rels);
  const siblingChildren = fromSiblings.flatMap(s => getChildren(s, rels));
  if (siblingChildren.includes(toId)) {
    const toPerson = people.get(toId);
    return toPerson?.gender === 'male' ? 'nephew' : toPerson?.gender === 'female' ? 'niece' : 'sibling\'s child';
  }
  
  // Cousins
  const parentSiblingChildren = parentSiblings.flatMap(s => getChildren(s, rels));
  if (parentSiblingChildren.includes(toId)) return 'cousin';
  
  return 'relative';
}

/**
 * Build the tree structure for rendering starting from a root person
 */
export interface TreeNodeData {
  id: string;
  person: Person;
  children: TreeNodeData[];
  spouses: Person[];
  generation: number;
  x: number;
  y: number;
}

export function buildTreeFromRoot(
  rootId: string,
  people: Map<string, Person>,
  rels: Relationship[],
  maxGenerations = 20
): TreeNodeData | null {
  const root = people.get(rootId);
  if (!root) return null;
  
  const visited = new Set<string>();
  
  function buildNode(id: string, generation: number): TreeNodeData | null {
    if (visited.has(id) || generation > maxGenerations) return null;
    visited.add(id);
    
    const person = people.get(id);
    if (!person || person.isDeleted) return null;
    
    const childIds = getChildren(id, rels);
    const spouseIds = getSpouses(id, rels);
    
    const children = childIds
      .map(cId => buildNode(cId, generation + 1))
      .filter((n): n is TreeNodeData => n !== null);
    
    const spouses = spouseIds
      .map(sId => people.get(sId))
      .filter((p): p is Person => !!p && !p.isDeleted);
    
    return {
      id,
      person,
      children,
      spouses,
      generation,
      x: 0,
      y: 0,
    };
  }
  
  return buildNode(rootId, 0);
}

/**
 * Compute x positions for tree layout (Reingold-Tilford simplified)
 */
export function assignTreePositions(
  node: TreeNodeData,
  nodeWidth = 200,
  nodeHeight = 120,
  horizontalGap = 40,
  verticalGap = 80
): void {
  function getSubtreeWidth(n: TreeNodeData): number {
    if (n.children.length === 0) return nodeWidth;
    return Math.max(
      nodeWidth,
      n.children.reduce((sum, c) => sum + getSubtreeWidth(c) + horizontalGap, -horizontalGap)
    );
  }
  
  function assignPositions(n: TreeNodeData, x: number, y: number): void {
    n.y = y;
    
    if (n.children.length === 0) {
      n.x = x;
      return;
    }
    
    let currentX = x - getSubtreeWidth(n) / 2;
    for (const child of n.children) {
      const childWidth = getSubtreeWidth(child);
      assignPositions(child, currentX + childWidth / 2, y + nodeHeight + verticalGap);
      currentX += childWidth + horizontalGap;
    }
    
    // Center parent above children
    if (n.children.length > 0) {
      const firstChild = n.children[0];
      const lastChild = n.children[n.children.length - 1];
      n.x = (firstChild.x + lastChild.x) / 2;
    }
  }
  
  assignPositions(node, 0, 0);
}

/**
 * Get the path from root to a person (for breadcrumb/branch display)
 */
export function getPathFromRoot(
  personId: string,
  rootId: string,
  rels: Relationship[],
  people: Map<string, Person>
): Person[] {
  const path = findPath(rootId, personId, rels.filter(r => r.relationshipType === 'parent'));
  if (!path) return [];
  return path.map(id => people.get(id)).filter((p): p is Person => !!p);
}

/**
 * Determine which of Kassim Pillai's 5 branches a person belongs to
 */
export function getBranchName(
  personId: string,
  rootId: string,
  rels: Relationship[],
  people: Map<string, Person>
): string | null {
  const rootChildren = getChildren(rootId, rels);
  
  for (const childId of rootChildren) {
    const child = people.get(childId);
    if (!child) continue;
    if (childId === personId) return child.fullName;
    
    const descendants = getDescendants(childId, rels);
    if (descendants.some(d => d.id === personId)) {
      return child.fullName;
    }
  }
  
  return null;
}

/**
 * Count the maximum generation depth of the tree
 */
export function getMaxGeneration(rootId: string, rels: Relationship[]): number {
  const visited = new Set<string>();
  
  function maxDepth(id: string, depth: number): number {
    if (visited.has(id)) return depth;
    visited.add(id);
    const children = getChildren(id, rels);
    if (children.length === 0) return depth;
    return Math.max(...children.map(c => maxDepth(c, depth + 1)));
  }
  
  return maxDepth(rootId, 1);
}
