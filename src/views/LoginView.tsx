import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ClipboardList, MapPin, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string) => void;
  onGoToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Simple mock login flow always goes to dashboard in this prototype, 
    // but the user's prompt indicated "Crear una" goes to registration.
    onLogin(email);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[100dvh]">
      {/* Left Purple Column */}
      <div className="lg:flex-[1.15] bg-[#3B195C] text-white p-10 sm:p-14 lg:p-20 flex flex-col justify-between">
        <div>
          <div className="mb-14">
            <Logo color="white" size="md" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-fraunces font-bold text-white leading-[1.1] tracking-tight mb-5">
            Estamos aquí para<br/>acompañarte
          </h1>
          <p className="text-white/90 text-base sm:text-lg mb-12 max-w-[420px] leading-relaxed">
            Orientación clara y confiable para familias que tienen dudas sobre el desarrollo de su hijo.
          </p>

          <div className="space-y-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ClipboardList className="w-4 h-4 text-[#E9DFF5]" />
              </div>
              <p className="text-[15px] text-white/90 leading-snug pt-1.5">
                Una herramienta de orientación validada, apropiada para la edad de tu hijo
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#E9DFF5]" />
              </div>
              <p className="text-[15px] text-white/90 leading-snug pt-1.5">
                La ruta de atención según tu seguro y tu distrito
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-[#E9DFF5]" />
              </div>
              <p className="text-[15px] text-white/90 leading-snug pt-1.5">
                Información verificada, con su fuente siempre visible
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Translucent Info Box */}
        <div className="mt-16 bg-white/10 rounded-2xl p-6 border border-white/20 max-w-[460px]">
          <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E9DFF5]" />
            Qué datos usamos
          </h4>
          <p className="text-[13px] text-white/80 leading-relaxed pr-4">
            Solo la edad de tu hijo, tu distrito y tu tipo de seguro, para personalizar la orientación que te mostramos. No pedimos el nombre del niño ni ningún dato que permita identificarlo.
          </p>
        </div>
      </div>

      {/* Right Login Card Column */}
      <div className="flex-1 bg-[#F7F5FA] flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#E5E1EC] p-8 sm:p-10 shadow-sm">
            <h2 className="text-[28px] font-fraunces font-bold text-[#2E2A33] mb-2 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-[15px] text-[#6E6A75] mb-8">
              Nos alegra tenerte de vuelta. Ingresa para continuar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E1EC] bg-white text-[15px] text-[#2E2A33] placeholder-[#6E6A75]/60 focus:outline-none focus:border-[#4A2270] focus:ring-1 focus:ring-[#4A2270] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E1EC] bg-white text-[15px] text-[#2E2A33] tracking-widest focus:outline-none focus:border-[#4A2270] focus:ring-1 focus:ring-[#4A2270] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6A75] hover:text-[#4A2270]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4A2270] hover:bg-[#32174D] text-white text-[15px] font-bold rounded-lg transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md cursor-pointer"
                >
                  Ingresar
                </button>
              </div>

              <div className="pt-4 text-center space-y-3 text-[13px]">
                <p className="text-[#6E6A75]">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={onGoToRegister}
                    className="text-[#4A2270] font-bold hover:underline cursor-pointer"
                  >
                    Crear una
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    className="text-[#6E6A75] hover:text-[#4A2270] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-[11px] text-[#6E6A75]">PAN no realiza diagnósticos.</p>
        </div>
      </div>
    </div>
  );
};
