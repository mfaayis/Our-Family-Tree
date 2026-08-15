import { BaseEdge, EdgeProps, getSmoothStepPath, getStraightPath, EdgeLabelRenderer } from 'reactflow';

// Warm charcoal/brown family tree branch lines
const childStyle = {
  stroke: '#5c4033',
  strokeWidth: 3,
  strokeLinecap: 'round' as const,
};

const spouseStyle = {
  stroke: '#8b5a2b',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeDasharray: '6 4',
};

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
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{ ...childStyle, ...style }}
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
  const midY = (sourceY + targetY) / 2;
  // Spouse line: straight horizontal with a slight heart-shaped midpoint
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
      style={{ ...spouseStyle, ...style }}
    />
  );
}
