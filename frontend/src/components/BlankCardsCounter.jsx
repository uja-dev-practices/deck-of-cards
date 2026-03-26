export default function BlankCardsCounter({ index, blankCardsCount, handleBlankCardChange }) {
  return (
    <div className="flex flex-col items-center relative mx-1 mb-10">
      
      <div className="absolute w-full h-1 bg-slate-200 top-[40%] -translate-y-1/2 -z-10 rounded"></div>
      
      {/* Botones de - y + */}
      <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-full shadow-sm border border-slate-200 z-10">
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

      {/* Cartas blancas */}
      {blankCardsCount > 0 && (
        <div className="absolute top-[75px] flex flex-row items-center -space-x-4">
          {Array.from({ length: blankCardsCount }).map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-12 bg-white border-2 border-dashed border-slate-300 rounded shadow-sm opacity-90 transition-all hover:-translate-y-1"
              style={{ zIndex: i }}
            ></div>
          ))}
        </div>
      )}

    </div>
  );
}