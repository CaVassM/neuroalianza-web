import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { StepProgress } from '../components/StepProgress';
import { AvatarIcon, AVATAR_LIST } from '../components/Avatars';
import { CustomSelect } from '../components/CustomSelect';
import { AvatarId, ChildData } from '../types';
import { DAYS, MONTHS, YEARS } from '../constants/data';
import { motion } from 'motion/react';
import { Calendar, Sparkles, AlertCircle, Info } from 'lucide-react';
import { calcularEdadMeses, parseMesTextoANumero } from '../utils/age';

interface RegisterStep1Props {
  initialData: ChildData;
  onNext: (data: ChildData) => void;
  onGoToLogin: () => void;
}

export const RegisterStep1: React.FC<RegisterStep1Props> = ({
  initialData,
  onNext,
  onGoToLogin,
}) => {
  const [nickname, setNickname] = useState(initialData.nickname || '');
  const [birthDay, setBirthDay] = useState(initialData.birthDay || '');
  const [birthMonth, setBirthMonth] = useState(initialData.birthMonth || '');
  const [birthYear, setBirthYear] = useState(initialData.birthYear || '');
  const [avatarId, setAvatarId] = useState<AvatarId>(initialData.avatarId || 'cat');

  // Validations
  const numMonth = parseMesTextoANumero(birthMonth);
  const numYear = parseInt(birthYear, 10) || 0;
  const currentYear = new Date().getFullYear();

  // Rule: Apodo max 20 chars, no digits
  const hasDigitsInNickname = /\d/.test(nickname);
  const isNicknameTooLong = nickname.length > 20;

  // Rule: Year not in future and not older than 12 years
  const isYearFuture = numYear > currentYear;
  const isYearTooOld = numYear < currentYear - 12;
  const totalAgeMonths = numMonth > 0 && numYear > 0 ? calcularEdadMeses(numMonth, numYear) : 0;
  const isNegativeAge = isYearFuture || (numYear === currentYear && numMonth > (new Date().getMonth() + 1));

  let dateError = '';
  if (isNegativeAge) {
    dateError = 'Revisa la fecha. La fecha de nacimiento no puede ser futura.';
  } else if (isYearTooOld) {
    dateError = 'Revisa la fecha. La edad máxima registrada es de 12 años.';
  }

  let nicknameError = '';
  if (hasDigitsInNickname) {
    nicknameError = 'El apodo o nombre no debe contener números.';
  } else if (isNicknameTooLong) {
    nicknameError = 'El apodo debe tener como máximo 20 caracteres.';
  }

  // El nombre del niño deja de ser opcional: la aplicación lo usa en cada
  // pantalla ("la ruta de Luciana", "acompañar a Luciana"), y sin él todos esos
  // textos caen a "tu hijo/a", que suena a formulario y no a acompañamiento.
  const isValid =
    nickname.trim().length > 0 &&
    !hasDigitsInNickname &&
    !isNicknameTooLong &&
    !!birthDay &&
    numMonth >= 1 &&
    numMonth <= 12 &&
    numYear >= currentYear - 12 &&
    numYear <= currentYear &&
    !isNegativeAge &&
    !!avatarId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onNext({
      nickname: nickname.trim(),
      birthDay,
      birthMonth,
      birthYear,
      avatarId,
    });
  };

  return (
    <div className="flex-1 bg-[#F7F5FA] flex flex-col items-center pt-8 pb-12 px-4 sm:px-6">
      <div className="w-full flex justify-center mb-6">
        <Logo onClick={onGoToLogin} size="md" />
      </div>

      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[640px] bg-white rounded-2xl border border-[#E5E1EC] p-7 sm:p-11 shadow-sm"
      >
        <StepProgress currentStep={1} />

        <h2 className="text-[28px] sm:text-[32px] font-fraunces font-bold text-[#2E2A33] mb-8">
          Cuéntanos sobre tu hijo/a
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nombre del niño o niña */}
          <div>
            <label className="block text-[14px] font-semibold text-[#2E2A33] mb-2">
              ¿Cómo se llama tu hijo o hija? (máximo 20 caracteres)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Por ejemplo: Luciana"
              maxLength={20}
              className={`w-full px-4 py-3 rounded-xl border ${
                nicknameError ? 'border-red-500 bg-red-50/20' : 'border-[#E5E1EC] bg-white'
              } text-[15px] font-medium text-[#2E2A33] placeholder-[#6E6A75]/50 focus:outline-none focus:border-[#4A2270] focus:ring-2 focus:ring-[#4A2270]/20 transition-all shadow-xs`}
            />
            {nicknameError ? (
              <p className="mt-2 text-[13px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nicknameError}</span>
              </p>
            ) : (
              <p className="mt-2 text-[13px] text-[#6E6A75]">
                Puede ser su apodo o su nombre de pila. Lo usaremos en toda la app para
                acompañarte hablando de él o ella por su nombre.
              </p>
            )}
          </div>

          {/* Fecha de nacimiento completa: el día importa porque la edad en
              meses decide si el M-CHAT-R/F es aplicable (16 a 30 meses). */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4 text-[#4A2270]" />
              <label className="block text-[14px] font-semibold text-[#2E2A33]">
                Fecha de nacimiento
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CustomSelect
                value={birthDay}
                onChange={setBirthDay}
                options={DAYS}
                placeholder="Día"
              />

              <CustomSelect
                value={birthMonth}
                onChange={setBirthMonth}
                options={MONTHS}
                placeholder="Mes"
              />

              <CustomSelect
                value={birthYear}
                onChange={setBirthYear}
                options={YEARS}
                placeholder="Año"
              />
            </div>

            {dateError ? (
              <p className="mt-3 text-[13px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dateError}</span>
              </p>
            ) : totalAgeMonths > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3.5 flex items-center gap-2 bg-[#F0EBF8] text-[#4A2270] px-4 py-2.5 rounded-xl border border-[#D5C7E8] text-[13.5px] font-semibold w-fit"
              >
                <Sparkles className="w-4 h-4 text-[#4A2270] shrink-0" />
                <span>Tiene aproximadamente {totalAgeMonths} meses de edad</span>
              </motion.div>
            ) : null}

            {/* Nota para quien evalúa el prototipo: fuera de 16 a 30 meses el
                M-CHAT-R/F no es aplicable y el cuestionario queda bloqueado,
                así que no se puede recorrer la ruta completa. */}
            <div className="mt-3 flex items-start gap-2 text-[12.5px] text-[#6E6A75] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#6B3FA0] shrink-0 mt-0.5" />
              <span>
                El tamizaje M-CHAT-R/F está validado para{' '}
                <strong className="text-[#2E2A33]">16 a 30 meses</strong>. Si estás
                probando la plataforma, elige una fecha que dé entre{' '}
                <strong className="text-[#2E2A33]">20 y 30 meses</strong> para poder
                recorrer la evaluación completa.
              </span>
            </div>
          </div>

          {/* Choose Avatar */}
          <div>
            <label className="block text-[14px] font-semibold text-[#2E2A33] mb-3.5">
              Elige un avatar representativo (obligatorio)
            </label>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap bg-[#FAF8FD] p-4 rounded-2xl border border-[#E5E1EC]">
              {AVATAR_LIST.map((avatar) => (
                <AvatarIcon
                  key={avatar.id}
                  id={avatar.id}
                  size="xl"
                  selected={avatarId === avatar.id}
                  onClick={() => setAvatarId(avatar.id)}
                />
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-8 py-3.5 text-[15px] font-bold rounded-xl transition-all duration-200 shadow-sm ${
                isValid
                  ? 'bg-[#4A2270] hover:bg-[#381559] text-white cursor-pointer hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              }`}
            >
              Continuar
            </button>
          </div>
        </form>
      </motion.div>

      <div className="text-center pt-8 pb-4">
        <p className="text-[12px] text-[#6E6A75]">
          PAN orienta a familias y no reemplaza una consulta médica.
        </p>
      </div>
    </div>
  );
};
