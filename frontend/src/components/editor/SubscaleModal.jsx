import React, { useState } from 'react';
import BlankCardsCounter from '../BlankCardsCounter';

export default function SubscaleModal({ onClose, onSave, targetInfo }) {

  const [cardsCount, setCardsCount] = useState(targetInfo?.initialData?.cardsCount || 2);
  const [blankCards, setBlankCards] = useState(targetInfo?.initialData?.blankCards || [0]);

  const handleAddCard = () => {
    setCardsCount(prev => prev + 1);
    setBlankCards([...blankCards, 0]);
  };
  
  const handleRemoveCard = () => {
    if (cardsCount <= 2) return;
    setCardsCount(prev => prev - 1);
    setBlankCards(blankCards.slice(0, -1));
  };

  const handleBlankCardChange = (index, delta) => {
    const newBlanks = [...blankCards];
    if (newBlanks[index] + delta >= 0) {
      newBlanks[index] += delta;
      setBlankCards(newBlanks);
    }
  };

  const handleSave = () => {
    onSave(targetInfo.term, targetInfo.side, { cardsCount, blankCards });
  };

  const handleDelete = () => {
    onSave(targetInfo.term, targetInfo.side, null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl p-8 rounded-3xl shadow-2xl mx-4 flex flex-col">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Diseñar Subescala</h2>
            <p className="text-slate-500 font-medium">
              Ajustando pendiente <span className="text-blue-600 font-bold">{targetInfo.side === 'left' ? 'Izquierda (Ascendente)' : 'Derecha (Descendente)'}</span> del término <span className="text-blue-600 font-bold">"{targetInfo.term}"</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold transition-colors">✕</button>
        </div>

        {/* Tablero */}
        <div className="w-full py-10 overflow-x-auto flex justify-start px-4">
          <div className="flex flex-row items-start min-w-max relative">
            {Array.from({ length: cardsCount }).map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center mx-2 my-2 relative z-20">
                  <div className="relative w-32 h-40 bg-slate-50 border-2 border-slate-300 rounded-2xl shadow-sm flex flex-col items-center justify-center group">
                    {cardsCount > 2 && index === cardsCount - 1 && (
                      <button onClick={handleRemoveCard} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-400 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100">×</button>
                    )}
                    <span className="text-4xl font-black text-slate-200">{index + 1}</span>
                  </div>
                </div>
                {index < cardsCount - 1 && (
                  <BlankCardsCounter index={index} blankCardsCount={blankCards[index]} handleBlankCardChange={handleBlankCardChange} />
                )}
              </React.Fragment>
            ))}
            
            <div className="mx-2 my-2 h-40 flex items-center">
               <button onClick={handleAddCard} className="w-32 h-40 border-4 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <span className="text-3xl">+</span>
               </button>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-between items-center border-t pt-6">
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