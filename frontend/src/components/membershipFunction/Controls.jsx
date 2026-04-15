export default function Controls({ 
  selectedTerm, currentMf, selectedColor, baseScale, mfDefinitions, updateCurrentMf,
  subscales, onOpenSubscale
}) {
  if (!selectedTerm || !currentMf) return null;

  const scaleKeys = Object.keys(baseScale);
  const selectedIndex = scaleKeys.indexOf(selectedTerm);
  
  let absoluteMin = 0, absoluteMax = 1;
  if (selectedIndex > 0) absoluteMin = mfDefinitions[scaleKeys[selectedIndex - 1]].coreEnd;
  if (selectedIndex < scaleKeys.length - 1) absoluteMax = mfDefinitions[scaleKeys[selectedIndex + 1]].coreStart;

  const leftSubscale = subscales?.[selectedTerm]?.left;
  const rightSubscale = subscales?.[selectedTerm]?.right;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: selectedColor }}></div>
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        Ajustando: <span style={{ color: selectedColor }}>"{selectedTerm}"</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Inicio del Soporte (Punto inferior)</span><span style={{ color: selectedColor }}>{currentMf.supportStart.toFixed(3)}</span>
            </label>
            <input type="range" min={absoluteMin} max={absoluteMax} step="0.001" value={currentMf.supportStart} onChange={(e) => updateCurrentMf('supportStart', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Inicio del Núcleo (Punto superior)</span><span style={{ color: selectedColor }}>{currentMf.coreStart.toFixed(3)}</span>
            </label>
            <input type="range" min={absoluteMin} max={absoluteMax} step="0.001" value={currentMf.coreStart} onChange={(e) => updateCurrentMf('coreStart', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor }} />
          </div>
          
          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button 
              onClick={() => onOpenSubscale(selectedTerm, 'left', leftSubscale)}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-all border ${leftSubscale ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {leftSubscale ? `✎ Subescala (Cartas: ${leftSubscale.cardsCount})` : '+ Añadir Subescala'}
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Fin del Soporte (Punto inferior)</span><span style={{ color: selectedColor }}>{currentMf.supportEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={absoluteMin} max={absoluteMax} step="0.001" value={currentMf.supportEnd} onChange={(e) => updateCurrentMf('supportEnd', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Fin del Núcleo (Punto superior)</span><span style={{ color: selectedColor }}>{currentMf.coreEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={absoluteMin} max={absoluteMax} step="0.001" value={currentMf.coreEnd} onChange={(e) => updateCurrentMf('coreEnd', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor }} />
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button 
              onClick={() => onOpenSubscale(selectedTerm, 'right', rightSubscale)}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-all border ${rightSubscale ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {rightSubscale ? `✎ Subescala (Cartas: ${rightSubscale.cardsCount})` : '+ Añadir Subescala'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}