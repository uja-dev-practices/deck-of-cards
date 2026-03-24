import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {

  const [criterionName, setCriterionName] = useState('');
  const [levels, setLevels] = useState(['', '', '']);
  const [blankCards, setBlankCards] = useState([0, 0]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculate = async () => {
    setIsLoading(true);
    setResult(null);

    const firstIndex = "0";
    const lastIndex = (levels.length - 1).toString();
    
    const currentReferences = {
      [firstIndex]: 0, 
      [lastIndex]: 1
    };

    const payload = {
      criterion_name: criterionName || "Criterio sin nombre",
      levels: levels,
      blank_cards: blankCards,
      references: currentReferences
    };

    console.log("Enviando JSON al backend:", payload);

    try {
      const response = await fetch('http://localhost:8000/api/criteria/doc/value-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);
      setResult(data); 

    } catch (error) {
      console.error("Error al hacer la petición:", error);
      alert("No se ha podido conectar con el backend.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleLevelChange = (index, newValue) => {
    const newLevels = [...levels];
    newLevels[index] = newValue;
    setLevels(newLevels);
  };

  const handleAddLevel = () => {
    setLevels([...levels, '']);
    setBlankCards([...blankCards, 0]); 
  };

  const handleRemoveLevel = (indexToRemove) => {
    if (levels.length <= 2) return; 
    const newLevels = levels.filter((_, index) => index !== indexToRemove);
    const blankIndexToRemove = indexToRemove === 0 ? 0 : indexToRemove - 1;
    const newBlankCards = blankCards.filter((_, index) => index !== blankIndexToRemove);
    setLevels(newLevels);
    setBlankCards(newBlankCards);
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 flex flex-col items-center">
      
      {/* TÍTULO */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-12">
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
          Nombre del Criterio
        </label>
        <input
          type="text"
          placeholder="Ej. Calidad del aceite..."
          value={criterionName}
          onChange={(e) => setCriterionName(e.target.value)}
          className="w-full text-3xl font-bold p-2 text-center text-slate-700 border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* TIMELINE VERTICAL */}
      <div className="w-full max-w-lg flex flex-col items-center">
        {levels.map((level, index) => (
          <div key={index} className="w-full flex flex-col items-center">
            
            {/* CARTA DE NIVEL (etiqueta) */}
            <div className="relative w-72 h-44 bg-white border-2 border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] group">
              
              {/* Botón Eliminar */}
              {levels.length > 2 && (
                <button
                  onClick={() => handleRemoveLevel(index)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-400 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Eliminar carta"
                >
                  ×
                </button>
              )}

              {/* Detalles tipo naipe */}
              <span className="absolute top-4 left-4 text-sm font-black text-slate-300">
                {index + 1}
              </span>
              <span className="absolute bottom-4 right-4 text-sm font-black text-slate-300 rotate-180">
                {index + 1}
              </span>

              <input
                type="text"
                placeholder="Escribe aquí..."
                value={level}
                onChange={(e) => handleLevelChange(index, e.target.value)}
                className="w-4/5 text-center text-2xl font-bold text-slate-700 bg-transparent border-b-2 border-dashed border-slate-300 focus:border-blue-500 outline-none pb-1"
              />
            </div>

            {/* CONECTOR Y CARTAS BLANCAS */}
            {index < levels.length - 1 && (
              <div className="flex flex-col items-center my-2 w-full">
                <div className="w-0.5 h-6 bg-slate-300"></div>
                
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 z-10">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blancas:</span>
                  <button 
                    onClick={() => handleBlankCardChange(index, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
                  >-</button>
                  <span className="text-base font-bold w-6 text-center text-blue-600">
                    {blankCards[index]}
                  </span>
                  <button 
                    onClick={() => handleBlankCardChange(index, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
                  >+</button>
                </div>

                {blankCards[index] > 0 && (
                  <div className="flex flex-col items-center -space-y-4 mt-3 mb-1">
                    {Array.from({ length: blankCards[index] }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-16 h-8 bg-blue-50 border-2 border-blue-200 rounded shadow-sm opacity-80"
                        style={{ zIndex: i }}
                      ></div>
                    ))}
                  </div>
                )}

                <div className="w-0.5 h-6 bg-slate-300"></div>
              </div>
            )}
          </div>
        ))}

        {/* BOTÓN AÑADIR */}
        <div className="w-72 mt-6">
          <button
            onClick={handleAddLevel}
            className="w-full h-24 border-4 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 font-semibold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all active:scale-[0.98]"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-sm">Añadir Carta</span>
          </button>
        </div>

      </div>

      {/* BOTÓN DE CALCULAR */}
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

        {/* GRÁFICA */}
        {result && (
          <div className="w-full max-w-4xl mt-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
              Función de Valor: {result.criterion_name}
            </h3>
            
            <div className="w-full mt-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={Object.entries(result.values).map(([label, value]) => ({
                    nombre: label,
                    valor: value
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="nombre" 
                    tick={{ fill: '#475569', fontWeight: 600 }} 
                    dy={10}
                  />
                  
                  <YAxis 
                    domain={[0, 1]} 
                    tick={{ fill: '#475569' }} 
                    dx={-10}
                  />
                  
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value.toFixed(4), 'Valor DoC']}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#2563eb"
                    strokeWidth={4}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    dot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

    </div>
  );
}

export default App;