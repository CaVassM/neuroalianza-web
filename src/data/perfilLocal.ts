import { UserProfile } from '../types';

/**
 * Persistencia del perfil en el navegador.
 *
 * PAN no tiene backend de cuentas: no hay registro de usuarios ni sesión. Sin
 * esto, el celular que la familia escribe al registrarse se perdía en cuanto
 * recargaba la página, y el botón de WhatsApp volvía a decir "registra tu
 * celular". Guardarlo en localStorage hace que el flujo se comporte como si
 * hubiera un servidor detrás.
 *
 * Lo que SÍ vive en el servidor es el seguimiento de la ruta, y de él aquí solo
 * se guarda su identificador.
 */
const CLAVE_PERFIL = 'pan_perfil_usuario';

export function cargarPerfil(): UserProfile | null {
  try {
    const guardado = localStorage.getItem(CLAVE_PERFIL);
    if (!guardado) return null;

    const perfil = JSON.parse(guardado);
    // Comprobación mínima de forma: un localStorage de una versión anterior
    // puede tener otra estructura y reventaría al pintar.
    if (perfil && typeof perfil === 'object' && perfil.child) {
      return perfil as UserProfile;
    }
  } catch (e) {
    console.warn('[PAN] No se pudo leer el perfil guardado', e);
  }
  return null;
}

export function guardarPerfil(perfil: UserProfile): void {
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
  } catch (e) {
    // Modo incógnito o almacenamiento lleno. No es motivo para romper la app.
    console.warn('[PAN] No se pudo guardar el perfil', e);
  }
}

export function borrarPerfil(): void {
  try {
    localStorage.removeItem(CLAVE_PERFIL);
  } catch (e) {
    console.warn('[PAN] No se pudo borrar el perfil', e);
  }
}
