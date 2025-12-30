import { create } from 'zustand';
import { 
  Circuit, 
  ComponentInstance, 
  Wire, 
  ComponentType 
} from '../lib/circuit/types';
import { componentLibrary } from '../lib/circuit/components';
import { circuitSimulator } from '../lib/circuit/simulator';
import { exampleCircuits } from '../lib/circuit/examples';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

interface CircuitState {
  // Current circuit
  circuit: Circuit | null;
  
  // Selection
  selectedComponentIds: string[];
  selectedWireIds: string[];
  
  // Editing state
  isPlacing: boolean;
  placingComponentType: ComponentType | null;
  isWiring: boolean;
  wiringFrom: { componentId: string; pinId: string } | null;
  
  // Simulation
  isRunning: boolean;
  scopeData: Map<string, Float32Array>;
  
  // Actions
  newCircuit: (name?: string) => void;
  loadCircuit: (circuit: Circuit) => void;
  loadExample: (exampleId: string) => void;
  saveCircuit: () => string;
  
  // Component actions
  addComponent: (type: ComponentType, position: { x: number; y: number }) => string;
  removeComponent: (componentId: string) => void;
  updateComponentPosition: (componentId: string, position: { x: number; y: number }) => void;
  updateComponentParam: (componentId: string, paramId: string, value: number) => void;
  rotateComponent: (componentId: string) => void;
  
  // Wire actions
  startWiring: (componentId: string, pinId: string) => void;
  endWiring: (componentId: string, pinId: string) => void;
  cancelWiring: () => void;
  removeWire: (wireId: string) => void;
  
  // Selection
  selectComponent: (componentId: string, additive?: boolean) => void;
  selectWire: (wireId: string, additive?: boolean) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  
  // Placement mode
  startPlacing: (type: ComponentType) => void;
  cancelPlacing: () => void;
  
  // Simulation
  startSimulation: () => void;
  stopSimulation: () => void;
  updateScopeData: (probeId: string, data: Float32Array) => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: null,
  selectedComponentIds: [],
  selectedWireIds: [],
  isPlacing: false,
  placingComponentType: null,
  isWiring: false,
  wiringFrom: null,
  isRunning: false,
  scopeData: new Map(),
  
  // Circuit management
  newCircuit: (name = 'Untitled Circuit') => {
    const circuit: Circuit = {
      id: generateId(),
      name,
      components: [],
      wires: [],
      nodes: [],
    };
    set({ circuit, selectedComponentIds: [], selectedWireIds: [] });
    circuitSimulator.setCircuit(circuit);
  },
  
  loadCircuit: (circuit) => {
    set({ circuit, selectedComponentIds: [], selectedWireIds: [] });
    circuitSimulator.setCircuit(circuit);
  },
  
  loadExample: (exampleId) => {
    const example = exampleCircuits.find(e => e.id === exampleId);
    if (example) {
      const circuit = example.factory();
      set({ circuit, selectedComponentIds: [], selectedWireIds: [] });
      circuitSimulator.setCircuit(circuit);
    }
  },
  
  saveCircuit: () => {
    const { circuit } = get();
    return JSON.stringify(circuit, null, 2);
  },
  
  // Component actions
  addComponent: (type, position) => {
    const { circuit } = get();
    if (!circuit) return '';
    
    const def = componentLibrary[type];
    if (!def) return '';
    
    const id = generateId();
    const component: ComponentInstance = {
      id,
      type,
      params: { ...def.defaultParams },
      position,
      rotation: 0,
      state: {},
      pins: def.pins.map(p => ({
        ...p,
        voltage: 0,
        current: 0,
      })),
    };
    
    const newCircuit = {
      ...circuit,
      components: [...circuit.components, component],
    };
    
    set({ circuit: newCircuit, isPlacing: false, placingComponentType: null });
    circuitSimulator.setCircuit(newCircuit);
    
    return id;
  },
  
  removeComponent: (componentId) => {
    const { circuit } = get();
    if (!circuit) return;
    
    const newCircuit = {
      ...circuit,
      components: circuit.components.filter(c => c.id !== componentId),
      wires: circuit.wires.filter(w => 
        w.from.componentId !== componentId && w.to.componentId !== componentId
      ),
    };
    
    set({ 
      circuit: newCircuit,
      selectedComponentIds: get().selectedComponentIds.filter(id => id !== componentId),
    });
    circuitSimulator.setCircuit(newCircuit);
  },
  
  updateComponentPosition: (componentId, position) => {
    const { circuit } = get();
    if (!circuit) return;
    
    const newCircuit = {
      ...circuit,
      components: circuit.components.map(c =>
        c.id === componentId ? { ...c, position } : c
      ),
    };
    
    set({ circuit: newCircuit });
  },
  
  updateComponentParam: (componentId, paramId, value) => {
    const { circuit } = get();
    if (!circuit) return;
    
    const newCircuit = {
      ...circuit,
      components: circuit.components.map(c =>
        c.id === componentId ? { ...c, params: { ...c.params, [paramId]: value } } : c
      ),
    };
    
    set({ circuit: newCircuit });
    circuitSimulator.setCircuit(newCircuit);
  },
  
  rotateComponent: (componentId) => {
    const { circuit } = get();
    if (!circuit) return;
    
    const newCircuit = {
      ...circuit,
      components: circuit.components.map(c =>
        c.id === componentId ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      ),
    };
    
    set({ circuit: newCircuit });
  },
  
  // Wire actions
  startWiring: (componentId, pinId) => {
    set({ isWiring: true, wiringFrom: { componentId, pinId } });
  },
  
  endWiring: (componentId, pinId) => {
    const { circuit, wiringFrom } = get();
    if (!circuit || !wiringFrom) return;
    
    // Don't wire to same component
    if (wiringFrom.componentId === componentId) {
      set({ isWiring: false, wiringFrom: null });
      return;
    }
    
    // Check if wire already exists
    const exists = circuit.wires.some(w =>
      (w.from.componentId === wiringFrom.componentId && w.from.pinId === wiringFrom.pinId &&
       w.to.componentId === componentId && w.to.pinId === pinId) ||
      (w.from.componentId === componentId && w.from.pinId === pinId &&
       w.to.componentId === wiringFrom.componentId && w.to.pinId === wiringFrom.pinId)
    );
    
    if (exists) {
      set({ isWiring: false, wiringFrom: null });
      return;
    }
    
    const wire: Wire = {
      id: generateId(),
      from: wiringFrom,
      to: { componentId, pinId },
    };
    
    const newCircuit = {
      ...circuit,
      wires: [...circuit.wires, wire],
    };
    
    set({ circuit: newCircuit, isWiring: false, wiringFrom: null });
    circuitSimulator.setCircuit(newCircuit);
  },
  
  cancelWiring: () => {
    set({ isWiring: false, wiringFrom: null });
  },
  
  removeWire: (wireId) => {
    const { circuit } = get();
    if (!circuit) return;
    
    const newCircuit = {
      ...circuit,
      wires: circuit.wires.filter(w => w.id !== wireId),
    };
    
    set({ 
      circuit: newCircuit,
      selectedWireIds: get().selectedWireIds.filter(id => id !== wireId),
    });
    circuitSimulator.setCircuit(newCircuit);
  },
  
  // Selection
  selectComponent: (componentId, additive = false) => {
    set(state => ({
      selectedComponentIds: additive
        ? state.selectedComponentIds.includes(componentId)
          ? state.selectedComponentIds.filter(id => id !== componentId)
          : [...state.selectedComponentIds, componentId]
        : [componentId],
      selectedWireIds: additive ? state.selectedWireIds : [],
    }));
  },
  
  selectWire: (wireId, additive = false) => {
    set(state => ({
      selectedWireIds: additive
        ? state.selectedWireIds.includes(wireId)
          ? state.selectedWireIds.filter(id => id !== wireId)
          : [...state.selectedWireIds, wireId]
        : [wireId],
      selectedComponentIds: additive ? state.selectedComponentIds : [],
    }));
  },
  
  clearSelection: () => {
    set({ selectedComponentIds: [], selectedWireIds: [] });
  },
  
  deleteSelected: () => {
    const { selectedComponentIds, selectedWireIds, removeComponent, removeWire } = get();
    selectedWireIds.forEach(id => removeWire(id));
    selectedComponentIds.forEach(id => removeComponent(id));
  },
  
  // Placement mode
  startPlacing: (type) => {
    set({ isPlacing: true, placingComponentType: type });
  },
  
  cancelPlacing: () => {
    set({ isPlacing: false, placingComponentType: null });
  },
  
  // Simulation
  startSimulation: () => {
    set({ isRunning: true });
  },
  
  stopSimulation: () => {
    set({ isRunning: false });
    circuitSimulator.reset();
  },
  
  updateScopeData: (probeId, data) => {
    set(state => {
      const newMap = new Map(state.scopeData);
      newMap.set(probeId, data);
      return { scopeData: newMap };
    });
  },
}));
