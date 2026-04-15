import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
      setError('Credenciales incorrectas.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google/login";
  };

  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        
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
  );
}