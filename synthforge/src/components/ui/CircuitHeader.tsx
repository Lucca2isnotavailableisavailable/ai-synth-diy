import { useCircuitStore } from '../../stores/circuitStore';

export function CircuitHeader() {
  const { 
    circuit, 
    isRunning, 
    startSimulation, 
    stopSimulation,
    newCircuit,
    saveCircuit,
  } = useCircuitStore();

  const handlePlay = () => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const handleSave = () => {
    const data = saveCircuit();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuit?.name || 'circuit'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          useCircuitStore.getState().loadCircuit(data);
        } catch (err) {
          console.error('Failed to load circuit:', err);
        }
      }
    };
    input.click();
  };

  return (
    <header className="h-12 bg-bg-secondary border-b border-gray-800 flex items-center px-4 justify-between">
      {/* Left side - Logo & Circuit name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔧</span>
          <span className="font-bold text-accent-primary">SynthForge</span>
          <span className="text-xs text-text-muted">Circuit Mode</span>
        </div>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-primary">
            {circuit?.name || 'No circuit'}
          </span>
        </div>
      </div>

      {/* Center - Transport */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlay}
          className={`px-4 py-1.5 rounded font-semibold text-sm flex items-center gap-2 transition-colors ${
            isRunning
              ? 'bg-accent-error text-white'
              : 'bg-accent-primary text-bg-primary hover:opacity-90'
          }`}
          title={isRunning ? 'Stop (Space)' : 'Play (Space)'}
        >
          {isRunning ? '■ Stop' : '▶ Play'}
        </button>
        
        {isRunning && (
          <span className="text-xs text-accent-primary animate-pulse">
            ● Running
          </span>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => newCircuit()}
          className="px-3 py-1 text-sm bg-bg-tertiary text-text-secondary hover:text-text-primary rounded"
        >
          New
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1 text-sm bg-bg-tertiary text-text-secondary hover:text-text-primary rounded"
        >
          Open
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-accent-primary text-bg-primary rounded hover:opacity-90"
        >
          Save
        </button>
      </div>
    </header>
  );
}
