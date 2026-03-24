export default function BlankCardsCounter({ index, blankCardsCount, handleBlankCardChange }) {
  return (
    <div className="flex flex-col items-center my-2 w-full">
      <div className="w-0.5 h-6 bg-slate-300"></div>
      
      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blancas:</span>
        <button 
          onClick={() => handleBlankCardChange(index, -1)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
        >-</button>
        <span className="text-base font-bold w-6 text-center text-blue-600">
          {blankCardsCount}
        </span>
        <button 
          onClick={() => handleBlankCardChange(index, 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
        >+</button>
      </div>

      {blankCardsCount > 0 && (
        <div className="flex flex-col items-center -space-y-4 mt-3 mb-1">
          {Array.from({ length: blankCardsCount }).map((_, i) => (
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
  );
}