# Guion de demostración · PAN

Seis recorridos para que el jurado pruebe la plataforma por su cuenta. Están
ordenados por lo que conviene enseñar primero y por lo que menos puede fallar.
**Con los tres primeros ya se ve el alcance completo.**

---

## Antes de que llegue el jurado

- [ ] **El backend responde.** Abre `/salud`. Debe decir 8 documentos y 216 fragmentos.
- [ ] **La URL del túnel coincide con la del deploy.** El túnel de Cloudflare cambia de
      dirección cada vez que se reinicia. Si cambió, actualiza `VITE_API_URL` en Vercel y
      vuelve a desplegar. Es el único punto de fallo total.
- [ ] **Una pregunta de prueba en el asistente.** Si el backend está caído, el chat
      responde igual desde un respaldo local y lo dice. Compruébalo tú antes que el jurado.
- [ ] **Decidan quién usa WhatsApp.** Cada envío es real y el tope diario es 40.

---

## 1 · Recorrido guiado · 2 min · sin registrarse

Enseña el alcance completo sin que nadie tenga que escribir nada. Es la puerta de
entrada para quien solo mira.

1. Entra con **Explorar con la cuenta de ejemplo**.
2. Pulsa **Modo demostración**, abajo a la derecha.
3. Diez pasos automáticos: crear cuenta, ruta, tamizaje, dónde atenderte, primera cita,
   diagnóstico y asistente. Se puede pausar y retroceder.

> Usa una cuenta sintética. No toca el perfil de quien esté usando la aplicación, y al
> salir lo devuelve como estaba.

---

## 2 · Me registro y llego hasta la cita · 6 min · flujo troncal

Es el recorrido que vive una familia real: de la sospecha al establecimiento que le
toca, con la ruta avanzando sola según lo que responde.

1. En el ingreso, **Crear una**.
2. Datos del niño. **La fecha de nacimiento tiene que caer en la ventana del M-CHAT**
   (ver ficha abajo).
3. Distrito y seguro. Prueba con uno que no sea Miraflores.
4. Evaluaciones → **Comenzar evaluación**. Veinte preguntas.
5. Mi ruta: aparece el resultado y qué hacer con él.
6. Dónde atenderte: el mapa abre en tu distrito y marca en verde la zona que te cubre.
   Elige un establecimiento.
7. **Ya fui a mi cita** → responde qué te indicaron. La fase avanza según la derivación.

> **Ojo:** fuera de los 16 a 30 meses el M-CHAT no aplica —lo dice en pantalla— y el
> recorrido se corta ahí.

---

## 3 · El asistente de orientación · 3 min · lo que más sorprende

Responde solo con documentos cargados y cita cuál usó. Y cuando algo queda fuera de su
alcance, lo dice en vez de inventarlo.

1. Entra en **Información para familias**.
2. Usa las tres preguntas de la ficha, en ese orden.
3. Abre las fuentes que cita al pie de cada respuesta.

> **Clave:** la segunda pregunta es el momento fuerte ante un jurado clínico. El
> asistente reconoce que el TDAH no está en su corpus y no responde igualmente.

---

## 4 · La vista del profesional · 2 min · para el jurado clínico

El otro lado del mostrador: lo que ve quien recibe a la familia, con el tamizaje ya
hecho y sin volver a preguntarlo todo.

1. Pie de página → acceso profesional.
2. Consulta `NA-7K3M9`: ficha completa, respuestas del M-CHAT, QR y PDF descargable.
3. Consulta `NA-4P2XB`: un caso **sin** tamizaje. La plataforma lo dice en lugar de
   rellenar el hueco.
4. Registra una atención y vuelve a Mi ruta para ver el cambio.

---

## 5 · Me llevo la ruta al celular · 3 min · opcional, envío real

La continuidad fuera de la pantalla: la familia se lleva su ruta y contesta cómo le fue
sin volver a entrar a la web.

1. En Dónde atenderte, busca **Lleva tu ruta en el celular**.
2. Llega un WhatsApp con un enlace propio de ese caso.
3. Ábrelo en el móvil y responde cómo fue la cita.
4. Vuelve a la web: la respuesta ya está en la ruta.

> **Ojo:** envío real, con tope de 40 al día. Resérvalo para uno o dos jurados.

---

## 6 · Cuando el sistema falla · 2 min · requiere el flujo 2

Que no haya cupos o quede lejos no es el final de la ruta. Y esas trabas quedan
registradas, que es información que hoy nadie recoge.

1. Necesitas haber elegido un establecimiento antes: si no, el botón te lleva a hacerlo.
2. Mi ruta → **Reportar una barrera**.
3. Elige "no había cupos". El mapa amplía la búsqueda y descarta el sitio donde ya lo
   intentaste.

---

## Entre un jurado y el siguiente

| Quiero… | Dónde | Qué hace |
|---|---|---|
| Volver a recorrer la ruta con el mismo perfil | Mi ruta, al pie del rastreador de fases | Borra tamizaje, diagnóstico, establecimiento, citas y barreras. Conserva la cuenta, el niño, el distrito y el seguro. |
| Empezar de cero porque cambia quien prueba | Menú de perfil → **Registrar una cuenta nueva** | Borra el perfil del navegador entero y deja el formulario en blanco. |

---

## Ficha de consulta rápida

### Fecha de nacimiento válida

El M-CHAT-R/F cubre de 16 a 30 meses. Al 16 de agosto de 2026 eso es cualquier mes entre
**febrero de 2024** y **abril de 2025**.

Si dudas, usa **diciembre de 2024**: son 20 meses, justo en el centro.

### Códigos de caso

| Código | Qué es |
|---|---|
| `NA-7K3M9` | Caso completo, fase 4 |
| `NA-4P2XB` | Sin tamizaje |
| `NA-9Q6RT` | Fase 5 |

### Preguntas para el asistente

1. *Mi hijo de 2 años no señala con el dedo, ¿qué hago?*
   Responde con pasos concretos y cita FIRST WORDS y los CDC.
2. *Mi hijo tiene TDAH, ¿qué tratamiento le doy?*
   Reconoce que esa condición no está en su corpus y no responde. **Es lo que hay que
   enseñar.**
3. *¿Qué es el control CRED y cada cuánto le toca?*
   Distingue lo que dice la norma peruana de lo que viene de fuentes internacionales.

---

## Qué puede salir mal

**El túnel.** Es el único punto de fallo total. Si se reinicia, cambia de dirección y el
asistente deja de responder desde el sitio publicado. Compruébalo la misma mañana, no la
noche antes.

**La computadora tiene que seguir encendida.** El modelo y el envío de WhatsApp corren en
la máquina del equipo. Si se suspende, el jurado ve el respaldo local en el chat y nada
más.

---

Preparado para la entrega del 16 de agosto de 2026. Los datos de establecimientos salen
de RENIPRESS con corte del 31 de julio de 2026: 650 registros de Lima y Callao en 50
distritos.
