import React, { useState, useEffect } from 'react';
import { ScreenType, UserProfile, ChildData, LocationData, InsuranceType } from './types';
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

export default function App() {
  // State for user registration & profile
  const [user, setUser] = useState<UserProfile>({
    name: 'María',
    email: 'maria.rodriguez@ejemplo.pe',
    child: {
      nickname: 'Luciana',
      birthDay: '10',
      birthMonth: 'Diciembre',
      birthYear: '2024',
      avatarId: 'cat',
    },
    location: {
      department: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
    },
    insurance: 'sis',
    caseCode: 'NA-7K3M9',
    fase: 3,
    screeningResult: {
      score: 5,
      nivel: 'moderada',
      completedAt: '2026-08-14T10:30:00Z',
    },
  });

  // Current view state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [profesionalCode, setProfesionalCode] = useState<string>('NA-7K3M9');

  // Detect URL routing for /caso/:codigo or hash #/caso/:codigo or ?caso=...
  useEffect(() => {
    const handleUrlRouting = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

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

  // Navigation handlers for onboarding
  const handleLogin = (email: string) => {
    setUser((prev) => ({ ...prev, email }));
    setCurrentScreen('dashboard');
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
    setUser((prev) => ({ ...prev, insurance }));
    setCurrentScreen('dashboard');
  };

  const handleResetFlow = () => {
    setCurrentScreen('login');
  };

  // Helper to determine if we are in onboarding or professional view
  const isPlainLayout =
    currentScreen === 'login' ||
    currentScreen === 'signup' ||
    currentScreen === 'register-step-1' ||
    currentScreen === 'register-step-2' ||
    currentScreen === 'register-step-3' ||
    currentScreen === 'profesional';

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
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'login' && (
          <LoginView
            onLogin={handleLogin}
            onGoToRegister={() => {
              setCurrentScreen('signup');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'signup' && (
          <SignupView
            onSignup={(email) => {
              setUser((prev) => ({ ...prev, email }));
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
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'cuestionario' && (
          <CuestionarioView
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
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
