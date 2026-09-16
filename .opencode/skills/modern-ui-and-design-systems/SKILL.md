---
name: modern-ui-and-design-systems
description: "Sistemas de diseño modernos, interfaces sci-fi/cyberpunk, Tailwind CSS y componentes visuales reactivos de alta gama."
---

# Modern UI and Design Systems Skill

Esta habilidad establece estándares para crear interfaces visuales modernas, estéticas y reactivas con temática sci-fi/energía Ki, ideales para el frontend de APEX Engine.

## 🎯 Cuándo Activar
- Al diseñar o refactorizar barras biométricas, paneles de veredicto, tarjetas de personajes o selectores de combate.
- Al crear paletas cromáticas coherentes (morado APEX, verde scouter, dorado Ki divino, rojo alerta).
- Al diseñar modales, tooltips informativos y carruseles interactivos.

---

## 🎨 Estándares de Diseño Visual

### 1. Paleta de Energía y Biometría APEX
- **Poder APEX:** Acentos en tonos violeta/púrpura eléctrico (`#8b5cf6`, `#a855f7`) con efectos de resplandor sutil (`box-shadow: 0 0 15px rgba(139, 92, 246, 0.4)`).
- **Barras de Salud (HP):** Degradado de esmeralda a jade en estado óptimo; ámbar al <50%; carmesí pulsante al <20%.
- **Barras de Stamina:** Azul cian a turquesa eléctrico (`#06b6d4`), con transición suave de anchura (`transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1)`).

### 2. Micro-Interacciones y Feedback
- Cada botón de acción debe poseer estados explícitos: `hover`, `active`, `focus-visible` y `disabled`.
- Los botones deshabilitados deben comunicar claramente por qué están inactivos (ej. "Senzus agotadas").
- Usar tipografías monospace para valores numéricos para evitar que el texto "baile" o salte cuando los números cambian en tiempo real.
