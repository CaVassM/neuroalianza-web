import { CasePhase, UserProfile } from '../types';

/**
 * Los dos perfiles con los que arranca la aplicación.
 *
 * Estaban mezclados: quien se registraba heredaba los datos de demostración
 * (fase 3, tamizaje ya aplicado, código de caso ajeno), así que empezaba su
 * ruta a mitad de camino y con resultados que nunca respondió.
 */

/** Código de caso legible, del estilo NA-7K3M9. */
export function generarCodigoCaso(): string {
  // Sin vocales ni caracteres ambiguos (0/O, 1/I): este código se dicta por
  // teléfono y se escribe a mano en una hoja de referencia.
  const alfabeto = '23456789BCDFGHJKLMNPQRSTVWXYZ';
  let codigo = '';
  for (let i = 0; i < 5; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `NA-${codigo}`;
}

/**
 * Perfil de una familia que acaba de crear su cuenta.
 *
 * Fase 1 y nada más: sin tamizaje, sin diagnóstico, sin historial y sin código
 * de caso. El código se genera al terminar el registro, no antes.
 */
export function crearPerfilNuevo(email: string, phone: string): UserProfile {
  return {
    name: '',
    email,
    phone,
    child: {
      nickname: '',
      birthMonth: '',
      birthYear: '',
      avatarId: 'cat',
    },
    location: {
      department: '',
      province: '',
      district: '',
    },
    insurance: 'sis',
    fase: 1 as CasePhase,
    screeningResult: null,
    diagnosis: null,
    registros: [],
    derivaciones: [],
  };
}

/**
 * Perfil de demostración. Es el que se ve al abrir la aplicación sin haberse
 * registrado, para poder enseñar la ruta avanzada sin rellenar formularios.
 */
export const PERFIL_DEMO: UserProfile = {
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
};
