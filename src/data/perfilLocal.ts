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

/**
 * Versión del perfil guardado.
 *
 * Los perfiles no viven en el servidor sino en el navegador de cada persona, así
 * que no hay forma de entrar a borrarlos uno por uno. Subir este número es la
 * única purga posible: cualquier perfil guardado con una versión anterior se
 * descarta la próxima vez que esa persona abra la aplicación, y entra limpia.
 *
 * Súbelo cuando quieras que todo el mundo empiece de cero —antes de una
 * demostración, por ejemplo— o cuando cambie la forma de UserProfile.
 *
 * 2 · 16/08/2026 · purga de las cuentas de prueba previas a la presentación.
 */
const VERSION_PERFIL = 2;

interface PerfilGuardado {
  version: number;
  perfil: UserProfile;
}

export function cargarPerfil(): UserProfile | null {
  try {
    const guardado = localStorage.getItem(CLAVE_PERFIL);
    if (!guardado) return null;

    const contenido = JSON.parse(guardado);

    // Sin versión, o con una anterior: es de una tanda de pruebas pasada.
    if (!contenido || contenido.version !== VERSION_PERFIL) {
      localStorage.removeItem(CLAVE_PERFIL);
      return null;
    }

    // Comprobación mínima de forma: un localStorage de una versión anterior
    // puede tener otra estructura y reventaría al pintar.
    const perfil = (contenido as PerfilGuardado).perfil;
    if (perfil && typeof perfil === 'object' && perfil.child) {
      return perfil as UserProfile;
    }

    localStorage.removeItem(CLAVE_PERFIL);
  } catch (e) {
    console.warn('[PAN] No se pudo leer el perfil guardado', e);
  }
  return null;
}

export function guardarPerfil(perfil: UserProfile): void {
  try {
    const contenido: PerfilGuardado = { version: VERSION_PERFIL, perfil };
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(contenido));
  } catch (e) {
    // Modo incógnito o almacenamiento lleno. No es motivo para romper la app.
    console.warn('[PAN] No se pudo guardar el perfil', e);
  }
}

export function borrarPerfil(): void {
  try {
    localStorage.removeItem(CLAVE_PERFIL);
    // El código de caso activo lo escribe la vista profesional por su cuenta.
    localStorage.removeItem('neuroalianza_active_case_code');
    localStorage.removeItem('neuroalianza_user_profile');
  } catch (e) {
    console.warn('[PAN] No se pudo borrar el perfil', e);
  }
}
