import { useState } from 'react';
import CriterionInput from '../components/CriterionInput';
import CardEditor from '../components/CardEditor';
import BlankCardsCounter from '../components/BlankCardsCounter';
import AddLevelButton from '../components/AddLevelButton';
import ValueFunctionChart from '../components/ValueFunctionChart';
import { calculateValueFunction } from '../services/docService';

export default function BasicMode() {
    const [criterionName, setCriterionName] = useState('');
    const [levels, setLevels] = useState(['', '', '']);
    const [blankCards, setBlankCards] = useState([0, 0]);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    
    const [errors, setErrors] = useState({ criterion: false, levels: [] });

    const handleCalculate = async () => {

        let hasError = false;
        const newErrors = { criterion: false, levels: Array(levels.length).fill(false) };

        if (!criterionName.trim()) {
            newErrors.criterion = true;
            hasError = true;
        }

        levels.forEach((level, idx) => {
            if (!level.trim()) {
                newErrors.levels[idx] = true;
                hasError = true;
            }
        });

        setErrors(newErrors);
        
        if (hasError) return;

        setIsLoading(true);
        setResult(null);

        const payload = {
            criterion_name: criterionName.trim(),
            levels: levels.map(l => l.trim()),
            blank_cards: blankCards,
            references: { "0": 0, [(levels.length - 1).toString()]: 1 }
        };

        try {
            const data = await calculateValueFunction(payload);
            setResult(data); 
        } catch (error) {
            alert("No se ha podido conectar con el backend: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCriterionChange = (val) => {
        setCriterionName(val);
        if (errors.criterion) setErrors({ ...errors, criterion: false });
    };

    const handleLevelChange = (index, newValue) => {
        const newLevels = [...levels];
        newLevels[index] = newValue;
        setLevels(newLevels);

        if (errors.levels[index]) {
            const newErrLevels = [...errors.levels];
            newErrLevels[index] = false;
            setErrors({ ...errors, levels: newErrLevels });
        }
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
        
        const newErrLevels = errors.levels.filter((_, index) => index !== indexToRemove);

        setLevels(newLevels);
        setBlankCards(newBlankCards);
        setErrors({ ...errors, levels: newErrLevels });
    };

    const handleBlankCardChange = (index, delta) => {
        const newBlankCards = [...blankCards];
        const newValue = newBlankCards[index] + delta;
        if (newValue >= 0) {
            newBlankCards[index] = newValue;
            setBlankCards(newBlankCards);
        }
    };

  return (
    <div className="w-full flex flex-col items-center">
      
        <CriterionInput 
            criterionName={criterionName} 
            setCriterionName={handleCriterionChange} 
            error={errors.criterion}
        />

        <div className="w-full max-w-lg flex flex-col items-center">
            {levels.map((level, index) => (
            <div key={index} className="w-full flex flex-col items-center">
                
                <CardEditor 
                    index={index} 
                    level={level} 
                    handleLevelChange={handleLevelChange} 
                    handleRemoveLevel={handleRemoveLevel} 
                    totalLevels={levels.length} 
                    error={errors.levels[index]}
                />

                {index < levels.length - 1 && (
                <BlankCardsCounter 
                    index={index} 
                    blankCardsCount={blankCards[index]} 
                    handleBlankCardChange={handleBlankCardChange} 
                />
                )}
            </div>
            ))}

            <AddLevelButton handleAddLevel={handleAddLevel} />
        </div>

        <div className="w-full max-w-lg mt-12 pt-8 border-t-2 border-slate-200 flex flex-col items-center">
            <button
            onClick={handleCalculate}
            disabled={isLoading}
            className={`w-full py-4 text-white text-xl font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
            }`}
            >
            {isLoading ? 'Calculando...' : 'Calcular Valores DoC'}
            </button>
        </div>

        <ValueFunctionChart result={result} />

    </div>
  );
}