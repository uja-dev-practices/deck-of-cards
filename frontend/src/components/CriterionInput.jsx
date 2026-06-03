export default function CriterionInput({ criterionName, setCriterionName, error }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 w-full max-w-full z-30 relative mt-4 px-1">
      <label className="text-sm font-bold text-slate-600 uppercase tracking-wide text-center sm:text-left sm:whitespace-nowrap shrink-0">
        Nombre del Criterio:
      </label>
      
      <div className="relative w-full max-w-xs sm:max-w-none sm:w-72 mx-auto sm:mx-0">
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
          <span className="mt-1 block text-center sm:absolute sm:mt-0 sm:top-1/2 sm:-right-20 sm:-translate-y-1/2 text-red-500 text-xs font-semibold whitespace-nowrap">
            Obligatorio
          </span>
        )}
      </div>
    </div>
  );
}