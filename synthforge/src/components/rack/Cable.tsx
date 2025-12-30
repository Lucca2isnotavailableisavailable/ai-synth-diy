import { useMemo } from 'react';

interface CableProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  temporary?: boolean;
}

export function Cable({ from, to, color, temporary = false }: CableProps) {
  // Calculate control points for a nice catenary-like curve
  const path = useMemo(() => {
    const dx = to.x - from.x;
    const distance = Math.sqrt(dx * dx + (to.y - from.y) * (to.y - from.y));
    
    // Sag amount based on distance
    const sag = Math.min(distance * 0.3, 100);
    
    // Control points for smooth curve
    const cp1x = from.x + dx * 0.25;
    const cp1y = from.y + sag * 0.5;
    const cp2x = to.x - dx * 0.25;
    const cp2y = to.y + sag * 0.5;
    
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  }, [from, to]);

  return (
    <g>
      {/* Shadow/glow */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.2}
        filter="blur(4px)"
      />
      
      {/* Main cable */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={temporary ? 0.6 : 0.9}
        className={temporary ? '' : 'cable-active'}
      />
      
      {/* Highlight */}
      <path
        d={path}
        fill="none"
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.2}
      />
      
      {/* End plugs */}
      <circle
        cx={from.x}
        cy={from.y}
        r={4}
        fill={color}
        stroke="#000"
        strokeWidth={1}
      />
      <circle
        cx={to.x}
        cy={to.y}
        r={4}
        fill={color}
        stroke="#000"
        strokeWidth={1}
      />
    </g>
  );
}
