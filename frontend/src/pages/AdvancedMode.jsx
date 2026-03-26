import React, { useState } from 'react';
import CriterionInput from '../components/CriterionInput';
import CardEditor from '../components/CardEditor';
import BlankCardsCounter from '../components/BlankCardsCounter';
import AddLevelButton from '../components/AddLevelButton';
import Chart from '../components/membershipFunction/Chart';
import Controls from '../components/membershipFunction/Controls';
import { calculateValueFunction } from '../services/docService';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#d946ef', '#06b6d4', '#8b5cf6', '#f43f5e', '#6366f1'];

export default function AdvancedMode() {
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  // Estados Fase 1 (Escala)
  const [criterionName, setCriterionName] = useState('');
  const [levels, setLevels] = useState(['', '', '']); 
  const [blankCards, setBlankCards] = useState([0, 0]);
  const [errors, setErrors] = useState({ criterion: false, levels: [] });
  
  // Estados Fase 2 (Franjas)
  const [baseScale, setBaseScale] = useState({}); 
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [mfDefinitions, setMfDefinitions] = useState({});

  // Manejadores de Escala
  const handleCriterionChange = (val) => { setCriterionName(val); if (errors.criterion) setErrors({ ...errors, criterion: false }); };
  const handleLevelChange = (index, newValue) => { const newLevels = [...levels]; newLevels[index] = newValue; setLevels(newLevels); if (errors.levels[index]) setErrors({ ...errors, levels: errors.levels.map((e, i) => i === index ? false : e) }); };
  const handleAddLevel = () => { setLevels([...levels, '']); setBlankCards([...blankCards, 0]); setErrors({ ...errors, levels: [...errors.levels, false] }); };
  const handleRemoveLevel = (indexToRemove) => { if (levels.length <= 3) return; setLevels(levels.filter((_, i) => i !== indexToRemove)); setBlankCards(blankCards.filter((_, i) => i !== (indexToRemove === 0 ? 0 : indexToRemove - 1))); setErrors({ ...errors, levels: errors.levels.filter((_, i) => i !== indexToRemove) }); };
  const handleBlankCardChange = (index, delta) => { const newCards = [...blankCards]; if (newCards[index] + delta >= 0) { newCards[index] += delta; setBlankCards(newCards); } };

  const handleGenerateBaseScale = async () => {
    const newErrors = { criterion: !criterionName.trim(), levels: levels.map(l => !l.trim()) };
    if (newErrors.criterion || newErrors.levels.includes(true)) { 
      setErrors(newErrors); 
      return alert("Por favor, rellena todos los campos."); 
    }

    setIsLoading(true);
    try {
      const payloadBase = { criterion_name: criterionName.trim(), levels: levels.map(l => l.trim()), blank_cards: blankCards, references: { "0": 0, [(levels.length - 1).toString()]: 1 } };
      const baseResult = await calculateValueFunction(payloadBase);
      
      setBaseScale(baseResult.values);
      const initialMfs = {};
      Object.entries(baseResult.values).forEach(([name, value]) => { initialMfs[name] = { supportStart: value, coreStart: value, coreEnd: value, supportEnd: value }; });
      
      setMfDefinitions(initialMfs);
      setSelectedTerm(Object.keys(baseResult.values)[0]);
      setStep(2);
    } catch (error) { alert("Error: " + error); } finally { setIsLoading(false); }
  };

  // Manejadores de Franjas
  const updateCurrentMf = (field, value) => {
    if (!selectedTerm) return;
    let numValue = parseFloat(value);
    
    setMfDefinitions(prev => {
      const scaleKeys = Object.keys(baseScale);
      const selectedIndex = scaleKeys.indexOf(selectedTerm);
      
      let prevCoreEnd = 0, prevSupportEnd = 0, nextCoreStart = 1, nextSupportStart = 1;

      if (selectedIndex > 0) {
        prevCoreEnd = prev[scaleKeys[selectedIndex - 1]].coreEnd;
        prevSupportEnd = prev[scaleKeys[selectedIndex - 1]].supportEnd;
      }
      if (selectedIndex < scaleKeys.length - 1) {
        nextCoreStart = prev[scaleKeys[selectedIndex + 1]].coreStart;
        nextSupportStart = prev[scaleKeys[selectedIndex + 1]].supportStart;
      }

      if (field === 'supportStart' && numValue < prevCoreEnd) numValue = prevCoreEnd;
      if (field === 'coreStart' && numValue < prevSupportEnd) numValue = prevSupportEnd;
      if (field === 'coreEnd' && numValue > nextSupportStart) numValue = nextSupportStart;
      if (field === 'supportEnd' && numValue > nextCoreStart) numValue = nextCoreStart;

      const current = { ...prev[selectedTerm], [field]: numValue };
      
      if (field === 'supportStart' && current.supportStart > current.coreStart) current.coreStart = current.supportStart;
      if (field === 'coreStart') { if (current.coreStart < current.supportStart) current.supportStart = current.coreStart; if (current.coreStart > current.coreEnd) current.coreEnd = current.coreStart; }
      if (field === 'coreEnd') { if (current.coreEnd < current.coreStart) current.coreStart = current.coreEnd; if (current.coreEnd > current.supportEnd) current.supportEnd = current.coreEnd; }
      if (field === 'supportEnd' && current.supportEnd < current.coreEnd) current.coreEnd = current.supportEnd;

      return { ...prev, [selectedTerm]: current };
    });
  };

  const handleFinalSubmit = () => {
    console.log("PAYLOAD DOC-MF:", { base_scale: baseScale, membership_functions: mfDefinitions });
    alert("¡Mira la consola! JSON preparado.");
  };

  // Variables calculadas
  const scaleKeys = Object.keys(baseScale);
  const selectedColor = COLORS[scaleKeys.indexOf(selectedTerm) % COLORS.length] || '#2563eb';


  return (
    <div className="w-full flex flex-col items-center">
      
      {/* --- PASO 1 --- */}
      {step === 1 && (
        <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-12 flex flex-col items-center animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 w-full border-b pb-4">Paso 1: Escala de Referencia (Cartas)</h2>
          <CriterionInput criterionName={criterionName} setCriterionName={handleCriterionChange} error={errors.criterion} />
          
          <div className="w-full max-w-lg flex flex-col items-center">
            {levels.map((level, index) => (
              <div key={index} className="w-full flex flex-col items-center">
                <CardEditor index={index} level={level} handleLevelChange={handleLevelChange} handleRemoveLevel={handleRemoveLevel} totalLevels={levels.length} error={errors.levels[index]} canRemove={levels.length > 3} />
                {index < levels.length - 1 && <BlankCardsCounter index={index} blankCardsCount={blankCards[index]} handleBlankCardChange={handleBlankCardChange} />}
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

      {/* --- PASO 2 --- */}
      {step === 2 && (
        <div className="w-full max-w-6xl bg-white p-10 rounded-3xl shadow-sm border border-slate-200 animate-fade-in">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Paso 2: Modelar Conceptos Difusos</h2>
            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 font-semibold underline">← Volver a las cartas</button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {scaleKeys.map((name, index) => {
              const color = COLORS[index % COLORS.length];
              const isSelected = selectedTerm === name;
              return (
                <button key={name} onClick={() => setSelectedTerm(name)} style={isSelected ? { backgroundColor: color, borderColor: color, color: '#fff' } : { borderColor: color, color: '#475569' }} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-300 flex flex-col items-center shadow-sm hover:shadow-md ${isSelected ? 'transform scale-105' : 'bg-white opacity-80 hover:opacity-100'}`}>
                  <span>{name}</span><span className="text-xs font-normal opacity-80">(X: {baseScale[name].toFixed(2)})</span>
                </button>
              );
            })}
          </div>

          <Chart baseScale={baseScale} mfDefinitions={mfDefinitions} selectedTerm={selectedTerm} colors={COLORS} />

          <Controls 
            selectedTerm={selectedTerm} 
            currentMf={mfDefinitions[selectedTerm]} 
            selectedColor={selectedColor} 
            baseScale={baseScale} 
            mfDefinitions={mfDefinitions}
            updateCurrentMf={updateCurrentMf} 
          />
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