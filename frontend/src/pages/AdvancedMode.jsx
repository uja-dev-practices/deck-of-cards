import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import CriterionInput from '../components/CriterionInput';
import CardEditor from '../components/CardEditor';
import BlankCardsCounter from '../components/BlankCardsCounter';
import AddLevelButton from '../components/AddLevelButton';
import { calculateValueFunction } from '../services/docService';

const COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#d946ef',
  '#06b6d4',
  '#8b5cf6',
  '#f43f5e',
  '#6366f1'
];

export default function AdvancedMode() {

  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  const [criterionName, setCriterionName] = useState('');
  const [levels, setLevels] = useState(['', '', '']); 
  const [blankCards, setBlankCards] = useState([0, 0]);
  const [errors, setErrors] = useState({ criterion: false, levels: [] });
  
  const [baseScale, setBaseScale] = useState({}); 
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [mfDefinitions, setMfDefinitions] = useState({});

  const handleCriterionChange = (val) => {
    setCriterionName(val);
    if (errors.criterion) setErrors({ ...errors, criterion: false });
  };

  const handleLevelChange = (index, newValue) => {
    const newLevels = [...levels];
    newLevels[index] = newValue;
    setLevels(newLevels);
    if (errors.levels[index]) setErrors({ ...errors, levels: errors.levels.map((e, i) => i === index ? false : e) });
  };

  const handleAddLevel = () => {
    setLevels([...levels, '']);
    setBlankCards([...blankCards, 0]); 
    setErrors({ ...errors, levels: [...errors.levels, false] });
  };

  const handleRemoveLevel = (indexToRemove) => {
    if (levels.length <= 3) return; 
    const newLevels = levels.filter((_, index) => index !== indexToRemove);
    const blankIndexToRemove = indexToRemove === 0 ? 0 : indexToRemove - 1;
    const newBlankCards = blankCards.filter((_, index) => index !== blankIndexToRemove);
    setLevels(newLevels);
    setBlankCards(newBlankCards);
    setErrors({ ...errors, levels: errors.levels.filter((_, index) => index !== indexToRemove) });
  };

  const handleBlankCardChange = (index, delta) => {
    const newBlankCards = [...blankCards];
    const newValue = newBlankCards[index] + delta;
    if (newValue >= 0) {
      newBlankCards[index] = newValue;
      setBlankCards(newBlankCards);
    }
  };

  const handleGenerateBaseScale = async () => {
    let hasError = false;
    const newErrors = { criterion: false, levels: Array(levels.length).fill(false) };
    if (!criterionName.trim()) { newErrors.criterion = true; hasError = true; }
    levels.forEach((lvl, idx) => { if (!lvl.trim()) { newErrors.levels[idx] = true; hasError = true; }});
    setErrors(newErrors);
    
    if (hasError) return alert("Por favor, rellena todos los campos de la escala base.");

    setIsLoading(true);

    try {
      const payloadBase = {
        criterion_name: criterionName.trim(),
        levels: levels.map(l => l.trim()),
        blank_cards: blankCards,
        references: { "0": 0, [(levels.length - 1).toString()]: 1 }
      };
      
      const baseResult = await calculateValueFunction(payloadBase);
      const calculatedValues = baseResult.values;
      setBaseScale(calculatedValues);

      const initialMfs = {};
      Object.entries(calculatedValues).forEach(([name, value]) => {
        initialMfs[name] = {
          supportStart: value,
          coreStart: value,
          coreEnd: value,
          supportEnd: value
        };
      });
      setMfDefinitions(initialMfs);
      setSelectedTerm(Object.keys(calculatedValues)[0]);
      setStep(2);

    } catch (error) {
      alert("Error al conectar con el backend: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentMf = (field, value) => {
    if (!selectedTerm) return;
    const numValue = parseFloat(value);
    
    setMfDefinitions(prev => {
      const current = { ...prev[selectedTerm], [field]: numValue };
      
      // Reglas de colisión internas
      if (field === 'supportStart' && current.supportStart > current.coreStart) current.coreStart = current.supportStart;
      if (field === 'coreStart') {
        if (current.coreStart < current.supportStart) current.supportStart = current.coreStart;
        if (current.coreStart > current.coreEnd) current.coreEnd = current.coreStart;
      }
      if (field === 'coreEnd') {
        if (current.coreEnd < current.coreStart) current.coreStart = current.coreEnd;
        if (current.coreEnd > current.supportEnd) current.supportEnd = current.coreEnd;
      }
      if (field === 'supportEnd' && current.supportEnd < current.coreEnd) current.coreEnd = current.supportEnd;

      return { ...prev, [selectedTerm]: current };
    });
  };

  const handleFinalSubmit = () => {
    console.log("DATOS FINALES LISTOS PARA EL BACKEND:", {
      base_scale: baseScale,
      membership_functions: mfDefinitions
    });
    alert("¡Mira la consola! El JSON está preparado.");
  };

  // Cálculo de límites verticales
  const scaleKeys = Object.keys(baseScale);
  const selectedIndex = scaleKeys.indexOf(selectedTerm);
  const selectedColor = COLORS[selectedIndex % COLORS.length] || '#2563eb';
  const currentMf = selectedTerm ? mfDefinitions[selectedTerm] : null;

  let minBound = 0;
  let maxBound = 1;

  if (selectedIndex > 0) {
    minBound = baseScale[scaleKeys[selectedIndex - 1]];
  }
  if (selectedIndex >= 0 && selectedIndex < scaleKeys.length - 1) {
    maxBound = baseScale[scaleKeys[selectedIndex + 1]];
  }

  
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Paso 1: Definir la escala */}
      {step === 1 && (
        <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-12 flex flex-col items-center animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 w-full border-b pb-4">
            Paso 1: Definir Escala de Referencia (Cartas)
          </h2>
          <CriterionInput criterionName={criterionName} setCriterionName={handleCriterionChange} error={errors.criterion} />
          <div className="w-full max-w-lg flex flex-col items-center">
            {levels.map((level, index) => (
              <div key={index} className="w-full flex flex-col items-center">
                <CardEditor index={index} level={level} handleLevelChange={handleLevelChange} handleRemoveLevel={handleRemoveLevel} totalLevels={levels.length} error={errors.levels[index]} canRemove={levels.length > 3} />
                {index < levels.length - 1 && (
                  <BlankCardsCounter index={index} blankCardsCount={blankCards[index]} handleBlankCardChange={handleBlankCardChange} />
                )}
              </div>
            ))}
            <AddLevelButton handleAddLevel={handleAddLevel} />
          </div>
          <div className="w-full max-w-lg mt-12 pt-8 border-t-2 border-slate-200 flex flex-col items-center">
            <button onClick={handleGenerateBaseScale} disabled={isLoading} className={`w-full py-4 text-white text-xl font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
              {isLoading ? 'Calculando...' : 'Generar Gráfica Continua'}
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: conceptos difusos */}
      {step === 2 && (
        <div className="w-full max-w-6xl bg-white p-10 rounded-3xl shadow-sm border border-slate-200 animate-fade-in">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Paso 2: Modelar Conceptos Difusos</h2>
            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 font-semibold underline">← Volver a las cartas</button>
          </div>

          {/* Selectores de etiqueta */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {scaleKeys.map((name, index) => {
              const val = baseScale[name];
              const color = COLORS[index % COLORS.length];
              const isSelected = selectedTerm === name;
              return (
                <button
                  key={name} onClick={() => setSelectedTerm(name)}
                  style={isSelected ? { backgroundColor: color, borderColor: color, color: '#fff' } : { borderColor: color, color: '#475569' }}
                  className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-300 flex flex-col items-center shadow-sm hover:shadow-md ${isSelected ? 'transform scale-105' : 'bg-white opacity-80 hover:opacity-100'}`}
                >
                  <span>{name}</span>
                  <span className="text-xs font-normal opacity-80">(X: {val.toFixed(2)})</span>
                </button>
              );
            })}
          </div>

          {/* Gráfica */}
          <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-200 p-4 mb-10">
            <ResponsiveContainer width="99%" height={450}>
              <ComposedChart data={[]} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]} tick={{ fill: '#475569', fontWeight: 600 }} />
                <YAxis domain={[0, 1]} tick={{ fill: '#475569' }} />
                <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />

                {scaleKeys.map((name, index) => {
                  const val = baseScale[name];
                  const mf = mfDefinitions[name];
                  if (!mf) return null;
                  
                  const color = COLORS[index % COLORS.length];
                  const isSelected = selectedTerm === name;
                  
                  const trapezeData = [
                    { x: mf.supportStart, y: 0 },
                    { x: mf.coreStart, y: 1 },
                    { x: mf.coreEnd, y: 1 },
                    { x: mf.supportEnd, y: 0 },
                  ];

                  return (
                    <React.Fragment key={`mf-${name}`}>

                      <ReferenceLine x={val} stroke={color} strokeDasharray="4 4" strokeWidth={isSelected ? 2 : 1} label={{ position: 'top', value: name, fill: color, fontWeight: isSelected ? '900' : 'normal' }} />
                      
                      <ReferenceArea x1={mf.supportStart} x2={mf.supportEnd} fill={color} fillOpacity={isSelected ? 0.3 : 0.05} />
                      <ReferenceArea x1={mf.coreStart} x2={mf.coreEnd} fill={color} fillOpacity={isSelected ? 0.6 : 0.15} />

                      <Line 
                        data={trapezeData} 
                        dataKey="y" 
                        type="linear" 
                        stroke={color} 
                        strokeWidth={isSelected ? 4 : 2} 
                        dot={isSelected ? { r: 6, fill: color, stroke: '#fff', strokeWidth: 2 } : false} 
                        activeDot={false}
                        isAnimationActive={false} 
                      />
                    </React.Fragment>
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Sliders con restricciones vecinales */}
          {selectedTerm && currentMf && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: selectedColor }}></div>
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                Ajustando franjas para: <span style={{ color: selectedColor }}>"{selectedTerm}"</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Inicio del Soporte (Límite: {minBound.toFixed(2)})</span><span style={{ color: selectedColor }}>{currentMf.supportStart.toFixed(2)}</span>
                    </label>
                    <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.supportStart} onChange={(e) => updateCurrentMf('supportStart', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor, opacity: 0.7 }} />
                  </div>
                  <div>
                    <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Inicio del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreStart.toFixed(2)}</span>
                    </label>
                    <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.coreStart} onChange={(e) => updateCurrentMf('coreStart', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor }} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Fin del Núcleo</span><span style={{ color: selectedColor }}>{currentMf.coreEnd.toFixed(2)}</span>
                    </label>
                    <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.coreEnd} onChange={(e) => updateCurrentMf('coreEnd', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor }} />
                  </div>
                  <div>
                    <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Fin del Soporte (Límite: {maxBound.toFixed(2)})</span><span style={{ color: selectedColor }}>{currentMf.supportEnd.toFixed(2)}</span>
                    </label>
                    <input type="range" min={minBound} max={maxBound} step="0.001" value={currentMf.supportEnd} onChange={(e) => updateCurrentMf('supportEnd', e.target.value)} className="w-full cursor-pointer" style={{ accentColor: selectedColor, opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full mt-12 flex justify-center">
            <button onClick={handleFinalSubmit} className="px-12 py-4 bg-slate-900 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition-all">
              Guardar Todo el Espectro Difuso
            </button>
          </div>

        </div>
      )}
    </div>
  );
}