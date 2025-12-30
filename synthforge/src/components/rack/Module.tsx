import { useCallback, useRef, useState, useEffect } from 'react';
import { ModuleInstance, ModuleDefinition } from '../../lib/types';
import { useProjectStore } from '../../stores/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { Knob } from '../ui/Knob';
import { Port } from '../ui/Port';
import { HP_WIDTH_PX, RAIL_HEIGHT_PX, MODULE_ICONS } from '../../lib/constants';

interface ModuleProps {
  instance: ModuleInstance;
  definition: ModuleDefinition;
  isSelected: boolean;
  onSelect: (additive: boolean) => void;
  onMove: (position: { x: number; y: number }) => void;
  onStartConnection: (moduleId: string, portId: string) => void;
  onEndConnection: (moduleId: string, portId: string) => void;
  onPortRef: (moduleId: string, portId: string, element: HTMLDivElement | null) => void;
  isPortConnected: (moduleId: string, portId: string) => boolean;
}

export function Module({
  instance,
  definition,
  isSelected,
  onSelect,
  onMove,
  onStartConnection,
  onEndConnection,
  onPortRef,
  isPortConnected,
}: ModuleProps) {
  const moduleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, moduleX: 0, moduleY: 0 });

  const { updateModuleControl } = useProjectStore();
  const { openModuleDetail } = useUIStore();

  const width = definition.hp * HP_WIDTH_PX;
  const height = RAIL_HEIGHT_PX;
  const icon = MODULE_ICONS[definition.type] || '◼';

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Select on click
    onSelect(e.shiftKey || e.metaKey);

    // Start dragging
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      moduleX: instance.position.x,
      moduleY: instance.position.y,
    };
  }, [instance.position, onSelect]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Snap to grid (HP width)
      const newX = Math.round((dragStartRef.current.moduleX + deltaX) / HP_WIDTH_PX) * HP_WIDTH_PX;
      const newY = Math.max(0, dragStartRef.current.moduleY + deltaY);

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

  // Handle control changes
  const handleControlChange = useCallback((controlId: string, value: number) => {
    updateModuleControl(instance.id, controlId, value);
  }, [instance.id, updateModuleControl]);

  // Handle expand button
  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModuleDetail(instance.id);
  }, [instance.id, openModuleDetail]);

  // Get control value (with default fallback)
  const getControlValue = useCallback((controlId: string): number => {
    if (instance.controlValues[controlId] !== undefined) {
      return instance.controlValues[controlId];
    }
    const control = definition.controls.find(c => c.id === controlId);
    return control?.default ?? 0;
  }, [instance.controlValues, definition.controls]);

  return (
    <div
      ref={moduleRef}
      className={`
        absolute module-panel select-none
        ${isSelected ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-primary' : ''}
        ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}
      `}
      style={{
        left: instance.position.x,
        top: instance.position.y,
        width,
        height,
        backgroundColor: definition.color || '#2a2a2a',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Module header */}
      <div className="h-8 px-2 flex items-center justify-between border-b border-black/20">
        <div className="flex items-center gap-1">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-medium text-white/90 truncate">
            {definition.name}
          </span>
        </div>
        <button
          className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-xs text-white/70 hover:text-white flex items-center justify-center"
          onClick={handleExpand}
          title="View components"
        >
          +
        </button>
      </div>

      {/* Module body */}
      <div className="flex-1 p-2 flex flex-col gap-2">
        {/* Outputs (top) */}
        {definition.outputs.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {definition.outputs.map(output => (
              <Port
                key={output.id}
                id={output.id}
                name={output.name}
                type={output.type}
                direction="output"
                moduleId={instance.id}
                isConnected={isPortConnected(instance.id, output.id)}
                onStartConnection={onStartConnection}
                onPortRef={onPortRef}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex-1 flex justify-center items-center gap-2 flex-wrap">
          {definition.controls.map(control => (
            <Knob
              key={control.id}
              value={getControlValue(control.id)}
              min={control.min}
              max={control.max}
              onChange={(value) => handleControlChange(control.id, value)}
              label={control.name}
              curve={control.curve}
              size={definition.hp >= 8 ? 40 : 32}
            />
          ))}
        </div>

        {/* Inputs (bottom) */}
        {definition.inputs.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {definition.inputs.map(input => (
              <Port
                key={input.id}
                id={input.id}
                name={input.name}
                type={input.type}
                direction="input"
                moduleId={instance.id}
                isConnected={isPortConnected(instance.id, input.id)}
                onEndConnection={onEndConnection}
                onPortRef={onPortRef}
              />
            ))}
          </div>
        )}
      </div>

      {/* Module footer with HP size */}
      <div className="h-4 px-2 flex items-center justify-center border-t border-black/20">
        <span className="text-[8px] text-white/40">{definition.hp}HP</span>
      </div>
    </div>
  );
}
