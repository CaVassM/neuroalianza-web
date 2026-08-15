export interface CorpusDocument {
  id: string;
  title: string;
  institution: string;
  description: string;
  legalCode?: string;
  url: string;
  badge: 'MINSA' | 'CONADIS' | 'MINEDU' | 'DEFENSORÍA' | 'OMS';
}

export interface FAQItem {
  id: string;
  question: string;
  category: string;
  iconName: 'Brain' | 'HeartHandshake' | 'Stethoscope' | 'Home' | 'GraduationCap' | 'ShieldCheck';
  summary: string;
}

export interface ConsultationResult {
  pregunta: string;
  respuesta: string;
  fuentes: string[];
  isFallback?: boolean;
  notFound?: boolean;
  fueraDeAlcance?: boolean;
  condicionDetectada?: string;
}

export const GENERAL_STATIC_CARDS = [
  {
    id: 'tamizaje',
    title: '¿Qué es el tamizaje?',
    description: 'Es una exploración breve y respetuosa que observa hitos del desarrollo comunicativo y social de tu niño. No es un diagnóstico ni una etiqueta: es una herramienta preventiva para saber si se beneficiaría de una evaluación más profunda a tiempo.',
    linkTopic: 'tamizaje',
  },
  {
    id: 'cred',
    title: '¿Qué es el CRED?',
    description: 'Es el Control de Crecimiento y Desarrollo que se realiza en postas y centros de salud del Perú. El personal de salud evalúa peso, talla, vacunas y el progreso psicomotor de tu hijo en cada etapa de su primera infancia.',
    linkTopic: 'cred',
  },
  {
    id: 'derivacion',
    title: '¿Qué pasa después de una derivación?',
    description: 'Si el médico o enfermera identifica señales de alerta, te entregará una Hoja de Referencia oficial. Con ella podrás solicitar una cita especializada en un Centro de Salud Mental Comunitario (CSMC) o un hospital de mayor nivel sin perder tu cobertura.',
    linkTopic: 'referencia',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Qué es el autismo?',
    category: 'Conceptos fundamentales',
    iconName: 'Brain',
    summary: 'Comprende el espectro del neurodesarrollo y la neurodiversidad.',
  },
  {
    id: 'faq-2',
    question: '¿Qué hago los primeros días después del diagnóstico?',
    category: 'Orientación inicial',
    iconName: 'HeartHandshake',
    summary: 'Pasos esenciales, contención familiar y organización médica.',
  },
  {
    id: 'faq-3',
    question: '¿Qué terapias existen y cuáles tienen respaldo?',
    category: 'Tratamiento e intervenciones',
    iconName: 'Stethoscope',
    summary: 'Terapia de lenguaje, ocupacional, integración sensorial y abordajes validados.',
  },
  {
    id: 'faq-4',
    question: '¿Qué puedo hacer en casa?',
    category: 'Acompañamiento en el hogar',
    iconName: 'Home',
    summary: 'Estructura de rutinas, apoyos visuales y juego compartido.',
  },
  {
    id: 'faq-5',
    question: '¿Cómo funciona el colegio con un niño con TEA?',
    category: 'Educación inclusiva',
    iconName: 'GraduationCap',
    summary: 'Marco legal peruano, equipo SAANEE y adaptaciones curriculares.',
  },
  {
    id: 'faq-6',
    question: '¿Qué apoyos del Estado me corresponden?',
    category: 'Derechos y beneficios en Perú',
    iconName: 'ShieldCheck',
    summary: 'Registro CONADIS, carné de discapacidad, CSMC y cobertura integral.',
  },
];

export const LIBRARY_DOCUMENTS: CorpusDocument[] = [
  {
    id: 'gpc-minsa',
    title: 'Guía de Práctica Clínica para el Diagnóstico y Tratamiento del TEA en Niños y Adolescentes',
    institution: 'Ministerio de Salud del Perú (MINSA)',
    legalCode: 'R.M. N° 684-2019/MINSA',
    description: 'Documento normativo clínico que establece los criterios estandarizados de detección, evaluación multidisciplinaria e intervenciones basadas en evidencia en el sistema de salud peruano.',
    url: 'https://www.gob.pe/institucion/minsa/normas-legales',
    badge: 'MINSA',
  },
  {
    id: 'nts-238-minsa',
    title: 'Norma Técnica de Salud para la Atención Integral en la Etapa de Vida Niño',
    institution: 'Ministerio de Salud del Perú (MINSA)',
    legalCode: 'NTS N° 238-MINSA/DGIESP-2025',
    description: 'Lineamientos técnicos y operacionales del Control de Crecimiento y Desarrollo (CRED), tamizaje oportuno de neurodesarrollo y sistema de referencias REFCON.',
    url: 'https://www.gob.pe/institucion/minsa/normas-legales',
    badge: 'MINSA',
  },
  {
    id: 'ley-29973',
    title: 'Ley General de la Persona con Discapacidad y su Reglamento',
    institution: 'Consejo Nacional para la Integración de la Persona con Discapacidad (CONADIS)',
    legalCode: 'Ley N° 29973 · D.S. N° 002-2014-MIMP',
    description: 'Garantiza el derecho a la salud, habilitación, rehabilitación, educación inclusiva, ajustes razonables y protección social sin discriminación en todo el territorio nacional.',
    url: 'https://www.gob.pe/conadis',
    badge: 'CONADIS',
  },
  {
    id: 'minedu-inclusiva',
    title: 'Lineamientos para la Atención Educativa de Estudiantes con Discapacidad y TEA',
    institution: 'Ministerio de Educación del Perú (MINEDU)',
    legalCode: 'R.M. N° 083-2019-MINEDU / D.S. N° 007-2021-MINEDU',
    description: 'Normativa sobre matrícula inclusiva, adecuaciones curriculares individuales y acompañamiento psicopedagógico a través de los Servicios de Apoyo y Asesoramiento para la Atención de las Necesidades Educativas Especiales (SAANEE).',
    url: 'https://www.gob.pe/minedu',
    badge: 'MINEDU',
  },
  {
    id: 'defensoria-tea',
    title: 'Informe Defensorial N° 174: El derecho a la salud mental y atención integral de personas con TEA en el Perú',
    institution: 'Defensoría del Pueblo del Perú',
    legalCode: 'Serie Informes Defensoriales N° 174',
    description: 'Diagnóstico nacional sobre la accesibilidad a diagnósticos tempranos, terapias continuas y fortalecimiento de los Centros de Salud Mental Comunitarios.',
    url: 'https://www.defensoria.gob.pe',
    badge: 'DEFENSORÍA',
  },
  {
    id: 'oms-desarrollo',
    title: 'Directrices sobre intervenciones para el desarrollo infantil y condiciones del neurodesarrollo',
    institution: 'Organización Mundial de la Salud (OMS)',
    legalCode: 'WHO Guidelines on Child Development',
    description: 'Recomendaciones globales de salud pública para el apoyo centrado en la familia, habilidades de comunicación e intervención mediada por cuidadores.',
    url: 'https://www.who.int',
    badge: 'OMS',
  },
];

export const PRELOADED_RESPONSES: Record<string, ConsultationResult> = {
  'faq-1': {
    pregunta: '¿Qué es el autismo?',
    respuesta: `El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que acompaña a la persona a lo largo de toda su vida. Se manifiesta principalmente en dos áreas: la comunicación e interacción social, y la presencia de patrones repetitivos de conducta, intereses específicos o particularidades en el procesamiento sensorial.

Se le denomina "espectro" porque no hay dos personas con autismo iguales. Cada niño tiene un perfil único con fortalezas, talentos y áreas donde requiere apoyos específicos. En el Perú, el enfoque clínico y social promueve la neurodiversidad: comprender que el cerebro procesa la información de forma distinta y que, con los apoyos oportunos, cada niño puede desarrollarse plenamente y participar activamente en su familia y comunidad.`,
    fuentes: [
      'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
      'Directrices de la Organización Mundial de la Salud (OMS)',
    ],
  },

  'faq-2': {
    pregunta: '¿Qué hago los primeros días después del diagnóstico?',
    respuesta: `Recibir el diagnóstico es un momento de gran impacto emocional para toda la familia. Los primeros días es normal sentir incertidumbre, temor o tristeza. Te recomendamos seguir estos pasos iniciales:

1. **Permítete asimilar la noticia sin juzgarte**: Hablen en familia con calma. Tu hijo sigue siendo exactamente el mismo niño cariñoso y único de siempre; el diagnóstico es una herramienta que les abre la puerta a los apoyos que necesita.
2. **Organiza una carpeta médica**: Guarda el informe del neuropediatra o psiquiatra, el carné CRED, las evaluaciones psicológicas y recetas.
3. **Solicita el Certificado de Discapacidad**: Pídelo al médico tratante en un establecimiento de salud acreditado (hospital del MINSA, EsSalud o FF.AA.) para tramitar tu carné de CONADIS.
4. **Prioriza las terapias iniciales indicadas**: Generalmente Terapia Ocupacional (con enfoque de integración sensorial) y Terapia de Lenguaje y Comunicación.
5. **Busca redes de familias**: Conversar con otros padres que ya transitaron este camino brinda tranquilidad y orientación práctica.`,
    fuentes: [
      'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
      'Guía de Orientación a Familias - Defensoría del Pueblo',
      'Ley N° 29973 - CONADIS',
    ],
  },

  'faq-3': {
    pregunta: '¿Qué terapias existen y cuáles tienen respaldo?',
    respuesta: `Las intervenciones con mayor respaldo científico y recomendadas por el Ministerio de Salud del Perú y la OMS son aquellas individualizadas, tempranas y centradas en el juego y la vida cotidiana:

- **Terapia Ocupacional (con Integración Sensorial)**: Ayuda al niño a procesar estímulos del entorno (ruidos, texturas, movimiento), mejorar la coordinación motora fina y desarrollar autonomía en el vestido, alimentación e higiene.
- **Terapia de Lenguaje y Comunicación**: Fomenta no solo el habla verbal, sino la intención comunicativa, el contacto visual y, si es necesario, Sistemas Aumentativos y Alternativos de Comunicación (SAAC) como pictogramas.
- **Intervenciones Conductuales y de Desarrollo Naturalistas (tipo ESDM, Denver, ABA naturalizado)**: Enseñan habilidades sociales, de imitación y juego compartido en entornos lúdicos y afectivos.
- **Terapia Psicológica y Acompañamiento a Padres**: Brinda pautas de crianza positiva, manejo de desregulaciones emocionales y reducción del estrés familiar.

*Nota de seguridad*: Desconfía de terapias milagrosas o tratamientos biológicos invasivos no autorizados (como dietas extremas no supervisadas, quelaciones o cámaras hiperbáricas sin indicación médica formal).`,
    fuentes: [
      'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
      'NTS N° 238-MINSA/DGIESP-2025',
      'Directrices de Intervención Temprana - OMS',
    ],
  },

  'faq-4': {
    pregunta: '¿Qué puedo hacer en casa?',
    respuesta: `El hogar es el entorno más rico para potenciar el desarrollo de tu hijo. Las estrategias cotidianas más efectivas incluyen:

1. **Estructura y anticipación visual**: Utiliza horarios visuales con fotos o pictogramas sencillos que muestren las actividades del día (despertar, desayunar, jugar, bañarse, dormir). Saber qué pasará reduce notablemente la ansiedad.
2. **Comunicación clara y directa**: Usa frases cortas, a su altura visual y con apoyo de gestos o señalización.
3. **Tiempo de juego compartido en el suelo (Floor Time)**: Sigue su interés. Si juega con un carrito o bloques, únete a su dinámica sin imponer reglas rígidas, fomentando turnos de juego e interacción cara a cara.
4. **Cuidado con la sobrecarga sensorial**: Si el niño se desregula ante ruidos fuertes o luces intensas, crea un "rincón de calma" en su habitación con cojines, juguetes suaves y baja iluminación.
5. **Festeja cada pequeño logro**: El refuerzo positivo con palabras de cariño y sonrisas fortalece su autoestima y motivación para comunicarse.`,
    fuentes: [
      'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
      'Directrices de la OMS sobre apoyo en el hogar',
    ],
  },

  'faq-5': {
    pregunta: '¿Cómo funciona el colegio con un niño con TEA?',
    respuesta: `En el Perú, la Ley General de Educación y el D.S. N° 007-2021-MINEDU garantizan el derecho de todo niño con TEA a una educación inclusiva de calidad en escuelas públicas y privadas:

- **Reserva de vacantes**: Todas las instituciones educativas regulares deben reservar al menos dos vacantes por aula para estudiantes con necesidades educativas especiales asociadas a discapacidad.
- **Acompañamiento del SAANEE**: El Servicio de Apoyo y Asesoramiento para la Atención de las Necesidades Educativas Especiales asesora a los docentes de aula regular en estrategias inclusivas y sensibilización del grupo.
- **Plan de Orientación Individual (POI) y Adaptaciones Curriculares**: La escuela debe adaptar los tiempos, materiales y formas de evaluación según el perfil del estudiante, sin exigir un nivel idéntico al de sus compañeros si requiere adaptaciones.
- **Acompañante de aula (Sombra)**: Si el equipo interdisciplinario lo recomienda, la familia puede coordinar la presencia de un facilitador o acompañante sin que el colegio pueda condicionar la matrícula o cobrar montos adicionales indebidos.`,
    fuentes: [
      'Lineamientos de Educación Inclusiva MINEDU (R.M. N° 083-2019-MINEDU)',
      'D.S. N° 007-2021-MINEDU',
      'Ley General de la Persona con Discapacidad N° 29973',
    ],
  },

  'faq-6': {
    pregunta: '¿Qué apoyos del Estado me corresponden?',
    respuesta: `Las familias de personas con diagnóstico de TEA en el Perú tienen acceso a diversos derechos y beneficios respaldados por la Ley N° 29973 y el Ministerio de Salud:

1. **Carné y Registro en CONADIS**: Con el Certificado de Discapacidad otorgado por un médico especialista acreditado, puedes registrar a tu hijo en CONADIS de manera gratuita, obteniendo el carné de discapacidad.
2. **Atención médica y terapias sin costo en SIS**: Las personas afiliadas al SIS tienen cobertura total para consultas en salud mental, psiquiatría infantil y sesiones de terapia en la Red de Centros de Salud Mental Comunitarios (CSMC) a nivel nacional.
3. **Pase libre en transporte urbano**: Si el carné acredita discapacidad severa (color amarillo), tu hijo y un acompañante tienen derecho a viajar gratis en el transporte público urbano e interurbano (incluyendo el Metro de Lima y corredores).
4. **Permiso laboral especial para padres**: Los trabajadores del sector público y privado con hijos menores con discapacidad que requieran asistencia médica continua tienen derecho a solicitar hasta 56 horas anuales con goce de haber (Ley N° 30119).
5. **Deducción adicional del Impuesto a la Renta**: Los trabajadores de 4ta y 5ta categoría pueden deducir gastos médicos y de rehabilitación adicionales por dependientes con discapacidad registrada.`,
    fuentes: [
      'Ley General de la Persona con Discapacidad N° 29973',
      'Ley N° 30119 (Licencia laboral por hijo con discapacidad)',
      'NTS N° 238-MINSA/DGIESP-2025',
    ],
  },
};

/**
 * Intelligent local matcher for free-form queries when backend is offline or slow
 */
export function findLocalCorpusAnswer(query: string, childName: string = 'tu hijo/a'): ConsultationResult {
  const q = query.toLowerCase().trim();

  // Check out of scope conditions (TDAH, Trastornos específicos del lenguaje)
  if (q.includes('tdah') || q.includes('adhd') || q.includes('hiperactiv') || q.includes('deficit de atencion') || q.includes('déficit de atención')) {
    return {
      pregunta: query,
      respuesta: 'Esa pregunta parece ser sobre TDAH. Por ahora PAN tiene contenido de autismo. Estamos trabajando en las demás condiciones del neurodesarrollo.',
      fuentes: [],
      fueraDeAlcance: true,
      condicionDetectada: 'TDAH',
    };
  }
  if (q.includes('trastorno del lenguaje') || q.includes('trastornos del lenguaje') || q.includes('tartamude') || q.includes('dislalia') || q.includes('disfasia')) {
    return {
      pregunta: query,
      respuesta: 'Esa pregunta parece ser sobre Trastornos del lenguaje. Por ahora PAN tiene contenido de autismo. Estamos trabajando en las demás condiciones del neurodesarrollo.',
      fuentes: [],
      fueraDeAlcance: true,
      condicionDetectada: 'Trastornos del lenguaje',
    };
  }

  // Check direct FAQ exact or close queries
  if (q.includes('qué es el autismo') || q.includes('que es el autismo') || q.includes('definicion') || q.includes('significa tea')) {
    return PRELOADED_RESPONSES['faq-1'];
  }
  if (q.includes('primeros días') || q.includes('primeros dias') || q.includes('después del diagnóstico') || q.includes('recibi el diagnostico') || q.includes('que hago ahora')) {
    return PRELOADED_RESPONSES['faq-2'];
  }
  if (q.includes('terapia') || q.includes('tratamiento') || q.includes('ocupacional') || q.includes('lenguaje') || q.includes('estimulacion') || q.includes('aba')) {
    return PRELOADED_RESPONSES['faq-3'];
  }
  if (q.includes('casa') || q.includes('hogar') || q.includes('rutina') || q.includes('pictograma') || q.includes('juego') || q.includes('berrinche') || q.includes('desregulac')) {
    return PRELOADED_RESPONSES['faq-4'];
  }
  if (q.includes('colegio') || q.includes('escuela') || q.includes('matricula') || q.includes('saanee') || q.includes('inclusion') || q.includes('profesor') || q.includes('nido')) {
    return PRELOADED_RESPONSES['faq-5'];
  }
  if (q.includes('estado') || q.includes('conadis') || q.includes('derecho') || q.includes('beneficio') || q.includes('carnet') || q.includes('ley') || q.includes('permiso laboral') || q.includes('transporte')) {
    return PRELOADED_RESPONSES['faq-6'];
  }

  // Sensory queries
  if (q.includes('ruido') || q.includes('textura') || q.includes('luz') || q.includes('sensorial') || q.includes('orejeras') || q.includes('comida') || q.includes('selectiv')) {
    return {
      pregunta: query,
      respuesta: `Las particularidades en el procesamiento sensorial son muy frecuentes en el autismo. ${childName} puede presentar hipersensibilidad (molestia intensa ante ruidos fuertes como licuadoras o cohetes, etiquetas de ropa o luces brillantes) o hiposensibilidad (búsqueda continua de movimiento, saltos o presión corporal).

En el marco de la Guía Clínica de MINSA, se recomienda la evaluación por un Terapeuta Ocupacional certificado en Integración Sensorial para diseñar una "dieta sensorial": adaptaciones ambientales respetuosas (como audífonos de cancelación o ropa cómoda de algodón) y actividades que ayuden a su sistema nervioso a autorregularse.`,
      fuentes: [
        'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
        'Directrices de Terapia Ocupacional en Neurodesarrollo - OMS',
      ],
      isFallback: true,
    };
  }

  // Communication & speech queries
  if (q.includes('hablar') || q.includes('no habla') || q.includes('palabras') || q.includes('senalar') || q.includes('comunicacion') || q.includes('gestos')) {
    return {
      pregunta: query,
      respuesta: `La comunicación va mucho más allá del lenguaje oral. Para fomentar la comunicación en ${childName}, las guías de salud recomiendan:

1. Fomentar la comunicación funcional mediante señas, gestos o Sistemas Aumentativos y Alternativos de Comunicación (SAAC) basados en imágenes o pictogramas.
2. Ponerse a su altura visual al interactuar y dar tiempo suficiente para que procese y responda.
3. Evitar presionar para que repita palabras mecánicamente; en su lugar, narra lo que hace en el juego de manera natural y lúdica.
4. Acudir a Terapia de Lenguaje especializada en neurodesarrollo en tu centro de salud o CSMC.`,
      fuentes: [
        'Guía de Práctica Clínica MINSA (R.M. N° 684-2019/MINSA)',
        'NTS N° 238-MINSA/DGIESP-2025',
      ],
      isFallback: true,
    };
  }

  // If query is totally outside corpus scope
  return {
    pregunta: query,
    respuesta: 'No tengo esa información en mis fuentes.',
    fuentes: [],
    notFound: true,
  };
}
