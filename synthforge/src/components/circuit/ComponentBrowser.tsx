import { useState } from 'react';
import { componentCategories, componentLibrary } from '../../lib/circuit/components';
import { useCircuitStore } from '../../stores/circuitStore';
import { exampleCircuits } from '../../lib/circuit/examples';

export function ComponentBrowser() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(componentCategories.map(c => c.id))
  );
  const [showExamples, setShowExamples] = useState(true);
  
  const { startPlacing, loadExample, newCircuit, circuit, isPlacing, placingComponentType } = useCircuitStore();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Component Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => newCircuit()}
            className="flex-1 px-2 py-1.5 text-xs bg-bg-tertiary hover:bg-gray-700 text-text-primary rounded"
          >
            + New Circuit
          </button>
        </div>
      </div>

      {/* Examples Section */}
      <div className="border-b border-gray-800">
        <button
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-bg-tertiary"
          onClick={() => setShowExamples(!showExamples)}
        >
          <span className="text-xs font-medium text-accent-primary uppercase tracking-wide">
            📚 Example Circuits
          </span>
          <span className="text-text-muted text-xs">{showExamples ? '−' : '+'}</span>
        </button>
        
        {showExamples && (
          <div className="pb-2">
            {exampleCircuits.map(example => (
              <button
                key={example.id}
                className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-bg-tertiary group"
                onClick={() => loadExample(example.id)}
              >
                <span className="text-lg">🔌</span>
                <span className="text-sm text-text-primary">{example.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Components */}
      <div className="flex-1 overflow-y-auto">
        {componentCategories.map(category => (
          <div key={category.id} className="border-b border-gray-800">
            <button
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-bg-tertiary"
              onClick={() => toggleCategory(category.id)}
            >
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {category.name}
              </span>
              <span className="text-text-muted text-xs">
                {expandedCategories.has(category.id) ? '−' : '+'}
              </span>
            </button>

            {expandedCategories.has(category.id) && (
              <div className="pb-2">
                {category.types.map(type => {
                  const def = componentLibrary[type];
                  if (!def) return null;
                  
                  const isCurrentlyPlacing = isPlacing && placingComponentType === type;

                  return (
                    <button
                      key={type}
                      className={`
                        w-full px-3 py-2 flex items-center gap-2 text-left group
                        ${isCurrentlyPlacing 
                          ? 'bg-accent-primary/20 border-l-2 border-accent-primary' 
                          : 'hover:bg-bg-tertiary'}
                      `}
                      onClick={() => startPlacing(type)}
                    >
                      <span className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center text-sm font-bold text-text-secondary">
                        {def.symbol}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">{def.name}</div>
                        <div className="text-[10px] text-text-muted truncate">{def.pins.length} pins</div>
                      </div>
                      <span className="text-accent-primary text-lg opacity-0 group-hover:opacity-100">
                        +
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help */}
      <div className="p-3 border-t border-gray-800 bg-bg-tertiary">
        <div className="text-xs text-text-muted space-y-1">
          <div>🖱️ Click to place component</div>
          <div>🔌 Drag from pins to wire</div>
          <div>⌫ Delete selected</div>
          <div>⎋ Cancel action</div>
        </div>
        {circuit && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-text-secondary">
            Current: <span className="text-accent-primary">{circuit.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
