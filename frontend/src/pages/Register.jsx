import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    const [verificationRequired, setVerificationRequired] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const getErrorMessage = (err, fallback) => (
        err.response?.data?.detail || err.backendData?.detail || fallback
    );

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden. Por favor, revísalas.');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await authService.register(username, email, password);
            setPendingEmail(data.email || email.trim().toLowerCase());
            setVerificationRequired(true);
            setInfoMessage(data.message || 'Te hemos enviado un código de verificación por correo.');
        } catch (err) {
            setError(getErrorMessage(err, 'Error al registrar el usuario.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (!verificationCode.trim()) {
            setError('Introduce el código de verificación.');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await authService.verifyEmail(pendingEmail, verificationCode);
            login({
                user: {
                    id: data.user_id,
                    username: data.username,
                    email: data.email,
                },
                token: data.token,
            });
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err, 'No se pudo verificar el email.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        setError('');
        setInfoMessage('');
        setIsResending(true);

        try {
            const data = await authService.resendVerification(pendingEmail);
            setInfoMessage(data.message || 'Nuevo código enviado.');
        } catch (err) {
            setError(getErrorMessage(err, 'No se pudo reenviar el código.'));
        } finally {
            setIsResending(false);
        }
    };

  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {verificationRequired ? 'Verifica tu email' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-500 mt-2">
            {verificationRequired
              ? `Introduce el código enviado a ${pendingEmail}`
              : 'Inicia sesión para guardar tu progreso'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-sm font-bold mb-6 border border-blue-100 text-center">
            {infoMessage}
          </div>
        )}

        {!verificationRequired ? (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                {showPassword ? (
                  <FiEye className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <FiEyeOff className="w-5 h-5" strokeWidth={2} />
                )}
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
                {showConfirmPassword ? (
                  <FiEye className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <FiEyeOff className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 mt-2"
          >
            {isSubmitting ? 'Enviando código...' : 'Registrarse'}
          </button>
        </form>
        ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Código de verificación</label>
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-center text-2xl font-black tracking-[0.35em]"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 mt-2"
          >
            {isSubmitting ? 'Verificando...' : 'Verificar email'}
          </button>

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full py-3 text-blue-600 hover:text-blue-700 disabled:text-blue-300 font-extrabold transition-colors"
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline font-extrabold">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}