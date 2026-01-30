import { useCallback, useRef, useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { Module } from './Module';
import { Cable } from './Cable';
import { getModuleDefinition } from '../../lib/modules';
import { HP_WIDTH_PX } from '../../lib/constants';

export function Rack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [portPositions, setPortPositions] = useState<Map<string, DOMRect>>(new Map());
  const [tempCable, setTempCable] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  } | null>(null);
  
  const {
    modules,
    cables,
    selectedModuleIds,
    addCable,
    updateModulePosition,
    selectModule,
    clearSelection,
  } = useProjectStore();
  
  const {
    rackZoom,
    rackPanX,
    rackPanY,
    setRackZoom,
    isDraggingCable,
    dragStartPort,
    startDraggingCable,
    stopDraggingCable,
  } = useUIStore();

  // Update port positions
  const handlePortRef = useCallback((moduleId: string, portId: string, element: HTMLDivElement | null) => {
    if (element) {
      const key = `${moduleId}:${portId}`;
      const rect = element.getBoundingClientRect();
      setPortPositions(prev => {
        const next = new Map(prev);
        next.set(key, rect);
        return next;
      });
    }
  }, []);

  // Get port position for cable rendering
  const getPortPosition = useCallback((moduleId: string, portId: string) => {
    const key = `${moduleId}:${portId}`;
    const rect = portPositions.get(key);
    if (!rect || !containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  }, [portPositions]);

  // Handle starting a cable connection
  const handleStartConnection = useCallback((moduleId: string, portId: string) => {
    startDraggingCable(moduleId, portId);
  }, [startDraggingCable]);

  // Handle ending a cable connection
  const handleEndConnection = useCallback((moduleId: string, portId: string) => {
    if (dragStartPort) {
      addCable(
        { moduleId: dragStartPort.moduleId, portId: dragStartPort.portId },
        { moduleId, portId }
      );
    }
    stopDraggingCable();
    setTempCable(null);
  }, [dragStartPort, addCable, stopDraggingCable]);

  // Track mouse for temporary cable
  useEffect(() => {
    if (!isDraggingCable || !dragStartPort) return;

    const handleMouseMove = (e: MouseEvent) => {
      const startPos = getPortPosition(dragStartPort.moduleId, dragStartPort.portId);
      if (startPos && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setTempCable({
          from: startPos,
          to: {
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top,
          },
        });
      }
    };

    const handleMouseUp = () => {
      stopDraggingCable();
      setTempCable(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCable, dragStartPort, getPortPosition, stopDraggingCable]);

  // Handle background click
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setRackZoom(rackZoom * delta);
    }
  }, [rackZoom, setRackZoom]);

  // Check if a port is connected
  const isPortConnected = useCallback((moduleId: string, portId: string) => {
    return cables.some(
      c => (c.from.moduleId === moduleId && c.from.portId === portId) ||
           (c.to.moduleId === moduleId && c.to.portId === portId)
    );
  }, [cables]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-bg-primary overflow-hidden relative"
      onClick={handleBackgroundClick}
      onWheel={handleWheel}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a1a 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
          `,
          backgroundSize: `${HP_WIDTH_PX * rackZoom}px ${HP_WIDTH_PX * rackZoom}px`,
          backgroundPosition: `${rackPanX}px ${rackPanY}px`,
        }}
      />

      {/* Rack rails */}
      <div
        className="absolute left-0 right-0 h-3 bg-gray-800 border-b border-gray-700"
        style={{ top: 0 }}
      />
      <div
        className="absolute left-0 right-0 h-3 bg-gray-800 border-t border-gray-700"
        style={{ bottom: 0 }}
      />

      {/* Modules layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${rackZoom}) translate(${rackPanX / rackZoom}px, ${rackPanY / rackZoom}px)`,
          transformOrigin: '0 0',
        }}
      >
        {modules.map(module => {
          const def = getModuleDefinition(module.definitionId);
          if (!def) return null;

          return (
            <Module
              key={module.id}
              instance={module}
              definition={def}
              isSelected={selectedModuleIds.includes(module.id)}
              onSelect={(additive) => selectModule(module.id, additive)}
              onMove={(pos) => updateModulePosition(module.id, pos)}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
              onPortRef={handlePortRef}
              isPortConnected={isPortConnected}
            />
          );
        })}
      </div>

      {/* Cables layer (SVG overlay) */}
      <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        {cables.map(cable => {
          const fromPos = getPortPosition(cable.from.moduleId, cable.from.portId);
          const toPos = getPortPosition(cable.to.moduleId, cable.to.portId);
          
          if (!fromPos || !toPos) return null;

          return (
            <Cable
              key={cable.id}
              from={fromPos}
              to={toPos}
              color={cable.color}
            />
          );
        })}

        {/* Temporary cable while dragging */}
        {tempCable && (
          <Cable
            from={tempCable.from}
            to={tempCable.to}
            color="#00d4aa"
            temporary
          />
        )}
      </svg>

      {/* Empty state */}
      {modules.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-text-secondary">
            <div className="text-4xl mb-4">🎹</div>
            <div className="text-lg mb-2">No modules yet</div>
            <div className="text-sm text-text-muted">
              Drag modules from the library to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
