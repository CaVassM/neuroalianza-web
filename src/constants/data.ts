import { DefinitionItem, InformationSource } from '../types';

export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export const PERU_DEPARTMENTS = [
  'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Áncash', 'Ica', 'Callao'
];

export const LIMA_DISTRICTS = [
  'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chorrillos', 'Comas', 'El Agustino', 
  'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima (Cercado)', 
  'Lince', 'Los Olivos', 'Lurigancho-Chosica', 'Lurín', 'Magdalena del Mar', 
  'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 
  'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 
  'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 
  'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 
  'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 
  'Villa El Salvador', 'Villa María del Triunfo'
];

export const DEFINITIONS: DefinitionItem[] = [
  {
    id: 'neurodesarrollo',
    term: 'Neurodesarrollo',
    fullTitle: 'Neurodesarrollo infantil',
    description: 'Proceso continuo de adquisición de habilidades motoras, de comunicación, de lenguaje, cognitivas y socioemocionales durante la primera infancia (0 a 5 años).',
  },
  {
    id: 'tamizaje',
    term: 'Tamizaje',
    fullTitle: 'Tamizaje del desarrollo infantil',
    description: 'Cuestionario breve y estructurado que evalúa hito a hito si un niño o niña sigue el ritmo esperado de desarrollo o si se beneficiaría de un acompañamiento preventivo.',
  },
  {
    id: 'cred',
    term: 'CRED',
    fullTitle: 'Control de Crecimiento y Desarrollo',
    description: 'Consulta periódica en centros de salud y postas del Perú donde enfermería y medicina evalúan crecimiento, vacunas e hitos del desarrollo del niño.',
  },
  {
    id: 'referencia',
    term: 'Referencia',
    fullTitle: 'Hoja de referencia médica (SIS / EsSalud)',
    description: 'Documento oficial con el que tu centro de salud o posta deriva a tu hijo/a a un centro especializado o Centro de Salud Mental Comunitario (CSMC) para atención oportuna.',
  },
  {
    id: 'atd',
    term: 'Atención Temprana',
    fullTitle: 'Atención Temprana del Desarrollo (ATD)',
    description: 'Conjunto de intervenciones lúdicas y de estimulación preventiva en los primeros años de vida para potenciar habilidades de comunicación, sociales y motoras.',
  },
  {
    id: 'mchat',
    term: 'M-CHAT-R/F',
    fullTitle: 'Cuestionario de tamizaje para niños de 16 a 30 meses',
    description: 'Herramienta estandarizada internacional de 20 preguntas sencillas para padres sobre cómo juega, interactúa, señala y se comunica su hijo o hija.',
  },
];

export const OFFICIAL_SOURCES: InformationSource[] = [
  {
    title: 'Norma Técnica de Salud NTS N° 238-MINSA/DGIESP-2025',
    institution: 'Ministerio de Salud del Perú (MINSA)',
    description: 'Norma técnica para la atención integral, detección temprana y acompañamiento preventivo del desarrollo infantil en establecimientos de salud del Perú.',
    badge: 'Nacional'
  },
  {
    title: 'Registro Nacional de IPRESS (RENIPRESS)',
    institution: 'Superintendencia Nacional de Salud (SUSALUD)',
    description: 'Directorio oficial y georreferenciado de Instituciones Prestadoras de Servicios de Salud públicas y privadas autorizadas a nivel nacional.',
    badge: 'Oficial'
  },
  {
    title: 'Directrices de la OMS sobre Desarrollo Infantil Temprano',
    institution: 'Organización Mundial de la Salud (OMS)',
    description: 'Guías clínicas para la evaluación participativa, intervención oportuna y acompañamiento respetuoso a las familias.',
    badge: 'Internacional'
  }
];

export const MCHAT_QUESTIONS = [
  { id: 1, text: "¿Si señalas algo al otro lado de la habitación, tu hijo/a lo mira? (Por ejemplo, si señalas un juguete o un animalito)" },
  { id: 2, text: "¿Alguna vez te has preguntado si tu hijo/a podría tener dificultades para oír?" },
  { id: 3, text: "¿Tu hijo/a juega a hacer 'como si' o juegos de fantasía? (Por ejemplo, fingir que bebe de una taza vacía o habla por teléfono)" },
  { id: 4, text: "¿A tu hijo/a le gusta trepar a cosas? (Como muebles, juegos del parque o escaleras)" },
  { id: 5, text: "¿Tu hijo/a hace movimientos inusuales con sus dedos cerca de sus ojos? (Por ejemplo, mover los dedos frente a su cara)" },
  { id: 6, text: "¿Tu hijo/a señala con un dedo para pedir algo o pedir ayuda? (Por ejemplo, señalar un objeto fuera de su alcance)" },
  { id: 7, text: "¿Tu hijo/a señala con un dedo para mostrarte algo que le llama la atención? (Por ejemplo, un avión o un perrito en la calle)" },
  { id: 8, text: "¿Tu hijo/a se interesa por otros niños/as? (Por ejemplo, mira a otros niños, les sonríe o se acerca a ellos)" },
  { id: 9, text: "¿Tu hijo/a te muestra cosas trayéndolas hacia ti o sosteniéndolas para que las veas? (No solo para pedir ayuda, sino para compartir)" },
  { id: 10, text: "¿Tu hijo/a responde cuando le llamas por su nombre? (Por ejemplo, te mira, habla o interrumpe lo que está haciendo)" },
];
