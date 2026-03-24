export default function AddLevelButton({ handleAddLevel }) {
  return (
    <div className="w-72 mt-6">
      <button
        onClick={handleAddLevel}
        className="w-full h-24 border-4 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 font-semibold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all active:scale-[0.98]"
      >
        <span className="text-3xl leading-none">+</span>
        <span className="text-sm">Añadir Carta</span>
      </button>
    </div>
  );
}