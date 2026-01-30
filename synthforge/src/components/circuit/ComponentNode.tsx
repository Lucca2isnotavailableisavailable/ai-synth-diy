import { useCallback, useRef, useState, useEffect } from 'react';
import { ComponentInstance } from '../../lib/circuit/types';
import { componentLibrary } from '../../lib/circuit/components';
import { formatComponentValue } from '../../lib/utils';

interface ComponentNodeProps {
  component: ComponentInstance;
  isSelected: boolean;
  onSelect: (additive: boolean) => void;
  onMove: (position: { x: number; y: number }) => void;
  onPinClick: (pinId: string, isOutput: boolean) => void;
  onPinRef: (componentId: string, pinId: string, element: HTMLDivElement | null) => void;
}

export function ComponentNode({
  component,
  isSelected,
  onSelect,
  onMove,
  onPinClick,
  onPinRef,
}: ComponentNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, compX: 0, compY: 0 });

  const def = componentLibrary[component.type];
  if (!def) return null;

  // Determine component size based on pin count
  const pinCount = def.pins.length;
  const width = Math.max(80, pinCount * 25);
  const height = 60;

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    onSelect(e.shiftKey || e.metaKey);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      compX: component.position.x,
      compY: component.position.y,
    };
  }, [component.position, onSelect]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Snap to grid
      const gridSize = 20;
      const newX = Math.round((dragStartRef.current.compX + dx) / gridSize) * gridSize;
      const newY = Math.round((dragStartRef.current.compY + dy) / gridSize) * gridSize;

      onMove({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove]);

  // Get primary value for display
  const getPrimaryValue = () => {
    const paramKeys = Object.keys(def.paramLabels);
    if (paramKeys.length === 0) return null;

    const primaryKey = paramKeys[0];
    const value = component.params[primaryKey];
    const label = def.paramLabels[primaryKey];
    
    if (value === undefined) return null;
    
    return formatComponentValue(value, label?.unit || '');
  };

  // Color based on component category
  const getCategoryColor = () => {
    switch (def.category) {
      case 'passive': return '#3a3a3a';
      case 'semiconductor': return '#3a4a3a';
      case 'opamp': return '#3a3a5a';
      case 'ota': return '#4a3a5a';
      case 'comparator': return '#5a3a3a';
      case 'ic': return '#3a4a5a';
      case 'source': return '#4a4a3a';
      case 'probe': return '#3a5a5a';
      default: return '#3a3a3a';
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`
        absolute select-none
        ${isSelected ? 'ring-2 ring-accent-primary' : ''}
        ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}
      `}
      style={{
        left: component.position.x,
        top: component.position.y,
        transform: `rotate(${component.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Component body */}
      <div
        className="rounded border border-gray-600 shadow-lg"
        style={{
          width,
          height,
          backgroundColor: getCategoryColor(),
        }}
      >
        {/* Symbol/Name */}
        <div className="flex flex-col items-center justify-center h-full px-1">
          <span className="text-lg font-bold text-white/80">{def.symbol}</span>
          <span className="text-[9px] text-white/60 truncate max-w-full">{def.name}</span>
          {getPrimaryValue() && (
            <span className="text-[10px] text-accent-primary font-mono">
              {getPrimaryValue()}
            </span>
          )}
        </div>
      </div>

      {/* Pins */}
      <div className="absolute -top-3 left-0 right-0 flex justify-around">
        {def.pins.filter(p => p.type === 'input' || p.type === 'bidirectional').slice(0, Math.ceil(def.pins.length / 2)).map(pin => (
          <div
            key={pin.id}
            ref={(el) => onPinRef(component.id, pin.id, el)}
            className="flex flex-col items-center"
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id, pin.type === 'output');
            }}
          >
            <div
              className="w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-500 cursor-pointer hover:border-accent-primary hover:bg-gray-600 transition-colors"
              title={pin.name}
            />
            <span className="text-[7px] text-text-muted mt-0.5">{pin.name}</span>
          </div>
        ))}
      </div>

      <div className="absolute -bottom-3 left-0 right-0 flex justify-around">
        {def.pins.filter(p => p.type === 'output' || p.type === 'power').concat(
          def.pins.filter(p => p.type === 'bidirectional').slice(Math.ceil(def.pins.length / 2))
        ).map(pin => (
          <div
            key={pin.id}
            ref={(el) => onPinRef(component.id, pin.id, el)}
            className="flex flex-col items-center"
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id, pin.type === 'output');
            }}
          >
            <span className="text-[7px] text-text-muted mb-0.5">{pin.name}</span>
            <div
              className={`
                w-3 h-3 rounded-full cursor-pointer transition-colors
                ${pin.type === 'output' 
                  ? 'bg-accent-primary/30 border-2 border-accent-primary hover:bg-accent-primary/50' 
                  : pin.type === 'power'
                    ? 'bg-red-900/30 border-2 border-red-600 hover:bg-red-900/50'
                    : 'bg-gray-700 border-2 border-gray-500 hover:border-accent-primary hover:bg-gray-600'
                }
              `}
              title={pin.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
