import React, { useState } from 'react';
import BlankCardsCounter from '../BlankCardsCounter';

export default function SubscaleModal({ onClose, onSave, targetInfo }) {

  const initialCount = Math.max(3, targetInfo?.initialData?.cardsCount || 3);
  const [cardsCount, setCardsCount] = useState(initialCount);
  
  const [blankCards, setBlankCards] = useState(() => {
    let initialBlanks = targetInfo?.initialData?.blankCards;
    
    if (!initialBlanks || initialBlanks.length === 0) {
      initialBlanks = [0, 0];
    } else if (initialBlanks.length < initialCount - 1) {
      const padding = Array(initialCount - 1 - initialBlanks.length).fill(0);
      initialBlanks = [...initialBlanks, ...padding];
    }

    return initialBlanks.map(b => {
      if (Array.isArray(b)) {
        return { min: b[0], max: b[1], isRange: true };
      }
      return { min: b, max: b, isRange: false };
    });
  });

  const handleAddCard = () => {
    setCardsCount(prev => prev + 1);
    setBlankCards([...blankCards, { min: 0, max: 0, isRange: false }]);
  };
  
  const handleRemoveCard = () => {
    if (cardsCount <= 3) return;
    setCardsCount(prev => prev - 1);
    setBlankCards(blankCards.slice(0, -1));
  };

  const handleExactChange = (index, delta) => {
    const newBlanks = [...blankCards];
    const newVal = newBlanks[index].min + delta;
    if (newVal >= 0) {
      newBlanks[index].min = newVal;
      newBlanks[index].max = newVal;
      setBlankCards(newBlanks);
    }
  };

  const handleMinChange = (index, delta) => {
    const newBlanks = [...blankCards];
    const newVal = newBlanks[index].min + delta;
    if (newVal >= 0 && newVal <= newBlanks[index].max) {
      newBlanks[index].min = newVal;
      setBlankCards(newBlanks);
    }
  };

  const handleMaxChange = (index, delta) => {
    const newBlanks = [...blankCards];
    const newVal = newBlanks[index].max + delta;
    if (newVal >= newBlanks[index].min) {
      newBlanks[index].max = newVal;
      setBlankCards(newBlanks);
    }
  };

  const toggleRangeMode = (index) => {
    const newBlanks = [...blankCards];
    newBlanks[index].isRange = !newBlanks[index].isRange;
    if (!newBlanks[index].isRange) {
      newBlanks[index].max = newBlanks[index].min;
    }
    setBlankCards(newBlanks);
  };

  const handleSave = () => {
    const payloadBlanks = blankCards.map(b => b.isRange ? [b.min, b.max] : b.min);
    onSave(targetInfo.term, targetInfo.side, { cardsCount, blankCards: payloadBlanks });
  };

  const handleDelete = () => {
    onSave(targetInfo.term, targetInfo.side, null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in py-4">
      <div className="bg-white w-full max-w-6xl p-8 rounded-3xl shadow-2xl mx-4 flex flex-col max-h-[95vh]">
        
        <div className="flex justify-between items-center mb-4 border-b pb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Diseñar Subescala</h2>
            <p className="text-slate-500 font-medium">
              Ajustando pendiente <span className="text-blue-600 font-bold">{targetInfo.side === 'left' ? 'Izquierda (Ascendente)' : 'Derecha (Descendente)'}</span> del término <span className="text-blue-600 font-bold">"{targetInfo.term}"</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold transition-colors">✕</button>
        </div>

        <div className="w-full overflow-y-auto overflow-x-auto flex justify-start flex-1 custom-scrollbar px-2 pt-6 pb-12">
          <div className="flex flex-row items-start min-w-max relative">
            
            {Array.from({ length: cardsCount }).map((_, index) => (
              <React.Fragment key={index}>
                {/* CARTA DE REFERENCIA  */}
                <div className="flex flex-col items-center mx-2 relative z-20">
                  <div className="relative w-32 h-40 bg-slate-50 border-2 border-slate-300 rounded-2xl shadow-sm flex flex-col items-center justify-center group">
                    {cardsCount > 3 && index === cardsCount - 1 && (
                      <button onClick={handleRemoveCard} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-400 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100">✕</button>
                    )}
                    <span className="text-4xl font-black text-slate-200">{index + 1}</span>
                  </div>
                </div>

                {/* HUECO ENTRE CARTAS */}
                {index < cardsCount - 1 && (
                  <div className="flex flex-col items-center justify-start mx-1 relative min-w-[120px]">
                    <div className="absolute w-[calc(100%+2rem)] h-1 bg-slate-200 top-[80px] -translate-y-1/2 z-0"></div>
                    
                    <div className="mt-[60px] flex flex-col items-center relative z-10 w-full">
                      {blankCards[index].isRange ? (
                        <div className="flex gap-2 items-start w-full justify-center">
                          <div className="flex flex-col items-center relative">
                            <span className="absolute bottom-full mb-1 text-[10px] font-bold text-slate-500">MÍN</span>
                            <BlankCardsCounter 
                              index={index} 
                              blankCardsCount={blankCards[index].min} 
                              handleBlankCardChange={(idx, delta) => handleMinChange(idx, delta)} 
                            />
                          </div>
                          
                          <div className="font-bold text-slate-300 mt-1">-</div>
                          
                          <div className="flex flex-col items-center relative">
                            <span className="absolute bottom-full mb-1 text-[10px] font-bold text-slate-500">MÁX</span>
                            <BlankCardsCounter 
                              index={index} 
                              blankCardsCount={blankCards[index].max} 
                              handleBlankCardChange={(idx, delta) => handleMaxChange(idx, delta)} 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center relative">
                           <span className="absolute bottom-full mb-1 text-[10px] font-bold text-slate-500">CARTAS</span>
                           <BlankCardsCounter 
                              index={index} 
                              blankCardsCount={blankCards[index].min} 
                              handleBlankCardChange={(idx, delta) => handleExactChange(idx, delta)} 
                            />
                        </div>
                      )}

                      <button
                        onClick={() => toggleRangeMode(index)}
                        className="mt-4 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-full border border-transparent hover:border-blue-200 transition-all text-center w-max cursor-pointer z-20"
                      >
                        {blankCards[index].isRange ? "Conozco la distancia" : "¿Dudas? Rango"}
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {/* Botón Añadir Carta */}
            <div className="flex flex-col items-center mx-2 relative z-20">
               <button onClick={handleAddCard} className="w-32 h-40 border-4 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-colors group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
               </button>
            </div>

          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-4 flex justify-between items-center border-t pt-6 shrink-0">
          <button onClick={handleDelete} className="px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
            Borrar Subescala
          </button>
          
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">
              Guardar Subescala
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}