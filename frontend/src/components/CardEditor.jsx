
export default function CardEditor({ index, level, handleLevelChange, handleRemoveLevel, totalLevels, error }) {
  return (
    <div className="flex flex-col items-center mx-2 my-2">
      <div className={`relative w-40 h-52 bg-white border-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center justify-center transition-transform hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] group ${
        error ? 'border-red-400 shadow-red-100' : 'border-slate-200'
      }`}>
        {totalLevels > 3 && (
          <button onClick={() => handleRemoveLevel(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-400 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm" title="Eliminar carta">×</button>
        )}
        <span className="absolute top-3 left-4 text-sm font-black text-slate-300">{index + 1}</span>
        <span className="absolute bottom-3 right-4 text-sm font-black text-slate-300 rotate-180">{index + 1}</span>
        <input type="text" placeholder="Término..." value={level} onChange={(e) => handleLevelChange(index, e.target.value)} className={`w-10/12 text-center text-lg font-bold text-slate-700 bg-transparent border-b-2 border-dashed outline-none pb-1 ${error ? 'border-red-300 focus:border-red-500 placeholder:text-red-200' : 'border-slate-300 focus:border-blue-500'}`} />
      </div>
      <div className="h-6 mt-2">{error && <p className="text-red-500 text-xs font-semibold">Escribe un término</p>}</div>
    </div>
  );
}