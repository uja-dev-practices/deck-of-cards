import React from 'react';

export default function MembershipFunctionControls({ selectedTerm, currentMf, selectedColor, baseScale, updateCurrentMf }) {
  if (!selectedTerm || !currentMf) return null;

  const scaleKeys = Object.keys(baseScale);
  const selectedIndex = scaleKeys.indexOf(selectedTerm);
  
  let minBound = 0;
  let maxBound = 1;

  if (selectedIndex > 0) {
    minBound = baseScale[scaleKeys[selectedIndex - 1]];
  }
  if (selectedIndex >= 0 && selectedIndex < scaleKeys.length - 1) {
    maxBound = baseScale[scaleKeys[selectedIndex + 1]];
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: selectedColor }}></div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        Ajustando franjas para: <span style={{ color: selectedColor }}>"{selectedTerm}"</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
              <span>Inicio del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreStart.toFixed(3)}</span>
            </label>
            <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.coreStart} onChange={(e) => updateCurrentMf('coreStart', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor }} />
          </div>
          
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
              <span>Inicio del Soporte (Límite: {minBound.toFixed(2)})</span><span style={{ color: selectedColor }}>{currentMf.supportStart.toFixed(3)}</span>
            </label>
            <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.supportStart} onChange={(e) => updateCurrentMf('supportStart', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
              <span>Fin del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.coreEnd} onChange={(e) => updateCurrentMf('coreEnd', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor }} />
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
              <span>Fin del Soporte (Límite: {maxBound.toFixed(2)})</span><span style={{ color: selectedColor }}>{currentMf.supportEnd.toFixed(3)}</span>
            </label>
            <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.supportEnd} onChange={(e) => updateCurrentMf('supportEnd', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor, opacity: 0.7 }} />
          </div>
        </div>

      </div>
    </div>
  );
}