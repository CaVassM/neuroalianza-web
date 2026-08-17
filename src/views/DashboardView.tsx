import React, { useState, useEffect } from 'react';
import { ScreenType, UserProfile } from '../types';
import { AvatarIcon } from '../components/Avatars';
import { RastreadorCompacto } from '../components/PhaseTracker/RastreadorCompacto';
import fatherDaughterBg from '../assets/images/father_daughter_bg_1786760706949.jpg';
import { 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  Compass,
  X,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onUpdateUser?: (actualizado: UserProfile) => void;
  /** Arranca el recorrido guiado. */
  onIniciarDemo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onUpdateUser,
  onIniciarDemo,
}) => {
  const childName = user.child.nickname || 'tu hijo/a';

  // Bienvenida que invita a Conócenos, una vez por CUENTA.
  //
  // Antes la marca vivía en localStorage, o sea por navegador: quien ya había
  // abierto la aplicación una vez no volvía a verla, ni siquiera después de
  // registrarse. Justo al revés de lo que hace falta, porque el momento en que
  // más sirve es el primer ingreso de una cuenta nueva.
  const [cerradaEnEstaSesion, setCerradaEnEstaSesion] = useState(false);
  const mostrarBienvenida = !user.bienvenidaVista && !cerradaEnEstaSesion;

  const cerrarBienvenida = () => {
    setCerradaEnEstaSesion(true);
    onUpdateUser?.({ ...user, bienvenidaVista: true });
  };

  const featureCards = [
    {
      id: 'evaluaciones' as ScreenType,
      title: 'Herramientas de evaluación',
      description: 'Cuestionarios validados para evaluar el desarrollo de tu niño.',
      icon: <Clock className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'mi-ruta' as ScreenType,
      title: 'Encuentra tu ruta',
      description: 'Servicios y pasos según tu seguro y tu distrito.',
      icon: <MapPin className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'familias' as ScreenType,
      title: 'Información para familias',
      description: 'Información confiable para acompañarte en cada etapa.',
      icon: <BookOpen className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'conoce' as ScreenType, // links to Conoce / Glossary
      title: 'Definiciones importantes',
      description: 'TEA, tamizaje, CRED, referencia y otros términos.',
      icon: <HelpCircle className="w-5 h-5 text-[#4A2270]" />,
      scrollToDefinitions: true,
    },
  ];

  // Escape también cierra: es el reflejo de cualquiera ante un modal.
  useEffect(() => {
    if (!mostrarBienvenida) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarBienvenida();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [mostrarBienvenida]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300 relative z-10">

      {/* Bienvenida: por dónde empezar.
          Suave a propósito: fondo tenue, se cierra tocando fuera, con Escape o
          con la X, y la opción de saltarla está al mismo nivel que la de ir.
          Es una sugerencia, no un peaje. */}
      {mostrarBienvenida && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/25 p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={cerrarBienvenida}
          role="presentation"
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl p-7 sm:p-9 max-w-[440px] w-full shadow-2xl border border-[#E5E1EC] space-y-5 relative animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cerrarBienvenida}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6E6A75] hover:bg-[#F7F5FA] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-[#F4EFFB] text-[#4A2270] flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-[24px] font-fraunces font-bold text-[#2E2A33] leading-tight">
                ¿Por dónde empiezo?
              </h2>
              <p className="text-[14px] text-[#6E6A75] leading-relaxed">
                Antes de nada, pasa por <strong className="text-[#2E2A33]">Conócenos</strong>.
                Ahí te contamos en dos minutos qué sí hacemos, qué no, y hasta dónde llega
                esta versión. Así sabes qué esperar de PAN.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  cerrarBienvenida();
                  onNavigate('conoce');
                }}
                className="flex-1 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-[14px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Ir a Conócenos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cerrarBienvenida}
                className="flex-1 sm:flex-none px-5 py-3 bg-white border border-[#E5E1EC] text-[#6E6A75] hover:bg-[#F7F5FA] text-[14px] font-semibold rounded-xl transition-all cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 1. HERO BANNER (Split Layout) */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E1EC] flex flex-col md:flex-row mb-10 shrink-0 relative">
        {/* Left Text Content */}
        <div className="flex-1 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center relative z-10">
          <p className="text-[#4A2270] font-bold tracking-widest uppercase text-xs mb-3">
            Evaluación del desarrollo
          </p>
          
          {/* El nombre del cuidador SÍ se pide ahora, al crear la cuenta. Si
              aun así falta, se saluda sin nombre en vez de inventar uno. */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-fraunces font-bold text-[#2E2A33] leading-[1.15] tracking-tight mb-4">
            {user.name ? <>Hola, {user.name}.<br /></> : null}
            Estamos aquí para acompañarte.
          </h1>
          
          <p className="text-[#6E6A75] text-base lg:text-lg mb-8 max-w-md leading-relaxed">
            Buscar respuestas puede generar muchas dudas. Aquí encontrarás orientación clara y adaptada para resolver tus dudas sobre el desarrollo de {childName}.
          </p>

          {/* Child Profile Box inside Hero */}
          <div className="flex items-center gap-3.5 mb-8 bg-[#F7F5FA] px-4 py-3 rounded-xl w-fit border border-[#E5E1EC]">
            <AvatarIcon id={user.child.avatarId} size="md" className="shadow-xs" />
            <div>
              <p className="text-[15px] font-bold text-[#2E2A33] leading-tight">{childName}</p>
              <p className="text-xs text-[#6E6A75] mt-0.5">
                {user.child.birthDay ? `${user.child.birthDay} de ` : ''}{user.child.birthMonth} {user.child.birthYear}
              </p>
            </div>
          </div>
        </div>

        {/* Right Image Content */}
        <div className="w-full md:w-[45%] lg:w-[40%] min-h-[300px] md:min-h-full relative shrink-0">
          {/* Faded edge for smooth blending on desktop */}
          <div className="hidden md:block absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <img 
            src={fatherDaughterBg} 
            alt="Padre e hija sonriendo" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* Invitación al recorrido guiado.
          Sustituye al tutorial en video: en vez de contar la plataforma, la
          plataforma se recorre sola. Va aquí arriba y no escondida, porque la
          duda de "¿y esto qué hace?" aparece justo al entrar. */}
      {onIniciarDemo && (
        <section className="bg-white border border-[#D5C6EB] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center shrink-0">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[17px] font-bold text-[#2E2A33]">
                ¿Es tu primera vez? Míralo funcionando
              </h3>
              <p className="text-sm text-[#6E6A75] leading-relaxed max-w-xl">
                En dos minutos recorremos la plataforma por ti con una familia de ejemplo:
                el tamizaje, dónde le toca atenderse, qué pasa al volver de la cita y cómo
                responde el asistente. No tienes que escribir nada.
              </p>
              <p className="text-[12.5px] text-[#8A8594] leading-relaxed">
                Usa una cuenta de ejemplo, así que{' '}
                <strong className="text-[#6E6A75]">no toca tus datos ni tu avance</strong>. Puedes
                pausarlo, retroceder y salir cuando quieras.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onIniciarDemo}
            className="shrink-0 px-6 py-3.5 bg-[#4A2270] hover:bg-[#381559] text-white text-[15px] font-bold rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Empezar el recorrido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* 2. RASTREADOR COMPACTO */}
      <section className="mb-6">
        <RastreadorCompacto user={user} onClick={() => onNavigate('mi-ruta')} />
      </section>

      {/* 3. Grilla de 4 tarjetas (2 columnas) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-6">
        {featureCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(card.id)}
            className="bg-white border border-[#E5E1EC] p-5 rounded-xl flex gap-4 items-start hover:border-[#4A2270]/40 transition-all duration-200 hover:shadow-sm cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-lg bg-[#F7F5FA] border border-[#E5E1EC] flex items-center justify-center shrink-0 group-hover:bg-[#E9DFF5] transition-colors">
              {card.icon}
            </div>

            <div>
              <h3 className="font-bold text-[#2E2A33] mb-1 group-hover:text-[#4A2270] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-[#6E6A75] leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* 4. Franja discreta en lavanda con icono de escudo */}
      <section className="bg-white border border-[#E5E1EC] p-4 rounded-xl flex items-center gap-4 shrink-0 shadow-sm">
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#4A2270]" />
        </div>
        <p className="text-xs text-[#4A2270] font-medium leading-relaxed">
          Tus datos se usan solo para personalizar la orientación y para escribirte por
          WhatsApp sobre tu caso. No pedimos DNI ni documentos de identidad.
        </p>
      </section>
    </div>
  );
};
