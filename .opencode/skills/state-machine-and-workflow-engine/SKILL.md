---
name: state-machine-and-workflow-engine
description: "Modelado de flujos complejos y motores de simulación mediante Máquinas de Estados Finitas (FSM), previniendo estados inválidos o saltos de fase."
---

# State Machine and Workflow Engine Skill

Esta habilidad estructura motores de simulación, wizards de pasos y flujos de trabajo asíncronos utilizando máquinas de estados deterministas y libres de bugs.

## 🎯 Cuándo Activar
- En la simulación de combate de 5 fases de APEX (Fase 1 Inicial -> Fase 2 Escalada -> Fase 3 Clímax -> Fase 4 Desgaste -> Fase 5 Veredicto).
- En flujos de emparejamiento aleatorio (Matchmaker) y selección de reglas previas al combate.
- Para asegurar que una simulación no emita veredicto si alguna fase previa falló o quedó incompleta.

---

## 🔒 Reglas de Máquina de Estados

1. **Estados Explícitos:** Los estados deben ser enumeraciones o constantes fijas (ej. `IDLE`, `CONFIGURING`, `PHASE_1_PROBING`, `PHASE_2_ESCALATION`, `PHASE_3_CLIMAX`, `PHASE_4_FATIGUE`, `PHASE_5_VERDICT`, `COMPLETED`, `ERROR`).
2. **Transiciones Restringidas:** Un estado solo puede transicionar a los estados válidos definidos en su tabla de adyacencia. Ningún evento externo puede forzar un salto directo de `IDLE` a `VERDICT`.
3. **Guardas de Transición:** Antes de cambiar de estado, verificar condiciones mínimas (ej. personajes seleccionados, stats válidas, seed determinista lista).
