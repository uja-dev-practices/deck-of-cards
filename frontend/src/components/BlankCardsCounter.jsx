export default function BlankCardsCounter({ index, blankCardsCount, handleBlankCardChange }) {
  
  const maxCardsPerRow = 7;
  const rows = [];
  for (let i = 0; i < blankCardsCount; i += maxCardsPerRow) {
    rows.push(Array.from({ length: Math.min(maxCardsPerRow, blankCardsCount - i) }));
  }

  return (
    <div className="flex flex-col items-center mx-1 my-2 z-10 w-32">
      
      <div className="relative w-full h-52 flex flex-col items-center justify-center shrink-0">
        
        {/* Línea conectora horizontal */}
        <div className="absolute w-[calc(100%+2rem)] h-1 bg-slate-200 top-[50%] -translate-y-1/2 z-0 rounded"></div>
        
        {/* Botones - y + */}
        <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 relative">
          <button 
            onClick={() => handleBlankCardChange(index, -1)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
          >-</button>
          
          <div className="flex flex-col items-center leading-none min-w-[3rem]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blancas</span>
            <span className="text-base font-black text-blue-600">{blankCardsCount}</span>
          </div>
          
          <button 
            onClick={() => handleBlankCardChange(index, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
          >+</button>
        </div>
      </div>

      {/* Cartas blancas */}
      {blankCardsCount > 0 && (
        <div className="flex flex-col items-center gap-y-3 w-full justify-center -mt-16 relative z-0">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row items-center justify-center -space-x-4">
              {row.map((_, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className="w-8 h-12 bg-white border-2 border-dashed border-slate-300 rounded shadow-sm opacity-90 transition-all hover:-translate-y-1"
                  style={{ zIndex: colIndex }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}