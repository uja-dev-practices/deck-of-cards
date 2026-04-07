import Chart from '../membershipFunction/Chart';
import Controls from '../membershipFunction/Controls';
import { CHART_COLORS } from '../../config';

export default function Step2FuzzyModeling({
  baseScale, 
  mfDefinitions, 
  selectedTerm, 
  setSelectedTerm, 
  updateCurrentMf, 
  handleFinalSubmit, 
  onBack, 
  subscales, 
  onOpenSubscale,
  submitError
}) {
  const scaleKeys = Object.keys(baseScale);
  
  const selectedColor = CHART_COLORS[scaleKeys.indexOf(selectedTerm) % CHART_COLORS.length] || '#2563eb';

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in relative overflow-visible">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-slate-800">Paso 2: Modelar Conceptos Difusos</h2>
            <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm font-semibold underline">← Volver a las cartas</button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
            {scaleKeys.map((name, index) => {
                const isSelected = selectedTerm === name;
                const color = CHART_COLORS[index % CHART_COLORS.length];

                return (
                    <button 
                        key={name} 
                        onClick={() => setSelectedTerm(name)} 
                        style={isSelected ? { backgroundColor: color, borderColor: color, color: '#fff' } : { borderColor: color, color: '#475569' }} 
                        className={`px-5 py-2 rounded-lg font-bold border-2 transition-all duration-300 flex flex-col items-center shadow-sm hover:shadow-md ${isSelected ? 'transform scale-105' : 'bg-white opacity-80 hover:opacity-100'}`}
                    >
                        <span>{name}</span>
                        <span className="text-[10px] font-normal opacity-80">(X: {baseScale[name].toFixed(2)})</span>
                    </button>
                );
            })}
        </div>

        <Chart 
            baseScale={baseScale} 
            mfDefinitions={mfDefinitions} 
            selectedTerm={selectedTerm} 
            colors={CHART_COLORS} 
        />

        {submitError && (
          <div className="bg-red-50 mb-6 border-red-500 p-4 rounded-xl shadow-sm animate-fade-in mx-2">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error de validación al generar la gráfica</h3>
                <div className="mt-1 text-sm text-red-700 whitespace-pre-line font-medium">
                  {submitError}
                </div>
              </div>
            </div>
          </div>
        )}

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
            <button onClick={handleFinalSubmit} className="px-10 py-3 bg-slate-900 text-white text-lg font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors">
                Generar el Espectro Difuso
            </button>
        </div>
    </div>
  );
}