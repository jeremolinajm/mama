import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('Credenciales inválidas. Por favor verifica tus datos.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
      
      {/* Decoración de Fondo (Sutil) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-4 relative z-10 animate-fade-in-up">
        
        {/* Tarjeta de Login */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary text-white text-2xl font-serif font-bold italic flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-lg shadow-primary/20">
              F
            </div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Bienvenida
            </h1>
            <p className="text-gray-500 text-sm">
              Ingresa al panel de administración de <br/>
              <span className="font-medium text-gray-700">Flavia Dermobeauty</span>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Usuario */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 text-gray-900"
                  placeholder="admin"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 animate-shake">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Botón de Acción */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center pt-6 border-t border-dashed border-gray-100">
            <a 
              href="/" 
              className="text-xs font-medium text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al sitio público
            </a>
          </div>

        </div>
        
        {/* Copyright Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} Flavia Dermobeauty System.
        </p>
      </div>
    </div>
  );
}