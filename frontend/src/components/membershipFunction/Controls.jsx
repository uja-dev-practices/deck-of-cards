import { useState } from 'react';

function SliderInput({ label, value, min, max, step, color, onChange, decimals = 3 }) {
  const [draft, setDraft] = useState(null);

  const numericValue = Number(value);
  const displayValue = draft !== null ? draft : numericValue.toFixed(decimals);

  const commitDraft = () => {
    if (draft === null) return;

    const trimmed = draft.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
      setDraft(null);
      return;
    }

    const parsed = parseFloat(trimmed);
    if (Number.isNaN(parsed)) {
      setDraft(null);
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setDraft(null);
  };

  const handleNumberChange = (e) => {
    const raw = e.target.value;

    if (raw === '') {
      setDraft('');
      return;
    }

    const num = e.target.valueAsNumber;

    if (Number.isNaN(num)) {
      setDraft(raw);
      return;
    }

    if (num > max) {
      setDraft(max.toFixed(decimals));
      onChange(max);
      return;
    }

    if (num < min) {
      setDraft(raw);
      return;
    }

    setDraft(raw);
    onChange(num);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setDraft(null);
      e.currentTarget.blur();
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 cursor-pointer h-1.5"
          style={{ accentColor: color }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleNumberChange}
          onBlur={commitDraft}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md text-center shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow tabular-nums"
          style={{ '--tw-ring-color': color, borderColor: draft !== null ? color : undefined }}
        />
      </div>
    </div>
  );
}

const MF_STEP = 0.001;
const snapToMfStep = (v) => Math.round(Number(v) / MF_STEP) * MF_STEP;

export default function Controls({
  selectedTerm, currentMf, selectedColor, baseScale, mfDefinitions, updateCurrentMf,
  subscales, onOpenSubscale
}) {
  if (!selectedTerm || !currentMf) return null;

  const scaleKeys = Object.keys(baseScale);
  const selectedIndex = scaleKeys.indexOf(selectedTerm);

  const prevTerm = selectedIndex > 0 ? mfDefinitions[scaleKeys[selectedIndex - 1]] : null;
  const nextTerm = selectedIndex < scaleKeys.length - 1 ? mfDefinitions[scaleKeys[selectedIndex + 1]] : null;

  const anchor = snapToMfStep(baseScale[selectedTerm]);

  const bounds = {
    supportStart: { min: snapToMfStep(prevTerm?.coreEnd     ?? 0), max: anchor },
    coreStart:    { min: snapToMfStep(prevTerm?.supportEnd  ?? 0), max: anchor },
    coreEnd:      { min: anchor, max: snapToMfStep(nextTerm?.supportStart ?? 1) },
    supportEnd:   { min: anchor, max: snapToMfStep(nextTerm?.coreStart    ?? 1) },
  };

  const leftSubscale = subscales?.[selectedTerm]?.left;
  const rightSubscale = subscales?.[selectedTerm]?.right;

  const commonProps = { step: 0.001, color: selectedColor };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: selectedColor }}></div>
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        Ajustando: <span style={{ color: selectedColor }}>"{selectedTerm}"</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <SliderInput
            {...commonProps}
            {...bounds.supportStart}
            label="Inicio del Soporte (Punto inferior)"
            value={currentMf.supportStart}
            onChange={(v) => updateCurrentMf('supportStart', v)}
          />
          <SliderInput
            {...commonProps}
            {...bounds.coreStart}
            label="Inicio del Núcleo (Punto superior)"
            value={currentMf.coreStart}
            onChange={(v) => updateCurrentMf('coreStart', v)}
          />

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
          <SliderInput
            {...commonProps}
            {...bounds.supportEnd}
            label="Fin del Soporte (Punto inferior)"
            value={currentMf.supportEnd}
            onChange={(v) => updateCurrentMf('supportEnd', v)}
          />
          <SliderInput
            {...commonProps}
            {...bounds.coreEnd}
            label="Fin del Núcleo (Punto superior)"
            value={currentMf.coreEnd}
            onChange={(v) => updateCurrentMf('coreEnd', v)}
          />

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
