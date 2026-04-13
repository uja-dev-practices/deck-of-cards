import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import Footer from './Footer';

export default function MainLayout({ children }) {
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
    // IMPORTANTE: flex y flex-col son la clave para que el footer se quede abajo
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">      
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Título */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/favicon.svg" 
              alt="Deck of Cards Logo" 
              className="w-10 h-10 shadow-sm rounded-xl object-contain" 
            />
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
              Deck of Cards
            </span>
          </Link>

          {/* Navegación y Usuario */}
          <div className="flex items-center gap-4">
            
            {/* LINKS PRINCIPALES */}
            <div className="flex items-center gap-1 mr-4">
              <Link 
                to="/editor" 
                className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${
                  isActive('/editor') 
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-blue-500'
                }`}
              >
                Editor
              </Link>

              {/* Enlace al Historial */}
              {isAuthenticated && (
                <Link 
                  to="/history" 
                  className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${
                    isActive('/history') 
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-blue-500'
                  }`}
                >
                  Historial
                </Link>
              )}
            </div>

            {/* SECCIÓN DE USUARIO / LOGIN */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border-2 border-blue-200 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {userInitial}
                </button>

                {/* Dropdown Menu (Solo Usuario y Cerrar Sesión) */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{user?.username}</p>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // BOTONES PARA USUARIO NO LOGUEADO
              <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-4">
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-slate-600 px-4 py-2 rounded-lg hover:text-blue-600 hover:bg-slate-100 transition-all"
                >
                  Entrar
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}