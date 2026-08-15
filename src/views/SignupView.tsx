import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ClipboardList, MapPin, ShieldCheck, Eye, EyeOff, AlertCircle, MessageCircle } from 'lucide-react';

interface SignupViewProps {
  onSignup: (datos: { email: string; phone: string }) => void;
  onGoToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onSignup, onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  // Un celular peruano son 9 dígitos y empieza por 9. Guardamos solo los
  // dígitos: el servicio de WhatsApp le antepone el código de país.
  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = /^9\d{8}$/.test(phoneDigits);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;

  const isValid =
    isEmailValid && isPhoneValid && isPasswordValid && doPasswordsMatch && termsAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSignup({ email: email.trim(), phone: phoneDigits });
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
            Estamos aquí para<br />acompañarte
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
            La edad de tu hijo, tu distrito y tu tipo de seguro, para personalizar la orientación, y tu celular para avisarte por WhatsApp sobre tu caso. No pedimos DNI ni documentos de identidad.
          </p>
        </div>
      </div>

      {/* Right Signup Card Column */}
      <div className="flex-1 bg-[#F7F5FA] flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#E5E1EC] p-8 sm:p-10 shadow-sm">
            <h2 className="text-[28px] font-fraunces font-bold text-[#2E2A33] mb-2 tracking-tight">
              Crear una cuenta
            </h2>
            <p className="text-[14px] text-[#6E6A75] mb-8 leading-relaxed">
              Toma menos de dos minutos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                {email.length > 0 && !isEmailValid && (
                  <p className="mt-1.5 text-[12px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Ingresa un correo con formato válido (ej. usuario@correo.com).</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
                  Celular
                </label>
                <div className="flex items-stretch gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-[#E5E1EC] bg-[#FAF8FD] text-[15px] font-semibold text-[#6E6A75] select-none">
                    +51
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="987 654 321"
                    maxLength={12}
                    className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-[#E5E1EC] bg-white text-[15px] text-[#2E2A33] placeholder-[#6E6A75]/60 focus:outline-none focus:border-[#4A2270] focus:ring-1 focus:ring-[#4A2270] transition-colors"
                  />
                </div>
                {phone.length > 0 && !isPhoneValid ? (
                  <p className="mt-1.5 text-[12px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Debe ser un celular de 9 dígitos que empiece con 9.</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-[12px] text-[#6E6A75] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 shrink-0 text-[#4A2270]" />
                    <span>Te escribiremos por WhatsApp solo para avisos de tu caso.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
                  Contraseña (mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E1EC] bg-white text-[15px] text-[#2E2A33] focus:outline-none focus:border-[#4A2270] focus:ring-1 focus:ring-[#4A2270] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6A75] hover:text-[#4A2270]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && !isPasswordValid && (
                  <p className="mt-1.5 text-[12px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>La contraseña debe tener al menos 8 caracteres.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E1EC] bg-white text-[15px] text-[#2E2A33] focus:outline-none focus:border-[#4A2270] focus:ring-1 focus:ring-[#4A2270] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6A75] hover:text-[#4A2270]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !doPasswordsMatch && (
                  <p className="mt-1.5 text-[12px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Las contraseñas no coinciden.</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={`w-5 h-5 rounded-md flex-shrink-0 border flex items-center justify-center mt-0.5 transition-colors cursor-pointer ${
                    termsAccepted ? 'border-[#4A2270] bg-[#4A2270] text-white' : 'border-[#C5BACD] bg-white'
                  }`}
                >
                  {termsAccepted && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <p className="text-[13px] text-[#6E6A75] leading-relaxed cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                  Acepto los términos de uso y la política de privacidad de PAN.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`w-full py-3.5 text-[15px] font-bold rounded-lg transition-all duration-200 ${
                    isValid
                      ? 'bg-[#4A2270] hover:bg-[#32174D] text-white cursor-pointer hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              <div className="pt-4 text-center space-y-3 text-[14px]">
                <p className="text-[#6E6A75]">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={onGoToLogin}
                    className="text-[#4A2270] font-bold hover:underline cursor-pointer"
                  >
                    Inicia sesión
                  </button>
                </p>
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
