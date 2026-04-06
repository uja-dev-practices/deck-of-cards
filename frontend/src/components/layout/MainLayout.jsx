import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:bg-blue-700 transition-colors">
              DoC
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              Deck of Cards
            </span>
          </Link>

          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-200 cursor-pointer hover:bg-indigo-200 transition-colors"
                  title={`Cerrar sesión de ${user?.username}`}
                  onClick={() => {
                    if(window.confirm('¿Deseas cerrar sesión?')) {
                      logout();
                    }
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-5 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}