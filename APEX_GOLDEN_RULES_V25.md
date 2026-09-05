# 🛡️ APEX POWER SCALING ENGINE — REGLA DE ORO PERMANENTE (LÍNEA BASE V25)
**Documento Normativo Constitucional de Auditoría, Balance e Invariantes**
*Vigente a partir del despliegue en producción de V25 (Patches 0006 a 0009 y Hotfixes de Vegeta/Goku/Piccolo).*

---

## 🏛️ 1. INVARIANTES QUE NUNCA SE PUEDEN ROMPER

1. **Inmutabilidad de Baselines Históricos (V22, V23, V24)**:
   Permanecen 100% congelados para siempre. Ningún proceso automático de auditoría nocturna ni patch manual puede modificarlos. Verificación obligatoria por hash SHA-256 antes y después de cualquier operación.
   - `ROSTER_NIVELES_PODER_CORREGIDO_V22.json`: `68dd6750f4acc7bce09e16f66f48f8072b455268df1d74aaf95f2a89c716074f`
   - `ROSTER_NIVELES_PODER_CORREGIDO_V23.json`: `a6dfff76c7001594d1428a70497154ffcdac7d679ad5c616b70ff027892e5578`
   - `ROSTER_NIVELES_PODER_CORREGIDO_V24.json`: `d1e6aeb35f107f97eb00f196fc4b934cd5e94d9c9f583264f34bd0e83db8fa61`

2. **Censo Inmutable de V25**:
   Exactamente **756 combatientes activos**, **13 registros archivados/deprecados** y **769 censo total**. Cualquier cambio de censo requiere aprobación manual explícita del usuario y un `patchId` individual documentado.

3. **Aislamiento Ontológico de Entidades Externas (`bodyStatIsolation: true`)**:
   Ninguna entidad externa (invocaciones, sombras, marionetas, mechas, avatares, stands, shikigamis, fantasmas del odio o referencias legacy) puede mutar jamás el Ki, tier, multiplicador, velocidad, durabilidad o stamina del personaje propietario.

4. **Patrón Estricto de Tier**:
   Todo campo de tier (`baseTier`, `forms[].tier`, `powerSchema.profileTier`, `powerSchema.baseFormTier`) debe cumplir obligatoriamente:
   ```regex
   ^(High |Low )?\d{1,2}-[ABC]$
   ```
   Prohibido el uso de sufijos (" Físico", " Base"), símbolos ("3-A+", "5-A+") o paréntesis ("(Supremo)", "(Unleashed)"). Toda distinción cualitativa debe vivir exclusivamente en `powerNote`.

5. **Sincronización `baseTier` vs `forms[0].tier`**:
   Si `baseTier !== forms[0].tier`, el campo `powerSchema.tierStatus` DEBE ser `"needs_feat_review"`, nunca `"internally_aligned"`.

6. **Monotonía de Ki por Rama (`powerTree`)**:
   Ninguna forma dentro del mismo `powerTree` puede tener menos Ki que la anterior sin un campo `powerNote` explicativo y justificado canónicamente.

7. **Monotonía de Tier por Rama (`powerTree`)**:
   Ninguna forma dentro del mismo `powerTree` puede tener un tier inferior a una forma anterior con menor Ki. Formas pertenecientes a ramas distintas (ej. `saiyan_god_arm` vs `ki_destruction_arm`) son evoluciones paralelas no forzadas a una jerarquía lineal.

8. **Prioridad de Corrección de Tier sobre Alteración de Ki**:
   Para resolver una inversión, la regla por defecto es corregir el TIER, nunca inflar arbitrariamente el Ki o los multiplicadores como atajo.

9. **Prevención de Contaminación de Plantillas**:
   Ninguna ficha puede compartir nombre de forma, Ki numérico y tier con otro personaje distinto por copia ciega de plantilla.

10. **Prohibición de Versiones Mayores Autónomas y Git Automático**:
    No crear V26 ni ejecutar `git add`, `git commit` ni `git push` en procesos nocturnos automáticos. Toda sugerencia debe persistir como borrador (`draft`) para revisión del usuario.

---

## 🌙 2. PROTOCOLO DE LA AUDITORÍA NOCTURNA

1. **Línea Base Obligatoria**:
   Toda ejecución nocturna toma como única referencia canónica el roster V25 post-deploy (`ROSTER_NIVELES_PODER_CORREGIDO_V25.json`).
2. **Validación Previa**:
   Ejecutar `node src/scripts/rosterCanonicalValidator.js --v25 --read-only` al inicio de cada ciclo.
3. **Jerarquía de Reporte de Hallazgos**:
   1. Contaminación de plantilla (Prioridad P1 - Bug objetivo).
   2. Ki decreciente entre formas sin nota explicativa (Prioridad P1 - Bug objetivo).
   3. Inversión de tier dentro de la misma rama de poder (Prioridad P2 - Bug objetivo).
   4. Formato de tier inválido (Prioridad P2 - Bug objetivo).
   5. Mismatches `baseTier` / `forms[0].tier` reconocidos en `needs_feat_review` (Prioridad P3 - Fondo).

---

## 📋 3. REGISTRO DE CASOS CONSOLIDADOS (NO REABRIR SIN NUEVA EVIDENCIA)
* **Vegeta Saga Super (`vegeta-saga-super-dragon-ball-super-454`)**:
  - SSJ2 preservado (mult 100, Ki 1.554T, Tier 5-A, `saiyan_god_arm`).
  - Ultra Ego en rama paralela `ki_destruction_arm` (mult 1500, Ki 23.31B, Tier 3-A).
* **Son Goku Saga Super (`son-goku-saga-super-dragon-ball-super-732`)**:
  - Tiers normalizados (UI Omen: High 3-A, UI Dominado: 2-C), notas limpias sin "+".
* **Piccolo U3 DBM (`king-piccolo-u3-dbm`)**:
  - Identidad de Namekiano fusionado con Kami-sama en el U3 de DBM.
  - Escala anclada [Goku SSJ Namek 157.5M, Piccolo Saga Androides 378M]. Base 250M, Full Power 375M (Tier 4-C).
  - Declaración literal de estimación provisional en `powerNote`.
* **Dr. Raichi (`dr-raichi-dbm-u3`)**:
  - Forma corporal única (Dr. Raichi en Cápsula, 24.52k Ki, Tier 7-A, 1x).
  - Broly LSSJ y Fantasmas del Odio desacoplados como entidades externas informativas.
