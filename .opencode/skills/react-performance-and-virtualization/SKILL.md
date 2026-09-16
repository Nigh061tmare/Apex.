---
name: react-performance-and-virtualization
description: "Optimización avanzada de React 18/19 y Vite: virtualización de listas masivas (800+ elementos), memoización quirúrgica, code-splitting con Suspense y prevención de lag."
---

# React Performance and Virtualization Skill

Esta habilidad guía la optimización de aplicaciones frontend React (especialmente APEX Power Scaling Engine) que manejan grandes volúmenes de datos en memoria, listas extensas y animaciones en tiempo real.

## 🎯 Cuándo Activar
- Al renderizar o filtrar colecciones de cientos o miles de elementos (ej. catálogo de 800+ variantes de Dragon Ball).
- Cuando la UI sufra caídas de FPS, parpadeos al escribir en inputs de búsqueda o lag al abrir modales.
- Al implementar carga perezosa (`React.lazy()`) de componentes pesados o modales secundarios.

---

## 🛠️ Reglas y Patrones de Rendimiento

### 1. Code-Splitting y Carga Dinámica Segura
- **Regla de Oro con `React.lazy()`:** Todo componente importado perezosamente DEBE estar envuelto en un límite `<Suspense fallback={<LoadingFallback />}>` o fallará en runtime con:
  `Failed to fetch dynamically imported module`.
- Mantener fallbacks ligeros y accesibles que no causen saltos de layout (CLS).

### 2. Virtualización de Listas Masivas
- Cuando una lista supere los 50 elementos visibles:
  - No renderizar todos los nodos DOM simultáneamente.
  - Implementar virtualización (ventana deslizante) donde solo se renderizan los elementos en el viewport (`overscan: 3-5`).
  - Asignar siempre claves únicas (`key={item.id}`) basadas en IDs estables, **NUNCA** índices de array cuando la lista se filtra o reordena.

### 3. Memoización Quirúrgica (Evitar el costo de re-cálculo)
- **`useMemo`:** Úsalo para operaciones computacionalmente costosas (filtrar 800 variantes, calcular escalado de Ki, normalizar estadísticas de combate).
- **`useCallback`:** Pasa funciones memoizadas como props a componentes hijos memoizados (`React.memo`) para evitar re-renders en cascada.
- **Selectores Inmutables:** Evita generar nuevos objetos o arrays vacíos dentro de la llamada del render (ej. `items || []` crea una nueva referencia en cada frame).

### 4. Animaciones y Render Loop a 60 FPS
- Animar exclusivamente propiedades aceleradas por hardware GPU: `transform` (translate, scale) y `opacity`.
- Evitar animar `width`, `height`, `top`, `left` o `margin`, ya que provocan reflow y repaint de toda la página.
