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
  | 'caso';

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
  tipo: 'tamizaje' | 'establecimiento' | 'diagnostico' | 'barrera' | 'fase_update';
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
  instrumento: {
    nombre: string;
    score: number;
    nivel: 'bajo' | 'medio' | 'alto' | 'baja' | 'moderada' | 'alta';
    fecha: string;
    respondidoPor: string;
    respuestas: Record<number, 'si' | 'no'>;
  };
  registros: CaseLogItem[];
}

export interface UserProfile {
  name: string;
  email: string;
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

export type CategoriaEstablecimiento = 'I-1' | 'I-2' | 'I-3' | 'I-4' | 'II-1' | 'II-2' | 'III-1' | 'III-2';
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
