import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer } from 'recharts';

const DEMO_TERMS = [
  { name: 'Muy Bajo', xVal: 0.10, mf: { supportStart: 0.00, coreStart: 0.00, coreEnd: 0.10, supportEnd: 0.22 } },
  { name: 'Bajo',     xVal: 0.28, mf: { supportStart: 0.12, coreStart: 0.22, coreEnd: 0.33, supportEnd: 0.44 } },
  { name: 'Medio',    xVal: 0.50, mf: { supportStart: 0.35, coreStart: 0.44, coreEnd: 0.56, supportEnd: 0.65 } },
  { name: 'Alto',     xVal: 0.72, mf: { supportStart: 0.56, coreStart: 0.67, coreEnd: 0.78, supportEnd: 0.88 } },
  { name: 'Muy Alto', xVal: 0.90, mf: { supportStart: 0.78, coreStart: 0.90, coreEnd: 1.00, supportEnd: 1.00 } },
];
const DEMO_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#d946ef'];

function FakeDemoPanel() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let timeout;
    if (visibleCount < DEMO_TERMS.length) {
      timeout = setTimeout(() => setVisibleCount(v => v + 1), 1300);
    } else {
      timeout = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisibleCount(0);
          setFading(false);
        }, 500);
      }, 2400);
    }
    return () => clearTimeout(timeout);
  }, [visibleCount]);

  const visibleTerms = DEMO_TERMS.slice(0, visibleCount);
  const activeIndex = visibleCount - 1;

  return (
    <div
      className="mt-6 w-full flex flex-col gap-3 transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* Mini header badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paso 2</span>
        <span className="text-[10px] text-slate-300">·</span>
        <span className="text-[10px] font-semibold text-slate-400">Modelar Conceptos Difusos</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold">En vivo</span>
        </span>
      </div>

      {/* Term pills */}
      <div className="flex flex-wrap gap-1.5">
        {DEMO_TERMS.map((term, index) => {
          const color = DEMO_COLORS[index % DEMO_COLORS.length];
          const isVisible = index < visibleCount;
          const isActive = index === activeIndex;
          return (
            <span
              key={term.name}
              className="px-3 py-1 rounded-lg text-[11px] font-bold border-2 transition-all duration-500"
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color, color: '#fff', transform: 'scale(1.08)' }
                  : isVisible
                  ? { borderColor: color, color: '#475569', backgroundColor: 'white', opacity: 0.85 }
                  : { borderColor: '#e2e8f0', color: '#cbd5e1', backgroundColor: 'white' }
              }
            >
              {term.name}
            </span>
          );
        })}
      </div>

      {/* Chart */}
      <div
        className="w-full rounded-2xl border border-slate-200 p-2 transition-all duration-300"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <ResponsiveContainer width="99%" height={188}>
          <ComposedChart margin={{ top: 14, right: 18, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.5, 1]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={26}
            />
            {visibleTerms.map((term, index) => {
              const color = DEMO_COLORS[index % DEMO_COLORS.length];
              const isActive = index === activeIndex;
              return (
                <ReferenceLine
                  key={`ref-${term.name}`}
                  x={term.xVal}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeWidth={isActive ? 2 : 1}
                  label={{ position: 'top', value: term.name, fill: color, fontWeight: isActive ? '900' : '600', fontSize: 10 }}
                />
              );
            })}
            {visibleTerms.map((term, index) => {
              const color = DEMO_COLORS[index % DEMO_COLORS.length];
              const isActive = index === activeIndex;
              return (
                <ReferenceArea
                  key={`area-${term.name}`}
                  x1={term.mf.supportStart}
                  x2={term.mf.supportEnd}
                  fill={color}
                  fillOpacity={isActive ? 0.22 : 0.07}
                />
              );
            })}
            {visibleTerms.map((term, index) => {
              const color = DEMO_COLORS[index % DEMO_COLORS.length];
              const isActive = index === activeIndex;
              const trapezeData = [
                { x: term.mf.supportStart, y: 0 },
                { x: term.mf.coreStart,    y: 1 },
                { x: term.mf.coreEnd,      y: 1 },
                { x: term.mf.supportEnd,   y: 0 },
              ];
              return (
                <Line
                  key={`line-${term.name}`}
                  data={trapezeData}
                  dataKey="y"
                  type="linear"
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  dot={isActive ? { r: 4, fill: color, stroke: '#fff', strokeWidth: 2 } : false}
                  activeDot={false}
                  isAnimationActive={isActive}
                  animationDuration={550}
                  animationEasing="ease-out"
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Terms table */}
      <div className="w-full rounded-xl border border-slate-200 bg-white/80 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Términos modelados</span>
          <span className="text-[10px] font-bold text-blue-500">{visibleCount} / {DEMO_TERMS.length}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {DEMO_TERMS.map((term, index) => {
            const isVisible = index < visibleCount;
            const isActive = index === activeIndex;
            const color = DEMO_COLORS[index % DEMO_COLORS.length];
            return (
              <div
                key={term.name}
                className={`flex items-center px-4 py-2 transition-all duration-500 ${isActive ? 'bg-blue-50/60' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
              >
                <span className="w-2 h-2 rounded-full mr-3 shrink-0 transition-all duration-300" style={{ backgroundColor: isVisible ? color : '#e2e8f0', transform: isActive ? 'scale(1.4)' : 'scale(1)' }} />
                <span className={`text-xs flex-1 transition-all duration-300 ${isActive ? 'font-black text-slate-800' : 'font-semibold text-slate-500'}`}>
                  {term.name}
                </span>
                {isVisible && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    [{term.mf.coreStart.toFixed(2)},&nbsp;{term.mf.coreEnd.toFixed(2)}]
                  </span>
                )}
                {isActive && (
                  <span className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  
  const googleLoginProcessed = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token && !googleLoginProcessed.current) {
      googleLoginProcessed.current = true;

      const url = new URL(window.location);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url);

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);

        const googleUser = {
          _id: decodedToken.sub || decodedToken.user_id || "google_id",
          username: decodedToken.email ? decodedToken.email.split('@')[0] : "Usuario Google",
          email: decodedToken.email || ""
        };

        login({ user: googleUser, access_token: token });
        navigate('/', { replace: true });

      } catch (err) {
        console.error("Error al decodificar el token de Google:", err);
        setTimeout(() => {
          setError("Error al procesar el login con Google. El token está corrupto.");
        }, 0);
      }
    }
  }, [searchParams, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.login(email, password);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.backendData?.detail || 'Credenciales incorrectas.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="hidden lg:flex flex-col justify-start rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 via-indigo-50 to-sky-50 p-10 self-stretch">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Deck of Cards</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-800">Modela y compara de forma visual</h1>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            Construye funciones de pertenencia difusa, guarda tu historial y vuelve a trabajar donde lo dejaste.
          </p>
          <Link
            to="/editor"
            className="mt-6 inline-flex w-fit items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Ir al editor principal
          </Link>
          <FakeDemoPanel />
        </div>

        <div className="w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Deck of Cards</h2>
            <p className="text-slate-500 mt-2">Accede a tu historial y gráficas guardadas</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" 
              placeholder="correo@ejemplo.com" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-5 pr-12 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <FiEye className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <FiEyeOff className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 mt-2">
            Entrar
          </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-3 bg-white text-slate-400 font-bold">O</span></div>
          </div>

          <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-slate-100 rounded-2xl bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-95">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Continuar con Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">¿Nuevo por aquí? <Link to="/register" className="text-blue-600 hover:underline font-extrabold">Crea una cuenta</Link></p>
        </div>
      </div>
    </div>
  );
}