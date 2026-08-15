import React from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
}) => {
  const childName = user.child.nickname || 'Luciana';

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
      title: 'Para familias',
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300 relative z-10">
      
      {/* 1. HERO BANNER (Split Layout) */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E1EC] flex flex-col md:flex-row mb-10 shrink-0 relative">
        {/* Left Text Content */}
        <div className="flex-1 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center relative z-10">
          <p className="text-[#4A2270] font-bold tracking-widest uppercase text-xs mb-3">
            Evaluación del desarrollo
          </p>
          
          {/* Sin nombre: el registro nunca pide el del cuidador. El saludo
              caía a "María", del perfil de demostración, y le daba la
              bienvenida a la familia con un nombre que no era el suyo. */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-fraunces font-bold text-[#2E2A33] leading-[1.15] tracking-tight mb-4">
            Estamos aquí<br />
            para acompañarte.
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
          Tus datos se usan solo para personalizar la orientación. No pedimos el nombre del niño ni ningún dato que permita identificarlo.
        </p>
      </section>
    </div>
  );
};
