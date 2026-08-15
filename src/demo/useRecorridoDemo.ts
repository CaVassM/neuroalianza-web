import { useCallback, useEffect, useRef, useState } from 'react';
import { ScreenType, UserProfile } from '../types';
import { GUION, cuentaSintetizada, type PasoDemo } from './guion';

interface Opciones {
  irA: (pantalla: ScreenType) => void;
  aplicarPerfil: (perfil: UserProfile) => void;
  /** Perfil real de la familia, para devolverlo al terminar. */
  perfilOriginal: () => UserProfile;
}

/**
 * Motor del recorrido guiado.
 *
 * Avanza solo con un temporizador, pero se puede pausar y adelantar: en una
 * presentación siempre hay una pregunta a mitad de camino, y quedarse
 * esperando a que el guion pase de pantalla queda fatal.
 *
 * Al salir restaura el perfil que había antes de empezar. El recorrido escribe
 * un caso sintético sobre el estado real, y sin restaurar se llevaría por
 * delante los datos de quien estuviera usando la aplicación.
 */
export function useRecorridoDemo({ irA, aplicarPerfil, perfilOriginal }: Opciones) {
  const [activo, setActivo] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<string | undefined>();

  const perfilPrevio = useRef<UserProfile | null>(null);
  const perfilDemo = useRef<UserProfile>(cuentaSintetizada());

  const paso: PasoDemo | null = activo ? GUION[indice] ?? null : null;

  const iniciar = useCallback(() => {
    perfilPrevio.current = perfilOriginal();
    perfilDemo.current = cuentaSintetizada();
    setIndice(0);
    setEnPausa(false);
    setPregunta(undefined);
    setActivo(true);
  }, [perfilOriginal]);

  const salir = useCallback(() => {
    setActivo(false);
    setEnPausa(false);
    setPregunta(undefined);
    if (perfilPrevio.current) {
      aplicarPerfil(perfilPrevio.current);
      perfilPrevio.current = null;
    }
    irA('dashboard');
  }, [aplicarPerfil, irA]);

  const siguiente = useCallback(() => {
    setIndice((i) => {
      if (i + 1 >= GUION.length) return i; // el último paso se queda fijo
      return i + 1;
    });
  }, []);

  /**
   * Retrocede un paso.
   *
   * El caso se reconstruye desde cero aplicando los pasos 0..destino en orden,
   * en vez de intentar deshacer el último. Las fases no saben retroceder y los
   * registros solo se apilan, así que "deshacer" dejaría un caso incoherente:
   * rehacerlo desde el principio siempre da el estado exacto de ese paso.
   */
  const anterior = useCallback(() => {
    setIndice((i) => {
      if (i === 0) return i;
      const destino = i - 1;

      let perfil = cuentaSintetizada();
      for (let n = 0; n <= destino; n++) {
        const p = GUION[n];
        if (p.perfil) perfil = p.perfil(perfil);
      }
      perfilDemo.current = perfil;

      return destino;
    });
    // Al retroceder se pausa: quien vuelve atrás quiere mirar, no que le
    // adelanten otra vez a los pocos segundos.
    setEnPausa(true);
  }, []);

  // Aplica el paso actual: navega, siembra el caso, hace scroll y lanza la
  // consulta si toca.
  useEffect(() => {
    if (!activo || !paso) return;

    if (paso.perfil) {
      perfilDemo.current = paso.perfil(perfilDemo.current);
    }
    aplicarPerfil(perfilDemo.current);
    irA(paso.pantalla);
    setPregunta(paso.pregunta);

    if (paso.scrollA) {
      // Tras el cambio de pantalla el elemento aún no está montado.
      const t = setTimeout(() => {
        document.getElementById(paso.scrollA!)?.scrollIntoView({ behavior: 'smooth' });
      }, 600);
      return () => clearTimeout(t);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activo, indice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Temporizador de avance.
  useEffect(() => {
    if (!activo || enPausa || !paso) return;
    if (indice >= GUION.length - 1) return; // el final no avanza solo

    const t = setTimeout(siguiente, paso.duracion);
    return () => clearTimeout(t);
  }, [activo, enPausa, indice, paso, siguiente]);

  // Atajos de teclado: en una presentación es más rápido que buscar el botón.
  useEffect(() => {
    if (!activo) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') salir();
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === ' ') {
        e.preventDefault();
        setEnPausa((p) => !p);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [activo, salir, siguiente, anterior]);

  return {
    activo,
    enPausa,
    indice,
    paso,
    pregunta,
    iniciar,
    salir,
    siguiente,
    anterior,
    alternarPausa: () => setEnPausa((p) => !p),
  };
}
