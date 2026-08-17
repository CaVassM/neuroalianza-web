import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ClipboardList, MapPin, ShieldCheck, Eye, EyeOff, FlaskConical } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string) => void;
  onGoToRegister: () => void;
  /** Si este navegador tiene una cuenta guardada que se pueda recuperar. */
  hayCuentaGuardada?: boolean;
  /** Entrar a mirar con la cuenta de ejemplo. */
  onEntrarDemo?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onGoToRegister,
  hayCuentaGuardada = false,
  onEntrarDemo,
}) => {
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

    // PAN no tiene servidor de cuentas: lo único recuperable es el perfil
    // guardado en este mismo navegador. Sin él no hay a qué entrar, y dejar
    // pasar a una cuenta que la persona no creó es peor que decírselo.
    if (!hayCuentaGuardada) {
      setError(
        'En este dispositivo todavía no hay ninguna cuenta. Crea la tuya o entra con la cuenta de ejemplo.'
      );
      return;
    }

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
          {/* Este aviso decía que no pedíamos el nombre del niño. Sí lo pedimos:
              la aplicación lo usa en todas las pantallas. Al pasar el ingreso a
              ser la primera pantalla, la frase quedó a la vista de todos. */}
          <p className="text-[13px] text-white/80 leading-relaxed pr-4">
            Tu nombre y el de tu hijo, su fecha de nacimiento, tu distrito y tu seguro:
            con eso personalizamos la orientación. El celular solo se usa si pides que te
            enviemos tu ruta por WhatsApp. No pedimos DNI ni documentos de identidad.
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

              <div className="pt-4 text-center text-[13px]">
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
              </div>
            </form>

            {/* Entrada a la cuenta de ejemplo.
                Va aparte y con su nombre, no escondida detrás del formulario:
                antes se llegaba a ella sin querer, porque la aplicación abría
                directamente dentro y saludaba a quien llegaba con un nombre,
                un niño y una fase que no eran suyos. */}
            {onEntrarDemo && (
              <div className="mt-7 pt-6 border-t border-[#E5E1EC] space-y-3">
                <div className="flex items-start gap-2.5">
                  <FlaskConical className="w-4 h-4 text-[#6B3FA0] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#6E6A75] leading-relaxed">
                    ¿Solo quieres mirar? Entra con una cuenta de ejemplo, con la ruta ya
                    empezada. No es una familia real.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEntrarDemo}
                  className="w-full py-3 bg-white hover:bg-[#FAF8FD] border border-[#D5C6EB] text-[#4A2270] text-[14px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Explorar con la cuenta de ejemplo
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-[11px] text-[#6E6A75]">PAN no realiza diagnósticos.</p>
        </div>
      </div>
    </div>
  );
};
