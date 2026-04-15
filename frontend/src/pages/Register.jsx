import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import EyeIcon from '../components/EyeIcon';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden. Por favor, revísalas.');
            return;
        }

        try {
            const data = await authService.register(username, email, password);
            const userData = { id: data.user_id, username: username, email: email };
            login(userData, data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al registrar el usuario.');
        }
    };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Crear Cuenta</h2>
          <p className="text-slate-500 mt-2">Inicia sesión para guardar tu progreso</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Nombre de usuario</label>
            <input 
              type="text" required autoComplete="username"
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: usuario99"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
            <input 
              type="email" required autoComplete="email"
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required autoComplete="new-password"
                className="w-full pl-5 pr-12 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <EyeIcon isOpen={showPassword} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirmar contraseña</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required autoComplete="new-password"
                className="w-full pl-5 pr-12 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <EyeIcon isOpen={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 mt-2">
            Registrarse
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline font-extrabold">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}