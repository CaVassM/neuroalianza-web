# PAN — Plataforma de Asistencia al Neurodesarrollo

Aplicación web para familias peruanas que acompañan a un niño con una condición
del neurodesarrollo. Guía la ruta de atención por fases, ubica dónde atenderse y
ofrece un asistente de orientación que responde **solo** con documentos
verificados y cita sus fuentes.

React 19 · Vite 6 · TypeScript · Tailwind CSS 4

Este README tiene dos partes. Si vas a **probar** la plataforma, lee la primera.
Si vas a **trabajar sobre el código**, salta a la segunda.

---
---

# Parte 1 · Para quien evalúa la plataforma

## Lo primero: qué funciona siempre y qué no

Casi todo vive en el navegador y funciona en cualquier momento. **Una sola cosa
depende de que la computadora del equipo esté encendida: el asistente de
orientación**, porque el modelo de lenguaje corre ahí y sale a internet por un
túnel.

| | Funciona siempre | Necesita el equipo encendido |
|---|---|---|
| Registro y ruta por fases | ✅ | |
| Tamizaje M-CHAT-R/F y su resultado | ✅ | |
| Mapa, zonas de atención y 650 establecimientos | ✅ | |
| Informe en PDF con QR | ✅ | |
| Vista del profesional y bitácora del caso | ✅ | |
| Recorrido guiado de demostración | ✅ | |
| Biblioteca de documentos | ✅ | |
| **Respuestas del asistente** | | ⚠️ |

**Si el asistente no está disponible, la aplicación lo dice antes de que
escribas** y responde igual desde la información guardada, marcando cada
respuesta con un aviso ámbar. No se queda en blanco ni finge que la respuesta
viene del modelo.

El envío por WhatsApp está **desactivado a propósito** en esta demostración. Al
pulsar el botón se crea el seguimiento igual y **el enlace aparece en pantalla**,
para abrirlo o copiarlo.

## Por dónde empezar

Al entrar verás la pantalla de ingreso con tres puertas:

1. **Explorar con la cuenta de ejemplo** — un clic y estás dentro, con una ruta ya
   empezada. Es lo más rápido.
2. **Crear una cuenta** — para recorrer el flujo real desde cero.
3. **Iniciar sesión** — solo si ya creaste una cuenta en ese mismo navegador.

Ya dentro, en **Inicio** hay una invitación al **recorrido guiado**: dos minutos
en los que la plataforma se recorre sola con una familia de ejemplo. No toca tus
datos y puedes pausarlo, retroceder y salir cuando quieras.

## Los seis recorridos

Están detallados en **[GUION-DEMOSTRACION.md](GUION-DEMOSTRACION.md)**, con los
pasos exactos, los códigos de caso y las preguntas sugeridas. En resumen:

| # | Recorrido | Dura | Qué demuestra |
|---|---|---|---|
| 1 | Recorrido guiado | 2 min | El alcance completo, sin escribir nada |
| 2 | Registro y ruta hasta la cita | 6 min | El flujo real de una familia |
| 3 | El asistente de orientación | 3 min | Responde con fuentes y admite lo que no sabe |
| 4 | La vista del profesional | 2 min | La consulta empieza con lo ya contado |
| 5 | Llevarse la ruta al celular | 3 min | Continuidad fuera de la pantalla |
| 6 | Cuando el sistema falla | 2 min | Las barreras quedan registradas |

**Con los tres primeros ya se ve todo.**

## Dos datos que evitan un tropiezo

**La fecha de nacimiento importa.** El M-CHAT-R/F está validado de 16 a 30 meses.
Si registras un niño fuera de ese rango, la plataforma te lo dirá y el tamizaje no
se podrá aplicar. Al 16 de agosto de 2026, elige cualquier mes entre **febrero de
2024 y abril de 2025**; si dudas, **diciembre de 2024**.

**Para empezar de cero entre una prueba y otra:** en *Mi ruta*, al pie del
rastreador de fases, hay un botón para **reiniciar la ruta** conservando la
cuenta. Y en el menú de perfil, **registrar una cuenta nueva** borra todo el
perfil de ese navegador.

## Lo que la plataforma no hace

- **No diagnostica.** El M-CHAT-R/F es un tamizaje: señala que conviene una
  evaluación, nunca que hay o no hay autismo.
- **No agenda citas.** Orienta sobre a dónde ir y qué llevar; el trámite se hace
  en el establecimiento.
- **No cubre todo el país.** Los 650 establecimientos son de Lima Metropolitana y
  Callao, del padrón RENIPRESS con corte del 31 de julio de 2026.
- **No sustituye la consulta.** Prepara a la familia para que la consulta rinda
  más.

## Sobre los datos que verás

Las **zonas de atención** del mapa son una **estimación por cercanía**, no la
sectorización oficial: esos límites los aprueba cada DIRIS y se publican como
mapas en PDF, no como datos que se puedan cargar. La aplicación lo advierte y
pide confirmar por teléfono.

Los **servicios** de cada establecimiento están **estimados por su categoría**
según la norma, no verificados uno por uno: RENIPRESS no registra la cartera de
servicios. La ficha de cada establecimiento lo dice.

---
---

# Parte 2 · Para quien trabaja el código

## Puesta en marcha

```bash
npm install        # o bun install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

Desde la raíz del proyecto, `./iniciar.ps1` levanta backend y frontend juntos.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend de orientación. Ej.: `http://localhost:8000` |

Sin `VITE_API_URL`, o si el backend no responde, **Para familias** cae a un corpus
local de respaldo y lo avisa en pantalla. No es un error silencioso: si ves ese
aviso, es que no hay conexión con el asistente.

> Vite incrusta las variables **al compilar**, no al ejecutar. Si cambias
> `VITE_API_URL` hay que volver a construir o desplegar.

### Verificación

```bash
npm run lint       # tsc --noEmit
npx vitest run     # 76 pruebas
npm run build
```

> `tsconfig.json` declara `include: ["src"]` a propósito. Sin eso, y con
> `allowJs` activo, `tsc` recorre también `dist/` —decenas de megas de bundles
> minificados acumulados— y agota la memoria sin revisar nada.

## Estructura

```
src/
├── api/cliente.ts     # ÚNICO punto de contacto con el backend
├── views/             # pantallas (Familias, Mi Ruta, Conoce, Evaluaciones…)
├── components/        # UI por dominio
├── dominio/           # reglas de fases, tamizaje e invariantes
├── datos/ · data/     # casos demo, padrón y corpus local de respaldo
├── demo/              # recorrido guiado
└── utils/             # distancias, zonas de atención, PDF
scripts/
└── generar-establecimientos.mjs   # RENIPRESS → src/data/*.json
```

Toda llamada al backend pasa por [`src/api/cliente.ts`](src/api/cliente.ts).
Ningún componente escribe una URL a mano.

## El padrón de establecimientos

`src/data/establecimientos.json` **se genera, no se edita a mano**:

```bash
node scripts/generar-establecimientos.mjs ruta/al/RENIPRESS.csv
```

De las 35 833 filas del padrón quedan 650: Lima y Callao, activos, con
coordenadas válidas y de un tipo que participe en la ruta de un niño. El script
documenta cada regla de descarte y también emite `centrosDistrito.json`, que es
lo que importa `utils/distancia.ts` — importar el padrón entero desde una
utilidad de bajo nivel hacía explotar el chequeo de tipos.

El seguro se deriva de la institución y los servicios se estiman por categoría;
ambos van marcados como tales porque RENIPRESS no los registra.

## El módulo "Para familias"

Envía la pregunta al backend junto con la **condición y la edad del caso** —
nunca datos escritos a mano por la familia— y pinta la respuesta con:

- **Chips de fuente** al pie, marcados `Perú` o `Internacional` según el `ambito`
  de los metadatos del documento.
- **Caja lavanda** cuando la pregunta queda fuera del corpus (`fuera_de_alcance`),
  en vez de improvisar.
- **Caja ámbar** cuando no hay conexión y se responde desde el respaldo local.
- **Aviso previo** cuando el inventario del corpus no llega al abrir la sección:
  el asistente está caído y se dice antes de escribir.

## Perfiles y sesión

No hay servidor de cuentas. El perfil vive en `localStorage` y lleva número de
versión: **subir `VERSION_PERFIL` en [`src/data/perfilLocal.ts`](src/data/perfilLocal.ts)
descarta todos los perfiles guardados** en cualquier navegador la próxima vez que
se abra. Es la única purga posible y la que se usa antes de una presentación.

La aplicación arranca en el ingreso, no dentro de una cuenta. Nada se persiste
hasta que alguien entra de verdad.

## Despliegue

Preparado para Vercel ([`vercel.json`](vercel.json)). Define `VITE_API_URL` en
*Settings → Environment Variables* **antes** del primer build.

El backend corre en la máquina del equipo y se expone con un túnel de Cloudflare.
**Ese túnel cambia de dirección cada vez que se reinicia**, así que hay que
actualizar `VITE_API_URL` y volver a desplegar. Compruébalo antes de cada
demostración.

## WhatsApp

El envío se controla con `ENVIO_ACTIVO` en el backend. Con el motor apagado el
backend devuelve `simulado: true` y el enlace igual, y la interfaz lo entrega en
pantalla explicando por qué no llegó el mensaje.

> `load_dotenv()` no pisa variables ya cargadas: cambiar `ENVIO_ACTIVO` exige
> **reiniciar uvicorn entero**, no basta con el `--reload`.
