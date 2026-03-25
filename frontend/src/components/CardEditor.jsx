export default function CardEditor({ index, level, handleLevelChange, handleRemoveLevel, totalLevels, error }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-72 h-44 bg-white border-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] group ${
        error ? 'border-red-400 shadow-red-100' : 'border-slate-200'
      }`}>
        {/* Botón para eliminar */}
        {totalLevels > 3 && (
          <button
            onClick={() => handleRemoveLevel(index)}
            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-400 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
            title="Eliminar carta"
          >
            ×
          </button>
        )}

        {/* Detalles tipo naipe */}
        <span className="absolute top-4 left-4 text-sm font-black text-slate-300">{index + 1}</span>
        <span className="absolute bottom-4 right-4 text-sm font-black text-slate-300 rotate-180">{index + 1}</span>

        <input
          type="text"
          placeholder="Escribe aquí..."
          value={level}
          onChange={(e) => handleLevelChange(index, e.target.value)}
          className={`w-4/5 text-center text-2xl font-bold text-slate-700 bg-transparent border-b-2 border-dashed outline-none pb-1 ${
            error ? 'border-red-300 focus:border-red-500 placeholder:text-red-200' : 'border-slate-300 focus:border-blue-500'
          }`}
        />
      </div>
      
      {/* Mensaje de error */}
      <div className="h-6 mt-2">
        {error && (
          <p className="text-red-500 text-sm font-semibold animate-pulse">
            Escribe una etiqueta
          </p>
        )}
      </div>

    </div>
  );
}