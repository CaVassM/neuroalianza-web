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
