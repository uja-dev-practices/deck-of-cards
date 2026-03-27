import Chart from '../membershipFunction/Chart';
import Controls from '../membershipFunction/Controls';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#d946ef', '#06b6d4', '#8b5cf6', '#f43f5e', '#6366f1'];

export default function Step2FuzzyModeling({baseScale, mfDefinitions, selectedTerm, setSelectedTerm, updateCurrentMf, handleFinalSubmit, onBack, subscales, onOpenSubscale}) {
  const scaleKeys = Object.keys(baseScale);
  const selectedColor = COLORS[scaleKeys.indexOf(selectedTerm) % COLORS.length] || '#2563eb';

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in relative overflow-visible">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-slate-800">Paso 2: Modelar Conceptos Difusos</h2>
            <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm font-semibold underline">← Volver a las cartas</button>
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

        <Chart 
            baseScale={baseScale} 
            mfDefinitions={mfDefinitions} 
            selectedTerm={selectedTerm} 
            colors={COLORS} 
        />

        <Controls 
            selectedTerm={selectedTerm} 
            currentMf={mfDefinitions[selectedTerm]} 
            selectedColor={selectedColor} 
            baseScale={baseScale} 
            mfDefinitions={mfDefinitions} 
            updateCurrentMf={updateCurrentMf} 
            subscales={subscales} 
            onOpenSubscale={onOpenSubscale} 
        />
        
        <div className="w-full mt-8 flex justify-center">
            <button onClick={handleFinalSubmit} className="px-10 py-3 bg-slate-900 text-white text-lg font-bold rounded-xl shadow-md hover:bg-black hover:shadow-lg transition-all">
                Guardar Todo el Espectro Difuso
            </button>
        </div>
        
    </div>
  );
}