import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth(); 

  const userInitial = user?.username ? user.username[0].toUpperCase() : "U";

  const handleLogout = () => {
    logout(); 
    setIsDropdownOpen(false);
    navigate('/login'); 
  };

  const isActive = (path) => {
    return location.pathname === path || (path === '/editor' && location.pathname === '/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 h-16 shrink-0 w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity whitespace-nowrap">
          <img src="/favicon.svg" alt="Deck of Cards Logo" className="w-10 h-10 shadow-sm rounded-xl object-contain" />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
            Deck of Cards
          </span>
        </Link>

        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-1 mr-2">
            <Link to="/editor" className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${isActive('/editor') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>
              Editor
            </Link>
            {isAuthenticated && (
              <Link to="/history" className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${isActive('/history') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'}`}>
                Historial
              </Link>
            )}
          </div>

          {isAuthenticated ? (
            <div className="relative border-l border-slate-200 pl-4">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border-2 border-blue-200 hover:bg-blue-200 transition-colors"
              >
                {userInitial}
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user?.username}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center border-l border-slate-200 pl-4">
              <Link 
                to="/login" 
                className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                Acceder
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}