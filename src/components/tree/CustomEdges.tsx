import { BaseEdge, EdgeProps, getSmoothStepPath, getStraightPath } from 'reactflow';

// Elegant dark-brown/charcoal connecting lines
const strokeStyle = { stroke: '#5c4033', strokeWidth: 3, strokeLinecap: 'round' as const };

export function CustomChildEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Use SmoothStepPath for the T-junction look (parent -> branch -> child)
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16, // Smooth curves for branching
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{ ...strokeStyle, ...style }}
    />
  );
}

export function CustomSpouseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Spouses just use a simple straight horizontal line
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{ ...strokeStyle, strokeDasharray: '4 4', strokeWidth: 2, ...style }} // Subtle dashed line for spouses
    />
  );
}
