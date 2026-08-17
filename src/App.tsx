import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, UserProfile, ChildData, LocationData, InsuranceType, CasePhase } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';
import { RegisterStep1 } from './views/RegisterStep1';
import { RegisterStep2 } from './views/RegisterStep2';
import { RegisterStep3 } from './views/RegisterStep3';
import { DashboardView } from './views/DashboardView';
import { ConoceView } from './views/ConoceView';
import { MiRutaView } from './views/MiRutaView';
import { FamiliasView } from './views/FamiliasView';
import { EvaluacionesView } from './views/EvaluacionesView';
import { CuestionarioView } from './views/CuestionarioView';
import { ProfesionalView } from './views/ProfesionalView';
import { SeguimientoView } from './views/SeguimientoView';
import { cargarPerfil, guardarPerfil, borrarPerfil } from './data/perfilLocal';
import { crearPerfilNuevo, generarCodigoCaso, PERFIL_DEMO } from './data/perfiles';
import { useRecorridoDemo } from './demo/useRecorridoDemo';
import { PanelDemo } from './demo/PanelDemo';
import { FlaskConical } from 'lucide-react';

export default function App() {
  // El perfil se rehidrata de localStorage al arrancar. Sin esto, el celular
  // que la familia escribe al registrarse se perdía al recargar y el botón de
  // WhatsApp volvía a pedirlo.
  const perfilGuardado = useRef<UserProfile | null>(cargarPerfil());

  const [user, setUser] = useState<UserProfile>(() => perfilGuardado.current ?? PERFIL_DEMO);

  /**
   * Quien abre el enlace por primera vez entra por la puerta, no por dentro.
   *
   * Antes la aplicación arrancaba directamente en el inicio y con una cuenta ya
   * puesta: quien llegaba desde el enlace se encontraba saludado por su nombre,
   * con un niño y una fase que no eran suyos, sin haber hecho nada. Ahora la
   * primera pantalla es el ingreso, y solo se salta si este navegador ya tiene
   * una cuenta guardada.
   */
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    perfilGuardado.current ? 'dashboard' : 'login'
  );

  /**
   * Si la persona ya entró. Mientras sea falso, nada se guarda.
   *
   * El perfil de demostración vive en memoria desde el arranque para que las
   * pantallas tengan con qué pintarse. Sin esta marca, el efecto de persistencia
   * lo escribía en el navegador nada más cargar, y en la siguiente visita el
   * ingreso ya no volvía a aparecer: la aplicación se quedaba para siempre
   * dentro de una cuenta que nadie creó.
   */
  const [haEntrado, setHaEntrado] = useState(Boolean(perfilGuardado.current));
  const [profesionalCode, setProfesionalCode] = useState<string>('NA-7K3M9');

  // Último perfil REAL, el de antes de entrar al recorrido de demostración.
  const perfilReal = useRef(user);

  const demo = useRecorridoDemo({
    irA: setCurrentScreen,
    aplicarPerfil: setUser,
    perfilOriginal: () => perfilReal.current,
  });

  // El recorrido escribe un caso sintético encima del real. Persistirlo
  // sobrescribiría el perfil de quien esté usando la aplicación, y al salir ya
  // no quedaría nada que restaurar.
  useEffect(() => {
    if (demo.activo) return;
    perfilReal.current = user;
    if (haEntrado) guardarPerfil(user);
  }, [user, demo.activo, haEntrado]);
  const [seguimientoId, setSeguimientoId] = useState<string>('');

  // Detect URL routing for /caso/:codigo, /seguimiento/:id, sus variantes con
  // hash, y ?caso= / ?seguimiento=.
  //
  // El enlace de seguimiento llega por WhatsApp, así que tiene que funcionar
  // pegado tal cual en el navegador del celular. Se soportan las tres formas
  // porque no todo hosting reescribe rutas a index.html.
  useEffect(() => {
    const handleUrlRouting = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      const seguimientoFromParam = searchParams.get('seguimiento');
      if (seguimientoFromParam) {
        setSeguimientoId(seguimientoFromParam);
        setCurrentScreen('seguimiento');
        return;
      }

      const desdeRuta = (base: string, texto: string) =>
        texto.startsWith(base)
          ? texto.split(base)[1]?.split('/')[0]?.split('?')[0]?.split('#')[0]
          : undefined;

      const seguimientoCode =
        desdeRuta('/seguimiento/', pathname) ?? desdeRuta('#/seguimiento/', hash);
      if (seguimientoCode) {
        setSeguimientoId(seguimientoCode);
        setCurrentScreen('seguimiento');
        return;
      }

      const casoFromParam = searchParams.get('caso');
      if (casoFromParam) {
        setProfesionalCode(casoFromParam);
        setCurrentScreen('profesional');
        return;
      }

      if (pathname.startsWith('/caso/')) {
        const code = pathname.split('/caso/')[1]?.split('/')[0]?.split('?')[0];
        if (code) {
          setProfesionalCode(code);
          setCurrentScreen('profesional');
          return;
        }
      }

      if (hash.startsWith('#/caso/')) {
        const code = hash.split('#/caso/')[1]?.split('/')[0]?.split('?')[0];
        if (code) {
          setProfesionalCode(code);
          setCurrentScreen('profesional');
          return;
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);

    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, []);

  /**
   * Ingreso de quien ya tiene su cuenta en este navegador.
   *
   * No hay servidor de cuentas: lo único que se puede recuperar es el perfil
   * guardado en este mismo dispositivo. Si no hay ninguno, la pantalla de
   * ingreso lo dice y ofrece las dos puertas reales, en vez de dejar entrar a
   * una cuenta que la persona no creó.
   */
  const handleLogin = (email: string) => {
    if (!perfilGuardado.current) return;
    setUser({ ...perfilGuardado.current, email });
    setHaEntrado(true);
    setCurrentScreen('dashboard');
  };

  /** Entrar a mirar con la cuenta de ejemplo, dicho con todas las letras. */
  const handleEntrarDemo = () => {
    setUser(PERFIL_DEMO);
    setHaEntrado(true);
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1Submit = (childData: ChildData) => {
    setUser((prev) => ({ ...prev, child: childData }));
    setCurrentScreen('register-step-2');
  };

  const handleStep2Submit = (locationData: LocationData) => {
    setUser((prev) => ({ ...prev, location: locationData }));
    setCurrentScreen('register-step-3');
  };

  const handleStep3Submit = (insurance: InsuranceType) => {
    setUser((prev) => {
      // El registro se completa aquí. Según el modelo de fases, "registro
      // completado" es la transición 1 -> 2, así que la familia sale de este
      // paso lista para el tamizaje, no antes.
      const yaTeniaCaso = Boolean(prev.caseCode);
      const codigo = prev.caseCode || generarCodigoCaso();
      const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

      return {
        ...prev,
        insurance,
        caseCode: codigo,
        fase: Math.max(prev.fase || 1, 2) as CasePhase,
        registros: yaTeniaCaso
          ? prev.registros
          : [
              ...(prev.registros || []),
              {
                fecha,
                titulo: 'Registro de caso completado',
                detalle: `Caso ${codigo} creado por la familia.`,
                tipo: 'fase_update' as const,
                origen: 'familia' as const,
                faseNum: 2 as CasePhase,
              },
            ],
      };
    });
    // El registro termina aquí: a partir de ahora sí hay cuenta que guardar.
    setHaEntrado(true);
    setCurrentScreen('dashboard');
  };

  /**
   * Empezar de cero, de verdad.
   *
   * "Cerrar sesión" y "volver a simular registro" solo cambiaban de pantalla: el
   * perfil seguía en localStorage y quien entraba después se encontraba con el
   * niño, la fase y el tamizaje de la persona anterior. En una demostración,
   * donde el mismo equipo pasa de mano en mano, eso es exactamente lo que no
   * puede ocurrir.
   */
  const handleResetFlow = () => {
    borrarPerfil();
    perfilGuardado.current = null;
    setHaEntrado(false);
    setUser(crearPerfilNuevo('', ''));
    setCurrentScreen('signup');
  };

  const handleCerrarSesion = () => {
    borrarPerfil();
    perfilGuardado.current = null;
    setHaEntrado(false);
    setUser(PERFIL_DEMO);
    setCurrentScreen('login');
  };

  /**
   * Repetir el tamizaje.
   *
   * El botón existía en Evaluaciones pero nadie le pasaba esta función, así que
   * abría el aviso de confirmación y no hacía nada. Y como el perfil de
   * demostración ya trae un resultado, era el ÚNICO camino que quedaba para
   * llegar al cuestionario: sin esto, el M-CHAT no se podía probar.
   */
  const handleRepetirEvaluacion = () => {
    setUser((prev) => ({ ...prev, screeningResult: null, screeningAnswers: undefined }));
    setCurrentScreen('cuestionario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to determine if we are in onboarding or professional view
  const isPlainLayout =
    currentScreen === 'login' ||
    currentScreen === 'signup' ||
    currentScreen === 'register-step-1' ||
    currentScreen === 'register-step-2' ||
    currentScreen === 'register-step-3' ||
    currentScreen === 'profesional' ||
    currentScreen === 'seguimiento';

  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F5FA] text-[#2E2A33] font-sans flex flex-col selection:bg-[#E9DFF5] selection:text-[#4A2270] overflow-x-hidden relative">
      {/* Top Navbar for authenticated/dashboard views */}
      {!isPlainLayout && (
        <Navbar
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            setCurrentScreen(screen);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          user={user}
          onResetFlow={handleResetFlow}
          onCerrarSesion={handleCerrarSesion}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'login' && (
          <LoginView
            onLogin={handleLogin}
            hayCuentaGuardada={Boolean(perfilGuardado.current)}
            onEntrarDemo={handleEntrarDemo}
            onGoToRegister={() => {
              setCurrentScreen('signup');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'signup' && (
          <SignupView
            onSignup={({ nombre, email, phone }) => {
              // REEMPLAZA el perfil, no lo mezcla. Antes se hacía spread sobre
              // el perfil de demostración y la familia heredaba su fase 3, su
              // tamizaje y su código de caso: empezaba la ruta a mitad de
              // camino y con resultados que nunca respondió.
              setUser({ ...crearPerfilNuevo(email, phone), name: nombre });
              setCurrentScreen('register-step-1');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToLogin={() => {
              setCurrentScreen('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'register-step-1' && (
          <RegisterStep1
            initialData={user.child}
            onNext={(data) => {
              handleStep1Submit(data);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'register-step-2' && (
          <RegisterStep2
            initialData={user.location}
            onNext={(data) => {
              handleStep2Submit(data);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => setCurrentScreen('register-step-1')}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'register-step-3' && (
          <RegisterStep3
            initialInsurance={user.insurance}
            onFinish={(data) => {
              handleStep3Submit(data);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => setCurrentScreen('register-step-2')}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardView
            user={user}
            onIniciarDemo={demo.iniciar}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'conoce' && (
          <ConoceView
            onNavigateToEvaluaciones={() => {
              setCurrentScreen('evaluaciones');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onIniciarDemo={demo.iniciar}
            onAbrirVistaProfesional={() => {
              setProfesionalCode(user.caseCode || 'NA-7K3M9');
              setCurrentScreen('profesional');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'mi-ruta' && (
          <MiRutaView
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'familias' && (
          <FamiliasView
            user={user}
            preguntaAutomatica={demo.pregunta}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToConoce={() => {
              setCurrentScreen('conoce');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'evaluaciones' && (
          <EvaluacionesView
            user={user}
            onResetEvaluation={handleRepetirEvaluacion}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'cuestionario' && (
          <CuestionarioView
            // key: al entrar o salir del recorrido hay que remontar la vista,
            // porque su estado de asistente es interno y no reacciona al prop.
            key={demo.activo ? 'demo' : 'real'}
            user={user}
            mostrarResultadoDirecto={demo.activo}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'seguimiento' && (
          <SeguimientoView
            id={seguimientoId}
            onIrAlInicio={() => {
              setCurrentScreen('mi-ruta');
              window.history.pushState({}, '', '/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'profesional' && (
          <ProfesionalView
            code={profesionalCode}
            currentUserState={user}
            onUpdateUser={(updated) => setUser(updated)}
            onBackToApp={() => {
              setCurrentScreen('dashboard');
              window.history.pushState({}, '', '/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <PanelDemo
        activo={demo.activo}
        enPausa={demo.enPausa}
        indice={demo.indice}
        paso={demo.paso}
        onAlternarPausa={demo.alternarPausa}
        onAnterior={demo.anterior}
        onSiguiente={demo.siguiente}
        onSalir={demo.salir}
      />

      {/* Interruptor del recorrido. Flotante y discreto: es una herramienta de
          presentación, no una función del producto. */}
      {!demo.activo && !isPlainLayout && (
        <button
          type="button"
          onClick={demo.iniciar}
          // En móvil sube por encima de la hoja de "Dónde atenderte", que vive
          // pegada abajo: a bottom-4 el botón caía justo sobre sus controles de
          // Ocultar / Mitad / Expandir y no se podían tocar.
          className="fixed bottom-24 lg:bottom-4 right-4 z-[55] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E1A47] hover:bg-[#4A2270] text-white text-xs font-bold shadow-lg border border-[#4A2270] transition-all cursor-pointer"
          title="Recorre toda la ruta con una cuenta de ejemplo"
        >
          <FlaskConical className="w-4 h-4 text-[#A78BC7]" />
          <span>Modo demostración</span>
        </button>
      )}

      {/* Persistent global footer on dashboard screens */}
      {!isPlainLayout && (
        <Footer 
          onOpenProfesional={(demoCode) => {
            setProfesionalCode(demoCode || user.caseCode || 'NA-7K3M9');
            setCurrentScreen('profesional');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
