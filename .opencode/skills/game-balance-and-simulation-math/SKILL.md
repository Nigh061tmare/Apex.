---
name: game-balance-and-simulation-math
description: "Diseño matemático, balanceo numérico y algoritmos de combate por turnos/fases para APEX Power Scaling Engine y simulaciones lógicas complejas."
---

# Game Balance and Simulation Math Skill

Esta habilidad proporciona el marco analítico y matemático para calibrar motores de combate, escalas de poder, probabilidades estadísticas y balanceo de mecánicas lógicas.

## 🎯 Cuándo Activar
- Al definir o calibrar fórmulas de daño, absorción de Ki, reducción de daño o consumo de stamina.
- Al implementar mecánicas tácticas de combate (ej. Semillas del Ermitaño x3, peligro ambiental de Magma, inmunidades hax).
- Al ajustar los factores multiplicadores de transformaciones (SSJ, Ultra Instinct, Beast, Ego) para asegurar coherencia sin romper la jugabilidad.

---

## 🧮 Principios de Modelado Matemático

### 1. Normalización y Consistencia de Escalas
- Mantener una correlación no lineal logarítmica o polinómica controlada entre Ki numérico y atributos físicos (AP, Speed, Durability).
- Para combates entre tiers dispares:
  - Definir umbrales de "Daño Mínimo" (Scratch Damage) y "Blitz Speed" (donde una diferencia > 1.5x en velocidad otorga ventaja de iniciativa).
  - Modelar la mitigación de armadura/ki como:
    $$\text{Daño Recibido} = \text{Ataque} \times \left(\frac{K}{K + \text{Durabilidad}}\right)$$
    donde $K$ es la constante de calibración del motor.

### 2. Gestión de Stamina y Desgaste
- Toda acción de alto poder (Kamehameha, Final Flash, técnicas de Kaioken) debe debitar stamina porcentual:
  - Si Stamina cae por debajo del 20%, aplicar penalizador de -30% a Speed y Durability.
  - La recuperación (por descanso o curación) debe estar sujeta a límites estrictos por combate.

### 3. Semillas del Ermitaño (Senzus x3) - Regla de Gestión Táctica
- **Capacidad:** Máximo 3 cargas por combate.
- **Regla de Activación:**
  - Solo se pueden consumir durante transiciones de fase o ventanas de oportunidad (no mientras se recibe un golpe crítico consecutivo).
  - Restaura 100% de HP y 100% de Stamina, pero no cura daños conceptuales o maldiciones activas.
  - El motor debe penalizar narrativamente el desperdicio si se usa con más del 70% de vida restante.

### 4. Peligros Ambientales (Magma Ascendente, Gravedad)
- Los peligros aplican daño continuo (DoT) por turno salvo que el personaje posea atributos de escudo Ki pasivo, vuelo o resistencia térmica extrema.
