import { Outlet, NavLink } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 flex flex-col items-center">
      
        <header className="text-center mb-8 flex flex-col items-center gap-6">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Método <span className="text-blue-600">Deck of Cards</span>
            </h1>
        </header>

        <div className="flex justify-center mb-10 w-full">
            <div className="bg-slate-200/60 p-1.5 rounded-2xl flex gap-2 shadow-inner">
            <NavLink
                to="/basico"
                className={({ isActive }) =>
                `px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isActive
                    ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'
                }`
                }
            >
                DoC Clásico
            </NavLink>
            
            <NavLink
                to="/avanzado"
                className={({ isActive }) =>
                `px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isActive
                    ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'
                }`
                }
            >
                DoC-MF Avanzado
            </NavLink>
            </div>
        </div>

        <main className="w-full flex flex-col items-center">
            <Outlet />
        </main>

    </div>
  );
};