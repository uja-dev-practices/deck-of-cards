import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogIn, FiLogOut, FiEdit3, FiClock } from 'react-icons/fi';

function NavTab({ to, isActive, icon, children }) {
  const Icon = icon;

  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
        isActive
          ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80'
          : 'text-slate-500 hover:bg-white/50 hover:text-slate-700',
      ].join(' ')}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${isActive ? 'text-slate-600' : 'text-slate-400'}`}
        strokeWidth={2}
        aria-hidden
      />
      <span>{children}</span>
      {isActive && (
        <span
          className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-blue-600"
          aria-hidden
        />
      )}
    </Link>
  );
}

function AccederButton({ isActive }) {
  return (
    <Link
      to="/login"
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        isActive
          ? 'bg-blue-700 shadow-md shadow-blue-700/35 ring-2 ring-blue-400/50 ring-offset-1 ring-offset-white'
          : [
              'bg-blue-600 shadow-md shadow-blue-600/30',
              'hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/35',
            ].join(' '),
      ].join(' ')}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white transition-colors duration-200 group-hover:bg-white/25"
        aria-hidden
      >
        <FiLogIn className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span>Acceder</span>
    </Link>
  );
}

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const userInitial = user?.username ? user.username[0].toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const isEditorActive =
    location.pathname === '/editor' || location.pathname === '/';
  const isHistoryActive = location.pathname.startsWith('/history');
  const isLoginActive = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-50 h-16 w-full shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 whitespace-nowrap transition-opacity hover:opacity-80"
        >
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt="Deck of Cards Logo"
            className="h-10 w-10 rounded-xl object-contain shadow-sm"
          />
          <span className="hidden bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-black text-transparent sm:block">
            Deck of Cards
          </span>
        </Link>

        <div className="flex items-center gap-4 whitespace-nowrap">
          {isAuthenticated && (
            <nav
              className="flex items-center gap-0.5 rounded-xl bg-slate-100/90 p-1"
              aria-label="Secciones principales"
            >
              <NavTab to="/editor" isActive={isEditorActive} icon={FiEdit3}>
                Editor
              </NavTab>
              <NavTab to="/history" isActive={isHistoryActive} icon={FiClock}>
                Historial
              </NavTab>
            </nav>
          )}

          {isAuthenticated ? (
            <div className="relative border-l border-slate-200 pl-4">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                aria-label="Menú de usuario"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-100 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {userInitial}
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg">
                    <div className="border-b border-slate-50 px-4 py-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Usuario
                      </p>
                      <p className="truncate text-sm font-bold text-slate-700">
                        {user?.username}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <FiLogOut className="h-5 w-5" strokeWidth={2.5} />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              <AccederButton isActive={isLoginActive} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
