import { useCallback } from 'react';
import { SignalType, PortDirection } from '../../lib/types';
import { SIGNAL_COLORS } from '../../lib/constants';

interface PortProps {
  id: string;
  name: string;
  type: SignalType;
  direction: PortDirection;
  moduleId: string;
  isConnected?: boolean;
  onStartConnection?: (moduleId: string, portId: string) => void;
  onEndConnection?: (moduleId: string, portId: string) => void;
  onPortRef?: (moduleId: string, portId: string, element: HTMLDivElement | null) => void;
}

export function Port({
  id,
  name,
  type,
  direction,
  moduleId,
  isConnected = false,
  onStartConnection,
  onEndConnection,
  onPortRef,
}: PortProps) {
  const color = SIGNAL_COLORS[type] || '#888888';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'output' && onStartConnection) {
      onStartConnection(moduleId, id);
    }
  }, [direction, moduleId, id, onStartConnection]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'input' && onEndConnection) {
      onEndConnection(moduleId, id);
    }
  }, [direction, moduleId, id, onEndConnection]);

  const handleRef = useCallback((element: HTMLDivElement | null) => {
    if (onPortRef) {
      onPortRef(moduleId, id, element);
    }
  }, [moduleId, id, onPortRef]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        ref={handleRef}
        className={`
          w-5 h-5 rounded-full border-2 cursor-pointer
          transition-all duration-150 hover:scale-110
          ${isConnected ? 'shadow-lg' : ''}
        `}
        style={{
          borderColor: color,
          backgroundColor: isConnected ? color : '#222',
          boxShadow: isConnected ? `0 0 8px ${color}50` : 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        title={`${name} (${type})`}
      >
        {/* Inner ring for 3D effect */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: isConnected
              ? `radial-gradient(circle at 30% 30%, ${color}aa, ${color}55)`
              : 'radial-gradient(circle at 30% 30%, #444, #222)',
          }}
        />
      </div>
      <span className="text-[9px] text-text-secondary uppercase tracking-wide">
        {name}
      </span>
    </div>
  );
}
