export type ScreenType = 
  | 'login'
  | 'signup'
  | 'register-step-1'
  | 'register-step-2'
  | 'register-step-3'
  | 'dashboard'
  | 'conoce'
  | 'mi-ruta'
  | 'familias'
  | 'evaluaciones'
  | 'cuestionario'
  | 'caso'
  | 'seguimiento';

export type InsuranceType = 'sis' | 'essalud' | 'eps' | 'none';

export type AvatarId = 'cat' | 'fox' | 'bear' | 'owl' | 'bunny' | 'turtle';

export interface ChildData {
  nickname: string;
  birthDay?: string;
  birthMonth: string;
  birthYear: string;
  avatarId: AvatarId;
}

export interface LocationData {
  department: string;
  province: string;
  district: string;
}

export type CasePhase = 1 | 2 | 3 | 4 | 5 | 6;

/** Servicios de salud por los que puede pasar la ruta. Ver src/data/flujoCita.ts */
export type ServicioCita =
  | 'cred'
  | 'pediatria'
  | 'neuropediatria'
  | 'psiquiatria'
  | 'especialista';

export interface ScreeningResult {
  score: number;
  nivel: 'bajo' | 'medio' | 'alto' | 'baja' | 'moderada' | 'alta';
  fecha?: string;
  completedAt?: string;
}

export interface DiagnosisInfo {
  profesional: 'pediatra' | 'neurologo' | 'psiquiatra_infantil' | 'psicologo' | 'otro';
  profesionalOtroTexto?: string;
  mes: string;
  ano: string;
  registradoAt?: string;
}

export interface BarrierReport {
  tipo: 'sin_cupos' | 'muy_lejos' | 'costo' | 'no_atendieron';
  fecha: string;
  titulo: string;
  detalle?: string;
}

export interface CaseLogItem {
  fecha: string;
  titulo: string;
  detalle: string;
  tipo: 'tamizaje' | 'establecimiento' | 'diagnostico' | 'barrera' | 'cita' | 'fase_update';
  origen?: 'familia' | 'profesional';
  establecimientoNombre?: string;
  faseNum?: CasePhase;
}

export interface CaseData {
  codigo: string;
  childAgeMonths: number;
  district: string;
  insurance: InsuranceType;
  fase: CasePhase;
  /**
   * null cuando el caso todavía no tiene tamizaje aplicado.
   *
   * Antes se rellenaba con un puntaje inventado —5, "riesgo moderado", con las
   * respuestas de otro caso— y un profesional abría la ficha creyendo que la
   * familia ya había respondido el M-CHAT.
   */
  instrumento: {
    nombre: string;
    score: number;
    nivel: 'bajo' | 'medio' | 'alto' | 'baja' | 'moderada' | 'alta';
    fecha: string;
    respondidoPor: string;
    respuestas: Record<number, 'si' | 'no'>;
  } | null;
  registros: CaseLogItem[];

  /**
   * Lo que la familia fue reportando y que antes moría en su propia pantalla.
   *
   * La bitácora ya listaba los eventos, pero sin estructura: una barrera se veía
   * igual que un cambio de fase, y el motivo por el que una familia dejó el
   * tratamiento —que es justo lo que un profesional necesita saber— no llegaba
   * de ninguna forma a esta vista.
   */
  establecimiento?: { codigo: string; nombre: string; distrito: string } | null;
  derivaciones?: ServicioCita[];
  barrera?: BarrierReport | null;
  tratamiento?: {
    tomando: boolean;
    motivo?: string;
    actualizadoEn: string;
  } | null;
  /** Identificador del seguimiento, para leer lo que respondió por WhatsApp. */
  seguimientoId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  /** Celular de contacto, 9 dígitos sin código de país. Se usa para avisos por WhatsApp. */
  phone?: string;
  /** Id del seguimiento en el servidor. Es la credencial del enlace: no mostrar. */
  seguimientoId?: string;
  /**
   * Si ya se le mostró la bienvenida que invita a Conócenos.
   * Va en el perfil y no en el navegador: cada cuenta nueva debe verla, aunque
   * alguien ya haya usado esta computadora antes.
   */
  bienvenidaVista?: boolean;
  /** Servicios a los que una cita derivó. Habilitan ese flujo al registrar la siguiente. */
  derivaciones?: ServicioCita[];
  /**
   * Adherencia al tratamiento indicado por el médico, en la fase 6.
   * PAN no receta: solo registra cómo va lo que ya se indicó.
   */
  tratamiento?: {
    tomando: boolean;
    /** Qué lo impidió, cuando no se está siguiendo. */
    motivo?: string;
    actualizadoEn: string;
  };
  child: ChildData;
  location: LocationData;
  insurance: InsuranceType;
  selectedEstablecimientoCodigo?: string;
  fase?: CasePhase;
  screeningResult?: ScreeningResult | null;
  screeningAnswers?: Record<number, 'si' | 'no'>;
  diagnosis?: DiagnosisInfo | null;
  barrierReport?: BarrierReport | null;
  caseCode?: string;
  registros?: CaseLogItem[];
  activeBarrierFilter?: 'sin_cupos' | 'muy_lejos' | 'costo' | 'no_atendieron' | null;
}

// II-E y III-E son las categorías "especializadas" del padrón: existen de
// verdad en RENIPRESS (institutos, clínicas monográficas) y sin ellas se caían
// 127 establecimientos de Lima.
export type CategoriaEstablecimiento =
  | 'I-1' | 'I-2' | 'I-3' | 'I-4'
  | 'II-1' | 'II-2' | 'II-E'
  | 'III-1' | 'III-2' | 'III-E';
export type InstitucionEstablecimiento = 'GOBIERNO REGIONAL' | 'MINSA' | 'ESSALUD' | 'PRIVADO';
export type CoberturaEstablecimiento = 'SIS' | 'EsSalud' | 'Privado';

export interface Establecimiento {
  codigo: string;
  nombre: string;
  institucion: InstitucionEstablecimiento;
  clasificacion: string;
  categoria: CategoriaEstablecimiento;
  distrito: string;
  ubigeo: string;
  direccion: string;
  telefono: string;
  horario: string;
  estado: 'ACTIVO' | 'INACTIVO';
  lat: number;
  lng: number;
  cobertura: CoberturaEstablecimiento;
  servicios: string[];
  /**
   * true cuando los servicios se dedujeron de la categoría y no se comprobaron
   * en ese establecimiento. RENIPRESS no registra la cartera de servicios, así
   * que la ficha tiene que advertirlo antes de que alguien viaje hasta allí.
   */
  serviciosInferidos?: boolean;
  fuente: string;
  fechaVerificacion: string;
  distanciaKm?: number;
}

export interface DefinitionItem {
  id: string;
  term: string;
  fullTitle: string;
  description: string;
  example?: string;
}

export interface InformationSource {
  title: string;
  institution: string;
  description: string;
  badge: string;
}
