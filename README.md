# Neuroalianza — frontend

Aplicación web para familias peruanas que acompañan a un niño con una condición
del neurodesarrollo. Guía la ruta de atención por fases, ubica dónde atenderse y
ofrece un asistente de orientación que responde **solo** con documentos
verificados y cita sus fuentes.

React 19 · Vite 6 · TypeScript · Tailwind CSS 4

---

## Puesta en marcha

```bash
npm install        # o bun install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend de orientación. Ej.: `http://localhost:8000` |

Sin `VITE_API_URL`, el módulo **Para familias** cae a un corpus local de
respaldo y lo avisa en pantalla con una caja ámbar. No es un error silencioso:
si ves ese aviso, es que no hay conexión con el asistente.

> Vite incrusta las variables **al compilar**, no al ejecutar. Si cambias
> `VITE_API_URL` hay que volver a construir o desplegar.

---

## Estructura

```
src/
├── api/cliente.ts     # ÚNICO punto de contacto con el backend
├── views/             # pantallas (Familias, Mi Ruta, Conoce, Evaluaciones…)
├── components/        # UI por dominio
├── dominio/           # reglas de fases, tamizaje e invariantes
├── datos/ · data/     # casos demo y corpus local de respaldo
└── utils/
```

Toda llamada al backend pasa por [`src/api/cliente.ts`](src/api/cliente.ts).
Ningún componente escribe una URL a mano.

---

## El módulo "Para familias"

Envía la pregunta al backend junto con la **condición y la edad del caso** —
nunca datos escritos a mano por la familia— y pinta la respuesta con:

- **Chips de fuente** al pie, marcados `Perú` o `Internacional` según el `ambito`
  que devuelven los metadatos del documento.
- **Caja lavanda** cuando la pregunta queda fuera del corpus disponible
  (`fuera_de_alcance`), en vez de improvisar una respuesta.
- **Caja ámbar** cuando no hay conexión y se responde desde el respaldo local.

El contrato completo está tipado en [`src/api/cliente.ts`](src/api/cliente.ts).

---

## Despliegue

Preparado para Vercel ([`vercel.json`](vercel.json)). Recuerda definir
`VITE_API_URL` en *Settings → Environment Variables* **antes** del primer build.
