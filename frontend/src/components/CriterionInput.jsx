export default function CriterionInput({ criterionName, setCriterionName, error }) {
  return (
    <div className="flex flex-row items-center justify-center gap-3 w-full z-30 relative mt-4">
      <label className="text-sm font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">
        Nombre del Criterio:
      </label>
      
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Ej: Calidad del código"
          value={criterionName}
          onChange={(e) => setCriterionName(e.target.value)}
          className={`w-full px-4 py-1.5 rounded-lg border-2 font-bold outline-none transition-all ${
            error 
              ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-700 placeholder:text-red-300' 
              : 'border-slate-200 focus:border-blue-400 bg-slate-50 text-slate-800'
          }`}
        />
        
        {error && (
          <span className="absolute top-1/2 -right-18 -translate-y-1/2 text-red-500 text-xs font-semibold">
            Obligatorio
          </span>
        )}
      </div>
    </div>
  );
}