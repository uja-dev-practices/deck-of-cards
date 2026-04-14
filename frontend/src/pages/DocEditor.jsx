import { useState } from 'react';
import Step1BaseScale from '../components/editor/Step1BaseScale';
import Step2FuzzyModeling from '../components/editor/Step2FuzzyModeling';
import SubscaleModal from '../components/editor/SubscaleModal';
import { calculateValueFunction, buildFuzzyGraph, saveToHistory } from '../services/docService';
import Step3FinalGraph from '../components/editor/Step3FinalGraph';

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
  const [submitError, setSubmitError] = useState(null);

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
    setSubmitError(null);
    const scaleKeys = Object.keys(baseScale);
    
    const payload = {
      levels: scaleKeys.map(term => {
        const mf = mfDefinitions[term];
        const sub = subscales[term] || {};
        
        const c_start = Number(mf.coreStart.toFixed(4));
        const c_end = Number(mf.coreEnd.toFixed(4));
        
        const s_start = Math.min(Number(mf.supportStart.toFixed(4)), c_start);
        const s_end = Math.max(Number(mf.supportEnd.toFixed(4)), c_end);

        const leftCount = sub.left ? sub.left.cardsCount : 2;
        const left_nodes_x = Array.from({ length: leftCount }).map((_, i) => 
          Number((s_start + (c_start - s_start) * (i / (leftCount - 1))).toFixed(4))
        );

        const rightCount = sub.right ? sub.right.cardsCount : 2;
        const right_nodes_x = Array.from({ length: rightCount }).map((_, i) => 
          Number((c_end + (s_end - c_end) * (i / (rightCount - 1))).toFixed(4))
        );

        return {
          term: term,
          core: [ c_start, c_end ],
          support: [ s_start, s_end ],
          left_nodes_x: left_nodes_x,
          left_blank_cards: sub.left ? sub.left.blankCards : [0],
          right_nodes_x: right_nodes_x,
          right_blank_cards: sub.right ? sub.right.blankCards : [0]
        };
      })
    };

    setIsLoading(true);
    try {
      const result = await buildFuzzyGraph(payload);
      setFinalResult(result);
      setStep(3);
    } catch (error) {
      
      let friendlyMessage = "Ocurrió un error al procesar la solicitud.";
      const errorData = error.backendData || error.response?.data || error;

      if (errorData.detail) {
          if (errorData.detail === "Invalid input data") {
               friendlyMessage = "Revisa los valores del Soporte y Núcleo. Asegúrate de que el 'Inicio del Soporte' sea menor o igual al 'Fin del Soporte', y que el 'Núcleo' esté dentro del 'Soporte'.";
          } else if (typeof errorData.detail === 'string') {
              friendlyMessage = errorData.detail;
          }
      } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
           friendlyMessage = errorData.errors.map(err => {
              let cleanMsg = err.msg ? err.msg.replace("Value error, ", "") : "Valor incorrecto";
              if (err.loc && err.loc.includes("levels")) {
                const levelIndex = err.loc[err.loc.indexOf("levels") + 1];
                const termName = scaleKeys[levelIndex] || `Nivel ${Number(levelIndex) + 1}`;
                return `• En la etiqueta "${termName}": ${cleanMsg}`;
              }
              return `• ${cleanMsg}`;
            }).join("\n");
      }

      setSubmitError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Petición para guardar en el historial
  const handleSaveToHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Para guardar tu modelo debes iniciar sesión primero. Puedes seguir visualizando la gráfica sin problema.");
      return;
    }

    const defaultName = criterionName ? `Modelo de ${criterionName}` : "Mi nueva gráfica DoC-IT2MF";
    const historyName = prompt("Dale un nombre a este modelo para guardarlo en tu historial:", defaultName);
    
    if (!historyName) return; 

    setIsLoading(true);
    try {
      const payload = {
        name: historyName,
        results: finalResult.levels || finalResult.results 
      };

      await saveToHistory(payload);
      
      alert("¡Gráfica guardada con éxito en tu historial!");
      
    } catch (error) {
      console.error("Error al guardar en el historial:", error);
      alert("Hubo un problema al guardar el modelo: " + error);
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
          submitError={submitError}
        />
      )}

      {step === 3 && finalResult && (
        <div className="flex flex-col gap-6 w-full">
          <Step3FinalGraph data={finalResult} criterionName={criterionName} />

          <button 
            onClick={handleSaveToHistory}
            disabled={isLoading}
            className={`mt-4 px-8 py-3 font-bold rounded-xl shadow-md w-fit self-end transition-all ${
              isLoading ? 'bg-slate-400 text-slate-100 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
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