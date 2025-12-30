import { useEffect } from 'react';
import { Rack } from './components/rack/Rack';
import { Library } from './components/library/Library';
import { Oscilloscope } from './components/scope/Oscilloscope';
import { Header } from './components/ui/Header';
import { useProjectStore } from './stores/projectStore';
import { useAudioStore } from './stores/audioStore';
import { useUIStore } from './stores/uiStore';
import { audioEngine } from './lib/audioEngine';

function App() {
  const { modules, cables } = useProjectStore();
  const { isRunning, initialize, scopeData, setScopeData } = useAudioStore();
  const { visiblePanels } = useUIStore();

  // Initialize audio on mount
  useEffect(() => {
    const init = async () => {
      await audioEngine.initialize();
      await initialize();
      
      // Set up scope callback
      audioEngine.setScopeCallback((data) => {
        setScopeData(data);
      });
    };
    
    init();
  }, [initialize, setScopeData]);

  // Update audio engine when patch changes
  useEffect(() => {
    audioEngine.updatePatch(modules, cables);
  }, [modules, cables]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle play
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isRunning) {
          audioEngine.stop();
          useAudioStore.setState({ isRunning: false });
        } else {
          audioEngine.start();
          useAudioStore.setState({ isRunning: true });
        }
      }
      
      // Delete selected
      if ((e.code === 'Delete' || e.code === 'Backspace') && e.target === document.body) {
        const { selectedModuleIds, selectedCableIds, removeModule, removeCable } = useProjectStore.getState();
        selectedModuleIds.forEach(id => removeModule(id));
        selectedCableIds.forEach(id => removeCable(id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Library Panel */}
        {visiblePanels.includes('library') && (
          <div className="w-64 border-r border-gray-800 overflow-hidden flex flex-col">
            <Library />
          </div>
        )}
        
        {/* Rack Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Rack View */}
          <div className="flex-1 overflow-hidden">
            <Rack />
          </div>
          
          {/* Scope Panel */}
          {visiblePanels.includes('scope') && (
            <div className="h-64 border-t border-gray-800">
              <Oscilloscope data={scopeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
