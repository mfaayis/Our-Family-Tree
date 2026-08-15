import type { Node, Edge } from 'reactflow';
import type { Person, Relationship } from './types';
import { getParents, getChildren, getSpouses, getSiblings } from './tree-utils';

export function findHighestAncestor(startId: string, rels: Relationship[]): string {
  let currentId = startId;
  const visited = new Set<string>();
  
  while (!visited.has(currentId)) {
    visited.add(currentId);
    const parents = getParents(currentId, rels);
    if (parents.length === 0) break;
    currentId = parents[0]; // Trace up the first parent line
  }
  return currentId;
}

export function generateReactFlowGraph(
  rootNode: any, // TreeNodeData
  expandedNodes: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 95;
  const SPOUSE_GAP = 180; // Distance between person and spouse

  function traverse(n: any) {
    // Add main person node
    nodes.push({
      id: n.id,
      type: 'personNode',
      position: { x: n.x, y: n.y },
      data: {
        person: n.person,
        isSpouse: false,
        hasChildren: n.children.length > 0, // based on actual db children count
        isExpanded: expandedNodes.has(n.id)
      }
    });

    // Add spouses
    n.spouses.forEach((spouse: any, idx: number) => {
      const spouseX = n.x + SPOUSE_GAP * (idx + 1); // Place spouses to the right
      nodes.push({
        id: spouse.id,
        type: 'personNode',
        position: { x: spouseX, y: n.y },
        data: {
          person: spouse,
          isSpouse: true,
          hasChildren: false,
          isExpanded: false
        }
      });

      // Spouse Edge
      edges.push({
        id: `e-spouse-${n.id}-${spouse.id}`,
        source: n.id,
        target: spouse.id,
        type: 'customSpouseEdge',
        data: {}
      });
    });

    // Stop traversing if this node is not expanded, UNLESS it's the root node which is expanded by default
    if (expandedNodes.has(n.id)) {
      n.children.forEach((child: any) => {
        // Child Edge
        edges.push({
          id: `e-child-${n.id}-${child.id}`,
          source: n.id,
          target: child.id,
          type: 'customChildEdge',
          data: {}
        });

        traverse(child);
      });
    }
  }

  if (rootNode) {
    traverse(rootNode);
  }

  return { nodes, edges };
}
