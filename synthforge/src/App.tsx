import { useEffect } from 'react';
import { CircuitEditor } from './components/circuit/CircuitEditor';
import { ComponentBrowser } from './components/circuit/ComponentBrowser';
import { ComponentInspector } from './components/circuit/ComponentInspector';
import { Oscilloscope } from './components/scope/Oscilloscope';
import { CircuitHeader } from './components/ui/CircuitHeader';
import { useCircuitStore } from './stores/circuitStore';
import { useAudioStore } from './stores/audioStore';
import { circuitAudioEngine } from './lib/circuitAudioEngine';

function App() {
  const { circuit, isRunning } = useCircuitStore();
  const { scopeData, setScopeData, initialize } = useAudioStore();

  // Initialize audio on mount
  useEffect(() => {
    const init = async () => {
      await circuitAudioEngine.initialize();
      await initialize();
      
      // Set up scope callback
      circuitAudioEngine.setScopeCallback((data) => {
        setScopeData(data);
      });
    };
    
    init();
  }, [initialize, setScopeData]);

  // Update audio engine when circuit changes
  useEffect(() => {
    if (circuit) {
      circuitAudioEngine.setCircuit(circuit);
    }
  }, [circuit]);

  // Handle play/stop
  useEffect(() => {
    if (isRunning) {
      circuitAudioEngine.start();
    } else {
      circuitAudioEngine.stop();
    }
  }, [isRunning]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle play
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isRunning) {
          useCircuitStore.getState().stopSimulation();
        } else {
          useCircuitStore.getState().startSimulation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <CircuitHeader />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Browser (Left) */}
        <div className="w-64 border-r border-gray-800 overflow-hidden flex flex-col">
          <ComponentBrowser />
        </div>
        
        {/* Circuit Editor (Center) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 overflow-hidden">
            <CircuitEditor />
          </div>
          
          {/* Scope (Bottom) */}
          <div className="h-56 border-t border-gray-800">
            <Oscilloscope data={scopeData} />
          </div>
        </div>
        
        {/* Inspector (Right) */}
        <div className="w-72 border-l border-gray-800 overflow-hidden">
          <ComponentInspector />
        </div>
      </div>
    </div>
  );
}

export default App;
