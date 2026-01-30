import { create } from 'zustand';
import { ModuleInstance, Cable, ModuleDefinition, ProjectSettings } from '../lib/types';
import { generateId } from '../lib/utils';
import { CABLE_COLORS } from '../lib/types';
import { DEFAULT_SAMPLE_RATE, DEFAULT_BUFFER_SIZE } from '../lib/constants';

interface ProjectState {
  // Project metadata
  projectId: string;
  projectName: string;
  modified: boolean;
  
  // Core data
  modules: ModuleInstance[];
  cables: Cable[];
  customModules: ModuleDefinition[];
  
  // Settings
  settings: ProjectSettings;
  
  // Selection
  selectedModuleIds: string[];
  selectedCableIds: string[];
  
  // Actions
  addModule: (definitionId: string, position: { x: number; y: number }) => string;
  removeModule: (moduleId: string) => void;
  updateModulePosition: (moduleId: string, position: { x: number; y: number }) => void;
  updateModuleControl: (moduleId: string, controlId: string, value: number) => void;
  
  addCable: (from: { moduleId: string; portId: string }, to: { moduleId: string; portId: string }) => string | null;
  removeCable: (cableId: string) => void;
  
  selectModule: (moduleId: string, additive?: boolean) => void;
  selectCable: (cableId: string, additive?: boolean) => void;
  clearSelection: () => void;
  
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  
  // Project management
  newProject: () => void;
  loadProject: (data: string) => void;
  saveProject: () => string;
  setProjectName: (name: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projectId: generateId(),
  projectName: 'Untitled',
  modified: false,
  
  modules: [],
  cables: [],
  customModules: [],
  
  settings: {
    sampleRate: DEFAULT_SAMPLE_RATE,
    bufferSize: DEFAULT_BUFFER_SIZE,
    masterVolume: 0.8,
  },
  
  selectedModuleIds: [],
  selectedCableIds: [],
  
  // Module actions
  addModule: (definitionId, position) => {
    const id = generateId();
    const newModule: ModuleInstance = {
      id,
      definitionId,
      position,
      controlValues: {},
    };
    
    set(state => ({
      modules: [...state.modules, newModule],
      modified: true,
    }));
    
    return id;
  },
  
  removeModule: (moduleId) => {
    set(state => ({
      modules: state.modules.filter(m => m.id !== moduleId),
      cables: state.cables.filter(c => c.from.moduleId !== moduleId && c.to.moduleId !== moduleId),
      selectedModuleIds: state.selectedModuleIds.filter(id => id !== moduleId),
      modified: true,
    }));
  },
  
  updateModulePosition: (moduleId, position) => {
    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId ? { ...m, position } : m
      ),
      modified: true,
    }));
  },
  
  updateModuleControl: (moduleId, controlId, value) => {
    set(state => ({
      modules: state.modules.map(m =>
        m.id === moduleId
          ? { ...m, controlValues: { ...m.controlValues, [controlId]: value } }
          : m
      ),
      modified: true,
    }));
  },
  
  // Cable actions
  addCable: (from, to) => {
    // Don't allow connecting to same module
    if (from.moduleId === to.moduleId) return null;
    
    // Check if cable already exists
    const exists = get().cables.some(
      c => (c.from.moduleId === from.moduleId && c.from.portId === from.portId &&
            c.to.moduleId === to.moduleId && c.to.portId === to.portId) ||
           (c.from.moduleId === to.moduleId && c.from.portId === to.portId &&
            c.to.moduleId === from.moduleId && c.to.portId === from.portId)
    );
    
    if (exists) return null;
    
    const id = generateId();
    const colorIndex = get().cables.length % CABLE_COLORS.length;
    
    const newCable: Cable = {
      id,
      from,
      to,
      color: CABLE_COLORS[colorIndex],
    };
    
    set(state => ({
      cables: [...state.cables, newCable],
      modified: true,
    }));
    
    return id;
  },
  
  removeCable: (cableId) => {
    set(state => ({
      cables: state.cables.filter(c => c.id !== cableId),
      selectedCableIds: state.selectedCableIds.filter(id => id !== cableId),
      modified: true,
    }));
  },
  
  // Selection actions
  selectModule: (moduleId, additive = false) => {
    set(state => ({
      selectedModuleIds: additive
        ? state.selectedModuleIds.includes(moduleId)
          ? state.selectedModuleIds.filter(id => id !== moduleId)
          : [...state.selectedModuleIds, moduleId]
        : [moduleId],
      selectedCableIds: additive ? state.selectedCableIds : [],
    }));
  },
  
  selectCable: (cableId, additive = false) => {
    set(state => ({
      selectedCableIds: additive
        ? state.selectedCableIds.includes(cableId)
          ? state.selectedCableIds.filter(id => id !== cableId)
          : [...state.selectedCableIds, cableId]
        : [cableId],
      selectedModuleIds: additive ? state.selectedModuleIds : [],
    }));
  },
  
  clearSelection: () => {
    set({ selectedModuleIds: [], selectedCableIds: [] });
  },
  
  // Settings
  updateSettings: (newSettings) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings },
      modified: true,
    }));
  },
  
  // Project management
  newProject: () => {
    set({
      projectId: generateId(),
      projectName: 'Untitled',
      modified: false,
      modules: [],
      cables: [],
      customModules: [],
      selectedModuleIds: [],
      selectedCableIds: [],
      settings: {
        sampleRate: DEFAULT_SAMPLE_RATE,
        bufferSize: DEFAULT_BUFFER_SIZE,
        masterVolume: 0.8,
      },
    });
  },
  
  loadProject: (data) => {
    try {
      const project = JSON.parse(data);
      set({
        projectId: project.id || generateId(),
        projectName: project.name || 'Untitled',
        modified: false,
        modules: project.modules || [],
        cables: project.cables || [],
        customModules: project.customModules || [],
        settings: { ...get().settings, ...project.settings },
        selectedModuleIds: [],
        selectedCableIds: [],
      });
    } catch (e) {
      console.error('Failed to load project:', e);
    }
  },
  
  saveProject: () => {
    const state = get();
    const project = {
      id: state.projectId,
      name: state.projectName,
      version: '0.1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      modules: state.modules,
      cables: state.cables,
      customModules: state.customModules,
      settings: state.settings,
    };
    
    set({ modified: false });
    return JSON.stringify(project, null, 2);
  },
  
  setProjectName: (name) => {
    set({ projectName: name, modified: true });
  },
}));
