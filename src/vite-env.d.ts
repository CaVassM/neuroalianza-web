/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del servicio de orientación para familias. Ver src/api/cliente.ts */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
