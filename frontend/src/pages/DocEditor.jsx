import React, { useState } from 'react';
import Step1BaseScale from '../components/editor/Step1BaseScale';
import Step2FuzzyModeling from '../components/editor/Step2FuzzyModeling';
import SubscaleModal from '../components/editor/SubscaleModal';
import { calculateValueFunction, buildFuzzyGraph } from '../services/docService';

export default function DocEditor() {
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  // ESTADOS: FASE 1
  const [criterionName, setCriterionName] = useState('');
  const [levels, setLevels] = useState(['', '', '']); 
  const [blankCards, setBlankCards] = useState([0, 0]);
  const [errors, setErrors] = useState({ criterion: false, levels: [] });

  // ESTADOS: FASE 2
  const [baseScale, setBaseScale] = useState({}); 
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [mfDefinitions, setMfDefinitions] = useState({});
  const [subscales, setSubscales] = useState({});
  const [modalTarget, setModalTarget] = useState(null); 

  // ESTADO: FASE 3
  const [finalResult, setFinalResult] = useState(null);

  // MANEJADORES: FASE 1
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

  // MANEJADORES: FASE 2
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

  const handleOpenSubscale = (term, side, initialData) => {
    setModalTarget({ term, side, initialData });
  };

  const handleSaveSubscale = (term, side, data) => {
    setSubscales(prev => ({
      ...prev,
      [term]: {
        ...prev[term],
        [side]: data
      }
    }));
    setModalTarget(null);
  };

  // Petición para el endpoint "build"
  const handleFinalSubmit = async () => {
    const scaleKeys = Object.keys(baseScale);
    const payload = {
      criterion_name: criterionName.trim(),
      levels: scaleKeys.map(term => {
        const mf = mfDefinitions[term];
        const sub = subscales[term] || {};
        return {
          term: term,
          core: [ Number(mf.coreStart.toFixed(4)), Number(mf.coreEnd.toFixed(4)) ],
          support: [ Number(mf.supportStart.toFixed(4)), Number(mf.supportEnd.toFixed(4)) ],
          left_blank_cards: sub.left ? sub.left.blankCards : [0],
          right_blank_cards: sub.right ? sub.right.blankCards : [0],
          left_nodes_count: sub.left ? sub.left.cardsCount : 2,
          right_nodes_count: sub.right ? sub.right.cardsCount : 2
        };
      })
    };

    setIsLoading(true);
    try {
      const result = await buildFuzzyGraph(payload);
      console.log("RESPUESTA DEL BACKEND:", result);
      
      setFinalResult(result);
      setStep(3);

    } catch (error) {
      console.error(error);
      alert("Error del servidor: \n" + JSON.stringify(error, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {step === 1 && (
        <Step1BaseScale
          criterionName={criterionName} handleCriterionChange={handleCriterionChange}
          levels={levels} handleLevelChange={handleLevelChange}
          handleAddLevel={handleAddLevel} handleRemoveLevel={handleRemoveLevel}
          blankCards={blankCards} handleBlankCardChange={handleBlankCardChange}
          errors={errors} handleGenerateBaseScale={handleGenerateBaseScale} isLoading={isLoading}
        />
      )}

      {step === 2 && (
        <Step2FuzzyModeling
          baseScale={baseScale} mfDefinitions={mfDefinitions}
          selectedTerm={selectedTerm} setSelectedTerm={setSelectedTerm}
          updateCurrentMf={updateCurrentMf} handleFinalSubmit={handleFinalSubmit}
          onBack={() => setStep(1)}
          subscales={subscales}
          onOpenSubscale={handleOpenSubscale}
        />
      )}

      {step === 3 && (
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
           <h2 className="text-2xl font-bold text-slate-800 mb-4">Paso 3: Espectro Difuso Final</h2>
           <p className="text-slate-600 mb-6">Gráfica construida correctamente. ¡Mira la consola!</p>
           <button onClick={() => setStep(2)} className="text-slate-500 hover:text-blue-600 underline">
             ← Volver a editar
           </button>
        </div>
      )}

      {modalTarget && (
        <SubscaleModal 
          key={`${modalTarget.term}-${modalTarget.side}`}
          onClose={() => setModalTarget(null)} 
          onSave={handleSaveSubscale} 
          targetInfo={modalTarget} 
        />
      )}
    </div>
  );
}