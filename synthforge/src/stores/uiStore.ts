import { create } from 'zustand';

type Panel = 'library' | 'inspector' | 'scope' | 'bom';
type View = 'rack' | 'module-detail';

interface UIState {
  // Current view
  currentView: View;
  selectedModuleForDetail: string | null;
  
  // Panel visibility
  visiblePanels: Panel[];
  
  // Rack view state
  rackZoom: number;
  rackPanX: number;
  rackPanY: number;
  
  // Scope settings
  scopeTimeDiv: number;
  scopeVoltDiv: number;
  scopeTriggerLevel: number;
  scopePaused: boolean;
  
  // Library filter
  libraryFilter: string;
  libraryCategory: string;
  
  // Drag state
  isDraggingModule: boolean;
  isDraggingCable: boolean;
  dragStartPort: { moduleId: string; portId: string } | null;
  
  // Actions
  setView: (view: View) => void;
  openModuleDetail: (moduleId: string) => void;
  closeModuleDetail: () => void;
  
  togglePanel: (panel: Panel) => void;
  showPanel: (panel: Panel) => void;
  hidePanel: (panel: Panel) => void;
  
  setRackZoom: (zoom: number) => void;
  setRackPan: (x: number, y: number) => void;
  
  setScopeTimeDiv: (value: number) => void;
  setScopeVoltDiv: (value: number) => void;
  setScopeTriggerLevel: (value: number) => void;
  toggleScopePause: () => void;
  
  setLibraryFilter: (filter: string) => void;
  setLibraryCategory: (category: string) => void;
  
  startDraggingModule: () => void;
  stopDraggingModule: () => void;
  startDraggingCable: (moduleId: string, portId: string) => void;
  stopDraggingCable: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  currentView: 'rack',
  selectedModuleForDetail: null,
  
  visiblePanels: ['library', 'scope'],
  
  rackZoom: 1,
  rackPanX: 0,
  rackPanY: 0,
  
  scopeTimeDiv: 5, // ms/div
  scopeVoltDiv: 1, // V/div
  scopeTriggerLevel: 0,
  scopePaused: false,
  
  libraryFilter: '',
  libraryCategory: 'all',
  
  isDraggingModule: false,
  isDraggingCable: false,
  dragStartPort: null,
  
  // Actions
  setView: (view) => set({ currentView: view }),
  
  openModuleDetail: (moduleId) => set({
    currentView: 'module-detail',
    selectedModuleForDetail: moduleId,
  }),
  
  closeModuleDetail: () => set({
    currentView: 'rack',
    selectedModuleForDetail: null,
  }),
  
  togglePanel: (panel) => set((state) => ({
    visiblePanels: state.visiblePanels.includes(panel)
      ? state.visiblePanels.filter(p => p !== panel)
      : [...state.visiblePanels, panel],
  })),
  
  showPanel: (panel) => set((state) => ({
    visiblePanels: state.visiblePanels.includes(panel)
      ? state.visiblePanels
      : [...state.visiblePanels, panel],
  })),
  
  hidePanel: (panel) => set((state) => ({
    visiblePanels: state.visiblePanels.filter(p => p !== panel),
  })),
  
  setRackZoom: (zoom) => set({ rackZoom: Math.max(0.25, Math.min(2, zoom)) }),
  setRackPan: (x, y) => set({ rackPanX: x, rackPanY: y }),
  
  setScopeTimeDiv: (value) => set({ scopeTimeDiv: value }),
  setScopeVoltDiv: (value) => set({ scopeVoltDiv: value }),
  setScopeTriggerLevel: (value) => set({ scopeTriggerLevel: value }),
  toggleScopePause: () => set((state) => ({ scopePaused: !state.scopePaused })),
  
  setLibraryFilter: (filter) => set({ libraryFilter: filter }),
  setLibraryCategory: (category) => set({ libraryCategory: category }),
  
  startDraggingModule: () => set({ isDraggingModule: true }),
  stopDraggingModule: () => set({ isDraggingModule: false }),
  
  startDraggingCable: (moduleId, portId) => set({
    isDraggingCable: true,
    dragStartPort: { moduleId, portId },
  }),
  
  stopDraggingCable: () => set({
    isDraggingCable: false,
    dragStartPort: null,
  }),
}));
