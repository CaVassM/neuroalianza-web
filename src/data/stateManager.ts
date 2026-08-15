import { UserProfile } from '../types';
import { CASOS_DEMO_MAP, DEMO_CASO_1, DEMO_CASO_2, DEMO_CASO_3 } from './demo';
import { calcularEdadMeses } from '../utils/age';

const STORAGE_KEY_USER = 'neuroalianza_user_profile';
const STORAGE_KEY_ACTIVE_CASE = 'neuroalianza_active_case_code';

export function getActiveCaseCode(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_CASE);
    if (saved && CASOS_DEMO_MAP[saved.toUpperCase()]) {
      return saved.toUpperCase();
    }
  } catch (e) {
    console.warn('Error reading active case code from localStorage', e);
  }
  return 'NA-7K3M9';
}

export function setActiveCaseCode(code: string): UserProfile {
  const cleanCode = (code || '').toUpperCase().trim();
  const demoEntry = CASOS_DEMO_MAP[cleanCode] || DEMO_CASO_1;
  const c = demoEntry.caso;

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CASE, c.codigo);
  } catch (e) {
    console.warn('Error saving active case code to localStorage', e);
  }

  // Build UserProfile representation from Demo Caso
  const user: UserProfile = {
    name: 'Padre / Cuidador',
    email: 'familia@neuroalianza.pe',
    child: {
      nickname: c.apodo || 'Mi Niño/a',
      birthMonth: String(c.nacimientoMes),
      birthYear: String(c.nacimientoAnio),
      avatarId: (c.avatarId as any) || 'cat',
    },
    location: {
      department: 'Lima',
      province: 'Lima',
      district: c.distrito,
    },
    insurance: (c.seguro.toLowerCase() as any) || 'sis',
    caseCode: c.codigo,
    fase: c.faseActual,
    selectedEstablecimientoCodigo: c.establecimientoId || undefined,
    screeningResult: demoEntry.tamizaje
      ? {
          score: demoEntry.tamizaje.puntaje,
          nivel: demoEntry.tamizaje.nivel,
          fecha: demoEntry.tamizaje.fecha,
        }
      : null,
    screeningAnswers: demoEntry.tamizaje?.respuestas || undefined,
    registros: demoEntry.eventos.map((e) => ({
      fecha: new Date(e.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
      titulo: e.descripcion,
      detalle: e.observaciones || (e.establecimiento ? `Establecimiento: ${e.establecimiento}` : ''),
      tipo: e.tipo === 'tamizaje' ? 'tamizaje' : e.tipo === 'establecimiento' ? 'establecimiento' : 'fase_update',
      origen: e.origen === 'profesional' ? 'profesional' : 'familia',
      establecimientoNombre: e.establecimiento || undefined,
      faseNum: e.fase,
    })),
  };

  saveUserProfile(user);
  return user;
}

export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.child) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading user profile from localStorage', e);
  }

  // Default to active demo case
  return setActiveCaseCode(getActiveCaseCode());
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving user profile to localStorage', e);
  }
}
