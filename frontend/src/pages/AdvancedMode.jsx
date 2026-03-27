import React, { useState, useEffect, useRef } from 'react';
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

  const [criterionName, setCriterionName] = useState('');
  const [levels, setLevels] = useState(['', '', '']); 
  const [blankCards, setBlankCards] = useState([0, 0]);
  const [errors, setErrors] = useState({ criterion: false, levels: [] });
  
  const [isZoomActive, setIsZoomActive] = useState(true);

  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const [dimensions, setDimensions] = useState({ container: 1000, table: 0 });

  useEffect(() => {
    const updateMeasurements = () => {
      if (containerRef.current && tableRef.current) {
        setDimensions({
          container: containerRef.current.offsetWidth,
          table: tableRef.current.scrollWidth
        });
      }
    };
    const timeoutId = setTimeout(updateMeasurements, 50);
    window.addEventListener('resize', updateMeasurements);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [levels, blankCards, step]);

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

      const anchor = baseScale[selectedTerm];

      if (field === 'supportStart' && numValue < prevCoreEnd) numValue = prevCoreEnd;
      if (field === 'coreStart' && numValue < prevSupportEnd) numValue = prevSupportEnd;
      if (field === 'coreEnd' && numValue > nextSupportStart) numValue = nextSupportStart;
      if (field === 'supportEnd' && numValue > nextCoreStart) numValue = nextCoreStart;

      if ((field === 'supportStart' || field === 'coreStart') && numValue > anchor) numValue = anchor;
      if ((field === 'supportEnd' || field === 'coreEnd') && numValue < anchor) numValue = anchor;

      const current = { ...prev[selectedTerm], [field]: numValue };

      if (field === 'supportStart') {
        if (current.supportStart > current.coreStart) current.coreStart = current.supportStart;
        if (current.coreStart > current.coreEnd) current.coreEnd = current.coreStart;
        if (current.coreEnd > current.supportEnd) current.supportEnd = current.coreEnd;
      } else if (field === 'coreStart') {
        if (current.coreStart < current.supportStart) current.supportStart = current.coreStart;
        if (current.coreStart > current.coreEnd) current.coreEnd = current.coreStart;
        if (current.coreEnd > current.supportEnd) current.supportEnd = current.coreEnd;
      } else if (field === 'coreEnd') {
        if (current.coreEnd > current.supportEnd) current.supportEnd = current.coreEnd;
        if (current.coreEnd < current.coreStart) current.coreStart = current.coreEnd;
        if (current.coreStart < current.supportStart) current.supportStart = current.coreStart;
      } else if (field === 'supportEnd') {
        if (current.supportEnd < current.coreEnd) current.coreEnd = current.supportEnd;
        if (current.coreEnd < current.coreStart) current.coreStart = current.coreEnd;
        if (current.coreStart < current.supportStart) current.supportStart = current.coreStart;
      }

      return { ...prev, [selectedTerm]: current };
    });
  };

  const handleFinalSubmit = () => {
    console.log("PAYLOAD DOC-MF:", { base_scale: baseScale, membership_functions: mfDefinitions });
    alert("¡Mira la consola! JSON preparado.");
  };

  const scaleKeys = Object.keys(baseScale);
  const selectedColor = COLORS[scaleKeys.indexOf(selectedTerm) % COLORS.length] || '#2563eb';

  const needsZoom = dimensions.table > dimensions.container;
  const dynamicScale = needsZoom ? (dimensions.container / dimensions.table) * 0.95 : 1;
  const currentScale = isZoomActive && needsZoom ? dynamicScale : 1;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* PASO 1 */}
      {step === 1 && (
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col items-center animate-fade-in relative overflow-visible">
          
          <div className="flex justify-between items-center w-full mb-4 border-b pb-3 relative z-30">
            <h2 className="text-xl font-bold text-slate-800">
              Paso 1: Establecer escala
            </h2>
            {needsZoom && (
              <button 
                onClick={() => {
                  if (containerRef.current) containerRef.current.scrollLeft = 0;
                  setIsZoomActive(!isZoomActive);
                }} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm border text-sm ${isZoomActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <span>{isZoomActive ? '🔍' : '🖼️'}</span>
                {isZoomActive ? 'Ver de cerca (Scroll)' : 'Ajustar mesa'}
              </button>
            )}
          </div>

          <CriterionInput criterionName={criterionName} setCriterionName={handleCriterionChange} error={errors.criterion} />
          
          <div ref={containerRef} className={`w-full mt-2 transition-all relative ${!isZoomActive && needsZoom ? 'overflow-x-auto flex justify-start pb-8 pt-4 px-4' : 'overflow-hidden flex justify-center pb-8 pt-4'}`}>
            <div className={`flex flex-row items-start min-w-max transition-transform duration-500 ease-out px-4 origin-top`} style={{ transform: `scale(${currentScale})`, marginBottom: isZoomActive && currentScale < 1 ? `-${(1 - currentScale) * 300}px` : '0px' }}>
              
              <div ref={tableRef} className="flex flex-row items-start relative px-10 overflow-visible">
                
                {levels.map((level, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center mx-2 my-2 relative z-20">
                      <CardEditor index={index} level={level} handleLevelChange={handleLevelChange} handleRemoveLevel={handleRemoveLevel} totalLevels={levels.length} error={errors.levels[index]} canRemove={levels.length > 3} />
                    </div>
                    {index < levels.length - 1 && (
                      <BlankCardsCounter index={index} blankCardsCount={blankCards[index]} handleBlankCardChange={handleBlankCardChange} />
                    )}
                  </React.Fragment>
                ))}
                
                <div className="mx-1 my-2 h-52 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-200 rounded"></div>
                </div>
                
                <AddLevelButton handleAddLevel={handleAddLevel} />
              </div>

            </div>
          </div>
          
          <div className="w-full max-w-lg mt-2 pt-6 border-t border-slate-200 flex flex-col items-center z-20 relative bg-white">
            <button onClick={handleGenerateBaseScale} disabled={isLoading} className={`w-full py-3 text-white text-lg font-bold rounded-xl shadow-md transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
              {isLoading ? 'Calculando...' : 'Generar Gráfica Continua'}
            </button>
          </div>
        </div>
      )}

      {/* PASO 2 */}
      {step === 2 && (
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in relative overflow-visible">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-slate-800">Paso 2: Modelar Conceptos Difusos</h2>
            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 text-sm font-semibold underline">← Volver a las cartas</button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {scaleKeys.map((name, index) => {
              const color = COLORS[index % COLORS.length];
              const isSelected = selectedTerm === name;
              return (
                <button key={name} onClick={() => setSelectedTerm(name)} style={isSelected ? { backgroundColor: color, borderColor: color, color: '#fff' } : { borderColor: color, color: '#475569' }} className={`px-5 py-2 rounded-lg font-bold border-2 transition-all duration-300 flex flex-col items-center shadow-sm hover:shadow-md ${isSelected ? 'transform scale-105' : 'bg-white opacity-80 hover:opacity-100'}`}>
                  <span>{name}</span><span className="text-[10px] font-normal opacity-80">(X: {baseScale[name].toFixed(2)})</span>
                </button>
              );
            })}
          </div>

          <Chart baseScale={baseScale} mfDefinitions={mfDefinitions} selectedTerm={selectedTerm} colors={COLORS} />

          <Controls selectedTerm={selectedTerm} currentMf={mfDefinitions[selectedTerm]} selectedColor={selectedColor} baseScale={baseScale} mfDefinitions={mfDefinitions} updateCurrentMf={updateCurrentMf} />
          
          <div className="w-full mt-8 flex justify-center">
            <button onClick={handleFinalSubmit} className="px-10 py-3 bg-slate-900 text-white text-lg font-bold rounded-xl shadow-md hover:bg-black hover:shadow-lg transition-all">
              Guardar Todo el Espectro Difuso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}