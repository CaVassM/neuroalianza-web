import React, { useState } from 'react';
import { Logo } from './Logo';
import { AvatarIcon } from './Avatars';
import { ScreenType, UserProfile } from '../types';
import { Menu, X, LogOut, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  user: UserProfile;
  onResetFlow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  user,
  onResetFlow,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems: { screen: ScreenType; label: string }[] = [
    { screen: 'dashboard', label: 'Inicio' },
    { screen: 'conoce', label: 'Conócenos' },
    { screen: 'evaluaciones', label: 'Evaluaciones' },
    { screen: 'mi-ruta', label: 'Mi ruta' },
    { screen: 'familias', label: 'Para familias' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E1EC] px-4 sm:px-8 h-16 flex items-center transition-all">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Logo onClick={() => onNavigate('dashboard')} size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6E6A75]">
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => {
                    onNavigate(item.screen);
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#4A2270] font-semibold border-b-2 border-[#4A2270] pb-1 -mb-[2px]'
                      : 'text-[#6E6A75] hover:text-[#4A2270]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Child Avatar & Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-[#F7F5FA] border border-transparent hover:border-[#E5E1EC] transition-all cursor-pointer"
              aria-label="Menú de perfil"
            >
              <div className="w-8 h-8 rounded-full bg-[#E9DFF5] flex items-center justify-center text-[#4A2270] text-xs font-bold flex-shrink-0">
                {user.child.nickname ? user.child.nickname.substring(0, 2).toUpperCase() : 'MA'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#2E2A33]">
                  {user.child.nickname || 'Tu hijo/a'}
                </span>
                <span className="text-[10px] text-[#6E6A75] leading-tight">
                  {user.location.district || 'Lima'} · {user.insurance.toUpperCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6E6A75]" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-[#E5E1EC] p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#E5E1EC] mb-2">
                    <p className="text-xs font-semibold text-[#4A2270]">{user.name}</p>
                    <p className="text-[11px] text-[#6E6A75] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#2E2A33] bg-[#E9DFF5]/40 px-2 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 text-[#6B3FA0]" />
                      <span>Perfil: {user.child.nickname || 'Hijo/a'} ({user.child.birthMonth} {user.child.birthYear})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('conoce');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#2E2A33] hover:bg-[#F7F5FA] rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Conoce PAN</span>
                    <span className="text-[10px] bg-[#E9DFF5] text-[#4A2270] px-1.5 py-0.5 rounded">Guía</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onResetFlow) onResetFlow();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#6E6A75] hover:bg-[#F7F5FA] hover:text-[#4A2270] rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Volver a simular registro</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#6E6A75] hover:text-[#4A2270] hover:bg-[#F7F5FA] md:hidden"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-[#E5E1EC] flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => {
                onNavigate(item.screen);
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2.5 text-sm text-left rounded-xl transition-all ${
                currentScreen === item.screen
                  ? 'text-[#4A2270] font-semibold bg-[#E9DFF5]'
                  : 'text-[#6E6A75] hover:bg-[#F7F5FA]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('conoce');
              setMobileMenuOpen(false);
            }}
            className="px-4 py-2.5 text-sm text-left rounded-xl text-[#4A2270] hover:bg-[#F7F5FA] font-medium"
          >
            ¿Qué es PAN?
          </button>
        </nav>
      )}
    </header>
  );
};
