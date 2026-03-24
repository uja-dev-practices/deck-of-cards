export default function CriterionInput({ criterionName, setCriterionName }) {
  return (
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
  );
}