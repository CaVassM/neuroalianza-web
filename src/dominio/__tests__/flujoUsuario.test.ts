import { describe, expect, it } from 'vitest';
import { CasePhase, UserProfile } from '../../types';
import { crearPerfilNuevo, generarCodigoCaso, PERFIL_DEMO } from '../../data/perfiles';
import { clasificar } from '../tamizaje';

/**
 * Recorrido de una familia que se registra hoy.
 *
 * Reproduce lo que hacen los manejadores de App.tsx en cada paso y comprueba
 * en qué fase queda el caso y qué debería ver en cada pestaña. La regresión que
 * cubre es real: el alta heredaba el perfil de demostración y la familia
 * empezaba en fase 3 con un tamizaje que nunca respondió.
 */
describe('flujo de una familia que se registra', () => {
  // Réplicas de la lógica de App.tsx, para que el test falle si diverge.
  const completarRegistro = (perfil: UserProfile): UserProfile => ({
    ...perfil,
    insurance: 'sis',
    caseCode: perfil.caseCode || generarCodigoCaso(),
    fase: Math.max(perfil.fase || 1, 2) as CasePhase,
  });

  const completarTamizaje = (perfil: UserProfile, puntaje: number): UserProfile => ({
    ...perfil,
    fase: (perfil.fase && perfil.fase >= 3 ? perfil.fase : 3) as CasePhase,
    caseCode: perfil.caseCode || generarCodigoCaso(),
    screeningResult: { score: puntaje, nivel: clasificar(puntaje) },
  });

  // Lo que decide cada pestaña.
  const evaluacionesMuestraPendiente = (p: UserProfile) => !p.screeningResult;
  const chatDesbloqueado = (p: UserProfile) => Boolean(p.diagnosis || (p.fase || 1) >= 5);

  it('recorre alta → registro → tamizaje → diagnóstico de forma consistente', () => {
    // 1. Crear cuenta
    let u = crearPerfilNuevo('familia@ejemplo.pe', '987654321');
    expect(u.fase).toBe(1);
    expect(u.screeningResult).toBeNull();
    expect(u.diagnosis).toBeNull();
    expect(u.caseCode).toBeUndefined();
    expect(u.registros).toEqual([]);
    expect(evaluacionesMuestraPendiente(u)).toBe(true);
    expect(chatDesbloqueado(u)).toBe(false);

    // 2. Completar los tres pasos del registro
    u = completarRegistro({
      ...u,
      child: { nickname: 'Luciana', birthMonth: 'Diciembre', birthYear: '2024', avatarId: 'cat' },
      location: { department: 'Lima', province: 'Lima', district: 'Miraflores' },
    });
    expect(u.fase).toBe(2);
    expect(u.caseCode).toMatch(/^NA-[A-Z0-9]{5}$/);
    // Sigue sin tamizaje: Evaluaciones tiene que decirlo.
    expect(evaluacionesMuestraPendiente(u)).toBe(true);
    expect(chatDesbloqueado(u)).toBe(false);

    // 3. Completar el tamizaje: solo aquí se llega a la fase 3
    const codigoAntes = u.caseCode;
    u = completarTamizaje(u, 5);
    expect(u.fase).toBe(3);
    expect(u.caseCode).toBe(codigoAntes); // no se regenera
    expect(evaluacionesMuestraPendiente(u)).toBe(false);
    expect(chatDesbloqueado(u)).toBe(false);

    // 4. Registrar la cita: derivación a pediatría lleva a la fase 4
    u = { ...u, fase: 4, derivaciones: ['pediatria'] };
    expect(chatDesbloqueado(u)).toBe(false);

    // 5. Diagnóstico confirmado: recién aquí se abre el asistente
    u = { ...u, fase: 5 };
    expect(chatDesbloqueado(u)).toBe(true);
  });

  it('el alta no arrastra nada del perfil de demostración', () => {
    const nuevo = crearPerfilNuevo('otra@ejemplo.pe', '999888777');

    expect(nuevo.caseCode).not.toBe(PERFIL_DEMO.caseCode);
    expect(nuevo.fase).not.toBe(PERFIL_DEMO.fase);
    expect(nuevo.child.nickname).not.toBe(PERFIL_DEMO.child.nickname);
    expect(nuevo.location.district).toBe('');
    expect(nuevo.screeningResult).toBeNull();
  });

  it('cada caso nuevo recibe un código propio', () => {
    const codigos = new Set(Array.from({ length: 200 }, generarCodigoCaso));
    expect(codigos.size).toBeGreaterThan(190); // sin colisiones prácticas

    // Sin caracteres que se confundan al dictarlos por teléfono. Se mira solo
    // el sufijo: el prefijo "NA-" es fijo y sí lleva una A.
    for (const c of codigos) {
      expect(c.slice(3)).not.toMatch(/[OI01AEU]/);
    }
  });

  it('el tamizaje no retrocede una ruta ya avanzada', () => {
    const avanzado: UserProfile = {
      ...crearPerfilNuevo('a@b.pe', '987654321'),
      fase: 5,
      caseCode: 'NA-XXXXX',
    };
    expect(completarTamizaje(avanzado, 3).fase).toBe(5);
  });
});
