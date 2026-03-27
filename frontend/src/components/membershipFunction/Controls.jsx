export default function Controls({ selectedTerm, currentMf, selectedColor, baseScale, mfDefinitions, updateCurrentMf }) {
  if (!selectedTerm || !currentMf) return null;

  const scaleKeys = Object.keys(baseScale);
  const selectedIndex = scaleKeys.indexOf(selectedTerm);
  
  let prevCoreEnd = 0, prevSupportEnd = 0, nextCoreStart = 1, nextSupportStart = 1;

  if (selectedIndex > 0) {
    const prevTerm = scaleKeys[selectedIndex - 1];
    prevCoreEnd = mfDefinitions[prevTerm].coreEnd;
    prevSupportEnd = mfDefinitions[prevTerm].supportEnd;
  }
  if (selectedIndex < scaleKeys.length - 1) {
    const nextTerm = scaleKeys[selectedIndex + 1];
    nextCoreStart = mfDefinitions[nextTerm].coreStart;
    nextSupportStart = mfDefinitions[nextTerm].supportStart;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: selectedColor }}></div>
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        Ajustando: <span style={{ color: selectedColor }}>"{selectedTerm}"</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Inicio del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreStart.toFixed(3)}</span>
            </label>
            <input type="range" min={prevSupportEnd} max={nextCoreStart} step="0.001" value={currentMf.coreStart} onChange={(e) => updateCurrentMf('coreStart', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor }} />
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Inicio del Soporte</span><span style={{ color: selectedColor }}>{currentMf.supportStart.toFixed(3)}</span>
            </label>
            <input type="range" min={prevCoreEnd} max={nextCoreStart} step="0.001" value={currentMf.supportStart} onChange={(e) => updateCurrentMf('supportStart', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Fin del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={prevCoreEnd} max={nextSupportStart} step="0.001" value={currentMf.coreEnd} onChange={(e) => updateCurrentMf('coreEnd', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor }} />
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Fin del Soporte</span><span style={{ color: selectedColor }}>{currentMf.supportEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={prevCoreEnd} max={nextCoreStart} step="0.001" value={currentMf.supportEnd} onChange={(e) => updateCurrentMf('supportEnd', e.target.value)} className="w-full cursor-pointer h-1.5" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </div>
  );
}