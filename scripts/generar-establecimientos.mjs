/**
 * Genera src/data/establecimientos.json a partir del padrón RENIPRESS.
 *
 *   node scripts/generar-establecimientos.mjs "C:/ruta/RENIPRESS_31-07-2026.csv"
 *
 * RENIPRESS (SUSALUD) es el registro oficial de todas las IPRESS del país:
 * 35 834 filas, separadas por ';' y codificadas en Windows-1252. Trae los datos
 * duros —código, categoría, coordenadas, dirección— pero no trae el seguro que
 * acepta cada establecimiento, y los campos escritos a mano (teléfono, horario)
 * llegan sucios: rótulos pegados, textos cortados a medias, celdas vacías.
 *
 * Este script recorta el padrón a lo que el prototipo puede sostener y lo deja
 * con la misma forma que ya tenía. Las reglas de limpieza están abajo, cada una
 * junto a lo que arregla. Lo que no se puede derivar del registro se deja vacío
 * antes que rellenarlo a ojo.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = resolve(AQUI, '../src/data/establecimientos.json');
const SALIDA_CENTROS = resolve(AQUI, '../src/data/centrosDistrito.json');

const FUENTE = 'RENIPRESS - SUSALUD (corte 31/07/2026)';
const FECHA_CORTE = '2026-07-31';

// ---------------------------------------------------------------------------
// Alcance
// ---------------------------------------------------------------------------

/** Lima Metropolitana y Callao: es donde la ruta del prototipo tiene sentido. */
const PROVINCIAS = new Set(['LIMA', 'CALLAO']);
const DEPARTAMENTOS = new Set(['LIMA', 'CALLAO']);

/**
 * Tipos de establecimiento que participan en la ruta de un niño.
 *
 * El padrón está dominado por consultorios sueltos y centros odontológicos
 * (6 001 y 290 solo en Lima): sitios donde nadie va a pedir un CRED ni una
 * referencia a neuropediatría. Se quedan fuera.
 */
const CLASIFICACIONES = new Set([
  'PUESTOS DE SALUD O POSTAS DE SALUD',
  'CENTROS DE SALUD O CENTROS MEDICOS',
  'CENTROS DE SALUD CON CAMAS DE INTERNAMIENTO',
  'POLICLINICOS',
  'HOSPITALES O CLINICAS DE ATENCION GENERAL',
  'HOSPITALES O CLINICAS DE ATENCION ESPECIALIZADA',
  'INSTITUTOS DE SALUD ESPECIALIZADOS',
]);

/**
 * Instituciones cuyo seguro se puede afirmar sin inventar.
 *
 * Quedan fuera las sanidades militares y policiales (atienden solo a sus
 * afiliados), el INPE y los municipales tipo Solidaridad: ninguno se cubre con
 * SIS ni con EsSalud, y ponerles una de las dos etiquetas sería falso.
 */
const INSTITUCIONES = new Set(['MINSA', 'GOBIERNO REGIONAL', 'ESSALUD', 'PRIVADO']);

const CATEGORIAS = new Set([
  'I-1', 'I-2', 'I-3', 'I-4',
  'II-1', 'II-2', 'II-E',
  'III-1', 'III-2', 'III-E',
]);

/** Recuadro de Lima Metropolitana y Callao, para descartar coordenadas rotas. */
const CAJA = { latMin: -13.1, latMax: -11.4, lngMin: -77.4, lngMax: -76.4 };

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

function leerCsv(ruta) {
  // El archivo viene en UTF-8 con BOM. Sin quitarlo, la primera columna pasa a
  // llamarse "﻿INSTITUCION" y ningún filtro sobre ella acierta.
  const texto = new TextDecoder('utf-8').decode(readFileSync(ruta)).replace(/^﻿/, '');
  const filas = [];
  let campo = '';
  let fila = [];
  let entreComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];

    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else entreComillas = false;
      } else campo += c;
      continue;
    }

    if (c === '"') entreComillas = true;
    else if (c === ';') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }

  const cabecera = filas.shift();
  return filas
    .filter((f) => f.length >= cabecera.length)
    .map((f) => Object.fromEntries(cabecera.map((k, i) => [k, (f[i] ?? '').trim()])));
}

// ---------------------------------------------------------------------------
// Limpieza de texto
// ---------------------------------------------------------------------------

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'a', 'al', 'con', 'para', 'el']);
const SIGLAS = new Set(['SAC', 'EIRL', 'SRL', 'SA', 'SAA', 'ESSALUD', 'MINSA', 'INSN', 'CLAS', 'UPCH', 'PNP', 'ESE', 'CS', 'PS', 'HN']);

/** El padrón viene en mayúsculas: "SANTA CRUZ" es un grito, no un nombre. */
function capitalizar(texto) {
  return texto
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra, i) => {
      const limpia = palabra.replace(/[^a-záéíóúñ]/gi, '');
      const original = palabra.toUpperCase();

      // Siglas, números romanos y todo lo que lleve puntos se queda como está.
      if (palabra.includes('.') || SIGLAS.has(original) || /^[IVX]+$/.test(original)) {
        return original;
      }
      if (i > 0 && MINUSCULAS.has(limpia)) return palabra;
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
}

const sinTildes = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

/**
 * Nombre legible del tipo de establecimiento.
 *
 * "HOSPITALES O CLINICAS DE ATENCION GENERAL" cubre las dos cosas a la vez; cuál
 * de ellas es depende de quién lo administra.
 */
function tipoLegible(clasificacion, institucion) {
  const privado = institucion === 'PRIVADO';
  switch (clasificacion) {
    case 'PUESTOS DE SALUD O POSTAS DE SALUD': return 'Puesto de Salud';
    case 'CENTROS DE SALUD O CENTROS MEDICOS': return privado ? 'Centro Médico' : 'Centro de Salud';
    case 'CENTROS DE SALUD CON CAMAS DE INTERNAMIENTO': return 'Centro de Salud con Internamiento';
    case 'POLICLINICOS': return 'Policlínico';
    case 'HOSPITALES O CLINICAS DE ATENCION GENERAL': return privado ? 'Clínica' : 'Hospital';
    case 'HOSPITALES O CLINICAS DE ATENCION ESPECIALIZADA': return privado ? 'Clínica Especializada' : 'Hospital Especializado';
    case 'INSTITUTOS DE SALUD ESPECIALIZADOS': return 'Instituto Especializado';
    default: return 'Establecimiento de Salud';
  }
}

const YA_LLEVA_TIPO = /^(hospital|centro|puesto|policl|cl[ií]nica|instituto|posta)/i;

/** "SANTA CRUZ" no le dice nada a nadie; "Centro de Salud Santa Cruz" sí. */
function nombreLegible(nombre, clasificacion, institucion) {
  const limpio = capitalizar(nombre.replace(/\s+/g, ' ').trim());
  if (!limpio) return tipoLegible(clasificacion, institucion);
  if (YA_LLEVA_TIPO.test(limpio)) return limpio;
  return `${tipoLegible(clasificacion, institucion)} ${limpio}`;
}

/**
 * Teléfono.
 *
 * Llegan cosas como "TEL: 044-446254", "01-7120707" y "0". Se quita el rótulo,
 * y si no quedan al menos 6 dígitos se devuelve vacío: un teléfono a medias
 * hace perder una llamada, y la ficha ya sabe qué decir cuando no hay.
 */
function limpiarTelefono(bruto) {
  const sinRotulo = bruto.replace(/^\s*(tel[eéf]*(ono)?s?|telf|anexo|cel)\s*[.:]*\s*/i, '');
  const primero = sinRotulo.split(/[\/,;]| o /i)[0].trim();
  const compacto = primero.replace(/[^\d\s()+-]/g, '').replace(/\s+/g, ' ').trim();
  const digitos = compacto.replace(/\D/g, '');
  if (digitos.length < 6 || /^0+$/.test(digitos)) return '';
  return compacto;
}

const DIAS = [
  [/lun\w*\s*(?:a|-|hasta)\s*dom\w*/i, 'Lunes a domingo'],
  [/lun\w*\s*(?:a|-|hasta)\s*s[áa]b\w*/i, 'Lunes a sábado'],
  [/lun\w*\s*(?:a|-|hasta)\s*vie\w*/i, 'Lunes a viernes'],
  [/\bl\s*-\s*s\b/i, 'Lunes a sábado'],
  [/\bl\s*-\s*v\b/i, 'Lunes a viernes'],
  [/todos\s+los\s+d/i, 'Todos los días'],
];

/**
 * Horario.
 *
 * El campo del padrón se corta a los 20 caracteres, así que llegan frases a
 * medias: "LUNES A SABADO DE 8:", "24 horas todos los d". En vez de mostrarlas
 * tal cual, se extrae solo lo que se entiende entero —los días por un lado, el
 * rango de horas por otro— y se descarta el resto. Si un registro solo permite
 * afirmar "Lunes a viernes", eso es lo que se muestra: media hora de cierre
 * inventada le hace perder el viaje a una familia.
 */
function limpiarHorario(bruto) {
  const t = bruto.replace(/\s+/g, ' ').trim();
  if (!t) return '';

  let dias = '';
  for (const [patron, etiqueta] of DIAS) {
    if (patron.test(t)) { dias = etiqueta; break; }
  }

  let horas = '';
  if (/\b24\s*(?::00)?\s*h(?:ora|r)/i.test(t)) {
    horas = '24 horas';
  } else {
    const m = t.match(/(\d{1,2})[:.](\d{2})\s*(?:am|pm)?\s*(?:-|–|a|hasta)\s*(\d{1,2})[:.](\d{2})/i);
    if (m) {
      const inicio = `${m[1].padStart(2, '0')}:${m[2]}`;
      const fin = `${m[3].padStart(2, '0')}:${m[4]}`;
      horas = inicio === '00:00' && fin === '24:00' ? '24 horas' : `${inicio} a ${fin}`;
    }
  }

  return [dias, horas].filter(Boolean).join(', ');
}

/** Abreviaturas de calle: el padrón las grita ("AV. JOSE PARDO"). */
const ABREVIATURAS = {
  'AV.': 'Av.', AV: 'Av.', 'AVDA.': 'Av.',
  'JR.': 'Jr.', JR: 'Jr.',
  'CA.': 'Ca.', 'CAL.': 'Ca.',
  'PSJE.': 'Psje.', 'PJE.': 'Psje.',
  'URB.': 'Urb.', URB: 'Urb.',
  'MZ.': 'Mz.', MZ: 'Mz.',
  'LT.': 'Lt.', LT: 'Lt.', 'LTE.': 'Lt.',
  'ESQ.': 'Esq.',
  'PROLG.': 'Prolg.', 'PROL.': 'Prol.',
  'CARR.': 'Carr.', 'KM.': 'Km.', KM: 'Km.',
  'COOP.': 'Coop.', 'COOP.VIV.': 'Coop. Viv.',
  AAHH: 'AA.HH.', 'AA.HH.': 'AA.HH.',
  'S/N': 'S/N',
};

function limpiarDireccion(bruto, distrito) {
  const capitalizada = capitalizar(bruto.replace(/\s+/g, ' ').trim())
    .split(' ')
    .map((p) => ABREVIATURAS[p.toUpperCase()] ?? p)
    .join(' ')
    .replace(/[,\-;\s]+$/, '');

  if (capitalizada.length < 5) return distrito;
  return sinTildes(capitalizada).includes(sinTildes(distrito))
    ? capitalizada
    : `${capitalizada}, ${distrito}`;
}

/** Tildes que el padrón no trae y que el resto de la aplicación sí usa. */
const DISTRITOS = {
  ANCON: 'Ancón',
  'CARMEN DE LA LEGUA-REYNOSO': 'Carmen de la Legua Reynoso',
  'JESUS MARIA': 'Jesús María',
  LURIN: 'Lurín',
  'MI PERU': 'Mi Perú',
  PACHACAMAC: 'Pachacámac',
  RIMAC: 'Rímac',
  'SAN MARTIN DE PORRES': 'San Martín de Porres',
  'SANTA MARIA DEL MAR': 'Santa María del Mar',
  'VILLA MARIA DEL TRIUNFO': 'Villa María del Triunfo',
};

const distritoLegible = (d) => DISTRITOS[d] ?? capitalizar(d);

// ---------------------------------------------------------------------------
// Campos derivados
// ---------------------------------------------------------------------------

/**
 * El seguro NO está en el padrón: se deduce de quién administra el
 * establecimiento, que es como funciona en la práctica.
 */
function coberturaDe(institucion) {
  if (institucion === 'ESSALUD') return 'EsSalud';
  if (institucion === 'PRIVADO') return 'Privado';
  return 'SIS'; // MINSA y gobiernos regionales
}

/**
 * Servicios ESTIMADOS a partir de la categoría.
 *
 * El padrón tampoco dice qué ofrece cada sitio. Lo que se pone aquí es lo que
 * su categoría debe ofrecer según la norma —CRED y vacunación en el primer
 * nivel, atención por referencia en hospitales—, no lo que se comprobó en ese
 * establecimiento. Por eso van marcados con `serviciosInferidos` y la ficha lo
 * advierte: una familia no debe viajar hasta allí confiando en esta lista.
 */
function serviciosDe(categoria) {
  if (categoria.startsWith('I-')) {
    const base = ['Control CRED', 'Vacunación', 'Consulta ambulatoria'];
    if (categoria === 'I-3' || categoria === 'I-4') base.push('Referencia a especialidad');
    return base;
  }
  const base = ['Consulta especializada', 'Atención por referencia'];
  if (categoria.startsWith('III')) base.push('Alta especialidad');
  return base;
}

/**
 * Centro de cada distrito, para situar el mapa cuando la familia no usa GPS.
 *
 * Se emite aparte en vez de calcularlo en la aplicación: importar el padrón
 * entero desde una utilidad de bajo nivel obligaba a TypeScript a inferir el
 * tipo literal de los 650 registros en cada componente que la usaba, y el
 * chequeo de tipos acababa agotando la memoria. Cincuenta filas no molestan a
 * nadie, y de paso los centros quedan a la vista en el repositorio.
 *
 * Se usa la mediana y no la media: distritos como Ate, Lurigancho o San Juan de
 * Lurigancho se estiran más de veinte kilómetros, con casi todo apiñado en la
 * parte urbana y unos pocos establecimientos sueltos en la quebrada, y la media
 * arrastraba el centro hacia el cerro.
 */
function centrosDistrito(establecimientos) {
  const mediana = (valores) => {
    const orden = [...valores].sort((a, b) => a - b);
    const medio = orden.length >> 1;
    return orden.length % 2 ? orden[medio] : (orden[medio - 1] + orden[medio]) / 2;
  };

  const porDistrito = new Map();
  for (const e of establecimientos) {
    const acumulado = porDistrito.get(e.distrito) ?? { lat: [], lng: [] };
    acumulado.lat.push(e.lat);
    acumulado.lng.push(e.lng);
    porDistrito.set(e.distrito, acumulado);
  }

  return [...porDistrito]
    .map(([distrito, { lat, lng }]) => ({
      distrito,
      clave: sinTildes(distrito),
      lat: Number(mediana(lat).toFixed(6)),
      lng: Number(mediana(lng).toFixed(6)),
      establecimientos: lat.length,
    }))
    .sort((a, b) => a.distrito.localeCompare(b.distrito, 'es'));
}

// ---------------------------------------------------------------------------

function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error('Falta la ruta del CSV de RENIPRESS.');
    process.exit(1);
  }

  const filas = leerCsv(ruta);
  const descartes = {
    fuera_de_lima: 0, inactivo: 0, clasificacion: 0, institucion: 0,
    categoria: 0, sin_coordenadas: 0, coordenadas_fuera: 0, duplicado: 0,
  };

  const vistos = new Set();
  const salida = [];

  for (const f of filas) {
    if (!DEPARTAMENTOS.has(f.DEPARTAMENTO) || !PROVINCIAS.has(f.PROVINCIA)) { descartes.fuera_de_lima++; continue; }
    if (f.ESTADO !== 'ACTIVO') { descartes.inactivo++; continue; }
    if (!CLASIFICACIONES.has(f.CLASIFICACION)) { descartes.clasificacion++; continue; }
    if (!INSTITUCIONES.has(f.INSTITUCION)) { descartes.institucion++; continue; }
    if (f.INSTITUCION === 'PRIVADO' && !f.CLASIFICACION.startsWith('HOSPITALES O CLINICAS')) {
      descartes.institucion++; continue;
    }
    if (!CATEGORIAS.has(f.CATEGORIA)) { descartes.categoria++; continue; }

    const lat = Number.parseFloat(f.NORTE);
    const lng = Number.parseFloat(f.ESTE);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { descartes.sin_coordenadas++; continue; }
    if (lat < CAJA.latMin || lat > CAJA.latMax || lng < CAJA.lngMin || lng > CAJA.lngMax) {
      descartes.coordenadas_fuera++; continue;
    }

    const codigo = f.COD_IPRESS.padStart(8, '0');
    if (vistos.has(codigo)) { descartes.duplicado++; continue; }
    vistos.add(codigo);

    const distrito = distritoLegible(f.DISTRITO);

    salida.push({
      codigo,
      nombre: nombreLegible(f.NOMBRE, f.CLASIFICACION, f.INSTITUCION),
      institucion: f.INSTITUCION,
      clasificacion: tipoLegible(f.CLASIFICACION, f.INSTITUCION),
      categoria: f.CATEGORIA,
      distrito,
      ubigeo: f.UBIGEO,
      direccion: limpiarDireccion(f.DIRECCION, distrito),
      telefono: limpiarTelefono(f.TELEFONO),
      horario: limpiarHorario(f.HORARIO),
      estado: 'ACTIVO',
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      cobertura: coberturaDe(f.INSTITUCION),
      servicios: serviciosDe(f.CATEGORIA),
      serviciosInferidos: true,
      fuente: FUENTE,
      fechaVerificacion: FECHA_CORTE,
    });
  }

  salida.sort((a, b) => a.distrito.localeCompare(b.distrito, 'es') || a.nombre.localeCompare(b.nombre, 'es'));
  writeFileSync(SALIDA, JSON.stringify(salida, null, 2) + '\n', 'utf8');

  writeFileSync(SALIDA_CENTROS, JSON.stringify(centrosDistrito(salida), null, 2) + '\n', 'utf8');

  const cuenta = (clave) => {
    const m = new Map();
    for (const e of salida) m.set(e[clave], (m.get(e[clave]) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  };

  console.log(`Filas leídas       : ${filas.length}`);
  console.log(`Establecimientos   : ${salida.length}`);
  console.log(`Distritos          : ${new Set(salida.map((e) => e.distrito)).size}`);
  console.log(`Sin teléfono       : ${salida.filter((e) => !e.telefono).length}`);
  console.log(`Sin horario        : ${salida.filter((e) => !e.horario).length}`);
  console.log('\nDescartes:');
  for (const [k, v] of Object.entries(descartes)) console.log(`  ${k.padEnd(20)} ${v}`);
  console.log('\nPor cobertura:', cuenta('cobertura').map(([k, v]) => `${k}=${v}`).join(' '));
  console.log('Por categoría:', cuenta('categoria').map(([k, v]) => `${k}=${v}`).join(' '));
}

main();
