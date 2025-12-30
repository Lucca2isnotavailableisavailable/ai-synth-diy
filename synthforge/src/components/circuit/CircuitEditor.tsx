import { useCallback, useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { componentLibrary } from '../../lib/circuit/components';
import { ComponentNode } from './ComponentNode';
import { CircuitWire } from './CircuitWire';

export function CircuitEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pinPositions, setPinPositions] = useState<Map<string, DOMRect>>(new Map());
  
  const {
    circuit,
    selectedComponentIds,
    selectedWireIds,
    isPlacing,
    placingComponentType,
    isWiring,
    wiringFrom,
    addComponent,
    selectComponent,
    clearSelection,
    startWiring,
    endWiring,
    cancelWiring,
    updateComponentPosition,
  } = useCircuitStore();

  // Track pin positions for wire rendering
  const handlePinRef = useCallback((componentId: string, pinId: string, element: HTMLDivElement | null) => {
    if (element) {
      const key = `${componentId}:${pinId}`;
      const rect = element.getBoundingClientRect();
      setPinPositions(prev => {
        const next = new Map(prev);
        next.set(key, rect);
        return next;
      });
    }
  }, []);

  // Get pin position relative to container
  const getPinPosition = useCallback((componentId: string, pinId: string) => {
    const key = `${componentId}:${pinId}`;
    const rect = pinPositions.get(key);
    if (!rect || !containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  }, [pinPositions]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    
    if (isPlacing && placingComponentType && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addComponent(placingComponentType, { x, y });
    } else if (isWiring) {
      cancelWiring();
    } else {
      clearSelection();
    }
  }, [isPlacing, placingComponentType, isWiring, addComponent, cancelWiring, clearSelection]);

  // Track mouse for wire preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelWiring();
        useCircuitStore.getState().cancelPlacing();
        clearSelection();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        useCircuitStore.getState().deleteSelected();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelWiring, clearSelection]);

  if (!circuit) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-muted">
        <div className="text-center">
          <div className="text-4xl mb-4">🔧</div>
          <div className="text-lg mb-2">No circuit loaded</div>
          <div className="text-sm">Create a new circuit or load an example</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        w-full h-full bg-bg-primary overflow-hidden relative
        ${isPlacing ? 'cursor-crosshair' : ''}
        ${isWiring ? 'cursor-pointer' : ''}
      `}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          radial-gradient(circle, #222 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Wires layer (SVG) */}
      <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        {/* Existing wires */}
        {circuit.wires.map(wire => {
          const fromPos = getPinPosition(wire.from.componentId, wire.from.pinId);
          const toPos = getPinPosition(wire.to.componentId, wire.to.pinId);
          
          if (!fromPos || !toPos) return null;

          return (
            <CircuitWire
              key={wire.id}
              from={fromPos}
              to={toPos}
              isSelected={selectedWireIds.includes(wire.id)}
              onClick={() => useCircuitStore.getState().selectWire(wire.id)}
            />
          );
        })}

        {/* Wire being drawn */}
        {isWiring && wiringFrom && (
          <CircuitWire
            from={getPinPosition(wiringFrom.componentId, wiringFrom.pinId) || mousePos}
            to={mousePos}
            isTemporary
          />
        )}
      </svg>

      {/* Components layer */}
      {circuit.components.map(component => (
        <ComponentNode
          key={component.id}
          component={component}
          isSelected={selectedComponentIds.includes(component.id)}
          onSelect={(additive) => selectComponent(component.id, additive)}
          onMove={(pos) => updateComponentPosition(component.id, pos)}
          onPinClick={(pinId, isOutput) => {
            if (isWiring && wiringFrom) {
              endWiring(component.id, pinId);
            } else if (isOutput) {
              startWiring(component.id, pinId);
            } else {
              // Allow starting from inputs too (will reverse when complete)
              startWiring(component.id, pinId);
            }
          }}
          onPinRef={handlePinRef}
        />
      ))}

      {/* Placement preview */}
      {isPlacing && placingComponentType && (
        <div
          className="absolute pointer-events-none opacity-50"
          style={{
            left: mousePos.x - 40,
            top: mousePos.y - 30,
          }}
        >
          <div className="w-20 h-16 bg-bg-tertiary border-2 border-dashed border-accent-primary rounded flex items-center justify-center">
            <span className="text-xs text-accent-primary">
              {componentLibrary[placingComponentType]?.name || placingComponentType}
            </span>
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-text-muted bg-bg-secondary/80 px-2 py-1 rounded">
        {circuit.name} • {circuit.components.length} components • {circuit.wires.length} wires
      </div>
    </div>
  );
}
