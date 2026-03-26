export default function AddLevelButton({ handleAddLevel }) {
  return (
    <div className="flex flex-col items-center mx-2 my-4">
      <button
        onClick={handleAddLevel}
        className="w-44 h-60 border-4 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 font-semibold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all active:scale-[0.98] group"
      >
        <span className="text-4xl font-light leading-none group-hover:scale-110 transition-transform">+</span>
        <span className="text-sm uppercase tracking-widest font-bold text-center px-4">Añadir Carta</span>
      </button>
      <div className="h-6 mt-3"></div>
    </div>
  );
}