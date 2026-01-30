import { useMemo } from 'react';

interface CircuitWireProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isSelected?: boolean;
  isTemporary?: boolean;
  onClick?: () => void;
}

export function CircuitWire({ from, to, isSelected, isTemporary, onClick }: CircuitWireProps) {
  // Create a smooth path with right angles (like PCB traces)
  const path = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Simple orthogonal routing
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal first, then vertical
      const midX = from.x + dx / 2;
      return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
    } else {
      // Vertical first, then horizontal
      const midY = from.y + dy / 2;
      return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
    }
  }, [from, to]);

  const color = isTemporary ? '#00d4aa' : isSelected ? '#00d4aa' : '#666';
  const opacity = isTemporary ? 0.5 : 1;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={onClick ? 'cursor-pointer' : ''}
    >
      {/* Hit area (invisible but clickable) */}
      {onClick && (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
          style={{ pointerEvents: 'stroke' }}
        />
      )}
      
      {/* Shadow */}
      <path
        d={path}
        fill="none"
        stroke="#000"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Main wire */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
        style={{ pointerEvents: 'none' }}
      />

      {/* End points */}
      <circle cx={from.x} cy={from.y} r={3} fill={color} opacity={opacity} style={{ pointerEvents: 'none' }} />
      <circle cx={to.x} cy={to.y} r={3} fill={color} opacity={opacity} style={{ pointerEvents: 'none' }} />
    </g>
  );
}
