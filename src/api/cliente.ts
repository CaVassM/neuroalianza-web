/**
 * Cliente HTTP del servicio de orientación para familias.
 *
 * TODA llamada al backend pasa por aquí. La URL base sale de la variable de
 * entorno VITE_API_URL y nunca se escribe a mano en un componente: así cambiar
 * de entorno (local, preview de Vercel, producción) es cambiar una variable.
 */

export type Condicion = 'autismo' | 'comun';
export type Ambito = 'peru' | 'internacional';

export interface TurnoHistorial {
  rol: 'usuario' | 'asistente';
  texto: string;
}

export interface ConsultaRequest {
  pregunta: string;
  /** Sale del caso, nunca de texto escrito por la familia. */
  condicion: string;
  /** Sale del caso, nunca de texto escrito por la familia. */
  edad_meses: number;
  idioma: string;
  historial: TurnoHistorial[];
}

export interface Fuente {
  titulo: string;
  institucion: string;
  ambito: Ambito;
  url: string | null;
  pagina: number | null;
}

export interface ConsultaResponse {
  respuesta: string;
  fuentes: Fuente[];
  /** true no es un error: el corpus todavía no cubre esa condición. */
  fuera_de_alcance: boolean;
  condicion_detectada: string | null;
}

export interface SaludResponse {
  ok: boolean;
  modelo_embed: string;
  modelo_rerank: string;
  documentos: number;
  fragmentos: number;
}

const URL_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

/** Se agota la espera antes que la paciencia de la familia. */
const TIEMPO_LIMITE_MS = 20000;

export class ApiNoConfigurada extends Error {
  constructor() {
    super('VITE_API_URL no está definida');
    this.name = 'ApiNoConfigurada';
  }
}

export const apiEstaConfigurada = (): boolean => URL_BASE.length > 0;

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  if (!apiEstaConfigurada()) throw new ApiNoConfigurada();

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);

  try {
    const respuesta = await fetch(`${URL_BASE}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...(opciones.headers ?? {}) },
      signal: control.signal,
    });

    if (!respuesta.ok) {
      throw new Error(`El servicio respondió ${respuesta.status}`);
    }
    return (await respuesta.json()) as T;
  } finally {
    clearTimeout(temporizador);
  }
}

export function consultar(peticion: ConsultaRequest): Promise<ConsultaResponse> {
  return pedir<ConsultaResponse>('/consultar', {
    method: 'POST',
    body: JSON.stringify(peticion),
  });
}

export function salud(): Promise<SaludResponse> {
  return pedir<SaludResponse>('/salud');
}

/* ------------------------------------------------------------------ *
 * Seguimiento de la ruta
 *
 * El progreso vive en el servidor, no en el navegador: el recordatorio
 * llega al celular y el registro se hizo probablemente en otra pantalla.
 * ------------------------------------------------------------------ */

export type EstadoRespuesta = 'bien' | 'regular' | 'mal';

export interface RespuestaSeguimiento {
  estado: EstadoRespuesta;
  comentario: string | null;
  fase: number | null;
  creado_en: string;
}

export interface Seguimiento {
  id: string;
  nombre_nino: string | null;
  condicion: string;
  edad_meses: number | null;
  distrito: string | null;
  seguro: string | null;
  fase: number;
  nivel_tamizaje: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  ultimo_aviso_en: string | null;
  telefono_parcial: string;
  respuestas: RespuestaSeguimiento[];
}

export interface SeguimientoCreado extends Seguimiento {
  enlace: string;
}

export interface ResultadoEnvio {
  enviado: boolean;
  /**
   * true cuando el motor de envíos está apagado (ENVIO_ACTIVO=false). No es un
   * fallo: el caso y su enlace existen igual, y la interfaz debe entregarlo en
   * pantalla diciendo por qué no llegó el mensaje.
   */
  simulado?: boolean;
  /** Por qué no se envió. Suele ser una protección anti-baneo, no un error. */
  motivo: string;
  enlace: string;
}

export interface EstadoLimites {
  enviados_ultimas_24h: number;
  tope_diario: number;
  total_historico: number;
  cooldown_horas: number;
  horario_envio: string;
  en_horario: boolean;
}

export interface SeguimientoConMensaje extends Seguimiento {
  /** Texto de acompañamiento que corresponde al estado enviado. */
  mensaje: string;
}

export interface CrearSeguimientoRequest {
  telefono: string;
  nombre_nino?: string | null;
  condicion?: string;
  edad_meses?: number | null;
  distrito?: string | null;
  seguro?: string | null;
  fase?: number;
  nivel_tamizaje?: string | null;
}

export function crearSeguimiento(
  datos: CrearSeguimientoRequest
): Promise<SeguimientoCreado> {
  return pedir<SeguimientoCreado>('/seguimiento', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function verSeguimiento(id: string): Promise<Seguimiento> {
  return pedir<Seguimiento>(`/seguimiento/${encodeURIComponent(id)}`);
}

export function guardarAvance(
  id: string,
  cambios: Partial<Pick<Seguimiento, 'fase' | 'distrito' | 'seguro' | 'nombre_nino' | 'edad_meses' | 'nivel_tamizaje' | 'activo'>>
): Promise<Seguimiento> {
  return pedir<Seguimiento>(`/seguimiento/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });
}

export function responderSeguimiento(
  id: string,
  estado: EstadoRespuesta,
  comentario?: string
): Promise<SeguimientoConMensaje> {
  return pedir<SeguimientoConMensaje>(
    `/seguimiento/${encodeURIComponent(id)}/respuesta`,
    { method: 'POST', body: JSON.stringify({ estado, comentario: comentario ?? null }) }
  );
}

/**
 * Manda el enlace de seguimiento por WhatsApp.
 *
 * Devuelve 200 aunque no se envíe: las protecciones anti-baneo frenan a
 * propósito, y el motivo hay que mostrárselo a la familia.
 */
export function enviarEnlacePorWhatsApp(id: string): Promise<ResultadoEnvio> {
  return pedir<ResultadoEnvio>(
    `/seguimiento/${encodeURIComponent(id)}/enviar-enlace`,
    { method: 'POST' }
  );
}

export function estadoLimites(): Promise<EstadoLimites> {
  return pedir<EstadoLimites>('/seguimiento/limites/estado');
}

/* ------------------------------------------------------------------ *
 * Inventario del corpus
 * ------------------------------------------------------------------ */

export interface DocumentoCorpus {
  doc_id: string;
  titulo: string;
  institucion: string;
  ambito: Ambito;
  idioma: string;
  condicion: string;
  url: string | null;
  fecha_verificacion: string | null;
  edad_min_meses: number | null;
  edad_max_meses: number | null;
  /** Cuántos fragmentos aporta este documento al índice. */
  fragmentos: number;
}

export interface InventarioCorpus {
  total: number;
  fragmentos: number;
  documentos: DocumentoCorpus[];
}

/** Los documentos que de verdad respaldan las respuestas del asistente. */
export function listarDocumentos(): Promise<InventarioCorpus> {
  return pedir<InventarioCorpus>('/documentos');
}

export function validarNumero(
  numero: string
): Promise<{ valido: boolean; normalizado: string | null }> {
  return pedir('/whatsapp/validar-numero', {
    method: 'POST',
    body: JSON.stringify({ numero }),
  });
}
