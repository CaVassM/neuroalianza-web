export type Seguro = "SIS" | "EsSalud" | "Privado" | "Ninguno" | "NoSabe";
export type Fase = 1 | 2 | 3 | 4 | 5 | 6;
export type Origen = "familia" | "profesional" | "sistema";
export type Nivel = "baja" | "moderada" | "alta";
export type Condicion = "autismo" | "tdah" | "lenguaje" | "retraso";

export interface Caso {
  codigo: string;            // formato NA-XXXXX, alfanumérico en mayúsculas
  apodo: string | null;      // opcional, máximo 20 caracteres
  avatarId: string;
  nacimientoMes: number;     // 1-12
  nacimientoAnio: number;
  distrito: string;
  ubigeo: string;            // 6 dígitos, siempre empieza en 1501
  seguro: Seguro;
  condicion: Condicion;
  faseActual: Fase;
  establecimientoId: string | null;
  creadoEn: string;          // ISO
  actualizadoEn: string;     // ISO
}

export interface Tamizaje {
  id: string;
  casoCodigo: string;
  instrumentoId: "mchat-rf-pe";
  respuestas: Record<number, "si" | "no">;  // claves 1..20, las 20 obligatorias
  puntaje: number;           // 0-20, SIEMPRE calculado, nunca recibido
  nivel: Nivel;
  origen: Origen;
  estado: "autoaplicado" | "confirmado_profesional";
  edadMesesAlAplicar: number;
  fecha: string;             // ISO
}

export type TipoEvento =
  | "registro"
  | "tamizaje"
  | "establecimiento"
  | "atencion"
  | "referencia"
  | "diagnostico"
  | "barrera"
  | "terapia";

export interface Evento {
  id: string;
  casoCodigo: string;
  fase: Fase;
  tipo: TipoEvento;
  descripcion: string;
  origen: Origen;
  establecimiento: string | null;
  observaciones: string | null;   // máximo 200 caracteres
  fecha: string;                  // ISO
}

export interface Establecimiento {
  codigo: string;            // código IPRESS, 8 dígitos con ceros a la izquierda
  nombre: string;
  institucion: "MINSA" | "GOBIERNO REGIONAL" | "ESSALUD" | "PRIVADO";
  clasificacion: string;
  categoria: "I-1" | "I-2" | "I-3" | "I-4" | "II-1" | "II-2" | "III-1" | "III-2";
  distrito: string;
  ubigeo: string;
  direccion: string;
  telefono: string;
  horario: string;
  estado: "ACTIVO" | "INACTIVO";
  lat: number;               // entre -18 y 0
  lng: number;               // entre -81 y -68
  cobertura: Seguro;         // DERIVADO de institucion, nunca del registro
  servicios: string[];       // curado a mano
  fuente: string;
  fechaVerificacion: string; // YYYY-MM-DD
  esDemostracion: true;
}
