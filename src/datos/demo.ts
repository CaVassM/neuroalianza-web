import { Caso, Tamizaje, Evento, Establecimiento } from '../types/dominio';
import { calcularPuntaje, clasificar } from '../dominio/tamizaje';

// ESTABLECIMIENTOS (Exactamente 8 registros curados)
export const DEMO_ESTABLECIMIENTOS: Establecimiento[] = [
  {
    codigo: '00003421',
    nombre: 'C.S. Santa Cruz',
    institucion: 'MINSA',
    clasificacion: 'Centro de Salud sin Cread',
    categoria: 'I-3',
    distrito: 'Miraflores',
    ubigeo: '150122',
    direccion: 'Calle Mariano Melgar 247, Miraflores',
    telefono: '01-000-1001',
    horario: 'Lunes a Sábado 08:00 - 18:00',
    estado: 'ACTIVO',
    lat: -12.115,
    lng: -77.038,
    cobertura: 'SIS',
    servicios: ['CRED', 'Medicina General', 'Psicología', 'Tamizaje de Desarrollo'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003422',
    nombre: 'C.S. Miraflores',
    institucion: 'MINSA',
    clasificacion: 'Centro de Salud',
    categoria: 'I-3',
    distrito: 'Miraflores',
    ubigeo: '150122',
    direccion: 'Av. Mcal. Ramón Castilla 701, Miraflores',
    telefono: '01-000-1002',
    horario: 'Lunes a Sábado 07:00 - 19:00',
    estado: 'ACTIVO',
    lat: -12.122,
    lng: -77.028,
    cobertura: 'SIS',
    servicios: ['CRED', 'Pediatría Básica', 'Psicología Infantil', 'Nutrición'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003423',
    nombre: 'Puesto de Salud Surquillo',
    institucion: 'MINSA',
    clasificacion: 'Puesto de Salud',
    categoria: 'I-2',
    distrito: 'Surquillo',
    ubigeo: '150141',
    direccion: 'Av. Angamos Este 1230, Surquillo',
    telefono: '01-000-1003',
    horario: 'Lunes a Viernes 08:00 - 14:00',
    estado: 'ACTIVO',
    lat: -12.112,
    lng: -77.018,
    cobertura: 'SIS',
    servicios: ['CRED', 'Inmunizaciones', 'Enfermería'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003424',
    nombre: 'Hospital de Emergencias José Casimiro Ulloa',
    institucion: 'MINSA',
    clasificacion: 'Hospital de Apoyo',
    categoria: 'II-2',
    distrito: 'Miraflores',
    ubigeo: '150122',
    direccion: 'Av. República de Panamá 6355, Miraflores',
    telefono: '01-000-1004',
    horario: 'Atención 24 horas',
    estado: 'ACTIVO',
    lat: -12.126,
    lng: -77.012,
    cobertura: 'SIS',
    servicios: ['Pediatría de Emergencia', 'Neurología', 'Traumatología'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003425',
    nombre: 'Hospital I Suarez Angamos EsSalud',
    institucion: 'ESSALUD',
    clasificacion: 'Hospital I',
    categoria: 'II-1',
    distrito: 'Miraflores',
    ubigeo: '150122',
    direccion: 'Av. Angamos Este 261, Miraflores',
    telefono: '01-000-1005',
    horario: 'Lunes a Sábado 07:00 - 20:00',
    estado: 'ACTIVO',
    lat: -12.118,
    lng: -77.025,
    cobertura: 'EsSalud',
    servicios: ['Pediatría Especializada', 'Psiquiatría Infantil', 'Medicina Física'],
    fuente: 'RENAES ESSALUD',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003426',
    nombre: 'Instituto Nacional de Salud del Niño - San Borja',
    institucion: 'MINSA',
    clasificacion: 'Instituto Especializado',
    categoria: 'III-2',
    distrito: 'San Borja',
    ubigeo: '150130',
    direccion: 'Av. Javier Prado Este 3101, San Borja',
    telefono: '01-000-1006',
    horario: 'Lunes a Sábado 07:00 - 18:00',
    estado: 'ACTIVO',
    lat: -12.086,
    lng: -77.001,
    cobertura: 'SIS',
    servicios: ['Neuropediatría Advanced', 'Psiquiatría Infantil', 'Unidad de Desarrollo Neuroconductual', 'Terapias Multisensoriales'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003427',
    nombre: 'Hospital Víctor Larco Herrera',
    institucion: 'MINSA',
    clasificacion: 'Hospital Especializado',
    categoria: 'III-1',
    distrito: 'Magdalena del Mar',
    ubigeo: '150120',
    direccion: 'Av. del Ejército 600, Magdalena del Mar',
    telefono: '01-000-1007',
    horario: 'Lunes a Viernes 08:00 - 16:00',
    estado: 'ACTIVO',
    lat: -12.098,
    lng: -77.067,
    cobertura: 'SIS',
    servicios: ['Psiquiatría Infantil y del Adolescente', 'Psicología Clínica', 'Módulo TEA'],
    fuente: 'RENAES MINSA',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
  {
    codigo: '00003428',
    nombre: 'Clínica Delgado - Auna',
    institucion: 'PRIVADO',
    clasificacion: 'Clínica Especializada',
    categoria: 'III-1',
    distrito: 'Miraflores',
    ubigeo: '150122',
    direccion: 'Av. Angamos Oeste 401, Miraflores',
    telefono: '01-000-1008',
    horario: 'Atención 24 horas',
    estado: 'ACTIVO',
    lat: -12.114,
    lng: -77.032,
    cobertura: 'Privado',
    servicios: ['Pediatría Integral', 'Neuropediatría Privada', 'Evaluación Multidisciplinaria'],
    fuente: 'RENAES PRIVADO',
    fechaVerificacion: '2026-01-15',
    esDemostracion: true,
  },
];

// RESPUETAS CASO 1: Exactamente 5 puntos en M-CHAT-R/F
// Invertidos [2, 5, 12] = 'no' (0 pts)
// Normales = 'si' excepto 1, 3, 4, 6, 7 = 'no' (5 pts)
const RESPUESTAS_CASO_1: Record<number, 'si' | 'no'> = {
  1: 'no',  // +1
  2: 'no',  // invertido => 0
  3: 'no',  // +1
  4: 'no',  // +1
  5: 'no',  // invertido => 0
  6: 'no',  // +1
  7: 'no',  // +1
  8: 'si',  // 0
  9: 'si',  // 0
  10: 'si', // 0
  11: 'si', // 0
  12: 'no', // invertido => 0
  13: 'si', // 0
  14: 'si', // 0
  15: 'si', // 0
  16: 'si', // 0
  17: 'si', // 0
  18: 'si', // 0
  19: 'si', // 0
  20: 'si', // 0
};

const PUNTAJE_CASO_1 = calcularPuntaje(RESPUESTAS_CASO_1); // Exactamente 5

export const DEMO_CASO_1: { caso: Caso; tamizaje: Tamizaje; eventos: Evento[] } = {
  caso: {
    codigo: 'NA-7K3M9',
    apodo: 'L.',
    avatarId: 'avatar1',
    nacimientoMes: 12,
    nacimientoAnio: 2024,
    distrito: 'Miraflores',
    ubigeo: '150122',
    seguro: 'SIS',
    condicion: 'autismo',
    faseActual: 4,
    // Códigos IPRESS reales del padrón, para que el caso de demostración
    // encuentre su establecimiento en el mapa: 00006200 es el Centro de Salud
    // Santa Cruz de Miraflores.
    establecimientoId: '00006200',
    creadoEn: '2026-08-10T10:00:00.000Z',
    actualizadoEn: '2026-08-14T15:30:00.000Z',
  },
  tamizaje: {
    id: 'TAM-7K3M9-01',
    casoCodigo: 'NA-7K3M9',
    instrumentoId: 'mchat-rf-pe',
    respuestas: RESPUESTAS_CASO_1,
    puntaje: PUNTAJE_CASO_1,
    nivel: clasificar(PUNTAJE_CASO_1),
    origen: 'familia',
    estado: 'autoaplicado',
    edadMesesAlAplicar: 20,
    fecha: '2026-08-11T11:00:00.000Z',
  },
  eventos: [
    {
      id: 'EVT-7K3M9-01',
      casoCodigo: 'NA-7K3M9',
      fase: 1,
      tipo: 'registro',
      descripcion: 'Registro de caso completado por la familia',
      origen: 'sistema',
      establecimiento: null,
      observaciones: null,
      fecha: '2026-08-10T10:00:00.000Z',
    },
    {
      id: 'EVT-7K3M9-02',
      casoCodigo: 'NA-7K3M9',
      fase: 2,
      tipo: 'tamizaje',
      descripcion: 'Cuestionario de señales tempranas completado (5/20 - Moderada)',
      origen: 'familia',
      establecimiento: null,
      observaciones: 'Puntaje de riesgo moderado. Se sugiere evaluación en 1er nivel.',
      fecha: '2026-08-11T11:00:00.000Z',
    },
    {
      id: 'EVT-7K3M9-03',
      casoCodigo: 'NA-7K3M9',
      fase: 3,
      tipo: 'establecimiento',
      descripcion: 'Selección de establecimiento de salud de referencia (C.S. Santa Cruz)',
      origen: 'familia',
      establecimiento: 'C.S. Santa Cruz',
      observaciones: 'Elegido por proximidad y cobertura SIS.',
      fecha: '2026-08-12T14:20:00.000Z',
    },
    {
      id: 'EVT-7K3M9-04',
      casoCodigo: 'NA-7K3M9',
      fase: 4,
      tipo: 'atencion',
      descripcion: 'Evaluación inicial y derivación registrada por médico cirujano',
      origen: 'profesional',
      establecimiento: 'C.S. Santa Cruz',
      observaciones: 'Evaluación CRED completada. Se emite hoja de referencia a Neuropediatría.',
      fecha: '2026-08-14T09:15:00.000Z',
    },
  ],
};

export const DEMO_CASO_2: { caso: Caso; tamizaje: null; eventos: Evento[] } = {
  caso: {
    codigo: 'NA-4P2XB',
    apodo: null,
    avatarId: 'avatar2',
    nacimientoMes: 6,
    nacimientoAnio: 2023, // 38 meses -> fuera de rango (16-30)
    distrito: 'San Juan de Lurigancho',
    ubigeo: '150132',
    seguro: 'Ninguno',
    condicion: 'autismo',
    faseActual: 1,
    establecimientoId: null,
    creadoEn: '2026-08-12T08:00:00.000Z',
    actualizadoEn: '2026-08-12T08:00:00.000Z',
  },
  tamizaje: null,
  eventos: [
    {
      id: 'EVT-4P2XB-01',
      casoCodigo: 'NA-4P2XB',
      fase: 1,
      tipo: 'registro',
      descripcion: 'Registro de caso completado por la familia',
      origen: 'sistema',
      establecimiento: null,
      observaciones: 'Niño/a de 38 meses. Requiere derivación directa a CRED.',
      fecha: '2026-08-12T08:00:00.000Z',
    },
  ],
};

export const DEMO_CASO_3: { caso: Caso; tamizaje: null; eventos: Evento[] } = {
  caso: {
    codigo: 'NA-9Q6RT',
    apodo: 'M.',
    avatarId: 'avatar3',
    nacimientoMes: 6,
    nacimientoAnio: 2024, // 26 meses
    distrito: 'Santiago de Surco',
    ubigeo: '150140',
    seguro: 'EsSalud',
    condicion: 'autismo',
    faseActual: 5,
    establecimientoId: '00005993', // Centro de Salud Santiago de Surco
    creadoEn: '2026-08-01T09:00:00.000Z',
    actualizadoEn: '2026-08-13T16:00:00.000Z',
  },
  tamizaje: null,
  eventos: [
    {
      id: 'EVT-9Q6RT-01',
      casoCodigo: 'NA-9Q6RT',
      fase: 1,
      tipo: 'registro',
      descripcion: 'Registro de caso completado por la familia',
      origen: 'sistema',
      establecimiento: null,
      observaciones: null,
      fecha: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'EVT-9Q6RT-02',
      casoCodigo: 'NA-9Q6RT',
      fase: 5,
      tipo: 'diagnostico',
      descripcion: 'Diagnóstico médico formal confirmado por Neuropediatra (Entrada B)',
      origen: 'profesional',
      establecimiento: 'Hospital I Suarez Angamos EsSalud',
      observaciones: 'Diagnóstico CIE-10 F84.0 registrado. Inicia plan de apoyo.',
      fecha: '2026-08-13T16:00:00.000Z',
    },
  ],
};

export const CASOS_DEMO_MAP: Record<string, { caso: Caso; tamizaje: Tamizaje | null; eventos: Evento[] }> = {
  'NA-7K3M9': DEMO_CASO_1,
  'NA-4P2XB': DEMO_CASO_2,
  'NA-9Q6RT': DEMO_CASO_3,
};
