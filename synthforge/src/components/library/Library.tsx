import { useState, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { moduleDefinitions, moduleCategories } from '../../lib/modules';
import { MODULE_ICONS, HP_WIDTH_PX } from '../../lib/constants';

export function Library() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(moduleCategories.map(c => c.id))
  );
  
  const { addModule, modules } = useProjectStore();

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleAddModule = useCallback((moduleId: string) => {
    // Calculate position for new module (find empty space)
    const existingXPositions = modules.map(m => m.position.x);
    let newX = 20;
    
    // Find first gap
    existingXPositions.sort((a, b) => a - b);
    for (const x of existingXPositions) {
      const def = moduleDefinitions[moduleId];
      if (def && x >= newX + def.hp * HP_WIDTH_PX + 10) {
        break;
      }
      const moduleDef = modules.find(m => m.position.x === x);
      if (moduleDef) {
        const mDef = moduleDefinitions[moduleDef.definitionId];
        if (mDef) {
          newX = Math.max(newX, x + mDef.hp * HP_WIDTH_PX + 10);
        }
      }
    }

    addModule(moduleId, { x: newX, y: 20 });
  }, [addModule, modules]);

  // Filter modules based on search
  const filteredCategories = moduleCategories.map(category => ({
    ...category,
    modules: category.modules.filter(moduleId => {
      const def = moduleDefinitions[moduleId];
      if (!def) return false;
      const searchLower = search.toLowerCase();
      return def.name.toLowerCase().includes(searchLower) ||
             def.type.toLowerCase().includes(searchLower);
    }),
  })).filter(category => category.modules.length > 0);

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Module Library</h2>
        <input
          type="text"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-bg-tertiary border border-gray-700 rounded outline-none focus:border-accent-primary text-text-primary placeholder-text-muted"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map(category => (
          <div key={category.id} className="border-b border-gray-800">
            {/* Category header */}
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

            {/* Category modules */}
            {expandedCategories.has(category.id) && (
              <div className="pb-2">
                {category.modules.map(moduleId => {
                  const def = moduleDefinitions[moduleId];
                  if (!def) return null;
                  const icon = MODULE_ICONS[def.type] || '◼';

                  return (
                    <button
                      key={moduleId}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-bg-tertiary group"
                      onClick={() => handleAddModule(moduleId)}
                      title={`Add ${def.name} (${def.hp}HP)`}
                    >
                      <span
                        className="w-8 h-8 rounded flex items-center justify-center text-lg"
                        style={{ backgroundColor: def.color || '#2a2a2a' }}
                      >
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">
                          {def.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {def.hp}HP • {def.inputs.length}in • {def.outputs.length}out
                        </div>
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

      {/* Quick tips */}
      <div className="p-3 border-t border-gray-800 bg-bg-tertiary">
        <div className="text-xs text-text-muted space-y-1">
          <div>💡 Click modules to add them</div>
          <div>🔌 Drag from outputs to inputs</div>
          <div>⌨️ Space to play/stop</div>
        </div>
      </div>
    </div>
  );
}
