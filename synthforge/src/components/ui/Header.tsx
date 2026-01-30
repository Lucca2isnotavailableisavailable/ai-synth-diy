import { useProjectStore } from '../../stores/projectStore';
import { useAudioStore } from '../../stores/audioStore';
import { useUIStore } from '../../stores/uiStore';
import { audioEngine } from '../../lib/audioEngine';

export function Header() {
  const { projectName, modified, newProject, saveProject, loadProject, setProjectName } = useProjectStore();
  const { isRunning, cpuLoad } = useAudioStore();
  const { visiblePanels, togglePanel } = useUIStore();

  const handlePlay = () => {
    if (isRunning) {
      audioEngine.stop();
      useAudioStore.setState({ isRunning: false });
    } else {
      audioEngine.start();
      useAudioStore.setState({ isRunning: true });
    }
  };

  const handleSave = () => {
    const data = saveProject();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.synth`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.synth,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        loadProject(text);
      }
    };
    input.click();
  };

  return (
    <header className="h-12 bg-bg-secondary border-b border-gray-800 flex items-center px-4 justify-between">
      {/* Left side - Logo & Project */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          <span className="font-bold text-accent-primary">SynthForge</span>
        </div>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-text-primary"
          />
          {modified && <span className="text-accent-warning text-xs">●</span>}
        </div>
      </div>

      {/* Center - Transport */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className={`w-10 h-8 rounded flex items-center justify-center transition-colors ${
            isRunning
              ? 'bg-accent-primary text-bg-primary'
              : 'bg-bg-tertiary text-text-primary hover:bg-gray-600'
          }`}
          title={isRunning ? 'Stop (Space)' : 'Play (Space)'}
        >
          {isRunning ? '■' : '▶'}
        </button>
        
        <div className="text-xs text-text-secondary ml-4">
          CPU: <span className={cpuLoad > 80 ? 'text-accent-error' : 'text-text-primary'}>
            {cpuLoad.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Panel toggles */}
        <div className="flex items-center gap-1 mr-4">
          <button
            onClick={() => togglePanel('library')}
            className={`px-2 py-1 text-xs rounded ${
              visiblePanels.includes('library')
                ? 'bg-accent-primary text-bg-primary'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => togglePanel('scope')}
            className={`px-2 py-1 text-xs rounded ${
              visiblePanels.includes('scope')
                ? 'bg-accent-primary text-bg-primary'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Scope
          </button>
        </div>

        <button
          onClick={newProject}
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
