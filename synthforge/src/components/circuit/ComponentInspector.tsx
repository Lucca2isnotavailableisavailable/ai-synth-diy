import { useMemo } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { componentLibrary } from '../../lib/circuit/components';
import { formatComponentValue } from '../../lib/utils';

export function ComponentInspector() {
  const { circuit, selectedComponentIds, updateComponentParam, rotateComponent, removeComponent } = useCircuitStore();

  const selectedComponent = useMemo(() => {
    if (!circuit || selectedComponentIds.length !== 1) return null;
    return circuit.components.find(c => c.id === selectedComponentIds[0]);
  }, [circuit, selectedComponentIds]);

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm p-4 text-center">
        Select a component to edit its properties
      </div>
    );
  }

  const def = componentLibrary[selectedComponent.type];
  if (!def) return null;

  const handleParamChange = (paramId: string, value: number) => {
    updateComponentParam(selectedComponent.id, paramId, value);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 bg-bg-tertiary">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{def.symbol}</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{def.name}</h3>
            <p className="text-xs text-text-muted">{selectedComponent.type}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-3 border-b border-gray-800">
        <p className="text-xs text-text-secondary">{def.description}</p>
      </div>

      {/* Parameters */}
      {Object.keys(def.paramLabels).length > 0 && (
        <div className="p-3 border-b border-gray-800">
          <h4 className="text-xs font-semibold text-text-secondary uppercase mb-3">Parameters</h4>
          <div className="space-y-3">
            {Object.entries(def.paramLabels).map(([paramId, label]) => {
              const value = selectedComponent.params[paramId] ?? def.defaultParams[paramId];
              
              // Determine if this is a large range that needs logarithmic scaling
              const useLog = label.max / label.min > 1000;

              return (
                <div key={paramId}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-text-primary">{label.label}</label>
                    <span className="text-xs text-accent-primary font-mono">
                      {formatComponentValue(value, label.unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={useLog ? Math.log10(label.min) : label.min}
                    max={useLog ? Math.log10(label.max) : label.max}
                    step={useLog ? 0.01 : (label.max - label.min) / 1000}
                    value={useLog ? Math.log10(Math.max(value, label.min)) : value}
                    onChange={(e) => {
                      const rawValue = parseFloat(e.target.value);
                      const newValue = useLog ? Math.pow(10, rawValue) : rawValue;
                      handleParamChange(paramId, newValue);
                    }}
                    className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                  />
                  <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
                    <span>{formatComponentValue(label.min, label.unit)}</span>
                    <span>{formatComponentValue(label.max, label.unit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pins */}
      <div className="p-3 border-b border-gray-800">
        <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Pins</h4>
        <div className="grid grid-cols-2 gap-1">
          {def.pins.map(pin => (
            <div
              key={pin.id}
              className="flex items-center gap-2 px-2 py-1 bg-bg-tertiary rounded text-xs"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pin.type === 'input' ? 'bg-blue-500' :
                  pin.type === 'output' ? 'bg-green-500' :
                  pin.type === 'power' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}
              />
              <span className="text-text-primary">{pin.name}</span>
              <span className="text-text-muted text-[9px]">({pin.type})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={() => rotateComponent(selectedComponent.id)}
          className="w-full px-3 py-2 text-sm bg-bg-tertiary hover:bg-gray-700 text-text-primary rounded"
        >
          🔄 Rotate 90°
        </button>
        <button
          onClick={() => removeComponent(selectedComponent.id)}
          className="w-full px-3 py-2 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded"
        >
          🗑️ Delete Component
        </button>
      </div>

      {/* Position info */}
      <div className="p-3 border-t border-gray-800 text-xs text-text-muted">
        <div>Position: ({selectedComponent.position.x}, {selectedComponent.position.y})</div>
        <div>Rotation: {selectedComponent.rotation}°</div>
        <div>ID: {selectedComponent.id}</div>
      </div>
    </div>
  );
}
